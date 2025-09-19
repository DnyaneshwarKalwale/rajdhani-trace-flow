-- Check if machines table exists and has data
SELECT COUNT(*) as machine_count FROM machines;

-- Check the structure of machines table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'machines' 
ORDER BY ordinal_position;

-- Check RLS policies on machines table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'machines';

-- Disable RLS temporarily to test (run this if needed)
-- ALTER TABLE machines DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS (run this after testing)
-- ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
