-- DATABASE_SCHEMA.sql
-- Schema definition for Kreativhub LMS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase Auth)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT CHECK(role IN ('admin', 'student')) DEFAULT 'student',
  avatar_url TEXT,
  cohort_id UUID, -- foreign key added after cohorts table
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohorts
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD CONSTRAINT fk_cohort FOREIGN KEY (cohort_id) REFERENCES cohorts(id) ON DELETE SET NULL;

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  difficulty TEXT,
  duration_hours NUMERIC,
  category_tag TEXT,
  created_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_source_type TEXT CHECK(video_source_type IN ('youtube', 'upload')),
  subtitle_url TEXT,
  order_index INTEGER NOT NULL,
  duration_seconds INTEGER,
  lesson_group_index INTEGER DEFAULT 0,
  is_project_gate BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);

-- Lesson Progress
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  watch_percent NUMERIC DEFAULT 0.0,
  last_position_seconds NUMERIC DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

-- Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  questions_json JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Results
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score_percent NUMERIC NOT NULL,
  answers_json JSONB NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  project_type TEXT CHECK(project_type IN ('intermediate', 'final')),
  lesson_group_index INTEGER,
  file_url TEXT,
  submission_url TEXT,
  status TEXT CHECK(status IN ('pending', 'accepted', 'needs_revision')) DEFAULT 'pending',
  admin_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_uid TEXT UNIQUE NOT NULL,
  file_url TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body_html TEXT NOT NULL,
  image_url TEXT,
  type TEXT CHECK(type IN ('Announcement', 'Invitation', 'Schedule Change', 'Reminder')),
  target_scope TEXT CHECK(target_scope IN ('all', 'cohort', 'course')),
  target_cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  target_course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcement Reads
CREATE TABLE announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, announcement_id)
);

-- Calendar Events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  reminder_minutes_before INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Settings (Singleton)
CREATE TABLE brand_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logo_url TEXT,
  logo_filename TEXT,
  cert_template_url TEXT,
  cert_template_filename TEXT,
  cert_overlay_config_json JSONB,
  director_name TEXT,
  director_title TEXT,
  agency_display_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES OVERVIEW
-----------------------------------------------------
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- Note: In Supabase, true RLS policies will be implemented checking `auth.uid()` against `student_id` or `role = 'admin'`.
-- 20240413000000_ai_and_notes.sql
-- Add AI metadata columns to lessons and create student_notes table

-- 1. Update Lessons table with AI-related columns
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS transcript_json JSONB,
ADD COLUMN IF NOT EXISTS ai_overview TEXT,
ADD COLUMN IF NOT EXISTS ai_resources_json JSONB;

-- 2. Create Student Notes table
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

-- 3. Add RLS Policies for student_notes
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can only see their own notes" 
ON student_notes FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can edit their own notes" 
ON student_notes FOR ALL 
USING (auth.uid() = student_id);

-- 4. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_student_notes_updated_at
BEFORE UPDATE ON student_notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
-- Migration to create storage buckets for avatars and videos

-- Ensure the storage schema exists
CREATE SCHEMA IF NOT EXISTS storage;

-- Avatars Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (name) DO NOTHING;

-- Videos Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT (name) DO NOTHING;

-- Public read access policies
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Read Videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');

-- Authenticated upload policies
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Auth Upload Videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos');

-- Authenticated delete policies (optional, to manage storage)
CREATE POLICY "Auth Delete Avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Auth Delete Videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos');
-- 20240417000000_add_admin_notes.sql
-- Adds the `admin_notes` column to the `profiles` table

ALTER TABLE profiles ADD COLUMN admin_notes TEXT;
-- Migration: student_notes table + admin_notes column on profiles

-- 1. Student Notes (per lesson)
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

-- Students can only read/write their own notes
CREATE POLICY "students_own_notes" ON student_notes
  FOR ALL USING (auth.uid() = student_id);

-- 2. Admin Notes column on profiles (if not already added by previous migration)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;
