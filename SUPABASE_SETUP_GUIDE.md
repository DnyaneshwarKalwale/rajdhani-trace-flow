# Supabase Setup Guide for Rajdhani ERP

## 1. Create Environment File

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://rysixsktewsnlmezmprg.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## 2. Get Your Supabase Anon Key

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "anon public" key
4. Replace `your_actual_anon_key_here` in the .env.local file

## 3. Execute Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

## 4. Enable Row Level Security (RLS)

After creating the tables, you need to enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
CREATE POLICY "Enable all operations for all users" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON products FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON individual_products FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON raw_materials FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON orders FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON order_items FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON production_batches FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON production_steps FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON material_consumption FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON product_recipes FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON recipe_materials FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON purchase_orders FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON suppliers FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON audit_logs FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON notifications FOR ALL USING (true);
```

## 5. Test Connection

After completing the above steps, restart your development server:

```bash
npm run dev
```

The application should now connect to Supabase successfully.

## Troubleshooting

### 404 Errors
- Make sure you've executed the database schema
- Check that all tables exist in your Supabase project

### 400 Errors
- Verify your Supabase URL and anon key are correct
- Make sure RLS policies are set up correctly

### Connection Issues
- Check your internet connection
- Verify the Supabase project is active
- Check the browser console for detailed error messages
