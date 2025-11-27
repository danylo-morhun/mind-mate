-- Supabase Database Schema for Mind Mate
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('doc', 'sheet', 'slide', 'pdf', 'drawing', 'form')),
  category TEXT NOT NULL CHECK (category IN ('lectures', 'methodics', 'reports', 'presentations', 'plans', 'assignments', 'syllabi', 'other')),
  author TEXT NOT NULL,
  collaborators TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived', 'deprecated')),
  permissions JSONB DEFAULT '{"canView": [], "canEdit": [], "canComment": [], "canShare": [], "isPublic": false}',
  metadata JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  template_id UUID,
  user_id TEXT NOT NULL,
  google_doc_id TEXT, -- ID документа в Google Docs для синхронізації
  google_doc_url TEXT, -- URL документа в Google Docs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ai_reply', 'email_processed', 'document_created', 'dashboard_view')),
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_date ON documents(created_date);
CREATE INDEX IF NOT EXISTS idx_documents_google_doc_id ON documents(google_doc_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Documents Policies
-- Users can view their own documents or documents where they have permission
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

-- Users can insert their own documents
CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

-- Users can update their own documents
CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- Email Templates Policies
CREATE POLICY "Users can view their own email templates"
  ON email_templates FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own email templates"
  ON email_templates FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own email templates"
  ON email_templates FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can delete their own email templates"
  ON email_templates FOR DELETE
  USING (user_id = current_setting('app.user_id', true));

-- Analytics Policies
CREATE POLICY "Users can view their own analytics"
  ON analytics FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own analytics"
  ON analytics FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

-- User Preferences Policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = current_setting('app.user_id', true));

-- Note: The RLS policies above use a custom setting 'app.user_id'
-- In your application, you'll need to set this using:
-- SELECT set_config('app.user_id', 'user_email_or_id', true);
-- 
-- Alternatively, you can modify the policies to use Supabase Auth:
-- USING (auth.uid()::text = user_id)
-- But this requires setting up Supabase Auth, which might conflict with NextAuth

