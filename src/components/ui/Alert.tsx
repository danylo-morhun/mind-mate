'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  message: string;
  type: AlertType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

const alertConfig = {
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600',
    icon: CheckCircle,
  },
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    icon: XCircle,
  },
  warning: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    icon: AlertTriangle,
  },
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    icon: Info,
  },
};

export function Alert({ message, type, isOpen, onClose, duration = 4000 }: AlertProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen || !mounted) return null;

  const config = alertConfig[type];
  const Icon = config.icon;

  const alertContent = (
    <div className="fixed top-4 right-4 z-[99999] animate-in slide-in-from-top-5 fade-in-0">
      <div
        className={`
          ${config.bgColor}
          ${config.borderColor}
          ${config.textColor}
          border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md
          flex items-start space-x-3
        `}
      >
        <Icon className={`${config.iconColor} w-5 h-5 mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`
            ${config.textColor}
            hover:opacity-70
            transition-opacity
            flex-shrink-0
            ml-2
          `}
          aria-label="Закрити"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return createPortal(alertContent, document.body);
}

