import { NextRequest, NextResponse } from 'next/server';
import { getMockDocumentById } from '@/lib/mock-documents';
import {
  getShareLinkById,
  getShareInvitationById,
  updateShareLink,
  updateShareInvitation,
  deleteShareLink,
  deleteShareInvitation
} from '@/lib/mock-share-data';

// GET - Отримати конкретне поширене посилання або запрошення
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; shareId: string }> }
) {
  try {
    const { id, shareId } = await params;
    
    const document = getMockDocumentById(id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const link = getShareLinkById(shareId);
    const invitation = getShareInvitationById(shareId);
    
    // Перевіряємо, що посилання/запрошення належить документу
    if (link && link.documentId !== id) {
      return NextResponse.json(
        { error: 'Share not found for this document' },
        { status: 404 }
      );
    }
    
    if (invitation && invitation.documentId !== id) {
      return NextResponse.json(
        { error: 'Share not found for this document' },
        { status: 404 }
      );
    }

    if (!link && !invitation) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(link || invitation);
  } catch (error) {
    console.error('Error fetching share:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share' },
      { status: 500 }
    );
  }
}

// PUT - Оновити поширене посилання або запрошення
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; shareId: string }> }
) {
  try {
    const { id, shareId } = await params;
    const body = await request.json();
    
    const document = getMockDocumentById(id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const link = getShareLinkById(shareId);
    const invitation = getShareInvitationById(shareId);

    // Перевіряємо, що посилання/запрошення належить документу
    if (link && link.documentId !== id) {
      return NextResponse.json(
        { error: 'Share not found for this document' },
        { status: 404 }
      );
    }
    
    if (invitation && invitation.documentId !== id) {
      return NextResponse.json(
        { error: 'Share not found for this document' },
        { status: 404 }
      );
    }

    if (link) {
      // Оновлюємо посилання
      const updates: Partial<typeof link> = {
        ...body,
        lastAccessed: body.isActive !== undefined && !body.isActive ? link.lastAccessed : new Date()
      };
      const updatedLink = updateShareLink(shareId, updates);
      if (!updatedLink) {
        return NextResponse.json(
          { error: 'Failed to update share link' },
          { status: 500 }
        );
      }
      return NextResponse.json(updatedLink);
    } else if (invitation) {
      // Оновлюємо запрошення
      const updatedInvitation = updateShareInvitation(shareId, body);
      if (!updatedInvitation) {
        return NextResponse.json(
          { error: 'Failed to update share invitation' },
          { status: 500 }
        );
      }
      return NextResponse.json(updatedInvitation);
    } else {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating share:', error);
    return NextResponse.json(
      { error: 'Failed to update share' },
      { status: 500 }
    );
  }
}

// DELETE - Видалити поширене посилання або запрошення
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; shareId: string }> }
) {
  try {
    const { id, shareId } = await params;
    
    const document = getMockDocumentById(id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const link = getShareLinkById(shareId);
    const invitation = getShareInvitationById(shareId);

    // Перевіряємо, що посилання/запрошення належить документу
    if (link && link.documentId !== id) {
      return NextResponse.json(
        { error: 'Share not found for this document' },
        { status: 404 }
      );
    }
    
    if (invitation && invitation.documentId !== id) {
      return NextResponse.json(
        { error: 'Share not found for this document' },
        { status: 404 }
      );
    }

    if (link) {
      const success = deleteShareLink(shareId);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to delete share link' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Share link deleted successfully',
        deletedShare: link
      });
    } else if (invitation) {
      const success = deleteShareInvitation(shareId);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to delete share invitation' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Share invitation deleted successfully',
        deletedShare: invitation
      });
    } else {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting share:', error);
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    );
  }
}

