-- Update existing serial numbers from FLX- to FLUX-
UPDATE marketplace_listings
SET serial_number = REPLACE(serial_number, 'FLX-', 'FLUX-')
WHERE serial_number LIKE 'FLX-%';

-- Update the function to use FLUX- prefix
CREATE OR REPLACE FUNCTION generate_marketplace_serial()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.serial_number IS NULL THEN
    NEW.serial_number := 'FLUX-' || LPAD(nextval('marketplace_serial_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
