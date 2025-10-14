-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view announcements"
ON public.announcements
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert announcements"
ON public.announcements
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete announcements"
ON public.announcements
FOR DELETE
USING (true);

-- Add announcement password to admin_passwords table
INSERT INTO public.admin_passwords (action, password_hash)
VALUES ('announcement', '000000')
ON CONFLICT (action) DO UPDATE SET password_hash = '000000';