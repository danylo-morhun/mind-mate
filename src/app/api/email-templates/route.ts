import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/supabase/utils';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', userId);

    if (category) {
      query = query.eq('category', category);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    query = query.order('created_at', { ascending: false });

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching email templates from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch email templates' },
        { status: 500 }
      );
    }

    // Transform to match expected format
    const transformedTemplates = (templates || []).map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
      variables: template.variables || [],
      isActive: template.is_active,
    }));

    return NextResponse.json(transformedTemplates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const templateData = {
      name: body.name,
      subject: body.subject,
      body: body.body,
      category: body.category,
      variables: body.variables || [],
      is_active: body.isActive !== undefined ? body.isActive : true,
      user_id: userId,
    };

    const { data: newTemplate, error } = await supabase
      .from('email_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating email template in Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to create email template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: newTemplate.id,
      name: newTemplate.name,
      subject: newTemplate.subject,
      body: newTemplate.body,
      category: newTemplate.category,
      variables: newTemplate.variables || [],
      isActive: newTemplate.is_active,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      { error: 'Failed to create email template' },
      { status: 500 }
    );
  }
}
