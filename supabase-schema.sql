-- Largence Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create document_templates table
CREATE TABLE document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wizard_sessions table
CREATE TABLE wizard_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES document_templates(id) ON DELETE CASCADE,
  answer_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generated_documents table
CREATE TABLE generated_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES document_templates(id) ON DELETE CASCADE,
  document_data JSONB NOT NULL,
  content TEXT NOT NULL,
  is_deleted_by_user BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wizard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view document templates" ON document_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own wizard sessions" ON wizard_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own generated documents" ON generated_documents
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_wizard_sessions_user_template ON wizard_sessions(user_id, template_id, is_complete);
CREATE INDEX idx_generated_documents_user ON generated_documents(user_id);
CREATE INDEX idx_wizard_sessions_updated ON wizard_sessions(updated_at);

-- Insert sample document templates
INSERT INTO document_templates (name, description, questions) VALUES
(
  'Non-Disclosure Agreement',
  'A standard NDA for protecting confidential information',
  '[
    {
      "id": "nda_company_name",
      "title": "Company Name",
      "description": "Enter the full legal name of the company",
      "example": "e.g., Acme Corporation Inc.",
      "required": true,
      "type": "text"
    },
    {
      "id": "nda_recipient_name",
      "title": "Recipient Name",
      "description": "Enter the name of the person receiving confidential information",
      "example": "e.g., John Smith",
      "required": true,
      "type": "text"
    },
    {
      "id": "nda_recipient_company",
      "title": "Recipient Company",
      "description": "Enter the company name of the recipient",
      "example": "e.g., Tech Solutions LLC",
      "required": true,
      "type": "text"
    },
    {
      "id": "nda_purpose",
      "title": "Purpose of Disclosure",
      "description": "Describe why confidential information is being shared",
      "example": "e.g., To evaluate a potential business partnership",
      "required": true,
      "type": "text"
    },
    {
      "id": "nda_duration",
      "title": "Confidentiality Duration",
      "description": "How long should the confidentiality obligations last?",
      "example": "e.g., 3 years",
      "required": true,
      "type": "text"
    }
  ]'::jsonb
),
(
  'Employment Contract',
  'Standard employment agreement for new hires',
  '[
    {
      "id": "emp_employee_name",
      "title": "Employee Full Name",
      "description": "Enter the full legal name of the employee",
      "example": "e.g., Jane Doe",
      "required": true,
      "type": "text"
    },
    {
      "id": "emp_position",
      "title": "Job Position",
      "description": "Enter the job title/position",
      "example": "e.g., Senior Software Engineer",
      "required": true,
      "type": "text"
    },
    {
      "id": "emp_start_date",
      "title": "Start Date",
      "description": "When does employment begin?",
      "example": "e.g., 2024-01-15",
      "required": true,
      "type": "date"
    },
    {
      "id": "emp_salary",
      "title": "Annual Salary",
      "description": "Enter the annual salary amount",
      "example": "e.g., $85,000",
      "required": true,
      "type": "text"
    },
    {
      "id": "emp_work_location",
      "title": "Work Location",
      "description": "Where will the employee primarily work?",
      "example": "e.g., Remote, New York Office, Hybrid",
      "required": true,
      "type": "select",
      "options": ["Remote", "Office", "Hybrid"]
    }
  ]'::jsonb
),
(
  'Service Agreement',
  'Agreement for professional services',
  '[
    {
      "id": "svc_client_name",
      "title": "Client Name",
      "description": "Enter the full legal name of the client",
      "example": "e.g., ABC Corporation",
      "required": true,
      "type": "text"
    },
    {
      "id": "svc_provider_name",
      "title": "Service Provider Name",
      "description": "Enter the name of the service provider",
      "example": "e.g., XYZ Consulting LLC",
      "required": true,
      "type": "text"
    },
    {
      "id": "svc_services",
      "title": "Services Description",
      "description": "Describe the services to be provided",
      "example": "e.g., Website development and maintenance",
      "required": true,
      "type": "text"
    },
    {
      "id": "svc_rate",
      "title": "Hourly Rate",
      "description": "What is the hourly rate for services?",
      "example": "e.g., $150 per hour",
      "required": true,
      "type": "text"
    },
    {
      "id": "svc_termination",
      "title": "Termination Notice",
      "description": "How much notice is required to terminate?",
      "example": "e.g., 30 days written notice",
      "required": true,
      "type": "text"
    }
  ]'::jsonb
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_document_templates_updated_at 
    BEFORE UPDATE ON document_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wizard_sessions_updated_at 
    BEFORE UPDATE ON wizard_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
