import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    // Створюємо Gmail API клієнт
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Отримуємо всі мітки
    const response = await gmail.users.labels.list({
      userId: 'me',
    });

    const labels = response.data.labels || [];

    // Фільтруємо системні мітки та форматуємо їх
    const formattedLabels = labels
      .filter(label => label.id && label.name)
      .map(label => ({
        id: label.id,
        name: label.name,
        type: label.type,
        messagesTotal: label.messagesTotal || 0,
        messagesUnread: label.messagesUnread || 0,
        threadTotal: label.threadsTotal || 0,
        threadUnread: label.threadsUnread || 0,
      }))
      .sort((a, b) => {
        // Системні мітки спочатку
        if (a.id === 'INBOX') return -1;
        if (b.id === 'INBOX') return 1;
        if (a.id === 'SENT') return -1;
        if (b.id === 'SENT') return -1;
        if (a.id === 'DRAFT') return -1;
        if (b.id === 'DRAFT') return -1;
        if (a.id === 'SPAM') return -1;
        if (b.id === 'SPAM') return -1;
        if (a.id === 'TRASH') return -1;
        if (b.id === 'TRASH') return -1;
        
        // Потім користувацькі мітки за алфавітом
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({
      labels: formattedLabels,
      total: formattedLabels.length,
    });

  } catch (error) {
    console.error('Gmail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labels from Gmail' },
      { status: 500 }
    );
  }
}
