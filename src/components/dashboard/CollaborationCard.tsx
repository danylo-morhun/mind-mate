'use client';

import React from 'react';
import { Users, FolderOpen, Clock, MessageSquare, TrendingUp, CheckCircle, AlertCircle, Pause, Mail, FileText } from 'lucide-react';

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
  switch (status.toLowerCase()) {
    case 'завершено':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'в процесі':
      return <TrendingUp className="w-4 h-4 text-blue-600" />;
    case 'очікує перевірки':
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    case 'планування':
      return <Pause className="w-4 h-4 text-gray-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'завершено':
      return 'text-green-600 bg-green-100';
    case 'в процесі':
      return 'text-blue-600 bg-blue-100';
    case 'очікує перевірки':
      return 'text-yellow-600 bg-yellow-100';
    case 'планування':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export default function CollaborationCard({ stats }: CollaborationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">🤝 Співпраця та командна робота</h3>
          <p className="text-sm text-gray-500">Метрики співпраці та комунікації</p>
        </div>
        <div className="p-3 bg-purple-100 rounded-lg">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      {/* Основні метрики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.activeProjects}</div>
          <div className="text-sm text-gray-600">Активних проектів</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.teamMembers}</div>
          <div className="text-sm text-gray-600">Учасників команди</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.sharedDocuments}</div>
          <div className="text-sm text-gray-600">Спільних документів</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.collaborationHours}</div>
          <div className="text-sm text-gray-600">Годин співпраці</div>
        </div>
      </div>

      {/* Статус проектів */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-blue-600" />
          Статус проектів
        </h4>
        <div className="space-y-2">
          {Object.entries(stats.projectStatus).map(([project, status]) => (
            <div key={project} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <span className="text-sm text-gray-700">{project}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Топ співробітники */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-green-600" />
          Топ співробітники
        </h4>
        <div className="space-y-2">
          {stats.topCollaborators.map((collaborator, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                </div>
                <span className="text-sm text-gray-700">{collaborator.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{collaborator.projects} проектів</span>
                <span>{collaborator.hours} год</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Канали комунікації */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          Канали комунікації
        </h4>
        <div className="space-y-2">
          {Object.entries(stats.communicationChannels).map(([channel, percentage]) => (
            <div key={channel} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {channel === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                {channel === 'documents' && <FileText className="w-4 h-4 text-green-600" />}
                {channel === 'meetings' && <Users className="w-4 h-4 text-purple-600" />}
                <span className="text-sm text-gray-700 capitalize">
                  {channel === 'email' ? 'Email' :
                   channel === 'documents' ? 'Документи' :
                   channel === 'meetings' ? 'Зустрічі' : channel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Додаткова інформація */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-gray-600">Середній час проекту:</span>
          <span className="font-medium text-gray-900">2.5 тижні</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">Команди:</span>
          <span className="font-medium text-gray-900">3 активні</span>
        </div>
      </div>
    </div>
  );
}
