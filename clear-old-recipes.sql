-- Clear old recipes with incorrect product IDs
-- This will remove recipes that have old string IDs instead of UUIDs

-- Delete recipe materials first (due to foreign key constraint)
DELETE FROM recipe_materials 
WHERE recipe_id IN (
  SELECT id FROM product_recipes 
  WHERE product_id LIKE 'PRO-%' OR product_id LIKE 'MAT-%'
);

-- Delete old recipes with string IDs
DELETE FROM product_recipes 
WHERE product_id LIKE 'PRO-%' OR product_id LIKE 'MAT-%';

-- Show remaining recipes
SELECT id, product_id, product_name, created_at 
FROM product_recipes 
ORDER BY created_at DESC;
