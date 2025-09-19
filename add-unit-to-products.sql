-- Add unit field to products table
-- This is needed for raw material products like Marble Powder

ALTER TABLE products ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'pieces';
