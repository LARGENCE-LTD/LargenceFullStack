"use client";

import { useState, useEffect, useRef } from "react";
import {
  Download,
  FileText,
  Save,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useDocument } from "@/contexts/document/context";
import { SESSION_STATUS } from "@/contexts/document/constants";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

interface TextEditorProps {
  document?: {
    id: string;
    title: string;
    content: string;
  };
  loading?: boolean;
  streamingContent?: string;
  onEdit?: (content: string) => Promise<void>;
  onExport?: (format: "word" | "pdf") => void;
  onBack?: () => void;
  onAIEnhance?: () => void;
  dataPrivacyModal?: React.ReactNode;
}

export default function TextEditor({
  document,
  loading = false,
  streamingContent,
  onEdit,
  onExport,
  onBack,
  onAIEnhance,
  dataPrivacyModal,
}: TextEditorProps) {
  const { state } = useDocument();
  const [editedContent, setEditedContent] = useState(document?.content || "");
  const [showExport, setShowExport] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Update editedContent when a new document is selected
  useEffect(() => {
    setEditedContent(document?.content || "");
    setHasChanged(false);
  }, [document?.id, document?.content]);

  // Track changes for the save button
  useEffect(() => {
    setHasChanged(editedContent !== (document?.content || ""));
  }, [editedContent, document?.content]);

  // Close export dropdown on click outside
  useEffect(() => {
    if (!showExport) return;
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    }
    window.document.addEventListener("mousedown", handleClick);
    return () => window.document.removeEventListener("mousedown", handleClick);
  }, [showExport]);

  const handleSave = async () => {
    if (!hasChanged || loading) return;
    if (onEdit) {
      try {
        await onEdit(editedContent);
        setHasChanged(false);
      } catch (error) {
        console.error("Failed to save document:", error);
      }
    } else {
      setHasChanged(false);
    }
  };

  // Show error if it exists
  const showError = state.error && (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700 text-sm">{state.error}</p>
    </div>
  );

  // Show streaming indicator
  const showStreamingIndicator = state.isStreaming && (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center">
        <Loader2 className="animate-spin text-blue-600 w-4 h-4 mr-2" />
        <p className="text-blue-700 text-sm">
          Document is being generated in real-time...
        </p>
      </div>
    </div>
  );

  // Display streamingContent if provided and non-empty, otherwise use editedContent
  const showContent =
    streamingContent !== undefined &&
    streamingContent !== null &&
    streamingContent !== ""
      ? streamingContent
      : editedContent;

  // Determine if we should show the streaming indicator in the toolbar
  const isStreaming =
    state.isStreaming && state.sessionStatus === SESSION_STATUS.GENERATING;

  return (
    <div className="w-full h-full flex flex-col items-center">
      {/* Toolbar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between bg-gray-100 shadow border border-gray-200 rounded-lg px-6 py-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800 truncate">
              {document?.title || "Document"}
            </h2>
            {isStreaming && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
                <Loader2 className="animate-spin text-blue-600 w-3 h-3" />
                <span className="text-blue-700 text-xs font-medium">Live</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!hasChanged || loading || isStreaming}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              hasChanged && !loading && !isStreaming
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Save className="mr-2 h-5 w-5" />
            Save
          </button>
          {/* AI Suggestion Button */}
          {onAIEnhance && (
            <button
              onClick={onAIEnhance}
              disabled={isStreaming}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isStreaming
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-700"
              }`}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              AI Suggestion
            </button>
          )}
          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setShowExport((v) => !v)}
              disabled={isStreaming}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isStreaming
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={showExport}
            >
              Export
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            {showExport && (
              <div className="absolute right-0 mt-2 w-32 bg-gray-50 border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                  onClick={() => {
                    setShowExport(false);
                    onExport && onExport("word");
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Word
                </button>
                <button
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                  onClick={() => {
                    setShowExport(false);
                    onExport && onExport("pdf");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {showError}

      {/* Streaming Indicator */}
      {showStreamingIndicator}

      {/* Editor Area */}
      <div className="w-full max-w-6xl h-[800px] border rounded-lg shadow overflow-hidden flex flex-col">
        <SimpleEditor
          content={showContent}
          onChange={setEditedContent}
          editable={!loading && !isStreaming}
        />
      </div>

      {/* Privacy Modal */}
      {dataPrivacyModal}
    </div>
  );
}
