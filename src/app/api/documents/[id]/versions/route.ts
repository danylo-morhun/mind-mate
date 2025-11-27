import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId, transformDocument } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';

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
    
    // For now, return empty array (version history can be stored in database later)
    // The document itself has a version field that tracks current version
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
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
    
    const document = transformDocument(dbDocument);
    
    if (!body.author || !body.changes || !Array.isArray(body.changes)) {
      return NextResponse.json(
        { error: 'Author and changes array are required' },
        { status: 400 }
      );
    }
    
    // For now, return a version object (can be stored in database later)
    const newVersion = {
      documentId: id,
      version: document.version,
      timestamp: new Date().toISOString(),
      author: body.author,
      changes: body.changes,
      content: body.content || document.content,
      title: body.title || document.title
    };
    
    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}

