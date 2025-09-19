-- Rajdhani Trace Flow - Complete Supabase Database Schema (FIXED)
-- Execute this SQL in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================
-- CREATE ALL ENUM TYPES FIRST
-- ==============================================

-- Customer enums
CREATE TYPE customer_type_enum AS ENUM ('individual', 'business');
CREATE TYPE customer_status_enum AS ENUM ('active', 'inactive', 'suspended', 'new');

-- Product enums
CREATE TYPE product_status_enum AS ENUM ('in-stock', 'low-stock', 'out-of-stock', 'expired', 'in-production');
CREATE TYPE individual_product_status_enum AS ENUM ('available', 'sold', 'damaged', 'in-production', 'completed');

-- Raw material enums
CREATE TYPE material_status_enum AS ENUM ('in-stock', 'low-stock', 'out-of-stock', 'in-transit', 'expired');
CREATE TYPE material_type_enum AS ENUM ('yarn', 'dye', 'backing', 'latex', 'other');

-- Order enums
CREATE TYPE order_status_enum AS ENUM ('pending', 'confirmed', 'in-production', 'completed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'partial', 'paid', 'overdue', 'refunded');

-- Production enums
CREATE TYPE production_status_enum AS ENUM ('planned', 'in-progress', 'completed', 'cancelled', 'on-hold');
CREATE TYPE production_step_status_enum AS ENUM ('pending', 'in-progress', 'completed', 'skipped', 'failed');

-- Purchase order enums
CREATE TYPE purchase_order_status_enum AS ENUM ('draft', 'sent', 'confirmed', 'in-transit', 'received', 'cancelled');

-- Notification enums
CREATE TYPE notification_type_enum AS ENUM ('info', 'warning', 'error', 'success');
CREATE TYPE notification_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_status_enum AS ENUM ('unread', 'read', 'dismissed');

-- ==============================================
-- CUSTOMERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    customer_type customer_type_enum DEFAULT 'individual',
    status customer_status_enum DEFAULT 'active',
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    registration_date DATE DEFAULT CURRENT_DATE,
    gst_number VARCHAR(20),
    company_name VARCHAR(255),
    credit_limit DECIMAL(15,2) DEFAULT 0,
    outstanding_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- SUPPLIERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(20),
    credit_limit DECIMAL(15,2) DEFAULT 0,
    outstanding_amount DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(100),
    status customer_status_enum DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- PRODUCTS TABLE (Master Product Catalog)
-- ==============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    size VARCHAR(50),
    pattern VARCHAR(100),
    base_quantity INTEGER DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    status product_status_enum DEFAULT 'in-stock',
    location VARCHAR(255),
    notes TEXT,
    image_url TEXT,
    dimensions VARCHAR(100),
    weight VARCHAR(50),
    thickness VARCHAR(50),
    width VARCHAR(50),
    height VARCHAR(50),
    pile_height VARCHAR(50),
    manufacturing_date DATE,
    individual_stock_tracking BOOLEAN DEFAULT true,
    min_stock_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDIVIDUAL PRODUCTS TABLE (Individual Stock Items)
-- ==============================================
CREATE TABLE IF NOT EXISTS individual_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255),
    size VARCHAR(50),
    color VARCHAR(50),
    pattern VARCHAR(100),
    pile_height VARCHAR(50),
    weight VARCHAR(50),
    thickness VARCHAR(50),
    dimensions VARCHAR(100),
    width VARCHAR(50),
    height VARCHAR(50),
    final_dimensions VARCHAR(100),
    final_weight VARCHAR(50),
    final_thickness VARCHAR(50),
    final_width VARCHAR(50),
    final_height VARCHAR(50),
    final_pile_height VARCHAR(50),
    final_quality_grade VARCHAR(10),
    quality_grade VARCHAR(10) DEFAULT 'A',
    status individual_product_status_enum DEFAULT 'available',
    location VARCHAR(255),
    notes TEXT,
    added_date DATE DEFAULT CURRENT_DATE,
    production_date DATE,
    completion_date DATE,
    inspector VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- RAW MATERIALS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS raw_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    type material_type_enum DEFAULT 'other',
    current_stock DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    min_threshold DECIMAL(10,2) DEFAULT 0,
    max_capacity DECIMAL(10,2),
    reorder_point DECIMAL(10,2) DEFAULT 0,
    daily_usage DECIMAL(10,2) DEFAULT 0,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(10,2) DEFAULT 0,
    status material_status_enum DEFAULT 'in-stock',
    supplier_id UUID REFERENCES suppliers(id),
    supplier_name VARCHAR(255),
    supplier_performance INTEGER DEFAULT 0,
    location VARCHAR(255),
    expiry_date DATE,
    batch_number VARCHAR(100),
    quality_grade VARCHAR(10),
    image_url TEXT,
    last_restocked DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ORDERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    status order_status_enum DEFAULT 'pending',
    payment_status payment_status_enum DEFAULT 'pending',
    total_amount DECIMAL(15,2) DEFAULT 0,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ORDER ITEMS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    individual_product_id UUID REFERENCES individual_products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- PRODUCTION BATCHES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id),
    planned_quantity INTEGER NOT NULL,
    actual_quantity INTEGER DEFAULT 0,
    status production_status_enum DEFAULT 'planned',
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- PRODUCTION STEPS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS production_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
    step_name VARCHAR(255) NOT NULL,
    step_order INTEGER NOT NULL,
    status production_step_status_enum DEFAULT 'pending',
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- MATERIAL CONSUMPTION TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS material_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES production_batches(id) ON DELETE CASCADE,
    material_id UUID REFERENCES raw_materials(id),
    quantity_used DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    consumption_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- PRODUCT RECIPES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS product_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    recipe_name VARCHAR(255) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- RECIPE MATERIALS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS recipe_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES product_recipes(id) ON DELETE CASCADE,
    material_id UUID REFERENCES raw_materials(id),
    quantity_required DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- PURCHASE ORDERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status purchase_order_status_enum DEFAULT 'draft',
    total_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- AUDIT LOGS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- NOTIFICATIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum DEFAULT 'info',
    priority notification_priority_enum DEFAULT 'medium',
    status notification_status_enum DEFAULT 'unread',
    module VARCHAR(100), -- products, orders, production, etc.
    related_data JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Individual product indexes
CREATE INDEX IF NOT EXISTS idx_individual_products_product_id ON individual_products(product_id);
CREATE INDEX IF NOT EXISTS idx_individual_products_status ON individual_products(status);
CREATE INDEX IF NOT EXISTS idx_individual_products_qr_code ON individual_products(qr_code);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);

-- Production indexes
CREATE INDEX IF NOT EXISTS idx_production_batches_product_id ON production_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_production_batches_status ON production_batches(status);

-- Material indexes
CREATE INDEX IF NOT EXISTS idx_raw_materials_status ON raw_materials(status);
CREATE INDEX IF NOT EXISTS idx_raw_materials_type ON raw_materials(type);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_individual_products_updated_at BEFORE UPDATE ON individual_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON raw_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON production_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_steps_updated_at BEFORE UPDATE ON production_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_recipes_updated_at BEFORE UPDATE ON product_recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
-- In production, you should create more restrictive policies
CREATE POLICY "Enable all operations for all users" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON suppliers FOR ALL USING (true);
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
CREATE POLICY "Enable all operations for all users" ON audit_logs FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON notifications FOR ALL USING (true);

-- ==============================================
-- SAMPLE DATA (Optional - for testing)
-- ==============================================

-- Insert sample customer
INSERT INTO customers (name, email, phone, customer_type, status) 
VALUES ('Sample Customer', 'customer@example.com', '+91-9876543210', 'individual', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample supplier
INSERT INTO suppliers (name, contact_person, email, phone, status)
VALUES ('Sample Supplier', 'John Doe', 'supplier@example.com', '+91-9876543211', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample raw material
INSERT INTO raw_materials (name, type, current_stock, unit, cost_per_unit, status)
VALUES ('Cotton Yarn', 'yarn', 100.00, 'kg', 150.00, 'in-stock')
ON CONFLICT DO NOTHING;

-- Insert sample product
INSERT INTO products (name, category, color, size, selling_price, status, individual_stock_tracking)
VALUES ('Sample Carpet', 'Handmade', 'Red', '6x9 feet', 25000.00, 'in-stock', true)
ON CONFLICT DO NOTHING;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- This will show a success message when the schema is created
DO $$
BEGIN
    RAISE NOTICE '✅ Rajdhani ERP Database Schema Created Successfully!';
    RAISE NOTICE '📊 Tables created: customers, products, individual_products, raw_materials, orders, production_batches, etc.';
    RAISE NOTICE '🔒 Row Level Security enabled on all tables';
    RAISE NOTICE '📈 Indexes created for optimal performance';
    RAISE NOTICE '🔄 Triggers set up for automatic timestamp updates';
    RAISE NOTICE '🎯 Ready to use with your Rajdhani ERP application!';
END $$;
