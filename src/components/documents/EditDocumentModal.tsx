'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { X, FileText, Save, History, Users, Eye, EyeOff, Lock, Globe, Tag, MessageSquare, Clock, User, Edit } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  template: string;
  content: string;
  additionalContext?: string;
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
  };
}

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Document) => void;
  document: Document | null;
}

interface DocumentVersion {
  id: string;
  version: string;
  timestamp: Date;
  author: string;
  changes: string[];
  content: string;
}

interface DocumentComment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  replies?: DocumentComment[];
}

export default function EditDocumentModal({ isOpen, onClose, onSave, document }: EditDocumentModalProps) {
  const [formData, setFormData] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'history' | 'comments' | 'sharing'>('edit');
  const [newTag, setNewTag] = useState('');
  const [newCollaborator, setNewCollaborator] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [improvementContext, setImprovementContext] = useState('');

  // Mock data для версій та коментарів
  const [versions] = useState<DocumentVersion[]>([
    {
      id: 'v1',
      version: '1.0',
      timestamp: new Date(Date.now() - 86400000), // 1 день тому
      author: 'current_user',
      changes: ['Створено документ', 'Додано базовий контент'],
      content: 'Початковий контент документа'
    }
  ]);

  const [comments] = useState<DocumentComment[]>([
    {
      id: 'c1',
      author: 'current_user',
      content: 'Документ потребує доопрацювання в розділі "Методика"',
      timestamp: new Date(Date.now() - 3600000), // 1 година тому
      replies: [
        {
          id: 'r1',
          author: 'collaborator@example.com',
          content: 'Погоджуюсь, давайте розширимо цей розділ',
          timestamp: new Date(Date.now() - 1800000) // 30 хв тому
        }
      ]
    }
  ]);

  // Ініціалізація форми при відкритті
  useEffect(() => {
    if (document) {
      setFormData({ ...document });
    }
  }, [document]);

  const handleInputChange = useCallback((field: keyof Document, value: string | string[]) => {
    if (formData) {
      setFormData(prev => prev ? { ...prev, [field]: value } : null);
    }
  }, [formData]);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && formData && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => prev ? { ...prev, tags: [...prev.tags, newTag.trim()] } : null);
      setNewTag('');
    }
  }, [newTag, formData]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    if (formData) {
      setFormData(prev => prev ? { ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) } : null);
    }
  }, [formData]);

  const handleAddCollaborator = useCallback(() => {
    if (newCollaborator.trim() && formData && !formData.collaborators.includes(newCollaborator.trim())) {
      setFormData(prev => prev ? { ...prev, collaborators: [...prev.collaborators, newCollaborator.trim()] } : null);
      setNewCollaborator('');
    }
  }, [newCollaborator, formData]);

  const handleRemoveCollaborator = useCallback((collaboratorToRemove: string) => {
    if (formData) {
      setFormData(prev => prev ? { ...prev, collaborators: prev.collaborators.filter(collaborator => collaborator !== collaboratorToRemove) } : null);
    }
  }, [formData]);

  const handleAddComment = useCallback(() => {
    if (newComment.trim()) {
      // TODO: Додати коментар до API
      setNewComment('');
    }
  }, [newComment]);

  const handleImproveContentWithAI = useCallback(async () => {
    if (!formData || !formData.title) return;

    setIsImproving(true);
    try {
      // Визначаємо тип документа для AI
      const documentType = formData.type || 'document';
      const template = documentType === 'lecture' ? 'lecture' : 
                     documentType === 'methodology' ? 'methodology' :
                     documentType === 'lab' ? 'lab' :
                     documentType === 'course' ? 'course' :
                     documentType === 'thesis' ? 'thesis' : 'lecture';

      // Інтеграція з Gemini API для покращення контенту
      const response = await fetch('/api/documents/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          template: template,
          description: formData.description,
          category: formData.category,
          type: documentType,
          additionalContext: `Покрашити існуючий контент: ${formData.content.substring(0, 200)}... ${improvementContext ? `Додаткові вимоги: ${improvementContext}` : ''}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to improve content');
      }

      const result = await response.json();
      
      if (result.success && result.content) {
        setFormData(prev => prev ? { ...prev, content: result.content } : null);
        console.log('Content improved successfully:', result.metadata);
        alert('Контент успішно покращено за допомогою AI!');
      } else {
        throw new Error('No improved content received from AI');
      }
    } catch (error) {
      console.error('Error improving content:', error);
      alert(`Помилка при покращенні контенту: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsImproving(false);
    }
  }, [formData, improvementContext]);

  const handleSave = useCallback(async () => {
    if (!formData) return;

    setIsSaving(true);
    try {
      // Оновлюємо версію та дату модифікації
      const updatedDocument = {
        ...formData,
        version: incrementVersion(formData.version),
        lastModified: new Date(),
        metadata: {
          ...formData.metadata,
          lastAccessed: new Date()
        }
      };

      await onSave(updatedDocument);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave]);

  const incrementVersion = (version: string): string => {
    const parts = version.split('.');
    const minor = parseInt(parts[1]) + 1;
    return `${parts[0]}.${minor}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('uk-UA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !document || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Редагування документа</h2>
              <p className="text-sm text-gray-500">
                {document.title} • Версія {document.version} • Остання зміна {formatDate(document.lastModified)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Редагувати
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'edit', name: 'Редагування', icon: Edit },
              { id: 'history', name: 'Історія', icon: History },
              { id: 'comments', name: 'Коментарі', icon: MessageSquare },
              { id: 'sharing', name: 'Доступ', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                                     onClick={() => setActiveTab(tab.id as 'edit' | 'history' | 'comments' | 'sharing')}
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
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'edit' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Редагування контенту</h3>
                {isEditing && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Скасувати
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Зберігаємо...' : 'Зберегти'}
                    </button>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Назва документа *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Опис
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* AI Generation для покращення контенту */}
              {isEditing && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-purple-900">🤖 AI Покращення контенту</span>
                    </div>
                    <button
                      onClick={handleImproveContentWithAI}
                      disabled={isImproving || !formData.title}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isImproving ? '🔄 Покращуємо...' : '✨ Покрашити контент'}
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-purple-900 mb-2">
                      💡 Що покрашити (необов'язково)
                    </label>
                    <textarea
                      value={improvementContext}
                      onChange={(e) => setImprovementContext(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="Опишіть, що саме потрібно покрашити в контенті..."
                    />
                  </div>
                  
                  <div className="text-sm text-purple-700 space-y-2">
                    <p><strong>✨ Що може покрашити AI:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Структуру та логіку викладення</li>
                      <li>Стиль та читабельність тексту</li>
                      <li>Додати практичні приклади</li>
                      <li>Розширити пояснення</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Контент документа
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  disabled={!isEditing}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed font-mono text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Теги
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Додати тег"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Додати
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Історія версій</h3>
              
              <div className="space-y-4">
                {versions.map((version) => (
                  <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          v{version.version}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(version.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{version.author}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-2">Зміни:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {version.changes.map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded border">
                      <h4 className="font-medium text-gray-900 mb-2">Контент версії:</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{version.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Коментарі та обговорення</h3>
              
              {/* Add new comment */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Додати коментар</h4>
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Напишіть ваш коментар..."
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Додати коментар
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{comment.content}</p>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-6 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="border-l-2 border-gray-200 pl-4">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900">{reply.author}</span>
                                  <span className="text-sm text-gray-500">
                                    {formatDate(reply.timestamp)}
                                  </span>
                                </div>
                                <p className="text-gray-700">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Налаштування доступу</h3>
              
              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Видимість документа
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'private', name: 'Приватний', description: 'Тільки ви можете бачити', icon: Lock },
                    { id: 'shared', name: 'Поширений', description: 'Доступ для обранних користувачів', icon: Users },
                    { id: 'public', name: 'Публічний', description: 'Доступ для всіх', icon: Globe }
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleInputChange('visibility', option.id)}
                        disabled={!isEditing}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                          formData.visibility === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">{option.name}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Рівень доступу для співпрацівників
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'view', name: 'Перегляд', description: 'Тільки перегляд документа', icon: Eye },
                    { id: 'comment', name: 'Коментарі', description: 'Можна коментувати', icon: MessageSquare },
                    { id: 'edit', name: 'Редагування', description: 'Повний доступ до редагування', icon: Edit }
                  ].map((level) => {
                    const Icon = level.icon;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => handleInputChange('accessLevel', level.id)}
                        disabled={!isEditing}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.accessLevel === level.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Icon className="w-5 h-5 text-gray-600 mb-2" />
                        <div className="font-medium text-gray-900">{level.name}</div>
                        <div className="text-sm text-gray-500">{level.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collaborators */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Співпрацівники
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.collaborators.map((collaborator) => (
                    <span
                      key={collaborator}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {collaborator}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveCollaborator(collaborator)}
                          className="ml-2 hover:text-green-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newCollaborator}
                      onChange={(e) => setNewCollaborator(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCollaborator()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                    <button
                      onClick={handleAddCollaborator}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Додати
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
