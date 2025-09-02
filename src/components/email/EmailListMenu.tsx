import React, { useState } from 'react';
import { MoreVertical, Tag, Filter, Download, Archive, Trash2 } from 'lucide-react';

interface EmailListMenuProps {
  labels: any[];
  onLabelUpdate: () => void;
}

export default function EmailListMenu({ labels, onLabelUpdate }: EmailListMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [newLabelForm, setNewLabelForm] = useState({
    name: '',
    backgroundColor: '#4285f4',
    textColor: '#ffffff',
    visibility: 'labelShow'
  });
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLabelForm.name.trim()) {
      alert('Введіть назву мітки');
      return;
    }

    setIsCreatingLabel(true);
    
    const requestBody = {
      action: 'create',
      labelName: newLabelForm.name,
      labelColor: {
        backgroundColor: newLabelForm.backgroundColor,
        textColor: newLabelForm.textColor
      },
      labelVisibility: newLabelForm.visibility
    };
    
    console.log('Sending label creation request:', requestBody);
    
    try {
      const response = await fetch('/api/gmail/labels/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Success response:', responseData);
        
        // Очищаємо форму
        setNewLabelForm({
          name: '',
          backgroundColor: '#4285f4',
          textColor: '#ffffff',
          visibility: 'labelShow'
        });
        
        // Оновлюємо список міток
        onLabelUpdate();
        
        // Показуємо повідомлення про успіх
        alert('Мітку успішно створено!');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Помилка створення мітки: ${errorData.error || 'Невідома помилка'}`);
      }
    } catch (error) {
      console.error('Failed to create label:', error);
      alert('Помилка створення мітки. Спробуйте ще раз.');
    } finally {
      setIsCreatingLabel(false);
    }
  };

  const menuItems = [
    {
      icon: Tag,
      label: 'Управління мітками',
      action: () => {
        setShowLabelManager(true);
        setIsOpen(false);
      },
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      icon: Filter,
      label: 'Налаштування фільтрів',
      action: () => {
        setIsOpen(false);
      },
      color: 'text-green-600 hover:bg-green-50'
    },
    {
      icon: Download,
      label: 'Експорт листів',
      action: () => {
        setIsOpen(false);
      },
      color: 'text-purple-600 hover:bg-purple-50'
    },
    {
      icon: Archive,
      label: 'Архівувати всі',
      action: () => {
        setIsOpen(false);
      },
      color: 'text-orange-600 hover:bg-orange-50'
    },
    {
      icon: Trash2,
      label: 'Очистити кошик',
      action: () => {
        setIsOpen(false);
      },
      color: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <div className="relative">
      {/* Кнопка меню */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {/* Випадаюче меню */}
      {isOpen && (
        <>
          {/* Фон для закриття */}
          <div
            className="fixed inset-0 z-[99998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Меню */}
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[99999] min-w-48 py-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${item.color}`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Модальне вікно управління мітками */}
      {showLabelManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Управління мітками
              </h3>
              <button
                onClick={() => setShowLabelManager(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Форма створення/редагування мітки */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Створити нову мітку
              </h4>
              
              <form onSubmit={handleCreateLabel} className="space-y-4">
                {/* Назва мітки */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Назва мітки
                  </label>
                  <input
                    type="text"
                    value={newLabelForm.name}
                    onChange={(e) => setNewLabelForm({ ...newLabelForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Введіть назву мітки"
                    required
                  />
                </div>

                {/* Колір фону */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Колір фону
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newLabelForm.backgroundColor}
                      onChange={(e) => setNewLabelForm({ ...newLabelForm, backgroundColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newLabelForm.backgroundColor}
                      onChange={(e) => setNewLabelForm({ ...newLabelForm, backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="#4285f4"
                    />
                  </div>
                </div>

                {/* Колір тексту */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Колір тексту
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newLabelForm.textColor}
                      onChange={(e) => setNewLabelForm({ ...newLabelForm, textColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newLabelForm.textColor}
                      onChange={(e) => setNewLabelForm({ ...newLabelForm, textColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                {/* Видимість */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Видимість
                  </label>
                  <select 
                    value={newLabelForm.visibility}
                    onChange={(e) => setNewLabelForm({ ...newLabelForm, visibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="labelShow">Показати в списку</option>
                    <option value="labelHide">Приховати зі списку</option>
                  </select>
                </div>

                {/* Кнопки */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={isCreatingLabel}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingLabel ? (
                      <>
                        <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Створення...
                      </>
                    ) : (
                      'Створити мітку'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLabelManager(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </div>

            {/* Список існуючих міток */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Існуючі мітки
              </h4>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {labels.filter(label => !label.name.startsWith('CATEGORY_') && !label.name.startsWith('INBOX')).map((label) => (
                  <div key={label.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: label.backgroundColor || '#4285f4' }}
                      />
                      <span className="text-sm font-medium text-gray-700">{label.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Редагувати"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Видалити"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                {labels.filter(label => !label.name.startsWith('CATEGORY_') && !label.name.startsWith('INBOX')).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p>Немає створених міток</p>
                    <p className="text-sm">Створіть першу мітку вище</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
