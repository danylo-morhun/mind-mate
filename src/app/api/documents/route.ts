import { NextRequest, NextResponse } from 'next/server';
import { Document, DocumentType, DocumentCategory, DocumentStatus } from '@/lib/types';

// Тестові дані документів
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Лекція: Вступ до програмування',
    content: 'Основи програмування для студентів першого курсу. Включає базові концепції, синтаксис та практичні приклади.',
    type: 'doc' as DocumentType,
    category: 'lectures' as DocumentCategory,
    author: 'Іванов І.І.',
    collaborators: ['Петров П.П.'],
    version: 1,
    lastModified: new Date('2024-01-15'),
    createdDate: new Date('2024-01-10'),
    tags: ['програмування', 'основи', 'перший курс'],
    status: 'published' as DocumentStatus,
    permissions: {
      canView: ['user1', 'user2'],
      canEdit: ['user1'],
      canComment: ['user1', 'user2'],
      canShare: ['user1'],
      isPublic: true
    },
    metadata: {
      subject: 'Програмування',
      semester: '1',
      academicYear: '2024-2025',
      department: 'Інформаційних технологій',
      course: '1',
      language: 'uk',
      wordCount: 2500,
      pageCount: 8,
      lastAccessed: new Date('2024-01-20'),
      accessCount: 45
    },
    aiGenerated: false
  },
  {
    id: '2',
    title: 'Методичка: Лабораторні роботи з баз даних',
    content: 'Детальні інструкції для виконання лабораторних робіт з предмету "Бази даних". Включає SQL запити та практичні завдання.',
    type: 'doc' as DocumentType,
    category: 'methodics' as DocumentCategory,
    author: 'Сидоров С.С.',
    collaborators: ['Коваленко К.К.'],
    version: 2,
    lastModified: new Date('2024-01-18'),
    createdDate: new Date('2024-01-05'),
    tags: ['бази даних', 'SQL', 'лабораторні'],
    status: 'approved' as DocumentStatus,
    permissions: {
      canView: ['user1', 'user2', 'user3'],
      canEdit: ['user1'],
      canComment: ['user1', 'user2', 'user3'],
      canShare: ['user1'],
      isPublic: true
    },
    metadata: {
      subject: 'Бази даних',
      semester: '3',
      academicYear: '2024-2025',
      department: 'Інформаційних технологій',
      course: '2',
      language: 'uk',
      wordCount: 1800,
      pageCount: 6,
      lastAccessed: new Date('2024-01-19'),
      accessCount: 32
    },
    aiGenerated: false
  },
  {
    id: '3',
    title: 'Звіт: Аналіз успішності студентів',
    content: 'Статистичний аналіз успішності студентів за семестр. Включає графіки, діаграми та рекомендації для покращення.',
    type: 'sheet' as DocumentType,
    category: 'reports' as DocumentCategory,
    author: 'Мельник М.М.',
    collaborators: ['Шевченко Ш.Ш.'],
    version: 1,
    lastModified: new Date('2024-01-20'),
    createdDate: new Date('2024-01-20'),
    tags: ['аналіз', 'статистика', 'успішність'],
    status: 'in_review' as DocumentStatus,
    permissions: {
      canView: ['user1', 'user2'],
      canEdit: ['user1'],
      canComment: ['user1', 'user2'],
      canShare: ['user1'],
      isPublic: false
    },
    metadata: {
      subject: 'Аналітика',
      semester: '1',
      academicYear: '2024-2025',
      department: 'Управління',
      course: '1',
      language: 'uk',
      wordCount: 1200,
      pageCount: 4,
      lastAccessed: new Date('2024-01-20'),
      accessCount: 8
    },
    aiGenerated: true
  },
  {
    id: '4',
    title: 'Презентація: Нові технології в освіті',
    content: 'Огляд сучасних технологій та їх застосування в освітньому процесі. Включає приклади та кейси.',
    type: 'slide' as DocumentType,
    category: 'presentations' as DocumentCategory,
    author: 'Коваль К.К.',
    collaborators: [],
    version: 1,
    lastModified: new Date('2024-01-17'),
    createdDate: new Date('2024-01-15'),
    tags: ['технології', 'освіта', 'інновації'],
    status: 'published' as DocumentStatus,
    permissions: {
      canView: ['user1', 'user2', 'user3', 'user4'],
      canEdit: ['user1'],
      canComment: ['user1', 'user2', 'user3'],
      canShare: ['user1'],
      isPublic: true
    },
    metadata: {
      subject: 'Інформаційні технології',
      semester: '2',
      academicYear: '2024-2025',
      department: 'Інформаційних технологій',
      course: '3',
      language: 'uk',
      wordCount: 800,
      pageCount: 12,
      lastAccessed: new Date('2024-01-18'),
      accessCount: 67
    },
    aiGenerated: false
  },
  {
    id: '5',
    title: 'План: Розвиток кафедри на 2024 рік',
    content: 'Стратегічний план розвитку кафедри інформаційних технологій на 2024 рік. Включає цілі, завдання та очікувані результати.',
    type: 'doc' as DocumentType,
    category: 'plans' as DocumentCategory,
    author: 'Захаренко З.З.',
    collaborators: ['Іваненко І.І.', 'Петренко П.П.'],
    version: 3,
    lastModified: new Date('2024-01-19'),
    createdDate: new Date('2024-01-01'),
    tags: ['план', 'стратегія', 'розвиток'],
    status: 'draft' as DocumentStatus,
    permissions: {
      canView: ['user1', 'user2'],
      canEdit: ['user1', 'user2'],
      canComment: ['user1', 'user2', 'user3'],
      canShare: ['user1'],
      isPublic: false
    },
    metadata: {
      subject: 'Управління',
      semester: '1',
      academicYear: '2024-2025',
      department: 'Інформаційних технологій',
      course: '1',
      language: 'uk',
      wordCount: 3200,
      pageCount: 10,
      lastAccessed: new Date('2024-01-19'),
      accessCount: 15
    },
    aiGenerated: false
  }
];

export async function GET() {
  try {
    // Імітуємо затримку завантаження
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    mockDocuments.push(newDocument);

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
