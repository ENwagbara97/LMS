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
