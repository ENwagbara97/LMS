-- Webinar Sessions Table
CREATE TABLE IF NOT EXISTS public.webinar_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  join_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.webinar_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins manage webinars" ON public.webinar_sessions FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Everyone views webinars" ON public.webinar_sessions FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN others THEN NULL; END $$;
