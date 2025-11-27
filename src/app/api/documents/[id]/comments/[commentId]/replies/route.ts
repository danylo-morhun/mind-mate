import { NextRequest, NextResponse } from 'next/server';
import { 
  getMockCommentById,
  addMockCommentReply 
} from '@/lib/mock-comments';
import { getMockDocumentById } from '@/lib/mock-documents';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const body = await request.json();
    
    const document = getMockDocumentById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    const comment = getMockCommentById(commentId);
    if (!comment || comment.documentId !== id) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    if (!body.content || !body.author) {
      return NextResponse.json(
        { error: 'Content and author are required' },
        { status: 400 }
      );
    }
    
    const updatedComment = addMockCommentReply(commentId, {
      author: body.author,
      content: body.content
    });
    
    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Failed to add reply' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedComment, { status: 201 });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}

