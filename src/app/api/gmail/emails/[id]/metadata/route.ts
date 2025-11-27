import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { category, priority } = body;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const getOrCreateLabel = async (labelName: string): Promise<string | null> => {
      try {
        const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
        const existingLabel = labelsResponse.data.labels?.find(
          (label) => label.name === labelName
        );

        if (existingLabel?.id) {
          return existingLabel.id;
        }

        const createResponse = await gmail.users.labels.create({
          userId: 'me',
          requestBody: {
            name: labelName,
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show',
          },
        });

        return createResponse.data.id || null;
      } catch (error: any) {
        if (error.code === 409) {
          const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
          const existingLabel = labelsResponse.data.labels?.find(
            (label) => label.name === labelName
          );
          return existingLabel?.id || null;
        }
        console.error(`Failed to get/create label ${labelName}:`, error);
        return null;
      }
    };

    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: id,
      format: 'metadata',
    });

    const currentLabelIds = messageResponse.data.labelIds || [];

    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    const labelsMap = new Map<string, string>();
    labelsResponse.data.labels?.forEach((label) => {
      if (label.id && label.name) {
        labelsMap.set(label.name, label.id);
      }
    });

    const addLabelIds: string[] = [];
    const removeLabelIds: string[] = [];

    if (category && category !== 'inbox' && category !== 'sent' && category !== 'draft' && category !== 'spam' && category !== 'trash') {
      const categoryLabels = [
        'Category_education',
        'Category_administrative',
        'Category_student_support',
        'Category_meetings',
        'Category_documents',
        'Category_other'
      ];

      for (const labelName of categoryLabels) {
        const labelId = labelsMap.get(labelName);
        if (labelId && currentLabelIds.includes(labelId)) {
          removeLabelIds.push(labelId);
        }
      }

      const newCategoryLabelName = `Category_${category}`;
      let newCategoryLabelId = labelsMap.get(newCategoryLabelName);
      
      if (!newCategoryLabelId) {
        newCategoryLabelId = await getOrCreateLabel(newCategoryLabelName);
        if (newCategoryLabelId) {
          labelsMap.set(newCategoryLabelName, newCategoryLabelId);
        }
      }

      if (newCategoryLabelId) {
        const index = removeLabelIds.indexOf(newCategoryLabelId);
        if (index > -1) {
          removeLabelIds.splice(index, 1);
        }
        if (!currentLabelIds.includes(newCategoryLabelId)) {
          addLabelIds.push(newCategoryLabelId);
        }
      }
    }

    if (priority) {
      const priorityLabels = [
        'Priority_low',
        'Priority_medium',
        'Priority_high',
        'Priority_urgent'
      ];

      for (const labelName of priorityLabels) {
        const labelId = labelsMap.get(labelName);
        if (labelId && currentLabelIds.includes(labelId)) {
          removeLabelIds.push(labelId);
        }
      }

      const newPriorityLabelName = `Priority_${priority}`;
      let newPriorityLabelId = labelsMap.get(newPriorityLabelName);
      
      if (!newPriorityLabelId) {
        newPriorityLabelId = await getOrCreateLabel(newPriorityLabelName);
        if (newPriorityLabelId) {
          labelsMap.set(newPriorityLabelName, newPriorityLabelId);
        }
      }

      if (newPriorityLabelId) {
        const index = removeLabelIds.indexOf(newPriorityLabelId);
        if (index > -1) {
          removeLabelIds.splice(index, 1);
        }
        if (!currentLabelIds.includes(newPriorityLabelId)) {
          addLabelIds.push(newPriorityLabelId);
        }
      }
    }

    if (addLabelIds.length > 0 || removeLabelIds.length > 0) {
      await gmail.users.messages.modify({
        userId: 'me',
        id: id,
        requestBody: {
          addLabelIds: addLabelIds.length > 0 ? addLabelIds : undefined,
          removeLabelIds: removeLabelIds.length > 0 ? removeLabelIds : undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email metadata updated successfully',
    });

  } catch (error: any) {
    console.error('Gmail API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update email metadata',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

