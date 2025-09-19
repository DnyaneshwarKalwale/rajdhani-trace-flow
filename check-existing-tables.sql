-- Check what tables currently exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('product_recipes', 'recipe_materials', 'material_consumption', 'machines', 'production_flows', 'production_flow_steps')
ORDER BY table_name;

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('product_recipes', 'recipe_materials', 'material_consumption', 'machines', 'production_flows', 'production_flow_steps')
ORDER BY tablename;
