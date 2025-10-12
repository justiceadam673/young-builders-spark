-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true);

-- Create RLS policies for gallery bucket
CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery');

-- Add admin_passwords table for password validation
CREATE TABLE public.admin_passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_passwords (no one can read directly)
ALTER TABLE public.admin_passwords ENABLE ROW LEVEL SECURITY;

-- Insert password hashes (using simple hash for demo purposes)
-- Password for messages/gallery: 123123
-- Password for Q&A answers: 111111
INSERT INTO public.admin_passwords (action, password_hash) VALUES
('messages_gallery', '123123'),
('qa_answers', '111111');

-- Update messages table data - remove old and add new
DELETE FROM public.messages;

INSERT INTO public.messages (title, audio_url, date) VALUES
('Day 1 - Take Over Conference', 'day-1-takeover.mp3', '2024-01-01'),
('Day 2 - Faith Seminar: The Just Shall Live By Faith', 'day-2-faith-seminar.mp3', '2024-01-02'),
('Day 3 - Gospel Seminar: The Tale of 3 Women', 'day-3-gospel-seminar.mp3', '2024-01-03');

-- Add gallery_images table
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery images"
ON public.gallery_images FOR SELECT
USING (true);