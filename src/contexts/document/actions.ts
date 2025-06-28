import {Dispatch} from "react";
import {DocAPI} from "./docAPI";
import {DocumentAction, ProvidedField, State} from "./state";
import {DOCUMENT_ACTION_TYPES} from "./constants";
import {loadHistory, loadSession} from "./utils";

// The main actions hook/factory
export function useDocumentActions(state: State, dispatch: Dispatch<DocumentAction>) {
  // Start a new document generation session
  const startSession = async (prompt: string, documentType: string, suggestedTitle: string) => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: "" });

    try {
      // DocAPI call to backend to start a new session
      const response = await DocAPI.startSession(prompt, documentType);

      dispatch({ type: DOCUMENT_ACTION_TYPES.START_SESSION, payload: { sessionId: response.sessionId } });
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS, payload: "generating" });
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ORIGINAL_PROMPT, payload: prompt });
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_DOCUMENT_TYPE, payload: documentType });
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_SUGGESTED_TITLE, payload: suggestedTitle });

      // If streaming, handle separately in UI
      // You could trigger startStreaming here if desired

    } catch (error: unknown) {
      let errorMessage = "Failed to start session";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: errorMessage });
    }
  };

  // Provide missing data to backend
  const submitMissingData = async (sessionId: string, providedData: ProvidedField[]) => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: DOCUMENT_ACTION_TYPES.CLEAR_ERROR });

    try {
      // DocAPI call to submit missing fields
      const response = await DocAPI.submitMissingData(sessionId, providedData);

      // Update missing data or mark as generating again
      if (response.missingData && response.missingData.fields.length > 0) {
        dispatch({ type: DOCUMENT_ACTION_TYPES.SET_MISSING_DATA, payload: response.missingData });
        dispatch({ type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS, payload: "missing_info" });
      } else {
        dispatch({ type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS, payload: "generating" });
      }
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_PROVIDED_DATA, payload: providedData });

    } catch (error: unknown) {
      let errorMessage = "Failed to submit missing data";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: errorMessage });
    } finally {
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Stream document content as it's generated
  const startStreaming = async (sessionId: string) => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS, payload: true });

    try {
      await DocAPI.streamDocument(
        sessionId,
        (chunk: string) => {
          dispatch({ type: DOCUMENT_ACTION_TYPES.ADD_STREAMING_CHUNK, payload: chunk });
        },
        (finalContent: string) => {
          dispatch({ type: DOCUMENT_ACTION_TYPES.SET_DOCUMENT_CONTENT, payload: finalContent });
          dispatch({ type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS, payload: "completed" });

          // add to history
          const historyEntry = {
            id: `doc_${Date.now()}`,
            title: state.suggestedTitle || "Generated Document",
            documentType: state.documentType || "",
            content: finalContent,
            createdAt: new Date().toISOString()
          };
          dispatch({ type: DOCUMENT_ACTION_TYPES.ADD_TO_DOCUMENT_HISTORY, payload: historyEntry });

          // Add conversation history
          const conversationEntry = {
            prompt: state.originalPrompt,
            missingData: state.missingData,
            providedData: state.providedData,
            documentContent: finalContent,
            createdAt: new Date().toISOString()
          };
          dispatch({ type: DOCUMENT_ACTION_TYPES.ADD_TO_CONVERSATION_HISTORY, payload: conversationEntry });
        },
        (progress: { current: number; total: number }) => {
          dispatch({ type: DOCUMENT_ACTION_TYPES.UPDATE_PROGRESS, payload: progress });
        },
        (error: string) => {
          dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: error });
        }
      );
    } catch (error: unknown) {
      let errorMessage = "Failed to stream document";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: errorMessage });
    } finally {
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS, payload: false });
    }
  };

  // Export document (PDF, Word, etc.)
  const exportDocument = async (documentId: string, format: string) => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: true });
    try {
      //TODO: Implement: show download link, save file, etc.
      return await DocAPI.exportDocument(documentId, format);
    } catch (error: unknown) {
        let errorMessage = "Failed to export document";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Set user data persistence consent
  const setUserConsent = (consent: boolean) => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_USER_CONSENT, payload: consent });
    // Optionally: call localStorageUtils to save consent flag
  };

  // Load persisted session/history from localStorage (if allowed)
  const loadPersistedState = () => {
    if (!state.userConsentGiven) return;
    const session = loadSession();
    const history = loadHistory();
    if (session) dispatch({ type: DOCUMENT_ACTION_TYPES.RESET_SESSION }); // or a restore-session action
    if (history) dispatch({ type: DOCUMENT_ACTION_TYPES.SET_DOCUMENT_HISTORY, payload: history });
  };

  // Reset current session (but keep history)
  const resetSession = () => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.RESET_SESSION });
    // Optionally clear persisted session from localStorageUtils
  };

  // Clear errors
  const clearError = () => dispatch({ type: DOCUMENT_ACTION_TYPES.CLEAR_ERROR });

  // Load document from history
  const loadDocumentFromHistory = (documentId: string) => {
    const document = state.documentHistory.find(doc => doc.id === documentId);
    if (document) {
      dispatch({ type: DOCUMENT_ACTION_TYPES.LOAD_DOCUMENT_FROM_HISTORY, payload: document });
    } else {
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: "Document not found in history" });
    }
  };

  // Expose all actions to the provider
  return {
    startSession,
    submitMissingData,
    startStreaming,
    exportDocument,
    setUserConsent,
    loadPersistedState,
    resetSession,
    clearError,
    loadDocumentFromHistory,
  };
}
