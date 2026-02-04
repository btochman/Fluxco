-- Add user_id column to link suppliers to Supabase Auth
ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add notify_new_listings column for marketplace notification opt-in
ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS notify_new_listings BOOLEAN DEFAULT FALSE;

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);

-- Update RLS policies for suppliers table to use auth.uid()
DROP POLICY IF EXISTS "Suppliers can view own record" ON suppliers;
DROP POLICY IF EXISTS "Suppliers can update own record" ON suppliers;
DROP POLICY IF EXISTS "Allow supplier signup" ON suppliers;

-- Allow authenticated users to insert their own supplier record
CREATE POLICY "Suppliers can create own record"
ON suppliers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow suppliers to view their own record
CREATE POLICY "Suppliers can view own record"
ON suppliers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow suppliers to update their own record
CREATE POLICY "Suppliers can update own record"
ON suppliers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS for marketplace_listings - authenticated suppliers can view listed items
DROP POLICY IF EXISTS "Anyone can view listed marketplace items" ON marketplace_listings;
CREATE POLICY "Authenticated users can view listed marketplace items"
ON marketplace_listings FOR SELECT
TO authenticated
USING (status = 'listed');
