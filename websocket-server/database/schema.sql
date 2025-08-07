-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create document_templates table
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Stores the array of question objects
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.document_templates(id), -- Can be NULL until AI classifies intent
  conversation_history JSONB DEFAULT '[]'::jsonb,
  answered_questions JSONB DEFAULT '[]'::jsonb, -- Track which questions have been answered
  current_question_index INTEGER DEFAULT 0, -- Track current question position
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create generated_documents table
CREATE TABLE public.generated_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.document_templates(id),
  document_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_template_id ON public.chat_sessions(template_id);
CREATE INDEX idx_chat_sessions_is_complete ON public.chat_sessions(is_complete);
CREATE INDEX idx_chat_sessions_updated_at ON public.chat_sessions(updated_at);

CREATE INDEX idx_generated_documents_user_id ON public.generated_documents(user_id);
CREATE INDEX idx_generated_documents_template_id ON public.generated_documents(template_id);

-- Enable Row Level Security
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Users can access their own chat sessions"
  ON public.chat_sessions FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for generated_documents
CREATE POLICY "Users can view their own documents"
  ON public.generated_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.generated_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_chat_sessions_updated_at 
  BEFORE UPDATE ON public.chat_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_documents_updated_at 
  BEFORE UPDATE ON public.generated_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create document template embeddings table for RAG
CREATE TABLE public.document_template_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- The name, description, or full text of the template
  embedding VECTOR(1536), -- Matches OpenAI's embedding model dimension
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX idx_document_template_embeddings_embedding 
  ON public.document_template_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Insert some sample document templates
INSERT INTO public.document_templates (name, description, questions) VALUES
(
  'Non-Disclosure Agreement',
  'A standard NDA template for protecting confidential information',
  '[
    {"id": "q1_disclosing_party", "text": "What is the full legal name of the Disclosing Party?"},
    {"id": "q2_receiving_party", "text": "What is the full legal name of the Receiving Party?"},
    {"id": "q3_effective_date", "text": "What is the effective date of this agreement?"},
    {"id": "q4_confidential_info", "text": "What specific confidential information will be shared?"},
    {"id": "q5_purpose", "text": "What is the purpose of sharing this confidential information?"}
  ]'::jsonb
),
(
  'Employment Contract',
  'A comprehensive employment agreement template',
  '[
    {"id": "q1_employee_name", "text": "What is the full legal name of the employee?"},
    {"id": "q2_employer_name", "text": "What is the full legal name of the employer?"},
    {"id": "q3_position", "text": "What is the job title/position?"},
    {"id": "q4_start_date", "text": "What is the employment start date?"},
    {"id": "q5_salary", "text": "What is the annual salary or hourly rate?"},
    {"id": "q6_work_location", "text": "Where will the employee work (office, remote, hybrid)?"}
  ]'::jsonb
),
(
  'Service Agreement',
  'A service agreement template for business services',
  '[
    {"id": "q1_service_provider", "text": "What is the full legal name of the service provider?"},
    {"id": "q2_client", "text": "What is the full legal name of the client?"},
    {"id": "q3_services", "text": "What specific services will be provided?"},
    {"id": "q4_compensation", "text": "What is the compensation for these services?"},
    {"id": "q5_term", "text": "What is the duration of this agreement?"}
  ]'::jsonb
); 

-- Create profiles table to store public user data and Stripe mapping
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT, -- The link to the customer in Stripe
  -- You can add other public info here like an avatar_url or full_name
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create subscriptions table to track plans
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- e.g., 'active', 'trialing', 'canceled', 'past_due'
  plan_type TEXT NOT NULL, -- e.g., 'free', 'monthly', 'annual'
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Create document_credits table
CREATE TABLE public.document_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  cycle_ends_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for document_credits
ALTER TABLE public.document_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own credits" ON public.document_credits FOR SELECT USING (auth.uid() = user_id);