import { Dispatch } from "react";
import { DocAPI } from "./docAPI";
import { DocumentAction, ProvidedField, State } from "./state";
import { DOCUMENT_ACTION_TYPES } from "./constants";
import { loadHistory, loadSession } from "./utils";
import { type DocumentType } from "./constants";

// The main actions hook/factory
export function useDocumentActions(
  state: State,
  dispatch: Dispatch<DocumentAction>
) {
  // Start a new document generation session
  const startSession = async (
    prompt: string,
    documentType: DocumentType,
    suggestedTitle: string
  ) => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: "" });

    try {
      // Start WebSocket connection and send document request
      const response = await DocAPI.startSession(prompt, documentType);

      dispatch({
        type: DOCUMENT_ACTION_TYPES.START_SESSION,
        payload: { sessionId: response.sessionId },
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
        payload: "starting",
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_ORIGINAL_PROMPT,
        payload: prompt,
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_DOCUMENT_TYPE,
        payload: documentType,
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SUGGESTED_TITLE,
        payload: suggestedTitle,
      });

      // Start streaming immediately after session starts
      await startStreaming(response.sessionId);
    } catch (error: unknown) {
      let errorMessage = "Failed to start session";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
        payload: "error",
      });
    } finally {
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Provide missing data to backend
  const submitMissingData = async (
    sessionId: string,
    providedData: ProvidedField[],
    userDeclined?: boolean
  ) => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: DOCUMENT_ACTION_TYPES.CLEAR_ERROR });

    try {
      // Send missing data via WebSocket
      await DocAPI.submitMissingData(sessionId, providedData, userDeclined);

      // Update state with provided data
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_PROVIDED_DATA,
        payload: providedData,
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
        payload: "generating",
      });

      // Clear missing data since we've provided it
      dispatch({ type: DOCUMENT_ACTION_TYPES.CLEAR_MISSING_DATA });
    } catch (error: unknown) {
      let errorMessage = "Failed to submit missing data";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
        payload: "error",
      });
    } finally {
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Stream document content as it's generated
  const startStreaming = async (sessionId: string) => {
    dispatch({
      type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
      payload: "generating",
    });

    try {
      await DocAPI.streamDocument(
        sessionId,
        // onChunk callback - Set isStreaming to true on first chunk
        (chunk: string) => {
          // Set isStreaming to true on first chunk received
          if (!state.isStreaming) {
            dispatch({
              type: DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS,
              payload: true,
            });
          }
          dispatch({
            type: DOCUMENT_ACTION_TYPES.ADD_STREAMING_CHUNK,
            payload: chunk,
          });
        },
        // onComplete callback
        (finalContent: string) => {
          dispatch({
            type: DOCUMENT_ACTION_TYPES.SET_DOCUMENT_CONTENT,
            payload: finalContent,
          });
          dispatch({
            type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
            payload: "completed",
          });
          dispatch({
            type: DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS,
            payload: false,
          });

          // Create a single comprehensive document session entry
          const documentSession = {
            id: `doc_${Date.now()}`,
            title: state.suggestedTitle || "Generated Document",
            documentType: state.documentType || "general_contract",
            content: finalContent,
            createdAt: new Date().toISOString(),
            originalPrompt: state.originalPrompt,
            missingData: state.missingData,
            providedData: state.providedData,
            sessionId: state.sessionId,
            status: "completed" as const,
            lastModified: new Date().toISOString(),
          };
          dispatch({
            type: DOCUMENT_ACTION_TYPES.ADD_TO_DOCUMENT_HISTORY,
            payload: documentSession,
          });
        },
        // onProgress callback (not used in current WebSocket flow)
        (progress: { current: number; total: number }) => {
          dispatch({
            type: DOCUMENT_ACTION_TYPES.UPDATE_PROGRESS,
            payload: progress,
          });
        },
        // onError callback
        (error: string) => {
          dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: error });
          dispatch({
            type: DOCUMENT_ACTION_TYPES.RESET_SESSION,
          });
          dispatch({
            type: DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS,
            payload: false,
          });
        },
        // onMissingInfo callback
        (
          fields: Array<{
            field: string;
            explanation: string;
            example: string;
          }>,
          message: string
        ) => {
          dispatch({
            type: DOCUMENT_ACTION_TYPES.SET_MISSING_DATA,
            payload: { fields, message },
          });
          dispatch({
            type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
            payload: "missing_info",
          });
          dispatch({
            type: DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS,
            payload: false,
          });
        }
      );
    } catch (error: unknown) {
      let errorMessage = "Failed to stream document";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
        payload: "error",
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_STREAMING_STATUS,
        payload: false,
      });
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
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });
      throw error;
    } finally {
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Set user data persistence consent
  const setUserConsent = (consent: boolean) => {
    dispatch({
      type: DOCUMENT_ACTION_TYPES.SET_USER_CONSENT,
      payload: consent,
    });
    // Optionally: call localStorageUtils to save consent flag
  };

  // Load persisted session/history from localStorage (if allowed)
  const loadPersistedState = () => {
    if (!state.userConsentGiven) return;
    const session = loadSession();
    // TODO: Update loadHistory to return DocumentSession[] instead of DocumentHistoryEntry[]
    // const history = loadHistory();
    if (session) dispatch({ type: DOCUMENT_ACTION_TYPES.RESET_SESSION }); // or a restore-session action
    // if (history) dispatch({ type: DOCUMENT_ACTION_TYPES.SET_DOCUMENT_HISTORY, payload: history });
  };

  // Reset current session (but keep history)
  const resetSession = () => {
    // Disconnect WebSocket if connected
    DocAPI.disconnect();

    dispatch({ type: DOCUMENT_ACTION_TYPES.RESET_SESSION });
    // Optionally clear persisted session from localStorageUtils
  };

  // Clear errors
  const clearError = () =>
    dispatch({ type: DOCUMENT_ACTION_TYPES.CLEAR_ERROR });

  // Load document from history
  const loadDocumentFromHistory = (documentId: string) => {
    const document = state.documentSessions.find(
      (doc) => doc.id === documentId
    );
    if (document) {
      dispatch({
        type: DOCUMENT_ACTION_TYPES.LOAD_DOCUMENT_FROM_HISTORY,
        payload: document,
      });
    } else {
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_ERROR,
        payload: "Document not found in history",
      });
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
