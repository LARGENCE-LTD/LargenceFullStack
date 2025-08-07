import { RAGSearchResult, DocumentTemplate, LLMQuestionAnalysis } from '../types';
export declare class RAGService {
    private supabaseClient;
    private embeddingClient;
    private llmClient;
    private embeddingApiKey;
    private llmApiKey;
    constructor();
    generateEmbedding(text: string): Promise<number[]>;
    searchSimilarTemplates(queryEmbedding: number[], limit?: number): Promise<RAGSearchResult[]>;
    getTemplate(templateId: string): Promise<DocumentTemplate>;
    generateFirstQuestion(userMessage: string, template: DocumentTemplate): Promise<string>;
    storeTemplateEmbedding(templateId: string, content: string, embedding: number[]): Promise<void>;
    getAllTemplates(): Promise<DocumentTemplate[]>;
    analyzeUserMessage(userMessage: string, template: DocumentTemplate, answeredQuestions: string[], conversationHistory: any[]): Promise<LLMQuestionAnalysis>;
}
//# sourceMappingURL=ragService.d.ts.map