import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/supabase/utils';
import { transformDocumentForDb } from '@/lib/supabase/utils';
import { marked } from 'marked';
import { markdownToSheetRows, getMaxColumns, getColumnLetter } from '@/lib/utils/markdown-to-sheets';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, folderId, category, type, tags, metadata } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Налаштовуємо OAuth клієнт
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Визначаємо тип документа та відповідний MIME type
    const documentType = type || 'doc';
    let mimeType: string;
    let googleDocId: string;
    let docUrl: string;
    let apiClient: any;

    switch (documentType) {
      case 'sheet':
        mimeType = 'application/vnd.google-apps.spreadsheet';
        apiClient = google.sheets({ version: 'v4', auth: oauth2Client });
        break;
      default:
        mimeType = 'application/vnd.google-apps.document';
        apiClient = google.docs({ version: 'v1', auth: oauth2Client });
    }

    // Створюємо новий документ
    const createResponse = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: mimeType,
        ...(folderId && { parents: [folderId] }),
      },
    });

    googleDocId = createResponse.data.id!;
    if (!googleDocId) {
      return NextResponse.json(
        { error: `Failed to create Google ${documentType === 'sheet' ? 'Sheet' : 'Doc'}` },
        { status: 500 }
      );
    }

    // Додаємо контент до документа, якщо він є
    if (content) {
      try {
        if (documentType === 'sheet') {
          // Для таблиць парсимо контент (CSV або markdown)
          let values: any[][] = [];
          let headerRows: number[] = [];
          
          // Перевіряємо чи це CSV (містить коми в кожному рядку) або markdown
          const lines = content.split('\n').filter(line => line.trim());
          const isCSV = lines.length > 0 && lines.every(line => line.includes(','));
          
          if (isCSV && !content.match(/^#+\s|^\*\s|^-\s|^\d+\.\s|\*\*.*\*\*/m)) {
            // Парсимо як CSV
            values = lines.map(line => {
              const cells: string[] = [];
              let currentCell = '';
              let insideQuotes = false;
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                  if (insideQuotes && line[i + 1] === '"') {
                    currentCell += '"';
                    i++;
                  } else {
                    insideQuotes = !insideQuotes;
                  }
                } else if (char === ',' && !insideQuotes) {
                  cells.push(currentCell.trim());
                  currentCell = '';
                } else {
                  currentCell += char;
                }
              }
              
              cells.push(currentCell.trim());
              return cells;
            });
            
            // Перший рядок CSV - заголовок
            if (values.length > 0) {
              headerRows.push(0);
            }
          } else {
            // Парсимо markdown в структуру таблиці
            const sheetRows = markdownToSheetRows(content);
            
            if (sheetRows.length > 0) {
              const maxCols = getMaxColumns(sheetRows);
              
              values = sheetRows.map((row, index) => {
                const rowValues = [...row.cells];
                while (rowValues.length < maxCols) {
                  rowValues.push('');
                }
                
                if (row.isHeader) {
                  headerRows.push(index);
                }
                
                return rowValues;
              });
            }
          }
          
          if (values.length > 0) {
            const numRows = values.length;
            const numCols = Math.max(...values.map(row => row.length), 0);
            
            const endColumn = getColumnLetter(numCols);
            await apiClient.spreadsheets.values.update({
              spreadsheetId: googleDocId,
              range: `A1:${endColumn}${numRows}`,
              valueInputOption: 'RAW',
              requestBody: {
                values: values,
              },
            });
            
            // Форматуємо заголовки
            if (headerRows.length > 0 && numCols > 0) {
              const formatRequests = headerRows.map(rowIndex => ({
                repeatCell: {
                  range: {
                    sheetId: 0,
                    startRowIndex: rowIndex,
                    endRowIndex: rowIndex + 1,
                    startColumnIndex: 0,
                    endColumnIndex: numCols,
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: {
                        bold: true,
                      },
                      backgroundColor: {
                        red: 0.9,
                        green: 0.9,
                        blue: 0.9,
                      },
                    },
                  },
                  fields: 'userEnteredFormat.textFormat.bold,userEnteredFormat.backgroundColor',
                },
              }));
              
              await apiClient.spreadsheets.batchUpdate({
                spreadsheetId: googleDocId,
                requestBody: {
                  requests: formatRequests,
                },
              });
            }
          }
        } else {
          // Для документів додаємо текст, парсимо markdown якщо потрібно
          let textContent = content;
          
          // Перевіряємо чи контент містить markdown (headers, lists, bold, etc.)
          const hasMarkdown = /^#+\s|^\*\s|^-\s|^\d+\.\s|\*\*.*\*\*|`.*`/m.test(content);
          
          if (hasMarkdown) {
            // Parse markdown to HTML first
            marked.setOptions({
              breaks: true,
              gfm: true,
            });
            
            let htmlContent = '';
            try {
              htmlContent = marked.parse(content);
            } catch (error) {
              console.error('Error parsing markdown:', error);
              htmlContent = content.replace(/\n/g, '<br>');
            }
            
            // Convert HTML to plain text with basic formatting for Google Docs
            textContent = htmlContent
              .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n$1\n\n')
              .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n$1\n\n')
              .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n$1\n\n')
              .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n\n$1\n\n')
              .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n\n$1\n\n')
              .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n\n$1\n\n')
              .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
              .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
              .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
              .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
              .replace(/<code[^>]*>(.*?)<\/code>/gi, '$1')
              .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '\n$1\n')
              .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '\n$1\n')
              .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '\n$1\n')
              .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
              .replace(/<[^>]+>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/\n{3,}/g, '\n\n')
              .trim();
          }
          
          await apiClient.documents.batchUpdate({
            documentId: googleDocId,
            requestBody: {
              requests: [
                {
                  insertText: {
                    location: { index: 1 },
                    text: textContent,
                  },
                },
              ],
            },
          });
        }
      } catch (error) {
        console.error('Error adding content:', error);
        // Продовжуємо навіть якщо не вдалося додати контент
      }
    }

    // Отримуємо URL документа
    if (documentType === 'sheet') {
      docUrl = `https://docs.google.com/spreadsheets/d/${googleDocId}/edit`;
    } else {
      docUrl = `https://docs.google.com/document/d/${googleDocId}/edit`;
    }

    // Створюємо запис в базі даних
    const supabase = createServerClient();
    const documentData = transformDocumentForDb({
      title,
      content: content || '',
      type: type || 'doc',
      category: category || 'other',
      author: userId,
      collaborators: [],
      version: 1,
      tags: tags || [],
      status: 'draft',
      permissions: {
        canView: [userId],
        canEdit: [userId],
        canComment: [userId],
        canShare: [userId],
        isPublic: false,
      },
      metadata: metadata || {},
      aiGenerated: false,
      googleDocId,
      googleDocUrl: docUrl,
    }, userId);

    const { data: newDocument, error: insertError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating document in database:', insertError);
      console.error('Insert error details:', JSON.stringify(insertError, null, 2));
      
      // Спробуємо зберегти ще раз з базовими даними
      try {
        const retryData = transformDocumentForDb({
          title,
          content: content || '',
          type: type || 'doc',
          category: category || 'other',
          author: userId,
          collaborators: [],
          version: 1,
          tags: tags || [],
          status: 'draft',
          permissions: {
            canView: [userId],
            canEdit: [userId],
            canComment: [userId],
            canShare: [userId],
            isPublic: false,
          },
          metadata: metadata || {},
          aiGenerated: false,
          googleDocId,
          googleDocUrl: docUrl,
        }, userId);
        
        const { data: retryDocument, error: retryError } = await supabase
          .from('documents')
          .insert(retryData)
          .select()
          .single();
        
        if (retryError) {
          console.error('Retry also failed:', retryError);
          // Повертаємо попередження, але все одно дозволяємо відкрити документ
          return NextResponse.json(
            {
              success: false,
              warning: 'Document created in Google but failed to save to database',
              error: retryError.message,
              details: retryError.message,
              googleDocId,
              url: docUrl,
              title,
              documentId: null,
            },
            { status: 200 } // Повертаємо 200, щоб frontend міг обробити
          );
        }
        
        // Retry успішний
        const typeName = documentType === 'sheet' ? 'Sheet' : 'Doc';
        return NextResponse.json({
          success: true,
          googleDocId,
          url: docUrl,
          title,
          documentId: retryDocument?.id,
          message: `Google ${typeName} document created successfully`,
        });
      } catch (retryError) {
        console.error('Error in retry:', retryError);
        return NextResponse.json(
          {
            success: false,
            warning: 'Document created in Google but failed to save to database',
            error: insertError.message,
            details: insertError.message,
            googleDocId,
            url: docUrl,
            title,
            documentId: null,
          },
          { status: 200 }
        );
      }
    }

    const typeName = documentType === 'sheet' ? 'Sheet' : 'Doc';
    
    return NextResponse.json({
      success: true,
      googleDocId,
      url: docUrl,
      title,
      documentId: newDocument?.id,
      message: `Google ${typeName} document created successfully`,
    });

  } catch (error) {
    console.error('Error creating Google Doc:', error);
    return NextResponse.json(
      {
        error: 'Failed to create Google Doc',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

