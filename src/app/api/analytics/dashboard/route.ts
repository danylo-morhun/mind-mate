import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Отримуємо сесію користувача
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, year
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Збираємо статистику з різних джерел
    const [gmailStats, aiStats, documentsStats, productivityStats, collaborationStats] = await Promise.all([
      getGmailStatistics(session.accessToken, period, startDate, endDate),
      getAIStatistics(period, startDate, endDate),
      getDocumentsStats(period),
      getProductivityStats(period),
      getCollaborationStats(period)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        gmail: gmailStats,
        ai: aiStats,
        documents: documentsStats,
        productivity: productivityStats,
        collaboration: collaborationStats,
        period,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// Функція для збору Gmail статистики
async function getGmailStatistics(accessToken: string, period: string, startDate?: string, endDate?: string) {
  try {
    // Отримуємо листи за вказаний період
    const emailsResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1000`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!emailsResponse.ok) {
      throw new Error(`Gmail API error: ${emailsResponse.status}`);
    }

    const emailsData = await emailsResponse.json();
    const emails = emailsData.messages || [];

    // Отримуємо деталі листів для аналізу
    const emailDetails = await Promise.all(
      emails.slice(0, 100).map(async (email: any) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (detailResponse.ok) {
          return await detailResponse.json();
        }
        return null;
      })
    );

    const validEmails = emailDetails.filter(Boolean);

    // Аналізуємо статистику
    const stats = {
      totalEmails: validEmails.length,
      unreadEmails: validEmails.filter((email: any) => 
        email.labelIds?.includes('UNREAD')
      ).length,
      starredEmails: validEmails.filter((email: any) => 
        email.labelIds?.includes('STARRED')
      ).length,
      importantEmails: validEmails.filter((email: any) => 
        email.labelIds?.includes('IMPORTANT')
      ).length,
      categories: analyzeEmailCategories(validEmails),
      activityByDay: analyzeActivityByDay(validEmails, period),
      topSenders: analyzeTopSenders(validEmails),
      averageResponseTime: calculateAverageResponseTime(validEmails),
    };

    return stats;

  } catch (error) {
    console.error('Gmail statistics error:', error);
    return {
      totalEmails: 0,
      unreadEmails: 0,
      starredEmails: 0,
      importantEmails: 0,
      categories: {},
      activityByDay: [],
      topSenders: [],
      averageResponseTime: 0,
      error: 'Failed to fetch Gmail data'
    };
  }
}

// Функція для збору AI статистики
async function getAIStatistics(period: string, startDate?: string, endDate?: string) {
  try {
    // Читаємо реальну AI статистику з файлу
    const analyticsFilePath = path.join(process.cwd(), 'src/lib/data/ai-analytics.json');
    
    try {
      const fileContent = await fs.readFile(analyticsFilePath, 'utf-8');
      const analyticsData = JSON.parse(fileContent);
      
      // Фільтруємо по періоду
      const now = new Date();
      const periodStart = new Date();
      
      switch (period) {
        case 'week':
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
        default:
          periodStart.setDate(now.getDate() - 7);
      }
      
      // Фільтруємо відповіді за період
      const filteredReplies = analyticsData.replies.filter((reply: any) => {
        const replyDate = new Date(reply.timestamp);
        return replyDate >= periodStart;
      });
      
      // Розраховуємо статистику для періоду
      const periodStats = {
        totalRepliesGenerated: filteredReplies.length,
        repliesByType: {},
        repliesByTone: {},
        averageGenerationTime: 0,
        templatesUsed: 0,
        aiOnlyGeneration: 0,
        successRate: 100
      };
      
      let totalGenerationTime = 0;
      let successfulReplies = 0;
      
      filteredReplies.forEach((reply: any) => {
        // Типи відповідей
        periodStats.repliesByType[reply.replyType] = 
          (periodStats.repliesByType[reply.replyType] || 0) + 1;
        
        // Тони відповідей
        periodStats.repliesByTone[reply.tone] = 
          (periodStats.repliesByTone[reply.tone] || 0) + 1;
        
        // Шаблони
        if (reply.templateId) {
          periodStats.templatesUsed++;
        } else {
          periodStats.aiOnlyGeneration++;
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
      periodStats.averageGenerationTime = 
        filteredReplies.length > 0 ? totalGenerationTime / filteredReplies.length : 0;
      
      // Відсоток успішності
      periodStats.successRate = 
        filteredReplies.length > 0 ? (successfulReplies / filteredReplies.length) * 100 : 100;
      
      return periodStats;
      
    } catch (error) {
      // Якщо файл не існує, повертаємо пусту статистику
      return {
        totalRepliesGenerated: 0,
        repliesByType: {},
        repliesByTone: {},
        averageGenerationTime: 0,
        templatesUsed: 0,
        aiOnlyGeneration: 0,
        successRate: 100
      };
    }
    
  } catch (error) {
    console.error('AI statistics error:', error);
    return {
      totalRepliesGenerated: 0,
      repliesByType: {},
      repliesByTone: {},
      averageGenerationTime: 0,
      templatesUsed: 0,
      aiOnlyGeneration: 0,
      successRate: 100
    };
  }
}

// Аналіз категорій листів
function analyzeEmailCategories(emails: any[]) {
  const categories: Record<string, number> = {};
  
  emails.forEach((email: any) => {
    const subject = email.payload?.headers?.find((h: any) => h.name === 'Subject')?.value?.toLowerCase() || '';
    const from = email.payload?.headers?.find((h: any) => h.name === 'From')?.value?.toLowerCase() || '';
    
    let category = 'other';
    
    if (subject.includes('лекція') || subject.includes('методичка') || subject.includes('навчальн')) {
      category = 'education';
    } else if (subject.includes('заявк') || subject.includes('довідк') || subject.includes('документ')) {
      category = 'administrative';
    } else if (subject.includes('студент') || subject.includes('навчанн')) {
      category = 'student_support';
    } else if (from.includes('@university') || from.includes('@edu')) {
      category = 'academic';
    }
    
    categories[category] = (categories[category] || 0) + 1;
  });
  
  return categories;
}

// Аналіз активності по днях
function analyzeActivityByDay(emails: any[], period: string) {
  const days: Record<string, number> = {};
  
  emails.forEach((email: any) => {
    const date = new Date(parseInt(email.internalDate));
    const dayKey = date.toISOString().split('T')[0];
    days[dayKey] = (days[dayKey] || 0) + 1;
  });
  
  // Сортуємо по даті та обмежуємо період
  const sortedDays = Object.entries(days)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7); // Останні 7 днів
  
  return sortedDays.map(([date, count]) => ({
    date,
    count,
    dayName: new Date(date).toLocaleDateString('uk-UA', { weekday: 'short' })
  }));
}

// Аналіз топ відправників
function analyzeTopSenders(emails: any[]) {
  const senders: Record<string, number> = {};
  
  emails.forEach((email: any) => {
    const from = email.payload?.headers?.find((h: any) => h.name === 'From')?.value || 'unknown';
    senders[from] = (senders[from] || 0) + 1;
  });
  
  return Object.entries(senders)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([sender, count]) => ({ sender, count }));
}

// Розрахунок середнього часу відповіді
function calculateAverageResponseTime(emails: any[]) {
  // Спрощений розрахунок - в реальності потрібно аналізувати thread
  return 2.5; // години
}

// Функція для збору статистики документів
async function getDocumentsStats(period: string) {
  try {
    // В реальності це буде API запит до бази даних документів
    // Зараз використовуємо mock дані
    const mockDocuments = {
      totalDocuments: 24,
      documentsByType: {
        lecture: 8,
        methodology: 6,
        lab: 5,
        course: 3,
        thesis: 2
      },
      documentsByCategory: {
        'Програмування': 10,
        'Математика': 6,
        'Фізика': 4,
        'Історія': 2,
        'Інше': 2
      },
      aiGeneratedDocuments: 18,
      documentsThisPeriod: 7,
      averageDocumentLength: 2500,
      mostActiveDay: 'Понеділок',
      documentsTrend: [
        { day: 'Пн', count: 3 },
        { day: 'Вт', count: 2 },
        { day: 'Ср', count: 1 },
        { day: 'Чт', count: 0 },
        { day: 'Пт', count: 1 },
        { day: 'Сб', count: 0 },
        { day: 'Нд', count: 0 }
      ]
    };

    return mockDocuments;
  } catch (error) {
    console.error('Documents statistics error:', error);
    return {
      totalDocuments: 0,
      documentsByType: {},
      documentsByCategory: {},
      aiGeneratedDocuments: 0,
      documentsThisPeriod: 0,
      averageDocumentLength: 0,
      mostActiveDay: 'Н/Д',
      documentsTrend: []
    };
  }
}

// Функція для збору статистики продуктивності
async function getProductivityStats(period: string) {
  try {
    // Mock дані для продуктивності
    const mockProductivity = {
      totalWorkHours: 42,
      emailsPerHour: 3.2,
      documentsPerWeek: 2.8,
      aiTimeSaved: 8.5, // годин за тиждень
      productivityScore: 87,
      topProductiveHours: [
        { hour: '9:00', score: 95 },
        { hour: '10:00', score: 92 },
        { hour: '11:00', score: 88 },
        { hour: '14:00', score: 85 },
        { hour: '15:00', score: 82 }
      ],
      workloadDistribution: {
        emails: 40,
        documents: 35,
        collaboration: 15,
        planning: 10
      },
      weeklyGoals: {
        emailsProcessed: 85,
        documentsCreated: 3,
        aiTasksCompleted: 12,
        collaborationHours: 8
      }
    };

    return mockProductivity;
  } catch (error) {
    console.error('Productivity statistics error:', error);
    return {
      totalWorkHours: 0,
      emailsPerHour: 0,
      documentsPerWeek: 0,
      aiTimeSaved: 0,
      productivityScore: 0,
      topProductiveHours: [],
      workloadDistribution: {},
      weeklyGoals: {}
    };
  }
}

// Функція для збору статистики співпраці
async function getCollaborationStats(period: string) {
  try {
    // Mock дані для співпраці
    const mockCollaboration = {
      activeProjects: 4,
      teamMembers: 12,
      sharedDocuments: 18,
      collaborationHours: 15,
      topCollaborators: [
        { name: 'Іван Петренко', projects: 3, hours: 8 },
        { name: 'Марія Коваленко', projects: 2, hours: 6 },
        { name: 'Олександр Сидоренко', projects: 2, hours: 5 }
      ],
      projectStatus: {
        'Курсова робота': 'В процесі',
        'Методичка': 'Завершено',
        'Лабораторна': 'Очікує перевірки',
        'Дипломна робота': 'Планування'
      },
      communicationChannels: {
        email: 60,
        documents: 25,
        meetings: 15
      }
    };

    return mockCollaboration;
  } catch (error) {
    console.error('Collaboration statistics error:', error);
    return {
      activeProjects: 0,
      teamMembers: 0,
      sharedDocuments: 0,
      collaborationHours: 0,
      topCollaborators: [],
      projectStatus: {},
      communicationChannels: {}
    };
  }
}
