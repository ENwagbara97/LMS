-- 20240427110000_student_progress_and_checks.sql
-- Completing the schema requirements for the Master Fix

-- 1D. Student progress — track per-course state for "Jump Back In"
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  last_lesson_id uuid REFERENCES lessons(id),
  last_module_id uuid REFERENCES course_modules(id),
  last_position_seconds int DEFAULT 0,
  total_hours_learned numeric DEFAULT 0,
  certificates_earned int DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- RLS for student_progress
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own course progress" ON student_progress 
  FOR ALL TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- 1J. Ensure Storage Buckets (Note: SQL for storage is specific to Supabase)
-- These are usually handled via the dashboard or a setup script, but we can attempt to insert into storage.buckets
-- Ensure the storage schema exists
CREATE SCHEMA IF NOT EXISTS storage;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('announcement-images', 'announcement-images', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-thumbnails', 'course-thumbnails', true) 
ON CONFLICT (id) DO NOTHING;

-- Public read access policies for the new buckets
DO $$ BEGIN
  CREATE POLICY "Public Read Announcement Images" ON storage.objects FOR SELECT USING (bucket_id = 'announcement-images');
  CREATE POLICY "Public Read Course Thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'course-thumbnails');
EXCEPTION WHEN others THEN NULL; END $$;

-- 1K. Profile extensions for enrollment automation
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS assigned_course_groups text[],
  ADD COLUMN IF NOT EXISTS assigned_level text,
  ADD COLUMN IF NOT EXISTS cohort_id uuid REFERENCES cohorts(id);

-- Authenticated upload policies
DO $$ BEGIN
  CREATE POLICY "Auth Upload Announcement Images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'announcement-images');
  CREATE POLICY "Auth Upload Course Thumbnails" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-thumbnails');
EXCEPTION WHEN others THEN NULL; END $$;
