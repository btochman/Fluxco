-- Add serial_number column to marketplace_listings
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS serial_number VARCHAR(20);

-- Create a sequence for serial numbers
CREATE SEQUENCE IF NOT EXISTS marketplace_serial_seq START WITH 1001;

-- Update existing rows with serial numbers
UPDATE marketplace_listings
SET serial_number = 'FLX-' || LPAD(nextval('marketplace_serial_seq')::text, 5, '0')
WHERE serial_number IS NULL;

-- Create a function to auto-generate serial numbers
CREATE OR REPLACE FUNCTION generate_marketplace_serial()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.serial_number IS NULL THEN
    NEW.serial_number := 'FLX-' || LPAD(nextval('marketplace_serial_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign serial numbers on insert
DROP TRIGGER IF EXISTS set_marketplace_serial ON marketplace_listings;
CREATE TRIGGER set_marketplace_serial
  BEFORE INSERT ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION generate_marketplace_serial();
