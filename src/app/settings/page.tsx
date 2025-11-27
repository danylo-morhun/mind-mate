'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Shield, Database, Globe, Mail, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Tab = 'profile' | 'security' | 'integrations';

interface Profile {
  name: string;
  email: string;
  image?: string;
  role: 'teacher' | 'senior_teacher' | 'associate_professor' | 'professor';
  department: string;
}

interface Preferences {
  security?: {
    autoLogout?: boolean;
    autoLogoutMinutes?: number;
  };
}

interface Integrations {
  gmail: { connected: boolean; active: boolean };
  drive: { connected: boolean; active: boolean };
  sheets: { connected: boolean; active: boolean };
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingIntegrations, setIsRefreshingIntegrations] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    role: 'teacher',
    department: '',
  });

  // Preferences state
  const [preferences, setPreferences] = useState<Preferences>({
    security: {
      autoLogout: true,
      autoLogoutMinutes: 30,
    },
  });

  // Integrations state
  const [integrations, setIntegrations] = useState<Integrations>({
    gmail: { connected: false, active: false },
    drive: { connected: false, active: false },
    sheets: { connected: false, active: false },
  });

  // Load initial data
  useEffect(() => {
    if (session !== undefined) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Load profile
      const profileResponse = await fetch('/api/settings/profile');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.profile);
      } else if (session?.user) {
        // Fallback to session data
        setProfile({
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || undefined,
          role: 'teacher',
          department: '',
        });
      }

      // Load preferences
      const preferencesResponse = await fetch('/api/settings/preferences');
      if (preferencesResponse.ok) {
        const prefsData = await preferencesResponse.json();
        if (prefsData.preferences) {
          setPreferences({
            security: {
              autoLogout: prefsData.preferences.security?.autoLogout !== false,
              autoLogoutMinutes: prefsData.preferences.security?.autoLogoutMinutes || 30,
            },
          });
        }
      }

      // Load integrations
      const integrationsResponse = await fetch('/api/settings/integrations');
      if (integrationsResponse.ok) {
        const integrationsData = await integrationsResponse.json();
        setIntegrations(integrationsData.integrations);
      } else if (integrationsResponse.status === 401) {
        // User not authenticated, set all to false
        setIntegrations({
          gmail: { connected: false, active: false },
          drive: { connected: false, active: false },
          sheets: { connected: false, active: false },
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // On error, don't show integrations as connected
      setIntegrations({
        gmail: { connected: false, active: false },
        drive: { connected: false, active: false },
        sheets: { connected: false, active: false },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshIntegrations = async () => {
    setIsRefreshingIntegrations(true);
    try {
      const integrationsResponse = await fetch('/api/settings/integrations');
      if (integrationsResponse.ok) {
        const integrationsData = await integrationsResponse.json();
        setIntegrations(integrationsData.integrations);
        setSaveMessage({ type: 'success', text: 'Статус інтеграцій оновлено' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: 'Помилка оновлення статусу інтеграцій' });
      }
    } catch (error) {
      console.error('Error refreshing integrations:', error);
      setSaveMessage({ type: 'error', text: 'Помилка оновлення статусу інтеграцій' });
    } finally {
      setIsRefreshingIntegrations(false);
    }
  };

  const saveProfile = async () => {
    // Basic validation
    if (!profile.name.trim()) {
      setSaveMessage({ type: 'error', text: 'Ім\'я не може бути порожнім' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name.trim(),
          role: profile.role,
          department: profile.department.trim(),
        }),
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Профіль успішно оновлено' });
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSaveMessage({ 
          type: 'error', 
          text: errorData.error || 'Помилка збереження профілю' 
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({ type: 'error', text: 'Помилка збереження профілю' });
    } finally {
      setIsSaving(false);
    }
  };

  const savePreferences = async (showMessage = true) => {
    setIsSaving(true);
    if (showMessage) {
      setSaveMessage(null);
    }
    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            security: preferences.security,
          },
        }),
      });

      if (response.ok) {
        if (showMessage) {
          setSaveMessage({ type: 'success', text: 'Налаштування збережено' });
          setTimeout(() => setSaveMessage(null), 3000);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (showMessage) {
          setSaveMessage({ 
            type: 'error', 
            text: errorData.error || 'Помилка збереження налаштувань' 
          });
        }
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      if (showMessage) {
        setSaveMessage({ type: 'error', text: 'Помилка збереження налаштувань' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSecurity = (key: 'autoLogout') => {
    const newPreferences = {
      ...preferences,
      security: {
        ...preferences.security,
        [key]: !preferences.security?.[key],
      },
    };
    setPreferences(newPreferences);
    // Save silently for toggles (no success message)
    savePreferences(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Профіль', icon: User },
    { id: 'security', label: 'Безпека', icon: Shield },
    { id: 'integrations', label: 'Інтеграції', icon: Globe },
  ];

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Потрібна авторизація</h2>
          <p className="text-gray-600">Будь ласка, увійдіть в систему для доступу до налаштувань</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Налаштування</h1>
          <p className="text-gray-600 mt-2">Конфігурація системи та управління користувачами</p>
        </div>

        {/* Навігація налаштувань */}
        <div className="bg-white rounded-lg shadow mb-8">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Save message */}
        {saveMessage && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              saveMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Профіль користувача
            </h3>

            {profile.image && (
              <div className="mb-6">
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ім'я
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email не можна змінити</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Посада
                </label>
                <select
                  value={profile.role}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      role: e.target.value as Profile['role'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="teacher">Викладач</option>
                  <option value="senior_teacher">Старший викладач</option>
                  <option value="associate_professor">Доцент</option>
                  <option value="professor">Професор</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Кафедра
                </label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Назва кафедри"
                />
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={saveProfile}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Збереження...
                  </>
                ) : (
                  'Зберегти зміни'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Безпека
              </h3>
              {preferences.security?.autoLogout && (
                <div className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Автовихід активний
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Автоматичне виходження</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Автоматичний вихід після періоду неактивності
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSecurity('autoLogout')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.security?.autoLogout ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.security?.autoLogout ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {preferences.security?.autoLogout && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Час неактивності (хвилини)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={preferences.security?.autoLogoutMinutes || 30}
                      onChange={(e) => {
                        const minutes = Math.max(5, Math.min(480, parseInt(e.target.value) || 30));
                        const newPreferences = {
                          ...preferences,
                          security: {
                            ...preferences.security,
                            autoLogoutMinutes: minutes,
                          },
                        };
                        setPreferences(newPreferences);
                      }}
                      onBlur={() => savePreferences(false)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Від 5 до 480 хвилин</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Інтеграції
              </h3>
              <Button
                onClick={refreshIntegrations}
                variant="outline"
                size="sm"
                disabled={isRefreshingIntegrations}
                className="flex items-center"
              >
                {isRefreshingIntegrations ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Оновлення...
                  </>
                ) : (
                  'Оновити статус'
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Gmail</p>
                    <p className="text-sm text-gray-500">
                      {integrations.gmail.connected ? 'Підключено' : 'Не підключено'}
                    </p>
                  </div>
                </div>
                {integrations.gmail.active ? (
                  <span className="text-sm text-green-600 font-medium">Активна</span>
                ) : (
                  <span className="text-sm text-gray-500 font-medium">Неактивна</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Google Drive</p>
                    <p className="text-sm text-gray-500">
                      {integrations.drive.connected ? 'Підключено' : 'Не підключено'}
                    </p>
                  </div>
                </div>
                {integrations.drive.active ? (
                  <span className="text-sm text-green-600 font-medium">Активна</span>
                ) : (
                  <span className="text-sm text-gray-500 font-medium">Неактивна</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Google Sheets</p>
                    <p className="text-sm text-gray-500">
                      {integrations.sheets.connected ? 'Підключено' : 'Не підключено'}
                    </p>
                  </div>
                </div>
                {integrations.sheets.active ? (
                  <span className="text-sm text-green-600 font-medium">Активна</span>
                ) : (
                  <span className="text-sm text-gray-500 font-medium">Неактивна</span>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Примітка:</strong> Інтеграції налаштовуються автоматично при вході через Google.
                Якщо інтеграція не працює, спробуйте вийти та увійти знову.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
