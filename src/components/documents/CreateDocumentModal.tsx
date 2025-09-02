'use client';

import React, { useState, useCallback } from 'react';
import { X, FileText, BookOpen, FileSpreadsheet, Presentation, File, Users, Lock, Globe, Eye, EyeOff } from 'lucide-react';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: (document: DocumentFormData) => void;
}

interface DocumentFormData {
  title: string;
  description: string;
  type: string;
  category: string;
  template: string;
  content: string;
  additionalContext: string;
  tags: string[];
  collaborators: string[];
  visibility: 'private' | 'shared' | 'public';
  accessLevel: 'view' | 'comment' | 'edit';
}

const documentTypes = [
  { id: 'document', name: 'Документ', icon: FileText, color: 'text-blue-600' },
  { id: 'lecture', name: 'Лекція', icon: BookOpen, color: 'text-green-600' },
  { id: 'spreadsheet', name: 'Таблиця', icon: FileSpreadsheet, color: 'text-orange-600' },
  { id: 'presentation', name: 'Презентація', icon: Presentation, color: 'text-purple-600' },
  { id: 'other', name: 'Інше', icon: File, color: 'text-gray-600' }
];

const documentCategories = [
  'Навчальні матеріали',
  'Методичні вказівки',
  'Лабораторні роботи',
  'Курсові роботи',
  'Дипломні роботи',
  'Наукові статті',
  'Звіти',
  'Інше'
];

const documentTemplates = [
  { id: 'blank', name: 'Порожній документ', description: 'Створити з нуля' },
  { id: 'lecture', name: 'Шаблон лекції', description: 'Структура лекції з розділами' },
  { id: 'methodology', name: 'Методичні вказівки', description: 'Стандартна структура методички' },
  { id: 'lab', name: 'Лабораторна робота', description: 'Шаблон для лабораторних' },
  { id: 'course', name: 'Курсова робота', description: 'Структура курсової роботи' },
  { id: 'thesis', name: 'Дипломна робота', description: 'Шаблон дипломної роботи' }
];

const accessLevels = [
  { id: 'view', name: 'Перегляд', description: 'Тільки перегляд документа', icon: Eye },
  { id: 'comment', name: 'Коментарі', description: 'Можна коментувати', icon: Eye },
  { id: 'edit', name: 'Редагування', description: 'Повний доступ до редагування', icon: EyeOff }
];

export default function CreateDocumentModal({ isOpen, onClose, onCreateDocument }: CreateDocumentModalProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    type: 'document',
    category: '',
    template: 'blank',
    content: '',
    additionalContext: '',
    tags: [],
    collaborators: [],
    visibility: 'private',
    accessLevel: 'view'
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newCollaborator, setNewCollaborator] = useState('');

  const handleInputChange = useCallback((field: keyof DocumentFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  }, []);

  const handleAddCollaborator = useCallback(() => {
    if (newCollaborator.trim() && !formData.collaborators.includes(newCollaborator.trim())) {
      setFormData(prev => ({ ...prev, collaborators: [...prev.collaborators, newCollaborator.trim()] }));
      setNewCollaborator('');
    }
  }, [newCollaborator, formData.collaborators]);

  const handleRemoveCollaborator = useCallback((collaboratorToRemove: string) => {
    setFormData(prev => ({ ...prev, collaborators: prev.collaborators.filter(collaborator => collaborator !== collaboratorToRemove) }));
  }, []);

  const generateContentWithAI = useCallback(async () => {
    if (!formData.title || !formData.template || formData.template === 'blank') return;

    setIsGenerating(true);
    try {
      // Інтеграція з Gemini API для генерації контенту
      const response = await fetch('/api/documents/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          template: formData.template,
          description: formData.description,
          category: formData.category,
          type: formData.type,
          additionalContext: formData.additionalContext
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const result = await response.json();
      
      if (result.success && result.content) {
        setFormData(prev => ({ ...prev, content: result.content }));
        console.log('Content generated successfully:', result.metadata);
      } else {
        throw new Error('No content received from AI');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert(`Помилка при генерації контенту: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [formData.title, formData.template, formData.description, formData.category, formData.type, formData.additionalContext]);

  const handleSubmit = useCallback(() => {
    if (!formData.title.trim()) return;

    const newDocument = {
      id: `doc_${Date.now()}`,
      ...formData,
      createdDate: new Date(),
      lastModified: new Date(),
      status: 'draft',
      owner: 'current_user',
      version: '1.0',
      metadata: {
        lastAccessed: new Date(),
        accessCount: 0,
        favoriteCount: 0
      }
    };

    onCreateDocument(newDocument);
    onClose();
    setFormData({
      title: '',
      description: '',
      type: 'document',
      category: '',
      template: 'blank',
      content: '',
      additionalContext: '',
      tags: [],
      collaborators: [],
      visibility: 'private',
      accessLevel: 'view'
    });
    setCurrentStep(1);
  }, [formData, onCreateDocument, onClose]);

  const nextStep = useCallback(() => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Створити новий документ</h2>
              <p className="text-sm text-gray-500">Крок {currentStep} з 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Основна інформація</h3>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Назва документа *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введіть назву документа"
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Короткий опис документа"
                />
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Тип документа
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {documentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleInputChange('type', type.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.type === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${type.color} mb-2`} />
                        <div className="font-medium text-gray-900">{type.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Категорія
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Виберіть категорію</option>
                  {documentCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Шаблон та контент</h3>
              
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Шаблон документа
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {documentTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleInputChange('template', template.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.template === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Generation для всіх шаблонів крім blank */}
              {formData.template !== 'blank' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-green-900">🤖 AI Генерація контенту</span>
                    </div>
                    <button
                      onClick={generateContentWithAI}
                      disabled={isGenerating || !formData.title}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGenerating ? '🔄 Генеруємо...' : '🚀 Згенерувати контент'}
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-green-900 mb-2">
                      💡 Додатковий контекст для AI (необов'язково)
                    </label>
                    <textarea
                      value={formData.additionalContext}
                      onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Додайте додаткову інформацію, специфічні вимоги або контекст для кращої генерації..."
                    />
                  </div>
                  
                  <div className="text-sm text-green-700 space-y-2">
                    <p><strong>✨ Що генерує AI:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Структурований контент з розділами та підрозділами</li>
                      <li>Практичні приклади та пояснення</li>
                      <li>Висновки та питання для самоперевірки</li>
                      <li>Рекомендовану літературу</li>
                    </ul>
                    <p className="mt-2"><strong>🎯 Поточний шаблон:</strong> {documentTemplates.find(t => t.id === formData.template)?.name}</p>
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
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Введіть або згенеруйте контент документа..."
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
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
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
              </div>
            </div>
          )}

          {currentStep === 3 && (
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
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                          formData.visibility === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
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
                  {accessLevels.map((level) => {
                    const Icon = level.icon;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => handleInputChange('accessLevel', level.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.accessLevel === level.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
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
                      <button
                        onClick={() => handleRemoveCollaborator(collaborator)}
                        className="ml-2 hover:text-green-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
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
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Назад
          </button>
          
          <div className="flex space-x-3">
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={!formData.title.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Далі
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!formData.title.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Створити документ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
