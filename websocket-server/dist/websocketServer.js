"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServerManager = void 0;
const http_1 = require("http");
const ws_1 = require("ws");
const url_1 = require("url");
const supabase_1 = require("./services/supabase");
const aiService_1 = require("./services/aiService");
const connectionManager_1 = require("./services/connectionManager");
class WebSocketServerManager {
    httpServer;
    wss;
    supabaseService;
    aiService;
    connectionManager;
    constructor(port) {
        this.httpServer = (0, http_1.createServer)();
        this.wss = new ws_1.WebSocketServer({ noServer: true });
        this.supabaseService = new supabase_1.SupabaseService();
        this.aiService = new aiService_1.AIService();
        this.connectionManager = new connectionManager_1.ConnectionManager();
        this.setupWebSocketServer();
        this.setupHttpServer(port);
    }
    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            this.handleConnection(ws);
        });
    }
    setupHttpServer(port) {
        this.httpServer.on('upgrade', async (request, socket, head) => {
            try {
                await this.handleUpgrade(request, socket, head);
            }
            catch (error) {
                console.error('Upgrade failed:', error);
                socket.destroy();
            }
        });
        this.httpServer.on('request', (req, res) => {
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                const stats = this.connectionManager.getStats();
                res.end(JSON.stringify({
                    status: 'healthy',
                    connections: stats,
                    timestamp: new Date().toISOString()
                }));
            }
            else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        this.httpServer.listen(port, () => {
            console.log(`WebSocket server listening on port ${port}`);
        });
    }
    async handleUpgrade(request, socket, head) {
        const url = new url_1.URL(request.url || '', `http://${request.headers.host}`);
        const token = url.searchParams.get('token');
        if (!token) {
            throw new Error('Missing authentication token');
        }
        let userId;
        try {
            userId = await this.supabaseService.validateToken(token);
        }
        catch (error) {
            throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            const authenticatedWs = ws;
            authenticatedWs.userId = userId;
            this.wss.emit('connection', authenticatedWs);
        });
    }
    async handleConnection(ws) {
        console.log(`New connection from user ${ws.userId}`);
        this.connectionManager.addConnection(ws.userId, ws);
        try {
            await this.handleSessionManagement(ws);
            ws.on('message', async (data) => {
                try {
                    await this.handleMessage(ws, data);
                }
                catch (error) {
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
        }
        catch (error) {
            console.error('Error in connection setup:', error);
            this.sendError(ws, 'Failed to initialize session. Please try again.');
            ws.close(1011, 'Session initialization failed');
        }
    }
    async handleSessionManagement(ws) {
        const existingSession = await this.supabaseService.findExistingSession(ws.userId);
        if (existingSession) {
            ws.sessionId = existingSession.id;
            if (existingSession.template_id) {
                ws.templateId = existingSession.template_id;
            }
            console.log(`Resuming session ${existingSession.id} for user ${ws.userId}`);
            const resumeMessage = {
                type: 'session_resumed',
                sessionId: existingSession.id,
                history: existingSession.conversation_history
            };
            ws.send(JSON.stringify(resumeMessage));
        }
        else {
            const newSession = await this.supabaseService.createSession(ws.userId);
            ws.sessionId = newSession.id;
            console.log(`Created new session ${newSession.id} for user ${ws.userId}`);
        }
    }
    async handleMessage(ws, data) {
        let clientMessage;
        try {
            const messageText = data.toString();
            clientMessage = JSON.parse(messageText);
        }
        catch (error) {
            console.error('Failed to parse client message:', error);
            return;
        }
        if (clientMessage.type !== 'user_message' || !clientMessage.content) {
            console.error('Invalid message format:', clientMessage);
            return;
        }
        if (!ws.sessionId) {
            console.error('No session ID for user message');
            this.sendError(ws, 'Session not initialized');
            return;
        }
        const userMessage = {
            role: 'user',
            content: clientMessage.content,
            timestamp: new Date().toISOString()
        };
        await this.supabaseService.updateConversationHistory(ws.sessionId, userMessage);
        if (!ws.templateId) {
            await this.handleFirstMessage(ws, clientMessage.content);
        }
        else {
            await this.sendNextQuestion(ws, clientMessage.content);
        }
    }
    async handleFirstMessage(ws, userMessage) {
        if (!ws.sessionId) {
            console.error('No session ID for first message handling');
            return;
        }
        try {
            const aiResponse = await this.aiService.classifyAndStart(ws.sessionId, userMessage);
            if (aiResponse.status === 'error') {
                this.sendError(ws, aiResponse.error?.message || 'Failed to classify document type');
                return;
            }
            if (aiResponse.status === 'success' && aiResponse.templateId && aiResponse.nextQuestion) {
                await this.supabaseService.updateSessionTemplate(ws.sessionId, aiResponse.templateId);
                ws.templateId = aiResponse.templateId;
                const aiMessage = {
                    role: 'ai',
                    content: aiResponse.nextQuestion.text,
                    timestamp: new Date().toISOString()
                };
                await this.supabaseService.updateConversationHistory(ws.sessionId, aiMessage);
                const nextQuestionMessage = {
                    type: 'next_question',
                    sessionId: ws.sessionId,
                    question: {
                        id: `question_${Date.now()}`,
                        text: aiResponse.nextQuestion.text
                    }
                };
                ws.send(JSON.stringify(nextQuestionMessage));
            }
            else {
                this.sendError(ws, 'Failed to determine document type. Please try again.');
            }
        }
        catch (error) {
            console.error('Error handling first message:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('AI service unavailable') || errorMessage.includes('not responding')) {
                this.sendError(ws, 'Could not connect to the AI service. Please try again in a moment.');
            }
            else {
                this.sendError(ws, 'Failed to process your request. Please try again.');
            }
        }
    }
    async sendNextQuestion(ws, userMessage) {
        if (!ws.sessionId) {
            console.error('No session ID for sending next question');
            return;
        }
        try {
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
                if (aiResponse.answeredQuestionIds && aiResponse.answeredQuestionIds.length > 0) {
                    const updatedAnsweredQuestions = [
                        ...(session.answered_questions || []),
                        ...aiResponse.answeredQuestionIds
                    ];
                    await this.supabaseService.updateQuestionProgress(ws.sessionId, updatedAnsweredQuestions, session.current_question_index + aiResponse.answeredQuestionIds.length);
                }
                await this.supabaseService.markSessionComplete(ws.sessionId);
                const completeMessage = {
                    type: 'session_complete',
                    sessionId: ws.sessionId,
                    documentId: 'placeholder-document-id'
                };
                ws.send(JSON.stringify(completeMessage));
                ws.close(1000, 'Session completed');
                return;
            }
            if (aiResponse.status === 'in_progress' && aiResponse.nextQuestion) {
                if (aiResponse.answeredQuestionIds && aiResponse.answeredQuestionIds.length > 0) {
                    const updatedAnsweredQuestions = [
                        ...(session.answered_questions || []),
                        ...aiResponse.answeredQuestionIds
                    ];
                    await this.supabaseService.updateQuestionProgress(ws.sessionId, updatedAnsweredQuestions, session.current_question_index + aiResponse.answeredQuestionIds.length);
                }
                const aiMessage = {
                    role: 'ai',
                    content: aiResponse.nextQuestion.text,
                    timestamp: new Date().toISOString()
                };
                await this.supabaseService.updateConversationHistory(ws.sessionId, aiMessage);
                const nextQuestionMessage = {
                    type: 'next_question',
                    sessionId: ws.sessionId,
                    question: {
                        id: `question_${Date.now()}`,
                        text: aiResponse.nextQuestion.text
                    }
                };
                ws.send(JSON.stringify(nextQuestionMessage));
            }
        }
        catch (error) {
            console.error('Error getting next question:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('AI service unavailable') || errorMessage.includes('not responding')) {
                this.sendError(ws, 'Could not connect to the AI service. Please try again in a moment.');
            }
            else {
                this.sendError(ws, 'Failed to get next question. Please try again.');
            }
        }
    }
    sendError(ws, message) {
        const errorMessage = {
            type: 'error',
            message
        };
        try {
            ws.send(JSON.stringify(errorMessage));
        }
        catch (error) {
            console.error('Failed to send error message:', error);
        }
    }
    getStats() {
        return this.connectionManager.getStats();
    }
    async cleanup() {
        console.log('Shutting down WebSocket server...');
        this.connectionManager.closeAllConnections();
        this.wss.close();
        this.httpServer.close();
    }
}
exports.WebSocketServerManager = WebSocketServerManager;
//# sourceMappingURL=websocketServer.js.map