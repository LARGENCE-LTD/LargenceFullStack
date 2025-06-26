/**
 * Document Context Provider
 *
 * Manages global state for document generation workflow using React Context and useReducer.
 * Provides centralized state management for AI conversation flow, document operations,
 * and user interactions throughout the application.
 *
 * Features:
 * - Session management for AI conversations
 * - Progress tracking and step navigation
 * - Document generation and editing state
 * - API integration with error handling
 * - Persistent state across component re-renders and page refreshes
 * - Document history and conversation management
 * - AI suggestions application functionality
 * - WebSocket-based document generation with missing info requests
 *
 * @author Largence Team
 * @version 2.0.0
 * @since 2025-01-01
 */

"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

/**
 * Initial Application State
 *
 * Defines the default state structure for the document generation workflow.
 * All state properties are initialized to their default values.
 */
const initialState = {
  // Current session
  sessionId: null,
  sessionStatus: "idle", // idle, started, missing_info, generating, completed, error

  // Document generation flow
  currentStep: "input", // input, missing_info, generating, completed
  originalPrompt: "",
  documentType: null,
  suggestedTitle: "",

  // Missing information handling
  missingInfoFields: [],
  missingInfoMessage: "",

  // Streaming document content
  streamingContent: "",
  isStreaming: false,

  // Progress tracking
  progress: {
    current: 0,
    total: 0,
  },

  // Generated document
  document: null,

  // UI state
  loading: false,
  error: null,

  // History and sidebar
  documentHistory: [],
  conversationHistory: [],
  showHistorySidebar: false,

  // Data privacy
  userConsentGiven: false,
};

/**
 * Action Types
 *
 * Constants for all possible actions that can be dispatched to the reducer.
 * Organized by functionality for better maintainability.
 */
const actionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",

  // Session actions
  START_SESSION: "START_SESSION",
  SET_SESSION_DATA: "SET_SESSION_DATA",
  UPDATE_PROGRESS: "UPDATE_PROGRESS",
  RESTORE_SESSION: "RESTORE_SESSION",

  // Missing info actions
  SET_MISSING_INFO: "SET_MISSING_INFO",
  CLEAR_MISSING_INFO: "CLEAR_MISSING_INFO",

  // Streaming actions
  SET_STREAMING_STATUS: "SET_STREAMING_STATUS",
  ADD_STREAMING_CHUNK: "ADD_STREAMING_CHUNK",
  SET_STREAMING_CONTENT: "SET_STREAMING_CONTENT",

  // Document actions
  SET_DOCUMENT: "SET_DOCUMENT",
  UPDATE_DOCUMENT: "UPDATE_DOCUMENT",

  // Step navigation
  SET_STEP: "SET_STEP",

  // History management
  ADD_TO_HISTORY: "ADD_TO_HISTORY",
  SET_DOCUMENT_HISTORY: "SET_DOCUMENT_HISTORY",
  SET_CONVERSATION_HISTORY: "SET_CONVERSATION_HISTORY",
  TOGGLE_HISTORY_SIDEBAR: "TOGGLE_HISTORY_SIDEBAR",

  // Data privacy
  SET_USER_CONSENT: "SET_USER_CONSENT",

  // Reset state
  RESET_SESSION: "RESET_SESSION",
};

/**
 * Document State Reducer
 *
 * Pure function that handles all state updates based on dispatched actions.
 * Implements immutable state updates following Redux patterns.
 *
 * @param {Object} state - Current application state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state object
 */
const documentReducer = (state, action) => {
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
        currentStep: "input",
        originalPrompt: action.payload.originalPrompt,
        documentType: action.payload.documentType,
        suggestedTitle: action.payload.suggestedTitle,
        streamingContent: "",
        isStreaming: false,
        missingInfoFields: [],
        missingInfoMessage: "",
        loading: false,
        error: null,
      };

    case actionTypes.SET_MISSING_INFO:
      return {
        ...state,
        sessionStatus: "missing_info",
        currentStep: "missing_info",
        missingInfoFields: action.payload.fields,
        missingInfoMessage: action.payload.message,
        loading: false,
      };

    case actionTypes.SET_STEP:
      return {
        ...state,
        currentStep: action.payload,
      };

    case actionTypes.CLEAR_MISSING_INFO:
      return {
        ...state,
        missingInfoFields: [],
        missingInfoMessage: "",
      };

    case actionTypes.SET_STREAMING_STATUS:
      return {
        ...state,
        isStreaming: action.payload.isStreaming,
        sessionStatus: action.payload.isStreaming
          ? "generating"
          : state.sessionStatus,
        currentStep: action.payload.isStreaming
          ? "generating"
          : state.currentStep,
      };

    case actionTypes.ADD_STREAMING_CHUNK:
      return {
        ...state,
        streamingContent: state.streamingContent + action.payload,
      };

    case actionTypes.SET_STREAMING_CONTENT:
      return {
        ...state,
        streamingContent: action.payload,
      };

    case actionTypes.RESTORE_SESSION:
      return {
        ...state,
        ...action.payload,
        loading: false,
      };

    case actionTypes.SET_SESSION_DATA:
      return {
        ...state,
        ...action.payload,
        loading: false,
      };

    case actionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        progress: action.payload,
      };

    case actionTypes.SET_DOCUMENT:
      return {
        ...state,
        document: action.payload,
        currentStep: "completed",
        sessionStatus: "completed",
        streamingContent: action.payload.content || state.streamingContent,
        isStreaming: false,
        loading: false,
      };

    case actionTypes.UPDATE_DOCUMENT:
      return {
        ...state,
        document: {
          ...state.document,
          ...action.payload,
        },
      };

    case actionTypes.SET_STEP:
      return {
        ...state,
        currentStep: action.payload,
      };

    case actionTypes.ADD_TO_HISTORY:
      return {
        ...state,
        documentHistory: [
          action.payload,
          ...state.documentHistory.slice(0, 19),
        ],
      };

    case actionTypes.SET_DOCUMENT_HISTORY:
      return {
        ...state,
        documentHistory: action.payload,
      };

    case actionTypes.SET_CONVERSATION_HISTORY:
      return {
        ...state,
        conversationHistory: action.payload,
      };

    case actionTypes.TOGGLE_HISTORY_SIDEBAR:
      return {
        ...state,
        showHistorySidebar: !state.showHistorySidebar,
      };

    case actionTypes.SET_USER_CONSENT:
      return {
        ...state,
        userConsentGiven: action.payload,
      };

    case actionTypes.RESET_SESSION:
      return {
        ...initialState,
        documentTypes: state.documentTypes,
        documentHistory: state.userConsentGiven ? state.documentHistory : [],
        conversationHistory: state.userConsentGiven
          ? state.conversationHistory
          : [],
        userConsentGiven: state.userConsentGiven,
      };

    default:
      return state;
  }
};

/**
 * Local Storage Keys
 */
const STORAGE_KEYS = {
  CURRENT_SESSION: "current_session",
  DOCUMENT_HISTORY: "document_history",
  CONVERSATION_HISTORY: "conversation_history",
};

/**
 * Document Context
 *
 * React context for sharing document state and actions across components.
 * Provides access to the current state and dispatch function.
 */
const DocumentContext = createContext();

/**
 * Document Provider Component
 *
 * Wraps the application with document context and provides state management.
 * Initializes the reducer and loads necessary data on mount.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Provider component with context value
 */
export const DocumentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        // Load current session
        const savedSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          // Only restore if user had given consent
          if (sessionData.userConsentGiven) {
            dispatch({
              type: actionTypes.RESTORE_SESSION,
              payload: sessionData,
            });
          }
        }

        // Load document history
        const savedHistory = localStorage.getItem(
          STORAGE_KEYS.DOCUMENT_HISTORY
        );
        if (savedHistory) {
          const historyData = JSON.parse(savedHistory);
          dispatch({
            type: actionTypes.SET_DOCUMENT_HISTORY,
            payload: historyData,
          });
        }

        // Load conversation history
        const savedConversations = localStorage.getItem(
          STORAGE_KEYS.CONVERSATION_HISTORY
        );
        if (savedConversations) {
          const conversationData = JSON.parse(savedConversations);
          dispatch({
            type: actionTypes.SET_CONVERSATION_HISTORY,
            payload: conversationData,
          });
        }
      } catch (error) {
        console.warn("Failed to load persisted state:", error);
      }
    };

    loadPersistedState();
  }, []);

  // Persist state changes (only if user has given consent)
  useEffect(() => {
    if (state.userConsentGiven && (state.sessionId || state.document)) {
      try {
        const sessionData = {
          sessionId: state.sessionId,
          sessionStatus: state.sessionStatus,
          currentStep: state.currentStep,
          originalPrompt: state.originalPrompt,
          documentType: state.documentType,
          documentTypeName: state.documentTypeName,
          suggestedTitle: state.suggestedTitle,
          streamingContent: state.streamingContent,
          isStreaming: state.isStreaming,
          missingInfoFields: state.missingInfoFields,
          missingInfoMessage: state.missingInfoMessage,
          providedInfo: state.providedInfo,
          progress: state.progress,
          document: state.document,
          userConsentGiven: state.userConsentGiven,
        };
        localStorage.setItem(
          STORAGE_KEYS.CURRENT_SESSION,
          JSON.stringify(sessionData)
        );
      } catch (error) {
        console.warn("Failed to persist session state:", error);
      }
    }
  }, [state, state.userConsentGiven]);

  // Persist history changes (only if user has given consent)
  useEffect(() => {
    if (state.userConsentGiven) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.DOCUMENT_HISTORY,
          JSON.stringify(state.documentHistory)
        );
      } catch (error) {
        console.warn("Failed to persist document history:", error);
      }
    }
  }, [state.documentHistory, state.userConsentGiven]);

  useEffect(() => {
    if (state.userConsentGiven) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.CONVERSATION_HISTORY,
          JSON.stringify(state.conversationHistory)
        );
      } catch (error) {
        console.warn("Failed to persist conversation history:", error);
      }
    }
  }, [state.conversationHistory, state.userConsentGiven]);

  // Load document types on mount
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const response = await documentAPI.getDocumentTypes();
        dispatch({
          type: actionTypes.SET_DOCUMENT_TYPES,
          payload: response.data,
        });
      } catch (error) {
        console.warn(
          "Failed to load document types (this is optional):",
          error
        );
        // Set a default set of document types if the backend endpoint is not available
        dispatch({
          type: actionTypes.SET_DOCUMENT_TYPES,
          payload: {
            documentTypes: {
              nda: "Non-Disclosure Agreement",
              employment_contract: "Employment Contract",
              service_agreement: "Service Agreement",
              lease_agreement: "Lease Agreement",
              partnership_agreement: "Partnership Agreement",
            },
            exportFormats: [
              { format: "pdf", name: "PDF Document" },
              { format: "word", name: "Word Document" },
            ],
          },
        });
      }
    };

    if (!state.documentTypes) {
      loadDocumentTypes();
    }
  }, [state.documentTypes]);

  // Actions
  const actions = {
    // Start document generation
    startGeneration: async (prompt) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });

      try {
        const response = await documentAPI.startGeneration(prompt, {
          onMissingInfoRequest: (fields, message) => {
            console.log("Missing info request received:", { fields, message });
            dispatch({
              type: actionTypes.SET_MISSING_INFO,
              payload: { fields, message },
            });
          },

          onChunk: (chunk) => {
            dispatch({
              type: actionTypes.ADD_STREAMING_CHUNK,
              payload: chunk,
            });
          },

          onDocumentComplete: (fullDocument) => {
            dispatch({
              type: actionTypes.SET_DOCUMENT,
              payload: {
                id: `doc_${Date.now()}`,
                title: state.suggestedTitle || "Generated Document",
                content: fullDocument,
                createdAt: new Date().toISOString(),
              },
            });

            // Add to document history
            const historyEntry = {
              id: `doc_${Date.now()}`,
              title: state.suggestedTitle || "Generated Document",
              documentType: state.documentTypeName,
              createdAt: new Date().toISOString(),
              content: fullDocument,
              sessionId: state.sessionId,
            };

            dispatch({
              type: actionTypes.ADD_TO_HISTORY,
              payload: historyEntry,
            });
          },

          onStreaming: ({ isStreaming, status, message }) => {
            dispatch({
              type: actionTypes.SET_STREAMING_STATUS,
              payload: { isStreaming, status, message },
            });
          },

          onError: (error) => {
            dispatch({
              type: actionTypes.SET_ERROR,
              payload: error,
            });
          },
        });

        const sessionData = {
          sessionId: response.data.sessionId,
          originalPrompt: prompt,
          documentType: response.data.documentType,
          suggestedTitle: response.data.suggestedTitle,
          missingInfoFields: [],
          progress: response.data.progress,
        };

        dispatch({
          type: actionTypes.START_SESSION,
          payload: sessionData,
        });

        // Add to conversation history
        const conversationEntry = {
          id: response.data.sessionId,
          prompt: prompt,
          documentType: response.data.documentTypeName,
          timestamp: new Date().toISOString(),
          status: "active",
          streamingContent: "",
          isStreaming: false,
          missingInfoFields: [],
        };

        dispatch({
          type: actionTypes.SET_CONVERSATION_HISTORY,
          payload: [
            conversationEntry,
            ...state.conversationHistory.slice(0, 19),
          ],
        });

        return response.data;
      } catch (error) {
        const errorMessage = handleAPIError(error);
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    // Send missing information response
    sendMissingInfoResponse: async (providedInfo, userDeclined = false) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });

      try {
        // Update local state with provided info
        if (!userDeclined) {
          dispatch({
            type: actionTypes.UPDATE_MISSING_INFO,
            payload: providedInfo,
          });
        }

        // Send response to backend
        await documentAPI.sendMissingInfoResponse(providedInfo, userDeclined);

        // Clear missing info state and continue with generation
        dispatch({
          type: actionTypes.CLEAR_MISSING_INFO,
        });

        dispatch({
          type: actionTypes.SET_STREAMING_STATUS,
          payload: {
            isStreaming: true,
            status: "generating",
            message: "Generating document...",
          },
        });

        return { success: true };
      } catch (error) {
        const errorMessage = handleAPIError(error);
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    },

    // Get session status
    getSessionStatus: async (sessionId) => {
      try {
        const response = await documentAPI.getSessionStatus(sessionId);

        dispatch({
          type: actionTypes.SET_SESSION_DATA,
          payload: {
            sessionStatus: response.data.status,
            currentStep: response.data.currentStep,
            progress: response.data.progress,
            document: response.data.document,
          },
        });

        return response.data;
      } catch (error) {
        const errorMessage = handleAPIError(error);
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    // Export document
    exportDocument: async (documentId, format) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        const response = await documentAPI.exportDocument(documentId, format);
        return response.data;
      } catch (error) {
        const errorMessage = handleAPIError(error);
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    },

    // Save data preference
    saveDataPreference: async (documentId, saveData) => {
      try {
        // Set user consent
        dispatch({
          type: actionTypes.SET_USER_CONSENT,
          payload: saveData,
        });

        // If user consents, save current session and history to localStorage
        if (saveData) {
          // Save current session
          const sessionData = {
            sessionId: state.sessionId,
            sessionStatus: state.sessionStatus,
            currentStep: state.currentStep,
            originalPrompt: state.originalPrompt,
            documentType: state.documentType,
            documentTypeName: state.documentTypeName,
            suggestedTitle: state.suggestedTitle,
            streamingContent: state.streamingContent,
            isStreaming: state.isStreaming,
            missingInfoFields: state.missingInfoFields,
            missingInfoMessage: state.missingInfoMessage,
            providedInfo: state.providedInfo,
            progress: state.progress,
            document: state.document,
            userConsentGiven: true,
          };
          localStorage.setItem(
            STORAGE_KEYS.CURRENT_SESSION,
            JSON.stringify(sessionData)
          );
          localStorage.setItem(
            STORAGE_KEYS.DOCUMENT_HISTORY,
            JSON.stringify(state.documentHistory)
          );
          localStorage.setItem(
            STORAGE_KEYS.CONVERSATION_HISTORY,
            JSON.stringify(state.conversationHistory)
          );
        }

        const response = await documentAPI.saveDataPreference(
          documentId,
          saveData
        );
        return response.data;
      } catch (error) {
        const errorMessage = handleAPIError(error);
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    // Load document from history
    loadDocumentFromHistory: (historyEntry) => {
      dispatch({
        type: actionTypes.RESTORE_SESSION,
        payload: {
          sessionId: historyEntry.sessionId,
          currentStep: "preview",
          sessionStatus: "completed",
          documentType: historyEntry.documentType,
          documentTypeName: historyEntry.documentType,
          document: {
            id: historyEntry.id,
            title: historyEntry.title,
            content: historyEntry.content,
          },
        },
      });
    },

    // Load conversation from history
    loadConversationFromHistory: (conversationEntry) => {
      dispatch({
        type: actionTypes.RESTORE_SESSION,
        payload: {
          sessionId: conversationEntry.id,
          currentStep: "conversation_view",
          sessionStatus: conversationEntry.status,
          originalPrompt: conversationEntry.prompt,
          documentType: conversationEntry.documentType,
          documentTypeName: conversationEntry.documentType,
          streamingContent: conversationEntry.streamingContent,
          isStreaming: conversationEntry.isStreaming,
          missingInfoFields: conversationEntry.missingInfoFields,
          missingInfoMessage: conversationEntry.missingInfoMessage,
          providedInfo: conversationEntry.providedInfo,
          questions: conversationEntry.questions || [],
          answers: conversationEntry.answers || {},
          conversationData: conversationEntry,
        },
      });
    },

    // Navigation actions
    setStep: (step) => {
      dispatch({ type: actionTypes.SET_STEP, payload: step });
    },

    // History sidebar
    toggleHistorySidebar: () => {
      dispatch({ type: actionTypes.TOGGLE_HISTORY_SIDEBAR });
    },

    // Reset session
    resetSession: () => {
      dispatch({ type: actionTypes.RESET_SESSION });
      // Clear persisted session
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    },

    // Clear error
    clearError: () => {
      dispatch({ type: actionTypes.CLEAR_ERROR });
    },
  };

  return (
    <DocumentContext.Provider value={{ state, actions }}>
      {children}
    </DocumentContext.Provider>
  );
};

// Hook to use the document context
export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
};
