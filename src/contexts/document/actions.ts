import { Dispatch } from "react";
import { DocAPI, WizardAPI } from "./docAPI";
import { DocumentAction, ProvidedField, State, WizardQuestion, WizardAnswer } from "./state";
import { DOCUMENT_ACTION_TYPES } from "./constants";
import { loadHistory, loadSession } from "./utils";
import { type DocumentType } from "./constants";

// The main actions hook/factory
export function useDocumentActions(
  state: State,
  dispatch: Dispatch<DocumentAction>
) {
  // Start a new document generation session (legacy)
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

  // Start a new wizard session
  const startWizardSession = async (templateId: string) => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: true });
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_ERROR, payload: "" });
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_WIZARD_MODE, payload: true });

    try {
      // Start wizard WebSocket connection
      const response = await WizardAPI.startWizardSession(templateId);

      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_WIZARD_SESSION,
        payload: { sessionId: response.sessionId },
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
        payload: "starting",
      });

      // Set up wizard message handlers
      setupWizardHandlers();
    } catch (error: unknown) {
      let errorMessage = "Failed to start wizard session";
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

  // Set up wizard message handlers
  const setupWizardHandlers = () => {
    WizardAPI.onNextQuestion((question: WizardQuestion) => {
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_CURRENT_QUESTION,
        payload: question,
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.UPDATE_WIZARD_PROGRESS,
        payload: { current: question.fieldNumber - 1, total: question.totalFields },
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
        payload: "missing_info",
      });
    });

    WizardAPI.onSessionResumed((data: any) => {
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_WIZARD_SESSION,
        payload: { sessionId: data.sessionId },
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.UPDATE_WIZARD_PROGRESS,
        payload: { current: data.currentQuestionIndex, total: data.answerHistory.length + 1 },
      });
      // Restore answers to state
      data.answerHistory.forEach((answer: any) => {
        dispatch({
          type: DOCUMENT_ACTION_TYPES.ADD_WIZARD_ANSWER,
          payload: {
            questionId: answer.questionId,
            answer: answer.answer,
            timestamp: answer.timestamp,
          },
        });
      });
    });

    WizardAPI.onGenerationComplete((data: any) => {
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_DOCUMENT_CONTENT,
        payload: `Document generated with ID: ${data.documentId}`,
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
        payload: "completed",
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_WIZARD_MODE,
        payload: false,
      });

      // Create document session entry
      const documentSession = {
        id: data.documentId,
        title: state.suggestedTitle || "Generated Document",
        documentType: state.documentType || "general_contract",
        content: `Document generated with ID: ${data.documentId}`,
        createdAt: new Date().toISOString(),
        originalPrompt: state.originalPrompt,
        missingData: state.missingData,
        providedData: state.wizardAnswers.map(a => ({ field: a.questionId, answer: a.answer })),
        sessionId: state.wizardSessionId,
        status: "completed" as const,
        lastModified: new Date().toISOString(),
      };
      dispatch({
        type: DOCUMENT_ACTION_TYPES.ADD_TO_DOCUMENT_HISTORY,
        payload: documentSession,
      });
    });

    WizardAPI.onError((error: any) => {
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_ERROR,
        payload: error.message || "Wizard error occurred",
      });
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_SESSION_STATUS,
        payload: "error",
      });
    });
  };

  // Submit wizard answer
  const submitWizardAnswer = (questionId: string, answer: string) => {
    dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: true });

    try {
      // Add answer to state
      const wizardAnswer: WizardAnswer = {
        questionId,
        answer,
        timestamp: new Date().toISOString(),
      };
      dispatch({
        type: DOCUMENT_ACTION_TYPES.ADD_WIZARD_ANSWER,
        payload: wizardAnswer,
      });

      // Send answer to server
      WizardAPI.submitAnswer(questionId, answer);

      // Clear current question
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_CURRENT_QUESTION,
        payload: null,
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to submit answer";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({
        type: DOCUMENT_ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });
    } finally {
      dispatch({ type: DOCUMENT_ACTION_TYPES.SET_LOADING, payload: false });
    }
  };

  // Provide missing data to backend (legacy)
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

  // Stream document content (legacy)
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
    WizardAPI.disconnect();

    dispatch({ type: DOCUMENT_ACTION_TYPES.RESET_SESSION });
    // Optionally clear persisted session from localStorageUtils
  };

  // Clear errors
  const clearError = () =>
    dispatch({ type: DOCUMENT_ACTION_TYPES.CLEAR_ERROR });

  return {
    startSession,
    startWizardSession,
    submitWizardAnswer,
    submitMissingData,
    startStreaming,
    exportDocument,
    setUserConsent,
    loadPersistedState,
    resetSession,
    clearError,
  };
}
