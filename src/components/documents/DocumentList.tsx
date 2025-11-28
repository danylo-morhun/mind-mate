'use client';

import React, { useMemo } from 'react';
import { Document } from '@/lib/types';
import DocumentCard from './DocumentCard';
import { useDocuments } from '@/contexts/DocumentsContext';
import { parseCSV, getTablePreview } from '@/lib/utils/csv-parser';
import TablePreview from './TablePreview';

interface DocumentListProps {
  documents: Document[];
  viewMode: 'grid' | 'list';
  onSelect: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onShare: (document: Document) => void;
  onDownload: (document: Document) => void;
  onExportToGoogleDocs?: (document: Document) => void;
  onToggleStar: (documentId: string) => void;
  starredDocuments?: string[];
  isExportingToGoogleDocs?: string | null;
  isDownloading?: string | null;
  isDeleting?: string | null;
  isUpdating?: string | null;
}

export default function DocumentList({
  documents,
  viewMode,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  onDownload,
  onExportToGoogleDocs,
  onToggleStar,
  starredDocuments = [],
  isExportingToGoogleDocs,
  isDownloading,
  isDeleting,
  isUpdating
}: DocumentListProps) {
  const { state } = useDocuments();

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Документи не знайдено
        </h3>
        <p className="text-gray-600 mb-6">
          {state.filters.search || state.filters.category !== 'all' || state.filters.type !== 'all'
            ? 'Спробуйте змінити фільтри або пошуковий запит'
            : 'Створіть перший документ, щоб почати роботу'
          }
        </p>
        {!state.filters.search && state.filters.category === 'all' && state.filters.type === 'all' && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Створити документ
          </button>
        )}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onShare={onShare}
            onDownload={onDownload}
            onExportToGoogleDocs={onExportToGoogleDocs}
            onToggleStar={onToggleStar}
            isStarred={starredDocuments.includes(document.id)}
            isExportingToGoogleDocs={isExportingToGoogleDocs === document.id}
            isDownloading={isDownloading?.startsWith(document.id)}
            isDeleting={isDeleting === document.id}
            isUpdating={isUpdating === document.id}
          />
        ))}
      </div>
    );
  }

  // Спискове відображення
  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <DocumentListItem
          key={document.id}
          document={document}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
          onDownload={onDownload}
          onToggleStar={onToggleStar}
          isStarred={starredDocuments.includes(document.id)}
        />
      ))}
    </div>
  );
}

// Компонент для спискового відображення
function DocumentListItem({
  document,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  onDownload,
  onToggleStar,
  isStarred = false
}: {
  document: Document;
  onSelect: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onShare: (document: Document) => void;
  onDownload: (document: Document) => void;
  onToggleStar: (documentId: string) => void;
  isStarred?: boolean;
}) {
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'doc':
        return <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>;
      case 'sheet':
        return <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>;
      case 'slide':
        return <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>;
      default:
        return <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Чернетка';
      case 'in_review':
        return 'На перегляді';
      case 'approved':
        return 'Затверджено';
      case 'published':
        return 'Опубліковано';
      case 'archived':
        return 'Архів';
      default:
        return 'Невідомо';
    }
  };

  const formatDate = (date: Date | string) => {
    // Конвертуємо рядок в Date якщо потрібно
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Перевіряємо чи дата валідна
    if (isNaN(dateObj.getTime())) {
      return 'Невідома дата';
    }
    
    return dateObj.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              {getDocumentIcon(document.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={() => onSelect(document)}
              >
                {document.title}
              </h3>
              {document.type === 'sheet' || document.type === 'spreadsheet' ? (
                <div className="mt-2 overflow-x-auto">
                  {(() => {
                    const tableData = parseCSV(document.content || '');
                    if (tableData.headers.length > 0) {
                      const preview = getTablePreview(tableData, 2);
                      return (
                        <TablePreview 
                          data={preview} 
                          maxRows={2}
                          className="text-xs"
                        />
                      );
                    }
                    return (
                      <p className="text-gray-500 text-sm">Таблиця порожня</p>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {document.content}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            {/* Статус */}
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
              {getStatusText(document.status)}
            </span>

            {/* Метадані */}
            <div className="text-sm text-gray-500 text-right">
              <div>Автор: {document.author}</div>
              <div>Оновлено: {formatDate(document.lastModified)}</div>
              <div>Версія: {document.version}</div>
            </div>

            {/* Дії */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggleStar(document.id)}
                className={`p-1 rounded transition-colors ${
                  isStarred 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
                title="Додати в обране"
              >
                <svg className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              
              <button
                onClick={() => onSelect(document)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Переглянути"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              
              <button
                onClick={() => onEdit(document)}
                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Редагувати"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                onClick={() => onShare(document)}
                className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                title="Поділитися"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
              
              <button
                onClick={() => onDelete(document.id)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Видалити"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
