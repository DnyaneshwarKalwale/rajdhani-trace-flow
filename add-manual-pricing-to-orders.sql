-- add-manual-pricing-to-orders.sql
-- Run this to add manual pricing fields to orders table

-- Add manual pricing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pricing_notes TEXT;

-- Add manual pricing columns to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS pricing_notes TEXT;

-- Show confirmation
SELECT 'Manual pricing columns added successfully to orders and order_items tables' as status;
