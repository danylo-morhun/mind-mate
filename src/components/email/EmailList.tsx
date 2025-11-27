'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Search, Star } from 'lucide-react';
import { Email, EmailCategory, EmailPriority } from '@/lib/types';
import { useEmails } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import EmailListMenu from './EmailListMenu';

interface EmailListProps {
  onEmailSelect: (email: Email) => void;
  selectedEmailId?: string;
}

export default function EmailList({ onEmailSelect, selectedEmailId }: EmailListProps) {
  const { emails, setEmails } = useEmails();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [labels, setLabels] = useState<any[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadEmails();
    loadLabels();
  }, [debouncedSearchQuery, selectedLabel]);

  useEffect(() => {
    loadLabels();
  }, []);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        maxResults: '50',
      });

      if (debouncedSearchQuery) {
        params.append('q', debouncedSearchQuery);
      }

      if (selectedLabel !== 'all') {
        params.append('labelIds', selectedLabel);
      }

      const response = await fetch(`/api/gmail/emails?${params}`);
      if (response.ok) {
        const data = await response.json();
        
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
      }
    } catch (error) {
      console.error('Помилка завантаження листів:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const refreshLabels = () => {
    loadLabels();
  };

  const determineCategory = (gmailEmail: any): EmailCategory => {
    const labelIds = gmailEmail.labelIds || [];
    const labelNames = gmailEmail.labelNames || [];
    
    if (labelIds.includes('INBOX') || labelNames.includes('INBOX')) return 'inbox';
    if (labelIds.includes('SENT') || labelNames.includes('SENT')) return 'sent';
    if (labelIds.includes('DRAFT') || labelNames.includes('DRAFT')) return 'draft';
    if (labelIds.includes('SPAM') || labelNames.includes('SPAM')) return 'spam';
    if (labelIds.includes('TRASH') || labelNames.includes('TRASH')) return 'trash';
    
    const categoryLabel = labelNames.find((name: string) => name.startsWith('Category_'));
    if (categoryLabel) {
      const category = categoryLabel.replace('Category_', '');
      if (['education', 'administrative', 'student_support', 'meetings', 'documents', 'other'].includes(category)) {
        return category as EmailCategory;
      }
    }
    
    const from = gmailEmail.from?.toLowerCase() || '';
    const subject = gmailEmail.subject?.toLowerCase() || '';
    
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

  const determinePriority = (gmailEmail: any): EmailPriority => {
    const labelIds = gmailEmail.labelIds || [];
    const labelNames = gmailEmail.labelNames || [];
    
    const priorityLabel = labelNames.find((name: string) => name.startsWith('Priority_'));
    if (priorityLabel) {
      const priority = priorityLabel.replace('Priority_', '').toLowerCase();
      if (['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return priority as EmailPriority;
      }
    }
    
    if (labelIds.includes('IMPORTANT') || labelNames.includes('IMPORTANT')) return 'high';
    
    const from = gmailEmail.from?.toLowerCase() || '';
    const subject = gmailEmail.subject?.toLowerCase() || '';
    
    if (from.includes('admin') || from.includes('ректор') || from.includes('декан')) {
      return 'high';
    }
    
    if (subject.includes('лекція') || subject.includes('методичка')) {
      return 'medium';
    }
    
    return 'low';
  };

  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      if (selectedCategory !== 'all' && email.category !== selectedCategory) {
        return false;
      }
      if (selectedPriority !== 'all' && email.priority !== selectedPriority) {
        return false;
      }
      return true;
    });
  }, [emails, selectedCategory, selectedPriority]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('uk-UA', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
    }
  };

  const getPriorityColor = (priority: EmailPriority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getCategoryColor = (category: EmailCategory) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'documents': return 'bg-green-100 text-green-800';
      case 'meetings': return 'bg-purple-100 text-purple-800';
      case 'inbox': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

    return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 email-list-container">
      {/* Заголовок та пошук - фіксований */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white email-list-header">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Листи</h2>
          <div className="flex items-center gap-2">
            <EmailListMenu
              labels={labels}
              onLabelUpdate={async () => {
                await loadLabels();
                // Додатково оновлюємо листи, щоб нові мітки з'явилися
                await loadEmails();
              }}
            />
          </div>
        </div>
        
        {/* Пошук */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Пошук листів..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Фільтри */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Всі мітки</option>
            {labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name} ({label.messagesTotal})
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Всі категорії</option>
            <option value="inbox">Вхідні</option>
            <option value="education">Навчання</option>
            <option value="documents">Документи</option>
            <option value="meetings">Зустрічі</option>
            <option value="other">Інше</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Всі пріоритети</option>
            <option value="high">Високий</option>
            <option value="medium">Середній</option>
            <option value="low">Низький</option>
          </select>
        </div>
      </div>

      {/* Список листів - скролиться окремо */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-white email-list-content">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Mail className="h-12 w-12 mb-2" />
            <p>Листів не знайдено</p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => onEmailSelect(email)}
              className={cn(
                'p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors min-h-[120px] flex flex-col justify-between email-item',
                getPriorityColor(email.priority),
                selectedEmailId === email.id && 'bg-blue-50 border-l-blue-600'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="font-medium text-gray-900 email-sender">
                    {email.from ? email.from.split('<')[0].trim() : 'Невідомий'}
                  </span>
                  {email.isStarred && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
                <span className="text-sm text-gray-500 flex-shrink-0">
                  {formatDate(email.date)}
                </span>
              </div>
              
              <h3 className={cn(
                'font-medium mb-1 email-subject',
                !email.isRead ? 'text-gray-900' : 'text-gray-700'
              )}>
                {email.subject}
              </h3>
              
              <p className="text-sm text-gray-600 mb-2 email-snippet">
                {email.snippet}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'px-2 py-1 text-xs rounded-full',
                    getCategoryColor(email.category)
                  )}>
                    {email.category}
                  </span>
                  {email.attachments.length > 0 && (
                    <span className="text-xs text-gray-500">
                      📎 {email.attachments.length}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {email.priority === 'high' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  {email.priority === 'medium' && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
