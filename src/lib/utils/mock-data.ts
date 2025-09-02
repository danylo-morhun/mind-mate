// Тестові дані для демонстрації функціональності

import { Email, EmailTemplate } from '@/lib/types';

export const mockEmails: Email[] = [
  {
    id: '1',
    threadId: 'thread1',
    subject: 'Запит про лабораторну роботу №1',
    sender: 'student@university.edu',
    recipients: ['teacher@university.edu'],
    body: 'Доброго дня! У мене виникли питання щодо виконання лабораторної роботи №1. Чи можу я отримати додаткові пояснення?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 години тому
    category: 'student_inquiry',
    priority: 'medium',
    isRead: false,
    labels: ['INBOX'],
    attachments: []
  },
  {
    id: '2',
    threadId: 'thread2',
    subject: 'Важливо: Зустріч кафедри 15 січня',
    sender: 'dean@university.edu',
    recipients: ['teacher@university.edu', 'staff@university.edu'],
    body: 'Запрошуємо на зустріч кафедри, яка відбудеться 15 січня о 14:00 в аудиторії 301. Обговорюватимемо навчальний план на наступний семестр.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 день тому
    category: 'meeting',
    priority: 'high',
    isRead: true,
    labels: ['INBOX', 'IMPORTANT'],
    attachments: []
  },
  {
    id: '3',
    threadId: 'thread3',
    subject: 'Терміново: Звіт про наукову роботу',
    sender: 'research@university.edu',
    recipients: ['teacher@university.edu'],
    body: 'Нагадуємо про необхідність подачі звіту про наукову роботу до 20 січня. Це критично важливо для акредитації кафедри.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 годин тому
    category: 'deadline',
    priority: 'urgent',
    isRead: false,
    labels: ['INBOX', 'URGENT'],
    attachments: [
      {
        id: 'att1',
        name: 'template_report.docx',
        size: 25600,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    ]
  },
  {
    id: '4',
    threadId: 'thread4',
    subject: 'Питання про курс "Програмування"',
    sender: 'student2@university.edu',
    recipients: ['teacher@university.edu'],
    body: 'Доброго дня! Я студентка 2 курсу. Мені потрібна консультація щодо курсу "Програмування". Чи можна записатися на консультацію?',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 годин тому
    category: 'student_inquiry',
    priority: 'low',
    isRead: true,
    labels: ['INBOX'],
    attachments: []
  },
  {
    id: '5',
    threadId: 'thread5',
    subject: 'Результати екзамену з математики',
    sender: 'math@university.edu',
    recipients: ['teacher@university.edu'],
    body: 'Надіслаємо результати екзамену з математики для групи ІП-21. Загальна успішність склала 78%. Детальна статистика у вкладенні.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 години тому
    category: 'academic',
    priority: 'medium',
    isRead: true,
    labels: ['INBOX'],
    attachments: [
      {
        id: 'att2',
        name: 'exam_results.xlsx',
        size: 15360,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    ]
  },
  {
    id: '6',
    threadId: 'thread6',
    subject: 'Наказ про зміну розкладу',
    sender: 'admin@university.edu',
    recipients: ['teacher@university.edu'],
    body: 'Наказом ректора з 20 січня вводиться новий розклад занять. Всі зміни будуть доступні в системі "Розклад" з 18 січня.',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 дні тому
    category: 'administrative',
    priority: 'high',
    isRead: true,
    labels: ['INBOX', 'ADMIN'],
    attachments: []
  },
  {
    id: '7',
    threadId: 'thread7',
    subject: 'Конференція "Інновації в освіті"',
    sender: 'conference@university.edu',
    recipients: ['teacher@university.edu'],
    body: 'Запрошуємо взяти участь у міжнародній конференції "Інновації в освіті", яка відбудеться 25-27 лютого. Термін подачі тез - 10 лютого.',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 дні тому
    category: 'meeting',
    priority: 'medium',
    isRead: true,
    labels: ['INBOX'],
    attachments: [
      {
        id: 'att3',
        name: 'conference_info.pdf',
        size: 512000,
        mimeType: 'application/pdf'
      }
    ]
  },
  {
    id: '8',
    threadId: 'thread8',
    subject: 'Питання про захист дипломної роботи',
    sender: 'student3@university.edu',
    recipients: ['teacher@university.edu'],
    body: 'Доброго дня! Я готую дипломну роботу і мені потрібна допомога з розділом "Висновки". Чи можу я отримати консультацію?',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 година тому
    category: 'student_inquiry',
    priority: 'medium',
    isRead: false,
    labels: ['INBOX'],
    attachments: []
  }
];

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'template1',
    name: 'Відповідь студенту',
    subject: 'Відповідь на запит',
    body: 'Доброго дня! Дякую за ваш запит. Я готовий допомогти вам з цим питанням. Запишіться на консультацію через систему або напишіть, коли вам зручно зустрітися. З повагою, [Ваше ім\'я]',
    category: 'student_inquiry',
    variables: ['name'],
    isActive: true
  },
  {
    id: 'template2',
    name: 'Підтвердження зустрічі',
    subject: 'Підтвердження зустрічі',
    body: 'Доброго дня! Підтверджую нашу зустріч на [дата] о [час] в [місце]. Якщо у вас є зміни, будь ласка, повідомте заздалегідь. До зустрічі! [Ваше ім\'я]',
    category: 'meeting',
    variables: ['date', 'time', 'place', 'name'],
    isActive: true
  },
  {
    id: 'template3',
    name: 'Відповідь на терміновий запит',
    subject: 'Відповідь на терміновий запит',
    body: 'Доброго дня! Розумію терміновість вашого запиту. Я постараюся відповісти якомога швидше. Очікуйте відповідь протягом [час]. З повагою, [Ваше ім\'я]',
    category: 'urgent',
    variables: ['time', 'name'],
    isActive: true
  },
  {
    id: 'template4',
    name: 'Загальна відповідь',
    subject: 'Відповідь на запит',
    body: 'Доброго дня! Дякую за ваш запит. Я обробив ваше звернення та готовий надати необхідну інформацію. Якщо у вас є додаткові питання, не соромтеся звертатися. З повагою, [Ваше ім\'я]',
    category: 'general',
    variables: ['name'],
    isActive: true
  }
];

export const mockUser = {
  id: 'user1',
  email: 'teacher@university.edu',
  name: 'Іванов Іван Іванович',
  role: 'teacher' as const,
  department: 'Інформаційних технологій',
  avatar: undefined
};

export const mockAnalytics = {
  emailsProcessed: 1247,
  emailsByCategory: {
    academic: 45,
    administrative: 23,
    student_inquiry: 156,
    meeting: 34,
    deadline: 67,
    urgent: 12,
    general: 89
  },
  emailsByPriority: {
    low: 234,
    medium: 567,
    high: 345,
    urgent: 101
  },
  responseTime: 2.3,
  documentsCreated: 89,
  gradesProcessed: 456,
  productivityScore: 87
};
