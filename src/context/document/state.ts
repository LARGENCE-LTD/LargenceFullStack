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
  
  // Document history entry
  export interface DocumentHistoryEntry {
    id:           string;
    title:        string;
    documentType: string;
    content:      string;
    createdAt:    string;
  }
  
  // Conversation history entry
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
    sessionStatus:  "idle" | "starting" | "missing_info" | "generating" | "completed" | "error";
    loading:        boolean;
    error:          string | null;
  
    // User input and doc setup
    originalPrompt: string;
    documentType:   string | null;
    suggestedTitle: string;
  
    // Missing fields flow
    missingData:    MissingData;
    providedData:   ProvidedField[];
  
    // Streaming and output
    streamingContent: string;
    documentContent:  string;
    isStreaming:      boolean;
    progress:         { current: number; total: number };
  
    // History
    documentHistory:      DocumentHistoryEntry[];
    conversationHistory:  ConversationHistoryEntry[];
  
    // Privacy
    userConsentGiven: boolean;
  }
  
  // --- Initial state ---
  export const initialState: State = {
    // Session
    sessionId:      null,
    sessionStatus:  "idle",
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
    documentHistory:     [],
    conversationHistory: [],
  
    // Privacy
    userConsentGiven: false
  };
  