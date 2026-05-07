-- Add last_announcement_seen to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_announcement_seen TIMESTAMPTZ DEFAULT '-infinity';

-- Update Announcement Modal Logic to use this field
