/**
 * Database Types for Supabase
 * 
 * This file contains TypeScript types that match your Supabase database schema.
 * You can generate these automatically using Supabase CLI:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts
 * 
 * For now, we'll define them manually based on your application's data models.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: 'doc' | 'sheet' | 'slide' | 'pdf' | 'drawing' | 'form';
          category: 'lectures' | 'methodics' | 'reports' | 'presentations' | 'plans' | 'assignments' | 'syllabi' | 'other';
          author: string;
          collaborators: string[];
          version: number;
          last_modified: string;
          created_date: string;
          tags: string[];
          status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived' | 'deprecated';
          permissions: Json;
          metadata: Json;
          ai_generated: boolean;
          template_id: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          type: 'doc' | 'sheet' | 'slide' | 'pdf' | 'drawing' | 'form';
          category: 'lectures' | 'methodics' | 'reports' | 'presentations' | 'plans' | 'assignments' | 'syllabi' | 'other';
          author: string;
          collaborators?: string[];
          version?: number;
          last_modified?: string;
          created_date?: string;
          tags?: string[];
          status?: 'draft' | 'in_review' | 'approved' | 'published' | 'archived' | 'deprecated';
          permissions?: Json;
          metadata?: Json;
          ai_generated?: boolean;
          template_id?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: 'doc' | 'sheet' | 'slide' | 'pdf' | 'drawing' | 'form';
          category?: 'lectures' | 'methodics' | 'reports' | 'presentations' | 'plans' | 'assignments' | 'syllabi' | 'other';
          author?: string;
          collaborators?: string[];
          version?: number;
          last_modified?: string;
          created_date?: string;
          tags?: string[];
          status?: 'draft' | 'in_review' | 'approved' | 'published' | 'archived' | 'deprecated';
          permissions?: Json;
          metadata?: Json;
          ai_generated?: boolean;
          template_id?: string | null;
          user_id?: string;
          updated_at?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          name: string;
          subject: string;
          body: string;
          category: string;
          variables: string[];
          is_active: boolean;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          body: string;
          category: string;
          variables?: string[];
          is_active?: boolean;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subject?: string;
          body?: string;
          category?: string;
          variables?: string[];
          is_active?: boolean;
          user_id?: string;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          type: 'ai_reply' | 'email_processed' | 'document_created' | 'dashboard_view';
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'ai_reply' | 'email_processed' | 'document_created' | 'dashboard_view';
          data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'ai_reply' | 'email_processed' | 'document_created' | 'dashboard_view';
          data?: Json;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferences: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferences?: Json;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      document_type: 'doc' | 'sheet' | 'slide' | 'pdf' | 'drawing' | 'form';
      document_category: 'lectures' | 'methodics' | 'reports' | 'presentations' | 'plans' | 'assignments' | 'syllabi' | 'other';
      document_status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived' | 'deprecated';
      analytics_type: 'ai_reply' | 'email_processed' | 'document_created' | 'dashboard_view';
    };
  };
}

