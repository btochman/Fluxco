-- Add manufacturing capacity and website fields to suppliers table
ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS website VARCHAR(255);

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS kva_range_min INTEGER;

ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS kva_range_max INTEGER;
