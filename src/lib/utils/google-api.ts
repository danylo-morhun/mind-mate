// Утиліти для роботи з Google API

export const GOOGLE_APIS = {
  GMAIL: 'https://gmail.googleapis.com/gmail/v1',
  DOCS: 'https://docs.googleapis.com/v1',
  SHEETS: 'https://sheets.googleapis.com/v4',
  CALENDAR: 'https://www.googleapis.com/calendar/v3',
  DRIVE: 'https://www.googleapis.com/drive/v3',
} as const;

export const EMAIL_LABELS = {
  ACADEMIC: 'Label_Academic',
  ADMINISTRATIVE: 'Label_Administrative',
  STUDENT_INQUIRY: 'Label_StudentInquiry',
  MEETING: 'Label_Meeting',
  DEADLINE: 'Label_Deadline',
  URGENT: 'Label_Urgent',
  AI_PROCESSED: 'Label_AIProcessed',
} as const;

export const EMAIL_CATEGORIES = {
  academic: {
    label: 'Academic',
    color: '#4285f4',
    description: 'Academic and educational emails',
  },
  administrative: {
    label: 'Administrative',
    color: '#34a853',
    description: 'Administrative and organizational emails',
  },
  student_inquiry: {
    label: 'Student Inquiry',
    color: '#fbbc04',
    description: 'Student questions and requests',
  },
  meeting: {
    label: 'Meeting',
    color: '#ea4335',
    description: 'Meeting invitations and scheduling',
  },
  deadline: {
    label: 'Deadline',
    color: '#ff6d01',
    description: 'Important deadlines and due dates',
  },
  urgent: {
    label: 'Urgent',
    color: '#d93025',
    description: 'Urgent and time-sensitive matters',
  },
  general: {
    label: 'General',
    color: '#9aa0a6',
    description: 'General correspondence',
  },
} as const;

export const EMAIL_PRIORITIES = {
  low: {
    label: 'Low',
    color: '#34a853',
    icon: '⬇️',
  },
  medium: {
    label: 'Medium',
    color: '#fbbc04',
    icon: '➡️',
  },
  high: {
    label: 'High',
    color: '#ff6d01',
    icon: '⬆️',
  },
  urgent: {
    label: 'Urgent',
    color: '#d93025',
    icon: '🚨',
  },
} as const;

export function getEmailCategoryColor(category: keyof typeof EMAIL_CATEGORIES): string {
  return EMAIL_CATEGORIES[category]?.color || '#9aa0a6';
}

export function getEmailPriorityColor(priority: keyof typeof EMAIL_PRIORITIES): string {
  return EMAIL_PRIORITIES[priority]?.color || '#9aa0a6';
}

export function getEmailPriorityIcon(priority: keyof typeof EMAIL_PRIORITIES): string {
  return EMAIL_PRIORITIES[priority]?.icon || '📧';
}

export function formatEmailDate(date: Date): string {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function extractEmailDomain(email: string): string {
  return email.split('@')[1] || '';
}

export function isUniversityEmail(email: string): boolean {
  const domain = extractEmailDomain(email);
  const universityDomains = [
    'university.edu',
    'edu.ua',
    'univ.edu.ua',
    'academic.edu.ua',
  ];
  return universityDomains.some(d => domain.includes(d));
}

export function generateEmailId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function sanitizeEmailContent(content: string): string {
  // Видаляємо HTML теги та зайві пробіли
  return content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateEmailPriority(
  sender: string,
  subject: string,
  content: string,
  labels: string[]
): keyof typeof EMAIL_PRIORITIES {
  let score = 0;
  
  // Аналіз відправника
  if (isUniversityEmail(sender)) score += 2;
  if (sender.includes('admin') || sender.includes('dean')) score += 3;
  
  // Аналіз теми
  const urgentKeywords = ['urgent', 'asap', 'deadline', 'important', 'critical'];
  const subjectLower = subject.toLowerCase();
  urgentKeywords.forEach(keyword => {
    if (subjectLower.includes(keyword)) score += 2;
  });
  
  // Аналіз контенту
  const contentLower = content.toLowerCase();
  if (contentLower.includes('deadline')) score += 3;
  if (contentLower.includes('meeting')) score += 1;
  if (contentLower.includes('exam') || contentLower.includes('test')) score += 2;
  
  // Аналіз міток
  if (labels.includes(EMAIL_LABELS.URGENT)) score += 4;
  if (labels.includes(EMAIL_LABELS.DEADLINE)) score += 3;
  
  if (score >= 8) return 'urgent';
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}
