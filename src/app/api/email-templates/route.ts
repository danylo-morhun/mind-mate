import { NextResponse } from 'next/server';

// Мокові шаблони листів (в реальному додатку будуть з бази даних)
const emailTemplates = [
  {
    id: '1',
    name: 'Загальна відповідь',
    subject: 'Re: {subject}',
    body: 'Доброго дня!\n\nДякую за ваш лист. Я розгляну ваше питання та відповім найближчим часом.\n\nЗ повагою,\n[Ваше ім\'я]',
    category: 'general',
    variables: ['subject'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Навчальні матеріали',
    subject: 'Re: {subject}',
    body: 'Доброго дня!\n\nДякую за запит щодо навчальних матеріалів. Я підготую необхідну інформацію та надішлю вам протягом тижня.\n\nЯкщо у вас є додаткові питання, будь ласка, звертайтесь.\n\nЗ повагою,\n[Ваше ім\'я]',
    category: 'education',
    variables: ['subject'],
    isActive: true,
  },
  {
    id: '3',
    name: 'Зустріч/Консультація',
    subject: 'Re: {subject}',
    body: 'Доброго дня!\n\nДякую за запит на зустріч. Я готовий зустрітися з вами {date} о {time}.\n\nМісце зустрічі: {location}\n\nЯкщо цей час вам не підходить, будь ласка, запропонуйте альтернативні варіанти.\n\nЗ повагою,\n[Ваше ім\'я]',
    category: 'meetings',
    variables: ['subject', 'date', 'time', 'location'],
    isActive: true,
  },
  {
    id: '4',
    name: 'Документи/Форми',
    subject: 'Re: {subject}',
    body: 'Доброго дня!\n\nДякую за запит щодо документів. Необхідні форми та інструкції вкладені до цього листа.\n\nЯкщо у вас виникнуть питання при заповненні, будь ласка, звертайтесь.\n\nЗ повагою,\n[Ваше ім\'я]',
    category: 'documents',
    variables: ['subject'],
    isActive: true,
  },
  {
    id: '5',
    name: 'Термінова відповідь',
    subject: 'URGENT: {subject}',
    body: 'Доброго дня!\n\nВаш запит отримано та розглядається як терміновий. Я надам детальну відповідь протягом 24 годин.\n\nЯкщо потрібна негайна допомога, будь ласка, зателефонуйте: {phone}\n\nЗ повагою,\n[Ваше ім\'я]',
    category: 'urgent',
    variables: ['subject', 'phone'],
    isActive: true,
  },
];

export async function GET() {
  try {
    return NextResponse.json(emailTemplates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}
