"use client";

import { useDocument } from "@/contexts/document/context";
import {
  WORKFLOW_STEPS,
  getWorkflowStep,
  SESSION_STATUS,
} from "@/contexts/document/constants";

import PromptInput from "./PromptInput";
import LoadingProgress from "./LoadingProgress";
import MissingFields from "./MissingFields";
import TextEditor from "./TextEditor";
import WizardQuestion from "./WizardQuestion";

export default function Workspace({
  onOpenHistory,
}: {
  onOpenHistory?: () => void;
}) {
  const { state, actions } = useDocument();

  // Determine current workflow step
  const currentStep = getWorkflowStep(state.sessionStatus);

  // Handle wizard answer submission
  const handleWizardAnswer = (questionId: string, answer: string) => {
    actions.submitWizardAnswer(questionId, answer);
  };

  // Handlers for TextEditor actions
  const handleEdit = async (content: string) => {
    // TODO: Implement document editing
    console.log("Edit document:", content);
  };

  const handleExport = (format: string) => {
    // TODO: Implement document export
    console.log("Export document:", format);
  };

  const handleBack = () => {
    actions.resetSession();
    if (onOpenHistory) onOpenHistory();
  };

  const handleAIEnhance = () => {
    // TODO: Implement AI enhancement
    console.log("AI enhance document");
  };

  // Shared TextEditor component
  const renderTextEditor = (
    content: string,
    streamingContent?: string,
    loading?: boolean
  ) => (
    <TextEditor
      document={{
        id: state.sessionId!,
        title: state.suggestedTitle || "Generated Document",
        content,
      }}
      streamingContent={streamingContent}
      loading={loading}
      onEdit={handleEdit}
      onExport={handleExport}
      onBack={handleBack}
      onAIEnhance={handleAIEnhance}
    />
  );

  // Streaming or completed status always shows TextEditor
  if (state.isStreaming || state.sessionStatus === SESSION_STATUS.COMPLETED) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {renderTextEditor(
          state.sessionStatus === SESSION_STATUS.COMPLETED
            ? state.documentContent!
            : state.streamingContent!,
          state.isStreaming ? state.streamingContent! : undefined,
          state.loading
        )}
      </div>
    );
  }

  // Switch rendering by workflow step
  let content;
  switch (currentStep) {
    case WORKFLOW_STEPS.PROMPT:
      content = <PromptInput />;
      break;
    case WORKFLOW_STEPS.LOADING:
      content = (
        <LoadingProgress
          progress={
            state.progress.current > 0
              ? (state.progress.current / state.progress.total) * 100
              : undefined
          }
        />
      );
      break;
    case WORKFLOW_STEPS.MISSING_FIELDS:
      // Show wizard question if in wizard mode
      if (state.isWizardMode && state.currentQuestion) {
        content = (
          <WizardQuestion
            question={state.currentQuestion}
            onAnswer={handleWizardAnswer}
            loading={state.loading}
          />
        );
      } else {
        // Fallback to old missing fields UI
        content = (
          <MissingFields
            fields={state.missingData.fields}
            onSubmit={(answers, userDeclined) => {
              const providedData = Object.entries(answers).map(
                ([field, answer]) => ({
                  field,
                  answer,
                })
              );
              actions.submitMissingData(
                state.sessionId!,
                providedData,
                userDeclined
              );
            }}
            loading={state.loading}
          />
        );
      }
      break;
    case WORKFLOW_STEPS.PREVIEW:
      content = renderTextEditor(
        state.documentContent!,
        state.streamingContent!,
        state.loading
      );
      break;
    default:
      content = <PromptInput />;
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      {content}
    </div>
  );
}
