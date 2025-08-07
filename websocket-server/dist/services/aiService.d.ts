import { AIServiceResponse, AIServiceClassifyResponse } from '../types';
export declare class AIService {
    private client;
    private apiKey;
    private ragService;
    constructor();
    classifyAndStart(sessionId: string, userMessage: string): Promise<AIServiceClassifyResponse>;
    getNextQuestion(sessionId: string, userMessage: string, session: any): Promise<AIServiceResponse>;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=aiService.d.ts.map