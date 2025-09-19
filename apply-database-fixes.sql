-- Apply all database fixes to support custom meaningful IDs
-- Run this script in your Supabase SQL editor

-- 1. Remove UUID defaults from all tables
ALTER TABLE products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE individual_products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE raw_materials ALTER COLUMN id DROP DEFAULT;
ALTER TABLE customers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE suppliers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE production_batches ALTER COLUMN id DROP DEFAULT;
ALTER TABLE production_steps ALTER COLUMN id DROP DEFAULT;
ALTER TABLE material_consumption ALTER COLUMN id DROP DEFAULT;
ALTER TABLE product_recipes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE recipe_materials ALTER COLUMN id DROP DEFAULT;
ALTER TABLE purchase_orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE notifications ALTER COLUMN id DROP DEFAULT;

-- 2. Drop foreign key constraints
ALTER TABLE individual_products DROP CONSTRAINT IF EXISTS individual_products_product_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_individual_product_id_fkey;
ALTER TABLE production_batches DROP CONSTRAINT IF EXISTS production_batches_product_id_fkey;
ALTER TABLE production_steps DROP CONSTRAINT IF EXISTS production_steps_batch_id_fkey;
ALTER TABLE material_consumption DROP CONSTRAINT IF EXISTS material_consumption_batch_id_fkey;
ALTER TABLE material_consumption DROP CONSTRAINT IF EXISTS material_consumption_material_id_fkey;
ALTER TABLE product_recipes DROP CONSTRAINT IF EXISTS product_recipes_product_id_fkey;
ALTER TABLE recipe_materials DROP CONSTRAINT IF EXISTS recipe_materials_recipe_id_fkey;
ALTER TABLE recipe_materials DROP CONSTRAINT IF EXISTS recipe_materials_material_id_fkey;
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_supplier_id_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_id_fkey;
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_related_id_fkey;

-- 3. Change column types from UUID to VARCHAR(50)
ALTER TABLE products ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE individual_products ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE individual_products ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE raw_materials ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE customers ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE suppliers ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE orders ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE orders ALTER COLUMN customer_id TYPE VARCHAR(50);
ALTER TABLE order_items ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE order_items ALTER COLUMN order_id TYPE VARCHAR(50);
ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE order_items ALTER COLUMN individual_product_id TYPE VARCHAR(50);
ALTER TABLE production_batches ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE production_batches ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE production_steps ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE production_steps ALTER COLUMN batch_id TYPE VARCHAR(50);
ALTER TABLE material_consumption ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE material_consumption ALTER COLUMN batch_id TYPE VARCHAR(50);
ALTER TABLE material_consumption ALTER COLUMN material_id TYPE VARCHAR(50);
ALTER TABLE product_recipes ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE product_recipes ALTER COLUMN product_id TYPE VARCHAR(50);
ALTER TABLE recipe_materials ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE recipe_materials ALTER COLUMN recipe_id TYPE VARCHAR(50);
ALTER TABLE recipe_materials ALTER COLUMN material_id TYPE VARCHAR(50);
ALTER TABLE purchase_orders ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE purchase_orders ALTER COLUMN supplier_id TYPE VARCHAR(50);
ALTER TABLE audit_logs ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE audit_logs ALTER COLUMN entity_id TYPE VARCHAR(50);
ALTER TABLE audit_logs ALTER COLUMN user_id TYPE VARCHAR(50);
ALTER TABLE notifications ALTER COLUMN id TYPE VARCHAR(50);
ALTER TABLE notifications ALTER COLUMN related_id TYPE VARCHAR(50);

-- 4. Recreate foreign key constraints
ALTER TABLE individual_products ADD CONSTRAINT individual_products_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT order_items_individual_product_id_fkey 
    FOREIGN KEY (individual_product_id) REFERENCES individual_products(id) ON DELETE CASCADE;

ALTER TABLE production_batches ADD CONSTRAINT production_batches_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE production_steps ADD CONSTRAINT production_steps_batch_id_fkey 
    FOREIGN KEY (batch_id) REFERENCES production_batches(id) ON DELETE CASCADE;

ALTER TABLE material_consumption ADD CONSTRAINT material_consumption_batch_id_fkey 
    FOREIGN KEY (batch_id) REFERENCES production_batches(id) ON DELETE CASCADE;

ALTER TABLE material_consumption ADD CONSTRAINT material_consumption_material_id_fkey 
    FOREIGN KEY (material_id) REFERENCES raw_materials(id) ON DELETE CASCADE;

ALTER TABLE product_recipes ADD CONSTRAINT product_recipes_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE recipe_materials ADD CONSTRAINT recipe_materials_recipe_id_fkey 
    FOREIGN KEY (recipe_id) REFERENCES product_recipes(id) ON DELETE CASCADE;

ALTER TABLE recipe_materials ADD CONSTRAINT recipe_materials_material_id_fkey 
    FOREIGN KEY (material_id) REFERENCES raw_materials(id) ON DELETE CASCADE;

ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_supplier_id_fkey 
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;

ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_entity_id_fkey 
    FOREIGN KEY (entity_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE;

ALTER TABLE notifications ADD CONSTRAINT notifications_related_id_fkey 
    FOREIGN KEY (related_id) REFERENCES products(id) ON DELETE CASCADE;

-- 5. Add comments to document the changes
COMMENT ON COLUMN products.id IS 'Custom meaningful ID (e.g., PRO-250116-001)';
COMMENT ON COLUMN individual_products.id IS 'Custom meaningful ID (e.g., IPD-250116-001)';
COMMENT ON COLUMN raw_materials.id IS 'Custom meaningful ID (e.g., RM-250116-001)';
COMMENT ON COLUMN customers.id IS 'Custom meaningful ID (e.g., CUST-250116-001)';
COMMENT ON COLUMN suppliers.id IS 'Custom meaningful ID (e.g., SUP-250116-001)';
COMMENT ON COLUMN orders.id IS 'Custom meaningful ID (e.g., ORD-250116-001)';
COMMENT ON COLUMN order_items.id IS 'Custom meaningful ID (e.g., OI-250116-001)';
COMMENT ON COLUMN production_batches.id IS 'Custom meaningful ID (e.g., PB-250116-001)';
COMMENT ON COLUMN production_steps.id IS 'Custom meaningful ID (e.g., PS-250116-001)';
COMMENT ON COLUMN material_consumption.id IS 'Custom meaningful ID (e.g., MC-250116-001)';
COMMENT ON COLUMN product_recipes.id IS 'Custom meaningful ID (e.g., PR-250116-001)';
COMMENT ON COLUMN recipe_materials.id IS 'Custom meaningful ID (e.g., RM-250116-001)';
COMMENT ON COLUMN purchase_orders.id IS 'Custom meaningful ID (e.g., PO-250116-001)';
COMMENT ON COLUMN audit_logs.id IS 'Custom meaningful ID (e.g., AL-250116-001)';
COMMENT ON COLUMN notifications.id IS 'Custom meaningful ID (e.g., NOT-250116-001)';

-- Success message
SELECT 'Database schema updated successfully! Custom meaningful IDs are now supported.' as message;
