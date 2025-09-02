// API клієнт для комунікації з Google Apps Script

import { Email, EmailTemplate, Document, StudentGrade, AnalyticsData, AIResponse } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || '';

class GoogleAppsScriptAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Gmail API endpoints
  async getEmails(
    maxResults: number = 50,
    query?: string,
    category?: string
  ): Promise<Email[]> {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      ...(query && { query }),
      ...(category && { category }),
    });

    return this.request<Email[]>(`/gmail/emails?${params}`);
  }

  async getEmailById(emailId: string): Promise<Email> {
    return this.request<Email>(`/gmail/emails/${emailId}`);
  }

  async categorizeEmail(emailId: string, category: string): Promise<AIResponse> {
    return this.request<AIResponse>(`/gmail/emails/${emailId}/categorize`, {
      method: 'POST',
      body: JSON.stringify({ category }),
    });
  }

  async setEmailPriority(emailId: string, priority: string): Promise<AIResponse> {
    return this.request<AIResponse>(`/gmail/emails/${emailId}/priority`, {
      method: 'POST',
      body: JSON.stringify({ priority }),
    });
  }

  async applyEmailLabels(emailId: string, labels: string[]): Promise<AIResponse> {
    return this.request<AIResponse>(`/gmail/emails/${emailId}/labels`, {
      method: 'POST',
      body: JSON.stringify({ labels }),
    });
  }

  async sendEmailReply(
    emailId: string,
    replyText: string,
    templateId?: string
  ): Promise<AIResponse> {
    return this.request<AIResponse>(`/gmail/emails/${emailId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyText, templateId }),
    });
  }

  // Email Templates API
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return this.request<EmailTemplate[]>('/gmail/templates');
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    return this.request<EmailTemplate>('/gmail/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateEmailTemplate(
    templateId: string,
    updates: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    return this.request<EmailTemplate>(`/gmail/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEmailTemplate(templateId: string): Promise<AIResponse> {
    return this.request<AIResponse>(`/gmail/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  // Documents API
  async getDocuments(): Promise<Document[]> {
    return this.request<Document[]>('/docs/documents');
  }

  async createDocument(document: Omit<Document, 'id' | 'version' | 'lastModified'>): Promise<Document> {
    return this.request<Document>('/docs/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  }

  async updateDocument(
    documentId: string,
    updates: Partial<Document>
  ): Promise<Document> {
    return this.request<Document>(`/docs/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async generateDocumentContent(
    prompt: string,
    documentType: string
  ): Promise<AIResponse> {
    return this.request<AIResponse>('/docs/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, documentType }),
    });
  }

  // Grading API
  async getStudentGrades(assignmentId?: string): Promise<StudentGrade[]> {
    const params = assignmentId ? `?assignmentId=${assignmentId}` : '';
    return this.request<StudentGrade[]>(`/grading/grades${params}`);
  }

  async calculateGrade(
    assignmentId: string,
    criteria: Array<{ criteriaId: string; points: number }>
  ): Promise<StudentGrade> {
    return this.request<StudentGrade>('/grading/calculate', {
      method: 'POST',
      body: JSON.stringify({ assignmentId, criteria }),
    });
  }

  async analyzePerformance(studentId: string): Promise<AIResponse> {
    return this.request<AIResponse>(`/grading/analyze/${studentId}`);
  }

  // Analytics API
  async getAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return this.request<AnalyticsData>(`/analytics?${params}`);
  }

  async getEmailAnalytics(): Promise<{
    totalEmails: number;
    emailsByCategory: Record<string, number>;
    emailsByPriority: Record<string, number>;
    averageResponseTime: number;
  }> {
    return this.request('/analytics/emails');
  }

  async getProductivityScore(): Promise<{ score: number; breakdown: any }> {
    return this.request('/analytics/productivity');
  }

  // AI Assistant API
  async getAIResponse(
    prompt: string,
    context?: any
  ): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/assist', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  }

  async generateEmailReply(
    emailContent: string,
    tone?: string,
    length?: 'short' | 'medium' | 'long'
  ): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/generate-reply', {
      method: 'POST',
      body: JSON.stringify({ emailContent, tone, length }),
    });
  }

  async summarizeEmails(emails: string[]): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ emails }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

// Створюємо екземпляр API клієнта
export const googleAppsScriptAPI = new GoogleAppsScriptAPI(API_BASE_URL);

// Експортуємо тип для використання в компонентах
export type { GoogleAppsScriptAPI };
