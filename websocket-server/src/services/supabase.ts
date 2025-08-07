import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  DocumentTemplate, 
  ChatSession, 
  GeneratedDocument, 
  ConversationMessage,
  TemplateValidationResult 
} from '../types';

export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check if we're using placeholder values
    const isUsingPlaceholders = supabaseUrl?.includes('placeholder') || supabaseKey?.includes('placeholder');

    if (isUsingPlaceholders) {
      console.warn('⚠️  Using placeholder Supabase configuration. Database operations will be simulated.');
      // Create a mock client for development
      this.client = this.createMockClient();
    } else if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    } else {
      this.client = createClient(supabaseUrl, supabaseKey);
    }
  }

  private createMockClient(): any {
    // Mock Supabase client for development/testing
    return {
      auth: {
        getUser: async (token: string) => {
          // Simulate successful token validation with a mock user ID
          return { data: { user: { id: 'mock-user-id-' + Date.now() } }, error: null };
        }
      },
      from: (table: string) => ({
        select: (columns: string) => ({
          eq: (column: string, value: any) => ({
            order: (column: string, options: any) => ({
              limit: (count: number) => ({
                single: async () => ({ data: null, error: { code: 'PGRST116' } })
              })
            })
          })
        }),
        insert: async (data: any) => ({ data: { id: 'mock-session-' + Date.now() }, error: null }),
        update: async (data: any) => ({ data: null, error: null }),
        delete: async () => ({ data: null, error: null })
      })
    };
  }

  /**
   * Validate a Supabase JWT token and return the user ID
   */
  async validateToken(token: string): Promise<string> {
    try {
      const { data: { user }, error } = await this.client.auth.getUser(token);
      
      if (error || !user) {
        throw new Error('Invalid or expired token');
      }

      return user.id;
    } catch (error) {
      throw new Error(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that a template exists and is accessible
   */
  async validateTemplate(templateId: string): Promise<TemplateValidationResult> {
    try {
      const { data, error } = await this.client
        .from('document_templates')
        .select('id, name')
        .eq('id', templateId)
        .single();

      if (error || !data) {
        return {
          isValid: false,
          error: 'Template not found'
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: `Template validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Find an existing incomplete session for a user (template-agnostic)
   */
  async findExistingSession(userId: string): Promise<ChatSession | null> {
    try {
      const { data, error } = await this.client
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_complete', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      return data || null;
    } catch (error) {
      throw new Error(`Failed to find existing session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new chat session (template_id will be set by AI service)
   */
  async createSession(userId: string): Promise<ChatSession> {
    try {
      const { data, error } = await this.client
        .from('chat_sessions')
        .insert({
          user_id: userId,
          template_id: null, // Will be set by AI service after intent classification
          conversation_history: [],
          answered_questions: [],
          current_question_index: 0,
          is_complete: false
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error('Failed to create session');
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update conversation history for a session
   */
  async updateConversationHistory(sessionId: string, message: ConversationMessage): Promise<void> {
    try {
      // First get the current conversation history
      const { data: currentSession, error: fetchError } = await this.client
        .from('chat_sessions')
        .select('conversation_history')
        .eq('id', sessionId)
        .single();

      if (fetchError || !currentSession) {
        throw new Error('Session not found');
      }

      // Append the new message to the existing history
      const updatedHistory = [
        ...(currentSession.conversation_history || []),
        message
      ];

      const { error } = await this.client
        .from('chat_sessions')
        .update({
          conversation_history: updatedHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to update conversation history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update session template_id after AI classification
   */
  async updateSessionTemplate(sessionId: string, templateId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('chat_sessions')
        .update({
          template_id: templateId,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to update session template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update answered questions and current question index
   */
  async updateQuestionProgress(sessionId: string, answeredQuestions: string[], currentQuestionIndex: number): Promise<void> {
    try {
      const { error } = await this.client
        .from('chat_sessions')
        .update({
          answered_questions: answeredQuestions,
          current_question_index: currentQuestionIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to update question progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark a session as complete
   */
  async markSessionComplete(sessionId: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('chat_sessions')
        .update({
          is_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to mark session complete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a generated document
   */
  async createGeneratedDocument(userId: string, templateId: string, documentData: Record<string, any>): Promise<GeneratedDocument> {
    try {
      const { data, error } = await this.client
        .from('generated_documents')
        .insert({
          user_id: userId,
          template_id: templateId,
          document_data: documentData
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error('Failed to create generated document');
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to create generated document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a document template by ID
   */
  async getTemplate(templateId: string): Promise<DocumentTemplate> {
    try {
      const { data, error } = await this.client
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error || !data) {
        throw new Error('Template not found');
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to get template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up old incomplete sessions (for scheduled task)
   */
  async cleanupOldSessions(): Promise<number> {
    try {
      const { count, error } = await this.client
        .from('chat_sessions')
        .delete()
        .eq('is_complete', false)
        .lt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // 24 hours ago

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      throw new Error(`Failed to cleanup old sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 