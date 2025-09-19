-- COMPLETE SCHEMA FIX
-- This script fixes all the schema issues identified

-- Step 1: Fix raw_materials supplier_performance constraint
-- Remove the problematic check constraint
ALTER TABLE raw_materials DROP CONSTRAINT IF EXISTS raw_materials_supplier_performance_check;

-- Make supplier_performance more flexible
ALTER TABLE raw_materials ALTER COLUMN supplier_performance DROP NOT NULL;
ALTER TABLE raw_materials ALTER COLUMN supplier_performance SET DEFAULT 5;

-- Add a more flexible constraint that allows NULL and values 1-10
ALTER TABLE raw_materials ADD CONSTRAINT raw_materials_supplier_performance_check 
CHECK (supplier_performance IS NULL OR (supplier_performance >= 1 AND supplier_performance <= 10));

-- Step 2: Ensure individual_products has the correct schema
-- The database already has quality_grade, so we don't need final_quality_grade
-- But let's make sure the constraint is correct
ALTER TABLE individual_products DROP CONSTRAINT IF EXISTS individual_products_quality_grade_check;
ALTER TABLE individual_products ADD CONSTRAINT individual_products_quality_grade_check 
CHECK (quality_grade IN ('A+', 'A', 'B', 'C'));

-- Step 3: Update any existing data that might have invalid values
-- Set supplier_performance to 5 for any records that have 0 or invalid values
UPDATE raw_materials 
SET supplier_performance = 5 
WHERE supplier_performance IS NULL OR supplier_performance < 1 OR supplier_performance > 10;

-- Step 4: Verify the fixes
SELECT 
    'raw_materials constraints' as table_info,
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'raw_materials'
    AND tc.constraint_type = 'CHECK'

UNION ALL

SELECT 
    'individual_products constraints' as table_info,
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'individual_products'
    AND tc.constraint_type = 'CHECK';

-- Step 5: Show column information for verification
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('raw_materials', 'individual_products')
    AND column_name IN ('supplier_performance', 'quality_grade')
ORDER BY table_name, column_name;

COMMIT;
