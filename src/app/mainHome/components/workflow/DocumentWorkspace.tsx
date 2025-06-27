"use client";

import { useContext } from "react";

// Import the workflow step components (to be implemented next)
import PromptInput from "./PromptInput";
import LoadingProgress from "./LoadingProgress";
import MissingFieldsWizard from "./MissingFieldsWizard";
import DocumentPreviewWordStyle from "./DocumentPreviewWordStyle";

// --- You will replace this with your real context later ---
type WorkflowStep = "prompt" | "loading" | "missing_fields" | "preview";
interface DocumentWorkflowState {
  step: WorkflowStep;
  // Add more props as needed for your logic:
  // e.g., document, missingFields, loadingMessage, etc.
}
// Placeholder: use your real context/hook!
const fakeState: DocumentWorkflowState = {
  step: "prompt", // Change this for testing different flows
};

export default function DocumentWorkspace() {
  // TODO: Replace with actual global context or props
  // const { step, ...rest } = useYourWorkflowContext();
  const { step } = fakeState;

  // Switch which component to render based on workflow step
  let content = null;
  switch (step) {
    case "prompt":
      content = <PromptInput />;
      break;
    case "loading":
      content = <LoadingProgress />;
      break;
    case "missing_fields":
      content = <MissingFieldsWizard />;
      break;
    case "preview":
      content = <DocumentPreviewWordStyle />;
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
