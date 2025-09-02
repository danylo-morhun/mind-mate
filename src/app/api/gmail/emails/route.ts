import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Gmail API - Session:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      accessTokenLength: session?.accessToken?.length || 0
    });
    
    if (!session?.accessToken) {
      console.log('Gmail API - No access token found');
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const maxResults = searchParams.get('maxResults') || '20';
    const query = searchParams.get('q') || '';
    const labelIds = searchParams.get('labelIds') || '';

    // Створюємо Gmail API клієнт
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Параметри запиту
    const params: any = {
      maxResults: parseInt(maxResults),
    };

    if (query) {
      params.q = query;
    }

    if (labelIds) {
      params.labelIds = labelIds.split(',');
    }

    // Отримуємо список листів
    const response = await gmail.users.messages.list({
      userId: 'me',
      ...params,
    });

    if (!response.data.messages) {
      return NextResponse.json({ emails: [], total: 0 });
    }

    // Отримуємо детальну інформацію про кожен лист
    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'metadata',
          metadataHeaders: [
            'From',
            'To',
            'Subject',
            'Date',
            'Message-ID',
            'References',
            'In-Reply-To',
          ],
        });

        const headers = email.data.payload?.headers || [];
        const getHeader = (name: string) => 
          headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

        return {
          id: message.id,
          threadId: message.threadId,
          labelIds: message.labelIds || [],
          snippet: message.snippet,
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          date: getHeader('Date'),
          messageId: getHeader('Message-ID'),
          references: getHeader('References'),
          inReplyTo: getHeader('In-Reply-To'),
          internalDate: message.internalDate,
          sizeEstimate: message.sizeEstimate,
        };
      })
    );

    return NextResponse.json({
      emails,
      total: response.data.resultSizeEstimate || emails.length,
      nextPageToken: response.data.nextPageToken,
    });

  } catch (error) {
    console.error('Gmail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails from Gmail' },
      { status: 500 }
    );
  }
}
