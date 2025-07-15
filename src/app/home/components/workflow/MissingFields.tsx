"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { useDocument } from "@/contexts/document/context";

type Field = {
  field: string;
  explanation: string;
  example: string;
};

interface MissingFieldsProps {
  fields?: Field[];
  onSubmit?: (answers: Record<string, string>, userDeclined?: boolean) => void;
  loading?: boolean;
}

export default function MissingFields({
  fields = [],
  onSubmit,
  loading = false,
}: MissingFieldsProps) {
  const { state } = useDocument();
  const total = fields.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // if (total === 0) {
  //   return (
  //     <div className="fixed inset-0 z-30 bg-white bg-opacity-80 flex items-center justify-center min-h-screen p-3">
  //       <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative border border-gray-100">
  //         <div className="text-center">
  //           <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
  //           <h3 className="text-xl font-bold text-gray-900 mb-2">
  //             All Information Provided
  //           </h3>
  //           <p className="text-base text-gray-600 mb-6">
  //             We have all the information needed to generate your document.
  //           </p>
  //           <button
  //             onClick={() => onSubmit && onSubmit({})}
  //             disabled={loading}
  //             className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-semibold transition disabled:opacity-50 flex items-center justify-center mx-auto"
  //           >
  //             {loading ? (
  //               <>
  //                 <Loader2 className="animate-spin w-4 h-4 mr-2" />
  //                 Processing...
  //               </>
  //             ) : (
  //               "Continue"
  //             )}
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const current = fields[step];
  const isLast = step === total - 1;
  const isFirst = step === 0;
  const currentValue = answers[current.field] || "";
  const allValid = fields.every((f) => (answers[f.field] || "").trim() !== "");

  // -- Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers((prev) => ({ ...prev, [current.field]: e.target.value }));
  };

  // -- Next/Prev navigation
  const handleNext = () => {
    if (currentValue.trim() && step < total - 1) setStep(step + 1);
  };
  const handlePrev = () => setStep((s) => Math.max(0, s - 1));
  const handleSubmit = () => {
    if (allValid && onSubmit) onSubmit(answers, false);
  };

  const handleDecline = () => {
    if (onSubmit) onSubmit({}, true);
  };

  // -- Enter key to advance
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isLast && allValid) handleSubmit();
      else if (currentValue.trim()) handleNext();
    }
  };

  // -- Error message
  const showError = state.error && (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700 text-base">{state.error}</p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* Modal/Card Container */}
      <div className="w-full max-w-4xl h-[70vh] max-h-[90vh] bg-white rounded-2xl shadow-2xl p-8 relative border border-gray-100 flex flex-col">
        {/* Scrollable content, stretch to fill remaining height */}
        <div className="flex-1 flex flex-col overflow-y-auto pb-32">
          {showError}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-2xl text-blue-700 font-bold uppercase tracking-wide">
              REQUIRED INFORMATION
            </div>
            <div className="flex items-center gap-4 text-lg text-gray-400 font-semibold">
              {/* Field counter */}
              <span>
                Field {step + 1} of {total}
              </span>
              {/* Separator */}
              <span className="mx-1 text-gray-400">|</span>
              {/* Cancel "X" */}
              <button
                onClick={handleDecline}
                aria-label="Cancel"
                style={{ lineHeight: 1 }}
                className="text-gray-400 hover:text-red-700 hover:font-bold transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-2 transition-all duration-300 rounded-full"
                style={{
                  width: `${((step + 1) / total) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Main Field & Explanation */}
          <div className="flex flex-col flex-1">
            <label className="block text-xl font-bold text-gray-900 mb-1">
              {current.field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </label>
            <p className="text-gray-700 text-lg mb-1 font-medium">
              {current.explanation}
            </p>
            <p className="text-gray-500 italic text-base mb-4">
              Example:{" "}
              <span className="not-italic text-gray-600">
                {current.example}
              </span>
            </p>
            {/* Textarea fills the rest of the space */}
            <textarea
              className="flex-1 w-full mt-2 pt-8 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-lg transition min-h-[120px] resize-none"
              value={currentValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
              style={{ minHeight: "120px", maxHeight: "350px" }}
              // This textarea will stretch, but not go below or above limits
            ></textarea>
          </div>
        </div>

        {/* Button Row: Absolutely positioned at the bottom */}
        <div className="absolute bottom-0 left-0 w-full px-8 pb-8 flex items-center justify-between">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            disabled={isFirst || loading}
            className="flex items-center px-5 py-2 text-lg text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            Previous
          </button>
          {/* Next/Submit Button */}
          {!isLast ? (
            <button
              onClick={handleNext}
              disabled={!currentValue.trim() || loading}
              className="flex items-center px-6 py-2 text-lg text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50"
            >
              Next
              <ChevronRight className="ml-1 h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allValid || loading}
              className="flex items-center px-6 py-2 text-lg text-white bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-6 w-6" />
                  Submit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
