'use client';

import { ReactNode } from 'react';
import { useAutoLogout } from '@/hooks/useAutoLogout';

interface AutoLogoutProviderProps {
  children: ReactNode;
}

export function AutoLogoutProvider({ children }: AutoLogoutProviderProps) {
  useAutoLogout();
  return <>{children}</>;
}

