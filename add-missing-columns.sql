-- Add missing columns to existing tables
-- Run this if you already have tables but missing some columns

-- Add missing columns to raw_materials table
ALTER TABLE raw_materials 
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS min_threshold DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_capacity DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS reorder_point DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_usage DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_value DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS supplier_performance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quality_grade VARCHAR(10),
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS last_restocked DATE;

-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 1000;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
