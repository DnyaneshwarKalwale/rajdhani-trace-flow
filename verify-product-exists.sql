-- Verify if the product PRO-250917-007 exists in the database
-- This will help us understand why the foreign key constraint is failing

-- Check if the product exists
SELECT 
    id, 
    name, 
    category, 
    color, 
    pattern,
    created_at
FROM products 
WHERE id = 'PRO-250917-007';

-- Check the data type of the products.id column
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND column_name = 'id';

-- Check the data type of the individual_products.product_id column
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'individual_products' 
    AND column_name = 'product_id';

-- Check all products with their ID types
SELECT 
    id, 
    name, 
    pg_typeof(id) as id_type
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any individual products for this product
SELECT 
    id, 
    product_id, 
    pg_typeof(product_id) as product_id_type
FROM individual_products 
WHERE product_id = 'PRO-250917-007';
