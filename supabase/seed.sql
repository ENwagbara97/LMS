-- seed.sql for Kreativhub

INSERT INTO public.cohorts (id, name, start_date)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Batch 4 — May 2025', '2025-05-01'),
  ('22222222-2222-2222-2222-222222222222', 'Batch 5 — June 2025', '2025-06-01');

INSERT INTO public.courses (id, title, description, category_tag, difficulty, duration_hours)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'UI Design Fundamentals', 'Learn to craft beautiful interfaces.', 'UI Design', 'Beginner', 10),
  ('44444444-4444-4444-4444-444444444444', 'Advanced Typography', 'Master the art of type layout.', 'Typography', 'Advanced', 4);

INSERT INTO public.lessons (id, course_id, title, description, video_url, video_source_type, order_index, duration_seconds)
VALUES 
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Introduction to UI', 'The basics of UI design.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 1, 600),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Color Theory', 'Understanding color palettes.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 2, 900);

INSERT INTO public.brand_settings (id, logo_filename, agency_display_name, director_name, director_title)
VALUES ('00000000-0000-0000-0000-000000000000', 'kreative_hub_logo.png', 'Kreativhub', 'Jane Director', 'Lead Instructor');
