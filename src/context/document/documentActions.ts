import { Dispatch } from "react";
import { DocumentState, ProvidedField, MissingData, DocumentHistoryEntry, ConversationHistoryEntry } from "./documentState";
import { DocumentAction, actionTypes } from "./documentReducer";
import { documentAPI } from "./documentAPI";
import { saveSession, loadSession, saveHistory, loadHistory } from "./localStorageUtils";

// The main actions hook/factory
export function useDocumentActions(state: DocumentState, dispatch: Dispatch<DocumentAction>) {
  // Start a new document generation session
  const startSession = async (prompt: string, documentType: string, suggestedTitle: string) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.SET_ERROR, payload: "" });

    try {
      // API call to backend to start a new session
      const response = await documentAPI.startSession(prompt, documentType);

      dispatch({ type: actionTypes.START_SESSION, payload: { sessionId: response.sessionId } });
      dispatch({ type: actionTypes.SET_SESSION_STATUS, payload: "generating" });
      dispatch({ type: actionTypes.SET_ORIGINAL_PROMPT, payload: prompt });
      dispatch({ type: actionTypes.SET_DOCUMENT_TYPE, payload: documentType });
      dispatch({ type: actionTypes.SET_SUGGESTED_TITLE, payload: suggestedTitle });

      // If streaming, handle separately in UI
      // You could trigger startStreaming here if desired

    } catch (error: any) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || "Failed to start session" });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Provide missing data to backend
  const submitMissingData = async (sessionId: string, providedData: ProvidedField[]) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    dispatch({ type: actionTypes.CLEAR_ERROR });

    try {
      // API call to submit missing fields
      const response = await documentAPI.submitMissingData(sessionId, providedData);

      // Update missing data or mark as generating again
      if (response.missingData && response.missingData.fields.length > 0) {
        dispatch({ type: actionTypes.SET_MISSING_DATA, payload: response.missingData });
        dispatch({ type: actionTypes.SET_SESSION_STATUS, payload: "missing_info" });
      } else {
        dispatch({ type: actionTypes.SET_SESSION_STATUS, payload: "generating" });
      }
      dispatch({ type: actionTypes.SET_PROVIDED_DATA, payload: providedData });

    } catch (error: any) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || "Failed to submit missing data" });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Stream document content as it's generated
  const startStreaming = async (sessionId: string) => {
    dispatch({ type: actionTypes.SET_STREAMING_STATUS, payload: true });

    try {
      await documentAPI.streamDocument(
        sessionId,
        (chunk: string) => {
          dispatch({ type: actionTypes.ADD_STREAMING_CHUNK, payload: chunk });
        },
        (finalContent: string) => {
          dispatch({ type: actionTypes.SET_DOCUMENT_CONTENT, payload: finalContent });
          dispatch({ type: actionTypes.SET_SESSION_STATUS, payload: "completed" });

          // Optionally, add to history
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
    } catch (error: any) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || "Failed to stream document" });
    } finally {
      dispatch({ type: actionTypes.SET_STREAMING_STATUS, payload: false });
    }
  };

  // Export document (PDF, Word, etc.)
  const exportDocument = async (documentId: string, format: string) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    try {
      const response = await documentAPI.exportDocument(documentId, format);
      // Implement: show download link, save file, etc.
      return response;
    } catch (error: any) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message || "Export failed" });
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
