-- Make password_hash nullable since we're using Supabase Auth
ALTER TABLE suppliers ALTER COLUMN password_hash DROP NOT NULL;

-- Set a default for existing code that might reference it
ALTER TABLE suppliers ALTER COLUMN password_hash SET DEFAULT '';
