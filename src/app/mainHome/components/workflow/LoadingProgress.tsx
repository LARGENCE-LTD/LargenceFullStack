"use client";

import { Loader2 } from "lucide-react";

interface LoadingProgressProps {
  message?: string; // Optional: Custom status (e.g., "Gathering required info...")
  progress?: number; // Optional: 0–100 for progress bar, or undefined for indeterminate
}

export default function LoadingProgress({
  message,
  progress,
}: LoadingProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[36vh] w-full">
      {/* Progress spinner or bar */}
      <div className="mb-6">
        {typeof progress === "number" ? (
          <div className="w-60 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-3 transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            />
          </div>
        ) : (
          <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
        )}
      </div>
      {/* Status message */}
      <div className="text-lg font-medium text-gray-700 text-center mb-2">
        {message || "Please wait..."}
      </div>
      {/* Subtext */}
      <div className="text-sm text-gray-400 text-center">
        This may take a few moments.
      </div>
    </div>
  );
}
