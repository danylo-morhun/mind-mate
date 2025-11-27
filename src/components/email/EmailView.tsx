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
import EmailQuickActions from './EmailQuickActions';

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
  
  // AI відповідь state
  const [replyType, setReplyType] = useState<string>('academic');
  const [replyTone, setReplyTone] = useState<string>('professional');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [replyLanguage, setReplyLanguage] = useState<string>('uk');
  const [isAIReplyCollapsed, setIsAIReplyCollapsed] = useState(() => {
    // Завантажуємо збережений стан з localStorage - за замовчуванням згорнуто
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai-reply-collapsed');
      return saved ? JSON.parse(saved) : true; // За замовчуванням згорнуто
    }
    return true; // За замовчуванням згорнуто
  });

  // Функція для зміни стану згортання з збереженням
  const toggleAIReplyCollapsed = () => {
    const newState = !isAIReplyCollapsed;
    setIsAIReplyCollapsed(newState);
    // Зберігаємо в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-reply-collapsed', JSON.stringify(newState));
    }
  };

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
    
    // Шаблон змінюється, але відповідь НЕ генерується автоматично
    // Відповідь генерується тільки по натисканню кнопки "AI Відповідь"
    if (templateId) {
      // Очищаємо попередню відповідь при зміні шаблону
      setReplyText('');
    } else {
      // Якщо вибрано "Без шаблону", очищаємо відповідь
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
        
        // Зберігаємо статистику AI відповіді
        const generationTime = (Date.now() - startTime) / 1000; // в секундах
        
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
          // Не блокуємо основну функціональність, якщо статистика не збереглася
        }
        
      } else {
        console.error('Помилка генерації AI відповіді');
        // Fallback до mock відповіді
        const mockReply = `Дякую за ваше повідомлення про "${fullEmail.subject}".\n\nЯ обов'язково розгляну всі зазначені питання та надам детальну відповідь найближчим часом.\n\nЗ повагою,\nMind Mate AI`;
        setReplyText(mockReply);
        
        // Зберігаємо статистику про невдалу спробу
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
      // Fallback до mock відповіді
      const mockReply = `Дякую за ваше повідомлення про "${fullEmail.subject}".\n\nЯ обов'язково розгляну всі зазначені питання та надам детальну відповідь найближчим часом.\n\nЗ повагою,\nMind Mate AI`;
      setReplyText(mockReply);
      
      // Зберігаємо статистику про помилку
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
      {/* Заголовок листа - фіксований, компактний */}
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
              onClick={() => onEmailUpdate(displayEmail.id, { isStarred: !displayEmail.isStarred })}
              className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-md transition-colors"
              title={displayEmail.isStarred ? "Прибрати зі зірок" : "Додати до зірок"}
            >
              {displayEmail.isStarred ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </button>
            
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="Архівувати">
              <Archive className="h-4 w-4" />
            </button>
            
            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Видалити">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Швидкі дії для листа - компактні */}
        <EmailQuickActions
          email={displayEmail}
          onEmailUpdate={onEmailUpdate}
          labels={labels}
          onLabelUpdate={onLabelUpdate}
        />
      </div>

      {/* Текст листа - скролиться окремо, більший простір */}
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
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 email-form" style={{ zIndex: 2 }}>
        <div className="email-reply-form">
          {/* AI Відповідь - компактний заголовок */}
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
              // Згорнутий стан - компактна кнопка
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
                {/* Компактний ряд з усіма налаштуваннями */}
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
                
                {/* Шаблон та кастомні інструкції в одному рядку */}
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
          
          {/* Текст відповіді - більший розмір */}
          <div className="email-reply-section flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Текст відповіді:</label>
              {isGeneratingReply && (
                <div className="flex items-center text-xs text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                  AI генерує...
                </div>
              )}
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
          
          {/* Кнопки дій - компактні */}
          <div className="email-reply-buttons">
            <div className="email-controls justify-between">
              <div className="email-controls">
                <button 
                  onClick={() => setReplyText('')}
                  disabled={!replyText.trim()}
                  className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Очистити
                </button>
                
                <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                  <Reply className="h-3 w-3 mr-1" />
                  Відповісти
                </button>
                
                <button className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center">
                  <Forward className="h-3 w-3 mr-1" />
                  Переслати
                </button>
              </div>
              
              <div className="email-controls">
                <button
                  onClick={() => setReplyText(replyText + '\n\n---\nMind Mate AI Assistant')}
                  className="text-xs px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  + Підпис
                </button>
                
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="text-xs px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Надіслати
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
