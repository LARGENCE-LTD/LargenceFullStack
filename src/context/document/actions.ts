import {Dispatch} from "react";
import {DocAPI} from "./docAPI";
import {actionTypes, DocumentAction} from "./reducer";
import {ConversationHistoryEntry, DocumentHistoryEntry, ProvidedField, State} from "./state";
import {loadHistory, loadSession} from "./utils";

// The main actions hook/factory
export function useDocumentActions(state: State, dispatch: Dispatch<DocumentAction>) {
  // Start a new document generation session
  const startSession = async (prompt: string, documentType: string, suggestedTitle: string) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.SET_ERROR, payload: "" });

    try {
      // DocAPI call to backend to start a new session
      const response = await DocAPI.startSession(prompt, documentType);

      dispatch({ type: actionTypes.START_SESSION, payload: { sessionId: response.sessionId } });
      dispatch({ type: actionTypes.SET_SESSION_STATUS, payload: "generating" });
      dispatch({ type: actionTypes.SET_ORIGINAL_PROMPT, payload: prompt });
      dispatch({ type: actionTypes.SET_DOCUMENT_TYPE, payload: documentType });
      dispatch({ type: actionTypes.SET_SUGGESTED_TITLE, payload: suggestedTitle });

      // If streaming, handle separately in UI
      // You could trigger startStreaming here if desired

    } catch (error: unknown) {
      let errorMessage = "Failed to start session";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
    }
  };

  // Provide missing data to backend
  const submitMissingData = async (sessionId: string, providedData: ProvidedField[]) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      // DocAPI call to submit missing fields
      const response = await DocAPI.submitMissingData(sessionId, providedData);

      // Update missing data or mark as generating again
      if (response.missingData && response.missingData.fields.length > 0) {
        dispatch({ type: actionTypes.SET_MISSING_DATA, payload: response.missingData });
        dispatch({ type: actionTypes.SET_SESSION_STATUS, payload: "missing_info" });
      } else {
        dispatch({ type: actionTypes.SET_SESSION_STATUS, payload: "generating" });
      }
      dispatch({ type: actionTypes.SET_PROVIDED_DATA, payload: providedData });

    } catch (error: unknown) {
      let errorMessage = "Failed to submit missing data";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
      dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Stream document content as it's generated
  const startStreaming = async (sessionId: string) => {
    dispatch({ type: actionTypes.SET_STREAMING_STATUS, payload: true });

    try {
      await DocAPI.streamDocument(
        sessionId,
        (chunk: string) => {
          dispatch({ type: actionTypes.ADD_STREAMING_CHUNK, payload: chunk });
        },
        (finalContent: string) => {
          dispatch({ type: actionTypes.SET_DOCUMENT_CONTENT, payload: finalContent });
          dispatch({ type: actionTypes.SET_SESSION_STATUS, payload: "completed" });

          // add to history
          const historyEntry: DocumentHistoryEntry = {
            id: `doc_${Date.now()}`,
            title: state.suggestedTitle || "Generated Document",
            documentType: state.documentType || "",
            content: finalContent,
            createdAt: new Date().toISOString()
          };
          dispatch({ type: actionTypes.ADD_TO_DOCUMENT_HISTORY, payload: historyEntry });

          // Add conversation history
          const conversationEntry: ConversationHistoryEntry = {
            prompt: state.originalPrompt,
            missingData: state.missingData,
            providedData: state.providedData,
            documentContent: finalContent,
            createdAt: new Date().toISOString()
          };
          dispatch({ type: actionTypes.ADD_TO_CONVERSATION_HISTORY, payload: conversationEntry });
        },
        (progress: { current: number; total: number }) => {
          dispatch({ type: actionTypes.UPDATE_PROGRESS, payload: progress });
        },
        (error: string) => {
          dispatch({ type: actionTypes.SET_ERROR, payload: error });
        }
      );
    } catch (error: unknown) {
      let errorMessage = "Failed to stream document";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
      dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
    } finally {
      dispatch({ type: actionTypes.SET_STREAMING_STATUS, payload: false });
    }
  };

  // Export document (PDF, Word, etc.)
  const exportDocument = async (documentId: string, format: string) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    try {
      //TODO: Implement: show download link, save file, etc.
      return await DocAPI.exportDocument(documentId, format);
    } catch (error: unknown) {
        let errorMessage = "Failed to export document";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
      dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Set user data persistence consent
  const setUserConsent = (consent: boolean) => {
    dispatch({ type: actionTypes.SET_USER_CONSENT, payload: consent });
    // Optionally: call localStorageUtils to save consent flag
  };

  // Load persisted session/history from localStorage (if allowed)
  const loadPersistedState = () => {
    if (!state.userConsentGiven) return;
    const session = loadSession();
    const history = loadHistory();
    if (session) dispatch({ type: actionTypes.RESET_SESSION }); // or a restore-session action
    if (history) dispatch({ type: actionTypes.SET_DOCUMENT_HISTORY, payload: history });
  };

  // Reset current session (but keep history)
  const resetSession = () => {
    dispatch({ type: actionTypes.RESET_SESSION });
    // Optionally clear persisted session from localStorageUtils
  };

  // Clear errors
  const clearError = () => dispatch({ type: actionTypes.CLEAR_ERROR });

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
  };
}
