import { NextRequest, NextResponse } from 'next/server';
import { 
  getMockVersionById 
} from '@/lib/mock-versions';
import { getMockDocumentById } from '@/lib/mock-documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id, versionId } = await params;
    
    const document = getMockDocumentById(id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    const version = getMockVersionById(versionId);
    
    if (!version || version.documentId !== id) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(version);
  } catch (error) {
    console.error('Error fetching version:', error);
    return NextResponse.json(
      { error: 'Failed to fetch version' },
      { status: 500 }
    );
  }
}

