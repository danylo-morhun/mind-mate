'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  FolderOpen,
  BookOpen,
  FileSpreadsheet,
  Presentation,
  Archive,
  Star,
  Clock,
  User,
  Tag,
  Loader2
} from 'lucide-react';
import { useDocuments } from '@/contexts/DocumentsContext';
import DocumentList from '@/components/documents/DocumentList';
import CreateDocumentModal from '@/components/documents/CreateDocumentModal';
import EditDocumentModal from '@/components/documents/EditDocumentModal';
import ViewDocumentModal from '@/components/documents/ViewDocumentModal';
import ShareDocumentModal from '@/components/documents/ShareDocumentModal';

export default function DocumentsPage() {
  const { 
    state, 
    loadDocuments, 
    setFilters, 
    setViewMode: setContextViewMode, 
    getFilteredDocuments,
    selectDocument,
    createDocument,
    updateDocument,
    deleteDocument
  } = useDocuments();
  
  const [viewMode, setLocalViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [starredDocuments, setStarredDocuments] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDocumentForEdit, setSelectedDocumentForEdit] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocumentForView, setSelectedDocumentForView] = useState<any>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDocumentForShare, setSelectedDocumentForShare] = useState<any>(null);
  const [isExportingToGoogleDocs, setIsExportingToGoogleDocs] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Всі категорії', icon: FolderOpen, color: 'text-gray-600' },
    { id: 'lectures', name: 'Лекції', icon: BookOpen, color: 'text-blue-600' },
    { id: 'methodics', name: 'Методички', icon: FileText, color: 'text-green-600' },
    { id: 'reports', name: 'Звіти', icon: FileSpreadsheet, color: 'text-purple-600' },
    { id: 'presentations', name: 'Презентації', icon: Presentation, color: 'text-orange-600' },
    { id: 'plans', name: 'Плани', icon: Clock, color: 'text-red-600' }
  ];

  const documentTypes = [
    { id: 'all', name: 'Всі типи', color: 'text-gray-600' },
    { id: 'doc', name: 'Google Docs', color: 'text-blue-600' },
    { id: 'sheet', name: 'Google Sheets', color: 'text-green-600' },
    { id: 'slide', name: 'Google Slides', color: 'text-orange-600' },
    { id: 'pdf', name: 'PDF', color: 'text-red-600' }
  ];

  // Завантаження документів при монтуванні
  useEffect(() => {
    loadDocuments();
  }, []); // Завантажуємо тільки один раз

  // Оновлення фільтрів при зміні пошуку
  useEffect(() => {
    setFilters({ search: searchQuery });
  }, [searchQuery]); // Тільки при зміні пошуку

  // Оновлення фільтрів при зміні категорії
  useEffect(() => {
    setFilters({ category: selectedCategory });
  }, [selectedCategory]); // Тільки при зміні категорії

  // Оновлення фільтрів при зміні типу
  useEffect(() => {
    setFilters({ type: selectedType });
  }, [selectedType]); // Тільки при зміні типу

  // Оновлення режиму перегляду в контексті
  useEffect(() => {
    setContextViewMode(viewMode);
  }, [viewMode]); // Тільки при зміні локального режиму

  // Обробники подій
  const handleDocumentSelect = (document: any) => {
    setSelectedDocumentForView(document);
    setIsViewModalOpen(true);
  };

  const handleDocumentEdit = (document: any) => {
    setSelectedDocumentForEdit(document);
    setIsEditModalOpen(true);
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (confirm('Ви впевнені, що хочете видалити цей документ?')) {
      setIsDeleting(documentId);
      try {
        await deleteDocument(documentId);
        alert('Документ успішно видалено!');
      } catch (error) {
        alert('Помилка при видаленні документа');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleCreateDocument = async (documentData: any) => {
    setIsCreating(true);
    try {
      await createDocument(documentData);
      alert('Документ успішно створено!');
    } catch (error) {
      alert('Помилка при створенні документа');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditDocument = async (updatedDocument: any) => {
    setIsUpdating(updatedDocument.id);
    try {
      await updateDocument(updatedDocument.id, updatedDocument);
      alert('Документ успішно оновлено!');
      setIsEditModalOpen(false);
      setSelectedDocumentForEdit(null);
    } catch (error) {
      alert('Помилка при оновленні документа');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleViewToEdit = (document: any) => {
    setIsViewModalOpen(false);
    setSelectedDocumentForView(null);
    setSelectedDocumentForEdit(document);
    setIsEditModalOpen(true);
  };

  const handleDocumentShare = (document: any) => {
    setSelectedDocumentForShare(document);
    setIsShareModalOpen(true);
  };

  const handleExportToGoogleDocs = async (doc: any) => {
    setIsExportingToGoogleDocs(doc.id);
    try {
      const response = await fetch(`/api/documents/${doc.id}/export-to-google-docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to export to Google Docs' }));
        throw new Error(errorData.error || 'Failed to export to Google Docs');
      }

      const result = await response.json();
      
      if (result.url) {
        // Відкриваємо Google Docs в новій вкладці
        window.open(result.url, '_blank');
        alert('Документ успішно експортовано до Google Docs!');
        
        // Оновлюємо список документів, щоб показати посилання
        loadDocuments();
      } else {
        throw new Error('No URL returned from export');
      }
    } catch (error) {
      console.error('Error exporting to Google Docs:', error);
      alert(`Помилка при експорті до Google Docs: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsExportingToGoogleDocs(null);
    }
  };

  const handleDocumentDownload = async (doc: any, format: string = 'txt') => {
    setIsDownloading(`${doc.id}-${format}`);
    try {
      const response = await fetch(`/api/documents/${doc.id}/download?format=${format}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to download document' }));
        const errorMessage = errorData.details || errorData.error || `Failed to download document (${response.status})`;
        console.error('Download error:', errorData);
        throw new Error(errorMessage);
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
            filename = filenameMatch[1];
            // Видаляємо лапки якщо вони є
            filename = filename.replace(/^["']|["']$/g, '');
          }
        }
      }
      
      // Якщо не вдалося отримати з заголовків, генеруємо
      if (!filename || !filename.includes('.')) {
        const sanitizeFilename = (title: string): string => {
          if (!title) return 'document';
          return title
            .replace(/[^a-z0-9а-яіїєґ\s]/gi, '') // Видаляємо спеціальні символи
            .replace(/\s+/g, '_') // Замінюємо пробіли на підкреслення
            .replace(/_+/g, '_') // Замінюємо множинні підкреслення на одне
            .replace(/^_+|_+$/g, '') // Видаляємо підкреслення на початку та в кінці
            .toLowerCase() || 'document';
        };
        const safeTitle = sanitizeFilename(doc.title || 'document');
        const safeFormat = format || 'txt';
        filename = `${safeTitle}.${safeFormat}`;
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Помилка при завантаженні документа: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleToggleStar = (documentId: string) => {
    setStarredDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };



  // Отримання відфільтрованих документів
  const filteredDocuments = getFilteredDocuments();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок сторінки */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Документи</h1>
            <p className="text-gray-600 mt-1">Управління документами та матеріалами</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Створення...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Створити документ
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Панель пошуку та фільтрів */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Пошук */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Пошук по документам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Фільтр категорій */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <category.icon className={`h-4 w-4 ${category.color}`} />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>

            {/* Фільтр типів */}
            <div className="flex gap-2">
              {documentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">{type.name}</span>
                </button>
              ))}
            </div>

            {/* Перемикач виду */}
            <div className="flex border border-gray-200 rounded-lg">
              <button
                onClick={() => setLocalViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 text-blue-600 border-r border-blue-200'
                    : 'bg-white text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setLocalViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-600 border-l border-blue-200'
                    : 'bg-white text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Основний контент */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <DocumentList
            documents={filteredDocuments}
            viewMode={viewMode}
            onSelect={handleDocumentSelect}
            onEdit={handleDocumentEdit}
            onDelete={handleDocumentDelete}
            onShare={handleDocumentShare}
            onDownload={handleDocumentDownload}
            onExportToGoogleDocs={handleExportToGoogleDocs}
            onToggleStar={handleToggleStar}
            starredDocuments={starredDocuments}
            isExportingToGoogleDocs={isExportingToGoogleDocs}
            isDownloading={isDownloading}
            isDeleting={isDeleting}
            isUpdating={isUpdating}
          />
        </div>
      </div>

      {/* Модальне вікно створення документа */}
      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateDocument={handleCreateDocument}
      />

      {/* Модальне вікно редагування документа */}
      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDocumentForEdit(null);
        }}
        onSave={handleEditDocument}
        document={selectedDocumentForEdit}
      />

      {/* Модальне вікно перегляду документа */}
      <ViewDocumentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDocumentForView(null);
        }}
        onEdit={handleViewToEdit}
        onShare={handleDocumentShare}
        document={selectedDocumentForView}
      />

      {/* Модальне вікно поширення документа */}
      <ShareDocumentModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedDocumentForShare(null);
        }}
        document={selectedDocumentForShare}
      />
    </div>
  );
}
