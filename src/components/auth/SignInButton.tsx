'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export default function SignInButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Button disabled>
        Завантаження...
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {session.user.image && (
            <img
              src={session.user.image}
              
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-gray-700">
            {session.user.name}
          </span>
        </div>
        <Button
          onClick={() => signOut()}
          variant="outline"
          size="sm"
        >
          Вийти
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn('google')}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      Увійти через Google
    </Button>
  );
}
