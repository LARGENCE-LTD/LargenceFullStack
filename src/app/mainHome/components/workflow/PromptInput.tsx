"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

// Example prompts you can customize
const examplePrompts = [
  "I need an NDA for my startup.",
  "Create an employment contract for a new hire.",
  "Draft a service agreement for my consulting business.",
  "Prepare a lease agreement for my rental property.",
];

interface PromptInputProps {
  // onSubmit: (prompt: string) => void; // To be wired to workflow context/API later
  loading?: boolean;
}

export default function PromptInput({ loading = false }: PromptInputProps) {
  const [input, setInput] = useState("");
  // const { onPromptSubmit } = useYourWorkflowContext();

  // Handle submit
  const handleSubmit = () => {
    if (!input.trim() || loading) return;
    // onPromptSubmit(input.trim());
    // Clear for UX (optional)
    // setInput("");
  };

  // Support Ctrl+Enter submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Insert example prompt on click
  const handleExampleClick = (ex: string) => setInput(ex);

  return (
    <div className="w-full max-w-xl flex flex-col items-center justify-center mt-12 mb-16">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 text-gray-900">
        What document do you need?
      </h1>
      <p className="text-center text-gray-500 mb-8 text-base">
        Describe your needs in your own words.
        <br />
        Be as specific or as brief as you like.
      </p>

      <div className="relative w-full">
        <textarea
          className="w-full h-32 p-5 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg placeholder-gray-400 shadow-sm transition"
          placeholder="E.g., I need a Non-Disclosure Agreement for a new client project..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          maxLength={1000}
          autoFocus
          spellCheck={true}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
          className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow
            ${
              input.trim() && !loading
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
          aria-label="Send prompt"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-7 w-full">
        <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase">
          Examples
        </h3>
        <div className="space-y-2">
          {examplePrompts.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleExampleClick(ex)}
              disabled={loading}
              className="block w-full text-left px-4 py-2 rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 transition text-sm"
            >
              <span className="opacity-60">{ex}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center">
        <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">
          Ctrl
        </kbd>{" "}
        +{" "}
        <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">
          Enter
        </kbd>{" "}
        to send
      </p>
    </div>
  );
}
