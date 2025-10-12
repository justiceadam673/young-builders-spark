-- Add policy to admin_passwords to explicitly deny all access
-- This table should only be accessed through secure functions
CREATE POLICY "No direct access to admin passwords"
ON public.admin_passwords
FOR ALL
USING (false)
WITH CHECK (false);