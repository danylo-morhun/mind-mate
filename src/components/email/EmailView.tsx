'use client';

import React, { useState, useEffect } from 'react';
import { 
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
import EmailQuickActions from './EmailQuickActions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface EmailViewProps {
  email: Email | null;
  onEmailUpdate: (emailId: string, updates: Partial<Email>) => void;
  labels: any[];
  onLabelUpdate: () => void;
}

export default function EmailView({ email, onEmailUpdate, labels, onLabelUpdate }: EmailViewProps) {
  const { emailTemplates } = useEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullEmail, setFullEmail] = useState<Email | null>(null);
  
  const [replyType, setReplyType] = useState<string>('academic');
  const [replyTone, setReplyTone] = useState<string>('professional');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [replyLanguage, setReplyLanguage] = useState<string>('uk');
  const [isAIReplyCollapsed, setIsAIReplyCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-reply-collapsed');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleAIReplyCollapsed = () => {
    const newState = !isAIReplyCollapsed;
    setIsAIReplyCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-reply-collapsed', JSON.stringify(newState));
    }
  };

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

  const determineCategory = (gmailEmail: any): Email['category'] => {
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
        return category as Email['category'];
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

  const determinePriority = (gmailEmail: any): Email['priority'] => {
    const labelIds = gmailEmail.labelIds || [];
    const labelNames = gmailEmail.labelNames || [];
    
    const priorityLabel = labelNames.find((name: string) => name.startsWith('Priority_'));
    if (priorityLabel) {
      const priority = priorityLabel.replace('Priority_', '').toLowerCase();
      if (['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return priority as Email['priority'];
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

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (templateId) {
      setReplyText('');
    } else {
      setReplyText('');
    }
  };

  const handleGenerateReply = async () => {
    if (!fullEmail) return;
    
    setIsGeneratingReply(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailContent: fullEmail.body || fullEmail.snippet,
          emailSubject: fullEmail.subject,
          emailFrom: fullEmail.from,
          replyType,
          templateId: selectedTemplate || undefined,
          customInstructions: customInstructions || undefined,
          tone: replyTone,
          language: replyLanguage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReplyText(data.reply);
        
        const generationTime = (Date.now() - startTime) / 1000;
        
        try {
          await fetch('/api/analytics/ai-reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              emailId: fullEmail.id,
              emailSubject: fullEmail.subject,
              replyType,
              tone: replyTone,
              language: replyLanguage,
              templateId: selectedTemplate || null,
              customInstructions: customInstructions || null,
              generationTime,
              success: true,
              modelUsed: data.modelUsed || 'gemini-2.5-flash',
              replyLength: data.reply?.length || 0,
            }),
          });
        } catch (analyticsError) {
          console.error('Failed to save AI analytics:', analyticsError);
        }
        
      } else {
        console.error('Помилка генерації AI відповіді');
        setReplyText('');
        setSendStatus({ type: 'error', message: 'Не вдалося згенерувати відповідь. Спробуйте ще раз.' });
        
        const generationTime = (Date.now() - startTime) / 1000;
        
        try {
          await fetch('/api/analytics/ai-reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              emailId: fullEmail.id,
              emailSubject: fullEmail.subject,
              replyType,
              tone: replyTone,
              language: replyLanguage,
              templateId: selectedTemplate || null,
              customInstructions: customInstructions || null,
              generationTime,
              success: false,
              modelUsed: 'error',
              replyLength: 0,
            }),
          });
        } catch (analyticsError) {
          console.error('Failed to save AI analytics error:', analyticsError);
        }
      }
    } catch (error) {
      console.error('Помилка генерації відповіді:', error);
      setReplyText('');
      setSendStatus({ type: 'error', message: 'Помилка генерації відповіді. Спробуйте ще раз.' });
      
      const generationTime = (Date.now() - startTime) / 1000;
      
      try {
        await fetch('/api/analytics/ai-reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailId: fullEmail.id,
            emailSubject: fullEmail.subject,
            replyType,
            tone: replyTone,
            language: replyLanguage,
            templateId: selectedTemplate || null,
            customInstructions: customInstructions || null,
            generationTime,
            success: false,
            modelUsed: 'error',
            replyLength: 0,
          }),
        });
      } catch (analyticsError) {
        console.error('Failed to save AI analytics error:', analyticsError);
      }
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !fullEmail) return;
    
    setIsSending(true);
    setSendStatus({ type: null, message: '' });
    
    try {
      const response = await fetch(`/api/gmail/emails/${fullEmail.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replyText: replyText.trim(),
          subject: fullEmail.subject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка відправки відповіді');
      }

      setSendStatus({ 
        type: 'success', 
        message: 'Відповідь успішно відправлена!' 
      });

      setReplyText('');
      setSelectedTemplate('');
      
      if (!fullEmail.isRead) {
        onEmailUpdate(fullEmail.id, { isRead: true });
      }

      setTimeout(() => {
        setSendStatus({ type: null, message: '' });
      }, 3000);

    } catch (error: any) {
      console.error('Помилка відправки відповіді:', error);
      setSendStatus({ 
        type: 'error', 
        message: error.message || 'Не вдалося відправити відповідь. Спробуйте ще раз.' 
      });
    } finally {
      setIsSending(false);
    }
  };


  const handleArchive = async () => {
    if (!fullEmail) return;
    
    setIsProcessing(true);
    try {
      const isInInbox = fullEmail.labels?.includes('INBOX') || fullEmail.category === 'inbox';
      const response = await fetch(`/api/gmail/emails/${fullEmail.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isInInbox ? 'archive' : 'unarchive',
        }),
      });

      if (response.ok) {
        const updatedLabels = isInInbox
          ? (fullEmail.labels || []).filter(id => id !== 'INBOX')
          : [...(fullEmail.labels || []), 'INBOX'];
        
        onEmailUpdate(fullEmail.id, { 
          labels: updatedLabels,
          category: isInInbox ? 'other' : 'inbox' as Email['category']
        });
      }
    } catch (error) {
      console.error('Failed to archive email:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStar = async () => {
    if (!fullEmail) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/gmail/emails/${fullEmail.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: fullEmail.isStarred ? 'unstar' : 'star',
        }),
      });

      if (response.ok) {
        onEmailUpdate(fullEmail.id, { isStarred: !fullEmail.isStarred });
      }
    } catch (error) {
      console.error('Failed to star email:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!fullEmail) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/gmail/emails/${fullEmail.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
        }),
      });

      if (response.ok) {
        window.location.href = '/email';
      }
    } catch (error) {
      console.error('Failed to delete email:', error);
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
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
      <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white email-header" style={{ zIndex: 2 }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-1.5 truncate">
              {displayEmail.subject}
            </h1>
            
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span className="truncate max-w-xs">Від: {displayEmail.from}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(displayEmail.date)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={handleStar}
              disabled={isProcessing}
              className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-md transition-colors disabled:opacity-50"
              title={displayEmail.isStarred ? "Прибрати зі зірок" : "Додати до зірок"}
            >
              {displayEmail.isStarred ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </button>
            
            <button 
              onClick={handleArchive}
              disabled={isProcessing}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50" 
              title="Архівувати"
            >
              <Archive className="h-4 w-4" />
            </button>
            
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50" 
              title="Видалити"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <EmailQuickActions
          email={displayEmail}
          onEmailUpdate={onEmailUpdate}
          labels={labels}
          onLabelUpdate={onLabelUpdate}
        />
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar min-h-0 bg-white email-body" style={{ fontSize: '15px', lineHeight: '1.6' }}>
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

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 email-form" style={{ zIndex: 2 }}>
        <div className="email-reply-form">
          <div className="email-reply-section">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">AI Відповідь:</label>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Готовий
                </div>
              </div>
              <button
                onClick={toggleAIReplyCollapsed}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors text-xs"
                title={isAIReplyCollapsed ? "Розгорнути AI відповідь" : "Згорнути AI відповідь"}
              >
                {isAIReplyCollapsed ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
            {isAIReplyCollapsed ? (
              <div className="ai-reply-collapsible collapsed flex items-center justify-center py-2">
                <button
                  onClick={toggleAIReplyCollapsed}
                  className="text-xs px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🎯 AI Відповідь
                </button>
              </div>
            ) : (
              <div className="ai-reply-collapsible expanded space-y-2">
                <div className="grid grid-cols-4 gap-2 my-1 mx-1">
                  <select
                    value={replyType}
                    onChange={(e) => setReplyType(e.target.value)}
                    className="text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    title="Тип відповіді"
                  >
                    <option value="academic">🎓 Академічна</option>
                    <option value="administrative">📋 Адміністративна</option>
                    <option value="student_support">👨‍🎓 Підтримка</option>
                    <option value="colleague">🤝 Колегам</option>
                    <option value="urgent">⚡ Термінова</option>
                    <option value="confirmation">✅ Підтвердження</option>
                  </select>
                  
                  <select
                    value={replyTone}
                    onChange={(e) => setReplyTone(e.target.value)}
                    className="text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    title="Тон відповіді"
                  >
                    <option value="professional">🎯 Професійний</option>
                    <option value="supportive">💪 Підтримуючий</option>
                    <option value="encouraging">🌟 Заохочувальний</option>
                    <option value="instructive">📚 Інструктивний</option>
                    <option value="collaborative">🤝 Колаборативний</option>
                  </select>
                  
                  <select
                    value={replyLanguage}
                    onChange={(e) => setReplyLanguage(e.target.value)}
                    className="text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    title="Мова"
                  >
                    <option value="uk">🇺🇦 UK</option>
                    <option value="en">🇺🇸 EN</option>
                    <option value="de">🇩🇪 DE</option>
                  </select>
                  
                  <button
                    onClick={handleGenerateReply}
                    disabled={isGeneratingReply}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isGeneratingReply ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Генерація...
                      </span>
                    ) : (
                      '🎯 Генерувати'
                    )}
                  </button>
                </div>
                
                <div className="flex items-center gap-2 my-1 mx-1">
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="flex-1 mb-1 text-xs px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    title="Шаблон (опціонально)"
                  >
                    <option value="">🎯 Без шаблону</option>
                    {emailTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        📋 {template.name}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Спеціальні вимоги..."
                    className="flex-1 text-xs mb-1 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    title="Кастомні інструкції"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="email-reply-section flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Текст відповіді:</label>
              <div className="flex items-center gap-2">
                {isGeneratingReply && (
                  <div className="flex items-center text-xs text-blue-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                    AI генерує...
                  </div>
                )}
                {sendStatus.type === 'success' && (
                  <div className="flex items-center text-xs text-green-600">
                    <span>✓ {sendStatus.message}</span>
                  </div>
                )}
                {sendStatus.type === 'error' && (
                  <div className="flex items-center text-xs text-red-600">
                    <span>✗ {sendStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={isGeneratingReply ? "AI генерує відповідь..." : "Текст відповіді з'явиться тут після генерації AI або введіть вручну..."}
              className="email-reply-textarea"
              disabled={isGeneratingReply}
            />
            {replyText && (
              <div className="mt-1 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <div>
                    {replyText.length} символів | {replyText.split(/\s+/).filter(word => word.length > 0).length} слів
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">🤖 AI</span>
                    {selectedTemplate && (
                      <span className="text-blue-600 text-xs">
                        📋 {emailTemplates.find(t => t.id === selectedTemplate)?.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="email-reply-buttons">
            <div className="email-controls justify-end">
              <button 
                onClick={() => setReplyText('')}
                disabled={!replyText.trim()}
                className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Очистити
              </button>
              
              <button
                onClick={() => setReplyText(replyText + '\n\n---\nMind Mate AI Assistant')}
                className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                + Підпис
              </button>
              
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || isSending}
                className="text-xs px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Відправка...
                  </>
                ) : (
                  'Надіслати'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Видалити лист"
        message="Ви впевнені, що хочете видалити цей лист? Цю дію неможливо скасувати."
        confirmText="Видалити"
        cancelText="Скасувати"
        confirmVariant="default"
      />
    </div>
  );
}
