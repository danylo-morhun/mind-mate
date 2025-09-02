'use client';

import React from 'react';
import { Users, MessageCircle, Share2, Clock, UserPlus } from 'lucide-react';

export default function CollaborationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Колаборація</h1>
          <p className="text-gray-600 mt-2">Спільна робота, коментарі та управління доступом</p>
        </div>

        {/* Панель дій */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                <UserPlus className="h-4 w-4 mr-2" />
                Запросити учасника
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                <Share2 className="h-4 w-4 mr-2" />
                Поділитися
              </button>
            </div>
          </div>
        </div>

        {/* Активні проекти */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Активні проекти</h3>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Навчальний план 2024</h4>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Активний
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Розробка навчального плану для нових спеціальностей
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>5 учасників</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>Оновлено 2 години тому</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Методичні рекомендації</h4>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    На перегляді
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Створення методичних рекомендацій для викладачів
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>3 учасники</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>Оновлено 1 день тому</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Останні коментарі</h3>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">ІІ</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">Іванов І.І.</span>
                      <span className="text-xs text-gray-500">2 години тому</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Додав нові розділи до навчального плану. Перевірте, будь ласка.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">ПП</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">Петров П.П.</span>
                      <span className="text-xs text-gray-500">1 день тому</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Методичка готова до перегляду. Потрібні коментарі.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Повідомлення про розробку */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Модуль в розробці</h3>
              <p className="text-blue-700 mt-1">
                Модуль колаборації знаходиться в процесі розробки. 
                Тут буде можливість спільної роботи, коментарів та управління доступом.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
