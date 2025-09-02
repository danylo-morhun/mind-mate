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
  type: 'lecture' | 'methodology' | 'report' | 'presentation';
  author: string;
  collaborators: string[];
  version: number;
  lastModified: Date;
  tags: string[];
  status: 'draft' | 'review' | 'published';
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
