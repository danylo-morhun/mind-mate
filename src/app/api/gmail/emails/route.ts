import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const maxResults = searchParams.get('maxResults') || '20';
    const query = searchParams.get('q') || '';
    const labelIds = searchParams.get('labelIds') || '';

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

    const params: any = {
      maxResults: parseInt(maxResults),
    };

    if (query) {
      params.q = query;
    }

    if (labelIds) {
      params.labelIds = labelIds.split(',');
    }

    const response = await gmail.users.messages.list({
      userId: 'me',
      ...params,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return NextResponse.json({ emails: [], total: 0 });
    }

    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        try {
          if (!message.id) {
            return null;
          }

          const email = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
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

          const labelIds = message.labelIds || [];
          const labelNames = labelIds.map((id: string) => {
            if (!id) return id;
            return labelsMap.get(id) || id;
          });

          return {
            id: message.id,
            threadId: message.threadId,
            labelIds: labelIds,
            labelNames: labelNames,
            snippet: message.snippet || '',
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
        } catch (emailError) {
          console.error(`Failed to fetch email ${message.id}:`, emailError);
          return null;
        }
      })
    );

    const validEmails = emails.filter((email) => email !== null);

    return NextResponse.json({
      emails: validEmails,
      total: response.data.resultSizeEstimate || validEmails.length,
      nextPageToken: response.data.nextPageToken,
    });

  } catch (error: any) {
    console.error('Gmail API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch emails from Gmail',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
