import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AIServiceRequest, 
  AIServiceResponse, 
  AIServiceClassifyRequest, 
  AIServiceClassifyResponse 
} from '../types';
import { RAGService } from './ragService';

export class AIService {
  private client: AxiosInstance;
  private apiKey: string;
  private ragService: RAGService;

  constructor() {
    const aiServiceUrl = process.env.AI_SERVICE_URL;
    this.apiKey = process.env.AI_SERVICE_API_KEY || '';

    // Check if we're using placeholder values
    const isUsingPlaceholders = aiServiceUrl?.includes('localhost:3001') || this.apiKey?.includes('placeholder');

    if (isUsingPlaceholders) {
      console.warn('⚠️  Using placeholder AI service configuration. AI operations will be simulated.');
      // Create a mock client for development
      this.client = this.createMockClient();
    } else if (!aiServiceUrl) {
      throw new Error('Missing AI service configuration. Please set AI_SERVICE_URL environment variable.');
    } else if (!this.apiKey) {
      throw new Error('Missing AI service API key. Please set AI_SERVICE_API_KEY environment variable.');
    } else {
      this.client = axios.create({
        baseURL: aiServiceUrl,
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
    }

    // Initialize RAG service
    this.ragService = new RAGService();
  }

  private createMockClient(): any {
    // Mock AI service client for development/testing
    return {
      post: async (url: string, data: any) => {
        // Simulate AI service responses
        if (url.includes('classify-and-start')) {
          return {
            data: {
              status: 'success',
              template_id: 'mock-template-id',
              first_question: 'Hello! I can help you create a document. What type of document would you like to generate?',
              template_name: 'Mock Document Template'
            }
          };
        } else if (url.includes('next-question')) {
          return {
            data: {
              status: 'success',
              next_question: 'Thank you for that information. What is your name?',
              answered_question_ids: [],
              is_complete: false
            }
          };
        }
        return { data: { status: 'success' } };
      }
    };

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const message = error.response.data?.error?.message || error.response.data?.message || 'AI service error';
          
          if (status >= 500) {
            throw new Error(`AI service unavailable: ${message}`);
          } else if (status === 401) {
            throw new Error('AI service authentication failed');
          } else if (status === 404) {
            throw new Error('AI service endpoint not found');
          } else {
            throw new Error(`AI service error (${status}): ${message}`);
          }
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('AI service is not responding. Please try again in a moment.');
        } else {
          // Something else happened
          throw new Error(`AI service request failed: ${error.message}`);
        }
      }
    );
  }

  /**
   * Classify user intent and start document generation using RAG (first message)
   */
  async classifyAndStart(sessionId: string, userMessage: string): Promise<AIServiceClassifyResponse> {
    try {
      console.log(`Starting RAG classification for session ${sessionId}`);
      console.log(`User message: "${userMessage}"`);

      // Step 1: Generate embedding for user message
      console.log('Generating embedding for user message...');
      const userEmbedding = await this.ragService.generateEmbedding(userMessage);
      console.log(`Embedding generated (${userEmbedding.length} dimensions)`);

      // Step 2: Search for similar templates
      console.log('Searching for similar templates...');
      const searchResults = await this.ragService.searchSimilarTemplates(userEmbedding, 1);
      
      if (searchResults.length === 0) {
        console.log('No similar templates found');
        return {
          status: 'error',
          error: {
            message: 'No suitable document template found for your request. Please try rephrasing.'
          }
        };
      }

      const bestMatch = searchResults[0];
      if (!bestMatch) {
        console.log('No best match found');
        return {
          status: 'error',
          error: {
            message: 'No suitable document template found for your request. Please try rephrasing.'
          }
        };
      }

      console.log(`Best match: Template ID ${bestMatch.template_id} (similarity: ${bestMatch.similarity_score.toFixed(3)})`);

      // Step 3: Get the full template
      console.log('Fetching template details...');
      const template = await this.ragService.getTemplate(bestMatch.template_id);
      console.log(`Template loaded: ${template.name}`);

      // Step 4: Generate first question using LLM with RAG context
      console.log('Generating first question with LLM...');
      const firstQuestion = await this.ragService.generateFirstQuestion(userMessage, template);
      console.log(`First question generated: "${firstQuestion}"`);

      return {
        status: 'success',
        templateId: bestMatch.template_id,
        nextQuestion: {
          text: firstQuestion
        }
      };

    } catch (error) {
      console.error('RAG classification failed:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to classify intent: ${error.message}`);
      }
      throw new Error('Failed to classify intent: Unknown error');
    }
  }

  /**
   * Get the next question using preemptive answer detection (subsequent messages)
   */
  async getNextQuestion(sessionId: string, userMessage: string, session: any): Promise<AIServiceResponse> {
    try {
      console.log(`Analyzing user message for preemptive answers in session ${sessionId}`);
      console.log(`User message: "${userMessage}"`);

      // Get the template for this session
      if (!session.template_id) {
        throw new Error('No template associated with session');
      }

      const template = await this.ragService.getTemplate(session.template_id);
      console.log(`Template loaded: ${template.name}`);

      // Analyze user message for preemptive answers
      console.log('Analyzing user message with LLM...');
      const analysis = await this.ragService.analyzeUserMessage(
        userMessage,
        template,
        session.answered_questions || [],
        session.conversation_history || []
      );

      console.log(`Analysis complete:`);
      console.log(`   - Answered questions: ${analysis.answered_question_ids.join(', ')}`);
      console.log(`   - Next question: "${analysis.next_question_to_ask}"`);

      // Check if all questions are answered
      const totalQuestions = template.questions.length;
      const currentAnsweredCount = (session.answered_questions || []).length + analysis.answered_question_ids.length;

      if (currentAnsweredCount >= totalQuestions) {
        console.log('All questions answered - session complete');
        return {
          status: 'complete',
          answeredQuestionIds: analysis.answered_question_ids
        };
      }

      return {
        status: 'in_progress',
        nextQuestion: {
          text: analysis.next_question_to_ask
        },
        answeredQuestionIds: analysis.answered_question_ids
      };

    } catch (error) {
      console.error('Preemptive answer analysis failed:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to get next question: ${error.message}`);
      }
      throw new Error('Failed to get next question: Unknown error');
    }
  }

  /**
   * Check if the AI service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
} 