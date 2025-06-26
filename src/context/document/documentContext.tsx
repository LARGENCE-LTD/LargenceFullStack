import React, { createContext, useContext, useReducer } from "react";
import { initialState, DocumentState } from "./documentState";
import { documentReducer, DocumentAction } from "./documentReducer";
import { useDocumentActions } from "./documentActions";

// Create the context types
interface DocumentContextType {
  state: DocumentState;
  actions: ReturnType<typeof useDocumentActions>;
}

// Create the context
const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Provider
export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // Get actions, memoized and bound to this dispatch/state
  const actions = useDocumentActions(state, dispatch);

  return (
    <DocumentContext.Provider value={{ state, actions }}>
      {children}
    </DocumentContext.Provider>
  );
};

// Custom hook for consuming the context
export const useDocument = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
};
