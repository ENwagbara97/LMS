-- 20240417000000_add_admin_notes.sql
-- Adds the `admin_notes` column to the `profiles` table

ALTER TABLE profiles ADD COLUMN admin_notes TEXT;
