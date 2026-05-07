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
