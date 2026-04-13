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
