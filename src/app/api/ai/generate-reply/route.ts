import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { buildGeminiPrompt } from '@/lib/ai/prompt-builder';
import { validateReplyType, validateReplyTone, validateLanguage } from '@/lib/ai/config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      emailContent, 
      emailSubject, 
      emailFrom, 
      replyType, 
      templateId, 
      customInstructions,
      tone,
      language = 'uk'
    } = body;

    if (!emailContent || !emailSubject) {
      return NextResponse.json(
        { error: 'Email content and subject are required' },
        { status: 400 }
      );
    }

    // Валідація параметрів
    if (!validateReplyType(replyType)) {
      return NextResponse.json(
        { error: 'Invalid reply type' },
        { status: 400 }
      );
    }

    if (!validateReplyTone(tone)) {
      return NextResponse.json(
        { error: 'Invalid reply tone' },
        { status: 400 }
      );
    }

    if (!validateLanguage(language)) {
      return NextResponse.json(
        { error: 'Invalid language' },
        { status: 400 }
      );
    }

    let aiReply: string;
    let modelUsed = 'mock-ai-fallback';
    let errorMessage = null;
    let promptContext: ReturnType<typeof buildGeminiPrompt> | null = null;

    try {
      // Спробуємо використати Gemini API
      console.log('🔍 Attempting to use Gemini API...');
      const geminiClient = getGeminiClient();
      console.log('✅ Gemini client created successfully');
      
      // Будуємо prompt для Gemini
      promptContext = buildGeminiPrompt({
        emailContent,
        emailSubject,
        emailFrom,
        replyType,
        templateId,
        customInstructions,
        tone,
        language
      });
      console.log('📝 Prompt built successfully, length:', promptContext.fullPrompt.length);
      
      // Генеруємо відповідь через Gemini
      console.log('🚀 Sending request to Gemini...');
      aiReply = await geminiClient.generateReply(promptContext.fullPrompt);
      modelUsed = 'gemini-1.5-flash';
      
      console.log('🎉 Gemini API success - Model:', modelUsed, 'Tokens:', aiReply.length);
      
    } catch (geminiError) {
      console.error('❌ Gemini API failed, falling back to mock:', geminiError);
      errorMessage = `Gemini API недоступний: ${geminiError}`;
      
      // Fallback до mock AI
      console.log('🔄 Using mock AI fallback...');
      aiReply = await generateMockAIReply({
        emailContent,
        emailSubject,
        emailFrom,
        replyType,
        templateId,
        customInstructions,
        tone,
        language
      });
      console.log('✅ Mock AI fallback completed');
    }

    return NextResponse.json({
      success: true,
      reply: aiReply,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: modelUsed,
        tokens: aiReply.length,
        error: errorMessage,
        promptLength: promptContext?.fullPrompt?.length || 0
      }
    });

  } catch (error) {
    console.error('AI Reply generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI reply' },
      { status: 500 }
    );
  }
}

// Mock AI функція (замінити на реальну Google AI API)
async function generateMockAIReply({
  emailContent,
  emailSubject,
  emailFrom,
  replyType,
  templateId,
  customInstructions,
  tone,
  language
}: {
  emailContent: string;
  emailSubject: string;
  emailFrom: string;
  replyType: string;
  templateId?: string;
  customInstructions?: string;
  tone?: string;
  language?: string;
}) {
  // Симулюємо затримку AI
  await new Promise(resolve => setTimeout(resolve, 1000));

  const templates = {
    'academic': 'Шановний колего,\n\nДякую за ваше повідомлення щодо "{subject}".\n\n{content}\n\nЗ повагою,\n{name}',
    'administrative': 'Шановний колего,\n\nПовідомлення про "{subject}" отримано та зареєстровано.\n\n{content}\n\nЗ повагою,\n{name}',
    'student_support': 'Шановний студенте,\n\nДякую за ваше звернення щодо "{subject}".\n\n{content}\n\nБажаю успіхів у навчанні,\n{name}',
    'colleague': 'Привіт!\n\nДякую за лист про "{subject}".\n\n{content}\n\nНайкращі побажання,\n{name}',
    'urgent': 'Терміново!\n\nПовідомлення про "{subject}" отримано.\n\n{content}\n\nНегайно займаюся цим питанням.\n\n{name}',
    'confirmation': 'Підтверджую отримання вашого листа про "{subject}".\n\n{content}\n\nБуду в курсі подальших розвитків.\n\n{name}'
  };

  let baseTemplate = templates[replyType as keyof typeof templates] || templates['formal'];
  
  // Якщо є конкретний шаблон, використовуємо його
  if (templateId) {
    baseTemplate = `Використовую шаблон ${templateId}:\n\n${baseTemplate}`;
  }

  // Генеруємо контекстну відповідь на основі типу та теми
  let content = '';
  
  if (replyType === 'academic') {
    if (emailSubject.toLowerCase().includes('лекція') || emailSubject.toLowerCase().includes('навчання')) {
      content = 'Ваше питання щодо навчального процесу дуже важливе. Я обов\'язково розгляну всі деталі та надам детальну відповідь протягом найближчого часу.';
    } else if (emailSubject.toLowerCase().includes('екзамен') || emailSubject.toLowerCase().includes('залік')) {
      content = 'Щодо питань екзаменаційної сесії - я перевірю всі деталі та надам детальну інформацію згідно з навчальним планом.';
    } else {
      content = 'Ваше академічне питання дуже важливе. Я обов\'язково розгляну всі деталі та надам детальну відповідь найближчим часом.';
    }
  } else if (replyType === 'administrative') {
    if (emailSubject.toLowerCase().includes('документ') || emailSubject.toLowerCase().includes('заявка')) {
      content = 'Ваш документ/заявку я уважно вивчу та надам відповідь згідно з встановленими процедурами. Процес розгляду займе необхідний час.';
    } else if (emailSubject.toLowerCase().includes('довідка') || emailSubject.toLowerCase().includes('справка')) {
      content = 'Щодо запиту на довідку - я перевірю всі необхідні документи та надам відповідь згідно з встановленими термінами.';
    } else {
      content = 'Ваше адміністративне питання зареєстровано. Я обов\'язково розгляну всі деталі та надам відповідь згідно з процедурами.';
    }
  } else if (replyType === 'student_support') {
    if (emailSubject.toLowerCase().includes('проблема') || emailSubject.toLowerCase().includes('допомога')) {
      content = 'Розумію вашу ситуацію. Я обов\'язково розгляну всі деталі та надам максимально корисну допомогу та підтримку.';
    } else if (emailSubject.toLowerCase().includes('навчання') || emailSubject.toLowerCase().includes('розвиток')) {
      content = 'Дуже добре, що ви звертаєтеся за підтримкою в навчанні. Я обов\'язково розгляну всі питання та надам корисні рекомендації.';
    } else {
      content = 'Я готовий надати вам підтримку та допомогу. Обов\'язково розгляну всі деталі та надам максимально корисну відповідь.';
    }
  } else if (replyType === 'colleague') {
    if (emailSubject.toLowerCase().includes('зустріч') || emailSubject.toLowerCase().includes('конференція')) {
      content = 'Щодо запланованої зустрічі - я перевірю свій графік та підтверджу можливість участі. Надам детальну інформацію найближчим часом.';
    } else if (emailSubject.toLowerCase().includes('співпраця') || emailSubject.toLowerCase().includes('проект')) {
      content = 'Дуже добре, що ми можемо співпрацювати. Я обов\'язково розгляну всі деталі та надам свої пропозиції найближчим часом.';
    } else {
      content = 'Дякую за ваше повідомлення. Я обов\'язково розгляну всі зазначені питання та надам детальну відповідь найближчим часом.';
    }
  } else if (replyType === 'urgent') {
    content = 'Ваше термінове повідомлення отримано. Я негайно займаюся цим питанням та надам відповідь найшвидше можливо.';
  } else if (replyType === 'confirmation') {
    content = 'Підтверджую отримання вашого повідомлення. Я обов\'язково розгляну всі зазначені питання та надам відповідь найближчим часом.';
  } else {
    content = 'Дякую за ваше повідомлення. Я обов\'язково розгляну всі зазначені питання та надам детальну відповідь найближчим часом.';
  }

  // Додаємо кастомні інструкції
  if (customInstructions) {
    content += `\n\nДодатково: ${customInstructions}`;
  }

  // Форматуємо відповідь
  const reply = baseTemplate
    .replace('{subject}', emailSubject)
    .replace('{content}', content)
    .replace('{name}', 'Mind Mate AI Assistant');

  return reply;
}
