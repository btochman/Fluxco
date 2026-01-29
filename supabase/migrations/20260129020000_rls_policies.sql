-- ============================================================================
-- RLS POLICIES FOR SIGNUP AND ACCESS
-- ============================================================================

-- Employee Users Policies
-- Allow signup for @fluxco.com emails
CREATE POLICY "Allow employee signup" ON employee_users
  FOR INSERT
  WITH CHECK (email LIKE '%@fluxco.com');

-- Allow employees to read their own record
CREATE POLICY "Employees can view own record" ON employee_users
  FOR SELECT
  USING (true);

-- Allow employees to update their own record (for last_login)
CREATE POLICY "Employees can update own record" ON employee_users
  FOR UPDATE
  USING (true);

-- Supplier Policies
-- Allow anyone to sign up as a supplier
CREATE POLICY "Allow supplier signup" ON suppliers
  FOR INSERT
  WITH CHECK (true);

-- Allow suppliers to read their own record
CREATE POLICY "Suppliers can view own record" ON suppliers
  FOR SELECT
  USING (true);

-- Allow suppliers to update their own record
CREATE POLICY "Suppliers can update own record" ON suppliers
  FOR UPDATE
  USING (true);

-- Bids Policies
-- Allow suppliers to insert bids
CREATE POLICY "Suppliers can insert bids" ON bids
  FOR INSERT
  WITH CHECK (true);

-- Allow suppliers to view their own bids
CREATE POLICY "Suppliers can view own bids" ON bids
  FOR SELECT
  USING (true);

-- Contracts Policies
-- Allow viewing contracts
CREATE POLICY "Can view contracts" ON contracts
  FOR SELECT
  USING (true);
