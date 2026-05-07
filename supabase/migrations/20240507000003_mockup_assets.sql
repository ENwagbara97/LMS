-- 20240507000003_mockup_assets.sql
-- Support for managing portfolio/mockup assets in settings

CREATE TABLE IF NOT EXISTS mockup_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text, -- e.g. 'Web', 'Mobile', 'Print'
  image_url text NOT NULL,
  display_order int DEFAULT 0,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE mockup_assets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public Read Mockup Assets" ON mockup_assets FOR SELECT USING (true);
  CREATE POLICY "Admin Manage Mockup Assets" ON mockup_assets FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN others THEN NULL; END $$;

-- Bucket for mockup assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mockups', 'mockups', true) 
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Public Read Mockups" ON storage.objects FOR SELECT USING (bucket_id = 'mockups');
  CREATE POLICY "Auth Upload Mockups" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'mockups');
EXCEPTION WHEN others THEN NULL; END $$;
