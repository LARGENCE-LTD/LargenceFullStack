import { DocumentTemplate, ChatSession, GeneratedDocument, ConversationMessage, TemplateValidationResult } from '../types';
export declare class SupabaseService {
    private client;
    constructor();
    validateToken(token: string): Promise<string>;
    validateTemplate(templateId: string): Promise<TemplateValidationResult>;
    findExistingSession(userId: string): Promise<ChatSession | null>;
    createSession(userId: string): Promise<ChatSession>;
    updateConversationHistory(sessionId: string, message: ConversationMessage): Promise<void>;
    updateSessionTemplate(sessionId: string, templateId: string): Promise<void>;
    updateQuestionProgress(sessionId: string, answeredQuestions: string[], currentQuestionIndex: number): Promise<void>;
    markSessionComplete(sessionId: string): Promise<void>;
    createGeneratedDocument(userId: string, templateId: string, documentData: Record<string, any>): Promise<GeneratedDocument>;
    getTemplate(templateId: string): Promise<DocumentTemplate>;
    cleanupOldSessions(): Promise<number>;
}
//# sourceMappingURL=supabase.d.ts.map