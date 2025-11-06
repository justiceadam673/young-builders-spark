-- Create book reviews table
CREATE TABLE public.book_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  review TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for viewing and inserting reviews
CREATE POLICY "Anyone can view book reviews" 
ON public.book_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert book reviews" 
ON public.book_reviews 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_book_reviews_book_id ON public.book_reviews(book_id);
CREATE INDEX idx_book_reviews_created_at ON public.book_reviews(created_at DESC);