import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/lib/types';
import { getMockDocumentById } from '@/lib/mock-documents';

function generateDOCXContent(document: Document): string {
  // Простий текстовий формат (в реальному додатку використовуйте бібліотеку як docx)
  const title = document.title || 'Untitled Document';
  const author = document.author || 'Unknown';
  const createdDate = document.createdDate instanceof Date 
    ? document.createdDate.toISOString() 
    : new Date().toISOString();
  const modifiedDate = document.lastModified instanceof Date 
    ? document.lastModified.toISOString() 
    : new Date().toISOString();
  const content = document.content || '';

  return `Title: ${title}
Author: ${author}
Created: ${createdDate}
Modified: ${modifiedDate}

${content}`;
}

function generateTXTContent(document: Document): string {
  const title = document.title || 'Untitled Document';
  const author = document.author || 'Unknown';
  const createdDate = document.createdDate instanceof Date 
    ? document.createdDate.toLocaleDateString('uk-UA') 
    : new Date().toLocaleDateString('uk-UA');
  const modifiedDate = document.lastModified instanceof Date 
    ? document.lastModified.toLocaleDateString('uk-UA') 
    : new Date().toLocaleDateString('uk-UA');
  const version = document.version || 1;
  const category = document.category || 'Unknown';
  const tags = (document.tags && Array.isArray(document.tags)) ? document.tags.join(', ') : '';
  const content = document.content || '';

  return `${title}

Author: ${author}
Created: ${createdDate}
Modified: ${modifiedDate}
Version: ${version}
Category: ${category}
${tags ? `Tags: ${tags}` : ''}

${'='.repeat(50)}

${content}`;
}

function generateHTMLContent(document: Document): string {
  const title = document.title || 'Untitled Document';
  const author = document.author || 'Unknown';
  const createdDate = document.createdDate instanceof Date 
    ? document.createdDate.toLocaleDateString('uk-UA') 
    : new Date().toLocaleDateString('uk-UA');
  const modifiedDate = document.lastModified instanceof Date 
    ? document.lastModified.toLocaleDateString('uk-UA') 
    : new Date().toLocaleDateString('uk-UA');
  const version = document.version || 1;
  const category = document.category || 'Unknown';
  const tags = (document.tags && Array.isArray(document.tags)) ? document.tags : [];
  const content = (document.content || '').replace(/\n/g, '<br>');
  const subject = document.metadata?.subject || 'Невказано';
  const semester = document.metadata?.semester || 'Невказано';

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    .metadata {
      background: #f5f5f5;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .content {
      white-space: pre-wrap;
      margin-top: 20px;
    }
    .tags {
      margin-top: 10px;
    }
    .tag {
      display: inline-block;
      background: #e0e0e0;
      padding: 3px 8px;
      margin: 3px;
      border-radius: 3px;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="metadata">
    <p><strong>Автор:</strong> ${author}</p>
    <p><strong>Створено:</strong> ${createdDate}</p>
    <p><strong>Оновлено:</strong> ${modifiedDate}</p>
    <p><strong>Версія:</strong> ${version}</p>
    <p><strong>Категорія:</strong> ${category}</p>
    ${document.metadata ? `
      <p><strong>Предмет:</strong> ${subject}</p>
      <p><strong>Семестр:</strong> ${semester}</p>
    ` : ''}
    ${tags.length > 0 ? `
      <div class="tags">
        <strong>Теги:</strong>
        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    ` : ''}
  </div>
  <div class="content">${content}</div>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'txt';

    const document = getMockDocumentById(id);

    if (!document) {
      console.error(`Document with id ${id} not found`);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Конвертуємо дати для безпеки (якщо вони рядки)
    let lastModified: Date;
    let createdDate: Date;
    let lastAccessed: Date | undefined;

    try {
      lastModified = document.lastModified instanceof Date 
        ? document.lastModified 
        : new Date(document.lastModified);
      
      if (isNaN(lastModified.getTime())) {
        lastModified = new Date();
      }
    } catch (e) {
      console.error('Error parsing lastModified:', e);
      lastModified = new Date();
    }

    try {
      createdDate = document.createdDate instanceof Date 
        ? document.createdDate 
        : new Date(document.createdDate);
      
      if (isNaN(createdDate.getTime())) {
        createdDate = new Date();
      }
    } catch (e) {
      console.error('Error parsing createdDate:', e);
      createdDate = new Date();
    }

    if (document.metadata?.lastAccessed) {
      try {
        lastAccessed = document.metadata.lastAccessed instanceof Date 
          ? document.metadata.lastAccessed 
          : new Date(document.metadata.lastAccessed);
        
        if (isNaN(lastAccessed.getTime())) {
          lastAccessed = undefined;
        }
      } catch (e) {
        console.error('Error parsing lastAccessed:', e);
        lastAccessed = undefined;
      }
    }

    const documentWithDates = {
      ...document,
      lastModified,
      createdDate,
      metadata: document.metadata ? {
        ...document.metadata,
        lastAccessed
      } : undefined
    };

    let content: string | Buffer;
    let contentType: string;
    let filename: string;

    // Функція для створення безпечного імені файлу (тільки ASCII)
    const sanitizeFilename = (title: string): string => {
      if (!title || typeof title !== 'string') {
        return 'document';
      }

      // Транслітерація українських символів
      const transliterationMap: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
        'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
        'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye',
        'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L',
        'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya',
        ':': '', ';': '', ',': '', '.': '', '!': '', '?': '', '-': '_', '—': '_', '–': '_'
      };

      let result = title
        .split('')
        .map(char => {
          // Спочатку перевіряємо мапу транслітерації
          if (transliterationMap[char]) {
            return transliterationMap[char];
          }
          // Якщо це ASCII символ (буква, цифра або пробіл), залишаємо
          if (/[a-zA-Z0-9\s]/.test(char)) {
            return char;
          }
          // Всі інші символи видаляємо
          return '';
        })
        .join('')
        .replace(/\s+/g, '_') // Замінюємо пробіли на підкреслення
        .replace(/_+/g, '_') // Замінюємо множинні підкреслення на одне
        .replace(/^_+|_+$/g, '') // Видаляємо підкреслення на початку та в кінці
        .toLowerCase();

      // Якщо результат порожній або занадто короткий, використовуємо fallback
      if (!result || result.length < 2) {
        result = 'document';
      }

      return result;
    };

    const fileExtension = format.toLowerCase().replace(/[^a-z0-9]/g, '') || 'txt'; // Безпечне розширення
    const sanitizedTitle = sanitizeFilename(documentWithDates.title || 'document');
    
    // Переконаємося, що розширення завжди є
    const validExtensions = ['docx', 'html', 'txt'];
    const safeExtension = validExtensions.includes(fileExtension) ? fileExtension : 'txt';

    try {
      switch (safeExtension) {
        case 'docx':
          content = generateDOCXContent(documentWithDates as Document);
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          filename = `${sanitizedTitle}.docx`;
          break;
        case 'html':
          content = generateHTMLContent(documentWithDates as Document);
          contentType = 'text/html';
          filename = `${sanitizedTitle}.html`;
          break;
        case 'txt':
        default:
          content = generateTXTContent(documentWithDates as Document);
          contentType = 'text/plain';
          filename = `${sanitizedTitle}.txt`;
          break;
      }
      
      // Додаткова перевірка, що filename має розширення
      if (!filename.includes('.')) {
        filename = `${sanitizedTitle}.${safeExtension}`;
      }
    } catch (genError) {
      console.error('Error generating content:', genError);
      throw new Error(`Failed to generate ${fileExtension} content: ${genError instanceof Error ? genError.message : 'Unknown error'}`);
    }

    if (!content) {
      throw new Error('Content generation returned empty result');
    }

    // Кодуємо ім'я файлу для Content-Disposition (RFC 5987 для не-ASCII символів)
    // Використовуємо тільки ASCII символи в filename, а повне ім'я в filename*
    const encodedFilename = encodeURIComponent(filename);
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to download document',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

