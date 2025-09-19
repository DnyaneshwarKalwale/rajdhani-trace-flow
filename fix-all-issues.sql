-- Fix recipe_materials table - remove quantity column
DROP TABLE IF EXISTS recipe_materials CASCADE;

CREATE TABLE recipe_materials (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES product_recipes(id) ON DELETE CASCADE,
    material_id TEXT REFERENCES raw_materials(id),
    material_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipe_materials_recipe_id ON recipe_materials(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_materials_material_id ON recipe_materials(material_id);

-- Enable RLS for recipe_materials
ALTER TABLE recipe_materials ENABLE ROW LEVEL SECURITY;

-- Create policy for recipe_materials
CREATE POLICY "Enable all operations for authenticated users" ON recipe_materials
    FOR ALL USING (auth.role() = 'authenticated');

-- Disable RLS for machines table to fix the dropdown issue
ALTER TABLE machines DISABLE ROW LEVEL SECURITY;

-- Create production_flows table if it doesn't exist
CREATE TABLE IF NOT EXISTS production_flows (
    id TEXT PRIMARY KEY,
    production_product_id TEXT NOT NULL,
    flow_name TEXT NOT NULL DEFAULT 'Production Flow',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create production_flow_steps table if it doesn't exist
CREATE TABLE IF NOT EXISTS production_flow_steps (
    id TEXT PRIMARY KEY,
    flow_id TEXT NOT NULL REFERENCES production_flows(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    step_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    order_index INTEGER NOT NULL DEFAULT 0,
    machine_id TEXT REFERENCES machines(id),
    inspector_name TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for production tables
CREATE INDEX IF NOT EXISTS idx_production_flows_production_product_id ON production_flows(production_product_id);
CREATE INDEX IF NOT EXISTS idx_production_flow_steps_flow_id ON production_flow_steps(flow_id);
CREATE INDEX IF NOT EXISTS idx_production_flow_steps_status ON production_flow_steps(status);

-- Enable RLS for production tables
ALTER TABLE production_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_flow_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for production tables
CREATE POLICY "Enable all operations for authenticated users" ON production_flows
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON production_flow_steps
    FOR ALL USING (auth.role() = 'authenticated');
