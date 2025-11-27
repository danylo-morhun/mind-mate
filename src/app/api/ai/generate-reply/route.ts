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
    const errorMessage = null;
    let promptContext: ReturnType<typeof buildGeminiPrompt> | null = null;

    try {
      const geminiClient = getGeminiClient();
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
      aiReply = await geminiClient.generateReply(promptContext.fullPrompt);
      
      if (!aiReply || aiReply.trim().length === 0) {
        throw new Error('Отримано порожню відповідь від Gemini API');
      }
      
      modelUsed = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';
    } catch (geminiError) {
      console.error('Gemini API failed:', geminiError);
      const error = geminiError instanceof Error ? geminiError.message : String(geminiError);
      return NextResponse.json(
        { 
          error: 'Failed to generate AI reply',
          details: `Gemini API недоступний: ${error}`,
          success: false
        },
        { status: 500 }
      );
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

