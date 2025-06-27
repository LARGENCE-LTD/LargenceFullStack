"use client";

import React, { createContext, useContext, useReducer } from "react";
import { State } from "./state";
import { reducer } from "./reducer";
import { useDocumentActions } from "./actions";
import { initialState } from "./state";

// Create the context types
interface DocumentContextType {
  state: State;
  actions: ReturnType<typeof useDocumentActions>;
}

// Create the context
const Context = createContext<DocumentContextType | undefined>(undefined);

// Provider
export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Get actions, memoized and bound to this dispatch/state
  const actions = useDocumentActions(state, dispatch);

  return (
    <Context.Provider value={{ state, actions }}>
      {children}
    </Context.Provider>
  );
};

// Custom hook for consuming the context
export const useDocument = (): DocumentContextType => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
};
