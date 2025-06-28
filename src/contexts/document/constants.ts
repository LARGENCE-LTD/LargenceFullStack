// Action types for document context
export const DOCUMENT_ACTION_TYPES = {
  // Session management
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  START_SESSION: 'START_SESSION',
  SET_SESSION_STATUS: 'SET_SESSION_STATUS',

  // Document setup
  SET_ORIGINAL_PROMPT: 'SET_ORIGINAL_PROMPT',
  SET_DOCUMENT_TYPE: 'SET_DOCUMENT_TYPE',
  SET_SUGGESTED_TITLE: 'SET_SUGGESTED_TITLE',

  // Missing data flow
  SET_MISSING_DATA: 'SET_MISSING_DATA',
  CLEAR_MISSING_DATA: 'CLEAR_MISSING_DATA',
  SET_PROVIDED_DATA: 'SET_PROVIDED_DATA',
  ADD_PROVIDED_DATA: 'ADD_PROVIDED_DATA',

  // Streaming and output
  SET_STREAMING_STATUS: 'SET_STREAMING_STATUS',
  SET_STREAMING_CONTENT: 'SET_STREAMING_CONTENT',
  ADD_STREAMING_CHUNK: 'ADD_STREAMING_CHUNK',
  SET_DOCUMENT_CONTENT: 'SET_DOCUMENT_CONTENT',
  CLEAR_DOCUMENT_CONTENT: 'CLEAR_DOCUMENT_CONTENT',

  // Progress tracking
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',

  // History management
  ADD_TO_DOCUMENT_HISTORY: 'ADD_TO_DOCUMENT_HISTORY',
  SET_DOCUMENT_HISTORY: 'SET_DOCUMENT_HISTORY',
  ADD_TO_CONVERSATION_HISTORY: 'ADD_TO_CONVERSATION_HISTORY',
  SET_CONVERSATION_HISTORY: 'SET_CONVERSATION_HISTORY',
  LOAD_DOCUMENT_FROM_HISTORY: 'LOAD_DOCUMENT_FROM_HISTORY',

  // Privacy and session
  SET_USER_CONSENT: 'SET_USER_CONSENT',
  RESET_SESSION: 'RESET_SESSION',
} as const;

// Storage keys for document context
export const STORAGE_KEYS = {
  DOCUMENT_SESSION: 'document_session',
  DOCUMENT_HISTORY: 'document_history',
  CONVERSATION_HISTORY: 'conversation_history',
  USER_CONSENT: 'user_consent',
} as const;

// API base URL
export const API_BASE_URL = '/api/documents';

// Document types
export const DOCUMENT_TYPES = [
  { value: 'nda', label: 'Non-Disclosure Agreement' },
  { value: 'employment_contract', label: 'Employment Contract' },
  { value: 'service_agreement', label: 'Service Agreement' },
  { value: 'lease_agreement', label: 'Lease Agreement' },
  { value: 'partnership_agreement', label: 'Partnership Agreement' },
] as const;

// Export formats
export const EXPORT_FORMATS = [
  { format: 'pdf', name: 'PDF Document' },
  { format: 'word', name: 'Word Document' },
] as const;

// Session status types
export const SESSION_STATUS = {
  IDLE: 'idle',
  STARTING: 'starting',
  MISSING_INFO: 'missing_info',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

// Activity types
export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  DOCUMENT_CREATED: 'document_created',
  DOCUMENT_EXPORTED: 'document_exported',
  PROFILE_UPDATED: 'profile_updated',
  SUBSCRIPTION_CHANGED: 'subscription_changed',
} as const; 