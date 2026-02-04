-- Allow authenticated users to read marketplace listings
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view listed marketplace items"
ON marketplace_listings
FOR SELECT
USING (status = 'listed');
