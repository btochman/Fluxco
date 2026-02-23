-- Add missing columns to marketplace_listings
-- design_specs: JSONB for full design data from spec builder
-- zipcode: project location zipcode from contact form

ALTER TABLE marketplace_listings
ADD COLUMN IF NOT EXISTS design_specs JSONB;

ALTER TABLE marketplace_listings
ADD COLUMN IF NOT EXISTS zipcode VARCHAR(20);
