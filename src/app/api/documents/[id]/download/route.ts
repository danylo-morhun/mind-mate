import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/lib/types';
import { getCurrentUserId, transformDocument } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';
import { marked } from 'marked';

// Helper function to convert markdown to plain text (for DOCX/TXT)
function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    // Convert headers to plain text with spacing
    .replace(/^### (.*$)/gim, '\n$1\n')
    .replace(/^## (.*$)/gim, '\n\n$1\n\n')
    .replace(/^# (.*$)/gim, '\n\n$1\n\n')
    // Convert bold/italic to plain text
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // Convert lists
    .replace(/^\* (.*$)/gim, '• $1')
    .replace(/^- (.*$)/gim, '• $1')
    .replace(/^\d+\. (.*$)/gim, '$1')
    // Remove horizontal rules
    .replace(/^---$/gim, '')
    .replace(/^___$/gim, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function generateDOCXContent(document: Document): string {
  // Convert markdown to formatted plain text for DOCX
  const title = document.title || 'Untitled Document';
  const author = document.author || 'Unknown';
  const createdDate = document.createdDate instanceof Date 
    ? document.createdDate.toLocaleDateString('uk-UA') 
    : new Date().toLocaleDateString('uk-UA');
  const modifiedDate = document.lastModified instanceof Date 
    ? document.lastModified.toLocaleDateString('uk-UA') 
    : new Date().toLocaleDateString('uk-UA');
  const content = markdownToPlainText(document.content || '');

  return `${title}

Автор: ${author}
Створено: ${createdDate}
Оновлено: ${modifiedDate}

${'='.repeat(60)}

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
  const content = markdownToPlainText(document.content || '');

  return `${title}

Автор: ${author}
Створено: ${createdDate}
Оновлено: ${modifiedDate}
Версія: ${version}
Категорія: ${category}
${tags ? `Теги: ${tags}` : ''}

${'='.repeat(60)}

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
  const subject = document.metadata?.subject || 'Невказано';
  const semester = document.metadata?.semester || 'Невказано';
  
  // Parse markdown content to HTML
  let parsedContent = '';
  try {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    parsedContent = marked.parse(document.content || '');
  } catch (error) {
    console.error('Error parsing markdown:', error);
    // Fallback to plain text if markdown parsing fails
    parsedContent = (document.content || '').replace(/\n/g, '<br>');
  }

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      line-height: 1.8;
      color: #333;
      background: #fff;
    }
    .document-header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .document-header h1 {
      color: #1e40af;
      margin: 0 0 10px 0;
      font-size: 2.5em;
      font-weight: 700;
    }
    .metadata {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 25px;
      margin: 30px 0;
      border-radius: 10px;
      border-left: 4px solid #2563eb;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metadata p {
      margin: 8px 0;
      color: #475569;
    }
    .metadata strong {
      color: #1e293b;
      font-weight: 600;
    }
    .content {
      margin-top: 30px;
      color: #1e293b;
    }
    .content h1 {
      color: #1e40af;
      font-size: 2em;
      margin-top: 40px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #3b82f6;
      font-weight: 700;
    }
    .content h2 {
      color: #2563eb;
      font-size: 1.75em;
      margin-top: 35px;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .content h3 {
      color: #3b82f6;
      font-size: 1.5em;
      margin-top: 30px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .content h4 {
      color: #60a5fa;
      font-size: 1.25em;
      margin-top: 25px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .content p {
      margin: 15px 0;
      text-align: justify;
    }
    .content ul, .content ol {
      margin: 15px 0;
      padding-left: 30px;
    }
    .content li {
      margin: 8px 0;
    }
    .content ul li {
      list-style-type: disc;
    }
    .content ol li {
      list-style-type: decimal;
    }
    .content code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #e11d48;
      border: 1px solid #cbd5e1;
    }
    .content pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .content pre code {
      background: transparent;
      padding: 0;
      border: none;
      color: inherit;
      font-size: 0.9em;
    }
    .content blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 20px;
      margin: 20px 0;
      color: #64748b;
      font-style: italic;
      background: #f8fafc;
      padding: 15px 20px;
      border-radius: 4px;
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .content table th,
    .content table td {
      border: 1px solid #cbd5e1;
      padding: 12px;
      text-align: left;
    }
    .content table th {
      background: #3b82f6;
      color: white;
      font-weight: 600;
    }
    .content table tr:nth-child(even) {
      background: #f8fafc;
    }
    .content a {
      color: #2563eb;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }
    .content a:hover {
      border-bottom-color: #2563eb;
    }
    .content hr {
      border: none;
      border-top: 2px solid #cbd5e1;
      margin: 30px 0;
    }
    .content strong {
      font-weight: 700;
      color: #1e293b;
    }
    .content em {
      font-style: italic;
    }
    .tags {
      margin-top: 15px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 500;
    }
    @media print {
      body {
        padding: 20px;
      }
      .metadata {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="document-header">
    <h1>${escapeHtml(title)}</h1>
  </div>
  <div class="metadata">
    <p><strong>Автор:</strong> ${escapeHtml(author)}</p>
    <p><strong>Створено:</strong> ${escapeHtml(createdDate)}</p>
    <p><strong>Оновлено:</strong> ${escapeHtml(modifiedDate)}</p>
    <p><strong>Версія:</strong> ${version}</p>
    <p><strong>Категорія:</strong> ${escapeHtml(category)}</p>
    ${document.metadata ? `
      <p><strong>Предмет:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Семестр:</strong> ${escapeHtml(semester)}</p>
    ` : ''}
    ${tags.length > 0 ? `
      <div class="tags">
        ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    ` : ''}
  </div>
  <div class="content">${parsedContent}</div>
</body>
</html>`;
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  if (!text) return '';
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'txt';

    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    
    // Fetch document from Supabase
    const { data: dbDocument, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !dbDocument) {
      console.error(`Document with id ${id} not found:`, fetchError);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = transformDocument(dbDocument);

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

