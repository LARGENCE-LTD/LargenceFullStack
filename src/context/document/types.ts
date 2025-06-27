// All supported document types
export const DOCUMENT_TYPES = [
    { value: "nda", label: "Non-Disclosure Agreement" },
    { value: "employment_contract", label: "Employment Contract" },
    { value: "service_agreement", label: "Service Agreement" },
    { value: "lease_agreement", label: "Lease Agreement" },
    { value: "partnership_agreement", label: "Partnership Agreement" },
  ];
  
  // All supported export formats
  export const EXPORT_FORMATS = [
    { format: "pdf", name: "PDF Document" },
    { format: "word", name: "Word Document" },
  ];
  
  // TypeScript type for document type value
  export type DocumentTypeValue = typeof DOCUMENT_TYPES[number]["value"];
  
  // TypeScript type for export format
  export type ExportFormat = typeof EXPORT_FORMATS[number]["format"];
  