"use client";

import React, { createContext, useContext, useReducer } from "react";
import { State } from "./state";
import { reducer } from "./reducer";
import { useDocumentActions } from "./actions";
import { initialState } from "./state";

// TESTING FLAG - Set to false to remove test data
const USE_TEST_DATA = true;

// Test data for development
const testDocumentData = {
  documentHistory: [
    {
      id: "doc-1",
      title: "Non-Disclosure Agreement - TechCorp Inc.",
      documentType: "nda",
      content: `This Non-Disclosure Agreement (the "Agreement") is made and entered into as of January 15, 2024, by and between TechCorp Inc., a Delaware corporation ("Disclosing Party") and Innovation Solutions LLC, a California limited liability company ("Receiving Party").

1. DEFINITION OF CONFIDENTIAL INFORMATION
All information disclosed by Disclosing Party to Receiving Party shall be considered confidential and proprietary to Disclosing Party, including but not limited to trade secrets, business plans, customer lists, financial information, and technical specifications.

2. OBLIGATIONS OF RECEIVING PARTY
Receiving Party agrees to:
(a) Use the Confidential Information solely for the purpose of evaluating a potential business relationship;
(b) Maintain the confidentiality of the Confidential Information;
(c) Not disclose the Confidential Information to any third party without prior written consent;
(d) Return or destroy all Confidential Information upon request.

3. TERM AND TERMINATION
This Agreement shall remain in effect for a period of three (3) years from the date of disclosure. The obligations of confidentiality shall survive termination for an additional five (5) years.

4. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of California.`,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: "doc-2",
      title: "Employment Contract - Senior Developer",
      documentType: "employment_contract",
      content: `EMPLOYMENT AGREEMENT

This Employment Agreement (the "Agreement") is entered into as of February 1, 2024, between TechCorp Inc., a Delaware corporation (the "Company"), and Sarah Johnson (the "Employee").

1. POSITION AND DUTIES
Employee shall serve as Senior Software Developer, reporting to the Chief Technology Officer. Employee shall perform all duties and responsibilities customary to such position and such other duties as may be assigned by the Company.

2. COMPENSATION
Employee shall receive an annual base salary of $120,000, payable in accordance with the Company's standard payroll practices. Employee shall also be eligible for an annual performance bonus of up to 20% of base salary.

3. BENEFITS
Employee shall be eligible to participate in the Company's employee benefit plans, including health insurance, 401(k) plan, and paid time off, subject to the terms and conditions of such plans.

4. TERM AND TERMINATION
This Agreement shall commence on February 1, 2024, and shall continue until terminated by either party with thirty (30) days written notice.`,
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
    {
      id: "doc-3",
      title: "Service Agreement - Marketing Services",
      documentType: "service_agreement",
      content: `SERVICE AGREEMENT

This Service Agreement (the "Agreement") is made and entered into as of March 1, 2024, by and between TechCorp Inc., a Delaware corporation ("Client"), and Digital Marketing Pro LLC, a New York limited liability company ("Provider").

1. SERVICES
Provider shall provide digital marketing services to Client, including but not limited to:
- Social media management
- Content creation and curation
- Email marketing campaigns
- SEO optimization
- Analytics and reporting

2. COMPENSATION
Client shall pay Provider a monthly fee of $5,000 for the services provided. Payment shall be due within 15 days of invoice date.

3. TERM
This Agreement shall commence on March 1, 2024, and shall continue for a period of twelve (12) months, unless earlier terminated as provided herein.

4. INTELLECTUAL PROPERTY
All work product created by Provider for Client shall be owned by Client upon payment of the applicable fees.`,
      createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    },
  ],
  conversationHistory: [
    {
      prompt: "I need an NDA for a potential partnership with TechCorp Inc.",
      missingData: {
        fields: [
          {
            field: "disclosing_party_name",
            explanation: "The full legal name of the disclosing party.",
            example: "TechCorp Inc.",
          },
          {
            field: "receiving_party_name",
            explanation: "The full legal name of the receiving party.",
            example: "Innovation Solutions LLC",
          },
        ],
        message: "Please provide the following information to complete your NDA:",
      },
      providedData: [
        { field: "disclosing_party_name", answer: "TechCorp Inc." },
        { field: "receiving_party_name", answer: "Innovation Solutions LLC" },
      ],
      documentContent: "This Non-Disclosure Agreement (the \"Agreement\") is made and entered into...",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      prompt: "Create an employment contract for a senior developer position",
      missingData: {
        fields: [
          {
            field: "employee_name",
            explanation: "The full name of the employee.",
            example: "Sarah Johnson",
          },
          {
            field: "position_title",
            explanation: "The job title for the position.",
            example: "Senior Software Developer",
          },
          {
            field: "annual_salary",
            explanation: "The annual base salary amount.",
            example: "$120,000",
          },
        ],
        message: "Please provide the following information to complete your employment contract:",
      },
      providedData: [
        { field: "employee_name", answer: "Sarah Johnson" },
        { field: "position_title", answer: "Senior Software Developer" },
        { field: "annual_salary", answer: "$120,000" },
      ],
      documentContent: "EMPLOYMENT AGREEMENT\n\nThis Employment Agreement (the \"Agreement\") is entered into...",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
};

// Create the context types
interface DocumentContextType {
  state: State;
  actions: ReturnType<typeof useDocumentActions>;
}

// Create the context
const Context = createContext<DocumentContextType | undefined>(undefined);

// Provider
export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with test data if flag is enabled
  const initialDocumentState = USE_TEST_DATA ? {
    ...initialState,
    documentHistory: testDocumentData.documentHistory,
    conversationHistory: testDocumentData.conversationHistory,
  } : initialState;

  const [state, dispatch] = useReducer(reducer, initialDocumentState);

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
