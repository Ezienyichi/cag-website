-- Run this in your Supabase SQL Editor
-- Adds delivery_type column to the products table

ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'physical';

-- Update existing physical products (workbooks / homeschooling categories)
UPDATE products SET delivery_type = 'physical' WHERE category IN ('workbooks', 'homeschooling') AND delivery_type IS NULL;

-- Update existing digital products (default to 'download')
UPDATE products SET delivery_type = 'download' WHERE category = 'digital' AND delivery_type IS NULL;
