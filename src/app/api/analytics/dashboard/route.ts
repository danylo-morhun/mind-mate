import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCurrentUserId } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';
import { validateDashboardData } from '@/lib/utils/dashboard-validation';

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

    // Збираємо основну статистику
    const [gmailStats, aiStats, documentsStats] = await Promise.all([
      getGmailStatistics(session.accessToken, period),
      getAIStatistics(period),
      getDocumentsStats(period)
    ]);

    // Розраховуємо продуктивність та співпрацю на основі реальних даних
    const [productivityStats, collaborationStats] = await Promise.all([
      getProductivityStats(period, gmailStats, aiStats, documentsStats),
      getCollaborationStats(period, documentsStats)
    ]);

    // Формуємо дані для відповіді
    const rawData = {
      gmail: gmailStats,
      ai: aiStats,
      documents: documentsStats,
      productivity: productivityStats,
      collaboration: collaborationStats,
      period,
      generatedAt: new Date().toISOString()
    };

    // Валідуємо дані перед відправкою
    const validatedData = validateDashboardData(rawData);

    return NextResponse.json({
      success: true,
      data: validatedData
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    
    // Детальна обробка помилок
    let errorMessage = 'Failed to fetch analytics data';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Визначаємо тип помилки
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        statusCode = 401;
        errorMessage = 'Authentication required. Please sign in again.';
      } else if (errorMessage.includes('Gmail API error')) {
        statusCode = 502;
        errorMessage = 'Failed to fetch Gmail data. Please try again later.';
      } else if (errorMessage.includes('Failed to fetch documents')) {
        statusCode = 502;
        errorMessage = 'Failed to fetch documents data. Please try again later.';
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}

// Функція для збору Gmail статистики
async function getGmailStatistics(accessToken: string, period: string) {
  try {
    // Визначаємо період для фільтрації
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

    // Форматуємо дату для Gmail API query (YYYY/MM/DD)
    const formatDateForQuery = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    };

    const afterDate = formatDateForQuery(periodStart);
    const beforeDate = formatDateForQuery(now);

    // Формуємо query для Gmail API з фільтрацією по датах
    const query = `after:${afterDate} before:${beforeDate}`;

    // Отримуємо листи за вказаний період з фільтрацією
    let allEmails: any[] = [];
    let nextPageToken: string | undefined = undefined;
    const maxResultsPerPage = 500; // Gmail API максимум
    const maxTotalEmails = 500; // Обмежуємо загальну кількість для продуктивності

    // Збираємо листи з пагінацією
    do {
      const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
      url.searchParams.set('maxResults', String(maxResultsPerPage));
      url.searchParams.set('q', query);
      if (nextPageToken) {
        url.searchParams.set('pageToken', nextPageToken);
      }

      const emailsResponse = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!emailsResponse.ok) {
        throw new Error(`Gmail API error: ${emailsResponse.status}`);
      }

      const emailsData = await emailsResponse.json();
      const messages = emailsData.messages || [];
      allEmails = allEmails.concat(messages);
      
      nextPageToken = emailsData.nextPageToken;
      
      // Зупиняємося якщо досягли максимуму або немає більше сторінок
      if (allEmails.length >= maxTotalEmails || !nextPageToken) {
        break;
      }
    } while (nextPageToken && allEmails.length < maxTotalEmails);

    // Обмежуємо кількість листів для детального аналізу (для продуктивності)
    const emailsToAnalyze = allEmails.slice(0, 200);

    // Отримуємо деталі листів для аналізу (батчами по 10 для оптимізації)
    const batchSize = 10;
    const emailDetails: any[] = [];
    
    for (let i = 0; i < emailsToAnalyze.length; i += batchSize) {
      const batch = emailsToAnalyze.slice(i, i + batchSize);
      const batchDetails = await Promise.all(
        batch.map(async (email: any) => {
          try {
            // Отримуємо metadata, включаючи internalDate
            const detailResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (detailResponse.ok) {
              const emailData = await detailResponse.json();
              if (!emailData.internalDate && emailData.payload?.headers) {
                const dateHeader = emailData.payload.headers.find((h: any) => h.name === 'Date');
                if (dateHeader) {
                  const date = new Date(dateHeader.value);
                  emailData.internalDate = String(date.getTime());
                }
              }
              return emailData;
            }
            return null;
          } catch (error) {
            console.error(`Error fetching email ${email.id}:`, error);
            return null;
          }
        })
      );
      
      emailDetails.push(...batchDetails.filter(Boolean));
    }

    const validEmails = emailDetails.filter(Boolean);

    // Отримуємо labels для мапінгу labelIds на назви
    const labelsMap = new Map<string, string>();
    try {
      const labelsResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/labels',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (labelsResponse.ok) {
        const labelsData = await labelsResponse.json();
        if (labelsData.labels) {
          labelsData.labels.forEach((label: any) => {
            if (label.id && label.name) {
              labelsMap.set(label.id, label.name);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch labels for category analysis:', error);
    }

    // Додаємо label names до email об'єктів
    const emailsWithLabels = validEmails.map((email: any) => {
      const labelNames = (email.labelIds || []).map((labelId: string) => 
        labelsMap.get(labelId) || labelId
      );
      return {
        ...email,
        labelNames
      };
    });

    // Аналізуємо статистику
    // Використовуємо загальну кількість листів для totalEmails, але детальну статистику з validEmails
    const stats = {
      totalEmails: allEmails.length, // Загальна кількість листів за період
      unreadEmails: validEmails.filter((email: any) => 
        email.labelIds?.includes('UNREAD')
      ).length,
      starredEmails: validEmails.filter((email: any) => 
        email.labelIds?.includes('STARRED')
      ).length,
      importantEmails: validEmails.filter((email: any) => 
        email.labelIds?.includes('IMPORTANT')
      ).length,
      categories: analyzeEmailCategories(emailsWithLabels),
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
async function getAIStatistics(period: string) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
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

    const supabase = createServerClient();
    
    // Визначаємо період для фільтрації
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

    // Отримуємо AI reply analytics з Supabase
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'ai_reply')
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI statistics from Supabase:', error);
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

    const replies = (analytics || []).map(a => a.data as any);
    
    // Розраховуємо статистику для періоду
    const periodStats = {
      totalRepliesGenerated: replies.length,
      repliesByType: {} as Record<string, number>,
      repliesByTone: {} as Record<string, number>,
      averageGenerationTime: 0,
      templatesUsed: 0,
      aiOnlyGeneration: 0,
      successRate: 100
    };
    
    let totalGenerationTime = 0;
    let successfulReplies = 0;
    
    replies.forEach((reply: any) => {
      // Типи відповідей
      if (reply.replyType) {
        periodStats.repliesByType[reply.replyType] = 
          (periodStats.repliesByType[reply.replyType] || 0) + 1;
      }
      
      // Тони відповідей
      if (reply.tone) {
        periodStats.repliesByTone[reply.tone] = 
          (periodStats.repliesByTone[reply.tone] || 0) + 1;
      }
      
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
      replies.length > 0 ? totalGenerationTime / replies.length : 0;
    
    // Відсоток успішності
    periodStats.successRate = 
      replies.length > 0 ? (successfulReplies / replies.length) * 100 : 100;
    
    return periodStats;
    
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
    let category = 'other';
    
    // Спочатку перевіряємо Gmail labels з категоріями (пріоритет)
    const labelNames = email.labelNames || [];
    const categoryLabel = labelNames.find((name: string) => name.startsWith('Category_'));
    
    if (categoryLabel) {
      // Витягуємо категорію з label (Category_education -> education)
      const categoryFromLabel = categoryLabel.replace('Category_', '').toLowerCase();
      
      // Мапінг категорій з labels на категорії для дашборду
      const categoryMap: Record<string, string> = {
        'education': 'education',
        'administrative': 'administrative',
        'student_support': 'student_support',
        'meetings': 'academic', // meetings -> academic для сумісності
        'documents': 'administrative', // documents -> administrative
        'other': 'other'
      };
      
      category = categoryMap[categoryFromLabel] || 'other';
    } else {
      // Якщо немає label, використовуємо fallback на основі subject та from
      const subject = email.payload?.headers?.find((h: any) => h.name === 'Subject')?.value?.toLowerCase() || '';
      const from = email.payload?.headers?.find((h: any) => h.name === 'From')?.value?.toLowerCase() || '';
      
      if (subject.includes('лекція') || subject.includes('методичка') || subject.includes('навчальн')) {
        category = 'education';
      } else if (subject.includes('заявк') || subject.includes('довідк') || subject.includes('документ')) {
        category = 'administrative';
      } else if (subject.includes('студент') || subject.includes('навчанн')) {
        category = 'student_support';
      } else if (from.includes('@university') || from.includes('@edu')) {
        category = 'academic';
      }
    }
    
    categories[category] = (categories[category] || 0) + 1;
  });
  
  return categories;
}

// Аналіз активності по днях
function analyzeActivityByDay(emails: any[], period: string) {
  if (!emails || emails.length === 0) {
    return [];
  }

  // Для тижня групуємо по днях тижня (Пн-Нд)
  if (period === 'week') {
    const dayCounts: Record<string, number> = {};
    const dayNameMap: Record<number, string> = {
      0: 'Нд',
      1: 'Пн',
      2: 'Вт',
      3: 'Ср',
      4: 'Чт',
      5: 'Пт',
      6: 'Сб'
    };
    const displayOrder = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    
    emails.forEach((email: any) => {
      const internalDate = email.internalDate;
      if (!internalDate) {
        return;
      }
      try {
        const date = new Date(typeof internalDate === 'string' ? parseInt(internalDate) : internalDate);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date from email:', internalDate);
          return;
        }
        const dayOfWeek = date.getDay();
        const dayName = dayNameMap[dayOfWeek];
        if (dayName) {
          dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        }
      } catch (error) {
        console.error('Error parsing email date:', error, 'internalDate:', internalDate);
      }
    });
    
    return displayOrder.map(dayName => ({
      date: dayName,
      count: dayCounts[dayName] || 0,
      dayName
    }));
  }
  
  // Для місяця та року - хронологічний порядок по датах
  const days: Record<string, number> = {};
  let daysToShow = period === 'month' ? 30 : 365;
  
  emails.forEach((email: any) => {
    if (!email.internalDate) return;
    try {
      const date = new Date(parseInt(email.internalDate));
      if (isNaN(date.getTime())) return;
      const dayKey = date.toISOString().split('T')[0];
      days[dayKey] = (days[dayKey] || 0) + 1;
    } catch (error) {
      console.error('Error parsing email date:', error);
    }
  });
  
  // Сортуємо по даті та обмежуємо період
  const sortedDays = Object.entries(days)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-daysToShow);
  
  // Повертаємо в хронологічному порядку (від старіших до новіших)
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

function calculateAverageResponseTime(emails: any[]) {
  return 2.5;
}

// Функція для збору статистики документів
async function getDocumentsStats(period: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const supabase = createServerClient();
    
    // Отримуємо реальні дані документів з Supabase
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_date', { ascending: false });

    if (error) {
      console.error('Error fetching documents from Supabase:', error);
      throw new Error('Failed to fetch documents from database');
    }

    if (!documents || documents.length === 0) {
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

    // Трансформуємо дані з бази в формат додатку
    const transformedDocuments = documents.map((doc: any) => ({
      ...doc,
      createdDate: doc.created_date ? new Date(doc.created_date) : new Date(),
      lastModified: doc.last_modified ? new Date(doc.last_modified) : new Date(),
      aiGenerated: doc.ai_generated || false,
      metadata: doc.metadata || {}
    }));

    // Визначаємо період для фільтрації
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

    // Фільтруємо документи по періоду (використовуємо transformedDocuments)
    // Встановлюємо час на початок дня для коректного порівняння
    periodStart.setHours(0, 0, 0, 0);
    const documentsInPeriod = transformedDocuments.filter((doc: any) => {
      const createdDate = doc.createdDate instanceof Date ? doc.createdDate : new Date(doc.createdDate);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate >= periodStart;
    });

    // Мапінг категорій для відображення
    const categoryMap: Record<string, string> = {
      'lectures': 'Лекції',
      'methodics': 'Методички',
      'reports': 'Звіти',
      'presentations': 'Презентації',
      'plans': 'Плани',
      'assignments': 'Завдання',
      'syllabi': 'Програми',
      'other': 'Інше'
    };

    // Мапінг категорій на типи для статистики
    const categoryToTypeMap: Record<string, string> = {
      'lectures': 'lecture',
      'methodics': 'methodology',
      'assignments': 'lab',
      'syllabi': 'course',
      'reports': 'course',
      'presentations': 'course',
      'plans': 'course',
      'other': 'course'
    };

    // Розраховуємо статистику
    const documentsByType: Record<string, number> = {};
    const documentsByCategory: Record<string, number> = {};
    let totalWordCount = 0;
    let aiGeneratedCount = 0;
    const dayCounts: Record<string, number> = {};
    // Дні тижня в правильному порядку (Пн-Нд для відображення)
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

    transformedDocuments.forEach((doc: any) => {
      // По типах (мапінг з category на типи для статистики)
      const mappedType = categoryToTypeMap[doc.category] || 'course';
      documentsByType[mappedType] = (documentsByType[mappedType] || 0) + 1;

      // По категоріях
      const categoryName = categoryMap[doc.category] || doc.category;
      documentsByCategory[categoryName] = (documentsByCategory[categoryName] || 0) + 1;

      // AI згенеровані
      if (doc.ai_generated || doc.aiGenerated) {
        aiGeneratedCount++;
      }

      // Довжина документів
      const wordCount = doc.metadata?.wordCount || (doc.content ? doc.content.length / 5 : 0);
      if (wordCount > 0) {
        totalWordCount += wordCount;
      }

      // Активність по днях (для документів в періоді)
      const createdDate = doc.createdDate instanceof Date ? doc.createdDate : new Date(doc.createdDate);
      const createdDateNormalized = new Date(createdDate);
      createdDateNormalized.setHours(0, 0, 0, 0);
      if (createdDateNormalized >= periodStart) {
        // getDay() повертає: 0=Нд, 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб
        // Мапимо на правильні назви
        const dayOfWeek = createdDateNormalized.getDay();
        const dayNameMap: Record<number, string> = {
          0: 'Нд',
          1: 'Пн',
          2: 'Вт',
          3: 'Ср',
          4: 'Чт',
          5: 'Пт',
          6: 'Сб'
        };
        const dayName = dayNameMap[dayOfWeek];
        if (dayName) {
          dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        }
      }
    });

    // Знаходимо найактивніший день
    const mostActiveDay = Object.entries(dayCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Н/Д';

    // Формуємо тренд по днях тижня в правильному порядку (Пн-Нд)
    // Порядок для відображення: Пн, Вт, Ср, Чт, Пт, Сб, Нд
    const displayOrder = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
    const documentsTrend = displayOrder.map(day => ({
      day,
      count: dayCounts[day] || 0
    }));

    // Середня довжина документа
    const averageDocumentLength = transformedDocuments.length > 0 
      ? Math.round(totalWordCount / transformedDocuments.length) 
      : 0;

    return {
      totalDocuments: transformedDocuments.length,
      documentsByType,
      documentsByCategory,
      aiGeneratedDocuments: aiGeneratedCount,
      documentsThisPeriod: documentsInPeriod.length,
      averageDocumentLength,
      mostActiveDay,
      documentsTrend
    };
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
async function getProductivityStats(
  period: string,
  gmailStats: any,
  aiStats: any,
  documentsStats: any
) {
  try {
    // Визначаємо період для розрахунків
    const now = new Date();
    const periodStart = new Date();
    let periodDays = 7;
    
    switch (period) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        periodDays = 7;
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        periodDays = 30;
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        periodDays = 365;
        break;
      default:
        periodStart.setDate(now.getDate() - 7);
        periodDays = 7;
    }

    // Розраховуємо emailsPerHour на основі реальних днів з активністю
    const totalEmails = gmailStats?.totalEmails || 0;
    const activityByDay = gmailStats?.activityByDay || [];
    
    // Підраховуємо реальну кількість днів з активністю
    const activeDays = activityByDay.filter((day: any) => day.count > 0).length;
    
    // Якщо немає активності, використовуємо мінімум 1 день для уникнення ділення на нуль
    const realActiveDays = Math.max(activeDays, 1);
    
    const averageWorkHoursPerActiveDay = 6;
    const totalWorkHours = realActiveDays * averageWorkHoursPerActiveDay;
    const emailsPerHour = totalWorkHours > 0 ? (totalEmails / totalWorkHours) : 0;

    // Розраховуємо documentsPerWeek (нормалізуємо до тижня)
    const documentsThisPeriod = documentsStats?.documentsThisPeriod || 0;
    const documentsPerWeek = periodDays > 0 ? (documentsThisPeriod / periodDays) * 7 : 0;

    const aiRepliesGenerated = aiStats?.totalRepliesGenerated || 0;
    const minutesPerReply = 5;
    const aiTimeSavedHours = (aiRepliesGenerated * minutesPerReply) / 60;

    // Розраховуємо productivityScore (0-100) на основі метрик
    // Формула: бонуси за активність (без базової оцінки, щоб показувати реальну продуктивність)
    let productivityScore = 0; // Починаємо з 0, додаємо бонуси за реальну активність
    
    // Бонус за email активність (максимум +20)
    const emailScore = Math.min((totalEmails / 100) * 20, 20);
    
    // Бонус за документи (максимум +15)
    const documentsScore = Math.min((documentsThisPeriod / 10) * 15, 15);
    
    // Бонус за AI використання (максимум +15)
    const aiScore = Math.min((aiRepliesGenerated / 20) * 15, 15);
    
    productivityScore = Math.round(productivityScore + emailScore + documentsScore + aiScore);
    productivityScore = Math.min(productivityScore, 100); // Максимум 100

    // Розраховуємо найпродуктивніші години на основі реальної активності
    // Якщо немає даних про активність по годинах, повертаємо порожній масив
    const topProductiveHours: Array<{ hour: string; score: number }> = [];
    
    // Можна додати аналіз активності по годинах з Gmail API або інших джерел
    // Поки що залишаємо порожнім, якщо немає реальних даних

    // Розраховуємо workloadDistribution (відсотки)
    const totalWorkload = totalEmails + documentsThisPeriod + (aiRepliesGenerated * 0.5);
    const workloadDistribution = {
      emails: totalWorkload > 0 ? Math.round((totalEmails / totalWorkload) * 100) : 0,
      documents: totalWorkload > 0 ? Math.round((documentsThisPeriod / totalWorkload) * 100) : 0,
      collaboration: totalWorkload > 0 ? Math.round(((aiRepliesGenerated * 0.3) / totalWorkload) * 100) : 0,
      planning: totalWorkload > 0 ? Math.round(((aiRepliesGenerated * 0.2) / totalWorkload) * 100) : 0
    };

    // Нормалізуємо workloadDistribution до 100%
    const totalPercentage = Object.values(workloadDistribution).reduce((sum, val) => sum + val, 0);
    if (totalPercentage > 0 && totalPercentage !== 100) {
      Object.keys(workloadDistribution).forEach(key => {
        workloadDistribution[key as keyof typeof workloadDistribution] = 
          Math.round((workloadDistribution[key as keyof typeof workloadDistribution] / totalPercentage) * 100);
      });
    }

    const weeklyGoals = {
      emailsProcessed: totalEmails > 0 ? Math.round(totalEmails * 1.2) : 0,
      documentsCreated: documentsThisPeriod > 0 ? Math.round(documentsThisPeriod * 1.2) : 0,
      aiTasksCompleted: aiRepliesGenerated > 0 ? Math.round(aiRepliesGenerated * 1.2) : 0,
      collaborationHours: aiRepliesGenerated > 0 ? Math.round((aiRepliesGenerated * 0.1) * 1.2) : 0
    };

    return {
      totalWorkHours: Math.round(totalWorkHours), // Реальні робочі години на основі активних днів
      emailsPerHour: Math.round(emailsPerHour * 10) / 10, // Округлюємо до 1 знака після коми
      documentsPerWeek: Math.round(documentsPerWeek * 10) / 10,
      aiTimeSaved: Math.round(aiTimeSavedHours * 10) / 10,
      productivityScore,
      topProductiveHours,
      workloadDistribution,
      weeklyGoals
    };
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
async function getCollaborationStats(period: string, documentsStats: any) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        sharedDocuments: 0,
        teamMembers: 0,
        activeProjects: 0,
        topCollaborators: [],
        collaborationScore: 0
      };
    }

    const supabase = createServerClient();
    
    // Отримуємо реальні дані документів з Supabase
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);

    if (error || !documents || documents.length === 0) {
      return {
        sharedDocuments: 0,
        teamMembers: 0,
        activeProjects: 0,
        topCollaborators: [],
        collaborationScore: 0
      };
    }

    // Трансформуємо дані з бази
    const transformedDocuments = documents.map((doc: any) => ({
      ...doc,
      createdDate: doc.created_date ? new Date(doc.created_date) : new Date(),
      lastModified: doc.last_modified ? new Date(doc.last_modified) : new Date(),
    }));

    // Визначаємо період для фільтрації
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

    // Фільтруємо документи по періоду
    const documentsInPeriod = transformedDocuments.filter((doc: any) => {
      const createdDate = doc.createdDate instanceof Date ? doc.createdDate : new Date(doc.createdDate);
      return createdDate >= periodStart;
    });

    // Підраховуємо спільні документи (з collaborators)
    const sharedDocuments = transformedDocuments.filter((doc: any) => 
      doc.collaborators && Array.isArray(doc.collaborators) && doc.collaborators.length > 0
    ).length;

    // Збираємо унікальних учасників команди
    const teamMembersSet = new Set<string>();
    transformedDocuments.forEach((doc: any) => {
      if (doc.author) teamMembersSet.add(doc.author);
      if (doc.collaborators && Array.isArray(doc.collaborators)) {
        doc.collaborators.forEach((collab: string) => teamMembersSet.add(collab));
      }
    });
    const teamMembers = teamMembersSet.size;

    // Підраховуємо активні проекти (документи зі статусом не draft та не archived)
    const activeProjects = transformedDocuments.filter((doc: any) => 
      doc.status && doc.status !== 'draft' && doc.status !== 'archived'
    ).length;

    // Розраховуємо топ співробітників (на основі кількості документів)
    const collaboratorStats: Record<string, { projects: number; hours: number }> = {};
    
    transformedDocuments.forEach((doc: any) => {
      if (doc.collaborators && Array.isArray(doc.collaborators)) {
        doc.collaborators.forEach((collab: string) => {
          if (!collaboratorStats[collab]) {
            collaboratorStats[collab] = { projects: 0, hours: 0 };
          }
          collaboratorStats[collab].projects++;
          collaboratorStats[collab].hours += 2;
        });
      }
    });

    const topCollaborators = Object.entries(collaboratorStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.projects - a.projects)
      .slice(0, 5);

    // Розраховуємо статус проектів (на основі статусів документів)
    const projectStatus: Record<string, string> = {};
    transformedDocuments.slice(0, 5).forEach((doc: any) => {
      if (doc.title && doc.status) {
        const statusMap: Record<string, string> = {
          'draft': 'Планування',
          'in_review': 'Перевірка',
          'approved': 'Завершено',
          'published': 'Завершено',
          'archived': 'Завершено',
          'deprecated': 'Завершено'
        };
        projectStatus[doc.title] = statusMap[doc.status] || doc.status;
      }
    });

    // Розраховуємо канали комунікації (базуємося на загальній кількості документів)
    const totalDocuments = transformedDocuments.length;
    const documentsWithCollaborators = transformedDocuments.filter((doc: any) => 
      doc.collaborators && Array.isArray(doc.collaborators) && doc.collaborators.length > 0
    ).length;
    
    // Розраховуємо відсотки на основі реальних даних
    const communicationChannels = {
      email: totalDocuments > 0 ? Math.round((documentsWithCollaborators / totalDocuments) * 40) : 0,
      documents: totalDocuments > 0 ? Math.round((totalDocuments / Math.max(totalDocuments, 1)) * 50) : 0,
      meetings: totalDocuments > 0 ? Math.round((Math.min(topCollaborators.length, totalDocuments) / Math.max(totalDocuments, 1)) * 10) : 0
    };

    // Нормалізуємо до 100% якщо є документи
    if (totalDocuments > 0) {
      const totalChannels = Object.values(communicationChannels).reduce((sum, val) => sum + val, 0);
      if (totalChannels > 0 && totalChannels !== 100) {
        Object.keys(communicationChannels).forEach(key => {
          communicationChannels[key as keyof typeof communicationChannels] = 
            Math.round((communicationChannels[key as keyof typeof communicationChannels] / totalChannels) * 100);
        });
      }
    } else {
      // Якщо немає документів, показуємо рівномірний розподіл
      communicationChannels.email = 33;
      communicationChannels.documents = 34;
      communicationChannels.meetings = 33;
    }

    const collaborationHours = sharedDocuments * 2;

    return {
      activeProjects,
      teamMembers,
      sharedDocuments,
      collaborationHours,
      topCollaborators,
      projectStatus,
      communicationChannels
    };
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
