-- FINAL DATABASE FIX - Complete Schema Update
-- This script fixes all foreign key constraint issues by ensuring proper data types

-- Step 1: Drop ALL foreign key constraints that might be causing issues
ALTER TABLE IF EXISTS individual_products DROP CONSTRAINT IF EXISTS individual_products_product_id_fkey;
ALTER TABLE IF EXISTS order_items DROP CONSTRAINT IF EXISTS order_items_individual_product_id_fkey;
ALTER TABLE IF EXISTS order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE IF EXISTS product_materials DROP CONSTRAINT IF EXISTS product_materials_product_id_fkey;
ALTER TABLE IF EXISTS product_materials DROP CONSTRAINT IF EXISTS product_materials_material_id_fkey;
ALTER TABLE IF EXISTS production_batches DROP CONSTRAINT IF EXISTS production_batches_product_id_fkey;
ALTER TABLE IF EXISTS production_steps DROP CONSTRAINT IF EXISTS production_steps_batch_id_fkey;
ALTER TABLE IF EXISTS audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_id_fkey;

-- Step 2: Remove UUID defaults from all ID columns
ALTER TABLE IF EXISTS products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS individual_products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS individual_products ALTER COLUMN product_id DROP DEFAULT;
ALTER TABLE IF EXISTS raw_materials ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS customers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS orders ALTER COLUMN customer_id DROP DEFAULT;
ALTER TABLE IF EXISTS order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS order_items ALTER COLUMN product_id DROP DEFAULT;
ALTER TABLE IF EXISTS order_items ALTER COLUMN individual_product_id DROP DEFAULT;
ALTER TABLE IF EXISTS product_materials ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS product_materials ALTER COLUMN product_id DROP DEFAULT;
ALTER TABLE IF EXISTS product_materials ALTER COLUMN material_id DROP DEFAULT;
ALTER TABLE IF EXISTS production_batches ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS production_batches ALTER COLUMN product_id DROP DEFAULT;
ALTER TABLE IF EXISTS production_steps ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS production_steps ALTER COLUMN batch_id DROP DEFAULT;
ALTER TABLE IF EXISTS audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS audit_logs ALTER COLUMN entity_id DROP DEFAULT;

-- Step 3: Change all ID columns to VARCHAR(50) to support custom IDs
ALTER TABLE IF EXISTS products ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS individual_products ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS individual_products ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS raw_materials ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS customers ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS orders ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS orders ALTER COLUMN customer_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS order_items ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS order_items ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS order_items ALTER COLUMN individual_product_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS product_materials ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS product_materials ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS product_materials ALTER COLUMN material_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS production_batches ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS production_batches ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS production_steps ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS production_steps ALTER COLUMN batch_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS audit_logs ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS audit_logs ALTER COLUMN entity_id TYPE VARCHAR(50);

-- Step 4: Recreate all foreign key constraints with proper types
ALTER TABLE individual_products 
ADD CONSTRAINT individual_products_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_individual_product_id_fkey 
FOREIGN KEY (individual_product_id) REFERENCES individual_products(id) ON DELETE SET NULL;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE orders 
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE product_materials 
ADD CONSTRAINT product_materials_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_materials 
ADD CONSTRAINT product_materials_material_id_fkey 
FOREIGN KEY (material_id) REFERENCES raw_materials(id) ON DELETE CASCADE;

ALTER TABLE production_batches 
ADD CONSTRAINT production_batches_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE production_steps 
ADD CONSTRAINT production_steps_batch_id_fkey 
FOREIGN KEY (batch_id) REFERENCES production_batches(id) ON DELETE CASCADE;

ALTER TABLE audit_logs 
ADD CONSTRAINT audit_logs_entity_id_fkey 
FOREIGN KEY (entity_id) REFERENCES products(id) ON DELETE SET NULL;

-- Step 5: Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('products', 'individual_products', 'raw_materials', 'orders', 'order_items', 'customers', 'product_materials', 'production_batches', 'production_steps', 'audit_logs')
    AND column_name = 'id' OR column_name LIKE '%_id'
ORDER BY table_name, column_name;

-- Step 6: Show foreign key constraints
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
    AND tc.table_name IN ('products', 'individual_products', 'raw_materials', 'orders', 'order_items', 'customers', 'product_materials', 'production_batches', 'production_steps', 'audit_logs')
ORDER BY tc.table_name, kcu.column_name;
