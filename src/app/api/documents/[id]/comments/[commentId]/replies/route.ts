import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId, transformDocument } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const body = await request.json();
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
    
    if (!body.content || !body.author) {
      return NextResponse.json(
        { error: 'Content and author are required' },
        { status: 400 }
      );
    }
    
    // For now, return a reply object (can be stored in database later)
    const newReply = {
      id: `reply_${Date.now()}`,
      commentId: commentId,
      author: body.author,
      content: body.content,
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json(newReply, { status: 201 });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}

