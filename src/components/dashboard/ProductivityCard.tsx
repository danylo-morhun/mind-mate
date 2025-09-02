'use client';

import React from 'react';
import { TrendingUp, Clock, Target, Zap, BarChart3, Calendar, CheckCircle, Users, Mail, FileText } from 'lucide-react';

interface ProductivityStats {
  totalWorkHours: number;
  emailsPerHour: number;
  documentsPerWeek: number;
  aiTimeSaved: number;
  productivityScore: number;
  topProductiveHours: Array<{ hour: string; score: number }>;
  workloadDistribution: Record<string, number>;
  weeklyGoals: Record<string, number>;
}

interface ProductivityCardProps {
  stats: ProductivityStats;
}

export default function ProductivityCard({ stats }: ProductivityCardProps) {
  const getProductivityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProductivityText = (score: number) => {
    if (score >= 90) return 'Відмінно';
    if (score >= 80) return 'Добре';
    if (score >= 70) return 'Задовільно';
    return 'Потребує покращення';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">🎯 Академічна продуктивність</h3>
          <p className="text-sm text-gray-500">Метрики ефективності та робочого процесу</p>
        </div>
        <div className="p-3 bg-green-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
      </div>

      {/* Основний показник продуктивності */}
      <div className="mb-6">
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
          <div className="text-4xl font-bold text-gray-900 mb-2">{stats.productivityScore}%</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getProductivityColor(stats.productivityScore)}`}>
            {getProductivityText(stats.productivityScore)}
          </div>
          <p className="text-sm text-gray-600 mt-2">Загальна оцінка продуктивності</p>
        </div>
      </div>

      {/* Ключові метрики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalWorkHours}</div>
          <div className="text-sm text-gray-600">Робочих годин</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.emailsPerHour}</div>
          <div className="text-sm text-gray-600">Email'ів/годину</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.documentsPerWeek}</div>
          <div className="text-sm text-gray-600">Документів/тиждень</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.aiTimeSaved}</div>
          <div className="text-sm text-gray-600">Годин зекономлено</div>
        </div>
      </div>

      {/* Розподіл робочого навантаження */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          Розподіл робочого навантаження
        </h4>
        <div className="space-y-3">
          {Object.entries(stats.workloadDistribution).map(([task, percentage]) => (
            <div key={task} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {task === 'emails' && <Mail className="w-4 h-4 text-blue-600" />}
                {task === 'documents' && <FileText className="w-4 h-4 text-green-600" />}
                {task === 'collaboration' && <Users className="w-4 h-4 text-purple-600" />}
                {task === 'planning' && <Calendar className="w-4 h-4 text-orange-600" />}
                <span className="text-sm text-gray-700 capitalize">
                  {task === 'emails' ? 'Email\'и' : 
                   task === 'documents' ? 'Документи' :
                   task === 'collaboration' ? 'Співпраця' :
                   task === 'planning' ? 'Планування' : task}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Найпродуктивніші години */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-600" />
          Найпродуктивніші години
        </h4>
        <div className="flex items-end gap-1 h-20">
          {stats.topProductiveHours.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-green-100 rounded-t transition-all duration-300 hover:bg-green-200"
                style={{ height: `${(item.score / 100) * 60}px` }}
              />
              <span className="text-xs text-gray-600 mt-1">{item.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Тижневі цілі */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-600" />
          Тижневі цілі
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(stats.weeklyGoals).map(([goal, target]) => (
            <div key={goal} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700 capitalize">
                {goal === 'emailsProcessed' ? 'Email\'и оброблено' :
                 goal === 'documentsCreated' ? 'Документів створено' :
                 goal === 'aiTasksCompleted' ? 'AI завдань' :
                 goal === 'collaborationHours' ? 'Годин співпраці' : goal}
              </span>
              <span className="text-sm font-medium text-gray-900">{target}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
