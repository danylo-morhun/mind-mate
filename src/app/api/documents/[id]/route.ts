import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/lib/types';
import { getCurrentUserId, transformDocument } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';
import { addMockVersion } from '@/lib/mock-versions';

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
    
    // Fetch document from Supabase
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update last accessed time
    await supabase
      .from('documents')
      .update({
        metadata: {
          ...document.metadata,
          lastAccessed: new Date().toISOString(),
          accessCount: ((document.metadata as any)?.accessCount || 0) + 1
        }
      })
      .eq('id', id);

    const transformedDocument = transformDocument(document);
    return NextResponse.json(transformedDocument);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    
    // Fetch existing document
    const { data: existingDocument, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const existingDoc = transformDocument(existingDocument);
    const hasContentChanges = body.content !== undefined && body.content !== existingDoc.content;
    const hasTitleChanges = body.title !== undefined && body.title !== existingDoc.title;
    const shouldCreateVersion = hasContentChanges || hasTitleChanges;
    const newVersion = body.version !== undefined ? body.version : existingDoc.version + 1;
    
    // Prepare updates
    const updates: any = {
      last_modified: new Date().toISOString(),
      version: newVersion,
      metadata: {
        ...existingDoc.metadata,
        ...body.metadata,
        lastAccessed: new Date().toISOString(),
        accessCount: (existingDoc.metadata?.accessCount || 0) + 1
      }
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;
    if (body.type !== undefined) updates.type = body.type;
    if (body.category !== undefined) updates.category = body.category;
    if (body.status !== undefined) updates.status = body.status;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.collaborators !== undefined) updates.collaborators = body.collaborators;
    if (body.permissions !== undefined) updates.permissions = body.permissions;

    // Update document in Supabase
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updatedDocument) {
      console.error('Error updating document in Supabase:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    const transformedDoc = transformDocument(updatedDocument);

    // Create version history if needed (still using mock for now, can be migrated to Supabase later)
    if (shouldCreateVersion) {
      const changes: string[] = [];
      if (hasTitleChanges) changes.push(`Оновлено заголовок: "${existingDoc.title}" → "${transformedDoc.title}"`);
      if (hasContentChanges) {
        const oldLength = existingDoc.content.length;
        const newLength = transformedDoc.content.length;
        if (newLength > oldLength) {
          changes.push(`Додано ${newLength - oldLength} символів до контенту`);
        } else if (newLength < oldLength) {
          changes.push(`Видалено ${oldLength - newLength} символів з контенту`);
        } else {
          changes.push('Оновлено контент');
        }
      }
      if (body.changes && Array.isArray(body.changes)) {
        changes.push(...body.changes);
      }
      
      addMockVersion({
        documentId: id,
        version: newVersion,
        timestamp: new Date(),
        author: body.author || transformedDoc.author,
        changes: changes.length > 0 ? changes : ['Оновлено документ'],
        content: transformedDoc.content,
        title: transformedDoc.title
      });
    }

    return NextResponse.json(transformedDoc);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Fetch document before deletion
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete document from Supabase
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting document from Supabase:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    const deletedDocument = transformDocument(document);
    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      deletedDocument
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}

