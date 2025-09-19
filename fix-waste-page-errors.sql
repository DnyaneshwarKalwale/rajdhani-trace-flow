-- Fix waste generation page loading errors
-- Run this in Supabase SQL editor

-- 1. Disable RLS for individual_products table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'individual_products'
    ) THEN
        ALTER TABLE individual_products DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Disabled RLS for individual_products table';
    ELSE
        RAISE NOTICE '⚠️ individual_products table does not exist, creating it...';

        -- Create individual_products table if it doesn't exist
        CREATE TABLE individual_products (
            id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL,
            production_batch_id TEXT,
            qr_code TEXT UNIQUE,
            status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'damaged')),
            quality_grade TEXT DEFAULT 'A+' CHECK (quality_grade IN ('A+', 'A', 'B', 'C')),
            production_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            inspector_name TEXT,
            defects TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Disable RLS for the new table
        ALTER TABLE individual_products DISABLE ROW LEVEL SECURITY;

        RAISE NOTICE '✅ Created individual_products table with RLS disabled';
    END IF;
END $$;

-- 2. Disable RLS for products table to fix 406 errors
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 3. Verify tables and their RLS status
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('products', 'individual_products', 'material_consumption', 'production_flows', 'production_flow_steps')
AND schemaname = 'public'
ORDER BY tablename;

-- 4. Check if tables exist
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name IN ('products', 'individual_products', 'material_consumption', 'production_flows', 'production_flow_steps')
AND table_schema = 'public'
ORDER BY table_name;