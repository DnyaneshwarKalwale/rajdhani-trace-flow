-- Check if tables exist and their data
SELECT 'material_consumption' as table_name, count(*) as row_count FROM material_consumption
UNION ALL
SELECT 'product_recipes' as table_name, count(*) as row_count FROM product_recipes
UNION ALL
SELECT 'recipe_materials' as table_name, count(*) as row_count FROM recipe_materials;

-- Check material consumption table structure and data
SELECT * FROM material_consumption LIMIT 5;

-- Check product recipes table structure and data
SELECT * FROM product_recipes LIMIT 5;

-- Check recipe materials table structure and data
SELECT * FROM recipe_materials LIMIT 5;