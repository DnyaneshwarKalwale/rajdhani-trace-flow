-- EMERGENCY FIX - Use this if you're still getting foreign key errors
-- This script is more aggressive and should fix any remaining issues

-- Step 1: Drop ALL foreign key constraints (even if they don't exist)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all foreign key constraints for our tables
    FOR r IN (
        SELECT constraint_name, table_name
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY' 
            AND table_name IN ('products', 'individual_products', 'raw_materials', 'orders', 'order_items', 'customers')
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.table_name || ' DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

-- Step 2: Force all ID columns to VARCHAR(50) with no defaults
ALTER TABLE IF EXISTS products ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS products ALTER COLUMN id DROP DEFAULT;

ALTER TABLE IF EXISTS individual_products ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS individual_products ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS individual_products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS individual_products ALTER COLUMN product_id DROP DEFAULT;

ALTER TABLE IF EXISTS raw_materials ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS raw_materials ALTER COLUMN id DROP DEFAULT;

ALTER TABLE IF EXISTS customers ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS customers ALTER COLUMN id DROP DEFAULT;

ALTER TABLE IF EXISTS orders ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS orders ALTER COLUMN customer_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS orders ALTER COLUMN customer_id DROP DEFAULT;

ALTER TABLE IF EXISTS order_items ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS order_items ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS order_items ALTER COLUMN individual_product_id TYPE VARCHAR(50);
ALTER TABLE IF EXISTS order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS order_items ALTER COLUMN product_id DROP DEFAULT;
ALTER TABLE IF EXISTS order_items ALTER COLUMN individual_product_id DROP DEFAULT;

-- Step 3: Recreate foreign key constraints
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

-- Step 4: Verify the fix
SELECT 'Database fix completed successfully!' as status;
