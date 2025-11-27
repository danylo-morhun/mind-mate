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
  // @ts-expect-error - Google AI types are not fully typed
  private model: any;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = {
      maxTokens: 4096,
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
      
      console.log('Gemini API response received', {
        hasText: !!response.text(),
        textLength: response.text()?.length || 0,
        candidatesCount: response.candidates?.length || 0,
        safetyRatingsCount: response.safetyRatings?.length || 0
      });
      
      const safetyRatings = response.safetyRatings || [];
      const blocked = safetyRatings.some((rating: any) => rating.blocked);
      
      if (blocked) {
        const blockedReasons = safetyRatings
          .filter((rating: any) => rating.blocked)
          .map((rating: any) => `${rating.category}: ${rating.probability}`)
          .join(', ');
        console.warn('Response blocked by safety settings:', blockedReasons);
        throw new Error(`Відповідь заблокована через налаштування безпеки: ${blockedReasons}`);
      }
      
      let text = '';
      try {
        text = response.text();
      } catch (textError: any) {
        console.warn('Error getting text from response:', textError);
        const candidates = response.candidates || [];
        if (candidates.length > 0 && candidates[0].content?.parts) {
          text = candidates[0].content.parts
            .map((part: any) => part.text || '')
            .join('')
            .trim();
        }
      }
      
      const candidates = response.candidates || [];
      if (candidates.length > 0) {
        const candidate = candidates[0];
        
        if (candidate.finishReason === 'MAX_TOKENS' && text && text.trim().length > 0) {
          console.warn('Response truncated due to MAX_TOKENS, but returning partial response');
          return text;
        }
        
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
          if (candidate.finishReason === 'SAFETY') {
            throw new Error('Відповідь заблокована через налаштування безпеки (finishReason: SAFETY)');
          } else if (candidate.finishReason === 'MAX_TOKENS') {
            if (candidate.content?.parts) {
              const candidateText = candidate.content.parts
                .map((part: any) => part.text || '')
                .join('')
                .trim();
              
              if (candidateText && candidateText.length > 0) {
                console.warn('Response truncated due to MAX_TOKENS, but returning partial response from candidate');
                return candidateText;
              }
            }
            throw new Error(`Досягнуто максимальну кількість токенів (${this.config.maxTokens}). Збільште AI_MAX_TOKENS у .env.local (рекомендовано: 8192) або зменште довжину промпту.`);
          } else if (candidate.finishReason === 'RECITATION') {
            throw new Error('Відповідь заблокована через можливе рецитування захищеного контенту');
          }
        }
      }
      
      if (!text || text.trim().length === 0) {
        console.warn('Empty response from Gemini API', {
          candidates: JSON.stringify(response.candidates, null, 2),
          safetyRatings: JSON.stringify(safetyRatings, null, 2),
          promptLength: prompt.length,
          promptPreview: prompt.substring(0, 200)
        });
        
        if (candidates.length > 0) {
          const candidate = candidates[0];
          if (candidate.content?.parts) {
            const candidateText = candidate.content.parts
              .map((part: any) => part.text || '')
              .join('')
              .trim();
            
            if (candidateText) {
              console.log('Using text from candidate');
              return candidateText;
            }
          }
        }
        
        throw new Error('Отримано порожню відповідь від Gemini API. Можливо, відповідь була заблокована або модель не змогла згенерувати контент.');
      }
      
      return text;
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        const errorMessage = `Модель "${this.config.model}" недоступна. ` +
          `Спробуйте встановити GOOGLE_AI_MODEL в .env.local на одну з доступних моделей: ` +
          `gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-2.0-flash-001, або gemini-2.5-flash-lite. ` +
          `Перевірте доступні моделі через: curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY"`;
        throw new Error(errorMessage);
      }
      
      throw new Error(`Failed to generate reply: ${error?.message || error}`);
    }
  }

  async generateReplyWithSafety(prompt: string): Promise<{
    text: string;
    // @ts-expect-error - Google AI types are not fully typed
    safetyRatings: any[];
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
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      if (error?.message?.includes('not found') || error?.message?.includes('404')) {
        const errorMessage = `Модель "${this.config.model}" недоступна. ` +
          `Спробуйте встановити GOOGLE_AI_MODEL в .env.local на одну з доступних моделей: ` +
          `gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-2.0-flash-001, або gemini-2.5-flash-lite. ` +
          `Перевірте доступні моделі через: curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY"`;
        throw new Error(errorMessage);
      }
      
      throw new Error(`Failed to generate reply: ${error?.message || error}`);
    }
  }

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

let geminiClientInstance: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClientInstance) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
    }

    geminiClientInstance = new GeminiClient({
      apiKey,
      model: process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
      topP: parseFloat(process.env.AI_TOP_P || '0.9'),
    });
  }

  return geminiClientInstance;
}
