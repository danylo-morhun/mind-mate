import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/supabase/utils';
import { markdownToSheetRows, getMaxColumns, getColumnLetter } from '@/lib/utils/markdown-to-sheets';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { folderId } = body;

    // Отримуємо документ з бази даних
    const supabase = createServerClient();
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
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
        name: document.title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        ...(folderId && { parents: [folderId] }),
      },
    });

    const googleSheetId = createResponse.data.id;
    if (!googleSheetId) {
      return NextResponse.json(
        { error: 'Failed to create Google Sheet' },
        { status: 500 }
      );
    }

    // Додаємо контент до таблиці, якщо він є
    const content = document.content || '';
    if (content) {
      try {
        let values: any[][] = [];
        let headerRows: number[] = []; // Track which rows are headers
        
        // Перевіряємо чи це CSV (містить коми в кожному рядку) або markdown
        const lines = content.split('\n').filter(line => line.trim());
        const isCSV = lines.length > 0 && lines.every(line => line.includes(','));
        
        if (isCSV && !content.match(/^#+\s|^\*\s|^-\s|^\d+\.\s|\*\*.*\*\*/m)) {
          // Парсимо як CSV (якщо не містить markdown)
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
            // Конвертуємо в масив значень
            const maxCols = getMaxColumns(sheetRows);
            
            values = sheetRows.map((row, index) => {
              const rowValues = [...row.cells];
              // Заповнюємо порожні комірки для вирівнювання
              while (rowValues.length < maxCols) {
                rowValues.push('');
              }
              
              // Відстежуємо рядки-заголовки
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

    // Оновлюємо документ в базі даних з посиланням на Google Sheets
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        google_doc_id: googleSheetId,
        google_doc_url: sheetUrl,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating document with Google Sheet ID:', updateError);
    }

    return NextResponse.json({
      success: true,
      googleSheetId,
      url: sheetUrl,
      title: document.title,
      message: 'Document exported to Google Sheets successfully',
    });

  } catch (error) {
    console.error('Error exporting document to Google Sheets:', error);
    return NextResponse.json(
      {
        error: 'Failed to export document to Google Sheets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

