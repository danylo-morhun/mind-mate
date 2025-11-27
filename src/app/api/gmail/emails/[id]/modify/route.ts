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
    const { action } = body;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    switch (action) {
      case 'archive':
        await gmail.users.messages.modify({
          userId: 'me',
          id: id,
          requestBody: {
            removeLabelIds: ['INBOX'],
          },
        });
        return NextResponse.json({ success: true, message: 'Email archived' });

      case 'unarchive':
        await gmail.users.messages.modify({
          userId: 'me',
          id: id,
          requestBody: {
            addLabelIds: ['INBOX'],
          },
        });
        return NextResponse.json({ success: true, message: 'Email unarchived' });

      case 'star':
        await gmail.users.messages.modify({
          userId: 'me',
          id: id,
          requestBody: {
            addLabelIds: ['STARRED'],
          },
        });
        return NextResponse.json({ success: true, message: 'Email starred' });

      case 'unstar':
        await gmail.users.messages.modify({
          userId: 'me',
          id: id,
          requestBody: {
            removeLabelIds: ['STARRED'],
          },
        });
        return NextResponse.json({ success: true, message: 'Email unstarred' });

      case 'delete':
        await gmail.users.messages.trash({
          userId: 'me',
          id: id,
        });
        return NextResponse.json({ success: true, message: 'Email deleted' });

      case 'markRead':
        await gmail.users.messages.modify({
          userId: 'me',
          id: id,
          requestBody: {
            removeLabelIds: ['UNREAD'],
          },
        });
        return NextResponse.json({ success: true, message: 'Email marked as read' });

      case 'markUnread':
        await gmail.users.messages.modify({
          userId: 'me',
          id: id,
          requestBody: {
            addLabelIds: ['UNREAD'],
          },
        });
        return NextResponse.json({ success: true, message: 'Email marked as unread' });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Gmail API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to modify email',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

