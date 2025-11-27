import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { createServerClient } from '@/lib/supabase/server';
import { getCurrentUserId } from '@/lib/supabase/utils';
import { transformDocumentForDb } from '@/lib/supabase/utils';

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

    // Створюємо Google Docs документ через Google Drive API
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const docs = google.docs({ version: 'v1', auth: oauth2Client });

    // Створюємо новий документ
    const createResponse = await drive.files.create({
      requestBody: {
        name: title,
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
    if (content) {
      await docs.documents.batchUpdate({
        documentId: googleDocId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    }

    // Отримуємо URL документа
    const docUrl = `https://docs.google.com/document/d/${googleDocId}/edit`;

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
      // Не повертаємо помилку, бо Google Doc вже створено
    }

    return NextResponse.json({
      success: true,
      googleDocId,
      url: docUrl,
      title,
      documentId: newDocument?.id,
      message: 'Google Docs document created successfully',
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

