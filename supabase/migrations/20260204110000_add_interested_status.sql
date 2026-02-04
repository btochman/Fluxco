-- Update supplier_bids status check to include 'interested'
ALTER TABLE supplier_bids DROP CONSTRAINT IF EXISTS supplier_bids_status_check;
ALTER TABLE supplier_bids ADD CONSTRAINT supplier_bids_status_check
  CHECK (status IN ('interested', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'));
