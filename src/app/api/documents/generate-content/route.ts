import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini-client';

interface GenerateContentRequest {
  title: string;
  template: string;
  description?: string;
  category?: string;
  type?: string;
  additionalContext?: string;
}

const documentTemplates = {
  lecture: {
    systemPrompt: `Ти - експерт з створення навчальних матеріалів для університету. 
    Твоє завдання - створити структуровану лекцію на основі заголовку та опису.
    
    ВИМОГИ:
    - Використовуй українську мову
    - Створи логічну структуру з розділами та підрозділами
    - Додай практичні приклади та пояснення
    - Використовуй Markdown форматування
    - Зроби контент зрозумілим для студентів
    - Додай висновки та питання для самоперевірки`,
    
    userPrompt: `Створи лекцію на тему: "{title}"
    
    Опис: {description}
    Категорія: {category}
    
    Додатковий контекст: {additionalContext}
    
    Створи структуровану лекцію з:
    1. Вступом та метою
    2. Основними розділами (мінімум 3-4)
    3. Практичними прикладами
    4. Висновками
    5. Питаннями для самоперевірки
    6. Рекомендованою літературою`
  },
  
  methodology: {
    systemPrompt: `Ти - експерт з створення методичних вказівок для університету. 
    Твоє завдання - створити детальні методичні вказівки на основі заголовку та опису.
    
    ВИМОГИ:
    - Використовуй українську мову
    - Створи стандартну структуру методички
    - Додай покрокові інструкції
    - Включи безпечні заходи та рекомендації
    - Використовуй Markdown форматування
    - Зроби інструкції зрозумілими та детальними`,
    
    userPrompt: `Створи методичні вказівки на тему: "{title}"
    
    Опис: {description}
    Категорія: {category}
    
    Додатковий контекст: {additionalContext}
    
    Створи методичні вказівки з:
    1. Метою та завданнями
    2. Необхідним обладнанням та матеріалами
    3. Покроковими інструкціями
    4. Безпечними заходами
    5. Критеріями оцінювання
    6. Рекомендаціями та порадами`
  },
  
  lab: {
    systemPrompt: `Ти - експерт з створення лабораторних робіт для університету. 
    Твоє завдання - створити детальну лабораторну роботу на основі заголовку та опису.
    
    ВИМОГИ:
    - Використовуй українську мову
    - Створи стандартну структуру лабораторної роботи
    - Додай теоретичну частину
    - Включи покрокові інструкції для експерименту
    - Додай формули та розрахунки
    - Використовуй Markdown форматування
    - Зроби роботу практичною та зрозумілою`,
    
    userPrompt: `Створи лабораторну роботу на тему: "{title}"
    
    Опис: {description}
    Категорія: {category}
    
    Додатковий контекст: {additionalContext}
    
    Створи лабораторну роботу з:
    1. Метою та завданнями
    2. Теоретичними основами
    3. Необхідним обладнанням
    4. Покроковою методикою
    5. Формулами та розрахунками
    6. Питаннями для контролю
    7. Висновками та рекомендаціями`
  },
  
  course: {
    systemPrompt: `Ти - експерт з створення курсових робіт для університету. 
    Твоє завдання - створити структуру та план курсової роботи на основі заголовку та опису.
    
    ВИМОГИ:
    - Використовуй українську мову
    - Створи детальний план курсової роботи
    - Додай теоретичну та практичну частини
    - Включи методику дослідження
    - Додай структуру з розділами та підрозділами
    - Використовуй Markdown форматування
    - Зроби план логічним та послідовним`,
    
    userPrompt: `Створи план курсової роботи на тему: "{title}"
    
    Опис: {description}
    Категорія: {category}
    
    Додатковий контекст: {additionalContext}
    
    Створи план курсової роботи з:
    1. Вступом та актуальністю теми
    2. Метою та завданнями дослідження
    3. Теоретичною частиною (розділи)
    4. Практичною частиною (методика)
    5. Результатами та висновками
    6. Списком використаної літератури
    7. Додатками та матеріалами`
  },
  
  thesis: {
    systemPrompt: `Ти - експерт з створення дипломних робіт для університету. 
    Твоє завдання - створити детальну структуру дипломної роботи на основі заголовку та опису.
    
    ВИМОГИ:
    - Використовуй українську мову
    - Створи повну структуру дипломної роботи
    - Додай всі необхідні розділи та підрозділи
    - Включи теоретичну, практичну та експериментальну частини
    - Додай методику дослідження та аналізу
    - Використовуй Markdown форматування
    - Зроби структуру професійною та науковою`,
    
    userPrompt: `Створи структуру дипломної роботи на тему: "{title}"
    
    Опис: {description}
    Категорія: {category}
    
    Додатковий контекст: {additionalContext}
    
    Створи структуру дипломної роботи з:
    1. Титульним листом та змістом
    2. Вступом та актуальністю
    3. Аналізом літератури
    4. Теоретичними основами
    5. Методикою дослідження
    6. Експериментальною частиною
    7. Результатами та обговоренням
    8. Висновками та рекомендаціями
    9. Списком використаної літератури
    10. Додатками та матеріалами`
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateContentRequest = await request.json();
    const { title, template, description, category, type, additionalContext } = body;

    // Валідація обов'язкових полів
    if (!title || !template) {
      return NextResponse.json(
        { error: 'Title and template are required' },
        { status: 400 }
      );
    }

    // Перевіряємо чи є шаблон для даного типу
    if (!documentTemplates[template as keyof typeof documentTemplates]) {
      return NextResponse.json(
        { error: `Template '${template}' is not supported` },
        { status: 400 }
      );
    }

    const geminiClient = getGeminiClient();
    if (!geminiClient) {
      return NextResponse.json(
        { error: 'Gemini client not available' },
        { status: 500 }
      );
    }

    const templateConfig = documentTemplates[template as keyof typeof documentTemplates];
    
    // Формуємо промпт з контекстом
    const userPrompt = templateConfig.userPrompt
      .replace('{title}', title)
      .replace('{description}', description || 'Не вказано')
      .replace('{category}', category || 'Не вказано')
      .replace('{additionalContext}', additionalContext || 'Не вказано');

    console.log('Generating content with Gemini:', {
      template,
      title,
      description,
      category,
      type,
      additionalContext
    });

    // Генеруємо контент за допомогою Gemini
    const result = await geminiClient.generateContent([
      {
        role: 'user',
        parts: [
          {
            text: `${templateConfig.systemPrompt}\n\n${userPrompt}`
          }
        ]
      }
    ]);

    const response = result.response;
    if (!response || !response.text) {
      throw new Error('No response from Gemini API');
    }

    const generatedContent = response.text();

    console.log('Content generated successfully:', {
      template,
      title,
      contentLength: generatedContent.length
    });

    return NextResponse.json({
      success: true,
      content: generatedContent,
      template,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'gemini-1.5-flash',
        template,
        title,
        contentLength: generatedContent.length
      }
    });

  } catch (error) {
    console.error('Error generating document content:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
