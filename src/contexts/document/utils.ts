import { State, DocumentHistoryEntry, ConversationHistoryEntry } from "./state";
import { STORAGE_KEYS } from "./constants";

// --- Session ---
export function saveSession(state: State) {
  localStorage.setItem(STORAGE_KEYS.DOCUMENT_SESSION, JSON.stringify({
    ...state,
    // Avoid storing streaming content and loading state
    streamingContent: "",
    loading: false,
    error: null,
  }));
}

export function loadSession(): Partial<State> | null {
  const data = localStorage.getItem(STORAGE_KEYS.DOCUMENT_SESSION);
  return data ? JSON.parse(data) : null;
}

export function removeSession() {
  localStorage.removeItem(STORAGE_KEYS.DOCUMENT_SESSION);
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
  localStorage.setItem(STORAGE_KEYS.USER_CONSENT, JSON.stringify(consent));
}

export function loadUserConsent(): boolean {
  const data = localStorage.getItem(STORAGE_KEYS.USER_CONSENT);
  return data ? JSON.parse(data) : false;
}
