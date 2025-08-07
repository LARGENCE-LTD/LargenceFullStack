// Database Entity Types
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
  template_id: string | null; // Can be null until AI classifies intent
  conversation_history: ConversationMessage[];
  answered_questions: string[]; // Array of question IDs that have been answered
  current_question_index: number; // Current position in the question flow
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

// Conversation Message Types
export interface ConversationMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp?: string;
}

// WebSocket Message Types
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

// AI Service API Types
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
  answeredQuestionIds?: string[]; // IDs of questions answered in this response
  error?: {
    message: string;
  };
}

// New types for preemptive answer detection
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

// WebSocket Connection Types
import { WebSocket } from 'ws';

export interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
  templateId?: string; // Optional until AI classifies intent
  sessionId?: string;
}

// Error Types
export interface WebSocketError {
  type: 'authentication_error' | 'validation_error' | 'ai_service_error' | 'database_error';
  message: string;
  code?: string;
}

// Session Management Types
export interface SessionState {
  sessionId: string;
  userId: string;
  templateId: string;
  isComplete: boolean;
  conversationHistory: ConversationMessage[];
}

// Template Validation Types
export interface TemplateValidationResult {
  isValid: boolean;
  error?: string;
}

// RAG Types
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