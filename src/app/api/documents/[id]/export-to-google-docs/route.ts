import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/supabase/utils';
import { marked } from 'marked';

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

    // Створюємо Google Docs документ через Google Docs API
    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Створюємо новий документ
    const createResponse = await drive.files.create({
      requestBody: {
        name: document.title,
        mimeType: 'application/vnd.google-apps.document',
        ...(folderId && { parents: [folderId] }),
      },
    });

    const googleDocId = createResponse.data.id;
    if (!googleDocId) {
      return NextResponse.json(
        { error: 'Failed to create Google Doc' },
        { status: 500 }
      );
    }

    // Додаємо контент до документа, якщо він є
    const content = document.content || '';
    if (content) {
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
      
      // Convert HTML to plain text with basic formatting
      // Remove HTML tags but preserve structure
      const textContent = htmlContent
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
      
      // Insert the formatted text
      await docs.documents.batchUpdate({
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

    // Отримуємо URL документа
    const docUrl = `https://docs.google.com/document/d/${googleDocId}/edit`;

    // Оновлюємо документ в базі даних з посиланням на Google Docs
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        google_doc_id: googleDocId,
        google_doc_url: docUrl,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating document with Google Doc ID:', updateError);
    }

    return NextResponse.json({
      success: true,
      googleDocId,
      url: docUrl,
      title: document.title,
      message: 'Document exported to Google Docs successfully',
    });

  } catch (error) {
    console.error('Error exporting document to Google Docs:', error);
    return NextResponse.json(
      {
        error: 'Failed to export document to Google Docs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

