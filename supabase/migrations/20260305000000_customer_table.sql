-- Create customers table for customer portal
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  contact_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  notion_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Create index on notion_customer_id for project lookups
CREATE INDEX IF NOT EXISTS idx_customers_notion_id ON public.customers(notion_customer_id);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own customer record
CREATE POLICY "Customers can read own record"
  ON public.customers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own customer record
CREATE POLICY "Customers can update own record"
  ON public.customers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow inserts via service role (registration API)
-- The service role bypasses RLS, so this policy allows authenticated users
-- to insert their own record as a fallback
CREATE POLICY "Allow insert for authenticated users"
  ON public.customers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can do everything (bypasses RLS by default)
-- This is implicit for service_role, but adding for clarity
CREATE POLICY "Service role full access"
  ON public.customers
  FOR ALL
  USING (auth.role() = 'service_role');
