// Основні типи для AI-помічника Google Workspace

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'staff' | 'admin';
  department: string;
  avatar?: string;
}

export interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: Date;
  category: EmailCategory;
  priority: EmailPriority;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  labels: string[];
  attachments: Attachment[];
  messageId?: string;
  references?: string;
  inReplyTo?: string;
}

export type EmailCategory = 
  | 'inbox'
  | 'sent'
  | 'draft'
  | 'spam'
  | 'trash'
  | 'education'
  | 'documents'
  | 'meetings'
  | 'other';

export type EmailPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Attachment {
  id: string;
  name: string;
  filename?: string;
  size: number;
  mimeType: string;
  url?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
  isActive: boolean;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  category: DocumentCategory;
  author: string;
  collaborators: string[];
  version: number;
  lastModified: Date;
  createdDate: Date;
  tags: string[];
  status: DocumentStatus;
  permissions: DocumentPermissions;
  metadata: DocumentMetadata;
  aiGenerated: boolean;
  templateId?: string;
  googleDocId?: string;
  googleDocUrl?: string;
}

export type DocumentType = 
  | 'doc'      // Google Docs
  | 'sheet'    // Google Sheets
  | 'slide'    // Google Slides
  | 'pdf'      // PDF
  | 'drawing'  // Google Drawings
  | 'form';    // Google Forms

export type DocumentCategory = 
  | 'lectures'     // Лекції
  | 'methodics'    // Методички
  | 'reports'      // Звіти
  | 'presentations' // Презентації
  | 'plans'        // Плани
  | 'assignments'  // Завдання
  | 'syllabi'      // Програми
  | 'other';       // Інше

export type DocumentStatus = 
  | 'draft'        // Чернетка
  | 'in_review'    // На перегляді
  | 'approved'     // Затверджено
  | 'published'    // Опубліковано
  | 'archived'     // Архівовано
  | 'deprecated';  // Застаріло

export interface DocumentPermissions {
  canView: string[];      // ID користувачів, які можуть переглядати
  canEdit: string[];      // ID користувачів, які можуть редагувати
  canComment: string[];   // ID користувачів, які можуть коментувати
  canShare: string[];     // ID користувачів, які можуть ділитися
  isPublic: boolean;      // Чи публічний документ
}

export interface DocumentMetadata {
  subject: string;        // Предмет/дисципліна
  semester: string;       // Семестр
  academicYear: string;   // Навчальний рік
  department: string;     // Кафедра
  course: string;         // Курс
  language: string;       // Мова документа
  wordCount: number;      // Кількість слів
  pageCount: number;      // Кількість сторінок
  lastAccessed: Date;     // Останній доступ
  accessCount: number;    // Кількість переглядів
}

export interface GradingCriteria {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number;
  category: string;
}

export interface StudentGrade {
  id: string;
  studentId: string;
  assignmentId: string;
  criteria: {
    criteriaId: string;
    points: number;
    feedback: string;
  }[];
  totalPoints: number;
  percentage: number;
  grade: string;
  submittedAt: Date;
  gradedAt: Date;
}

export interface AnalyticsData {
  emailsProcessed: number;
  emailsByCategory: Record<EmailCategory, number>;
  emailsByPriority: Record<EmailPriority, number>;
  responseTime: number;
  documentsCreated: number;
  gradesProcessed: number;
  productivityScore: number;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  suggestions?: string[];
}

export interface GoogleWorkspaceConfig {
  projectId: string;
  region: string;
  gmailApiEnabled: boolean;
  docsApiEnabled: boolean;
  sheetsApiEnabled: boolean;
  calendarApiEnabled: boolean;
}
