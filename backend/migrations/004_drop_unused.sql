-- Drop unused columns and tables as per requirements
ALTER TABLE dishes DROP COLUMN IF EXISTS price_vnd;
ALTER TABLE dishes DROP COLUMN IF EXISTS rating;
DROP TABLE IF EXISTS users CASCADE;
