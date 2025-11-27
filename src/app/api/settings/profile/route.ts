import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/settings/profile
 * Get user profile information
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = await getCurrentUserId();
    
    if (!userId || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    
    // Get user preferences which may contain profile data
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    const profileData = preferences?.preferences?.profile || {};

    return NextResponse.json({
      profile: {
        name: session.user.name || profileData.name || '',
        email: session.user.email || '',
        image: session.user.image || profileData.image || '',
        role: profileData.role || 'teacher',
        department: profileData.department || '',
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/profile
 * Update user profile information
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const supabase = createServerClient();

    // Get existing preferences
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    const currentPreferences = existing?.preferences || {};
    const currentProfile = currentPreferences.profile || {};

    // Update profile data
    const updatedProfile = {
      ...currentProfile,
      name: body.name !== undefined ? body.name : currentProfile.name,
      role: body.role !== undefined ? body.role : currentProfile.role,
      department: body.department !== undefined ? body.department : currentProfile.department,
    };

    const updatedPreferences = {
      ...currentPreferences,
      profile: updatedProfile,
    };

    // Update or insert preferences
    if (existing) {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          preferences: updatedPreferences,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        profile: updatedProfile,
      });
    } else {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          preferences: updatedPreferences,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        profile: updatedProfile,
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

