/**
 * Hook for automatic logout based on user preferences
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

interface AutoLogoutSettings {
  enabled: boolean;
  minutes: number;
}

export function useAutoLogout() {
  const { data: session } = useSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const settingsRef = useRef<AutoLogoutSettings | null>(null);

  const setupAutoLogout = useCallback(() => {
    if (!session || !settingsRef.current?.enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const timeoutMinutes = settingsRef.current.minutes;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const checkAndLogout = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      if (timeSinceLastActivity >= timeoutMs) {
        // User has been inactive for too long, log them out
        signOut({ callbackUrl: '/auth/signin' });
      } else {
        // Schedule next check
        const remainingTime = timeoutMs - timeSinceLastActivity;
        timeoutRef.current = setTimeout(checkAndLogout, Math.max(1000, remainingTime));
      }
    };

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set initial timeout
    timeoutRef.current = setTimeout(checkAndLogout, timeoutMs);
  }, [session]);

  // Load settings from API
  useEffect(() => {
    if (!session) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/preferences');
        if (response.ok) {
          const data = await response.json();
          const prefs = data.preferences || {};
          settingsRef.current = {
            enabled: prefs.security?.autoLogout !== false,
            minutes: prefs.security?.autoLogoutMinutes || 30,
          };
          lastActivityRef.current = Date.now();
          setupAutoLogout();
        }
      } catch (error) {
        console.error('Error loading auto-logout settings:', error);
        // Default settings
        settingsRef.current = { enabled: true, minutes: 30 };
        lastActivityRef.current = Date.now();
        setupAutoLogout();
      }
    };

    loadSettings();
  }, [session, setupAutoLogout]);

  // Track user activity
  useEffect(() => {
    if (!session || !settingsRef.current?.enabled) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const resetTimeout = () => {
      updateActivity();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setupAutoLogout();
    };

    // Track various user activities
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session, setupAutoLogout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}

