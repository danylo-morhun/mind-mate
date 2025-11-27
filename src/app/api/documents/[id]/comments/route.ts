import { NextRequest, NextResponse } from 'next/server';
import { 
  getMockCommentsByDocumentId, 
  addMockComment 
} from '@/lib/mock-comments';
import { getMockDocumentById } from '@/lib/mock-documents';

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
    
    const comments = getMockCommentsByDocumentId(id);
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const document = getMockDocumentById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    if (!body.content || !body.author) {
      return NextResponse.json(
        { error: 'Content and author are required' },
        { status: 400 }
      );
    }
    
    const newComment = addMockComment({
      documentId: id,
      author: body.author,
      content: body.content,
      replies: []
    });
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

