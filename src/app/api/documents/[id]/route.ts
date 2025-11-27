import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/lib/types';
import { 
  getMockDocumentById, 
  updateMockDocument, 
  deleteMockDocument 
} from '@/lib/mock-documents';
import { addMockVersion } from '@/lib/mock-versions';

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

    const documentWithDates = {
      ...document,
      lastModified: new Date(document.lastModified),
      createdDate: new Date(document.createdDate),
      metadata: document.metadata ? {
        ...document.metadata,
        lastAccessed: new Date(document.metadata.lastAccessed)
      } : undefined
    };

    return NextResponse.json(documentWithDates);
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
    
    const existingDocument = getMockDocumentById(id);
    
    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    const hasContentChanges = body.content !== undefined && body.content !== existingDocument.content;
    const hasTitleChanges = body.title !== undefined && body.title !== existingDocument.title;
    const shouldCreateVersion = hasContentChanges || hasTitleChanges;
    const newVersion = body.version !== undefined ? body.version : existingDocument.version + 1;
    
    const updates: Partial<Document> = {
      ...body,
      lastModified: new Date(),
      version: newVersion,
      metadata: {
        ...existingDocument.metadata,
        ...body.metadata,
        lastAccessed: new Date(),
        accessCount: (existingDocument.metadata?.accessCount || 0) + 1
      }
    };

    const updatedDocument = updateMockDocument(id, updates);

    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    if (shouldCreateVersion) {
      const changes: string[] = [];
      if (hasTitleChanges) changes.push(`Оновлено заголовок: "${existingDocument.title}" → "${updatedDocument.title}"`);
      if (hasContentChanges) {
        const oldLength = existingDocument.content.length;
        const newLength = updatedDocument.content.length;
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
        author: body.author || updatedDocument.author,
        changes: changes.length > 0 ? changes : ['Оновлено документ'],
        content: updatedDocument.content,
        title: updatedDocument.title
      });
    }

    return NextResponse.json(updatedDocument);
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
    
    const deletedDocument = getMockDocumentById(id);
    
    if (!deletedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const success = deleteMockDocument(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

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

