import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

const analyticsFilePath = path.join(process.cwd(), 'src/lib/data/ai-analytics.json');

export async function POST(request: NextRequest) {
  try {
    // Отримуємо сесію користувача
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      emailId,
      emailSubject,
      replyType,
      tone,
      language,
      templateId,
      customInstructions,
      generationTime,
      success,
      modelUsed,
      replyLength
    } = body;

    // Читаємо поточну статистику
    let analyticsData;
    try {
      const fileContent = await fs.readFile(analyticsFilePath, 'utf-8');
      analyticsData = JSON.parse(fileContent);
    } catch {
      // Якщо файл не існує, створюємо базову структуру
      analyticsData = {
        replies: [],
        templates: [],
        stats: {
          totalRepliesGenerated: 0,
          repliesByType: {},
          repliesByTone: {},
          averageGenerationTime: 0,
          templatesUsed: 0,
          aiOnlyGeneration: 0,
          successRate: 100,
          lastUpdated: null
        }
      };
    }

    // Додаємо нову відповідь
    const newReply = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      emailId,
      emailSubject,
      replyType,
      tone,
      language,
      templateId: templateId || null,
      customInstructions: customInstructions || null,
      generationTime,
      success,
      modelUsed,
      replyLength,
      userId: session.user?.email || 'unknown'
    };

    analyticsData.replies.push(newReply);

    // Оновлюємо статистику
    analyticsData.stats.totalRepliesGenerated = analyticsData.replies.length;
    analyticsData.stats.lastUpdated = new Date().toISOString();

    // Розраховуємо статистику по типах
    analyticsData.stats.repliesByType = {};
    analyticsData.stats.repliesByTone = {};
    analyticsData.stats.templatesUsed = 0;
    analyticsData.stats.aiOnlyGeneration = 0;

    let totalGenerationTime = 0;
    let successfulReplies = 0;

    analyticsData.replies.forEach((reply: any) => {
      // Типи відповідей
      analyticsData.stats.repliesByType[reply.replyType] = 
        (analyticsData.stats.repliesByType[reply.replyType] || 0) + 1;
      
      // Тони відповідей
      analyticsData.stats.repliesByTone[reply.tone] = 
        (analyticsData.stats.repliesByTone[reply.tone] || 0) + 1;
      
      // Шаблони
      if (reply.templateId) {
        analyticsData.stats.templatesUsed++;
      } else {
        analyticsData.stats.aiOnlyGeneration++;
      }
      
      // Час генерації
      if (reply.generationTime) {
        totalGenerationTime += reply.generationTime;
      }
      
      // Успішність
      if (reply.success) {
        successfulReplies++;
      }
    });

    // Середній час генерації
    analyticsData.stats.averageGenerationTime = 
      analyticsData.replies.length > 0 ? totalGenerationTime / analyticsData.replies.length : 0;

    // Відсоток успішності
    analyticsData.stats.successRate = 
      analyticsData.replies.length > 0 ? (successfulReplies / analyticsData.replies.length) * 100 : 100;

    // Зберігаємо оновлену статистику
    await fs.writeFile(analyticsFilePath, JSON.stringify(analyticsData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'AI reply statistics saved',
      stats: analyticsData.stats
    });

  } catch (error) {
    console.error('AI reply analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to save AI reply statistics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Отримуємо сесію користувача
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Читаємо статистику
    const fileContent = await fs.readFile(analyticsFilePath, 'utf-8');
    const analyticsData = JSON.parse(fileContent);

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('AI analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI analytics' },
      { status: 500 }
    );
  }
}
