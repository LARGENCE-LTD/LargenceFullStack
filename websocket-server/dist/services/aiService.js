"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
const ragService_1 = require("./ragService");
class AIService {
    client;
    apiKey;
    ragService;
    constructor() {
        const aiServiceUrl = process.env.AI_SERVICE_URL;
        this.apiKey = process.env.AI_SERVICE_API_KEY || '';
        if (!aiServiceUrl) {
            throw new Error('Missing AI service configuration. Please set AI_SERVICE_URL environment variable.');
        }
        if (!this.apiKey) {
            throw new Error('Missing AI service API key. Please set AI_SERVICE_API_KEY environment variable.');
        }
        this.client = axios_1.default.create({
            baseURL: aiServiceUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        this.ragService = new ragService_1.RAGService();
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.error?.message || error.response.data?.message || 'AI service error';
                if (status >= 500) {
                    throw new Error(`AI service unavailable: ${message}`);
                }
                else if (status === 401) {
                    throw new Error('AI service authentication failed');
                }
                else if (status === 404) {
                    throw new Error('AI service endpoint not found');
                }
                else {
                    throw new Error(`AI service error (${status}): ${message}`);
                }
            }
            else if (error.request) {
                throw new Error('AI service is not responding. Please try again in a moment.');
            }
            else {
                throw new Error(`AI service request failed: ${error.message}`);
            }
        });
    }
    async classifyAndStart(sessionId, userMessage) {
        try {
            console.log(`Starting RAG classification for session ${sessionId}`);
            console.log(`User message: "${userMessage}"`);
            console.log('Generating embedding for user message...');
            const userEmbedding = await this.ragService.generateEmbedding(userMessage);
            console.log(`Embedding generated (${userEmbedding.length} dimensions)`);
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
            console.log('Fetching template details...');
            const template = await this.ragService.getTemplate(bestMatch.template_id);
            console.log(`Template loaded: ${template.name}`);
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
        }
        catch (error) {
            console.error('RAG classification failed:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to classify intent: ${error.message}`);
            }
            throw new Error('Failed to classify intent: Unknown error');
        }
    }
    async getNextQuestion(sessionId, userMessage, session) {
        try {
            console.log(`Analyzing user message for preemptive answers in session ${sessionId}`);
            console.log(`User message: "${userMessage}"`);
            if (!session.template_id) {
                throw new Error('No template associated with session');
            }
            const template = await this.ragService.getTemplate(session.template_id);
            console.log(`Template loaded: ${template.name}`);
            console.log('Analyzing user message with LLM...');
            const analysis = await this.ragService.analyzeUserMessage(userMessage, template, session.answered_questions || [], session.conversation_history || []);
            console.log(`Analysis complete:`);
            console.log(`   - Answered questions: ${analysis.answered_question_ids.join(', ')}`);
            console.log(`   - Next question: "${analysis.next_question_to_ask}"`);
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
        }
        catch (error) {
            console.error('Preemptive answer analysis failed:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to get next question: ${error.message}`);
            }
            throw new Error('Failed to get next question: Unknown error');
        }
    }
    async healthCheck() {
        try {
            await this.client.get('/health');
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map