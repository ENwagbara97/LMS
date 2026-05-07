-- ═══════════════════════════════════════════════════════════
-- FIX 1: Ensure courses table has all required columns
-- ═══════════════════════════════════════════════════════════
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS course_group text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS total_videos int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_duration_minutes int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_duration_fetched bool DEFAULT false;

-- Ensure profiles has the columns needed by admin users API
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS assigned_course_groups text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assigned_level text,
  ADD COLUMN IF NOT EXISTS admin_notes text;

-- ═══════════════════════════════════════════════════════════
-- FIX 6B: Unique constraint on enrollments (prevent duplicates)
-- ═══════════════════════════════════════════════════════════
-- First clean any existing duplicates (keep oldest row per student+course)
DELETE FROM enrollments
WHERE id NOT IN (
  SELECT DISTINCT ON (student_id, course_id) id
  FROM enrollments
  ORDER BY student_id, course_id, created_at ASC
);

-- Add unique constraint (use IF NOT EXISTS equivalent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'enrollments_unique_student_course'
    AND conrelid = 'enrollments'::regclass
  ) THEN
    ALTER TABLE enrollments
      ADD CONSTRAINT enrollments_unique_student_course
      UNIQUE (student_id, course_id);
  END IF;
END$$;

-- ═══════════════════════════════════════════════════════════
-- FIX 9: Notifications table
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text DEFAULT 'system',
  link_url text,
  is_read bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users see own notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid())';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users update own notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid())';
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_id, is_read, created_at DESC);

-- Seed notifications from existing quiz_results (if any)
INSERT INTO notifications (user_id, title, body, type, created_at)
SELECT
  qr.student_id,
  'Quiz Completed: ' || l.title,
  'You scored ' || ROUND(qr.score_percent) || '% on ' || l.title,
  'quiz_result',
  qr.created_at
FROM quiz_results qr
JOIN lessons l ON l.id = qr.lesson_id
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- Force PostgREST schema cache reload
-- ═══════════════════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
