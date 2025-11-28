'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { X, FileText, Link, Copy, Users, Lock, Globe, Eye, MessageSquare, Edit, Mail, Calendar, User, Check, AlertCircle } from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { useConfirm } from '@/hooks/useConfirm';

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  template: string;
  content: string;
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

interface ShareLink {
  id: string;
  url: string;
  accessLevel: 'view' | 'comment' | 'edit';
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  accessCount: number;
  lastAccessed?: Date;
}

interface ShareInvitation {
  id: string;
  email: string;
  accessLevel: 'view' | 'comment' | 'edit';
  status: 'pending' | 'accepted' | 'expired';
  sentAt: Date;
  expiresAt: Date;
  message?: string;
}

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

const accessLevels = [
  { id: 'view', name: 'Перегляд', description: 'Тільки перегляд документа', icon: Eye, color: 'text-blue-600' },
  { id: 'comment', name: 'Коментарі', description: 'Можна коментувати', icon: MessageSquare, color: 'text-green-600' },
  { id: 'edit', name: 'Редагування', description: 'Повний доступ до редагування', icon: Edit, color: 'text-purple-600' }
];

const linkExpirationOptions = [
  { id: 'never', name: 'Ніколи', description: 'Посилання дійсне назавжди' },
  { id: '1hour', name: '1 година', description: 'Посилання дійсне 1 годину' },
  { id: '1day', name: '1 день', description: 'Посилання дійсне 1 день' },
  { id: '1week', name: '1 тиждень', description: 'Посилання дійсне 1 тиждень' },
  { id: '1month', name: '1 місяць', description: 'Посилання дійсне 1 місяць' },
  { id: 'custom', name: 'Власна дата', description: 'Встановити власну дату закінчення' }
];

export default function ShareDocumentModal({ isOpen, onClose, document }: ShareDocumentModalProps) {
  const { showSuccess, showError } = useAlert();
  const { confirm, ConfirmDialog } = useConfirm();
  const [activeTab, setActiveTab] = useState<'links' | 'invitations' | 'settings'>('links');
  const [newLinkAccessLevel, setNewLinkAccessLevel] = useState<'view' | 'comment' | 'edit'>('view');
  const [newLinkExpiration, setNewLinkExpiration] = useState('never');
  const [customExpirationDate, setCustomExpirationDate] = useState('');
  const [newInvitationEmail, setNewInvitationEmail] = useState('');
  const [newInvitationAccessLevel, setNewInvitationAccessLevel] = useState<'view' | 'comment' | 'edit'>('view');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Load share links and invitations from API
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [shareInvitations, setShareInvitations] = useState<ShareInvitation[]>([]);
  const [isLoadingShares, setIsLoadingShares] = useState(false);

  useEffect(() => {
    if (isOpen && document?.id) {
      loadShareData();
    }
  }, [isOpen, document?.id]);

  const loadShareData = async () => {
    if (!document?.id) return;
    
    setIsLoadingShares(true);
    try {
      const response = await fetch(`/api/documents/${document.id}/share`);
      if (response.ok) {
        const data = await response.json();
        setShareLinks(data.links || []);
        setShareInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error loading share data:', error);
    } finally {
      setIsLoadingShares(false);
    }
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

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'щойно';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} годин тому`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} днів тому`;
    return formatDate(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Очікує';
      case 'accepted': return 'Прийнято';
      case 'expired': return 'Застаріло';
      default: return 'Невідомо';
    }
  };

  const handleCreateLink = useCallback(async () => {
    setIsCreatingLink(true);
    try {
      // TODO: Інтеграція з API для створення посилань
      await new Promise(resolve => setTimeout(resolve, 1500)); // Імітація API запиту
      
      // Генеруємо унікальне посилання
      const linkId = Math.random().toString(36).substring(2, 15);
      const newLink: ShareLink = {
        id: `link_${Date.now()}`,
        url: `https://mind-mate.app/documents/shared/${linkId}`,
        accessLevel: newLinkAccessLevel,
        expiresAt: newLinkExpiration === 'custom' && customExpirationDate 
          ? new Date(customExpirationDate) 
          : newLinkExpiration === 'never' 
            ? undefined 
            : new Date(Date.now() + getExpirationTime(newLinkExpiration)),
        isActive: true,
        createdAt: new Date(),
        createdBy: 'current_user',
        accessCount: 0
      };

      // TODO: Додати нове посилання до стану
      showSuccess('Посилання для поширення створено!');
      
      // Скидаємо форму
      setNewLinkAccessLevel('view');
      setNewLinkExpiration('never');
      setCustomExpirationDate('');
    } catch (error) {
      console.error('Error creating link:', error);
      showError('Помилка при створенні посилання');
    } finally {
      setIsCreatingLink(false);
    }
  }, [newLinkAccessLevel, newLinkExpiration, customExpirationDate]);

  const getExpirationTime = (expiration: string): number => {
    switch (expiration) {
      case '1hour': return 60 * 60 * 1000;
      case '1day': return 24 * 60 * 60 * 1000;
      case '1week': return 7 * 24 * 60 * 60 * 1000;
      case '1month': return 30 * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  };

  const handleSendInvitation = useCallback(async () => {
    if (!newInvitationEmail.trim()) return;
    
    setIsSendingInvitation(true);
    try {
      // TODO: Інтеграція з API для відправки запрошень
      await new Promise(resolve => setTimeout(resolve, 2000)); // Імітація API запиту
      
      const newInvitation: ShareInvitation = {
        id: `inv_${Date.now()}`,
        email: newInvitationEmail.trim(),
        accessLevel: newInvitationAccessLevel,
        status: 'pending',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів
        message: invitationMessage.trim() || undefined
      };

      // TODO: Додати нове запрошення до стану
      showSuccess('Запрошення відправлено!');
      
      // Скидаємо форму
      setNewInvitationEmail('');
      setNewInvitationAccessLevel('view');
      setInvitationMessage('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      showError('Помилка при відправці запрошення');
    } finally {
      setIsSendingInvitation(false);
    }
  }, [newInvitationEmail, newInvitationAccessLevel, invitationMessage]);

  const handleCopyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(url);
      setTimeout(() => setCopiedLink(null), 2000);
      showSuccess('Посилання скопійовано в буфер обміну!');
    } catch (error) {
      console.error('Error copying link:', error);
      showError('Помилка при копіюванні посилання');
    }
  }, [showSuccess, showError]);

  const handleDeactivateLink = useCallback(async (linkId: string) => {
    const confirmed = await confirm({
      message: 'Ви впевнені, що хочете деактивувати це посилання?',
      title: 'Деактивація посилання',
    });
    if (confirmed) {
      // TODO: Інтеграція з API для деактивації посилань
      showSuccess('Посилання деактивовано!');
    }
  }, [confirm, showSuccess]);

  const handleResendInvitation = useCallback(async (invitationId: string) => {
    // TODO: Інтеграція з API для повторної відправки запрошень
    showSuccess('Запрошення повторно відправлено!');
  }, [showSuccess]);

  const handleCancelInvitation = useCallback(async (invitationId: string) => {
    const confirmed = await confirm({
      message: 'Ви впевнені, що хочете скасувати це запрошення?',
      title: 'Скасування запрошення',
    });
    if (confirmed) {
      // TODO: Інтеграція з API для скасування запрошень
      showSuccess('Запрошення скасовано!');
    }
  }, [confirm, showSuccess]);

  if (!isOpen || !document) return null;

  return (
    <>
      {ConfirmDialog}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Link className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Поширити документ</h2>
              <p className="text-sm text-gray-500">{document.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'links', name: 'Посилання', icon: Link },
              { id: 'invitations', name: 'Запрошення', icon: Mail },
              { id: 'settings', name: 'Налаштування', icon: Lock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Посилання для поширення</h3>
                <button
                  onClick={handleCreateLink}
                  disabled={isCreatingLink}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Link className="w-4 h-4" />
                  {isCreatingLink ? 'Створюємо...' : 'Створити посилання'}
                </button>
              </div>

              {/* Форма створення посилання */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Налаштування нового посилання</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Рівень доступу
                    </label>
                    <select
                      value={newLinkAccessLevel}
                      onChange={(e) => setNewLinkAccessLevel(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {accessLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Термін дії
                    </label>
                    <select
                      value={newLinkExpiration}
                      onChange={(e) => setNewLinkExpiration(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {linkExpirationOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {newLinkExpiration === 'custom' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дата закінчення
                    </label>
                    <input
                      type="datetime-local"
                      value={customExpirationDate}
                      onChange={(e) => setCustomExpirationDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Список поширених посилань */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Активні посилання</h4>
                {shareLinks.map((link) => (
                  <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {link.accessLevel === 'view' ? 'Перегляд' : 
                           link.accessLevel === 'comment' ? 'Коментарі' : 'Редагування'}
                        </div>
                        {link.expiresAt && (
                          <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            Закінчується {formatDate(link.expiresAt)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyLink(link.url)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Копіювати посилання"
                        >
                          {copiedLink === link.url ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeactivateLink(link.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Деактивувати посилання"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded border mb-3">
                      <div className="font-mono text-sm text-gray-700 break-all">{link.url}</div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Створено {formatRelativeDate(link.createdAt)}</span>
                      <span>Переглядів: {link.accessCount}</span>
                      {link.lastAccessed && (
                        <span>Останній доступ: {formatRelativeDate(link.lastAccessed)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invitations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Запрошення користувачів</h3>
                <button
                  onClick={handleSendInvitation}
                  disabled={isSendingInvitation || !newInvitationEmail.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {isSendingInvitation ? 'Відправляємо...' : 'Відправити запрошення'}
                </button>
              </div>

              {/* Форма відправки запрошення */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Нове запрошення</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email адреса *
                    </label>
                    <input
                      type="email"
                      value={newInvitationEmail}
                      onChange={(e) => setNewInvitationEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Рівень доступу
                    </label>
                    <select
                      value={newInvitationAccessLevel}
                      onChange={(e) => setNewInvitationAccessLevel(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {accessLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Повідомлення (необов&apos;язково)
                  </label>
                  <textarea
                    value={invitationMessage}
                    onChange={(e) => setInvitationMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Додайте особисте повідомлення до запрошення..."
                  />
                </div>
              </div>

              {/* Список запрошень */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Відправлені запрошення</h4>
                {shareInvitations.map((invitation) => (
                  <div key={invitation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {invitation.accessLevel === 'view' ? 'Перегляд' : 
                           invitation.accessLevel === 'comment' ? 'Коментарі' : 'Редагування'}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(invitation.status)}`}>
                          {getStatusText(invitation.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {invitation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResendInvitation(invitation.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Повторно відправити"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Скасувати запрошення"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="font-medium text-gray-900">{invitation.email}</div>
                      {invitation.message && (
                        <div className="text-sm text-gray-600 mt-1">{invitation.message}</div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Відправлено {formatRelativeDate(invitation.sentAt)}</span>
                      <span>Закінчується {formatDate(invitation.expiresAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Налаштування поширення</h3>
              
              {/* Поточні налаштування */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Поточні налаштування</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Видимість документа</h5>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {(() => {
                        const Icon = document.visibility === 'private' ? Lock : 
                                    document.visibility === 'shared' ? Users : Globe;
                        return <Icon className="w-5 h-5 text-gray-600" />;
                      })()}
                      <div>
                        <div className="font-medium text-gray-900">
                          {document.visibility === 'private' ? 'Приватний' : 
                           document.visibility === 'shared' ? 'Поширений' : 'Публічний'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {document.visibility === 'private' && 'Тільки ви можете бачити'}
                          {document.visibility === 'shared' && 'Доступ для обранних користувачів'}
                          {document.visibility === 'public' && 'Доступ для всіх'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Рівень доступу за замовчуванням</h5>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900">
                        {document.accessLevel === 'view' ? 'Перегляд' : 
                         document.accessLevel === 'comment' ? 'Коментарі' : 'Редагування'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {document.accessLevel === 'view' && 'Тільки перегляд документа'}
                        {document.accessLevel === 'comment' && 'Можна коментувати'}
                        {document.accessLevel === 'edit' && 'Повний доступ до редагування'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Статистика поширення */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Статистика поширення</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{shareLinks.length}</div>
                    <div className="text-sm text-blue-600">Активних посилань</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{shareInvitations.length}</div>
                    <div className="text-sm text-green-600">Запрошень</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {shareInvitations.filter(inv => inv.status === 'accepted').length}
                    </div>
                    <div className="text-sm text-purple-600">Прийнятих</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {shareLinks.reduce((sum, link) => sum + link.accessCount, 0)}
                    </div>
                    <div className="text-sm text-orange-600">Всього переглядів</div>
                  </div>
                </div>
              </div>

              {/* Рекомендації */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Рекомендації безпеки</h4>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800">Встановлюйте термін дії для посилань</div>
                      <div className="text-sm text-yellow-700">Посилання без терміну дії можуть залишатися активними назавжди</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">Використовуйте мінімальні права доступу</div>
                      <div className="text-sm text-blue-700">Надавайте тільки ті права, які дійсно потрібні користувачу</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Users className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-800">Регулярно переглядайте активні посилання</div>
                      <div className="text-sm text-green-700">Деактивуйте посилання, які більше не потрібні</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
