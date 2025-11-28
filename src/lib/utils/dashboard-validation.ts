/**
 * Утиліти для валідації даних дашборду
 */

export interface ValidatedGmailStats {
  totalEmails: number;
  unreadEmails: number;
  starredEmails: number;
  importantEmails: number;
  categories: Record<string, number>;
  activityByDay: Array<{ date: string; count: number; dayName: string }>;
  topSenders: Array<{ sender: string; count: number }>;
  averageResponseTime: number;
}

export interface ValidatedAIStats {
  totalRepliesGenerated: number;
  repliesByType: Record<string, number>;
  repliesByTone: Record<string, number>;
  averageGenerationTime: number;
  templatesUsed: number;
  aiOnlyGeneration: number;
  successRate: number;
}

export interface ValidatedDocumentsStats {
  totalDocuments: number;
  documentsByType: Record<string, number>;
  documentsByCategory: Record<string, number>;
  aiGeneratedDocuments: number;
  documentsThisPeriod: number;
  averageDocumentLength: number;
  mostActiveDay: string;
  documentsTrend: Array<{ day: string; count: number }>;
}

export interface ValidatedProductivityStats {
  totalWorkHours: number;
  emailsPerHour: number;
  documentsPerWeek: number;
  aiTimeSaved: number;
  productivityScore: number;
  topProductiveHours: Array<{ hour: string; score: number }>;
  workloadDistribution: Record<string, number>;
  weeklyGoals: Record<string, number>;
}

export interface ValidatedCollaborationStats {
  activeProjects: number;
  teamMembers: number;
  sharedDocuments: number;
  collaborationHours: number;
  topCollaborators: Array<{ name: string; projects: number; hours: number }>;
  projectStatus: Record<string, string>;
  communicationChannels: Record<string, number>;
}

/**
 * Валідує Gmail статистику
 */
export function validateGmailStats(data: any): ValidatedGmailStats {
  return {
    totalEmails: Number.isFinite(data?.totalEmails) ? Math.max(0, data.totalEmails) : 0,
    unreadEmails: Number.isFinite(data?.unreadEmails) ? Math.max(0, data.unreadEmails) : 0,
    starredEmails: Number.isFinite(data?.starredEmails) ? Math.max(0, data.starredEmails) : 0,
    importantEmails: Number.isFinite(data?.importantEmails) ? Math.max(0, data.importantEmails) : 0,
    categories: typeof data?.categories === 'object' && data.categories !== null 
      ? data.categories 
      : {},
    activityByDay: Array.isArray(data?.activityByDay) 
      ? data.activityByDay.filter((item: any) => 
          item && typeof item.date === 'string' && Number.isFinite(item.count)
        )
      : [],
    topSenders: Array.isArray(data?.topSenders)
      ? data.topSenders.filter((item: any) =>
          item && typeof item.sender === 'string' && Number.isFinite(item.count)
        )
      : [],
    averageResponseTime: Number.isFinite(data?.averageResponseTime) 
      ? Math.max(0, data.averageResponseTime) 
      : 0
  };
}

/**
 * Валідує AI статистику
 */
export function validateAIStats(data: any): ValidatedAIStats {
  return {
    totalRepliesGenerated: Number.isFinite(data?.totalRepliesGenerated) 
      ? Math.max(0, data.totalRepliesGenerated) 
      : 0,
    repliesByType: typeof data?.repliesByType === 'object' && data.repliesByType !== null
      ? data.repliesByType
      : {},
    repliesByTone: typeof data?.repliesByTone === 'object' && data.repliesByTone !== null
      ? data.repliesByTone
      : {},
    averageGenerationTime: Number.isFinite(data?.averageGenerationTime)
      ? Math.max(0, data.averageGenerationTime)
      : 0,
    templatesUsed: Number.isFinite(data?.templatesUsed) ? Math.max(0, data.templatesUsed) : 0,
    aiOnlyGeneration: Number.isFinite(data?.aiOnlyGeneration) 
      ? Math.max(0, data.aiOnlyGeneration) 
      : 0,
    successRate: Number.isFinite(data?.successRate) 
      ? Math.min(100, Math.max(0, data.successRate)) 
      : 100
  };
}

/**
 * Валідує статистику документів
 */
export function validateDocumentsStats(data: any): ValidatedDocumentsStats {
  return {
    totalDocuments: Number.isFinite(data?.totalDocuments) 
      ? Math.max(0, data.totalDocuments) 
      : 0,
    documentsByType: typeof data?.documentsByType === 'object' && data.documentsByType !== null
      ? data.documentsByType
      : {},
    documentsByCategory: typeof data?.documentsByCategory === 'object' && data.documentsByCategory !== null
      ? data.documentsByCategory
      : {},
    aiGeneratedDocuments: Number.isFinite(data?.aiGeneratedDocuments)
      ? Math.max(0, data.aiGeneratedDocuments)
      : 0,
    documentsThisPeriod: Number.isFinite(data?.documentsThisPeriod)
      ? Math.max(0, data.documentsThisPeriod)
      : 0,
    averageDocumentLength: Number.isFinite(data?.averageDocumentLength)
      ? Math.max(0, data.averageDocumentLength)
      : 0,
    mostActiveDay: typeof data?.mostActiveDay === 'string' ? data.mostActiveDay : 'Н/Д',
    documentsTrend: Array.isArray(data?.documentsTrend)
      ? data.documentsTrend.filter((item: any) =>
          item && typeof item.day === 'string' && Number.isFinite(item.count)
        )
      : []
  };
}

/**
 * Валідує статистику продуктивності
 */
export function validateProductivityStats(data: any): ValidatedProductivityStats {
  return {
    totalWorkHours: Number.isFinite(data?.totalWorkHours) 
      ? Math.max(0, data.totalWorkHours) 
      : 0,
    emailsPerHour: Number.isFinite(data?.emailsPerHour) 
      ? Math.max(0, data.emailsPerHour) 
      : 0,
    documentsPerWeek: Number.isFinite(data?.documentsPerWeek)
      ? Math.max(0, data.documentsPerWeek)
      : 0,
    aiTimeSaved: Number.isFinite(data?.aiTimeSaved) ? Math.max(0, data.aiTimeSaved) : 0,
    productivityScore: Number.isFinite(data?.productivityScore)
      ? Math.min(100, Math.max(0, data.productivityScore))
      : 0,
    topProductiveHours: Array.isArray(data?.topProductiveHours)
      ? data.topProductiveHours.filter((item: any) =>
          item && typeof item.hour === 'string' && Number.isFinite(item.score)
        )
      : [],
    workloadDistribution: typeof data?.workloadDistribution === 'object' && data.workloadDistribution !== null
      ? data.workloadDistribution
      : {},
    weeklyGoals: typeof data?.weeklyGoals === 'object' && data.weeklyGoals !== null
      ? data.weeklyGoals
      : {}
  };
}

/**
 * Валідує статистику співпраці
 */
export function validateCollaborationStats(data: any): ValidatedCollaborationStats {
  return {
    activeProjects: Number.isFinite(data?.activeProjects) 
      ? Math.max(0, data.activeProjects) 
      : 0,
    teamMembers: Number.isFinite(data?.teamMembers) ? Math.max(0, data.teamMembers) : 0,
    sharedDocuments: Number.isFinite(data?.sharedDocuments) 
      ? Math.max(0, data.sharedDocuments) 
      : 0,
    collaborationHours: Number.isFinite(data?.collaborationHours)
      ? Math.max(0, data.collaborationHours)
      : 0,
    topCollaborators: Array.isArray(data?.topCollaborators)
      ? data.topCollaborators.filter((item: any) =>
          item && typeof item.name === 'string' && 
          Number.isFinite(item.projects) && Number.isFinite(item.hours)
        )
      : [],
    projectStatus: typeof data?.projectStatus === 'object' && data.projectStatus !== null
      ? data.projectStatus
      : {},
    communicationChannels: typeof data?.communicationChannels === 'object' && data.communicationChannels !== null
      ? data.communicationChannels
      : {}
  };
}

/**
 * Валідує весь об'єкт даних дашборду
 */
export function validateDashboardData(data: any) {
  if (!data || typeof data !== 'object') {
    return {
      gmail: validateGmailStats({}),
      ai: validateAIStats({}),
      documents: validateDocumentsStats({}),
      productivity: validateProductivityStats({}),
      collaboration: validateCollaborationStats({}),
      period: 'week',
      generatedAt: new Date().toISOString()
    };
  }

  return {
    gmail: validateGmailStats(data.gmail),
    ai: validateAIStats(data.ai),
    documents: validateDocumentsStats(data.documents),
    productivity: validateProductivityStats(data.productivity),
    collaboration: validateCollaborationStats(data.collaboration),
    period: typeof data.period === 'string' ? data.period : 'week',
    generatedAt: typeof data.generatedAt === 'string' ? data.generatedAt : new Date().toISOString()
  };
}






