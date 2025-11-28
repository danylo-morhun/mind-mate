'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Mail, FileText, GraduationCap, Bot, Clock, Star, AlertTriangle } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import CategoryChart from '@/components/dashboard/CategoryChart';
import DocumentsStatsCard from '@/components/dashboard/DocumentsStatsCard';
import CollaborationCard from '@/components/dashboard/CollaborationCard';
import { StatsCardSkeleton, ChartSkeleton, CardSkeleton } from '@/components/dashboard/SkeletonLoader';

export default function DashboardPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [error, setError] = useState<string | null>(null);

  // Завантаження даних аналітики
  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/dashboard?period=${period}`);
      const data = await response.json();
      
      if (!response.ok) {
        // Використовуємо повідомлення з сервера, якщо воно є
        const errorMessage = data?.error || `HTTP ${response.status}: Failed to fetch analytics data`;
        throw new Error(errorMessage);
      }
      
      if (!data.success || !data.data) {
        throw new Error('Invalid response format from server');
      }
      
      // Валідуємо наявність основних полів
      if (!data.data.gmail || !data.data.ai || !data.data.documents) {
        console.warn('Dashboard data missing some fields:', data.data);
      }
      
      setAnalyticsData(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Unknown error occurred while fetching analytics data';
      
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
      
      // Логуємо детальну інформацію для дебагу
      if (err instanceof Error && err.stack) {
        console.error('Error stack:', err.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalyticsData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок та фільтри */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎓 Університетський дашборд</h1>
              <p className="text-gray-600 mt-2">Комплексна аналітика для викладачів: email'и, документи, AI та співпраця</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Фільтр періоду */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">Тиждень</option>
                <option value="month">Місяць</option>
                <option value="year">Рік</option>
              </select>
              
              {/* Кнопка оновлення */}
              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Оновлення...' : '🔄 Оновити'}
              </button>
            </div>
          </div>
        </div>

        {/* Статистичні картки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Листи оброблено"
                value={analyticsData?.gmail?.totalEmails || 0}
                icon={Mail}
                color="blue"
                subtitle={`за ${period === 'week' ? 'тиждень' : period === 'month' ? 'місяць' : 'рік'}`}
              />
              
              <StatsCard
                title="AI відповіді згенеровано"
                value={analyticsData?.ai?.totalRepliesGenerated || 0}
                icon={Bot}
                color="green"
                subtitle={`успішність ${analyticsData?.ai?.successRate.toFixed(2) || 0}%`}
              />
              
              <StatsCard
                title="Непрочитані листи"
                value={analyticsData?.gmail?.unreadEmails || 0}
                icon={AlertTriangle}
                color="orange"
                subtitle="потребують уваги"
              />
              
              <StatsCard
                title="Важливі листи"
                value={analyticsData?.gmail?.starredEmails || 0}
                icon={Star}
                color="purple"
                subtitle="з зіркою"
              />
            </>
          )}
        </div>

        {/* Графіки та діаграми */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <ActivityChart
                data={analyticsData?.gmail?.activityByDay || []}
                title="Активність по днях"
                loading={false}
              />

              <CategoryChart
                data={analyticsData?.gmail?.categories || {}}
                title="Розподіл по категоріях"
                loading={false}
              />
            </>
          )}
        </div>

        {/* Нові віджети для університетського контексту */}
        {loading ? (
          <>
            <div className="mt-8">
              <CardSkeleton />
            </div>
            <div className="mt-8">
              <CardSkeleton />
            </div>
          </>
        ) : analyticsData ? (
          <>
            {/* Документи та AI статистика */}
            <div className="mt-8">
              <DocumentsStatsCard stats={analyticsData.documents || {}} />
            </div>

            {/* Співпраця та командна робота - на всю ширину */}
            <div className="mt-8">
              <CollaborationCard stats={analyticsData.collaboration || {}} />
            </div>
          </>
        ) : null}

        {/* Додаткова статистика AI */}
        {analyticsData?.ai && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Асистент - Детальна статистика</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Типи відповідей</h4>
                <div className="space-y-2">
                  {Object.entries(analyticsData.ai.repliesByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                      <span className="font-medium text-gray-900">{String(count)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Тон відповідей</h4>
                <div className="space-y-2">
                  {Object.entries(analyticsData.ai.repliesByTone).map(([tone, count]) => (
                    <div key={tone} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{tone}</span>
                      <span className="font-medium text-gray-900">{String(count)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Продуктивність</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Середній час генерації</span>
                    <span className="font-medium text-gray-900">{analyticsData.ai.averageGenerationTime.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Шаблони використано</span>
                    <span className="font-medium text-gray-900">{analyticsData.ai.templatesUsed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Тільки AI</span>
                    <span className="font-medium text-gray-900">{analyticsData.ai.aiOnlyGeneration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Обробка помилок */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Помилка завантаження даних</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={refreshData}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Спробувати знову
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Повідомлення про розробку */}
        {!loading && !analyticsData && !error && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Дашборд готовий!</h3>
                <p className="text-blue-700 mt-1">
                  Дашборд аналітики успішно створено з реальними даними Gmail та AI асистента.
                  Використовуйте фільтри періоду для аналізу різних часових проміжків.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
