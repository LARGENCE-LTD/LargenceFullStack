import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DocumentTemplateEmbedding,
  RAGSearchResult,
  EmbeddingRequest,
  EmbeddingResponse,
  LLMRequest,
  LLMResponse,
  DocumentTemplate,
  LLMQuestionAnalysis,
  ConversationState,
  Question
} from '../types';

export class RAGService {
  private supabaseClient: SupabaseClient;
  private embeddingClient: AxiosInstance;
  private llmClient: AxiosInstance;
  private embeddingApiKey: string;
  private llmApiKey: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.embeddingApiKey = process.env.EMBEDDING_API_KEY || '';
    this.llmApiKey = process.env.LLM_API_KEY || '';

    // Check if we're using placeholder values
    const isUsingPlaceholders = supabaseUrl?.includes('placeholder') || 
                               supabaseKey?.includes('placeholder') ||
                               this.embeddingApiKey?.includes('placeholder') ||
                               this.llmApiKey?.includes('placeholder');

    if (isUsingPlaceholders) {
      console.warn('⚠️  Using placeholder RAG configuration. RAG operations will be simulated.');
      // Create mock clients for development
      this.supabaseClient = this.createMockSupabaseClient();
      this.embeddingClient = this.createMockEmbeddingClient();
      this.llmClient = this.createMockLLMClient();
    } else if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    } else if (!this.embeddingApiKey) {
      throw new Error('Missing embedding API key. Please set EMBEDDING_API_KEY environment variable.');
    } else if (!this.llmApiKey) {
      throw new Error('Missing LLM API key. Please set LLM_API_KEY environment variable.');
    } else {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);

      // Initialize embedding API client (OpenAI)
      this.embeddingClient = axios.create({
        baseURL: 'https://api.openai.com/v1',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.embeddingApiKey}`
        }
      });

      // Initialize LLM API client (OpenAI)
      this.llmClient = axios.create({
        baseURL: 'https://api.openai.com/v1',
        timeout: 60000, // Longer timeout for LLM responses
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.llmApiKey}`
        }
      });
    }
  }

  private createMockSupabaseClient(): any {
    return {
      rpc: async (func: string, params: any) => {
        // Mock vector similarity search
        if (func === 'match_document_templates') {
          return { data: [{ template_id: 'mock-template-id', similarity: 0.95 }] };
        }
        return { data: [] };
      },
      from: (table: string) => ({
        select: (columns: string) => ({
          eq: (column: string, value: any) => ({
            single: async () => ({
              data: {
                id: 'mock-template-id',
                name: 'Mock Document Template',
                content: 'This is a mock template for testing.',
                questions: [{ id: 'q1', text: 'What is your name?' }, { id: 'q2', text: 'What is your email?' }]
              }
            })
          })
        })
      })
    };
  }

  private createMockEmbeddingClient(): any {
    return {
      post: async (url: string, data: any) => ({
        data: {
          data: [{ embedding: Array(1536).fill(0.1) }]
        }
      })
    };
  }

  private createMockLLMClient(): any {
    return {
      post: async (url: string, data: any) => ({
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                answered_question_ids: [],
                next_question_to_ask: 'What is your name?'
              })
            }
          }]
        }
      })
    };
  }

  /**
   * Generate embedding for text using OpenAI's text-embedding-ada-002
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const request: EmbeddingRequest = { text };
      
      const response: AxiosResponse<{ data: EmbeddingResponse[] }> = await this.embeddingClient.post(
        '/embeddings',
        {
          input: text,
          model: 'text-embedding-ada-002'
        }
      );

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('No embedding generated');
      }

      const embedding = response.data.data[0];
      if (!embedding || !embedding.embedding) {
        throw new Error('Invalid embedding response');
      }

      return embedding.embedding!;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate embedding: ${error.message}`);
      }
      throw new Error('Failed to generate embedding: Unknown error');
    }
  }

  /**
   * Search for similar templates using vector similarity
   */
  async searchSimilarTemplates(queryEmbedding: number[], limit: number = 3): Promise<RAGSearchResult[]> {
    try {
      const { data, error } = await this.supabaseClient.rpc('match_document_templates', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw new Error(`Failed to search templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<DocumentTemplate> {
    try {
      const { data, error } = await this.supabaseClient
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
   * Generate first question using LLM with RAG context
   */
  async generateFirstQuestion(userMessage: string, template: DocumentTemplate): Promise<string> {
    try {
      const context = `Template: ${template.name}\nDescription: ${template.description || 'No description'}\nQuestions: ${JSON.stringify(template.questions)}`;
      
      const prompt = `Context: The most relevant document is a '${template.name}'. 

User's Request: "${userMessage}"

Your Task: Based on this context, ask the first clarifying question to begin filling out the ${template.name}. 

Guidelines:
- Be specific and relevant to the document type
- Ask for the most important information first
- Keep the question clear and concise
- Focus on the first question from the template's question list

Template Questions: ${template.questions.map(q => q.text).join('\n')}

First Question:`;

      const request: LLMRequest = {
        prompt,
        context
      };

      const response: AxiosResponse<{ choices: { message: { content: string } }[] }> = await this.llmClient.post(
        '/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful legal document assistant. Generate clear, specific questions to help users fill out legal documents.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        }
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from LLM');
      }

      const choice = response.data.choices[0];
      if (!choice || !choice.message || !choice.message.content) {
        throw new Error('Invalid LLM response format');
      }

      return choice.message.content!.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate first question: ${error.message}`);
      }
      throw new Error('Failed to generate first question: Unknown error');
    }
  }

  /**
   * Store template embedding in database
   */
  async storeTemplateEmbedding(templateId: string, content: string, embedding: number[]): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('document_template_embeddings')
        .insert({
          template_id: templateId,
          content,
          embedding
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new Error(`Failed to store template embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all templates for embedding generation
   */
  async getAllTemplates(): Promise<DocumentTemplate[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('document_templates')
        .select('*');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw new Error(`Failed to get templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze user message for preemptive answers and determine next question
   */
  async analyzeUserMessage(
    userMessage: string,
    template: DocumentTemplate,
    answeredQuestions: string[],
    conversationHistory: any[]
  ): Promise<LLMQuestionAnalysis> {
    try {
      // Get remaining unanswered questions
      const remainingQuestions = template.questions.filter(q => !answeredQuestions.includes(q.id));
      
      const prompt = `**Your Role:** You are a highly efficient legal document assistant. Your goal is to gather information by asking questions from a predefined list, but you must **never** ask a question that the user has already answered.

**Context:**
* **Conversation History:** ${JSON.stringify(conversationHistory)}
* **List of UNANSWERED Questions:** ${JSON.stringify(remainingQuestions)}

**Your Two-Step Task:**

**Step 1: Analyze the User's Last Message.**
* Read the user's most recent message carefully: "${userMessage}"
* Compare it against the **List of UNANSWERED Questions**.
* Determine if the user's message preemptively answers one or more of the questions in the list.

**Step 2: Generate Your Response.**
* Based on your analysis, you will generate a JSON object as your response. This is critical.
* The JSON object must have two keys: \`answered_question_ids\` and \`next_question_to_ask\`.

**Response Scenarios:**

* **Scenario A (Normal Answer):** If the user's last message simply answers the *previous* question and does not contain any extra information, respond with:
  \`\`\`json
  {
    "answered_question_ids": ["q2"],
    "next_question_to_ask": "What is the effective date?"
  }
  \`\`\`
* **Scenario B (Preemptive Answer):** If the user's last message answers the previous question AND ALSO answers one or more future questions, identify all answered questions. For example, if the user said, "The previous answer is X, and the effective date will be tomorrow, January 1st," you would respond:
  \`\`\`json
  {
    "answered_question_ids": ["q2", "q3"],
    "next_question_to_ask": "What state's laws govern this agreement?"
  }
  \`\`\`
* **Scenario C (Off-Topic):** If the user's message is off-topic, respond with:
  \`\`\`json
  {
    "answered_question_ids": [],
    "next_question_to_ask": "Let's focus on completing your document. Could you please answer the current question?"
  }
  \`\`\`

**Generate only the JSON object in your response.**`;

      const response: AxiosResponse<{ choices: { message: { content: string } }[] }> = await this.llmClient.post(
        '/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful legal document assistant. Analyze user messages and return structured JSON responses.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.1 // Low temperature for consistent JSON output
        }
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from LLM');
      }

      const choice = response.data.choices[0];
      if (!choice || !choice.message || !choice.message.content) {
        throw new Error('Invalid LLM response format');
      }

      const content = choice.message.content.trim();
      
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const analysis: LLMQuestionAnalysis = JSON.parse(jsonMatch[0]);
      
      // Validate response structure
      if (!analysis.answered_question_ids || !analysis.next_question_to_ask) {
        throw new Error('Invalid LLM response structure');
      }

      return analysis;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to analyze user message: ${error.message}`);
      }
      throw new Error('Failed to analyze user message: Unknown error');
    }
  }
} 