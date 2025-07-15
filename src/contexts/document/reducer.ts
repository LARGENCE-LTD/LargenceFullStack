import { State, DocumentAction } from './state';
import { DOCUMENT_ACTION_TYPES } from './constants';

export function reducer(state: State, action: DocumentAction): State {
  switch (action.type) {
    case DOCUMENT_ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };

    case DOCUMENT_ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case DOCUMENT_ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };

    case DOCUMENT_ACTION_TYPES.START_SESSION:
      return {
        ...state,
        sessionId: action.payload.sessionId,
        originalPrompt: '',
        documentType: null,
        suggestedTitle: '',
        missingData: { fields: [], message: '' },
        providedData: [],
        streamingContent: '',
        documentContent: '',
        isStreaming: false,
        progress: { current: 0, total: 0 },
        loading: false,
        error: null
      };

    case DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS:
      return { ...state, sessionStatus: action.payload };

    case DOCUMENT_ACTION_TYPES.SET_ORIGINAL_PROMPT:
      return { ...state, originalPrompt: action.payload };

    case DOCUMENT_ACTION_TYPES.SET_DOCUMENT_TYPE:
      return { ...state, documentType: action.payload };

    case DOCUMENT_ACTION_TYPES.SET_SUGGESTED_TITLE:
      return { ...state, suggestedTitle: action.payload };

    case DOCUMENT_ACTION_TYPES.SET_MISSING_DATA:
      return { ...state, missingData: action.payload, sessionStatus: 'missing_info', loading: false };

    case DOCUMENT_ACTION_TYPES.CLEAR_MISSING_DATA:
      return { ...state, missingData: { fields: [], message: '' }, providedData: [] };

    case DOCUMENT_ACTION_TYPES.SET_PROVIDED_DATA:
      return { ...state, providedData: action.payload };

    case DOCUMENT_ACTION_TYPES.ADD_PROVIDED_DATA:
      // Avoid duplicates by field
      const filtered = state.providedData.filter(
        (p) => p.field !== action.payload.field
      );
      return { ...state, providedData: [...filtered, action.payload] };

    case DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS:
      return { ...state, isStreaming: action.payload };

    case DOCUMENT_ACTION_TYPES.SET_STREAMING_CONTENT:
      return { ...state, streamingContent: action.payload };

    case DOCUMENT_ACTION_TYPES.ADD_STREAMING_CHUNK:
      return { ...state, streamingContent: state.streamingContent + action.payload };

    case DOCUMENT_ACTION_TYPES.SET_DOCUMENT_CONTENT:
      return { ...state, documentContent: action.payload, isStreaming: false };

    case DOCUMENT_ACTION_TYPES.CLEAR_DOCUMENT_CONTENT:
      return { ...state, documentContent: '' };

    case DOCUMENT_ACTION_TYPES.UPDATE_PROGRESS:
      return { ...state, progress: action.payload };

    case DOCUMENT_ACTION_TYPES.ADD_TO_DOCUMENT_HISTORY:
      return { ...state, documentSessions: [action.payload, ...state.documentSessions] };

    case DOCUMENT_ACTION_TYPES.SET_DOCUMENT_HISTORY:
      return { ...state, documentSessions: action.payload };

    case DOCUMENT_ACTION_TYPES.LOAD_DOCUMENT_FROM_HISTORY:
      return {
        ...state,
        sessionId: action.payload.sessionId || action.payload.id,
        sessionStatus: 'completed',
        originalPrompt: action.payload.originalPrompt,
        documentType: action.payload.documentType,
        suggestedTitle: action.payload.title,
        missingData: action.payload.missingData || { fields: [], message: '' },
        providedData: action.payload.providedData,
        streamingContent: '',
        documentContent: action.payload.content,
        isStreaming: false,
        progress: { current: 100, total: 100 },
        loading: false,
        error: null
      };

    case DOCUMENT_ACTION_TYPES.SET_USER_CONSENT:
      return { ...state, userConsentGiven: action.payload };

    case DOCUMENT_ACTION_TYPES.RESET_SESSION:
      // documentSessions/userConsentGiven persist
      return {
        sessionId: null,
        sessionStatus: 'idle',
        loading: false,
        error: null,
        originalPrompt: '',
        documentType: null,
        suggestedTitle: '',
        missingData: { fields: [], message: '' },
        providedData: [],
        streamingContent: '',
        documentContent: '',
        isStreaming: false,
        progress: { current: 0, total: 0 },
        documentSessions: state.documentSessions,
        userConsentGiven: state.userConsentGiven
      };

    default:
      return state;
  }
}
