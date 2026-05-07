-- Add is_read to announcement_reads
ALTER TABLE public.announcement_reads ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
