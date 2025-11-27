'use client';

import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function SignInButton() {
  const { data: session, status } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (status === 'loading') {
    return (
      <Button disabled>
        Завантаження...
      </Button>
    );
  }

  if (session) {
    return (
      <>
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
            onClick={() => setShowLogoutConfirm(true)}
            variant="outline"
            size="sm"
          >
            Вийти
          </Button>
        </div>
        <ConfirmDialog
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => signOut()}
          title="Підтвердження виходу"
          message="Ви впевнені, що хочете вийти з облікового запису?"
          confirmText="Вийти"
          cancelText="Скасувати"
          confirmVariant="default"
        />
      </>
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
