-- Drop unused RFQ/bidding/contracts tables
-- These were set up for future use but aren't needed now

-- Remove foreign key constraint first
ALTER TABLE IF EXISTS rfqs DROP CONSTRAINT IF EXISTS fk_winning_bid;

-- Drop in order due to foreign key constraints
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS rfqs;
