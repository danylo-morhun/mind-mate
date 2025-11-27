import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/lib/types';
import { getCurrentUserId, transformDocument } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    
    // Fetch documents for the current user
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_date', { ascending: false });

    if (error) {
      console.error('Error fetching documents from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    // Transform database documents to application format
    const transformedDocuments = (documents || []).map(transformDocument);
    
    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const supabase = createServerClient();
    
    // Prepare document data for database
    const documentData = {
      title: body.title,
      content: body.content,
      type: body.type,
      category: body.category,
      author: body.author || userId,
      collaborators: body.collaborators || [],
      version: 1,
      tags: body.tags || [],
      status: 'draft' as const,
      permissions: {
        canView: [userId],
        canEdit: [userId],
        canComment: [userId],
        canShare: [userId],
        isPublic: false
      },
      metadata: {
        subject: body.metadata?.subject || 'Загальний',
        semester: body.metadata?.semester || '1',
        academicYear: body.metadata?.academicYear || '2024-2025',
        department: body.metadata?.department || 'Загальний',
        course: body.metadata?.course || '1',
        language: body.metadata?.language || 'uk',
        wordCount: body.content?.length || 0,
        pageCount: Math.ceil((body.content?.length || 0) / 300),
        lastAccessed: new Date().toISOString(),
        accessCount: 0
      },
      ai_generated: body.aiGenerated || false,
      template_id: body.templateId || null,
      user_id: userId
    };

    // Insert document into Supabase
    const { data: newDocument, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating document in Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      );
    }

    // Transform and return
    const transformedDocument = transformDocument(newDocument);
    return NextResponse.json(transformedDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
