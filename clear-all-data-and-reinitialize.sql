-- Clear all existing data and prepare for fresh initialization
-- This script removes all existing data so the DataInitializer can create fresh data with proper QR codes

-- Clear individual products first (due to foreign key constraints)
DELETE FROM individual_products;

-- Clear products
DELETE FROM products;

-- Clear raw materials
DELETE FROM raw_materials;

-- Clear purchase orders
DELETE FROM purchase_orders;

-- Clear notifications
DELETE FROM notifications;

-- Clear audit logs (optional - you might want to keep these)
-- DELETE FROM audit_logs;

-- Reset any auto-increment sequences if they exist
-- (PostgreSQL doesn't have auto-increment, but this is here for completeness)

-- Verify the cleanup
SELECT 
  'products' as table_name,
  COUNT(*) as remaining_records
FROM products
UNION ALL
SELECT 
  'individual_products' as table_name,
  COUNT(*) as remaining_records
FROM individual_products
UNION ALL
SELECT 
  'raw_materials' as table_name,
  COUNT(*) as remaining_records
FROM raw_materials
UNION ALL
SELECT 
  'purchase_orders' as table_name,
  COUNT(*) as remaining_records
FROM purchase_orders
UNION ALL
SELECT 
  'notifications' as table_name,
  COUNT(*) as remaining_records
FROM notifications;

-- Show message
SELECT 'Data cleared successfully! You can now run the DataInitializer to create fresh data with proper QR codes.' as message;
