"use client";

import { useContext } from "react";
import { useDocument } from "@/contexts/document/context";

// Import the workflow step components (to be implemented next)
import PromptInput from "./PromptInput";
import LoadingProgress from "./LoadingProgress";
import MissingFieldsWizard from "./MissingFieldsWizard";
import DocumentPreviewWordStyle from "./DocumentPreviewWordStyle";

export default function DocumentWorkspace() {
  const { state, actions } = useDocument();

  // Determine current workflow step based on session status
  const getCurrentStep = () => {
    switch (state.sessionStatus) {
      case "idle":
        return "prompt";
      case "starting":
      case "generating":
        return "loading";
      case "missing_info":
        return "missing_fields";
      case "completed":
        return "preview";
      case "error":
        return "prompt"; // Return to prompt on error
      default:
        return "prompt";
    }
  };

  const currentStep = getCurrentStep();

  // Switch which component to render based on workflow step
  let content = null;
  switch (currentStep) {
    case "prompt":
      content = <PromptInput />;
      break;
    case "loading":
      content = (
        <LoadingProgress
          message="Generating your document..."
          progress={
            state.progress.current > 0
              ? (state.progress.current / state.progress.total) * 100
              : undefined
          }
        />
      );
      break;
    case "missing_fields":
      content = (
        <MissingFieldsWizard
          fields={state.missingData.fields}
          onSubmit={(answers) => {
            const providedData = Object.entries(answers).map(
              ([field, answer]) => ({
                field,
                answer,
              })
            );
            actions.submitMissingData(state.sessionId!, providedData);
          }}
          loading={state.loading}
        />
      );
      break;
    case "preview":
      content = (
        <DocumentPreviewWordStyle
          document={{
            id: state.sessionId || "current",
            title: state.suggestedTitle || "Generated Document",
            content: state.documentContent,
          }}
          streamingContent={state.streamingContent}
          loading={state.isStreaming}
          onEdit={async (content) => {
            // TODO: Implement document editing
            console.log("Edit document:", content);
          }}
          onExport={(format) => {
            // TODO: Implement document export
            console.log("Export document:", format);
          }}
          onBack={() => {
            actions.resetSession();
          }}
          onAIEnhance={() => {
            // TODO: Implement AI enhancement
            console.log("AI enhance document");
          }}
        />
      );
      break;
    default:
      content = <PromptInput />;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      {content}
    </div>
  );
}
