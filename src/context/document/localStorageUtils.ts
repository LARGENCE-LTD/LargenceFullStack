import { DocumentState, DocumentHistoryEntry, ConversationHistoryEntry } from "./documentState";

// Storage keys (update if you want to namespace)
const STORAGE_KEYS = {
  SESSION: "docgen_session",
  DOCUMENT_HISTORY: "docgen_document_history",
  CONVERSATION_HISTORY: "docgen_conversation_history",
  CONSENT: "docgen_user_consent",
};

// --- Session ---
export function saveSession(state: DocumentState) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({
    ...state,
    // Avoid storing streaming content and loading state
    streamingContent: "",
    loading: false,
    error: null,
  }));
}

export function loadSession(): Partial<DocumentState> | null {
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  return data ? JSON.parse(data) : null;
}

export function removeSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

// --- Document History ---
export function saveHistory(history: DocumentHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEYS.DOCUMENT_HISTORY, JSON.stringify(history));
}

export function loadHistory(): DocumentHistoryEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.DOCUMENT_HISTORY);
  return data ? JSON.parse(data) : [];
}

export function removeHistory() {
  localStorage.removeItem(STORAGE_KEYS.DOCUMENT_HISTORY);
}

// --- Conversation History ---
export function saveConversationHistory(history: ConversationHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, JSON.stringify(history));
}

export function loadConversationHistory(): ConversationHistoryEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
  return data ? JSON.parse(data) : [];
}

export function removeConversationHistory() {
  localStorage.removeItem(STORAGE_KEYS.CONVERSATION_HISTORY);
}

// --- Consent ---
export function saveUserConsent(consent: boolean) {
  localStorage.setItem(STORAGE_KEYS.CONSENT, JSON.stringify(consent));
}

export function loadUserConsent(): boolean {
  const data = localStorage.getItem(STORAGE_KEYS.CONSENT);
  return data ? JSON.parse(data) : false;
}
