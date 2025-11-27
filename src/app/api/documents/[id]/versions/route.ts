import { NextRequest, NextResponse } from 'next/server';
import { 
  getMockVersionsByDocumentId,
  addMockVersion 
} from '@/lib/mock-versions';
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
    
    const versions = getMockVersionsByDocumentId(id);
    
    return NextResponse.json(versions);
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
    
    const document = getMockDocumentById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    if (!body.author || !body.changes || !Array.isArray(body.changes)) {
      return NextResponse.json(
        { error: 'Author and changes array are required' },
        { status: 400 }
      );
    }
    
    const newVersion = addMockVersion({
      documentId: id,
      version: document.version,
      timestamp: new Date(),
      author: body.author,
      changes: body.changes,
      content: body.content || document.content,
      title: body.title || document.title
    });
    
    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}

