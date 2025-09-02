import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGeminiClient } from '@/lib/ai/gemini-client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Тестуємо підключення до Gemini
    const geminiClient = getGeminiClient();
    
    // Простий тестовий запит
    const testPrompt = 'Привіт! Це тестовий запит для перевірки підключення до Gemini API. Відповідай українською мовою.';
    
    const startTime = Date.now();
    const response = await geminiClient.generateReply(testPrompt);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;

    return NextResponse.json({
      success: true,
      message: 'Gemini API підключення успішне!',
      testResponse: response,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      model: process.env.GOOGLE_AI_MODEL || 'gemini-pro'
    });

  } catch (error) {
    console.error('Gemini test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Gemini API підключення невдале',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      suggestion: 'Перевірте GOOGLE_AI_API_KEY в .env.local'
    }, { status: 500 });
  }
}

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
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Тестуємо генерацію з кастомним prompt
    const geminiClient = getGeminiClient();
    
    const startTime = Date.now();
    const response = await geminiClient.generateReply(prompt);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;

    return NextResponse.json({
      success: true,
      prompt: prompt,
      response: response,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      model: process.env.GOOGLE_AI_MODEL || 'gemini-pro'
    });

  } catch (error) {
    console.error('Gemini custom test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Помилка генерації з кастомним prompt',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
