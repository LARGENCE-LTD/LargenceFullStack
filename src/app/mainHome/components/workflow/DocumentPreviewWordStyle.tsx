"use client";

import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Edit3,
  Save,
  X,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { useDocument } from "@/contexts/document/context";

interface DocumentPreviewWordStyleProps {
  document?: {
    id: string;
    title: string;
    content: string;
  };
  loading?: boolean;
  streamingContent?: string; // For live "printing"
  onEdit?: (content: string) => Promise<void>;
  onExport?: (format: "word" | "pdf") => void;
  onBack?: () => void;
  onAIEnhance?: () => void;
  dataPrivacyModal?: React.ReactNode;
}

export default function DocumentPreviewWordStyle({
  document,
  loading = false,
  streamingContent,
  onEdit,
  onExport,
  onBack,
  onAIEnhance,
  dataPrivacyModal,
}: DocumentPreviewWordStyleProps) {
  const { state, actions } = useDocument();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(document?.content || "");

  // Update edited content when document changes
  useEffect(() => {
    if (document?.content) {
      setEditedContent(document.content);
    }
  }, [document?.content]);

  // Handle edit/save/cancel
  const startEdit = () => {
    setIsEditing(true);
    setEditedContent(document?.content || "");
  };

  const handleSave = async () => {
    if (onEdit) {
      try {
        await onEdit(editedContent);
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to save document:", error);
        // Could show error message to user
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(document?.content || "");
    setIsEditing(false);
  };

  // "Live printing": use streamingContent if present
  const showContent =
    streamingContent || editedContent || document?.content || "";

  // Show error if there's one
  const showError = state.error && (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700 text-sm">{state.error}</p>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[75vh]">
      {/* Back button */}
      {onBack && (
        <button
          className="absolute top-5 left-5 flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-100 text-gray-600 transition z-20"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      )}

      {showError}

      {/* Toolbar */}
      <div className="flex items-center justify-between w-full max-w-3xl mx-auto mt-8 mb-3 px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">
            {document?.title || "Document"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* AI Enhance */}
          {onAIEnhance && (
            <button
              onClick={onAIEnhance}
              className="flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              AI Suggestions
            </button>
          )}

          {/* Edit */}
          {!isEditing && (
            <button
              onClick={startEdit}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
              disabled={loading}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </button>
          )}

          {/* Export */}
          <button
            onClick={() => onExport && onExport("word")}
            className="flex items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-blue-700 rounded-lg text-sm"
            disabled={loading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Save Word
          </button>
          <button
            onClick={() => onExport && onExport("pdf")}
            className="flex items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-red-700 rounded-lg text-sm"
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            Save PDF
          </button>
        </div>
      </div>

      {/* Page */}
      <div
        className="w-full flex flex-col items-center justify-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="relative w-full flex flex-col items-center justify-center">
          <div
            className="bg-white shadow-2xl rounded-[2.5rem] mx-auto border border-gray-200 p-0"
            style={{
              width: "720px",
              minHeight: "930px",
              padding: "56px 64px",
              boxShadow:
                "0 3px 24px 0 rgba(0,0,0,0.08), 0 1.5px 6px 0 rgba(0,0,0,0.03)",
            }}
          >
            {/* "Printing" streaming animation */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
                <div className="animate-pulse text-blue-500 text-lg font-medium">
                  Printing your document...
                </div>
              </div>
            )}
            {/* Content area */}
            <div className="relative w-full h-full">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full min-h-[800px] h-[800px] max-h-[1200px] bg-transparent border-0 focus:outline-none font-serif text-[18px] text-gray-900 resize-none"
                  style={{
                    lineHeight: "2.05rem",
                    letterSpacing: "0.01em",
                  }}
                  autoFocus
                  spellCheck={true}
                />
              ) : (
                <pre
                  className="whitespace-pre-wrap font-serif text-[18px] text-gray-900 leading-[2.05rem] min-h-[800px]"
                  style={{
                    fontFamily:
                      "Georgia, Cambria, Times New Roman, Times, serif",
                  }}
                >
                  {showContent}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit controls (only when editing) */}
      {isEditing && (
        <div className="flex gap-3 mt-6 mb-2 justify-center">
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-base font-semibold transition disabled:opacity-50"
            disabled={loading}
          >
            <Save className="mr-2 h-5 w-5" />
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base font-semibold transition"
            disabled={loading}
          >
            <X className="mr-2 h-5 w-5" />
            Cancel
          </button>
        </div>
      )}

      {/* Privacy modal (optional, shown as overlay) */}
      {dataPrivacyModal}
    </div>
  );
}
