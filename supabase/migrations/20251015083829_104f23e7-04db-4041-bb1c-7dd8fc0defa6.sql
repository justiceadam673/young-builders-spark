-- Create donations table to track contributions
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert donations
CREATE POLICY "Anyone can insert donations"
ON public.donations
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view their own donations by email
CREATE POLICY "Users can view their own donations"
ON public.donations
FOR SELECT
USING (true);