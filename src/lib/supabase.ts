import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for WebSocket server)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  questions: Array<{
    id: string;
    title: string;
    description: string;
    example: string;
    required: boolean;
    type: 'text' | 'email' | 'date' | 'select';
    options?: string[];
  }>;
  created_at: string;
  updated_at: string;
}

export interface WizardSession {
  id: string;
  user_id: string;
  template_id: string;
  answer_history: Array<{
    questionId: string;
    answer: string;
    timestamp: string;
  }>;
  current_question_index: number;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedDocument {
  id: string;
  user_id: string;
  template_id: string;
  document_data: Record<string, any>;
  content: string;
  is_deleted_by_user: boolean;
  created_at: string;
}
