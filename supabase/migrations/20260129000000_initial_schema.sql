-- FluxCo Supabase Database Schema
-- Run this in your Supabase SQL editor to set up all tables

-- ============================================================================
-- EMPLOYEE & SUPPLIER AUTHENTICATION
-- ============================================================================

-- Employee users table
CREATE TABLE IF NOT EXISTS employee_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'engineer', 'sales', 'operations')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Supplier accounts table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'USA',
  certifications TEXT[], -- Array of certifications
  specialties TEXT[], -- Types of transformers they manufacture
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- QUOTE REQUESTS (from contact forms)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  product_interest VARCHAR(255),
  project_details TEXT,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  assigned_to UUID REFERENCES employee_users(id),
  estimated_value DECIMAL(12, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROJECTS (transformer design projects)
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_company VARCHAR(255),

  -- Transformer specifications
  rated_power_kva INTEGER NOT NULL,
  primary_voltage INTEGER NOT NULL,
  secondary_voltage INTEGER NOT NULL,
  frequency INTEGER DEFAULT 60,
  phases INTEGER DEFAULT 3,
  vector_group VARCHAR(20),
  cooling_class VARCHAR(20),
  impedance_percent DECIMAL(5, 2),

  -- Design details (JSON for flexibility)
  design_specs JSONB,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'design' CHECK (status IN ('design', 'review', 'approved', 'manufacturing', 'testing', 'shipped', 'completed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Assignments
  lead_engineer UUID REFERENCES employee_users(id),
  sales_rep UUID REFERENCES employee_users(id),

  -- Financials
  quoted_price DECIMAL(12, 2),
  final_price DECIMAL(12, 2),

  -- Dates
  quote_date DATE,
  order_date DATE,
  target_delivery DATE,
  actual_delivery DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MARKETPLACE LISTINGS (user-submitted designs for sale)
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Design specs
  rated_power_kva INTEGER NOT NULL,
  primary_voltage INTEGER NOT NULL,
  secondary_voltage INTEGER NOT NULL,
  frequency INTEGER DEFAULT 60,
  phases INTEGER DEFAULT 3,
  impedance_percent DECIMAL(5, 2),
  vector_group VARCHAR(50),
  cooling_class VARCHAR(50),
  conductor_type VARCHAR(50),
  steel_grade VARCHAR(100),

  -- Calculated values from design tool
  estimated_cost DECIMAL(12, 2),
  no_load_loss_w DECIMAL(10, 2),
  load_loss_w DECIMAL(10, 2),
  efficiency_percent DECIMAL(5, 2),
  total_weight_kg DECIMAL(10, 2),

  -- Contact info
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  asking_price DECIMAL(12, 2),
  notes TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'listed', 'sold', 'rejected', 'expired')),
  reviewed_by UUID REFERENCES employee_users(id),
  review_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ORDERS (fulfillment tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),

  -- Customer info
  customer_name VARCHAR(255) NOT NULL,
  customer_company VARCHAR(255),
  shipping_address TEXT,

  -- Order details
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12, 2),
  total_price DECIMAL(12, 2),

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_production', 'quality_check', 'ready_to_ship', 'shipped', 'delivered', 'cancelled')),

  -- Tracking
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),

  -- Dates
  order_date DATE DEFAULT CURRENT_DATE,
  estimated_ship_date DATE,
  actual_ship_date DATE,
  delivery_date DATE,

  -- Assignments
  assigned_to UUID REFERENCES employee_users(id),

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RFQs (Request for Quotes - sent to suppliers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rfqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_number VARCHAR(50) UNIQUE NOT NULL,
  project_id UUID REFERENCES projects(id),

  -- Transformer specs
  rated_power_kva INTEGER NOT NULL,
  primary_voltage INTEGER NOT NULL,
  secondary_voltage INTEGER NOT NULL,
  frequency INTEGER DEFAULT 60,
  phases INTEGER DEFAULT 3,
  vector_group VARCHAR(20),
  cooling_class VARCHAR(20),

  -- Requirements
  quantity INTEGER DEFAULT 1,
  special_requirements TEXT,

  -- Deadlines
  bid_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_deadline DATE,

  -- Status
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'awarded', 'cancelled')),

  -- Winner
  winning_bid_id UUID, -- Will reference bids table
  winning_supplier_id UUID REFERENCES suppliers(id),

  created_by UUID REFERENCES employee_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BIDS (supplier bids on RFQs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_id UUID REFERENCES rfqs(id) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) NOT NULL,

  -- Bid details
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  lead_time_weeks INTEGER NOT NULL,
  notes TEXT,

  -- Technical details (optional)
  technical_specs JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'withdrawn')),

  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES employee_users(id),

  UNIQUE(rfq_id, supplier_id) -- One bid per supplier per RFQ
);

-- Add foreign key for winning bid
ALTER TABLE rfqs ADD CONSTRAINT fk_winning_bid FOREIGN KEY (winning_bid_id) REFERENCES bids(id);

-- ============================================================================
-- CONTRACTS (won contracts between FluxCo and suppliers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  rfq_id UUID REFERENCES rfqs(id),
  bid_id UUID REFERENCES bids(id),
  supplier_id UUID REFERENCES suppliers(id) NOT NULL,
  project_id UUID REFERENCES projects(id),

  -- Contract details
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_value DECIMAL(12, 2) NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'in_production', 'shipped', 'completed', 'cancelled')),

  -- Dates
  contract_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  actual_delivery_date DATE,

  terms TEXT,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- JOB APPLICATIONS (from careers page)
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id VARCHAR(50) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  about TEXT,
  resume_url TEXT,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'interviewing', 'offered', 'hired', 'rejected')),
  reviewed_by UUID REFERENCES employee_users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INVENTORY (transformer inventory)
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku VARCHAR(50) UNIQUE,

  -- Product info
  type VARCHAR(20) CHECK (type IN ('new', 'refurbished')),
  category VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(255),
  model VARCHAR(255),

  -- Specs
  capacity VARCHAR(50) NOT NULL, -- e.g., "1500 kVA"
  voltage VARCHAR(100), -- e.g., "13.8kV/480V"
  frequency INTEGER DEFAULT 60,
  phases INTEGER DEFAULT 3,
  cooling_class VARCHAR(20),

  -- Compliance
  feoc_compliant BOOLEAN DEFAULT FALSE,
  certifications TEXT[],

  -- Location & availability
  location VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  available BOOLEAN DEFAULT TRUE,

  -- Pricing
  price VARCHAR(50), -- Can be numeric or "Contact for Price"

  -- Condition (for refurbished)
  condition VARCHAR(50),
  year_manufactured INTEGER,

  notes TEXT,
  images TEXT[], -- Array of image URLs

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_name);

CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_name);

CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_deadline ON rfqs(bid_deadline);

CREATE INDEX IF NOT EXISTS idx_bids_rfq ON bids(rfq_id);
CREATE INDEX IF NOT EXISTS idx_bids_supplier ON bids(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);

CREATE INDEX IF NOT EXISTS idx_contracts_supplier ON contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON inventory(type);
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(available);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE employee_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Note: You'll need to create specific policies based on your auth setup
-- Example policy for suppliers to only see their own bids:
-- CREATE POLICY "Suppliers can view own bids" ON bids
--   FOR SELECT USING (supplier_id = auth.uid());

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample employee users (password: fluxco123 - you should hash these properly)
INSERT INTO employee_users (email, password_hash, name, role) VALUES
  ('admin@fluxco.com', 'fluxco123', 'Admin User', 'admin'),
  ('engineer@fluxco.com', 'fluxco123', 'Lead Engineer', 'engineer'),
  ('sales@fluxco.com', 'fluxco123', 'Sales Manager', 'sales'),
  ('ops@fluxco.com', 'fluxco123', 'Operations Lead', 'operations')
ON CONFLICT (email) DO NOTHING;

-- Insert sample supplier
INSERT INTO suppliers (email, password_hash, company_name, contact_name, city, country, certifications, specialties) VALUES
  ('supplier@acmetransformers.com', 'supplier123', 'Acme Transformers Inc.', 'John Smith', 'Houston', 'USA',
   ARRAY['ISO 9001', 'IEEE C57'], ARRAY['Distribution', 'Power', 'Padmount'])
ON CONFLICT (email) DO NOTHING;
