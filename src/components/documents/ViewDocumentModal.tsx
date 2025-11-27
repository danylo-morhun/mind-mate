'use client';

import React, { useState, useCallback } from 'react';
import { X, FileText, Download, Printer, Share2, Eye, Users, Lock, Globe, Tag, Calendar, User, File, BookOpen, FileSpreadsheet, Presentation } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  template: string;
  content: string;
  tags: string[];
  collaborators: string[];
  visibility: 'private' | 'shared' | 'public';
  accessLevel: 'view' | 'comment' | 'edit';
  status: string;
  version: string;
  lastModified: Date;
  createdDate: Date;
  owner: string;
  metadata?: {
    lastAccessed: Date;
    accessCount: number;
    favoriteCount: number;
    subject?: string;
    semester?: string;
  };
}

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (document: Document) => void;
  onShare?: (document: Document) => void;
  document: Document | null;
}

const documentTypeIcons = {
  document: FileText,
  lecture: BookOpen,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  other: File
};

const documentTypeNames = {
  document: 'Документ',
  lecture: 'Лекція',
  spreadsheet: 'Таблиця',
  presentation: 'Презентація',
  other: 'Інше'
};

const exportFormats = [
  { id: 'docx', name: 'Word', description: 'Microsoft Word документ', icon: FileText, color: 'text-blue-600' },
  { id: 'txt', name: 'Текст', description: 'Простий текстовий файл', icon: FileText, color: 'text-gray-600' },
  { id: 'html', name: 'HTML', description: 'Веб-сторінка', icon: FileText, color: 'text-orange-600' }
];

export default function ViewDocumentModal({ isOpen, onClose, onEdit, onShare, document: doc }: ViewDocumentModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'sharing'>('content');
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !doc) return null;

  const DocumentTypeIcon = documentTypeIcons[doc.type as keyof typeof documentTypeIcons] || FileText;
  const documentTypeName = documentTypeNames[doc.type as keyof typeof documentTypeNames] || 'Документ';

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return 'Невказано';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Невказано';
      return dateObj.toLocaleDateString('uk-UA', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Невказано';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return Lock;
      case 'shared': return Users;
      case 'public': return Globe;
      default: return Eye;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'private': return 'Приватний';
      case 'shared': return 'Поширений';
      case 'public': return 'Публічний';
      default: return 'Невідомо';
    }
  };

  const getAccessLevelText = (level: string) => {
    switch (level) {
      case 'view': return 'Перегляд';
      case 'comment': return 'Коментарі';
      case 'edit': return 'Редагування';
      default: return 'Невідомо';
    }
  };

  const handleExport = async (format: string) => {
    if (!doc) return;
    
    setIsExporting(true);
    try {
      const response = await fetch(`/api/documents/${doc.id}/download?format=${format}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to export document' }));
        throw new Error(errorData.error || errorData.details || 'Failed to export document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Отримуємо ім'я файлу з заголовків
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = '';
      
      if (contentDisposition) {
        // Спочатку намагаємося отримати з filename* (UTF-8)
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        if (filenameStarMatch && filenameStarMatch[1]) {
          try {
            filename = decodeURIComponent(filenameStarMatch[1]);
          } catch (e) {
            console.warn('Failed to decode filename*:', e);
          }
        }
        
        // Якщо не вдалося, намагаємося з filename
        if (!filename) {
          const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/^["']|["']$/g, '');
          }
        }
      }
      
      // Якщо не вдалося отримати з заголовків, генеруємо
      if (!filename || !filename.includes('.')) {
        const sanitizeFilename = (title: string): string => {
          if (!title) return 'document';
          return title
            .replace(/[^a-z0-9а-яіїєґ\s]/gi, '')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toLowerCase() || 'document';
        };
        filename = `${sanitizeFilename(doc.title)}.${format}`;
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Помилка при експорті документа: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // TODO: Інтеграція з системою друку
      await new Promise(resolve => setTimeout(resolve, 1000)); // Імітація друку
      
      // Створюємо нове вікно для друку
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${doc.title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .metadata { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .content { line-height: 1.6; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <h1>${doc.title}</h1>
              <div class="metadata">
                <p><strong>Тип:</strong> ${documentTypeName}</p>
                <p><strong>Категорія:</strong> ${doc.category}</p>
                <p><strong>Версія:</strong> ${doc.version}</p>
                <p><strong>Створено:</strong> ${formatDate(doc.createdDate)}</p>
                <p><strong>Оновлено:</strong> ${formatDate(doc.lastModified)}</p>
              </div>
              <div class="content">
                ${doc.content.replace(/\n/g, '<br>')}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      
      alert('Документ надіслано на друк');
    } catch (error) {
      console.error('Print error:', error);
      alert('Помилка при друку документа');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = () => {
    if (!doc) return;
    if (onShare) {
      onShare(doc);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTypeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{doc.title}</h2>
              <p className="text-sm text-gray-500">
                {documentTypeName} • Версія {doc.version} • Остання зміна {formatDate(doc.lastModified)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(doc)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Редагувати
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                {isPrinting ? 'Друкуємо...' : 'Друкувати'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Поділитися
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Експорт:</span>
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => handleExport(format.id)}
                    disabled={isExporting}
                    className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isExporting 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-100'
                    }`}
                    title={format.description}
                  >
                    <Icon className={`w-4 h-4 ${format.color}`} />
                    {format.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'content', name: 'Контент', icon: FileText },
              { id: 'metadata', name: 'Метадані', icon: Tag },
              { id: 'sharing', name: 'Доступ', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="prose max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{doc.title}</h1>
                
                {doc.description && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Опис</h2>
                    <p className="text-blue-800">{doc.description}</p>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Контент документа</h2>
                  <div className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                    {doc.content}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Детальна інформація</h3>
              
              {/* Helper function to check if value is meaningful */}
              {(() => {
                const hasValue = (value: any): boolean => {
                  if (value === null || value === undefined) return false;
                  if (typeof value === 'string') {
                    const trimmed = value.trim();
                    return trimmed !== '' && 
                           trimmed !== 'Невказано' && 
                           trimmed !== 'Загальний' && 
                           trimmed !== 'Не вказано' &&
                           trimmed !== 'current_user';
                  }
                  if (typeof value === 'number') return value > 0;
                  return true;
                };

                const metadataFields: Array<{key: string, label: string, value: any, format?: (v: any) => string}> = [];
                
                // Основна інформація
                if (documentTypeName) {
                  metadataFields.push({ key: 'type', label: 'Тип документа', value: documentTypeName });
                }
                if (hasValue(doc.category)) {
                  metadataFields.push({ key: 'category', label: 'Категорія', value: doc.category });
                }
                if (hasValue(doc.template) && doc.template !== 'blank') {
                  metadataFields.push({ key: 'template', label: 'Шаблон', value: doc.template });
                }
                if (hasValue(doc.status) && doc.status !== 'draft') {
                  metadataFields.push({ key: 'status', label: 'Статус', value: doc.status });
                }
                if (doc.version && doc.version > 1) {
                  metadataFields.push({ key: 'version', label: 'Версія', value: doc.version });
                }

                // Дати
                if (document.createdDate) {
                  metadataFields.push({ 
                    key: 'created', 
                    label: 'Створено', 
                    value: document.createdDate,
                    format: formatDate 
                  });
                }
                if (doc.lastModified) {
                  metadataFields.push({ 
                    key: 'modified', 
                    label: 'Оновлено', 
                    value: doc.lastModified,
                    format: formatDate 
                  });
                }
                if (doc.metadata?.lastAccessed) {
                  metadataFields.push({ 
                    key: 'lastAccessed', 
                    label: 'Останній доступ', 
                    value: doc.metadata.lastAccessed,
                    format: formatDate 
                  });
                }

                // Додаткові метадані
                if (doc.metadata) {
                  if (hasValue(doc.metadata.subject)) {
                    metadataFields.push({ key: 'subject', label: 'Предмет', value: doc.metadata.subject });
                  }
                  if (hasValue(doc.metadata.semester)) {
                    metadataFields.push({ key: 'semester', label: 'Семестр', value: doc.metadata.semester });
                  }
                  if (hasValue(doc.metadata.academicYear)) {
                    metadataFields.push({ key: 'academicYear', label: 'Навчальний рік', value: doc.metadata.academicYear });
                  }
                  if (hasValue(doc.metadata.department)) {
                    metadataFields.push({ key: 'department', label: 'Кафедра', value: doc.metadata.department });
                  }
                  if (hasValue(doc.metadata.course)) {
                    metadataFields.push({ key: 'course', label: 'Курс', value: doc.metadata.course });
                  }
                  if (hasValue(doc.metadata.language) && doc.metadata.language !== 'uk') {
                    metadataFields.push({ key: 'language', label: 'Мова', value: doc.metadata.language });
                  }
                  if (doc.metadata.wordCount && doc.metadata.wordCount > 0) {
                    metadataFields.push({ key: 'wordCount', label: 'Кількість слів', value: doc.metadata.wordCount });
                  }
                  if (doc.metadata.pageCount && doc.metadata.pageCount > 0) {
                    metadataFields.push({ key: 'pageCount', label: 'Кількість сторінок', value: doc.metadata.pageCount });
                  }
                  if (doc.metadata.accessCount && doc.metadata.accessCount > 0) {
                    metadataFields.push({ key: 'accessCount', label: 'Кількість переглядів', value: doc.metadata.accessCount });
                  }
                }

                // Автор
                if (hasValue(doc.author)) {
                  metadataFields.push({ key: 'author', label: 'Автор', value: doc.author });
                }

                // Власник (тільки якщо не стандартне значення)
                if (hasValue(doc.owner)) {
                  metadataFields.push({ key: 'owner', label: 'Власник', value: doc.owner });
                }

                // Групуємо поля по категоріях
                const basicFields = metadataFields.filter(f => 
                  ['type', 'category', 'template', 'status', 'version', 'author'].includes(f.key)
                );
                const dateFields = metadataFields.filter(f => 
                  ['created', 'modified', 'lastAccessed'].includes(f.key)
                );
                const additionalFields = metadataFields.filter(f => 
                  !['type', 'category', 'template', 'status', 'version', 'author', 'created', 'modified', 'lastAccessed', 'owner'].includes(f.key)
                );
                const ownerField = metadataFields.find(f => f.key === 'owner');

                return (
                  <>
                    {basicFields.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Основна інформація</h4>
                        <div className="space-y-3">
                          {basicFields.map(field => (
                            <div key={field.key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">{field.label}:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {field.format ? field.format(field.value) : String(field.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(dateFields.length > 0 || ownerField) && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Дати та власник</h4>
                        <div className="space-y-3">
                          {dateFields.map(field => (
                            <div key={field.key} className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">{field.label}:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {field.format ? field.format(field.value) : String(field.value)}
                              </span>
                            </div>
                          ))}
                          {ownerField && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">{ownerField.label}:</span>
                              <span className="text-sm font-medium text-gray-900">{ownerField.value}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {doc.tags.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Теги</h4>
                        <div className="flex flex-wrap gap-2">
                          {doc.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {additionalFields.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Додаткова інформація</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {additionalFields.map(field => (
                            <div key={field.key} className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-sm text-gray-500">{field.label}</span>
                              <p className="font-medium text-gray-900">
                                {field.format ? field.format(field.value) : String(field.value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {metadataFields.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>Метадані відсутні</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Налаштування доступу</h3>
              
              {/* Поточні налаштування */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Видимість */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Видимість документа</h4>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const Icon = getVisibilityIcon(doc.visibility);
                      return <Icon className="w-5 h-5 text-gray-600" />;
                    })()}
                    <div>
                      <div className="font-medium text-gray-900">{getVisibilityText(doc.visibility)}</div>
                      <div className="text-sm text-gray-500">
                        {doc.visibility === 'private' && 'Тільки ви можете бачити'}
                        {doc.visibility === 'shared' && 'Доступ для обранних користувачів'}
                        {doc.visibility === 'public' && 'Доступ для всіх'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Рівень доступу */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Рівень доступу для співпрацівників</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{getAccessLevelText(doc.accessLevel)}</div>
                    <div className="text-sm text-gray-500">
                      {doc.accessLevel === 'view' && 'Тільки перегляд документа'}
                      {doc.accessLevel === 'comment' && 'Можна коментувати'}
                      {doc.accessLevel === 'edit' && 'Повний доступ до редагування'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Співпрацівники */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Співпрацівники</h4>
                {doc.collaborators.length > 0 ? (
                  <div className="space-y-2">
                    {doc.collaborators.map((collaborator, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">{collaborator}</span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {getAccessLevelText(doc.accessLevel)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Поки що немає співпрацівників</p>
                  </div>
                )}
              </div>

              {/* Статистика доступу */}
              {doc.metadata && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Статистика доступу</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{doc.metadata.accessCount || 0}</div>
                      <div className="text-sm text-blue-600">Переглядів</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{doc.collaborators.length}</div>
                      <div className="text-sm text-green-600">Співпрацівників</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{doc.tags.length}</div>
                      <div className="text-sm text-purple-600">Тегів</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
