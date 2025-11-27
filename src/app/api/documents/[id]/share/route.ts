import { NextRequest, NextResponse } from 'next/server';
import { getMockDocumentById } from '@/lib/mock-documents';
import {
  getShareLinksByDocumentId,
  getShareInvitationsByDocumentId,
  addShareLink,
  addShareInvitation,
  ShareLink,
  ShareInvitation
} from '@/lib/mock-share-data';

// GET - Отримати всі поширені посилання та запрошення для документа
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const document = getMockDocumentById(id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const documentLinks = getShareLinksByDocumentId(id);
    const documentInvitations = getShareInvitationsByDocumentId(id);

    return NextResponse.json({
      links: documentLinks,
      invitations: documentInvitations
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

    const document = getMockDocumentById(id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (type === 'link') {
      // Створюємо поширене посилання
      const linkId = Math.random().toString(36).substring(2, 15);
      const newLink: ShareLink = {
        id: `link_${Date.now()}`,
        documentId: id,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents/shared/${linkId}`,
        accessLevel: accessLevel || 'view',
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        isActive: true,
        createdAt: new Date(),
        createdBy: 'current_user', // В реальному додатку з сесії
        accessCount: 0
      };

      addShareLink(newLink);

      return NextResponse.json(newLink, { status: 201 });
    } else if (type === 'invitation') {
      // Створюємо запрошення
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required for invitations' },
          { status: 400 }
        );
      }

      const newInvitation: ShareInvitation = {
        id: `inv_${Date.now()}`,
        documentId: id,
        email: email,
        accessLevel: accessLevel || 'view',
        status: 'pending',
        sentAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів за замовчуванням
        message: message,
        createdBy: 'current_user' // В реальному додатку з сесії
      };

      addShareInvitation(newInvitation);

      // TODO: Відправити email з запрошенням
      // await sendInvitationEmail(newInvitation);

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

