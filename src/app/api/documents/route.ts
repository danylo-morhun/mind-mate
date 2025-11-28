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
    
    // Map frontend type values to database type values
    const typeMapping: Record<string, 'doc' | 'sheet' | 'slide' | 'pdf' | 'drawing' | 'form'> = {
      'document': 'doc',
      'lecture': 'doc',
      'spreadsheet': 'sheet',
      'other': 'doc',
      // Also handle if already in correct format
      'doc': 'doc',
      'sheet': 'sheet',
      'slide': 'slide', // Keep for backward compatibility with existing data
      'pdf': 'pdf',
      'drawing': 'drawing',
      'form': 'form'
    };
    
    // Map frontend category values to database category values
    const categoryMapping: Record<string, 'lectures' | 'methodics' | 'reports' | 'presentations' | 'plans' | 'assignments' | 'syllabi' | 'other'> = {
      'Навчальні матеріали': 'lectures',
      'Методичні вказівки': 'methodics',
      'Лабораторні роботи': 'assignments',
      'Курсові роботи': 'assignments',
      'Дипломні роботи': 'assignments',
      'Наукові статті': 'reports',
      'Звіти': 'reports',
      'Інше': 'other',
      // Also handle if already in correct format
      'lectures': 'lectures',
      'methodics': 'methodics',
      'reports': 'reports',
      'presentations': 'presentations',
      'plans': 'plans',
      'assignments': 'assignments',
      'syllabi': 'syllabi',
      'other': 'other'
    };
    
    // Get mapped values or use defaults
    const dbType = typeMapping[body.type] || 'doc';
    const dbCategory = categoryMapping[body.category] || (body.category && categoryMapping[body.category] ? body.category : 'other');
    
    // Prepare document data for database
    const documentData = {
      title: body.title,
      content: body.content || '',
      type: dbType,
      category: dbCategory,
      author: body.author || userId,
      collaborators: body.collaborators || [],
      version: 1,
      tags: body.tags || [],
      status: (body.status || 'draft') as const,
      permissions: {
        canView: [userId],
        canEdit: [userId],
        canComment: [userId],
        canShare: [userId],
        isPublic: body.visibility === 'public' || false
      },
      metadata: {
        subject: body.metadata?.subject || body.description || 'Загальний',
        semester: body.metadata?.semester || '1',
        academicYear: body.metadata?.academicYear || '2024-2025',
        department: body.metadata?.department || 'Загальний',
        course: body.metadata?.course || '1',
        language: body.metadata?.language || 'uk',
        wordCount: body.content?.length || 0,
        pageCount: Math.ceil((body.content?.length || 0) / 300),
        lastAccessed: new Date().toISOString(),
        accessCount: body.metadata?.accessCount || 0,
        favoriteCount: body.metadata?.favoriteCount || 0
      },
      ai_generated: !!(body.aiGenerated || body.ai_generated),
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
        { 
          error: 'Failed to create document',
          details: error.message,
          code: error.code
        },
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
