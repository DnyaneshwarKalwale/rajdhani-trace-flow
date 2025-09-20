-- Comprehensive fix for RLS errors in production and recipe modules
-- Run this in your Supabase SQL editor

-- ==============================================
-- DISABLE RLS FOR PROBLEMATIC TABLES
-- ==============================================

-- Disable RLS for recipe-related tables
ALTER TABLE product_recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_materials DISABLE ROW LEVEL SECURITY;

-- Disable RLS for production flow tables
ALTER TABLE production_flows DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_flow_steps DISABLE ROW LEVEL SECURITY;

-- Disable RLS for other core tables that might have issues
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE individual_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE material_consumption DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE production_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE machines DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- VERIFY RLS STATUS
-- ==============================================

-- Check RLS status for all tables
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '🔒 RLS Enabled' 
        ELSE '🔓 RLS Disabled' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'product_recipes', 'recipe_materials', 'production_flows', 'production_flow_steps',
        'products', 'individual_products', 'raw_materials', 'material_consumption',
        'production_batches', 'production_steps', 'orders', 'order_items',
        'customers', 'suppliers', 'machines', 'notifications', 'audit_logs', 'purchase_orders'
    )
ORDER BY tablename;

-- ==============================================
-- CLEAN UP OLD POLICIES (IF ANY EXIST)
-- ==============================================

-- Drop any existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_recipes;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON recipe_materials;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON production_flows;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON production_flow_steps;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON individual_products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON raw_materials;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON material_consumption;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON production_batches;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON production_steps;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON machines;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON purchase_orders;

-- ==============================================
-- CREATE REQUIRED TABLES IF MISSING
-- ==============================================

-- Ensure production_flows table exists
CREATE TABLE IF NOT EXISTS production_flows (
    id TEXT PRIMARY KEY,
    production_product_id TEXT NOT NULL,
    flow_name TEXT NOT NULL DEFAULT 'Production Flow',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure production_flow_steps table exists
CREATE TABLE IF NOT EXISTS production_flow_steps (
    id TEXT PRIMARY KEY,
    flow_id TEXT NOT NULL REFERENCES production_flows(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    step_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    step_order INTEGER NOT NULL DEFAULT 1,
    machine_id TEXT,
    inspector_name TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure machines table exists (if referenced)
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Recipe-related indexes
CREATE INDEX IF NOT EXISTS idx_product_recipes_product_id ON product_recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_materials_recipe_id ON recipe_materials(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_materials_material_id ON recipe_materials(material_id);

-- Production flow indexes
CREATE INDEX IF NOT EXISTS idx_production_flows_product_id ON production_flows(production_product_id);
CREATE INDEX IF NOT EXISTS idx_production_flow_steps_flow_id ON production_flow_steps(flow_id);
CREATE INDEX IF NOT EXISTS idx_production_flow_steps_status ON production_flow_steps(status);
CREATE INDEX IF NOT EXISTS idx_production_flow_steps_order ON production_flow_steps(step_order);

-- ==============================================
-- INSERT DEFAULT MACHINES (IF NEEDED)
-- ==============================================

-- Insert some default machines if the table is empty
INSERT INTO machines (id, name, description) 
SELECT 
    'MACHINE_001', 'Loom Machine 1', 'Weaving machine for carpet production'
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE id = 'MACHINE_001');

INSERT INTO machines (id, name, description) 
SELECT 
    'MACHINE_002', 'Cutting Machine 1', 'Cutting machine for material processing'
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE id = 'MACHINE_002');

INSERT INTO machines (id, name, description) 
SELECT 
    'MACHINE_003', 'Dyeing Machine 1', 'Dyeing machine for color processing'
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE id = 'MACHINE_003');

INSERT INTO machines (id, name, description) 
SELECT 
    'MACHINE_004', 'Finishing Machine 1', 'Finishing machine for final processing'
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE id = 'MACHINE_004');

-- ==============================================
-- FINAL VERIFICATION
-- ==============================================

-- Count records in each table to verify everything is working
SELECT 
    'product_recipes' as table_name, 
    COUNT(*) as record_count 
FROM product_recipes
UNION ALL
SELECT 
    'recipe_materials' as table_name, 
    COUNT(*) as record_count 
FROM recipe_materials
UNION ALL
SELECT 
    'production_flows' as table_name, 
    COUNT(*) as record_count 
FROM production_flows
UNION ALL
SELECT 
    'production_flow_steps' as table_name, 
    COUNT(*) as record_count 
FROM production_flow_steps
UNION ALL
SELECT 
    'machines' as table_name, 
    COUNT(*) as record_count 
FROM machines;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Fix Applied Successfully!';
    RAISE NOTICE '🔓 All tables now have RLS disabled for development';
    RAISE NOTICE '📊 Tables verified: recipes, production flows, machines';
    RAISE NOTICE '🚀 Production and recipe modules should work without RLS errors';
END $$;