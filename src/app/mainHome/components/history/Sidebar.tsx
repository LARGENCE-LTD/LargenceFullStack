"use client";

import { X, FileText } from "lucide-react";
import { useState } from "react";

type DocumentSummary = {
  id: string;
  title: string;
  createdAt: string;
  status: "completed" | "draft" | "error";
  prompt: string;
  missingFields: { field: string; explanation: string; example: string }[];
  answers: { [field: string]: string };
  content: string;
};

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // These will be hooked up to real context later
  documents?: DocumentSummary[];
  onSelectDocument?: (id: string) => void;
}

const mockDocuments: DocumentSummary[] = [
  {
    id: "doc1",
    title: "NDA for Startup",
    createdAt: "2025-06-27T09:00:00Z",
    status: "completed",
    prompt: "I need an NDA for my new startup",
    missingFields: [
      {
        field: "disclosing_party_name",
        explanation: "The full legal name of the disclosing party.",
        example: "Alpha Innovations Ltd.",
      },
      {
        field: "receiving_party_name",
        explanation: "The full legal name of the receiving party.",
        example: "Beta Solutions Ltd.",
      },
    ],
    answers: {
      disclosing_party_name: "Alpha Innovations Ltd.",
      receiving_party_name: "Beta Solutions Ltd.",
    },
    content:
      "This Non-Disclosure Agreement is made between Alpha Innovations Ltd. and Beta Solutions Ltd. ...",
  },
  // More mock docs can be added
];

export default function Sidebar({
  isOpen,
  onClose,
  documents = mockDocuments,
  onSelectDocument,
}: HistorySidebarProps) {
  // Selected doc for detail view
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sidebar is hidden if not open
  if (!isOpen) return null;

  const selectedDoc = documents.find((doc) => doc.id === selectedId);

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-[340px] max-w-full bg-white border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-200"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
      }}
      aria-label="Document history sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
        <button
          className="p-2 rounded hover:bg-gray-100 transition"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Doc List or Detail */}
      <div className="flex-1 overflow-y-auto">
        {!selectedDoc ? (
          <ul className="divide-y divide-gray-100">
            {documents.length === 0 && (
              <li className="p-6 text-center text-gray-400 text-sm">
                No documents yet.
              </li>
            )}
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  className="w-full flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition group"
                  onClick={() => setSelectedId(doc.id)}
                >
                  <FileText
                    size={20}
                    className="flex-shrink-0 mt-1 text-blue-500"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{doc.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(doc.createdAt).toLocaleString()}
                    </div>
                    <div
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                        doc.status === "completed"
                          ? "bg-green-50 text-green-700"
                          : doc.status === "draft"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4">
            <button
              className="mb-3 text-sm text-blue-500 hover:underline"
              onClick={() => setSelectedId(null)}
            >
              ← Back to list
            </button>
            <div className="mb-2">
              <div className="text-base font-semibold text-gray-800">
                {selectedDoc.title}
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {new Date(selectedDoc.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Prompt
              </div>
              <div className="bg-gray-50 rounded px-2 py-1 text-sm">
                {selectedDoc.prompt}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Missing Fields
              </div>
              <ul className="space-y-2">
                {selectedDoc.missingFields.map((field, i) => (
                  <li key={field.field} className="bg-gray-50 rounded p-2">
                    <div className="font-medium text-gray-700">
                      {field.field}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {field.explanation}
                    </div>
                    <div className="text-xs text-gray-400 italic mb-1">
                      e.g. {field.example}
                    </div>
                    <div className="text-xs text-green-700">
                      Answer:{" "}
                      <span className="font-semibold">
                        {selectedDoc.answers[field.field]}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Generated Document
              </div>
              <pre className="bg-gray-50 rounded p-2 text-sm text-gray-800 overflow-x-auto max-h-36">
                {selectedDoc.content.slice(0, 600)}
                {selectedDoc.content.length > 600 ? " ..." : ""}
              </pre>
              {/* Link/button to open in main preview, wire up with callback/context later */}
              <button
                className="mt-2 text-blue-500 hover:underline text-xs"
                onClick={() => {
                  if (onSelectDocument) onSelectDocument(selectedDoc.id);
                  onClose();
                }}
              >
                Open in workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
