"use client";

import { createContext, useContext, useState } from "react";

type DocumentQueryContextType = {
  documentQuery: string;
  isQueryStored: boolean;
  storeDocumentQuery: (query: string) => void;
  clearDocumentQuery: () => void;
  loadStoredQuery: () => string;
};

// Provide default empty context for TypeScript safety
const DocumentQueryContext = createContext<DocumentQueryContextType>({
  documentQuery: "",
  isQueryStored: false,
  storeDocumentQuery: () => {},
  clearDocumentQuery: () => {},
  loadStoredQuery: () => "",
});

export const DocumentQueryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [documentQuery, setDocumentQuery] = useState("");
  const [isQueryStored, setIsQueryStored] = useState(false);

  const storeDocumentQuery = (query: string) => {
    setDocumentQuery(query);
    setIsQueryStored(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("largence_document_query", query);
    }
  };

  const clearDocumentQuery = () => {
    setDocumentQuery("");
    setIsQueryStored(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("largence_document_query");
    }
  };

  const loadStoredQuery = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("largence_document_query");
      if (stored) {
        setDocumentQuery(stored);
        setIsQueryStored(true);
        return stored;
      }
    }
    return "";
  };

  const value = {
    documentQuery,
    isQueryStored,
    storeDocumentQuery,
    clearDocumentQuery,
    loadStoredQuery,
  };

  return (
    <DocumentQueryContext.Provider value={value}>
      {children}
    </DocumentQueryContext.Provider>
  );
};

export const useDocumentQuery = () => useContext(DocumentQueryContext);
