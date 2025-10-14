-- Drop the restrictive policy that only allows viewing answered questions
DROP POLICY IF EXISTS "Anyone can view answered questions" ON public.questions;

-- Create a new policy that allows anyone to view all questions (both answered and unanswered)
CREATE POLICY "Anyone can view all questions"
ON public.questions
FOR SELECT
USING (true);

-- Also add a policy to allow updating questions (for adding answers)
CREATE POLICY "Anyone can update questions"
ON public.questions
FOR UPDATE
USING (true)
WITH CHECK (true);