'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Eye, EyeOff } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

interface Label {
  id: string;
  name: string;
  backgroundColor?: string;
  textColor?: string;
  labelListVisibility?: string;
  messageListVisibility?: string;
}

interface LabelManagerProps {
  labels: Label[];
  onLabelUpdate: () => void;
  hideButton?: boolean;
  hideModal?: boolean;
}

export default function LabelManager({ labels, onLabelUpdate, hideButton = false, hideModal = false }: LabelManagerProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [isOpen, setIsOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    backgroundColor: '#4285f4',
    textColor: '#ffffff',
    visibility: 'labelShow'
  });

  const handleCreateLabel = async () => {
    try {
      const response = await fetch('/api/gmail/labels/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          labelName: formData.name,
          labelColor: {
            backgroundColor: formData.backgroundColor,
            textColor: formData.textColor
          },
          labelVisibility: formData.visibility
        }),
      });

      if (response.ok) {
        setFormData({ name: '', backgroundColor: '#4285f4', textColor: '#ffffff', visibility: 'labelShow' });
        onLabelUpdate();
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to create label:', error);
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel) return;

    try {
      const response = await fetch('/api/gmail/labels/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          labelId: editingLabel.id,
          labelName: formData.name,
          labelColor: {
            backgroundColor: formData.backgroundColor,
            textColor: formData.textColor
          },
          labelVisibility: formData.visibility
        }),
      });

      if (response.ok) {
        setEditingLabel(null);
        setFormData({ name: '', backgroundColor: '#4285f4', textColor: '#ffffff', visibility: 'labelShow' });
        onLabelUpdate();
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to update label:', error);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    const confirmed = await confirm({
      message: 'Ви впевнені, що хочете видалити цю мітку?',
      title: 'Видалення мітки',
    });
    if (!confirmed) return;

    try {
      const response = await fetch('/api/gmail/labels/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          labelId
        }),
      });

      if (response.ok) {
        onLabelUpdate();
      }
    } catch (error) {
      console.error('Failed to delete label:', error);
    }
  };

  const startEditing = (label: Label) => {
    setEditingLabel(label);
    setFormData({
      name: label.name,
      backgroundColor: label.backgroundColor || '#4285f4',
      textColor: label.textColor || '#ffffff',
      visibility: label.labelListVisibility || 'labelShow'
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLabel) {
      handleUpdateLabel();
    } else {
      handleCreateLabel();
    }
  };

  return (
    <>
      {ConfirmDialog}
      <div className="relative">
      {/* Кнопка відкриття - показується тільки якщо не прихована */}
      {!hideButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Управління мітками
        </button>
      )}

      {/* Модальне вікно - показується тільки якщо не приховане */}
      {isOpen && !hideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLabel ? 'Редагувати мітку' : 'Створити нову мітку'}
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setEditingLabel(null);
                  setFormData({ name: '', backgroundColor: '#4285f4', textColor: '#ffffff', visibility: 'labelShow' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Назва мітки */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Назва мітки
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
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
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
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
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingLabel ? 'Оновити' : 'Створити'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setEditingLabel(null);
                    setFormData({ name: '', backgroundColor: '#4285f4', textColor: '#ffffff', visibility: 'labelShow' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Скасувати
                </button>
              </div>
            </form>

            {/* Список існуючих міток */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Існуючі мітки</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {labels.filter(label => !label.name.startsWith('CATEGORY_') && !label.name.startsWith('INBOX')).map((label) => (
                  <div key={label.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: label.backgroundColor || '#4285f4' }}
                      />
                      <span className="text-sm text-gray-700">{label.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditing(label)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Редагувати"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteLabel(label.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Видалити"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
