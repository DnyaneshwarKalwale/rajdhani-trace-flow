-- Clear all hardcoded QR codes from database
-- This script removes all existing QR codes so they can be generated dynamically

-- Clear QR codes from products table
UPDATE products 
SET qr_code = NULL 
WHERE qr_code IS NOT NULL;

-- Clear QR codes from individual_products table
UPDATE individual_products 
SET qr_code = NULL 
WHERE qr_code IS NOT NULL;

-- Verify the updates
SELECT 
  'products' as table_name,
  COUNT(*) as total_records,
  COUNT(qr_code) as records_with_qr_codes
FROM products
UNION ALL
SELECT 
  'individual_products' as table_name,
  COUNT(*) as total_records,
  COUNT(qr_code) as records_with_qr_codes
FROM individual_products;
