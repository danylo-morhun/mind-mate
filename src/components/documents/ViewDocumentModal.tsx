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
  { id: 'pdf', name: 'PDF', description: 'Портативний формат документа', icon: FileText, color: 'text-red-600' },
  { id: 'docx', name: 'Word', description: 'Microsoft Word документ', icon: FileText, color: 'text-blue-600' },
  { id: 'txt', name: 'Текст', description: 'Простий текстовий файл', icon: FileText, color: 'text-gray-600' },
  { id: 'html', name: 'HTML', description: 'Веб-сторінка', icon: FileText, color: 'text-orange-600' }
];

export default function ViewDocumentModal({ isOpen, onClose, onEdit, document }: ViewDocumentModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'sharing'>('content');
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !document) return null;

  const DocumentTypeIcon = documentTypeIcons[document.type as keyof typeof documentTypeIcons] || FileText;
  const documentTypeName = documentTypeNames[document.type as keyof typeof documentTypeNames] || 'Документ';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('uk-UA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    setIsExporting(true);
    try {
      // TODO: Інтеграція з API експорту
      await new Promise(resolve => setTimeout(resolve, 2000)); // Імітація експорту
      
      // Створюємо заглушку для завантаження
      const blob = new Blob([document.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`Документ експортовано у форматі ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Помилка при експорті документа');
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
              <title>${document.title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .metadata { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .content { line-height: 1.6; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <h1>${document.title}</h1>
              <div class="metadata">
                <p><strong>Тип:</strong> ${documentTypeName}</p>
                <p><strong>Категорія:</strong> ${document.category}</p>
                <p><strong>Версія:</strong> ${document.version}</p>
                <p><strong>Створено:</strong> ${formatDate(document.createdDate)}</p>
                <p><strong>Оновлено:</strong> ${formatDate(document.lastModified)}</p>
              </div>
              <div class="content">
                ${document.content.replace(/\n/g, '<br>')}
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
    // TODO: Відкрити модальне вікно поширення
    alert('Функція поширення буде реалізована в наступному кроці');
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
              <h2 className="text-xl font-semibold text-gray-900">{document.title}</h2>
              <p className="text-sm text-gray-500">
                {documentTypeName} • Версія {document.version} • Остання зміна {formatDate(document.lastModified)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(document)}
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
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{document.title}</h1>
                
                {document.description && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Опис</h2>
                    <p className="text-blue-800">{document.description}</p>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Контент документа</h2>
                  <div className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                    {document.content}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Детальна інформація</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Основна інформація */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Основна інформація</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Тип документа:</span>
                      <span className="text-sm font-medium text-gray-900">{documentTypeName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Категорія:</span>
                      <span className="text-sm font-medium text-gray-900">{document.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Шаблон:</span>
                      <span className="text-sm font-medium text-gray-900">{document.template}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Статус:</span>
                      <span className="text-sm font-medium text-gray-900">{document.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Версія:</span>
                      <span className="text-sm font-medium text-gray-900">{document.version}</span>
                    </div>
                  </div>
                </div>

                {/* Дати та власник */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Дати та власник</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Створено:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(document.createdDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Оновлено:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(document.lastModified)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Власник:</span>
                      <span className="text-sm font-medium text-gray-900">{document.owner}</span>
                    </div>
                    {document.metadata?.lastAccessed && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Останній доступ:</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(document.metadata.lastAccessed)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Теги */}
              {document.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Теги</h4>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
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

              {/* Додаткові метадані */}
              {document.metadata && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Додаткова інформація</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {document.metadata.subject && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-500">Предмет</span>
                        <p className="font-medium text-gray-900">{document.metadata.subject}</p>
                      </div>
                    )}
                    {document.metadata.semester && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-500">Семестр</span>
                        <p className="font-medium text-gray-900">{document.metadata.semester}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-500">Кількість переглядів</span>
                      <p className="font-medium text-gray-900">{document.metadata.accessCount || 0}</p>
                    </div>
                  </div>
                </div>
              )}
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
                      const Icon = getVisibilityIcon(document.visibility);
                      return <Icon className="w-5 h-5 text-gray-600" />;
                    })()}
                    <div>
                      <div className="font-medium text-gray-900">{getVisibilityText(document.visibility)}</div>
                      <div className="text-sm text-gray-500">
                        {document.visibility === 'private' && 'Тільки ви можете бачити'}
                        {document.visibility === 'shared' && 'Доступ для обранних користувачів'}
                        {document.visibility === 'public' && 'Доступ для всіх'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Рівень доступу */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Рівень доступу для співпрацівників</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{getAccessLevelText(document.accessLevel)}</div>
                    <div className="text-sm text-gray-500">
                      {document.accessLevel === 'view' && 'Тільки перегляд документа'}
                      {document.accessLevel === 'comment' && 'Можна коментувати'}
                      {document.accessLevel === 'edit' && 'Повний доступ до редагування'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Співпрацівники */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Співпрацівники</h4>
                {document.collaborators.length > 0 ? (
                  <div className="space-y-2">
                    {document.collaborators.map((collaborator, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">{collaborator}</span>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {getAccessLevelText(document.accessLevel)}
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
              {document.metadata && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Статистика доступу</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{document.metadata.accessCount || 0}</div>
                      <div className="text-sm text-blue-600">Переглядів</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{document.collaborators.length}</div>
                      <div className="text-sm text-green-600">Співпрацівників</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{document.tags.length}</div>
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
