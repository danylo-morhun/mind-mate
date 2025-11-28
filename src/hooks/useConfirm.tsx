'use client';

import { useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'outline' | 'ghost';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions({
        title: options.title || 'Підтвердження',
        message: options.message,
        confirmText: options.confirmText || 'Підтвердити',
        cancelText: options.cancelText || 'Скасувати',
        confirmVariant: options.confirmVariant || 'default',
      });
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
    setIsOpen(false);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    setIsOpen(false);
  }, [resolvePromise]);

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={options.title || 'Підтвердження'}
      message={options.message}
      confirmText={options.confirmText || 'Підтвердити'}
      cancelText={options.cancelText || 'Скасувати'}
      confirmVariant={options.confirmVariant || 'default'}
    />
  );

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}

