import React, { useState } from 'react';
import { MoreVertical, Tag, Settings, Filter, Download, Archive, Trash2 } from 'lucide-react';
import LabelManager from './LabelManager';

interface EmailListMenuProps {
  labels: any[];
  onLabelUpdate: () => void;
}

export default function EmailListMenu({ labels, onLabelUpdate }: EmailListMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);

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

      {/* LabelManager модальне вікно */}
      {showLabelManager && (
        <LabelManager
          labels={labels}
          onLabelUpdate={() => {
            onLabelUpdate();
            setShowLabelManager(false);
          }}
        />
      )}
    </div>
  );
}
