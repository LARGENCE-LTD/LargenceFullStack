"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

// Replace with your type or context data
type Field = {
  field: string;
  explanation: string;
  example: string;
};

interface MissingFieldsWizardProps {
  fields?: Field[]; // Inject fields or connect to context
  onSubmit?: (answers: Record<string, string>) => void;
  loading?: boolean;
}

export default function MissingFieldsWizard({
  fields = [],
  onSubmit,
  loading = false,
}: MissingFieldsWizardProps) {
  const total = fields.length;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // If no fields, show completion message
  if (total === 0) {
    return (
      <div className="fixed inset-0 z-30 bg-white bg-opacity-80 flex items-center justify-center min-h-screen p-3">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative border border-gray-100">
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Information Provided
            </h3>
            <p className="text-gray-600 mb-6">
              We have all the information needed to generate your document.
            </p>
            <button
              onClick={() => onSubmit && onSubmit({})}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = fields[step];
  const isLast = step === total - 1;
  const isFirst = step === 0;
  const currentValue = answers[current.field] || "";

  // Validate: all fields answered
  const allValid = fields.every((f) => (answers[f.field] || "").trim() !== "");

  // Handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers((prev) => ({ ...prev, [current.field]: e.target.value }));
  };

  // Nav handlers
  const handleNext = () => {
    if (currentValue.trim() && step < total - 1) setStep(step + 1);
  };
  const handlePrev = () => setStep((s) => Math.max(0, s - 1));
  const handleSubmit = () => {
    if (allValid && onSubmit) onSubmit(answers);
    // Or dispatch/send to API/context
  };

  // Support enter key to go next/submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isLast && allValid) handleSubmit();
      else if (currentValue.trim()) handleNext();
    }
  };

  return (
    <div className="fixed inset-0 z-30 bg-white bg-opacity-80 flex items-center justify-center min-h-screen p-3">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative border border-gray-100">
        <div className="flex items-center justify-between mb-7">
          <div className="text-xs text-blue-700 font-semibold uppercase tracking-wide">
            Required Information
          </div>
          <div className="text-xs text-gray-400">
            Field {step + 1} of {total}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-base font-semibold text-gray-900 mb-1">
            {current.field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </label>
          <p className="text-gray-600 text-sm mb-1">{current.explanation}</p>
          <p className="text-gray-400 italic text-xs mb-2">
            Example:{" "}
            <span className="not-italic text-gray-500">{current.example}</span>
          </p>
          <input
            type="text"
            className="w-full mt-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 text-base transition"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={current.example}
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={isFirst || loading}
            className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition disabled:opacity-50"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>
          {!isLast ? (
            <button
              onClick={handleNext}
              disabled={!currentValue.trim() || loading}
              className="flex items-center px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allValid || loading}
              className="flex items-center px-5 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
