export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  timestamp: Date;
  author: string;
  changes: string[];
  content: string;
  title: string;
}

let mockVersions: DocumentVersion[] = [
  {
    id: 'v1',
    documentId: '1',
    version: 1,
    timestamp: new Date('2024-01-10'),
    author: 'Іванов І.І.',
    changes: ['Створено документ', 'Додано базовий контент'],
    content: 'Основи програмування для студентів першого курсу. Включає базові концепції, синтаксис та практичні приклади.',
    title: 'Лекція: Вступ до програмування'
  },
  {
    id: 'v2',
    documentId: '2',
    version: 1,
    timestamp: new Date('2024-01-05'),
    author: 'Сидоров С.С.',
    changes: ['Створено документ'],
    content: 'Детальні інструкції для виконання лабораторних робіт з предмету "Бази даних". Включає SQL запити та практичні завдання.',
    title: 'Методичка: Лабораторні роботи з баз даних'
  },
  {
    id: 'v3',
    documentId: '2',
    version: 2,
    timestamp: new Date('2024-01-18'),
    author: 'Сидоров С.С.',
    changes: ['Оновлено SQL запити', 'Додано нові практичні завдання'],
    content: 'Детальні інструкції для виконання лабораторних робіт з предмету "Бази даних". Включає SQL запити та практичні завдання.',
    title: 'Методичка: Лабораторні роботи з баз даних'
  },
  {
    id: 'v4',
    documentId: '5',
    version: 1,
    timestamp: new Date('2024-01-01'),
    author: 'Захаренко З.З.',
    changes: ['Створено документ'],
    content: 'Стратегічний план розвитку кафедри інформаційних технологій на 2024 рік.',
    title: 'План: Розвиток кафедри на 2024 рік'
  },
  {
    id: 'v5',
    documentId: '5',
    version: 2,
    timestamp: new Date('2024-01-10'),
    author: 'Захаренко З.З.',
    changes: ['Додано цілі та завдання'],
    content: 'Стратегічний план розвитку кафедри інформаційних технологій на 2024 рік. Включає цілі та завдання.',
    title: 'План: Розвиток кафедри на 2024 рік'
  },
  {
    id: 'v6',
    documentId: '5',
    version: 3,
    timestamp: new Date('2024-01-19'),
    author: 'Захаренко З.З.',
    changes: ['Додано очікувані результати', 'Оновлено стратегічні цілі'],
    content: 'Стратегічний план розвитку кафедри інформаційних технологій на 2024 рік. Включає цілі, завдання та очікувані результати.',
    title: 'План: Розвиток кафедри на 2024 рік'
  }
];

export function getMockVersionsByDocumentId(documentId: string): DocumentVersion[] {
  return mockVersions
    .filter(version => version.documentId === documentId)
    .sort((a, b) => b.version - a.version)
    .map(version => ({
      ...version,
      timestamp: new Date(version.timestamp)
    }));
}

export function getMockVersionById(versionId: string): DocumentVersion | undefined {
  const version = mockVersions.find(v => v.id === versionId);
  if (!version) return undefined;
  
  return {
    ...version,
    timestamp: new Date(version.timestamp)
  };
}

export function getMockVersionByDocumentAndVersion(documentId: string, versionNumber: number): DocumentVersion | undefined {
  const version = mockVersions.find(
    v => v.documentId === documentId && v.version === versionNumber
  );
  if (!version) return undefined;
  
  return {
    ...version,
    timestamp: new Date(version.timestamp)
  };
}

export function addMockVersion(version: Omit<DocumentVersion, 'id'>): DocumentVersion {
  const newVersion: DocumentVersion = {
    ...version,
    id: `v${Date.now()}`,
    timestamp: new Date(version.timestamp)
  };
  
  mockVersions.push(newVersion);
  return newVersion;
}

