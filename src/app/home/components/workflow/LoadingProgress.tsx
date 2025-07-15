"use client";

import { Loader2 } from "lucide-react";
import { useDocument } from "@/contexts/document/context";
import { SESSION_STATUS } from "@/contexts/document/constants";

interface LoadingProgressProps {
  message?: string; // Optional: Custom status (e.g., "Gathering required info...")
  progress?: number; // Optional: 0–100 for progress bar, or undefined for indeterminate
}

export default function LoadingProgress({
  message,
  progress,
}: LoadingProgressProps) {
  const { state } = useDocument();

  // Get status-specific messages
  const getStatusMessage = () => {
    switch (state.sessionStatus) {
      case SESSION_STATUS.STARTING:
        return "Connecting to document generation service...";
      case SESSION_STATUS.GENERATING:
        return state.isStreaming
          ? "Generating your document..."
          : "Processing your request...";
      case SESSION_STATUS.MISSING_INFO:
        return "Analyzing requirements...";
      default:
        return "Please wait...";
    }
  };

  // Get status-specific subtext
  const getStatusSubtext = () => {
    switch (state.sessionStatus) {
      case SESSION_STATUS.STARTING:
        return "Establishing secure connection...";
      case SESSION_STATUS.GENERATING:
        return state.isStreaming
          ? "Content is being generated in real-time..."
          : "This may take a few moments...";
      case SESSION_STATUS.MISSING_INFO:
        return "We need a bit more information to proceed...";
      default:
        return "This may take a few moments.";
    }
  };

  // Use context state if props not provided
  const displayMessage = message || getStatusMessage();
  const displayProgress =
    progress !== undefined
      ? progress
      : state.progress.current > 0
      ? (state.progress.current / state.progress.total) * 100
      : undefined;

  // Show error if there's one
  const showError = state.error && (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700 text-sm">{state.error}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh]">
      {showError}

      {/* Progress spinner or bar */}
      <div className="mb-6">
        {typeof displayProgress === "number" ? (
          <div className="w-60 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="bg-gray-800 h-3 transition-all duration-500 rounded-full"
              style={{
                width: `${Math.max(0, Math.min(displayProgress, 100))}%`,
              }}
            />
          </div>
        ) : (
          <Loader2 className="animate-spin text-gray-800 w-12 h-12" />
        )}
      </div>

      {/* Status message */}
      <div className="text-lg font-medium text-gray-800 text-center mb-2">
        {displayMessage}
      </div>

      {/* Subtext */}
      <div className="text-sm text-gray-600 text-center">
        {getStatusSubtext()}
      </div>
    </div>
  );
}
