import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ServerMessage, ConnectionStatus } from '@/hooks/useWebSocket';

// Message types for the chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  type?: 'question' | 'answer' | 'error' | 'warning' | 'system';
  questionId?: string;
  answeredQuestionIds?: string[];
}

// Chat session state
export interface ChatSession {
  id: string | null;
  isActive: boolean;
  isComplete: boolean;
  documentId?: string;
  startedAt?: string;
  completedAt?: string;
}

// Chat store state
export interface ChatState {
  // Messages
  messages: ChatMessage[];
  
  // Loading states
  isLoading: boolean;
  isTyping: boolean;
  
  // Connection
  connectionStatus: ConnectionStatus;
  sessionId: string | null;
  
  // Session
  session: ChatSession;
  
  // UI state
  error: string | null;
  warning: string | null;
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSessionId: (sessionId: string | null) => void;
  setSession: (session: Partial<ChatSession>) => void;
  setError: (error: string | null) => void;
  setWarning: (warning: string | null) => void;
  handleServerMessage: (message: ServerMessage) => void;
  resetSession: () => void;
  completeSession: (documentId: string) => void;
}

// Generate unique message ID
const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create the chat store
export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      messages: [],
      isLoading: false,
      isTyping: false,
      connectionStatus: 'disconnected',
      sessionId: null,
      session: {
        id: null,
        isActive: false,
        isComplete: false,
      },
      error: null,
      warning: null,

      // Actions
      addMessage: (messageData) => {
        const message: ChatMessage = {
          id: generateMessageId(),
          timestamp: new Date().toISOString(),
          ...messageData,
        };

        set((state) => ({
          messages: [...state.messages, message],
          isLoading: false,
          isTyping: false,
          error: null, // Clear error when new message is added
        }));
      },

      updateLastMessage: (updates) => {
        set((state) => {
          if (state.messages.length === 0) return state;
          
          const updatedMessages = [...state.messages];
          const lastIndex = updatedMessages.length - 1;
          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            ...updates,
          };

          return { messages: updatedMessages };
        });
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setTyping: (typing) => {
        set({ isTyping: typing });
      },

      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },

      setSessionId: (sessionId) => {
        set({ sessionId });
      },

      setSession: (sessionUpdates) => {
        set((state) => ({
          session: { ...state.session, ...sessionUpdates },
        }));
      },

      setError: (error) => {
        set({ error });
      },

      setWarning: (warning) => {
        set({ warning });
      },

      handleServerMessage: (message: ServerMessage) => {
        const { addMessage, setSession, setError, setWarning, completeSession } = get();

        // Handle session ID
        if (message.sessionId && !get().sessionId) {
          get().setSessionId(message.sessionId);
        }

        switch (message.type) {
          case 'session_resumed':
            // Handle session resumption
            if (message.history) {
              const historyMessages: ChatMessage[] = message.history.map((msg) => ({
                id: generateMessageId(),
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp || new Date().toISOString(),
                type: msg.role === 'ai' ? 'question' : 'answer',
              }));
              
              set({ messages: historyMessages });
            }
            
            setSession({
              id: message.sessionId || null,
              isActive: true,
              isComplete: false,
            });
            break;

          case 'next_question':
            // Add AI question message
            if (message.question) {
              addMessage({
                role: 'ai',
                content: message.question.text,
                type: 'question',
                questionId: message.question.id,
                answeredQuestionIds: message.answeredQuestionIds,
              });
            }
            break;

          case 'session_complete':
            // Handle session completion
            if (message.documentId) {
              completeSession(message.documentId);
            }
            break;

          case 'error':
            setError(message.message || 'An error occurred');
            addMessage({
              role: 'ai',
              content: message.message || 'An error occurred',
              type: 'error',
            });
            break;

          case 'warning':
            setWarning(message.message || 'Warning');
            addMessage({
              role: 'ai',
              content: message.message || 'Warning',
              type: 'warning',
            });
            break;

          case 'guardrail_reprompt':
            addMessage({
              role: 'ai',
              content: message.message || 'Please provide more specific information.',
              type: 'warning',
            });
            break;

          case 'guardrail_exit':
            addMessage({
              role: 'ai',
              content: message.message || 'Session ended due to policy violation.',
              type: 'error',
            });
            setSession({ isActive: false, isComplete: true });
            break;
        }
      },

      resetSession: () => {
        set({
          messages: [],
          isLoading: false,
          isTyping: false,
          sessionId: null,
          session: {
            id: null,
            isActive: false,
            isComplete: false,
          },
          error: null,
          warning: null,
        });
      },

      completeSession: (documentId: string) => {
        set((state) => ({
          session: {
            ...state.session,
            isActive: false,
            isComplete: true,
            documentId,
            completedAt: new Date().toISOString(),
          },
          isLoading: false,
          isTyping: false,
        }));
      },
    }),
    {
      name: 'chat-store',
    }
  )
); 