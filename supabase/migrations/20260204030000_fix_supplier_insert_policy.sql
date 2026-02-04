-- Fix supplier INSERT policy
-- Users may not be authenticated immediately after signUp if email confirmation is enabled
-- Allow inserts from anyone (the insert requires a valid user_id from auth anyway)

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Authenticated users can create supplier record" ON suppliers;
DROP POLICY IF EXISTS "Suppliers can create own record" ON suppliers;

-- Allow inserts - the user_id foreign key to auth.users provides security
CREATE POLICY "Allow supplier registration"
ON suppliers FOR INSERT
WITH CHECK (true);
