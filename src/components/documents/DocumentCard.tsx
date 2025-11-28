'use client';

import React, { useMemo } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  File, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  User,
  Tag,
  Share2,
  Download,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Document, DocumentType, DocumentCategory, DocumentStatus } from '@/lib/types';
import { parseCSV, getTablePreview } from '@/lib/utils/csv-parser';
import TablePreview from './TablePreview';

interface DocumentCardProps {
  document: Document;
  onSelect: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (documentId: string) => void;
  onShare: (document: Document) => void;
  onDownload: (document: Document) => void;
  onExportToGoogleDocs?: (document: Document) => void;
  onToggleStar: (documentId: string) => void;
  isStarred?: boolean;
  isExportingToGoogleDocs?: boolean;
  isDownloading?: boolean;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export default function DocumentCard({
  document,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  onDownload,
  onExportToGoogleDocs,
  onToggleStar,
  isStarred = false,
  isExportingToGoogleDocs = false,
  isDownloading = false,
  isDeleting = false,
  isUpdating = false
}: DocumentCardProps) {
  // Отримання іконки по типу документа
  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'doc':
        return <FileText className="h-6 w-6 text-blue-600" />;
      case 'sheet':
        return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
      case 'pdf':
        return <File className="h-6 w-6 text-red-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  // Отримання кольору статусу
  const getStatusColor = (status: DocumentStatus) => {
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
      case 'deprecated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Отримання тексту статусу
  const getStatusText = (status: DocumentStatus) => {
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
      case 'deprecated':
        return 'Застаріло';
      default:
        return 'Невідомо';
    }
  };

  // Форматування дати
  const formatDate = (date: Date | string) => {
    // Конвертуємо рядок в Date якщо потрібно
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Перевіряємо чи дата валідна
    if (isNaN(dateObj.getTime())) {
      return 'Невідома дата';
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return dateObj.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return dateObj.toLocaleDateString('uk-UA', { weekday: 'short' });
    } else {
      return dateObj.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
    }
  };

  // Обрізання тексту
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
      {/* Заголовок картки */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              {getDocumentIcon(document.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors"
                onClick={() => onSelect(document)}
              >
                {truncateText(document.title, 50)}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{document.author}</span>
              </div>
            </div>
          </div>
          
          {/* Меню дій */}
          <div className="relative">
            <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Статус та теги */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
            {getStatusText(document.status)}
          </span>
          <div className="flex items-center gap-1">
            {document.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                +{document.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Основний контент */}
      <div className="p-4">
        {document.type === 'sheet' || document.type === 'spreadsheet' ? (
          <div className="mb-4">
            {(() => {
              const tableData = parseCSV(document.content || '');
              if (tableData.headers.length > 0) {
                const preview = getTablePreview(tableData, 3);
                return (
                  <div className="overflow-hidden">
                    <TablePreview 
                      data={preview} 
                      maxRows={3}
                      className="text-xs"
                    />
                  </div>
                );
              }
              return (
                <p className="text-gray-500 text-sm">Таблиця порожня</p>
              );
            })()}
          </div>
        ) : (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {truncateText(document.content, 120)}
          </p>
        )}

        {/* Метадані */}
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>{document.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Оновлено {formatDate(document.lastModified)}</span>
          </div>
          {document.metadata && (
            <>
              <div className="flex items-center gap-2">
                <span>Предмет: {document.metadata.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Семестр: {document.metadata.semester}</span>
              </div>
            </>
          )}
          {document.googleDocUrl && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <a
                href={document.googleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {document.type === 'sheet' ? 'Відкрити в Google Sheets' : 'Відкрити в Google Docs'}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Нижня панель з діями */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleStar(document.id)}
              className={`p-1 rounded transition-colors ${
                isStarred 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
            >
              <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
            </button>
            <span className="text-xs text-gray-500">
              v{document.version}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelect(document)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Переглянути"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(document)}
              disabled={isUpdating}
              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
              title="Редагувати"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => onShare(document)}
              className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
              title="Поділитися"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDownload(document)}
              disabled={isDownloading}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
              title="Завантажити"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
            {onExportToGoogleDocs && !document.googleDocId && (
              <button
                onClick={() => onExportToGoogleDocs(document)}
                disabled={isExportingToGoogleDocs}
                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                title={
                  document.type === 'sheet' ? 'Експортувати до Google Sheets' : 'Експортувати до Google Docs'
                }
              >
                {isExportingToGoogleDocs ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
              </button>
            )}
            {document.googleDocUrl && (
              <a
                href={document.googleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                title={
                  document.type === 'sheet' ? 'Відкрити в Google Sheets' : 'Відкрити в Google Docs'
                }
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={() => onDelete(document.id)}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              title="Видалити"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
