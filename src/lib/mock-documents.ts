import { Document, DocumentType, DocumentCategory, DocumentStatus } from '@/lib/types';

let mockDocuments: Document[] = [
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

export function getMockDocuments(): Document[] {
  return mockDocuments;
}

export function setMockDocuments(documents: Document[]): void {
  mockDocuments = documents;
}

export function addMockDocument(document: Document): void {
  mockDocuments.push(document);
}

export function updateMockDocument(id: string, updates: Partial<Document>): Document | null {
  const index = mockDocuments.findIndex(doc => doc.id === id);
  if (index === -1) return null;
  
  mockDocuments[index] = { ...mockDocuments[index], ...updates };
  return mockDocuments[index];
}

export function deleteMockDocument(id: string): boolean {
  const index = mockDocuments.findIndex(doc => doc.id === id);
  if (index === -1) return false;
  
  mockDocuments.splice(index, 1);
  return true;
}

export function getMockDocumentById(id: string): Document | undefined {
  return mockDocuments.find(doc => doc.id === id);
}

