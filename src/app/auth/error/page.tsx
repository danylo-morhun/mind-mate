'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Помилка входу через Google. Перевірте налаштування OAuth.';
      case 'OAuthCallback':
        return 'Помилка обробки відповіді від Google. Спробуйте ще раз.';
      case 'OAuthCreateAccount':
        return 'Помилка створення облікового запису.';
      case 'EmailCreateAccount':
        return 'Помилка створення облікового запису через email.';
      case 'Callback':
        return 'Помилка обробки callback.';
      case 'OAuthAccountNotLinked':
        return 'Цей акаунт Google вже пов\'язаний з іншим обліковим записом.';
      case 'EmailSignin':
        return 'Помилка входу через email.';
      case 'CredentialsSignin':
        return 'Невірні облікові дані.';
      case 'SessionRequired':
        return 'Необхідна авторизація для доступу до цієї сторінки.';
      default:
        return 'Сталася невідома помилка під час авторизації.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Помилка авторизації
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {getErrorMessage(error)}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Якщо проблема повторюється, перевірте:
              </p>
              <ul className="text-sm text-gray-500 space-y-1 text-left">
                <li>• Правильність налаштування Google OAuth</li>
                <li>• Валідність Client ID та Client Secret</li>
                <li>• Налаштування redirect URI</li>
                <li>• Статус Google Cloud Project</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Спробувати ще раз
              </Button>
              
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">
                  Повернутися до входу
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  На головну
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
