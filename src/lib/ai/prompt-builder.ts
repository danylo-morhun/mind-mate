export interface GenerateReplyParams {
  emailContent: string;
  emailSubject: string;
  emailFrom: string;
  replyType: string;
  templateId?: string;
  customInstructions?: string;
  tone: string;
  language: string;
}

export interface PromptContext {
  systemPrompt: string;
  contextPrompt: string;
  instructionsPrompt: string;
  fullPrompt: string;
}

export function buildGeminiPrompt(params: GenerateReplyParams): PromptContext {
  const {
    emailContent,
    emailSubject,
    emailFrom,
    replyType,
    templateId,
    customInstructions,
    tone,
    language
  } = params;

  // Системний prompt - основна роль AI
  const systemPrompt = `Ти - Mind Mate AI Assistant, інтелектуальний помічник для університетських викладачів та працівників.

Твоє завдання - генерувати професійні, контекстні відповіді на листи українською мовою.

ВАЖЛИВО - РОЗУМІННЯ РОЛЕЙ:
- Лист прийшов КОРИСТУВАЧУ (отримувачу) від ВІДПРАВНИКА
- Ти генеруєш відповідь КОРИСТУВАЧА (як би він відповідав ВІДПРАВНИКУ)
- НЕ звертайся до користувача в третій особі
- Використовуй "я", "мені", "моя" - ніби це пише сам користувач

ОСОБЛИВОСТІ:
- Використовуй університетську термінологію та стиль
- Адаптуйся під контекст листа та тему
- Створюй відповіді, які відповідають вибраному типу та тону
- Завжди використовуй українську мову
- Додавай відповідне привітання та професійний підпис`;

  // Контекст листа
  const contextPrompt = `КОНТЕКСТ ЛИСТА:
📧 Тема: ${emailSubject}
👤 Від: ${emailFrom}
📝 Зміст: ${emailContent}

ПАРАМЕТРИ ВІДПОВІДІ:
🎯 Тип: ${getReplyTypeDescription(replyType)}
🎨 Тон: ${getToneDescription(tone)}
🌍 Мова: ${getLanguageDescription(language)}
${templateId ? `📋 Шаблон: ${templateId}` : '🎯 Без шаблону'}`;

  // Інструкції для генерації
  const instructionsPrompt = `ІНСТРУКЦІЇ ДЛЯ ГЕНЕРАЦІЇ:

1. СТРУКТУРА ВІДПОВІДІ:
   - Привітання (відповідно до типу та тону)
   - Основна частина (контекстна відповідь)
   - Завершення та підпис

2. СТИЛЬ ТА ТОН:
   - Тип: ${getReplyTypeDescription(replyType)}
   - Тон: ${getToneDescription(tone)}
   - Мова: ${language === 'uk' ? 'Українська' : language}

3. КОНТЕКСТ:
   - Врахуй тему листа: "${emailSubject}"
   - Адаптуйся під зміст: "${emailContent.substring(0, 100)}..."
   - Відповідай на конкретні питання або запити
   - Розумій: це лист ВІД ВІДПРАВНИКА ДО КОРИСТУВАЧА
   - Ти генеруєш відповідь КОРИСТУВАЧА НА ВІДПРАВНИКА

4. СПЕЦІАЛЬНІ ВИМОГИ:
   ${customInstructions ? `- ${customInstructions}` : '- Створи професійну та корисну відповідь'}

5. ПІДПИС:
   - Завжди закінчуй: "З повагою,\nMind Mate AI Assistant"

6. ПРИКЛАД РОЗУМІННЯ РОЛЕЙ:
   - Якщо лист про вакансію: "Дякую за пропозицію вакансії..."
   - Якщо лист з питанням: "Відповідаю на ваше питання..."
   - Якщо лист з пропозицією: "Розглядаю вашу пропозицію..."
   - НЕ пиши: "Дякую, що ти отримав..." (це неправильно!)`;

  const fullPrompt = `${systemPrompt}

${contextPrompt}

${instructionsPrompt}

ПОЧНИ ГЕНЕРАЦІЮ ВІДПОВІДІ:`;

  return {
    systemPrompt,
    contextPrompt,
    instructionsPrompt,
    fullPrompt
  };
}

// Допоміжні функції для опису параметрів
function getReplyTypeDescription(replyType: string): string {
  const descriptions: Record<string, string> = {
    'academic': '🎓 Академічна - для навчальних та наукових питань',
    'administrative': '📋 Адміністративна - для документів, заявок, довідок',
    'student_support': '👨‍🎓 Підтримка студентів - для допомоги та підтримки',
    'colleague': '🤝 Колегам - для співпраці з колегами',
    'urgent': '⚡ Термінова - для швидких відповідей',
    'confirmation': '✅ Підтвердження - для підтвердження отримання'
  };
  return descriptions[replyType] || replyType;
}

function getToneDescription(tone: string): string {
  const descriptions: Record<string, string> = {
    'professional': '🎯 Професійний - діловий стиль',
    'supportive': '💪 Підтримуючий - підтримка та заохочення',
    'encouraging': '🌟 Заохочувальний - мотивація та натхнення',
    'instructive': '📚 Інструктивний - надання інструкцій',
    'collaborative': '🤝 Колаборативний - для спільної роботи'
  };
  return descriptions[tone] || tone;
}

function getLanguageDescription(language: string): string {
  const descriptions: Record<string, string> = {
    'uk': '🇺🇦 Українська',
    'en': '🇺🇸 English',
    'de': '🇩🇪 Deutsch'
  };
  return descriptions[language] || language;
}

// Функція для створення короткого prompt (для тестування)
export function buildSimplePrompt(params: GenerateReplyParams): string {
  const { emailSubject, replyType, tone, customInstructions } = params;
  
  return `Створи професійну відповідь українською мовою на лист про "${emailSubject}".

ВАЖЛИВО: Ти генеруєш відповідь КОРИСТУВАЧА (як би він відповідав відправнику листа).
НЕ звертайся до користувача в третій особі, використовуй "я", "мені", "моя".

Тип: ${replyType}
Тон: ${tone}
${customInstructions ? `Додатково: ${customInstructions}` : ''}

Відповідь має бути професійною, корисною та відповідати контексту листа.`;
}
