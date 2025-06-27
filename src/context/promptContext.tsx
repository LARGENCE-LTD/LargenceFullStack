"use client";

import React, { createContext, useContext, useState } from "react";

type DocumentPromptContextType = {
  documentPrompt:      string;
  isQueryStored:      boolean;
  storeDocumentQuery: (query: string) => void;
  clearDocumentQuery: () => void;
  loadStoredQuery:    () => string;
};

// Provide default empty context for TypeScript safety
const PromptContext = createContext<DocumentPromptContextType>({
  documentPrompt: "",
  isQueryStored: false,
  storeDocumentQuery: () => {},
  clearDocumentQuery: () => {},
  loadStoredQuery: () => "",
});

export const DocumentPromptProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [documentPrompt, setDocumentPrompt] = useState("");
  const [isPromptStored, setIsPromptStored] = useState(false);

  const storeDocumentQuery = (query: string) => {
    setDocumentPrompt(query);
    setIsPromptStored(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("document_prompt", query);
    }
  };

  const clearDocumentQuery = () => {
    setDocumentPrompt("");
    setIsPromptStored(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("document_prompt");
    }
  };

  const loadStoredQuery = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("document_prompt");
      if (stored) {
        setDocumentPrompt(stored);
        setIsPromptStored(true);
        return stored;
      }
    }
    return "";
  };

  const value = {
    documentPrompt,
    isQueryStored: isPromptStored,
    storeDocumentQuery,
    clearDocumentQuery,
    loadStoredQuery,
  };

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  );
};

export const useDocumentQuery = () => useContext(PromptContext);
