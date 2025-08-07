import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { supabaseAdmin } from '@/lib/supabase';
import { URL } from 'url';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  templateId?: string;
  sessionId?: string;
}

class DocumentWizardServer {
  private wss: WebSocketServer;
  private httpServer: any;

  constructor(port: number = 8000) {
    this.httpServer = createServer();
    this.wss = new WebSocketServer({ noServer: true });
    this.setupServer(port);
  }

  private setupServer(port: number) {
    // Health check endpoint
    this.httpServer.on('request', (req: any, res: any) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy' }));
        return;
      }
      res.writeHead(404);
      res.end();
    });

    // WebSocket upgrade handler
    this.httpServer.on('upgrade', async (request: any, socket: any, head: any) => {
      try {
        const { token, templateId } = this.parseQueryParams(request.url);
        
        if (!token || !templateId) {
          socket.destroy();
          return;
        }

        // Validate Supabase JWT
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
          socket.destroy();
          return;
        }

        // Validate template exists
        const { data: template, error: templateError } = await supabaseAdmin
          .from('document_templates')
          .select('id')
          .eq('id', templateId)
          .single();
        
        if (templateError || !template) {
          socket.destroy();
          return;
        }

        // Complete upgrade
        this.wss.handleUpgrade(request, socket, head, (ws: AuthenticatedWebSocket) => {
          ws.userId = user.id;
          ws.templateId = templateId;
          this.wss.emit('connection', ws, request);
        });
      } catch (error) {
        console.error('Upgrade error:', error);
        socket.destroy();
      }
    });

    // WebSocket connection handler
    this.wss.on('connection', async (ws: AuthenticatedWebSocket) => {
      await this.handleConnection(ws);
      
      // Set up message handler for this connection
      ws.on('message', (message: string) => {
        this.handleMessage(ws, message);
      });
    });

    this.httpServer.listen(port, () => {
      console.log(`WebSocket server running on port ${port}`);
    });
  }

  private parseQueryParams(url: string) {
    const urlObj = new URL(url, 'http://localhost');
    return {
      token: urlObj.searchParams.get('token'),
      templateId: urlObj.searchParams.get('templateId')
    };
  }

  private async handleConnection(ws: AuthenticatedWebSocket) {
    try {
      // Check for existing session
      const { data: existingSession, error: sessionError } = await supabaseAdmin
        .from('wizard_sessions')
        .select('*')
        .eq('user_id', ws.userId)
        .eq('template_id', ws.templateId)
        .eq('is_complete', false)
        .single();

      if (existingSession && !sessionError) {
        // Resume session
        ws.sessionId = existingSession.id;
        ws.send(JSON.stringify({
          type: 'session_resumed',
          payload: {
            sessionId: existingSession.id,
            answerHistory: existingSession.answer_history,
            currentQuestionIndex: existingSession.current_question_index
          }
        }));
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabaseAdmin
          .from('wizard_sessions')
          .insert({
            user_id: ws.userId,
            template_id: ws.templateId,
            answer_history: [],
            current_question_index: 0
          })
          .select()
          .single();

        if (createError || !newSession) {
          ws.close();
          return;
        }

        ws.sessionId = newSession.id;
      }

      // Send first question
      await this.sendNextQuestion(ws);
    } catch (error) {
      console.error('Connection error:', error);
      ws.close();
    }
  }

  private async sendNextQuestion(ws: AuthenticatedWebSocket) {
    try {
      const { data: session } = await supabaseAdmin
        .from('wizard_sessions')
        .select('*')
        .eq('id', ws.sessionId)
        .single();

      const { data: template } = await supabaseAdmin
        .from('document_templates')
        .select('*')
        .eq('id', ws.templateId)
        .single();
      
      if (!session || !template) {
        ws.close();
        return;
      }

      const currentIndex = session.current_question_index;
      const questions = template.questions;

      if (currentIndex >= questions.length) {
        // All questions answered, generate document
        await this.generateDocument(ws);
        return;
      }

      const question = questions[currentIndex];
      ws.send(JSON.stringify({
        type: 'next_question',
        payload: {
          questionId: question.id,
          fieldNumber: currentIndex + 1,
          totalFields: questions.length,
          title: question.title,
          description: question.description,
          example: question.example,
          required: question.required,
          type: question.type,
          options: question.options
        }
      }));
    } catch (error) {
      console.error('Error sending question:', error);
      ws.close();
    }
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: string) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'submit_answer':
          await this.handleAnswer(ws, data.payload);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.close();
    }
  }

  private async handleAnswer(ws: AuthenticatedWebSocket, answer: any) {
    try {
      const { data: session } = await supabaseAdmin
        .from('wizard_sessions')
        .select('*')
        .eq('id', ws.sessionId)
        .single();

      if (!session) {
        ws.close();
        return;
      }

      // Update session with new answer
      const updatedAnswerHistory = [
        ...session.answer_history,
        {
          questionId: answer.questionId,
          answer: answer.answer,
          timestamp: new Date().toISOString()
        }
      ];

      const { error: updateError } = await supabaseAdmin
        .from('wizard_sessions')
        .update({
          answer_history: updatedAnswerHistory,
          current_question_index: session.current_question_index + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', ws.sessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
        ws.close();
        return;
      }

      // Send next question
      await this.sendNextQuestion(ws);
    } catch (error) {
      console.error('Error handling answer:', error);
      ws.close();
    }
  }

  private async generateDocument(ws: AuthenticatedWebSocket) {
    try {
      const { data: session } = await supabaseAdmin
        .from('wizard_sessions')
        .select('*')
        .eq('id', ws.sessionId)
        .single();

      const { data: template } = await supabaseAdmin
        .from('document_templates')
        .select('*')
        .eq('id', ws.templateId)
        .single();
      
      if (!session || !template) {
        ws.close();
        return;
      }

      // Call AI service to generate document
      const documentData = this.assembleDocumentData(session.answer_history);
      const content = await this.callAIService(template.name, documentData);

      // Save generated document
      const { data: generatedDoc, error: docError } = await supabaseAdmin
        .from('generated_documents')
        .insert({
          user_id: session.user_id,
          template_id: session.template_id,
          document_data: documentData,
          content
        })
        .select()
        .single();

      if (docError || !generatedDoc) {
        console.error('Error saving document:', docError);
        ws.close();
        return;
      }

      // Mark session as complete
      await supabaseAdmin
        .from('wizard_sessions')
        .update({
          is_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', ws.sessionId);

      // Send completion message
      ws.send(JSON.stringify({
        type: 'generation_complete',
        payload: {
          documentId: generatedDoc.id
        }
      }));

      ws.close();
    } catch (error) {
      console.error('Error generating document:', error);
      ws.close();
    }
  }

  private assembleDocumentData(answerHistory: any[]) {
    const data: Record<string, any> = {};
    answerHistory.forEach(({ questionId, answer }) => {
      data[questionId] = answer;
    });
    return data;
  }

  private async callAIService(templateName: string, documentData: any) {
    // TODO: Implement AI service call
    // This would call the AI service to generate the actual document content
    return `Generated ${templateName} content based on provided data:\n\n${JSON.stringify(documentData, null, 2)}`;
  }
}

// Start server
const server = new DocumentWizardServer(8000);
