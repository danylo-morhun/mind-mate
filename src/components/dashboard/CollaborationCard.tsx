'use client';

import React from 'react';
import { Users, FolderOpen, MessageSquare, TrendingUp, CheckCircle, AlertCircle, Pause, Mail, FileText } from 'lucide-react';

interface CollaborationStats {
  activeProjects: number;
  teamMembers: number;
  sharedDocuments: number;
  collaborationHours: number;
  topCollaborators: Array<{ name: string; projects: number; hours: number }>;
  projectStatus: Record<string, string>;
  communicationChannels: Record<string, number>;
}

interface CollaborationCardProps {
  stats: CollaborationStats;
}

const getStatusIcon = (status: string) => {
  const normalizedStatus = status.toLowerCase().trim();
  if (normalizedStatus.includes('завершено')) {
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  }
  if (normalizedStatus.includes('в процесі') || normalizedStatus.includes('процесі')) {
    return <TrendingUp className="w-4 h-4 text-blue-600" />;
  }
  if (normalizedStatus.includes('перевірка') || normalizedStatus.includes('перевірки')) {
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  }
  if (normalizedStatus.includes('планування')) {
    return <Pause className="w-4 h-4 text-gray-600" />;
  }
  return <AlertCircle className="w-4 h-4 text-gray-600" />;
};

const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase().trim();
  if (normalizedStatus.includes('завершено')) {
    return 'text-green-600 bg-green-100';
  }
  if (normalizedStatus.includes('в процесі') || normalizedStatus.includes('процесі')) {
    return 'text-blue-600 bg-blue-100';
  }
  if (normalizedStatus.includes('перевірка') || normalizedStatus.includes('перевірки')) {
    return 'text-yellow-600 bg-yellow-100';
  }
  if (normalizedStatus.includes('планування')) {
    return 'text-gray-600 bg-gray-100';
  }
  return 'text-gray-600 bg-gray-100';
};

export default function CollaborationCard({ stats }: CollaborationCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg border border-purple-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🤝 Співпраця та командна робота</h3>
          <p className="text-base text-gray-600">Метрики співпраці та комунікації команди</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
          <Users className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Основні метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
            {stats.activeProjects}
          </div>
          <div className="text-sm font-medium text-gray-700">Активних проектів</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-2">
            {stats.teamMembers}
          </div>
          <div className="text-sm font-medium text-gray-700">Учасників команди</div>
        </div>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mb-2">
            {stats.sharedDocuments}
          </div>
          <div className="text-sm font-medium text-gray-700">Спільних документів</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Статус проектів */}
        <div className="lg:col-span-1">
          <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            Статус проектів
          </h4>
          <div className="space-y-3">
            {Object.entries(stats.projectStatus).map(([project, status]) => (
              <div key={project} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium text-gray-800">{project}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Топ співробітники */}
        <div className="lg:col-span-1">
          <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Топ співробітники
          </h4>
          <div className="space-y-3">
            {stats.topCollaborators.map((collaborator, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">{collaborator.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-semibold">{collaborator.projects} проектів</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Канали комунікації */}
        <div className="lg:col-span-1">
          <h4 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Канали комунікації
          </h4>
          <div className="space-y-4">
            {Object.entries(stats.communicationChannels).map(([channel, percentage]) => (
              <div key={channel} className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {channel === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                    {channel === 'documents' && <FileText className="w-5 h-5 text-green-600" />}
                    {channel === 'meetings' && <Users className="w-5 h-5 text-purple-600" />}
                    <span className="text-sm font-medium text-gray-800 capitalize">
                      {channel === 'email' ? 'Email' :
                       channel === 'documents' ? 'Документи' :
                       channel === 'meetings' ? 'Зустрічі' : channel}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Додаткова інформація */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Активні команди</span>
              <span className="text-sm font-semibold text-gray-900">3 команди</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
