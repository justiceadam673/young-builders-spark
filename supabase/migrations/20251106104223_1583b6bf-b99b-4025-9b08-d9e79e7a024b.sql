-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT NOT NULL,
  file_url TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create policies for books
CREATE POLICY "Anyone can view books"
ON public.books
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert books"
ON public.books
FOR INSERT
WITH CHECK (true);

-- Create storage buckets for books
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-files', 'book-files', true);

-- Create storage policies for book covers
CREATE POLICY "Anyone can view book covers"
ON storage.objects
FOR SELECT
USING (bucket_id = 'book-covers');

CREATE POLICY "Anyone can upload book covers"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'book-covers');

-- Create storage policies for book files
CREATE POLICY "Anyone can view book files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'book-files');

CREATE POLICY "Anyone can upload book files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'book-files');