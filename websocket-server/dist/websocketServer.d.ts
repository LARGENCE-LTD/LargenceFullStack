export declare class WebSocketServerManager {
    private httpServer;
    private wss;
    private supabaseService;
    private aiService;
    private connectionManager;
    constructor(port: number);
    private setupWebSocketServer;
    private setupHttpServer;
    private handleUpgrade;
    private handleConnection;
    private handleSessionManagement;
    private handleMessage;
    private handleFirstMessage;
    private sendNextQuestion;
    private sendError;
    getStats(): {
        total: number;
        active: number;
    };
    cleanup(): Promise<void>;
}
//# sourceMappingURL=websocketServer.d.ts.map