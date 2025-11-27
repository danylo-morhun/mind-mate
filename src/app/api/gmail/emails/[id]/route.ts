import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';

export async function GET(
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

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    let labelsMap = new Map<string, string>();
    try {
      const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
      if (labelsResponse.data.labels) {
        labelsResponse.data.labels.forEach((label) => {
          if (label.id && label.name) {
            labelsMap.set(label.id, label.name);
          }
        });
      }
    } catch (labelsError) {
      console.error('Failed to fetch labels, continuing without label names:', labelsError);
    }

    const response = await gmail.users.messages.get({
      userId: 'me',
      id: id,
      format: 'full',
    });

    const message = response.data;
    const payload = message.payload;

    if (!payload) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Функція для отримання тексту листа
    const getEmailBody = (payload: any): string => {
      if (payload.body?.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
      }

      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
          if (part.mimeType === 'text/html' && part.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
        }
      }

      return '';
    };

    // Функція для отримання вкладень
    const getAttachments = (payload: any): any[] => {
      const attachments: any[] = [];

      const processPart = (part: any) => {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            id: part.body.attachmentId,
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
          });
        }

        if (part.parts) {
          part.parts.forEach(processPart);
        }
      };

      if (payload.parts) {
        payload.parts.forEach(processPart);
      }

      return attachments;
    };

    // Отримуємо заголовки
    const headers = payload.headers || [];
    const getHeader = (name: string) => 
      headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    const labelIds = message.labelIds || [];
    const labelNames = labelIds.map((id: string) => {
      if (!id) return id;
      return labelsMap.get(id) || id;
    });

    const email = {
      id: message.id,
      threadId: message.threadId,
      labelIds: labelIds,
      labelNames: labelNames,
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
      body: getEmailBody(payload),
      attachments: getAttachments(payload),
      mimeType: payload.mimeType,
    };

    return NextResponse.json(email);

  } catch (error: any) {
    console.error('Gmail API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch email from Gmail',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
