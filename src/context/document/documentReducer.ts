import { DocumentState, MissingData, ProvidedField, DocumentHistoryEntry, ConversationHistoryEntry } from "./documentState";

// --- Action Types ---

export const actionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",

  START_SESSION: "START_SESSION",
  SET_SESSION_STATUS: "SET_SESSION_STATUS",

  SET_ORIGINAL_PROMPT: "SET_ORIGINAL_PROMPT",
  SET_DOCUMENT_TYPE: "SET_DOCUMENT_TYPE",
  SET_SUGGESTED_TITLE: "SET_SUGGESTED_TITLE",

  SET_MISSING_DATA: "SET_MISSING_DATA",
  CLEAR_MISSING_DATA: "CLEAR_MISSING_DATA",
  SET_PROVIDED_DATA: "SET_PROVIDED_DATA",
  ADD_PROVIDED_DATA: "ADD_PROVIDED_DATA",

  SET_STREAMING_STATUS: "SET_STREAMING_STATUS",
  SET_STREAMING_CONTENT: "SET_STREAMING_CONTENT",
  ADD_STREAMING_CHUNK: "ADD_STREAMING_CHUNK",

  SET_DOCUMENT_CONTENT: "SET_DOCUMENT_CONTENT",
  CLEAR_DOCUMENT_CONTENT: "CLEAR_DOCUMENT_CONTENT",

  UPDATE_PROGRESS: "UPDATE_PROGRESS",

  ADD_TO_DOCUMENT_HISTORY: "ADD_TO_DOCUMENT_HISTORY",
  SET_DOCUMENT_HISTORY: "SET_DOCUMENT_HISTORY",
  ADD_TO_CONVERSATION_HISTORY: "ADD_TO_CONVERSATION_HISTORY",
  SET_CONVERSATION_HISTORY: "SET_CONVERSATION_HISTORY",

  SET_USER_CONSENT: "SET_USER_CONSENT",

  RESET_SESSION: "RESET_SESSION",
} as const;

export type ActionType = typeof actionTypes[keyof typeof actionTypes];

// --- Action Types ---

export type DocumentAction =
  | { type: typeof actionTypes.SET_LOADING; payload: boolean }
  | { type: typeof actionTypes.SET_ERROR; payload: string }
  | { type: typeof actionTypes.CLEAR_ERROR }

  | { type: typeof actionTypes.START_SESSION; payload: { sessionId: string } }
  | { type: typeof actionTypes.SET_SESSION_STATUS; payload: DocumentState["sessionStatus"] }

  | { type: typeof actionTypes.SET_ORIGINAL_PROMPT; payload: string }
  | { type: typeof actionTypes.SET_DOCUMENT_TYPE; payload: string }
  | { type: typeof actionTypes.SET_SUGGESTED_TITLE; payload: string }

  | { type: typeof actionTypes.SET_MISSING_DATA; payload: MissingData }
  | { type: typeof actionTypes.CLEAR_MISSING_DATA }
  | { type: typeof actionTypes.SET_PROVIDED_DATA; payload: ProvidedField[] }
  | { type: typeof actionTypes.ADD_PROVIDED_DATA; payload: ProvidedField }

  | { type: typeof actionTypes.SET_STREAMING_STATUS; payload: boolean }
  | { type: typeof actionTypes.SET_STREAMING_CONTENT; payload: string }
  | { type: typeof actionTypes.ADD_STREAMING_CHUNK; payload: string }

  | { type: typeof actionTypes.SET_DOCUMENT_CONTENT; payload: string }
  | { type: typeof actionTypes.CLEAR_DOCUMENT_CONTENT }

  | { type: typeof actionTypes.UPDATE_PROGRESS; payload: { current: number; total: number } }

  | { type: typeof actionTypes.ADD_TO_DOCUMENT_HISTORY; payload: DocumentHistoryEntry }
  | { type: typeof actionTypes.SET_DOCUMENT_HISTORY; payload: DocumentHistoryEntry[] }
  | { type: typeof actionTypes.ADD_TO_CONVERSATION_HISTORY; payload: ConversationHistoryEntry }
  | { type: typeof actionTypes.SET_CONVERSATION_HISTORY; payload: ConversationHistoryEntry[] }

  | { type: typeof actionTypes.SET_USER_CONSENT; payload: boolean }

  | { type: typeof actionTypes.RESET_SESSION };

// --- Reducer Function ---

export function documentReducer(
  state: DocumentState,
  action: DocumentAction
): DocumentState {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    case actionTypes.START_SESSION:
      return {
        ...state,
        sessionId: action.payload.sessionId,
        sessionStatus: "starting",
        originalPrompt: "",
        documentType: null,
        suggestedTitle: "",
        missingData: { fields: [], message: "" },
        providedData: [],
        streamingContent: "",
        documentContent: "",
        isStreaming: false,
        progress: { current: 0, total: 0 },
        loading: false,
        error: null
      };

    case actionTypes.SET_SESSION_STATUS:
      return { ...state, sessionStatus: action.payload };

    case actionTypes.SET_ORIGINAL_PROMPT:
      return { ...state, originalPrompt: action.payload };

    case actionTypes.SET_DOCUMENT_TYPE:
      return { ...state, documentType: action.payload };

    case actionTypes.SET_SUGGESTED_TITLE:
      return { ...state, suggestedTitle: action.payload };

    case actionTypes.SET_MISSING_DATA:
      return { ...state, missingData: action.payload, sessionStatus: "missing_info", loading: false };

    case actionTypes.CLEAR_MISSING_DATA:
      return { ...state, missingData: { fields: [], message: "" }, providedData: [] };

    case actionTypes.SET_PROVIDED_DATA:
      return { ...state, providedData: action.payload };

    case actionTypes.ADD_PROVIDED_DATA:
      // Avoid duplicates by field
      const filtered = state.providedData.filter(
        (p) => p.field !== action.payload.field
      );
      return { ...state, providedData: [...filtered, action.payload] };

    case actionTypes.SET_STREAMING_STATUS:
      return { ...state, isStreaming: action.payload };

    case actionTypes.SET_STREAMING_CONTENT:
      return { ...state, streamingContent: action.payload };

    case actionTypes.ADD_STREAMING_CHUNK:
      return { ...state, streamingContent: state.streamingContent + action.payload };

    case actionTypes.SET_DOCUMENT_CONTENT:
      return { ...state, documentContent: action.payload, isStreaming: false };

    case actionTypes.CLEAR_DOCUMENT_CONTENT:
      return { ...state, documentContent: "" };

    case actionTypes.UPDATE_PROGRESS:
      return { ...state, progress: action.payload };

    case actionTypes.ADD_TO_DOCUMENT_HISTORY:
      return { ...state, documentHistory: [action.payload, ...state.documentHistory] };

    case actionTypes.SET_DOCUMENT_HISTORY:
      return { ...state, documentHistory: action.payload };

    case actionTypes.ADD_TO_CONVERSATION_HISTORY:
      return { ...state, conversationHistory: [action.payload, ...state.conversationHistory] };

    case actionTypes.SET_CONVERSATION_HISTORY:
      return { ...state, conversationHistory: action.payload };

    case actionTypes.SET_USER_CONSENT:
      return { ...state, userConsentGiven: action.payload };

    case actionTypes.RESET_SESSION:
      // documentHistory/conversationHistory/userConsentGiven persist
      return {
        sessionId: null,
        sessionStatus: "idle",
        loading: false,
        error: null,
        originalPrompt: "",
        documentType: null,
        suggestedTitle: "",
        missingData: { fields: [], message: "" },
        providedData: [],
        streamingContent: "",
        documentContent: "",
        isStreaming: false,
        progress: { current: 0, total: 0 },
        documentHistory: state.documentHistory,
        conversationHistory: state.conversationHistory,
        userConsentGiven: state.userConsentGiven
      };

    default:
      return state;
  }
}
