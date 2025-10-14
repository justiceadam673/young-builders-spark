-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view blog posts
CREATE POLICY "Anyone can view blog posts"
ON public.blog_posts
FOR SELECT
USING (true);

-- Allow anyone to insert blog posts (will be protected by password in frontend)
CREATE POLICY "Anyone can insert blog posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (true);

-- Create blog_comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blog_comments
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view comments
CREATE POLICY "Anyone can view comments"
ON public.blog_comments
FOR SELECT
USING (true);

-- Allow anyone to insert comments
CREATE POLICY "Anyone can insert comments"
ON public.blog_comments
FOR INSERT
WITH CHECK (true);

-- Add blog creation password to admin_passwords
INSERT INTO public.admin_passwords (action, password_hash)
VALUES ('blog_create', '123456')
ON CONFLICT (action) DO UPDATE SET password_hash = '123456';