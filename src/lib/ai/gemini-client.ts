import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any; // @ts-ignore - Google AI types
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = {
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      ...config
    };

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: this.config.model,
      generationConfig: {
        maxOutputTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        topP: this.config.topP,
      }
    });
  }

  async generateReply(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate reply: ${error}`);
    }
  }

  async generateReplyWithSafety(prompt: string): Promise<{
    text: string;
    safetyRatings: any[]; // @ts-ignore - Google AI types
    blocked: boolean;
  }> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return {
        text: response.text(),
        safetyRatings: response.safetyRatings || [],
        blocked: response.safetyRatings?.some(r => r.blocked) || false
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate reply: ${error}`);
    }
  }

  // Метод для перевірки доступності API
  async testConnection(): Promise<boolean> {
    try {
      const testPrompt = 'Привіт! Це тестовий запит.';
      await this.generateReply(testPrompt);
      return true;
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

// Синглтон для глобального використання
let geminiClientInstance: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClientInstance) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }

    geminiClientInstance = new GeminiClient({
      apiKey,
      model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      topP: parseFloat(process.env.AI_TOP_P || '0.9'),
    });
  }

  return geminiClientInstance;
}
