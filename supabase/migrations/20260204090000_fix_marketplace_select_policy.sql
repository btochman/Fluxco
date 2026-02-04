-- Update policy to allow viewing both listed and completed items
DROP POLICY IF EXISTS "Anyone can view listed marketplace items" ON marketplace_listings;

CREATE POLICY "Anyone can view marketplace items"
ON marketplace_listings
FOR SELECT
USING (status IN ('listed', 'completed'));
