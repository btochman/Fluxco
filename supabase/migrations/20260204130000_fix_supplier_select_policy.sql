-- Ensure suppliers can read their own profile
DROP POLICY IF EXISTS "Suppliers can view own record" ON suppliers;

CREATE POLICY "Suppliers can view own record"
ON suppliers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
