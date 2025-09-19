-- Create missing tables with proper schema
-- This script creates all the tables needed for the application

-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS recipe_materials CASCADE;
DROP TABLE IF EXISTS product_recipes CASCADE;
DROP TABLE IF EXISTS material_consumption CASCADE;

-- Create product_recipes table
CREATE TABLE product_recipes (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    total_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT DEFAULT 'admin'
);

-- Create recipe_materials table
CREATE TABLE recipe_materials (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES product_recipes(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL,
    material_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'piece',
    cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create material_consumption table
CREATE TABLE material_consumption (
    id TEXT PRIMARY KEY,
    production_product_id TEXT NOT NULL,
    material_id TEXT NOT NULL,
    material_name TEXT NOT NULL,
    quantity_used INTEGER NOT NULL,
    unit TEXT NOT NULL,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for all tables
ALTER TABLE product_recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE material_consumption DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_product_recipes_product_id ON product_recipes(product_id);
CREATE INDEX idx_recipe_materials_recipe_id ON recipe_materials(recipe_id);
CREATE INDEX idx_recipe_materials_material_id ON recipe_materials(material_id);
CREATE INDEX idx_material_consumption_production_id ON material_consumption(production_product_id);

-- Verify tables were created
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('product_recipes', 'recipe_materials', 'material_consumption')
ORDER BY table_name, ordinal_position;
