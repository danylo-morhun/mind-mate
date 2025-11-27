/**
 * Utility functions for checking user preferences
 */

import { getCurrentUserId } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';

export interface UserPreferences {
  security?: {
    autoLogout?: boolean;
    autoLogoutMinutes?: number;
  };
  profile?: {
    name?: string;
    role?: string;
    department?: string;
  };
}

/**
 * Get user preferences from database
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return null;
    }

    const supabase = createServerClient();
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return preferences?.preferences || null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

/**
 * Check if auto-logout is enabled and get timeout in minutes
 */
export async function getAutoLogoutSettings(): Promise<{ enabled: boolean; minutes: number }> {
  const preferences = await getUserPreferences();
  return {
    enabled: preferences?.security?.autoLogout !== false, // Default to true
    minutes: preferences?.security?.autoLogoutMinutes || 30,
  };
}

