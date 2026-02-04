-- Add zipcode to marketplace_listings
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS zipcode VARCHAR(20);

-- Update status check constraint to include 'completed'
ALTER TABLE marketplace_listings DROP CONSTRAINT IF EXISTS marketplace_listings_status_check;
ALTER TABLE marketplace_listings ADD CONSTRAINT marketplace_listings_status_check
  CHECK (status IN ('pending_review', 'approved', 'listed', 'sold', 'rejected', 'expired', 'completed'));

-- Create supplier_bids table
CREATE TABLE IF NOT EXISTS supplier_bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  -- Bid details
  bid_price DECIMAL(12, 2) NOT NULL,
  lead_time_weeks INTEGER NOT NULL,
  notes TEXT,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected', 'withdrawn')),

  -- Interest expressed (first step before formal bid)
  interest_expressed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate bids from same supplier on same listing
  UNIQUE(listing_id, supplier_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_supplier_bids_listing ON supplier_bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_supplier_bids_supplier ON supplier_bids(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_bids_status ON supplier_bids(status);

-- Enable RLS
ALTER TABLE supplier_bids ENABLE ROW LEVEL SECURITY;

-- Suppliers can view their own bids
CREATE POLICY "Suppliers can view own bids"
ON supplier_bids
FOR SELECT
USING (supplier_id IN (
  SELECT id FROM suppliers WHERE user_id = auth.uid()
));

-- Suppliers can insert their own bids
CREATE POLICY "Suppliers can create bids"
ON supplier_bids
FOR INSERT
WITH CHECK (supplier_id IN (
  SELECT id FROM suppliers WHERE user_id = auth.uid()
));

-- Suppliers can update their own bids
CREATE POLICY "Suppliers can update own bids"
ON supplier_bids
FOR UPDATE
USING (supplier_id IN (
  SELECT id FROM suppliers WHERE user_id = auth.uid()
));

-- Add 12 mock completed listings
INSERT INTO marketplace_listings (
  rated_power_kva, primary_voltage, secondary_voltage, frequency, phases,
  impedance_percent, vector_group, cooling_class, conductor_type, steel_grade,
  estimated_cost, efficiency_percent, total_weight_kg,
  contact_name, contact_email, contact_phone, zipcode, status, created_at
) VALUES
-- Completed listings (12)
(500, 13800, 480, 60, 3, 5.75, 'Dyn11', 'ONAN', 'Copper', 'M3', 45000, 98.5, 1800, 'John Smith', 'john@example.com', '555-0101', '78701', 'completed', NOW() - INTERVAL '45 days'),
(750, 34500, 480, 60, 3, 6.0, 'Dyn11', 'ONAN', 'Copper', 'M3', 62000, 98.7, 2400, 'Sarah Johnson', 'sarah@example.com', '555-0102', '78702', 'completed', NOW() - INTERVAL '42 days'),
(1000, 13800, 4160, 60, 3, 5.5, 'YNd1', 'ONAN', 'Copper', 'M4', 78000, 98.9, 3200, 'Mike Davis', 'mike@example.com', '555-0103', '78703', 'completed', NOW() - INTERVAL '38 days'),
(1500, 34500, 480, 60, 3, 6.25, 'Dyn11', 'ONAF', 'Copper', 'M3', 95000, 99.0, 4100, 'Lisa Brown', 'lisa@example.com', '555-0104', '78704', 'completed', NOW() - INTERVAL '35 days'),
(2000, 69000, 13800, 60, 3, 7.0, 'YNyn0', 'ONAF', 'Copper', 'HiB', 125000, 99.1, 5500, 'David Wilson', 'david@example.com', '555-0105', '78705', 'completed', NOW() - INTERVAL '30 days'),
(2500, 13800, 480, 60, 3, 5.75, 'Dyn11', 'ONAF', 'Copper', 'M4', 145000, 99.2, 6200, 'Emily Taylor', 'emily@example.com', '555-0106', '78706', 'completed', NOW() - INTERVAL '28 days'),
(3000, 34500, 4160, 60, 3, 6.5, 'YNd1', 'ONAF', 'Copper', 'HiB', 175000, 99.3, 7800, 'Chris Martin', 'chris@example.com', '555-0107', '78707', 'completed', NOW() - INTERVAL '25 days'),
(5000, 69000, 13800, 60, 3, 7.5, 'YNyn0', 'ONAF', 'Copper', 'HiB', 285000, 99.4, 12000, 'Amanda Lee', 'amanda@example.com', '555-0108', '78708', 'completed', NOW() - INTERVAL '22 days'),
(7500, 138000, 34500, 60, 3, 8.0, 'YNa0d11', 'ONAN/ONAF', 'Copper', 'Laser', 425000, 99.5, 18500, 'Robert Garcia', 'robert@example.com', '555-0109', '78709', 'completed', NOW() - INTERVAL '18 days'),
(10000, 138000, 13800, 60, 3, 9.0, 'YNa0d11', 'ONAN/ONAF', 'Copper', 'Laser', 580000, 99.6, 24000, 'Jennifer White', 'jennifer@example.com', '555-0110', '78710', 'completed', NOW() - INTERVAL '15 days'),
(15000, 230000, 34500, 60, 3, 10.0, 'YNa0d11', 'ONAN/ONAF/OFAF', 'Copper', 'Laser', 850000, 99.65, 38000, 'Kevin Anderson', 'kevin@example.com', '555-0111', '78711', 'completed', NOW() - INTERVAL '10 days'),
(20000, 230000, 69000, 60, 3, 11.0, 'YNa0d11', 'ONAN/ONAF/OFAF', 'Copper', 'Laser', 1150000, 99.7, 52000, 'Michelle Thomas', 'michelle@example.com', '555-0112', '78712', 'completed', NOW() - INTERVAL '5 days');
