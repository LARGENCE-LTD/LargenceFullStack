"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
class SupabaseService {
    client;
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }
        this.client = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async validateToken(token) {
        try {
            const { data: { user }, error } = await this.client.auth.getUser(token);
            if (error || !user) {
                throw new Error('Invalid or expired token');
            }
            return user.id;
        }
        catch (error) {
            throw new Error(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async validateTemplate(templateId) {
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
        }
        catch (error) {
            return {
                isValid: false,
                error: `Template validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async findExistingSession(userId) {
        try {
            const { data, error } = await this.client
                .from('chat_sessions')
                .select('*')
                .eq('user_id', userId)
                .eq('is_complete', false)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            return data || null;
        }
        catch (error) {
            throw new Error(`Failed to find existing session: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createSession(userId) {
        try {
            const { data, error } = await this.client
                .from('chat_sessions')
                .insert({
                user_id: userId,
                template_id: null,
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
        }
        catch (error) {
            throw new Error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updateConversationHistory(sessionId, message) {
        try {
            const { data: currentSession, error: fetchError } = await this.client
                .from('chat_sessions')
                .select('conversation_history')
                .eq('id', sessionId)
                .single();
            if (fetchError || !currentSession) {
                throw new Error('Session not found');
            }
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
        }
        catch (error) {
            throw new Error(`Failed to update conversation history: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updateSessionTemplate(sessionId, templateId) {
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
        }
        catch (error) {
            throw new Error(`Failed to update session template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updateQuestionProgress(sessionId, answeredQuestions, currentQuestionIndex) {
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
        }
        catch (error) {
            throw new Error(`Failed to update question progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async markSessionComplete(sessionId) {
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
        }
        catch (error) {
            throw new Error(`Failed to mark session complete: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createGeneratedDocument(userId, templateId, documentData) {
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
        }
        catch (error) {
            throw new Error(`Failed to create generated document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getTemplate(templateId) {
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
        }
        catch (error) {
            throw new Error(`Failed to get template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async cleanupOldSessions() {
        try {
            const { count, error } = await this.client
                .from('chat_sessions')
                .delete()
                .eq('is_complete', false)
                .lt('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
            if (error) {
                throw error;
            }
            return count || 0;
        }
        catch (error) {
            throw new Error(`Failed to cleanup old sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.SupabaseService = SupabaseService;
//# sourceMappingURL=supabase.js.map