'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Plus, Settings, BarChart3 } from 'lucide-react';
import EmailList from '@/components/email/EmailList';
import EmailView from '@/components/email/EmailView';
import { Email } from '@/lib/types';
import { useEmails, useEmailTemplates, useUser } from '@/contexts/AppContext';

export default function EmailPage() {
  const { emails, setEmails, updateEmail } = useEmails();
  const { setEmailTemplates } = useEmailTemplates();
  const { setUser } = useUser();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [labels, setLabels] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    important: 0,
    urgent: 0,
  });

  // Завантаження початкових даних
  useEffect(() => {
    loadInitialData();
    loadLabels();
  }, []);

  const loadLabels = async () => {
    try {
      const response = await fetch('/api/gmail/labels');
      if (response.ok) {
        const data = await response.json();
        setLabels(data.labels);
      }
    } catch (error) {
      console.error('Помилка завантаження міток:', error);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Завантажуємо шаблони листів
      const templatesResponse = await fetch('/api/email-templates');
      if (templatesResponse.ok) {
        const templates = await templatesResponse.json();
        setEmailTemplates(templates);
      }

      // Завантажуємо листи з Gmail
      const emailsResponse = await fetch('/api/gmail/emails?maxResults=50');
      if (emailsResponse.ok) {
        const data = await emailsResponse.json();
        
        // Трансформуємо дані з Gmail API в наш формат
        const transformedEmails: Email[] = data.emails.map((gmailEmail: any) => ({
          id: gmailEmail.id,
          threadId: gmailEmail.threadId,
          from: gmailEmail.from,
          to: gmailEmail.to,
          subject: gmailEmail.subject || 'Без теми',
          snippet: gmailEmail.snippet || '',
          body: gmailEmail.body || '',
          date: gmailEmail.date ? new Date(gmailEmail.date) : new Date(),
          isRead: !gmailEmail.labelIds?.includes('UNREAD'),
          isStarred: gmailEmail.labelIds?.includes('STARRED'),
          isImportant: gmailEmail.labelIds?.includes('IMPORTANT'),
          category: determineCategory(gmailEmail),
          priority: determinePriority(gmailEmail),
          labels: gmailEmail.labelIds || [],
          attachments: gmailEmail.attachments || [],
          messageId: gmailEmail.messageId,
          references: gmailEmail.references,
          inReplyTo: gmailEmail.inReplyTo,
        }));

        setEmails(transformedEmails);
        calculateStats(transformedEmails);
      }
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Визначення категорії листа
  const determineCategory = (gmailEmail: any): Email['category'] => {
    const from = gmailEmail.from?.toLowerCase() || '';
    const subject = gmailEmail.subject?.toLowerCase() || '';
    
    if (gmailEmail.labelIds?.includes('INBOX')) return 'inbox';
    if (gmailEmail.labelIds?.includes('SENT')) return 'sent';
    if (gmailEmail.labelIds?.includes('DRAFT')) return 'draft';
    if (gmailEmail.labelIds?.includes('SPAM')) return 'spam';
    if (gmailEmail.labelIds?.includes('TRASH')) return 'trash';
    
    // Автоматична категорізація за вмістом
    if (subject.includes('лекція') || subject.includes('методичка') || subject.includes('навчальн')) {
      return 'education';
    }
    if (subject.includes('заявка') || subject.includes('документ') || subject.includes('форма')) {
      return 'documents';
    }
    if (subject.includes('зустріч') || subject.includes('конференція') || subject.includes('подія')) {
      return 'meetings';
    }
    
    return 'other';
  };

  // Визначення пріоритету листа
  const determinePriority = (gmailEmail: any): Email['priority'] => {
    if (gmailEmail.labelIds?.includes('IMPORTANT')) return 'high';
    
    const from = gmailEmail.from?.toLowerCase() || '';
    const subject = gmailEmail.subject?.toLowerCase() || '';
    
    // Високий пріоритет для важливих відправників
    if (from.includes('admin') || from.includes('ректор') || from.includes('декан')) {
      return 'high';
    }
    
    // Середній пріоритет для навчальних матеріалів
    if (subject.includes('лекція') || subject.includes('методичка')) {
      return 'medium';
    }
    
    return 'low';
  };

  const calculateStats = (emailList: Email[]) => {
    setStats({
      total: emailList.length,
      unread: emailList.filter(email => !email.isRead).length,
      important: emailList.filter(email => email.isImportant).length,
      urgent: emailList.filter(email => email.priority === 'high').length,
    });
  };

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleEmailUpdate = (emailId: string, updates: Partial<Email>) => {
    const updatedEmails = emails.map(email => 
      email.id === emailId ? { ...email, ...updates } : email
    );
    setEmails(updatedEmails);
    calculateStats(updatedEmails);
    
    // Оновлюємо вибраний лист
    if (selectedEmail?.id === emailId) {
      setSelectedEmail({ ...selectedEmail, ...updates });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Ліва панель зі списком листів */}
      <div className="w-1/3 min-w-80">
        <EmailList
          onEmailSelect={handleEmailSelect}
          selectedEmailId={selectedEmail?.id}
        />
      </div>

      {/* Права панель з переглядом листа */}
      <div className="flex-1">
        <EmailView
          email={selectedEmail}
          onEmailUpdate={handleEmailUpdate}
          labels={labels}
          onLabelUpdate={loadLabels}
        />
      </div>
    </div>
  );
}
