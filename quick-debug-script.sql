-- Quick Debug Script - Run this to check your database status
-- Use this to verify everything is working correctly

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('products', 'individual_products', 'raw_materials', 'orders', 'order_items', 'customers')
ORDER BY table_name;

-- 2. Check column types for ID columns
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('products', 'individual_products', 'raw_materials', 'orders', 'order_items', 'customers')
    AND (column_name = 'id' OR column_name LIKE '%_id')
ORDER BY table_name, column_name;

-- 3. Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('products', 'individual_products', 'raw_materials', 'orders', 'order_items', 'customers')
ORDER BY tc.table_name, kcu.column_name;

-- 4. Check recent products (if any exist)
SELECT id, name, category, created_at 
FROM products 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check recent individual products (if any exist)
SELECT id, product_id, product_name, created_at 
FROM individual_products 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check recent raw materials (if any exist)
SELECT id, name, created_at 
FROM raw_materials 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Check audit logs (if any exist)
SELECT id, action, table_name, timestamp 
FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 5;
