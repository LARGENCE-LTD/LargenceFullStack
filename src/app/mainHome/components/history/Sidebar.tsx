"use client";

import { PanelLeftClose } from "lucide-react";
import { useState } from "react";

import Image from "next/image";

import { useDocument } from "@/contexts/document/context";
import DocumentHistoryList from "./DocumentHistoryList";
import SessionDetail from "./SessionDetail";

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
  onSelectDocument?: (id: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  onSelectDocument,
}: HistorySidebarProps) {
  const { state } = useDocument();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Convert document history to the expected format
  const documents: DocumentSummary[] = state.documentHistory.map((doc) => ({
    id: doc.id,
    title: doc.title,
    createdAt: doc.createdAt,
    status: "completed" as const, // Assuming all saved documents are completed
    prompt: "", // This would need to be stored in conversation history
    missingFields: [], // This would need to be stored in conversation history
    answers: {}, // This would need to be stored in conversation history
    content: doc.content,
  }));

  // Sidebar is hidden if not open
  if (!isOpen) return null;

  const selectedDoc = documents.find((doc) => doc.id === selectedId);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 w-[500px] max-w-full bg-gray-100 shadow-xl flex flex-col transition-transform duration-200"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      }}
      aria-label="Document history sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-200">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Largence Logo"
            width={24}
            height={24}
            className="rounded-lg"
          />
        </div>
        <button
          className="p-2 rounded hover:bg-gray-100 transition"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <PanelLeftClose size={20} />
        </button>
      </div>

      {/* Doc List or Detail */}
      <div className="flex-1 overflow-y-auto">
        {!selectedDoc ? (
          <DocumentHistoryList
            documents={documents}
            onSelect={(id) => setSelectedId(id)}
          />
        ) : (
          <SessionDetail
            session={selectedDoc}
            onBack={() => setSelectedId(null)}
            onOpenInWorkspace={onSelectDocument}
          />
        )}
      </div>
    </aside>
  );
}
