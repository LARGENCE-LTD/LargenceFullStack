import { createServer, IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { URL } from 'url';
import { SupabaseService } from './services/supabase';
import { AIService } from './services/aiService';
import { ConnectionManager } from './services/connectionManager';
import { 
  AuthenticatedWebSocket, 
  ClientMessage, 
  ServerMessage, 
  ConversationMessage 
} from './types';

export class WebSocketServerManager {
  private httpServer: ReturnType<typeof createServer>;
  private wss: WebSocketServer;
  private supabaseService: SupabaseService;
  private aiService: AIService;
  private connectionManager: ConnectionManager;

  constructor(port: number) {
    this.httpServer = createServer();
    this.wss = new WebSocketServer({ noServer: true });
    this.supabaseService = new SupabaseService();
    this.aiService = new AIService();
    this.connectionManager = new ConnectionManager();

    this.setupWebSocketServer();
    this.setupHttpServer(port);
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: AuthenticatedWebSocket) => {
      this.handleConnection(ws);
    });
  }

  private setupHttpServer(port: number): void {
    // Handle WebSocket upgrade requests
    this.httpServer.on('upgrade', async (request: IncomingMessage, socket, head) => {
      try {
        await this.handleUpgrade(request, socket, head);
      } catch (error) {
        console.error('Upgrade failed:', error);
        socket.destroy();
      }
    });

    // Health check endpoint
    this.httpServer.on('request', (req: IncomingMessage, res: ServerResponse) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const stats = this.connectionManager.getStats();
        res.end(JSON.stringify({ 
          status: 'healthy', 
          connections: stats,
          timestamp: new Date().toISOString()
        }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    this.httpServer.listen(port, () => {
      console.log(`WebSocket server listening on port ${port}`);
    });
  }

  private async handleUpgrade(request: IncomingMessage, socket: any, head: Buffer): Promise<void> {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    // Validate required parameters
    if (!token) {
      throw new Error('Missing authentication token');
    }

    // Validate JWT token
    let userId: string;
    try {
      userId = await this.supabaseService.validateToken(token);
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Complete the WebSocket handshake
    this.wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      const authenticatedWs = ws as AuthenticatedWebSocket;
      authenticatedWs.userId = userId;
      // templateId will be set after AI classification
      
      this.wss.emit('connection', authenticatedWs);
    });
  }

  private async handleConnection(ws: AuthenticatedWebSocket): Promise<void> {
    console.log(`New connection from user ${ws.userId}`);

    // Add to connection manager (this will close any existing connection)
    this.connectionManager.addConnection(ws.userId, ws);

    try {
      // Handle session management
      await this.handleSessionManagement(ws);

      // Set up message handlers
      ws.on('message', async (data: Buffer) => {
        try {
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error handling message:', error);
          this.sendError(ws, 'Failed to process message. Please try again.');
        }
      });

      ws.on('close', () => {
        console.log(`Connection closed for user ${ws.userId}`);
        this.connectionManager.removeConnection(ws.userId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${ws.userId}:`, error);
        this.connectionManager.removeConnection(ws.userId);
      });

    } catch (error) {
      console.error('Error in connection setup:', error);
      this.sendError(ws, 'Failed to initialize session. Please try again.');
      ws.close(1011, 'Session initialization failed');
    }
  }

  private async handleSessionManagement(ws: AuthenticatedWebSocket): Promise<void> {
    // Check for existing incomplete session
    const existingSession = await this.supabaseService.findExistingSession(ws.userId);

    if (existingSession) {
      // Resume existing session
      ws.sessionId = existingSession.id;
      if (existingSession.template_id) {
        ws.templateId = existingSession.template_id;
      }
      console.log(`Resuming session ${existingSession.id} for user ${ws.userId}`);

      const resumeMessage: ServerMessage = {
        type: 'session_resumed',
        sessionId: existingSession.id,
        history: existingSession.conversation_history
      };

      ws.send(JSON.stringify(resumeMessage));
    } else {
      // Create new session (template_id will be set by AI service)
      const newSession = await this.supabaseService.createSession(ws.userId);
      ws.sessionId = newSession.id;
      console.log(`Created new session ${newSession.id} for user ${ws.userId}`);
      
      // Don't send first question immediately - wait for user's first message
    }
  }

  private async handleMessage(ws: AuthenticatedWebSocket, data: Buffer): Promise<void> {
    let clientMessage: ClientMessage;

    try {
      const messageText = data.toString();
      clientMessage = JSON.parse(messageText);
    } catch (error) {
      console.error('Failed to parse client message:', error);
      return; // Ignore malformed messages as per requirements
    }

    // Validate message format
    if (clientMessage.type !== 'user_message' || !clientMessage.content) {
      console.error('Invalid message format:', clientMessage);
      return; // Ignore invalid messages as per requirements
    }

    if (!ws.sessionId) {
      console.error('No session ID for user message');
      this.sendError(ws, 'Session not initialized');
      return;
    }

    // Add user message to conversation history
    const userMessage: ConversationMessage = {
      role: 'user',
      content: clientMessage.content,
      timestamp: new Date().toISOString()
    };

    await this.supabaseService.updateConversationHistory(ws.sessionId, userMessage);

    // Check if this is the first message (intent classification needed)
    if (!ws.templateId) {
      await this.handleFirstMessage(ws, clientMessage.content);
    } else {
      // Standard Q&A flow with preemptive answer detection
      await this.sendNextQuestion(ws, clientMessage.content);
    }
  }

  private async handleFirstMessage(ws: AuthenticatedWebSocket, userMessage: string): Promise<void> {
    if (!ws.sessionId) {
      console.error('No session ID for first message handling');
      return;
    }

    try {
      // Call AI service to classify intent and get first question
      const aiResponse = await this.aiService.classifyAndStart(ws.sessionId, userMessage);

      if (aiResponse.status === 'error') {
        this.sendError(ws, aiResponse.error?.message || 'Failed to classify document type');
        return;
      }

      if (aiResponse.status === 'success' && aiResponse.templateId && aiResponse.nextQuestion) {
        // Update session with the classified template
        await this.supabaseService.updateSessionTemplate(ws.sessionId, aiResponse.templateId);
        ws.templateId = aiResponse.templateId;

        // Add AI message to conversation history
        const aiMessage: ConversationMessage = {
          role: 'ai',
          content: aiResponse.nextQuestion.text,
          timestamp: new Date().toISOString()
        };

        await this.supabaseService.updateConversationHistory(ws.sessionId, aiMessage);

        // Send first question to client
        const nextQuestionMessage: ServerMessage = {
          type: 'next_question',
          sessionId: ws.sessionId,
          question: {
            id: `question_${Date.now()}`,
            text: aiResponse.nextQuestion.text
          }
        };

        ws.send(JSON.stringify(nextQuestionMessage));
      } else {
        this.sendError(ws, 'Failed to determine document type. Please try again.');
      }

    } catch (error) {
      console.error('Error handling first message:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('AI service unavailable') || errorMessage.includes('not responding')) {
        this.sendError(ws, 'Could not connect to the AI service. Please try again in a moment.');
      } else {
        this.sendError(ws, 'Failed to process your request. Please try again.');
      }
    }
  }

  private async sendNextQuestion(ws: AuthenticatedWebSocket, userMessage?: string): Promise<void> {
    if (!ws.sessionId) {
      console.error('No session ID for sending next question');
      return;
    }

    try {
      // Get current session state
      const session = await this.supabaseService.findExistingSession(ws.userId);
      if (!session) {
        this.sendError(ws, 'Session not found');
        return;
      }

      const aiResponse = await this.aiService.getNextQuestion(ws.sessionId, userMessage || '', session);

      if (aiResponse.status === 'error') {
        this.sendError(ws, aiResponse.error?.message || 'AI service error');
        return;
      }

      if (aiResponse.status === 'complete') {
        // Update answered questions before marking complete
        if (aiResponse.answeredQuestionIds && aiResponse.answeredQuestionIds.length > 0) {
          const updatedAnsweredQuestions = [
            ...(session.answered_questions || []),
            ...aiResponse.answeredQuestionIds
          ];
          await this.supabaseService.updateQuestionProgress(
            ws.sessionId,
            updatedAnsweredQuestions,
            session.current_question_index + aiResponse.answeredQuestionIds.length
          );
        }

        // Session is complete, mark it as such
        await this.supabaseService.markSessionComplete(ws.sessionId);

        const completeMessage: ServerMessage = {
          type: 'session_complete',
          sessionId: ws.sessionId,
          documentId: 'placeholder-document-id' // This will be provided by AI service
        };

        ws.send(JSON.stringify(completeMessage));
        ws.close(1000, 'Session completed');
        return;
      }

      if (aiResponse.status === 'in_progress' && aiResponse.nextQuestion) {
        // Update answered questions if any were preemptively answered
        if (aiResponse.answeredQuestionIds && aiResponse.answeredQuestionIds.length > 0) {
          const updatedAnsweredQuestions = [
            ...(session.answered_questions || []),
            ...aiResponse.answeredQuestionIds
          ];
          await this.supabaseService.updateQuestionProgress(
            ws.sessionId,
            updatedAnsweredQuestions,
            session.current_question_index + aiResponse.answeredQuestionIds.length
          );
        }

        // Add AI message to conversation history
        const aiMessage: ConversationMessage = {
          role: 'ai',
          content: aiResponse.nextQuestion.text,
          timestamp: new Date().toISOString()
        };

        await this.supabaseService.updateConversationHistory(ws.sessionId, aiMessage);

        // Send next question to client
        const nextQuestionMessage: ServerMessage = {
          type: 'next_question',
          sessionId: ws.sessionId,
          question: {
            id: `question_${Date.now()}`, // AI service should provide proper question ID
            text: aiResponse.nextQuestion.text
          }
        };

        ws.send(JSON.stringify(nextQuestionMessage));
      }

    } catch (error) {
      console.error('Error getting next question:', error);
      
      // Send specific error message for AI service issues
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('AI service unavailable') || errorMessage.includes('not responding')) {
        this.sendError(ws, 'Could not connect to the AI service. Please try again in a moment.');
      } else {
        this.sendError(ws, 'Failed to get next question. Please try again.');
      }
    }
  }

  private sendError(ws: AuthenticatedWebSocket, message: string): void {
    const errorMessage: ServerMessage = {
      type: 'error',
      message
    };

    try {
      ws.send(JSON.stringify(errorMessage));
    } catch (error) {
      console.error('Failed to send error message:', error);
    }
  }

  // Public methods for server management
  public getStats() {
    return this.connectionManager.getStats();
  }

  public async cleanup() {
    console.log('Shutting down WebSocket server...');
    this.connectionManager.closeAllConnections();
    this.wss.close();
    this.httpServer.close();
  }
} 