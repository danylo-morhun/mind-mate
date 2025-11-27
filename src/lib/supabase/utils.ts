/**
 * Utility functions for Supabase operations
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServerClient } from './server';

/**
 * Get the current user's email from the session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email || null;
}

/**
 * Get Supabase client with user context
 * Sets the user_id in the database session for RLS policies
 */
export async function getSupabaseClient() {
  const userId = await getCurrentUserId();
  const supabase = createServerClient();

  if (userId) {
    // Set user context for RLS policies
    // Note: This requires a custom database function or we can use service role
    // For now, we'll filter by user_id in queries
    await supabase.rpc('set_user_context', { user_email: userId });
  }

  return { supabase, userId };
}

/**
 * Helper to transform database document to application format
 */
export function transformDocument(dbDoc: any) {
  return {
    id: dbDoc.id,
    title: dbDoc.title,
    content: dbDoc.content,
    type: dbDoc.type,
    category: dbDoc.category,
    author: dbDoc.author,
    collaborators: dbDoc.collaborators || [],
    version: dbDoc.version || 1,
    lastModified: new Date(dbDoc.last_modified),
    createdDate: new Date(dbDoc.created_date),
    tags: dbDoc.tags || [],
    status: dbDoc.status,
    permissions: dbDoc.permissions || {
      canView: [],
      canEdit: [],
      canComment: [],
      canShare: [],
      isPublic: false,
    },
    metadata: dbDoc.metadata || {},
    aiGenerated: dbDoc.ai_generated || false,
    templateId: dbDoc.template_id || undefined,
  };
}

/**
 * Helper to transform application document to database format
 */
export function transformDocumentForDb(doc: any, userId: string) {
  return {
    title: doc.title,
    content: doc.content,
    type: doc.type,
    category: doc.category,
    author: doc.author,
    collaborators: doc.collaborators || [],
    version: doc.version || 1,
    last_modified: doc.lastModified?.toISOString() || new Date().toISOString(),
    created_date: doc.createdDate?.toISOString() || new Date().toISOString(),
    tags: doc.tags || [],
    status: doc.status || 'draft',
    permissions: doc.permissions || {
      canView: [],
      canEdit: [],
      canComment: [],
      canShare: [],
      isPublic: false,
    },
    metadata: doc.metadata || {},
    ai_generated: doc.aiGenerated || false,
    template_id: doc.templateId || null,
    user_id: userId,
  };
}

