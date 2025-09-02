'use client';

import React, { useState } from 'react';
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
  Tag
} from 'lucide-react';

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок сторінки */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Документи</h1>
            <p className="text-gray-600 mt-1">Управління документами та матеріалами</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
            Створити документ
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
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 text-blue-600 border-r border-blue-200'
                    : 'bg-white text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
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
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Модуль документів в розробці
            </h3>
            <p className="text-gray-600 mb-6">
              Тут буде відображатися список документів та можливості для роботи з ними
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Створити перший документ
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Дізнатися більше
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
