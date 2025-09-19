-- Check the actual structure of production_flow_steps table
-- Run this in your Supabase SQL editor

-- Check all columns in production_flow_steps table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'production_flow_steps' 
ORDER BY ordinal_position;

-- Check if there are any constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'production_flow_steps'::regclass;

-- Check existing data structure
SELECT * FROM production_flow_steps LIMIT 5;
