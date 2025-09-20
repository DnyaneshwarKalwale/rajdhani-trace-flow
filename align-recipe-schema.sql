-- Align recipe-related schema with application expectations and fix 406 errors on embeds
-- Run this in Supabase SQL editor

-- ==============================================
-- DISABLE RLS TEMPORARILY (DEV)
-- ==============================================
ALTER TABLE IF EXISTS product_recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recipe_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS raw_materials DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- PRODUCT_RECIPES: Ensure text IDs and columns used by app
-- ==============================================
-- Create table if missing
CREATE TABLE IF NOT EXISTS product_recipes (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT,
  total_cost NUMERIC DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coerce column types to TEXT/NUMERIC as needed (safe if already matching)
ALTER TABLE product_recipes
  ALTER COLUMN id TYPE TEXT USING id::text,
  ALTER COLUMN product_id TYPE TEXT USING product_id::text;

-- Add missing columns if they don't exist
ALTER TABLE product_recipes ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE product_recipes ADD COLUMN IF NOT EXISTS total_cost NUMERIC DEFAULT 0;
ALTER TABLE product_recipes ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE product_recipes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE product_recipes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================
-- RECIPE_MATERIALS: Ensure text IDs and relationships
-- ==============================================
CREATE TABLE IF NOT EXISTS recipe_materials (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  material_name TEXT,
  quantity NUMERIC DEFAULT 1,
  unit TEXT,
  cost_per_unit NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coerce types (safe cast if already text/numeric)
ALTER TABLE recipe_materials
  ALTER COLUMN id TYPE TEXT USING id::text,
  ALTER COLUMN recipe_id TYPE TEXT USING recipe_id::text,
  ALTER COLUMN material_id TYPE TEXT USING material_id::text,
  ALTER COLUMN quantity TYPE NUMERIC USING quantity::numeric,
  ALTER COLUMN cost_per_unit TYPE NUMERIC USING cost_per_unit::numeric,
  ALTER COLUMN total_cost TYPE NUMERIC USING total_cost::numeric;

-- Add missing columns if they don't exist
ALTER TABLE recipe_materials ADD COLUMN IF NOT EXISTS material_name TEXT;
ALTER TABLE recipe_materials ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE recipe_materials ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================
-- FOREIGN KEYS FOR POSTGREST EMBED SUPPORT
-- ==============================================
-- Drop existing conflicting constraints (if any)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'recipe_materials_recipe_id_fkey'
      AND table_name = 'recipe_materials'
  ) THEN
    ALTER TABLE recipe_materials DROP CONSTRAINT recipe_materials_recipe_id_fkey;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'recipe_materials_material_id_fkey'
      AND table_name = 'recipe_materials'
  ) THEN
    ALTER TABLE recipe_materials DROP CONSTRAINT recipe_materials_material_id_fkey;
  END IF;
END $$;

-- Recreate FKs with TEXT types
ALTER TABLE recipe_materials
  ADD CONSTRAINT recipe_materials_recipe_id_fkey
  FOREIGN KEY (recipe_id) REFERENCES product_recipes(id) ON DELETE CASCADE;

ALTER TABLE recipe_materials
  ADD CONSTRAINT recipe_materials_material_id_fkey
  FOREIGN KEY (material_id) REFERENCES raw_materials(id);

-- ==============================================
-- INDEXES
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_product_recipes_product_id ON product_recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_materials_recipe_id ON recipe_materials(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_materials_material_id ON recipe_materials(material_id);

-- ==============================================
-- VERIFICATION
-- ==============================================
-- Confirm columns and sample join to ensure embed will work
SELECT 
  pr.id as recipe_id,
  pr.product_id,
  COUNT(rm.id) as materials_count
FROM product_recipes pr
LEFT JOIN recipe_materials rm ON rm.recipe_id = pr.id
GROUP BY pr.id, pr.product_id
LIMIT 10;

-- Success notices
DO $$
BEGIN
  RAISE NOTICE '✅ Recipe schema aligned (TEXT ids), FKs added for embeds';
  RAISE NOTICE '🚀 406 errors on /product_recipes?select=*,recipe_materials(*) should be resolved';
END $$;