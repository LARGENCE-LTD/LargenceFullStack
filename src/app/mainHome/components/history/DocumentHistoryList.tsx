// components/history/DocumentHistoryList.tsx
"use client";

import { FileText } from "lucide-react";

type DocumentSummary = {
  id: string;
  title: string;
  createdAt: string;
  status: "completed" | "draft" | "error";
};

interface DocumentHistoryListProps {
  documents: DocumentSummary[];
  onSelect: (id: string) => void;
}

export default function DocumentHistoryList({
  documents,
  onSelect,
}: DocumentHistoryListProps) {
  return (
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
            onClick={() => onSelect(doc.id)}
          >
            <FileText size={20} className="flex-shrink-0 mt-1 text-blue-500" />
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
  );
}
