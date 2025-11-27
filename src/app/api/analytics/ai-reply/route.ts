import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      emailId,
      emailSubject,
      replyType,
      tone,
      language,
      templateId,
      customInstructions,
      generationTime,
      success,
      modelUsed,
      replyLength
    } = body;

    const supabase = createServerClient();

    // Store analytics data in Supabase
    const analyticsData = {
      emailId,
      emailSubject,
      replyType,
      tone,
      language,
      templateId: templateId || null,
      customInstructions: customInstructions || null,
      generationTime,
      success,
      modelUsed,
      replyLength,
    };

    const { error } = await supabase
      .from('analytics')
      .insert({
        user_id: userId,
        type: 'ai_reply',
        data: analyticsData,
      });

    if (error) {
      console.error('Error saving AI reply analytics to Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to save AI reply statistics' },
        { status: 500 }
      );
    }

    // Calculate and return stats
    const { data: allReplies } = await supabase
      .from('analytics')
      .select('data')
      .eq('user_id', userId)
      .eq('type', 'ai_reply');

    const replies = (allReplies || []).map(r => r.data as any);
    
    const stats = {
      totalRepliesGenerated: replies.length,
      repliesByType: {} as Record<string, number>,
      repliesByTone: {} as Record<string, number>,
      templatesUsed: 0,
      aiOnlyGeneration: 0,
      averageGenerationTime: 0,
      successRate: 100,
      lastUpdated: new Date().toISOString()
    };

    let totalGenerationTime = 0;
    let successfulReplies = 0;

    replies.forEach((reply: any) => {
      if (reply.replyType) {
        stats.repliesByType[reply.replyType] = (stats.repliesByType[reply.replyType] || 0) + 1;
      }
      if (reply.tone) {
        stats.repliesByTone[reply.tone] = (stats.repliesByTone[reply.tone] || 0) + 1;
      }
      if (reply.templateId) {
        stats.templatesUsed++;
      } else {
        stats.aiOnlyGeneration++;
      }
      if (reply.generationTime) {
        totalGenerationTime += reply.generationTime;
      }
      if (reply.success) {
        successfulReplies++;
      }
    });

    stats.averageGenerationTime = replies.length > 0 ? totalGenerationTime / replies.length : 0;
    stats.successRate = replies.length > 0 ? (successfulReplies / replies.length) * 100 : 100;

    return NextResponse.json({
      success: true,
      message: 'AI reply statistics saved',
      stats
    });

  } catch (error) {
    console.error('AI reply analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to save AI reply statistics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Fetch all AI reply analytics for the user
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'ai_reply')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI analytics from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch AI analytics' },
        { status: 500 }
      );
    }

    const replies = (analytics || []).map(a => ({
      id: a.id,
      timestamp: a.created_at,
      ...(a.data as any),
    }));

    // Calculate stats
    const stats = {
      totalRepliesGenerated: replies.length,
      repliesByType: {} as Record<string, number>,
      repliesByTone: {} as Record<string, number>,
      templatesUsed: 0,
      aiOnlyGeneration: 0,
      averageGenerationTime: 0,
      successRate: 100,
      lastUpdated: replies.length > 0 ? replies[0].timestamp : null
    };

    let totalGenerationTime = 0;
    let successfulReplies = 0;

    replies.forEach((reply: any) => {
      if (reply.replyType) {
        stats.repliesByType[reply.replyType] = (stats.repliesByType[reply.replyType] || 0) + 1;
      }
      if (reply.tone) {
        stats.repliesByTone[reply.tone] = (stats.repliesByTone[reply.tone] || 0) + 1;
      }
      if (reply.templateId) {
        stats.templatesUsed++;
      } else {
        stats.aiOnlyGeneration++;
      }
      if (reply.generationTime) {
        totalGenerationTime += reply.generationTime;
      }
      if (reply.success) {
        successfulReplies++;
      }
    });

    stats.averageGenerationTime = replies.length > 0 ? totalGenerationTime / replies.length : 0;
    stats.successRate = replies.length > 0 ? (successfulReplies / replies.length) * 100 : 100;

    return NextResponse.json({
      success: true,
      data: {
        replies,
        stats
      }
    });

  } catch (error) {
    console.error('AI analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI analytics' },
      { status: 500 }
    );
  }
}
