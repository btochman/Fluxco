-- Update all marketplace listings to 'listed' status
UPDATE marketplace_listings SET status = 'listed' WHERE status = 'pending_review';
