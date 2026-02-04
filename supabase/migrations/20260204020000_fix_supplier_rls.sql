-- Fix supplier RLS policy for signup
-- The previous policy was too restrictive - auth.uid() may not be
-- immediately available after signUp() in the same request

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Suppliers can create own record" ON suppliers;

-- Allow authenticated users to insert their own supplier record
-- The user_id is set by the client to their own auth.uid()
CREATE POLICY "Authenticated users can create supplier record"
ON suppliers FOR INSERT
TO authenticated
WITH CHECK (true);

-- Keep the existing policies for SELECT and UPDATE (user can only see/edit their own)
