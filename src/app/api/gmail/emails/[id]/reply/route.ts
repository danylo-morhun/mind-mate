import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { replyText, subject } = body;

    if (!replyText || !replyText.trim()) {
      return NextResponse.json(
        { error: 'Reply text is required' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const originalMessage = await gmail.users.messages.get({
      userId: 'me',
      id: id,
      format: 'metadata',
      metadataHeaders: ['From', 'To', 'Subject', 'Message-ID', 'References', 'In-Reply-To'],
    });

    const headers = originalMessage.data.payload?.headers || [];
    const getHeader = (name: string) => 
      headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    const fromEmail = getHeader('From');
    const originalSubject = getHeader('Subject');
    const messageId = getHeader('Message-ID');
    const references = getHeader('References');
    const inReplyTo = getHeader('In-Reply-To');
    const threadId = originalMessage.data.threadId;

    const replySubject = subject || (originalSubject.startsWith('Re: ') 
      ? originalSubject 
      : `Re: ${originalSubject}`);

    const extractEmail = (from: string): string => {
      const match = from.match(/<(.+)>/);
      return match ? match[1] : from.trim();
    };

    const toEmail = extractEmail(fromEmail);

    const newReferences = references 
      ? `${references} ${messageId}` 
      : messageId;
    const newInReplyTo = messageId;

    const messageParts = [
      `To: ${toEmail}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${newInReplyTo}`,
      `References: ${newReferences}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      replyText,
    ];

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        threadId: threadId,
        raw: encodedMessage,
      },
    });

    try {
      await gmail.users.messages.modify({
        userId: 'me',
        id: id,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
    } catch (error) {
      console.error('Failed to mark email as read:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      messageId: response.data.id,
    });

  } catch (error: any) {
    console.error('Gmail API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send reply',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

