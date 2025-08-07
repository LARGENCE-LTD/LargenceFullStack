export interface DocumentTemplate {
    id: string;
    name: string;
    description?: string;
    questions: Question[];
    created_at: string;
}
export interface Question {
    id: string;
    text: string;
}
export interface ChatSession {
    id: string;
    user_id: string;
    template_id: string | null;
    conversation_history: ConversationMessage[];
    answered_questions: string[];
    current_question_index: number;
    is_complete: boolean;
    created_at: string;
    updated_at: string;
}
export interface GeneratedDocument {
    id: string;
    user_id: string;
    template_id: string;
    document_data: Record<string, any>;
    created_at: string;
    updated_at: string;
}
export interface ConversationMessage {
    role: 'user' | 'ai';
    content: string;
    timestamp?: string;
}
export interface ClientMessage {
    type: 'user_message';
    content: string;
}
export interface ServerMessage {
    type: 'session_resumed' | 'next_question' | 'session_complete' | 'error';
    sessionId?: string;
    history?: ConversationMessage[];
    question?: Question;
    documentId?: string;
    message?: string;
}
export interface AIServiceRequest {
    sessionId: string;
}
export interface AIServiceClassifyRequest {
    sessionId: string;
    userMessage: string;
}
export interface AIServiceResponse {
    status: 'in_progress' | 'complete' | 'error';
    nextQuestion?: {
        text: string;
    };
    answeredQuestionIds?: string[];
    error?: {
        message: string;
    };
}
export interface LLMQuestionAnalysis {
    answered_question_ids: string[];
    next_question_to_ask: string;
}
export interface ConversationState {
    answeredQuestions: string[];
    remainingQuestions: Question[];
    currentQuestionIndex: number;
}
export interface AIServiceClassifyResponse {
    status: 'success' | 'error';
    templateId?: string;
    nextQuestion?: {
        text: string;
    };
    error?: {
        message: string;
    };
}
import { WebSocket } from 'ws';
export interface AuthenticatedWebSocket extends WebSocket {
    userId: string;
    templateId?: string;
    sessionId?: string;
}
export interface WebSocketError {
    type: 'authentication_error' | 'validation_error' | 'ai_service_error' | 'database_error';
    message: string;
    code?: string;
}
export interface SessionState {
    sessionId: string;
    userId: string;
    templateId: string;
    isComplete: boolean;
    conversationHistory: ConversationMessage[];
}
export interface TemplateValidationResult {
    isValid: boolean;
    error?: string;
}
export interface DocumentTemplateEmbedding {
    id: string;
    template_id: string;
    content: string;
    embedding: number[];
    created_at: string;
}
export interface RAGSearchResult {
    template_id: string;
    similarity_score: number;
    content: string;
}
export interface EmbeddingRequest {
    text: string;
}
export interface EmbeddingResponse {
    embedding: number[];
}
export interface LLMRequest {
    prompt: string;
    context?: string;
}
export interface LLMResponse {
    response: string;
}
//# sourceMappingURL=index.d.ts.map