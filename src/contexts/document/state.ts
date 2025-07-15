import { DOCUMENT_ACTION_TYPES, SESSION_STATUS, type SessionStatus, type DocumentType } from './constants';

// Single missing field required by backend
export interface MissingField {
    field:        string;
    explanation:  string;
    example:      string;
  }
  
  // Missing data prompt structure
  export interface MissingData {
    fields:   MissingField[];
    message:  string;
  }
  
  // Single provided field/answer pair
  export interface ProvidedField {
    field:  string;
    answer: string;
  }
  
  // Final generated document content (single document)
  export type DocumentContent = string;
  
  // Complete document session entry - consolidates document and conversation history
  export interface DocumentSession {
    // Core document info
    id:           string;
    title:        string;
    documentType: DocumentType;
    content:      string;
    createdAt:    string;
    
    // Session context and conversation
    originalPrompt: string;
    missingData?:   MissingData;
    providedData:   ProvidedField[];
    
    // Metadata
    sessionId?:     string | null;
    status:         'completed' | 'draft' | 'error';
    lastModified?:  string;
  }
  
  // Legacy interfaces for backward compatibility (can be removed later)
  export interface DocumentHistoryEntry {
    id:           string;
    title:        string;
    documentType: string;
    content:      string;
    createdAt:    string;
  }
  
  export interface ConversationHistoryEntry {
    prompt:         string;
    missingData?:   MissingData;
    providedData?:  ProvidedField[];
    documentContent: string;
    createdAt:      string;
  }
  
  // Main document state interface
  export interface State {
    // Session
    sessionId:      string | null;
    sessionStatus:  SessionStatus;
    loading:        boolean;
    error:          string | null;
  
    // User input and doc setup
    originalPrompt: string;
    documentType:   DocumentType | null;
    suggestedTitle: string;
  
    // Missing fields flow
    missingData:    MissingData;
    providedData:   ProvidedField[];
  
    // Streaming and output
    streamingContent: string;
    documentContent:  string;
    isStreaming:      boolean;
    progress:         { current: number; total: number };
  
    // History - consolidated into single DocumentSession array
    documentSessions: DocumentSession[];
  
    // Privacy
    userConsentGiven: boolean;
  }
  
  // Document action types
  export type DocumentActionType = typeof DOCUMENT_ACTION_TYPES[keyof typeof DOCUMENT_ACTION_TYPES];
  
  // Document action interface
  export type DocumentAction =
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_LOADING; payload: boolean }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_ERROR; payload: string }
    | { type: typeof DOCUMENT_ACTION_TYPES.CLEAR_ERROR }
    | { type: typeof DOCUMENT_ACTION_TYPES.START_SESSION; payload: { sessionId: string } }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS; payload: SessionStatus }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_ORIGINAL_PROMPT; payload: string }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_DOCUMENT_TYPE; payload: DocumentType }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_SUGGESTED_TITLE; payload: string }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_MISSING_DATA; payload: MissingData }
    | { type: typeof DOCUMENT_ACTION_TYPES.CLEAR_MISSING_DATA }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_PROVIDED_DATA; payload: ProvidedField[] }
    | { type: typeof DOCUMENT_ACTION_TYPES.ADD_PROVIDED_DATA; payload: ProvidedField }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS; payload: boolean }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_STREAMING_CONTENT; payload: string }
    | { type: typeof DOCUMENT_ACTION_TYPES.ADD_STREAMING_CHUNK; payload: string }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_DOCUMENT_CONTENT; payload: string }
    | { type: typeof DOCUMENT_ACTION_TYPES.CLEAR_DOCUMENT_CONTENT }
    | { type: typeof DOCUMENT_ACTION_TYPES.UPDATE_PROGRESS; payload: { current: number; total: number } }
    | { type: typeof DOCUMENT_ACTION_TYPES.ADD_TO_DOCUMENT_HISTORY; payload: DocumentSession }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_DOCUMENT_HISTORY; payload: DocumentSession[] }
    | { type: typeof DOCUMENT_ACTION_TYPES.LOAD_DOCUMENT_FROM_HISTORY; payload: DocumentSession }
    | { type: typeof DOCUMENT_ACTION_TYPES.SET_USER_CONSENT; payload: boolean }
    | { type: typeof DOCUMENT_ACTION_TYPES.RESET_SESSION };
  
  // Initial state
  export const initialState: State = {
    // Session
    sessionId:      null,
    sessionStatus:  SESSION_STATUS.IDLE,
    loading:        false,
    error:          null,
  
    // User input
    originalPrompt: "",
    documentType:   null,
    suggestedTitle: "",
  
    // Missing data/fields
    missingData: {
      fields: [],
      message: ""
    },
    providedData: [],
  
    // Streaming and final output
    streamingContent: "",
    documentContent:  "",
    isStreaming:      false,
    progress:         { current: 0, total: 0 },
  
    // History
    documentSessions: [],
  
    // Privacy
    userConsentGiven: false
  };
  