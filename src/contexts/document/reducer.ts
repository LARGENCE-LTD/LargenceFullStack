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
      return { ...state, providedData: [...state.providedData, action.payload] };

    case DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS:
      return { ...state, isStreaming: action.payload };

    case DOCUMENT_ACTION_TYPES.SET_STREAMING_CONTENT:
      return { ...state, streamingContent: action.payload };

    case DOCUMENT_ACTION_TYPES.ADD_STREAMING_CHUNK:
      return { ...state, streamingContent: state.streamingContent + action.payload };

    case DOCUMENT_ACTION_TYPES.SET_DOCUMENT_CONTENT:
      return { ...state, documentContent: action.payload };

    case DOCUMENT_ACTION_TYPES.CLEAR_DOCUMENT_CONTENT:
      return { ...state, documentContent: '' };

    case DOCUMENT_ACTION_TYPES.UPDATE_PROGRESS:
      return { ...state, progress: action.payload };

    case DOCUMENT_ACTION_TYPES.ADD_TO_DOCUMENT_HISTORY:
      return { ...state, documentSessions: [...state.documentSessions, action.payload] };

    case DOCUMENT_ACTION_TYPES.SET_DOCUMENT_HISTORY:
      return { ...state, documentSessions: action.payload };

    case DOCUMENT_ACTION_TYPES.LOAD_DOCUMENT_FROM_HISTORY:
      return {
        ...state,
        documentContent: action.payload.content,
        suggestedTitle: action.payload.title,
        documentType: action.payload.documentType,
        sessionStatus: 'completed'
      };

    case DOCUMENT_ACTION_TYPES.SET_USER_CONSENT:
      return { ...state, userConsentGiven: action.payload };

    case DOCUMENT_ACTION_TYPES.RESET_SESSION:
      return {
        ...state,
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
        // Reset wizard state
        wizardSessionId: null,
        currentQuestion: null,
        wizardAnswers: [],
        isWizardMode: false,
        wizardProgress: { current: 0, total: 0 }
      };

    // Wizard-specific cases
    case DOCUMENT_ACTION_TYPES.SET_WIZARD_SESSION:
      return { ...state, wizardSessionId: action.payload.sessionId };

    case DOCUMENT_ACTION_TYPES.SET_CURRENT_QUESTION:
      return { ...state, currentQuestion: action.payload };

    case DOCUMENT_ACTION_TYPES.ADD_WIZARD_ANSWER:
      return { 
        ...state, 
        wizardAnswers: [...state.wizardAnswers, action.payload],
        wizardProgress: { 
          current: state.wizardProgress.current + 1, 
          total: state.wizardProgress.total 
        }
      };

    case DOCUMENT_ACTION_TYPES.SET_WIZARD_MODE:
      return { ...state, isWizardMode: action.payload };

    case DOCUMENT_ACTION_TYPES.UPDATE_WIZARD_PROGRESS:
      return { ...state, wizardProgress: action.payload };

    default:
      return state;
  }
}
