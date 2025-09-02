# 🤖 Google Gemini Integration для Mind Mate

## 📋 **Огляд**

Цей документ описує інтеграцію Mind Mate з Google Gemini AI для генерації професійних відповідей на листи.

## 🚀 **Архітектура**

### **1. Компоненти системи:**
```
src/lib/ai/
├── gemini-client.ts      # Клієнт для роботи з Gemini API
├── prompt-builder.ts     # Побудова prompt'ів для AI
└── config.ts            # Конфігурація AI параметрів

src/app/api/ai/
├── generate-reply/      # Основний API для генерації відповідей
└── test-gemini/        # Тестовий API для перевірки підключення
```

### **2. Flow генерації:**
```
Frontend → API Route → Prompt Builder → Gemini Client → Gemini API → Response
```

## 🔧 **Налаштування**

### **1. Отримання API ключа:**
1. Перейдіть на [Google AI Studio](https://aistudio.google.com/)
2. Увійдіть з вашим Google акаунтом
3. Створіть новий API ключ
4. Скопіюйте ключ

### **2. Environment Variables:**
```bash
# .env.local
GOOGLE_AI_API_KEY=your_gemini_api_key_here
GOOGLE_AI_MODEL=gemini-1.5-flash
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7
AI_TOP_P=0.9
```

### **3. Встановлення залежностей:**
```bash
npm install @google/generative-ai
```

## 🎯 **Використання**

### **1. Базове використання:**
```typescript
import { getGeminiClient } from '@/lib/ai/gemini-client';

const geminiClient = getGeminiClient();
const response = await geminiClient.generateReply('Ваш prompt тут');
```

### **2. Генерація відповіді на лист:**
```typescript
import { buildGeminiPrompt } from '@/lib/ai/prompt-builder';

const promptContext = buildGeminiPrompt({
  emailContent: 'Зміст листа...',
  emailSubject: 'Тема листа',
  emailFrom: 'sender@example.com',
  replyType: 'academic',
  tone: 'professional',
  language: 'uk'
});

const response = await geminiClient.generateReply(promptContext.fullPrompt);
```

## 🧪 **Тестування**

### **1. Тест підключення:**
```bash
# GET запит для тесту підключення
curl "http://localhost:3000/api/ai/test-gemini" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Тест з кастомним prompt:**
```bash
# POST запит з кастомним prompt
curl -X POST "http://localhost:3000/api/ai/test-gemini" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt": "Створи коротку відповідь українською мовою"}'
```

## 📊 **Метрики та моніторинг**

### **1. Відстежувані показники:**
- Час відповіді Gemini API
- Кількість токенів у відповіді
- Успішність/невдачі запитів
- Довжина prompt'а

### **2. Логування:**
```typescript
console.log('Gemini API success - Model:', modelUsed, 'Tokens:', aiReply.length);
console.error('Gemini API failed, falling back to mock:', geminiError);
```

## 🔒 **Безпека**

### **1. Safety Settings:**
```typescript
safetySettings: {
  harassment: 'BLOCK_MEDIUM_AND_ABOVE',
  hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
  sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
  dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE'
}
```

### **2. Валідація параметрів:**
- Перевірка типів відповідей
- Валідація тонів
- Контроль мов

## 🚨 **Обробка помилок**

### **1. Fallback стратегія:**
```typescript
try {
  // Спробуємо Gemini API
  aiReply = await geminiClient.generateReply(prompt);
        modelUsed = 'gemini-1.5-flash';
} catch (geminiError) {
  // Fallback до mock AI
  aiReply = await generateMockAIReply(params);
  modelUsed = 'mock-ai-fallback';
}
```

### **2. Типи помилок:**
- **API недоступність** - fallback до mock
- **Невірний API ключ** - помилка авторизації
- **Перевищення лімітів** - обмеження запитів
- **Некоректний prompt** - валідація параметрів

## 💰 **Вартість та ліміти**

### **1. Gemini Pro:**
- **Безкоштовно:** 15 запитів/хвилину
- **Платний:** $0.0025 за 1K input tokens, $0.01 за 1K output tokens

### **2. Рекомендації:**
- Використовуйте безкоштовний план для тестування
- Моніторьте використання токенів
- Оптимізуйте prompt'и для зменшення вартості

## 🔮 **Майбутні покращення**

### **1. Кешування:**
- Збереження схожих відповідей
- Зменшення повторних запитів
- Прискорення відповідей

### **2. Batch обробка:**
- Генерація кількох відповідей одночасно
- Оптимізація використання API
- Зменшення затримок

### **3. Аналітика:**
- Детальна статистика використання
- Аналіз якості відповідей
- Оптимізація prompt'ів

## 📞 **Підтримка**

### **1. Поширені проблеми:**
- **"API key invalid"** - перевірте GOOGLE_AI_API_KEY
- **"Rate limit exceeded"** - зменшіть частоту запитів
- **"Model not found"** - перевірте GOOGLE_AI_MODEL

### **2. Корисні посилання:**
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Pricing Calculator](https://ai.google.dev/pricing)

---

## 🎉 **Висновок**

Інтеграція з Google Gemini надає Mind Mate доступ до найсучасніших AI можливостей для генерації професійних відповідей на листи. Система автоматично fallback'ає до mock AI у випадку проблем з Gemini API, забезпечуючи надійність та доступність.

**Gemini готовий покращити якість AI відповідей у Mind Mate! 🚀**
