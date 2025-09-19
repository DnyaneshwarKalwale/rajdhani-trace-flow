-- Add missing product specification columns to products table
-- These columns store detailed product specifications like weight, thickness, dimensions, etc.

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight VARCHAR(50),
ADD COLUMN IF NOT EXISTS thickness VARCHAR(50),
ADD COLUMN IF NOT EXISTS width VARCHAR(50),
ADD COLUMN IF NOT EXISTS height VARCHAR(50),
ADD COLUMN IF NOT EXISTS pile_height VARCHAR(50),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(100);

-- Add comments to document the columns
COMMENT ON COLUMN products.weight IS 'Product weight (e.g., "45kg", "32kg")';
COMMENT ON COLUMN products.thickness IS 'Product thickness (e.g., "12mm", "10mm")';
COMMENT ON COLUMN products.width IS 'Product width (e.g., "2.44m", "1.83m")';
COMMENT ON COLUMN products.height IS 'Product height (e.g., "3.05m", "2.74m")';
COMMENT ON COLUMN products.pile_height IS 'Product pile height (e.g., "8mm", "6mm")';
COMMENT ON COLUMN products.dimensions IS 'Product dimensions (e.g., "8x10 feet", "6x9 feet")';
