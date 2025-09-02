export interface AIConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  defaultLanguage: string;
  supportedLanguages: string[];
  safetySettings: {
    harassment: string;
    hateSpeech: string;
    sexuallyExplicit: string;
    dangerousContent: string;
  };
}

export const AI_CONFIG: AIConfig = {
  model: process.env.GOOGLE_AI_MODEL || 'gemini-pro',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  topP: parseFloat(process.env.AI_TOP_P || '0.9'),
  defaultLanguage: 'uk',
  supportedLanguages: ['uk', 'en', 'de'],
  safetySettings: {
    harassment: 'BLOCK_MEDIUM_AND_ABOVE',
    hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
    sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
    dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE'
  }
};

export const REPLY_TYPES = {
  ACADEMIC: 'academic',
  ADMINISTRATIVE: 'administrative',
  STUDENT_SUPPORT: 'student_support',
  COLLEAGUE: 'colleague',
  URGENT: 'urgent',
  CONFIRMATION: 'confirmation'
} as const;

export const REPLY_TONES = {
  PROFESSIONAL: 'professional',
  SUPPORTIVE: 'supportive',
  ENCOURAGING: 'encouraging',
  INSTRUCTIVE: 'instructive',
  COLLABORATIVE: 'collaborative'
} as const;

export const LANGUAGES = {
  UKRAINIAN: 'uk',
  ENGLISH: 'en',
  GERMAN: 'de'
} as const;

// Валідація параметрів
export function validateReplyType(replyType: string): boolean {
  return Object.values(REPLY_TYPES).includes(replyType as any);
}

export function validateReplyTone(replyTone: string): boolean {
  return Object.values(REPLY_TONES).includes(replyTone as any);
}

export function validateLanguage(language: string): boolean {
  return Object.values(LANGUAGES).includes(language as any);
}

// Отримання описів для UI
export function getReplyTypeLabel(replyType: string): string {
  const labels: Record<string, string> = {
    [REPLY_TYPES.ACADEMIC]: '🎓 Академічна',
    [REPLY_TYPES.ADMINISTRATIVE]: '📋 Адміністративна',
    [REPLY_TYPES.STUDENT_SUPPORT]: '👨‍🎓 Підтримка студентів',
    [REPLY_TYPES.COLLEAGUE]: '🤝 Колегам',
    [REPLY_TYPES.URGENT]: '⚡ Термінова',
    [REPLY_TYPES.CONFIRMATION]: '✅ Підтвердження'
  };
  return labels[replyType] || replyType;
}

export function getReplyToneLabel(replyTone: string): string {
  const labels: Record<string, string> = {
    [REPLY_TONES.PROFESSIONAL]: '🎯 Професійний',
    [REPLY_TONES.SUPPORTIVE]: '💪 Підтримуючий',
    [REPLY_TONES.ENCOURAGING]: '🌟 Заохочувальний',
    [REPLY_TONES.INSTRUCTIVE]: '📚 Інструктивний',
    [REPLY_TONES.COLLABORATIVE]: '🤝 Колаборативний'
  };
  return labels[replyTone] || replyTone;
}

export function getLanguageLabel(language: string): string {
  const labels: Record<string, string> = {
    [LANGUAGES.UKRAINIAN]: '🇺🇦 Українська',
    [LANGUAGES.ENGLISH]: '🇺🇸 English',
    [LANGUAGES.GERMAN]: '🇩🇪 Deutsch'
  };
  return labels[language] || language;
}
