// Action types for document context
export const DOCUMENT_ACTION_TYPES = {
  // Session management
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  START_SESSION: "START_SESSION",
  SET_SESSION_STATUS: "SET_SESSION_STATUS",

  // Document setup
  SET_ORIGINAL_PROMPT: "SET_ORIGINAL_PROMPT",
  SET_DOCUMENT_TYPE: "SET_DOCUMENT_TYPE",
  SET_SUGGESTED_TITLE: "SET_SUGGESTED_TITLE",

  // Missing data flow
  SET_MISSING_DATA: "SET_MISSING_DATA",
  CLEAR_MISSING_DATA: "CLEAR_MISSING_DATA",
  SET_PROVIDED_DATA: "SET_PROVIDED_DATA",
  ADD_PROVIDED_DATA: "ADD_PROVIDED_DATA",

  // Streaming and output
  SET_STREAMING_STATUS: "SET_STREAMING_STATUS",
  SET_STREAMING_CONTENT: "SET_STREAMING_CONTENT",
  ADD_STREAMING_CHUNK: "ADD_STREAMING_CHUNK",
  SET_DOCUMENT_CONTENT: "SET_DOCUMENT_CONTENT",
  CLEAR_DOCUMENT_CONTENT: "CLEAR_DOCUMENT_CONTENT",

  // Progress tracking
  UPDATE_PROGRESS: "UPDATE_PROGRESS",

  // History management
  ADD_TO_DOCUMENT_HISTORY: "ADD_TO_DOCUMENT_HISTORY",
  SET_DOCUMENT_HISTORY: "SET_DOCUMENT_HISTORY",
  ADD_TO_CONVERSATION_HISTORY: "ADD_TO_CONVERSATION_HISTORY",
  SET_CONVERSATION_HISTORY: "SET_CONVERSATION_HISTORY",
  LOAD_DOCUMENT_FROM_HISTORY: "LOAD_DOCUMENT_FROM_HISTORY",

  // Privacy and session
  SET_USER_CONSENT: "SET_USER_CONSENT",
  RESET_SESSION: "RESET_SESSION",
} as const;

// Storage keys for document context
export const STORAGE_KEYS = {
  DOCUMENT_SESSION: "document_session",
  DOCUMENT_HISTORY: "document_history",
  CONVERSATION_HISTORY: "conversation_history",
  USER_CONSENT: "user_consent",
} as const;

// API base URL
export const API_BASE_URL = "ws://localhost:8080/chat";

// Document types
export const DOCUMENT_TYPES = [
  { value: "nda", label: "Non-Disclosure Agreement" },
  { value: "employment_contract", label: "Employment Contract" },
  { value: "service_agreement", label: "Service Agreement" },
  { value: "lease_agreement", label: "Lease Agreement" },
  { value: "partnership_agreement", label: "Partnership Agreement" },
  { value: "consulting_agreement", label: "Consulting Agreement" },
  { value: "vendor_contract", label: "Vendor Contract" },
  { value: "client_contract", label: "Client Contract" },
  {
    value: "independent_contractor",
    label: "Independent Contractor Agreement",
  },
  { value: "confidentiality_agreement", label: "Confidentiality Agreement" },
  {
    value: "intellectual_property_agreement",
    label: "Intellectual Property Agreement",
  },
  { value: "terms_of_service", label: "Terms of Service" },
  { value: "privacy_policy", label: "Privacy Policy" },
  { value: "website_terms", label: "Website Terms & Conditions" },
  { value: "purchase_agreement", label: "Purchase Agreement" },
  { value: "sales_agreement", label: "Sales Agreement" },
  { value: "licensing_agreement", label: "Licensing Agreement" },
  { value: "franchise_agreement", label: "Franchise Agreement" },
  { value: "settlement_agreement", label: "Settlement Agreement" },
  {
    value: "memorandum_of_understanding",
    label: "Memorandum of Understanding",
  },
  { value: "letter_of_intent", label: "Letter of Intent" },
  { value: "general_contract", label: "General Contract" },
] as const;

// TypeScript type for document types
export type DocumentType = (typeof DOCUMENT_TYPES)[number]["value"];

// Export formats
export const EXPORT_FORMATS = [
  { format: "pdf", name: "PDF Document" },
  { format: "word", name: "Word Document" },
] as const;

// Session status types
export const SESSION_STATUS = {
  IDLE: "idle",
  STARTING: "starting",
  MISSING_INFO: "missing_info",
  GENERATING: "generating",
  COMPLETED: "completed",
  ERROR: "error",
} as const;

// TypeScript types for better type safety
export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

// Activity types
export const ACTIVITY_TYPES = {
  LOGIN: "login",
  LOGOUT: "logout",
  DOCUMENT_CREATED: "document_created",
  DOCUMENT_EXPORTED: "document_exported",
  PROFILE_UPDATED: "profile_updated",
  SUBSCRIPTION_CHANGED: "subscription_changed",
} as const;

// Workflow step types
export const WORKFLOW_STEPS = {
  PROMPT: "prompt",
  LOADING: "loading",
  MISSING_FIELDS: "missing_fields",
  PREVIEW: "preview",
} as const;

export type WorkflowStep = (typeof WORKFLOW_STEPS)[keyof typeof WORKFLOW_STEPS];

// Mapping from session status to workflow step
export const SESSION_STATUS_TO_WORKFLOW_STEP: Record<
  SessionStatus,
  WorkflowStep
> = {
  [SESSION_STATUS.IDLE]: WORKFLOW_STEPS.PROMPT,
  [SESSION_STATUS.STARTING]: WORKFLOW_STEPS.LOADING,
  [SESSION_STATUS.GENERATING]: WORKFLOW_STEPS.LOADING,
  [SESSION_STATUS.MISSING_INFO]: WORKFLOW_STEPS.MISSING_FIELDS,
  [SESSION_STATUS.COMPLETED]: WORKFLOW_STEPS.PREVIEW,
  [SESSION_STATUS.ERROR]: WORKFLOW_STEPS.PROMPT, // Return to prompt on error
} as const;

// Utility function to get workflow step from session status
export const getWorkflowStep = (sessionStatus: SessionStatus): WorkflowStep => {
  return SESSION_STATUS_TO_WORKFLOW_STEP[sessionStatus];
};
