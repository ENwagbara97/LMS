-- 1J. Storage buckets for announcements and course thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('announcement-images', 'announcement-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-thumbnails', 'course-thumbnails', true) ON CONFLICT (id) DO NOTHING;

-- Public Read Policies
DO $$ BEGIN
  CREATE POLICY "Public Read Announcements" ON storage.objects FOR SELECT USING (bucket_id = 'announcement-images');
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Course Thumbs" ON storage.objects FOR SELECT USING (bucket_id = 'course-thumbnails');
EXCEPTION WHEN others THEN NULL; END $$;

-- Authenticated Write Policies
DO $$ BEGIN
  CREATE POLICY "Auth Upload Announcements" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'announcement-images');
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth Upload Course Thumbs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-thumbnails');
EXCEPTION WHEN others THEN NULL; END $$;

-- Authenticated Delete Policies
DO $$ BEGIN
  CREATE POLICY "Auth Delete Announcements" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'announcement-images');
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth Delete Course Thumbs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'course-thumbnails');
EXCEPTION WHEN others THEN NULL; END $$;
