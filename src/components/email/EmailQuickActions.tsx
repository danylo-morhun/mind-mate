import React, { useState } from 'react';
import { Tag, Star, AlertTriangle, BookOpen, FileText, Users, Calendar, Settings } from 'lucide-react';
import { Email } from '@/lib/types';

interface EmailQuickActionsProps {
  email: Email;
  onEmailUpdate: (emailId: string, updates: Partial<Email>) => void;
  labels: Array<{
    id: string;
    name: string;
    backgroundColor?: string;
    textColor?: string;
  }>;
  onLabelUpdate: () => void;
}

export default function EmailQuickActions({ email, onEmailUpdate, labels, onLabelUpdate }: EmailQuickActionsProps) {
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  // Категорії для університетської роботи
  const categories = [
    { key: 'education', label: 'Освіта', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
    { key: 'administrative', label: 'Адміністрація', icon: FileText, color: 'bg-green-100 text-green-800' },
    { key: 'student_support', label: 'Підтримка студентів', icon: Users, color: 'bg-purple-100 text-purple-800' },
    { key: 'meetings', label: 'Зустрічі', icon: Calendar, color: 'bg-orange-100 text-orange-800' },
    { key: 'documents', label: 'Документи', icon: FileText, color: 'bg-indigo-100 text-indigo-800' },
    { key: 'other', label: 'Інше', icon: Settings, color: 'bg-gray-100 text-gray-800' }
  ];

  // Пріоритети
  const priorities = [
    { key: 'high', label: 'Високий', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
    { key: 'medium', label: 'Середній', icon: Star, color: 'bg-yellow-100 text-yellow-800' },
    { key: 'low', label: 'Низький', icon: Tag, color: 'bg-green-100 text-green-800' }
  ];

  const handleCategoryChange = (category: string) => {
    onEmailUpdate(email.id, { category: category as Email['category'] });
    setShowCategoryMenu(false);
  };

  const handlePriorityChange = (priority: string) => {
    onEmailUpdate(email.id, { priority: priority as Email['priority'] });
    setShowPriorityMenu(false);
  };

  const handleLabelToggle = async (labelId: string) => {
    try {
      const isLabelApplied = email.labels.includes(labelId);
      
      const response = await fetch('/api/gmail/labels/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isLabelApplied ? 'remove' : 'apply',
          labelId,
          emailId: email.id
        }),
      });

      if (response.ok) {
        // Оновлюємо локальний стан
        const updatedLabels = isLabelApplied
          ? email.labels.filter(id => id !== labelId)
          : [...email.labels, labelId];
        
        onEmailUpdate(email.id, { labels: updatedLabels });
        onLabelUpdate();
      }
    } catch (error) {
      console.error('Failed to toggle label:', error);
    }
  };

  const getCurrentCategory = () => {
    return categories.find(cat => cat.key === email.category) || categories[5]; // other
  };

  const getCurrentPriority = () => {
    return priorities.find(pri => pri.key === email.priority) || priorities[1]; // medium
  };

  return (
    <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Категорія */}
      <div className="relative">
        <button
          onClick={() => setShowCategoryMenu(!showCategoryMenu)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${getCurrentCategory().color}`}
        >
          {(() => {
            const IconComponent = getCurrentCategory().icon;
            return <IconComponent className="h-4 w-4" />;
          })()}
          {getCurrentCategory().label}
        </button>

        {showCategoryMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-48">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">Змінити категорію</div>
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-50 transition-colors ${
                    email.category === category.key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {(() => {
                    const IconComponent = category.icon;
                    return <IconComponent className="h-4 w-4" />;
                  })()}
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Пріоритет */}
      <div className="relative">
        <button
          onClick={() => setShowPriorityMenu(!showPriorityMenu)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${getCurrentPriority().color}`}
        >
          {(() => {
            const IconComponent = getCurrentPriority().icon;
            return <IconComponent className="h-4 w-4" />;
          })()}
          {getCurrentPriority().label}
        </button>

        {showPriorityMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-40">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2 px-2">Змінити пріоритет</div>
              {priorities.map((priority) => (
                <button
                  key={priority.key}
                  onClick={() => handlePriorityChange(priority.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-50 transition-colors ${
                    email.priority === priority.key ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {(() => {
                    const IconComponent = priority.icon;
                    return <IconComponent className="h-4 w-4" />;
                  })()}
                  {priority.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Мітки */}
      <div className="relative">
        <button
          onClick={() => setShowLabelMenu(!showLabelMenu)}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Tag className="h-4 w-4" />
          Мітки ({email.labels.length})
        </button>

        {showLabelMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-64">
            <div className="p-3">
              <div className="text-xs font-medium text-gray-500 mb-3">Управління мітками</div>
              
              {/* Існуючі мітки */}
              <div className="space-y-2 mb-3">
                {labels.filter(label => !label.name.startsWith('CATEGORY_') && !label.name.startsWith('INBOX')).map((label) => {
                  const isApplied = email.labels.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      onClick={() => handleLabelToggle(label.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors ${
                        isApplied 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: label.backgroundColor || '#4285f4' }}
                      />
                      <span className="flex-1 text-left">{label.name}</span>
                      {isApplied && <span className="text-blue-600">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Повідомлення якщо немає міток */}
              {labels.filter(label => !label.name.startsWith('CATEGORY_') && !label.name.startsWith('INBOX')).length === 0 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  Немає доступних міток
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Закриття меню при кліку поза ними */}
      {(showCategoryMenu || showPriorityMenu || showLabelMenu) && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => {
            setShowCategoryMenu(false);
            setShowPriorityMenu(false);
            setShowLabelMenu(false);
          }}
        />
      )}
    </div>
  );
}
