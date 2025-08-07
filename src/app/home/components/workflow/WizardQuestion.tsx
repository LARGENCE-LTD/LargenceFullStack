"use client";

import { useState } from "react";
import { WizardQuestion as QuestionType } from "@/contexts/document/state";
import { Button } from "@/app/components/Button";

interface WizardQuestionProps {
  question: QuestionType;
  onAnswer: (questionId: string, answer: string) => void;
  loading?: boolean;
}

export default function WizardQuestion({ question, onAnswer, loading }: WizardQuestionProps) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (answer.trim()) {
      onAnswer(question.questionId, answer.trim());
      setAnswer("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {question.title}
          </h2>
          <span className="text-sm text-gray-500">
            {question.fieldNumber} of {question.totalFields}
          </span>
        </div>
        
        {question.description && (
          <p className="text-gray-600 mb-4">{question.description}</p>
        )}
        
        {question.example && (
          <p className="text-sm text-gray-500 mb-4">
            Example: {question.example}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {question.type === 'select' && question.options ? (
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select an option...</option>
            {question.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : question.type === 'date' ? (
          <input
            type="date"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={loading}
          />
        ) : question.type === 'email' ? (
          <input
            type="email"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your email..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={loading}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={loading}
            onKeyDown={handleKeyDown}
          />
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Processing..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
