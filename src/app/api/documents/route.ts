import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/lib/types';
import { getMockDocuments, addMockDocument } from '@/lib/mock-documents';

export async function GET() {
  try {
    // Імітуємо затримку завантаження
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Отримуємо документи з спільного сховища
    const mockDocuments = getMockDocuments();
    
    // Конвертуємо рядки дат в об'єкти Date
    const documentsWithDates = mockDocuments.map(doc => ({
      ...doc,
      lastModified: new Date(doc.lastModified),
      createdDate: new Date(doc.createdDate),
      metadata: doc.metadata ? {
        ...doc.metadata,
        lastAccessed: new Date(doc.metadata.lastAccessed)
      } : undefined
    }));
    
    return NextResponse.json(documentsWithDates);
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
    const body = await request.json();
    
    // Створюємо новий документ
    const newDocument: Document = {
      id: Date.now().toString(),
      title: body.title,
      content: body.content,
      type: body.type,
      category: body.category,
      author: body.author || 'Поточний користувач',
      collaborators: body.collaborators || [],
      version: 1,
      lastModified: new Date(),
      createdDate: new Date(),
      tags: body.tags || [],
      status: 'draft',
      permissions: {
        canView: [body.author || 'user1'],
        canEdit: [body.author || 'user1'],
        canComment: [body.author || 'user1'],
        canShare: [body.author || 'user1'],
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
        lastAccessed: new Date(),
        accessCount: 0
      },
      aiGenerated: body.aiGenerated || false
    };

    // Додаємо до списку (в реальному додатку тут буде збереження в базу даних)
    addMockDocument(newDocument);

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
