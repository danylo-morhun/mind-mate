'use client';

import React from 'react';
import { FileText, Plus, Search, Filter, Bot } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI-Документи</h1>
          <p className="text-gray-600 mt-2">Створення та редагування документів з допомогою штучного інтелекту</p>
        </div>

        {/* Панель дій */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Новий документ
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                <Bot className="h-4 w-4 mr-2" />
                AI-Генерація
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Пошук документів..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Список документів */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Приклад документа */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Опубліковано
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Лекція: Вступ до програмування
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Основи програмування для студентів першого курсу...
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Автор: Іванов І.І.</span>
                <span>2 дні тому</span>
              </div>
            </div>
          </div>

          {/* Приклад документа */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  На перегляді
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Методичка: Лабораторні роботи
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Інструкції для виконання лабораторних робіт...
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Автор: Петров П.П.</span>
                <span>1 тиждень тому</span>
              </div>
            </div>
          </div>

          {/* Приклад документа */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Чернетка
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Звіт: Аналіз успішності
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Аналіз успішності студентів за семестр...
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Автор: Сидоров С.С.</span>
                <span>3 дні тому</span>
              </div>
            </div>
          </div>
        </div>

        {/* Повідомлення про розробку */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Модуль в розробці</h3>
              <p className="text-blue-700 mt-1">
                Модуль AI-документів знаходиться в процесі розробки. 
                Тут буде можливість створювати документи з допомогою штучного інтелекту.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
