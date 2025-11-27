import Link from 'next/link';
import { 
  Mail, 
  BarChart3, 
  FileText, 
  Users, 
  GraduationCap, 
  Settings,
  Bot,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const features = [
  {
    name: 'Gmail Асистент',
    description: 'Розумна система сортування листів з AI-категорізацією та пріоритизацією',
    icon: Mail,
    href: '/email',
    color: 'bg-blue-500',
  },
  {
    name: 'Аналітика',
    description: 'Дашборд з детальною статистикою та аналізом продуктивності',
    icon: BarChart3,
    href: '/dashboard',
    color: 'bg-green-500',
  },
  {
    name: 'AI-Документи',
    description: 'Створення лекцій, методичок та автоматичне форматування',
    icon: FileText,
    href: '/documents',
    color: 'bg-purple-500',
  },
  // {
  //   name: 'Колаборація',
  //   description: 'Система спільної роботи з доступом, коментарями та версіонуванням',
  //   icon: Users,
  //   href: '/collaboration',
  //   color: 'bg-orange-500',
  // },
  // {
  //   name: 'Оцінювання',
  //   description: 'Розумна система оцінювання з аналізом успішності та прогнозуванням',
  //   icon: GraduationCap,
  //   href: '/grading',
  //   color: 'bg-red-500',
  // },
  {
    name: 'Налаштування',
    description: 'Конфігурація системи та управління користувачами',
    icon: Settings,
    href: '/settings',
    color: 'bg-gray-500',
  },
];

const benefits = [
  {
    title: 'AI-Інтелект',
    description: 'Штучний інтелект для автоматизації рутинних завдань',
    icon: Bot,
  },
  {
    title: 'Швидкість',
    description: 'Значне прискорення робочих процесів',
    icon: Zap,
  },
  {
    title: 'Безпека',
    description: 'Захист даних та приватності користувачів',
    icon: Shield,
  },
  {
    title: 'Інтеграція',
    description: 'Повна інтеграція з Google Workspace',
    icon: Globe,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero секція */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Mind Mate
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Інтелектуальний AI-помічник для Google Workspace університету
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Автоматизуйте рутинні завдання, покращуйте продуктивність та зосередьтеся 
              на тому, що дійсно важливо - навчанні та розвитку студентів.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/email"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Mail className="h-6 w-6 mr-2" />
                Почати роботу
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
              >
                <BarChart3 className="h-6 w-6 mr-2" />
                Переглянути аналітику
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Переваги */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Чому Mind Mate?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Наша система створена спеціально для потреб університетів та 
              навчальних закладів
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модулі системи */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Модулі системи
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Повний набір інструментів для ефективної роботи в університеті
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.name}
                href={feature.href}
                className="group block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-8">
                  <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Технології */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Технологічний стек
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Сучасні технології для надійної та масштабованої системи
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Frontend</h3>
              <p className="text-gray-600">React.js + Next.js + Tailwind CSS</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Backend</h3>
              <p className="text-gray-600">Google Apps Script + Cloud Functions</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI/ML</h3>
              <p className="text-gray-600">Google AI + Natural Language API</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Інтеграція</h3>
              <p className="text-gray-600">Google Workspace APIs</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA секція */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Готові покращити свою продуктивність?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Приєднуйтесь до Mind Mate та перетворіть свій робочий процес
          </p>
          <Link
            href="/email"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            <Zap className="h-6 w-6 mr-2" />
            Почати зараз
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Mind Mate</h3>
            <p className="text-gray-400 mb-6">
              Інтелектуальний AI-помічник для Google Workspace університету
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 Mind Mate. Всі права захищені.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
