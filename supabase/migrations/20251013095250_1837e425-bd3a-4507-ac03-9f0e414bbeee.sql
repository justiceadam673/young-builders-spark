-- Enable INSERT for messages table
CREATE POLICY "Anyone can insert messages"
ON public.messages
FOR INSERT
WITH CHECK (true);

-- Enable INSERT for gallery_images table
CREATE POLICY "Anyone can insert gallery images"
ON public.gallery_images
FOR INSERT
WITH CHECK (true);

-- Create storage policies for gallery bucket
CREATE POLICY "Anyone can upload to gallery"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Anyone can view gallery files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');

-- Create messages audio bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('messages', 'messages', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for messages bucket
CREATE POLICY "Anyone can upload to messages"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'messages');

CREATE POLICY "Anyone can view message files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'messages');