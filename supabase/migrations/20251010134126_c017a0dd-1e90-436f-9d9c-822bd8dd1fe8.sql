-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit contact forms
CREATE POLICY "Anyone can insert contact submissions"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create testimonies table
CREATE TABLE public.testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  testimony TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  approved BOOLEAN DEFAULT false NOT NULL
);

-- Enable RLS
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

-- Anyone can submit testimonies
CREATE POLICY "Anyone can insert testimonies"
ON public.testimonies
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anyone can view approved testimonies
CREATE POLICY "Anyone can view approved testimonies"
ON public.testimonies
FOR SELECT
TO anon, authenticated
USING (approved = true);

-- Create questions table for Q&A
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit questions
CREATE POLICY "Anyone can insert questions"
ON public.questions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anyone can view answered questions
CREATE POLICY "Anyone can view answered questions"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (answer IS NOT NULL);

-- Create messages table for audio message metadata
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can view messages
CREATE POLICY "Anyone can view messages"
ON public.messages
FOR SELECT
TO anon, authenticated
USING (true);

-- Insert the existing audio message
INSERT INTO public.messages (title, audio_url, date) 
VALUES ('Day 1 - Take Over Conference', '/src/assets/audio/day-1-takeover.mp3', 'January 2025');