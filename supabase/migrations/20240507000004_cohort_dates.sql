-- 20240507000004_cohort_dates.sql
-- Add end_date to cohorts and ensure we can track specialized meetings

ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS end_date DATE;

-- Allow calendar_events to have a type
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'event' CHECK (event_type IN ('event', 'meeting', 'deadline', 'milestone'));
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS join_url TEXT;

-- Policy for admin to manage all calendar events
DO $$ BEGIN
  CREATE POLICY "Admin Manage All Calendar Events" ON calendar_events FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN others THEN NULL; END $$;
