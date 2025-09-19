-- Fix RLS policies for recipe tables
-- Run this in your Supabase SQL editor

-- Disable RLS for recipe tables
ALTER TABLE product_recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_materials DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('product_recipes', 'recipe_materials')
ORDER BY tablename;

-- Check if tables exist and have correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_recipes' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'recipe_materials' 
ORDER BY ordinal_position;
