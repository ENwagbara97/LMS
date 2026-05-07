-- 20240507000002_lesson_materials.sql
-- Add support for manual lesson materials (Resources)

-- 1. Add manual_resources_json column to lessons
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS manual_resources_json JSONB DEFAULT '[]'::jsonb;

-- 2. Ensure lesson-materials storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson-materials', 'lesson-materials', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policies for lesson-materials
DO $$ BEGIN
  CREATE POLICY "Public Read Lesson Materials" ON storage.objects 
  FOR SELECT USING (bucket_id = 'lesson-materials');
  
  CREATE POLICY "Auth Upload Lesson Materials" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-materials');
  
  CREATE POLICY "Auth Delete Lesson Materials" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'lesson-materials');
EXCEPTION WHEN others THEN NULL; END $$;
