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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Управління мітками
              </h3>
              <button
                onClick={() => setShowLabelManager(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <LabelManager
              labels={labels}
              onLabelUpdate={() => {
                onLabelUpdate();
                setShowLabelManager(false);
              }}
              hideButton={true}
              hideModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
