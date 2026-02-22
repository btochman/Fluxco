-- Add spec_mode column to marketplace_listings
ALTER TABLE marketplace_listings
ADD COLUMN IF NOT EXISTS spec_mode VARCHAR(10) DEFAULT 'lite';

COMMENT ON COLUMN marketplace_listings.spec_mode IS 'lite or pro - indicates which spec builder mode was used';
