import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Label management request received');
    
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      console.log('No access token found in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session found, access token available');

    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { action, labelName, labelId, labelColor, labelVisibility } = body;

    console.log('Parsed parameters:', { action, labelName, labelId, labelColor, labelVisibility });

    switch (action) {
      case 'create':
        console.log('Creating label...');
        return await createLabel(session.accessToken, labelName, labelColor, labelVisibility);
      case 'update':
        console.log('Updating label...');
        return await updateLabel(session.accessToken, labelId, labelName, labelColor, labelVisibility);
      case 'delete':
        console.log('Deleting label...');
        return await deleteLabel(session.accessToken, labelId);
      case 'apply':
        console.log('Applying label to email...');
        return await applyLabelToEmail(session.accessToken, labelId, body.emailId);
      case 'remove':
        console.log('Removing label from email...');
        return await removeLabelFromEmail(session.accessToken, labelId, body.emailId);
      default:
        console.log('Invalid action:', action);
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Label management error:', error);
    return NextResponse.json(
      { error: `Failed to manage labels: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Створення нової мітки
async function createLabel(accessToken: string, name: string, color: { backgroundColor?: string; textColor?: string }, visibility: string) {
  try {
    console.log('Creating label with params:', { name, color, visibility });
    
    const requestBody = {
      name,
      labelListVisibility: visibility || 'labelShow',
      messageListVisibility: 'show',
      backgroundColor: color?.backgroundColor || '#4285f4',
      textColor: color?.textColor || '#ffffff'
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Gmail API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gmail API error response:', errorText);
      throw new Error(`Gmail API error: ${response.status} - ${errorText}`);
    }

    const label = await response.json();
    console.log('Successfully created label:', label);
    return NextResponse.json({ success: true, label });
  } catch (error) {
    console.error('Create label error:', error);
    return NextResponse.json(
      { error: `Failed to create label: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Оновлення мітки
async function updateLabel(accessToken: string, labelId: string, name: string, color: { backgroundColor?: string; textColor?: string }, visibility: string) {
  try {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/labels/${labelId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        labelListVisibility: visibility || 'labelShow',
        messageListVisibility: 'show',
        backgroundColor: color?.backgroundColor || '#4285f4',
        textColor: color?.textColor || '#ffffff'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update label: ${response.status}`);
    }

    const label = await response.json();
    return NextResponse.json({ success: true, label });
  } catch (error) {
    console.error('Update label error:', error);
    return NextResponse.json(
      { error: 'Failed to update label' },
      { status: 500 }
    );
  }
}

// Видалення мітки
async function deleteLabel(accessToken: string, labelId: string) {
  try {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/labels/${labelId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete label: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete label error:', error);
    return NextResponse.json(
      { error: 'Failed to delete label' },
      { status: 500 }
    );
  }
}

// Застосування мітки до листа
async function applyLabelToEmail(accessToken: string, labelId: string, emailId: string) {
  try {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addLabelIds: [labelId]
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to apply label: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Apply label error:', error);
    return NextResponse.json(
      { error: 'Failed to apply label' },
      { status: 500 }
    );
  }
}

// Видалення мітки з листа
async function removeLabelFromEmail(accessToken: string, labelId: string, emailId: string) {
  try {
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        removeLabelIds: [labelId]
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove label: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove label error:', error);
    return NextResponse.json(
      { error: 'Failed to remove label' },
      { status: 500 }
    );
  }
}
