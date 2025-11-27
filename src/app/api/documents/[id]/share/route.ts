import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId, transformDocument } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';

// GET - Отримати всі поширені посилання та запрошення для документа
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    
    // Verify document exists and belongs to user
    const { data: dbDocument, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !dbDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // For now, return empty arrays (share functionality can be implemented later with a share_links table)
    return NextResponse.json({
      links: [],
      invitations: []
    });
  } catch (error) {
    console.error('Error fetching share data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share data' },
      { status: 500 }
    );
  }
}

// POST - Створити поширене посилання або запрошення
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, accessLevel, expiresAt, email, message } = body;

    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    
    // Verify document exists and belongs to user
    const { data: dbDocument, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !dbDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (type === 'link') {
      // For now, return a simple link structure (can be stored in database later)
      const linkId = Math.random().toString(36).substring(2, 15);
      const newLink = {
        id: `link_${Date.now()}`,
        documentId: id,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents/shared/${linkId}`,
        accessLevel: accessLevel || 'view',
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        accessCount: 0
      };

      return NextResponse.json(newLink, { status: 201 });
    } else if (type === 'invitation') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required for invitations' },
          { status: 400 }
        );
      }

      const newInvitation = {
        id: `inv_${Date.now()}`,
        documentId: id,
        email: email,
        accessLevel: accessLevel || 'view',
        status: 'pending',
        sentAt: new Date().toISOString(),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        message: message,
        createdBy: userId
      };

      // TODO: Store in database and send email invitation
      return NextResponse.json(newInvitation, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "link" or "invitation"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating share:', error);
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    );
  }
}

