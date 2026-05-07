-- 1A. Course grouping / hierarchy
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS level text CHECK (level IN ('beginner','intermediate','advanced', 'all levels')),
  ADD COLUMN IF NOT EXISTS course_group text,         
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS total_videos int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_duration_minutes int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_duration_fetched bool DEFAULT false;

-- 1B. Modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 1C. Lessons/videos — link to module
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES course_modules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS serial_number int,         
  ADD COLUMN IF NOT EXISTS duration_seconds int,      
  ADD COLUMN IF NOT EXISTS duration_fetched_auto bool DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order int DEFAULT 0;

-- 1D. Student progress — track exact lesson position
-- Note: Re-using or extending existing lesson_progress logic
ALTER TABLE lesson_progress
  ADD COLUMN IF NOT EXISTS last_position_seconds int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 1E. Announcements — add image support
ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS image_path text;

-- 1F. Schedule / cohort calendar events
CREATE TABLE IF NOT EXISTS schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid,                                     
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_color text DEFAULT '#0f4ff1',                
  is_all_day bool DEFAULT true,
  target_all_students bool DEFAULT true,
  created_by_admin uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- 1G. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text,                                          
  is_read bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 1H. User preferences (Extending our existing logic)
-- Ensure user_preferences table exists if profiles.preferences_json isn't enough
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_on_quiz_result bool DEFAULT true,
  email_on_project_feedback bool DEFAULT true,
  email_on_certificate bool DEFAULT true,
  weekly_progress_reminder bool DEFAULT true,
  interface_sound_effects bool DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- 1I. Quiz attempts — for retake functionality
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  score_percent numeric,
  grade numeric,
  attempt_number int DEFAULT 1,
  status text DEFAULT 'passed',                      
  taken_at timestamptz DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

-- Notifications: users SELECT only their own rows
DO $$ BEGIN
  CREATE POLICY "Users see own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- User Preferences: users SELECT/UPDATE only their own row
DO $$ BEGIN
  CREATE POLICY "Users manage own preferences" ON user_preferences FOR ALL TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Quiz Attempts: users SELECT only their own rows
DO $$ BEGIN
  CREATE POLICY "Users see own quiz attempts" ON quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN others THEN NULL; END $$;

-- Schedule Events: public SELECT enabled
DO $$ BEGIN
  CREATE POLICY "Public see schedule events" ON schedule_events FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN others THEN NULL; END $$;

-- Course Modules: public SELECT enabled
DO $$ BEGIN
  CREATE POLICY "Public see modules" ON course_modules FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN others THEN NULL; END $$;
