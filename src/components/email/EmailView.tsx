'use client';

import React, { useState, useEffect } from 'react';
import { 
  Reply, 
  Forward, 
  Archive, 
  Trash2, 
  Star, 
  StarOff, 
  Paperclip, 
  Download,
  Calendar,
  User,
  Clock,
  Mail
} from 'lucide-react';
import { Email, EmailTemplate } from '@/lib/types';
import { useEmailTemplates } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface EmailViewProps {
  email: Email | null;
  onEmailUpdate: (emailId: string, updates: Partial<Email>) => void;
}

export default function EmailView({ email, onEmailUpdate }: EmailViewProps) {
  const { emailTemplates } = useEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullEmail, setFullEmail] = useState<Email | null>(null);

  // Завантаження повного листа при виборі
  useEffect(() => {
    if (email?.id) {
      loadFullEmail(email.id);
    }
  }, [email?.id]);

  const loadFullEmail = async (emailId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/gmail/emails/${emailId}`);
      if (response.ok) {
        const gmailEmail = await response.json();
        
        // Трансформуємо дані з Gmail API в наш формат
        const transformedEmail: Email = {
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
        };
        
        setFullEmail(transformedEmail);
      }
    } catch (error) {
      console.error('Помилка завантаження листа:', error);
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

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setReplyText(template.body);
    }
  };

  const handleGenerateReply = async () => {
    setIsGeneratingReply(true);
    try {
      // Тут буде інтеграція з AI API для генерації відповіді
      const aiReply = await generateAIReply(email!);
      setReplyText(aiReply);
    } catch (error) {
      console.error('Помилка генерації відповіді:', error);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const generateAIReply = async (email: Email): Promise<string> => {
    // Імітація AI генерації (замініть на реальний API виклик)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const templates = [
      `Дякую за ваш лист від ${email.date.toLocaleDateString('uk-UA')}.`,
      `Ваше повідомлення отримано та розглядається.`,
      `Буду радий обговорити деталі особисто.`,
      `Дякую за інформацію, яка буде використана в роботі.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      // Тут буде відправка відповіді через Gmail API
      console.log('Відправка відповіді:', replyText);
      
      // Очищаємо форму
      setReplyText('');
      setSelectedTemplate('');
      
      // Позначаємо лист як прочитаний
      if (fullEmail && !fullEmail.isRead) {
        onEmailUpdate(fullEmail.id, { isRead: true });
      }
    } catch (error) {
      console.error('Помилка відправки відповіді:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: Email['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: Email['category']) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'documents': return 'bg-green-100 text-green-800';
      case 'meetings': return 'bg-purple-100 text-purple-800';
      case 'inbox': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center text-gray-500 max-w-md">
          <div className="bg-white rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-sm">
            <Mail className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Виберіть лист для перегляду</h3>
          <p className="text-gray-500 leading-relaxed">Оберіть лист зі списку зліва для детального перегляду та роботи з ним</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="bg-white rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Завантаження листа...</h3>
          <p className="text-gray-500">Отримуємо детальну інформацію</p>
        </div>
      </div>
    );
  }

  const displayEmail = fullEmail || email;

  return (
    <div className="flex-1 flex flex-col bg-white h-full email-container">
      {/* Заголовок листа - фіксований */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-white email-header">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {displayEmail.subject}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Від: {displayEmail.from}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{formatDate(displayEmail.date)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEmailUpdate(displayEmail.id, { isStarred: !displayEmail.isStarred })}
              className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-md transition-colors"
            >
              {displayEmail.isStarred ? (
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-5 w-5" />
              )}
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Archive className="h-5 w-5" />
            </button>
            
            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Мітки та категорії */}
        <div className="flex items-center space-x-2">
          <span className={cn(
            'px-3 py-1 text-sm rounded-full',
            getPriorityColor(displayEmail.priority)
          )}>
            {displayEmail.priority} пріоритет
          </span>
          
          <span className={cn(
            'px-3 py-1 text-sm rounded-full',
            getCategoryColor(displayEmail.category)
          )}>
            {displayEmail.category}
          </span>
          
          {displayEmail.labels.map((label, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Текст листа - скролиться окремо */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar min-h-0 bg-white email-body">
        <div className="prose max-w-none">
          {displayEmail.body ? (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: displayEmail.body.replace(/\n/g, '<br>') 
              }} 
            />
          ) : (
            <p className="text-gray-500">{displayEmail.snippet}</p>
          )}
        </div>
        
        {/* Вкладення */}
        {displayEmail.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Вкладення</h3>
            <div className="space-y-2">
              {displayEmail.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Paperclip className="h-5 w-5 text-gray-400" />
                                       <div>
                     <p className="font-medium text-gray-900">{attachment.filename || attachment.name}</p>
                     <p className="text-sm text-gray-500">
                       {attachment.mimeType} • {(attachment.size / 1024).toFixed(1)} KB
                     </p>
                   </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Форма відповіді - фіксована висота без скролу */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 email-form">
        <div className="email-reply-form">
          <h3 className="text-lg font-medium text-gray-900">Відповісти</h3>
          
          {/* Шаблони */}
          <div className="email-reply-section">
            <label className="text-sm font-medium text-gray-700">Шаблон:</label>
            <div className="flex items-center gap-4">
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Виберіть шаблон</option>
                {emailTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleGenerateReply}
                disabled={isGeneratingReply}
                className="email-control-button email-control-button-primary disabled:opacity-50 whitespace-nowrap"
              >
                {isGeneratingReply ? 'Генерація...' : 'AI Відповідь'}
              </button>
            </div>
          </div>
          
          {/* Текст відповіді */}
          <div className="email-reply-section flex-1">
            <label className="text-sm font-medium text-gray-700">Текст відповіді:</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Введіть текст відповіді..."
              rows={4}
              className="email-reply-textarea"
            />
          </div>
          
          {/* Кнопки дій */}
          <div className="email-reply-buttons">
            <div className="email-controls justify-between">
              <div className="email-controls">
                <button className="email-control-button email-control-button-primary">
                  <Reply className="h-4 w-4 mr-2 inline" />
                  Відповісти
                </button>
                
                <button className="email-control-button email-control-button-secondary">
                  <Forward className="h-4 w-4 mr-2 inline" />
                  Переслати
                </button>
              </div>
              
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="email-control-button email-control-button-success disabled:opacity-50"
              >
                Надіслати
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
