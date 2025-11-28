import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/supabase/utils';
import { transformDocumentForDb } from '@/lib/supabase/utils';
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
    const { title, content, folderId, category, tags, metadata } = body;

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

    // Створюємо Google Sheets документ через Google Drive API
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Створюємо новий spreadsheet
    const createResponse = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        ...(folderId && { parents: [folderId] }),
      },
    });

    const googleSheetId = createResponse.data.id;
    if (!googleSheetId) {
      console.error('Failed to create Google Sheet: No ID returned from Drive API', createResponse.data);
      return NextResponse.json(
        { error: 'Failed to create Google Sheet: No ID returned' },
        { status: 500 }
      );
    }

    // Додаємо дані до таблиці, якщо вони є
    if (content) {
      try {
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
          
          // Оновлюємо дані
          const endColumn = getColumnLetter(numCols);
          await sheets.spreadsheets.values.update({
            spreadsheetId: googleSheetId,
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
            
            await sheets.spreadsheets.batchUpdate({
              spreadsheetId: googleSheetId,
              requestBody: {
                requests: formatRequests,
              },
            });
          }
        }
      } catch (error) {
        console.error('Error adding content to sheet:', error);
        // Продовжуємо навіть якщо не вдалося додати контент
      }
    }

    // Отримуємо URL документа
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/edit`;

    // Створюємо запис в базі даних
    const supabase = createServerClient();
    const documentData = transformDocumentForDb({
      title,
      content: content || '',
      type: 'sheet',
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
      googleDocId: googleSheetId,
      googleDocUrl: sheetUrl,
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
          type: 'sheet',
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
          googleDocId: googleSheetId,
          googleDocUrl: sheetUrl,
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
              googleSheetId,
              googleDocId: googleSheetId,
              url: sheetUrl,
              title,
              documentId: null,
            },
            { status: 200 } // Повертаємо 200, щоб frontend міг обробити
          );
        }
        
        // Retry успішний
        return NextResponse.json({
          success: true,
          googleSheetId,
          googleDocId: googleSheetId,
          url: sheetUrl,
          title,
          documentId: retryDocument?.id,
          message: 'Google Sheets document created successfully',
        });
      } catch (retryError) {
        console.error('Error in retry:', retryError);
        return NextResponse.json(
          {
            success: false,
            warning: 'Document created in Google but failed to save to database',
            error: insertError.message,
            details: insertError.message,
            googleSheetId,
            googleDocId: googleSheetId,
            url: sheetUrl,
            title,
            documentId: null,
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      googleSheetId,
      googleDocId: googleSheetId, // Also include as googleDocId for consistency
      url: sheetUrl,
      title,
      documentId: newDocument?.id,
      message: 'Google Sheets document created successfully',
    });

  } catch (error: any) {
    console.error('Error creating Google Sheet:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      response: error?.response?.data,
      stack: error?.stack
    });
    return NextResponse.json(
      {
        error: 'Failed to create Google Sheet',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: error?.code,
        response: error?.response?.data
      },
      { status: 500 }
    );
  }
}

