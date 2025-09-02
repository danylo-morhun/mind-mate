'use client';

import React from 'react';
import { FileText, BookOpen, FileSpreadsheet, Presentation, GraduationCap, TrendingUp, Clock, Zap } from 'lucide-react';

interface DocumentsStats {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  documentsByCategory: Record<string, number>;
  aiGeneratedDocuments: number;
  documentsThisPeriod: number;
  averageDocumentLength: number;
  mostActiveDay: string;
  documentsTrend: Array<{ day: string; count: number }>;
}

interface DocumentsStatsCardProps {
  stats: DocumentsStats;
}

const documentTypeIcons = {
  lecture: BookOpen,
  methodology: FileText,
  lab: FileSpreadsheet,
  course: Presentation,
  thesis: GraduationCap
};

const documentTypeNames = {
  lecture: 'Лекції',
  methodology: 'Методички',
  lab: 'Лабораторні',
  course: 'Курсові',
  thesis: 'Дипломи'
};

export default function DocumentsStatsCard({ stats }: DocumentsStatsCardProps) {
  const totalAIUsage = ((stats.aiGeneratedDocuments / stats.totalDocuments) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">📚 Документи та навчальні матеріали</h3>
          <p className="text-sm text-gray-500">Статистика створення та управління документами</p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Основні метрики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalDocuments}</div>
          <div className="text-sm text-gray-600">Всього документів</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.documentsThisPeriod}</div>
          <div className="text-sm text-gray-600">За цей період</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.aiGeneratedDocuments}</div>
          <div className="text-sm text-gray-600">З AI</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{totalAIUsage}%</div>
          <div className="text-sm text-gray-600">AI використання</div>
        </div>
      </div>

      {/* Розподіл по типах документів */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Розподіл по типах
        </h4>
        <div className="space-y-2">
          {Object.entries(stats.documentsByType).map(([type, count]) => {
            const Icon = documentTypeIcons[type as keyof typeof documentTypeIcons] || FileText;
            const percentage = ((count / stats.totalDocuments) * 100).toFixed(1);
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {documentTypeNames[type as keyof typeof documentTypeNames] || type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Тренд активності */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-600" />
          Активність по днях
        </h4>
        <div className="flex items-end gap-1 h-20">
          {stats.documentsTrend.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-100 rounded-t transition-all duration-300 hover:bg-blue-200"
                style={{ height: `${(item.count / Math.max(...stats.documentsTrend.map(d => d.count))) * 60}px` }}
              />
              <span className="text-xs text-gray-600 mt-1">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Додаткова інформація */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-600" />
          <span className="text-gray-600">Найактивніший день:</span>
          <span className="font-medium text-gray-900">{stats.mostActiveDay}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">Середня довжина:</span>
          <span className="font-medium text-gray-900">{stats.averageDocumentLength} слів</span>
        </div>
      </div>
    </div>
  );
}
