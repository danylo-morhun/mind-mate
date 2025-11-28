'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert, AlertType } from '@/components/ui/Alert';

interface AlertState {
  message: string;
  type: AlertType;
  isOpen: boolean;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({
    message: '',
    type: 'info',
    isOpen: false,
  });
  const [duration, setDuration] = useState(4000);

  const showAlert = useCallback((message: string, type: AlertType = 'info', alertDuration = 4000) => {
    setDuration(alertDuration);
    setAlert({
      message,
      type,
      isOpen: true,
    });
  }, []);

  const showSuccess = useCallback((message: string, alertDuration = 4000) => {
    showAlert(message, 'success', alertDuration);
  }, [showAlert]);

  const showError = useCallback((message: string, alertDuration = 5000) => {
    showAlert(message, 'error', alertDuration);
  }, [showAlert]);

  const showWarning = useCallback((message: string, alertDuration = 4000) => {
    showAlert(message, 'warning', alertDuration);
  }, [showAlert]);

  const showInfo = useCallback((message: string, alertDuration = 4000) => {
    showAlert(message, 'info', alertDuration);
  }, [showAlert]);

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <Alert
        message={alert.message}
        type={alert.type}
        isOpen={alert.isOpen}
        onClose={closeAlert}
        duration={duration}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

