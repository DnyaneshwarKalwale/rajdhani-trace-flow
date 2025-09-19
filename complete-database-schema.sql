-- COMPLETE DATABASE SCHEMA - FRESH START
-- This script creates a completely new database schema with all tables
-- All IDs are VARCHAR(50) with meaningful prefixes

-- Step 1: Drop all existing tables (clean slate)
DROP TABLE IF EXISTS material_consumption CASCADE;
DROP TABLE IF EXISTS recipe_materials CASCADE;
DROP TABLE IF EXISTS product_recipes CASCADE;
DROP TABLE IF EXISTS production_steps CASCADE;
DROP TABLE IF EXISTS production_batches CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS individual_products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS raw_materials CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Step 2: Create all tables with correct schema

-- Products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    pattern VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'units',
    base_quantity DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in-stock' CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock')),
    individual_stock_tracking BOOLEAN DEFAULT true,
    min_stock_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 1000,
    weight VARCHAR(50),
    thickness VARCHAR(50),
    width VARCHAR(50),
    height VARCHAR(50),
    notes TEXT,
    image_url TEXT,
    manufacturing_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Products table
CREATE TABLE individual_products (
    id VARCHAR(50) PRIMARY KEY,
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    pattern VARCHAR(100),
    weight VARCHAR(50),
    thickness VARCHAR(50),
    width VARCHAR(50),
    height VARCHAR(50),
    final_weight VARCHAR(50),
    final_thickness VARCHAR(50),
    final_width VARCHAR(50),
    final_height VARCHAR(50),
    quality_grade VARCHAR(10) DEFAULT 'A' CHECK (quality_grade IN ('A+', 'A', 'B', 'C')),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'damaged', 'reserved')),
    location VARCHAR(255) DEFAULT 'Warehouse A - General Storage',
    notes TEXT,
    added_date DATE DEFAULT CURRENT_DATE,
    production_date DATE NOT NULL,
    completion_date DATE,
    inspector VARCHAR(100),
    sold_date DATE,
    customer_id VARCHAR(50),
    order_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Raw Materials table
CREATE TABLE raw_materials (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    min_threshold DECIMAL(10,2) DEFAULT 0,
    max_capacity DECIMAL(10,2) DEFAULT 1000,
    reorder_point DECIMAL(10,2) DEFAULT 10,
    last_restocked DATE,
    daily_usage DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in-stock' CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock', 'overstock', 'in-transit')),
    supplier_id VARCHAR(50),
    supplier_name VARCHAR(255),
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0,
    batch_number VARCHAR(100),
    quality_grade VARCHAR(50),
    image_url TEXT,
    supplier_performance INTEGER DEFAULT 5 CHECK (supplier_performance BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    customer_type VARCHAR(20) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'new')),
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0,
    last_order_date DATE,
    registration_date DATE DEFAULT CURRENT_DATE,
    gst_number VARCHAR(20),
    company_name VARCHAR(255),
    credit_limit DECIMAL(12,2) DEFAULT 0,
    outstanding_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(20),
    performance_rating INTEGER DEFAULT 5 CHECK (performance_rating BETWEEN 1 AND 10),
    total_orders INTEGER DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(50),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    subtotal DECIMAL(12,2) DEFAULT 0,
    gst_rate DECIMAL(5,2) DEFAULT 18.00,
    gst_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    outstanding_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_production', 'ready', 'dispatched', 'delivered', 'cancelled')),
    workflow_step VARCHAR(100),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    special_instructions TEXT,
    created_by VARCHAR(100) DEFAULT 'admin',
    accepted_at TIMESTAMP WITH TIME ZONE,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Order Items table
CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50),
    individual_product_id VARCHAR(50),
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(20) DEFAULT 'product' CHECK (product_type IN ('product', 'raw_material')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    quality_grade VARCHAR(10),
    specifications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (individual_product_id) REFERENCES individual_products(id) ON DELETE SET NULL
);

-- Production Batches table
CREATE TABLE production_batches (
    id VARCHAR(50) PRIMARY KEY,
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    product_id VARCHAR(50),
    order_id VARCHAR(50),
    planned_quantity INTEGER NOT NULL,
    actual_quantity INTEGER DEFAULT 0,
    start_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'paused', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    operator VARCHAR(100),
    supervisor VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Production Steps table
CREATE TABLE production_steps (
    id VARCHAR(50) PRIMARY KEY,
    production_batch_id VARCHAR(50) NOT NULL,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
    operator VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    quality_check_result TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (production_batch_id) REFERENCES production_batches(id) ON DELETE CASCADE
);

-- Product Recipes table
CREATE TABLE product_recipes (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    total_cost DECIMAL(10,2) DEFAULT 0,
    production_time INTEGER DEFAULT 0, -- in minutes
    difficulty_level VARCHAR(20) DEFAULT 'Medium' CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
    created_by VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Recipe Materials table
CREATE TABLE recipe_materials (
    id VARCHAR(50) PRIMARY KEY,
    recipe_id VARCHAR(50) NOT NULL,
    material_id VARCHAR(50) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    quantity_required DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (recipe_id) REFERENCES product_recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id) ON DELETE CASCADE
);

-- Material Consumption table
CREATE TABLE material_consumption (
    id VARCHAR(50) PRIMARY KEY,
    production_batch_id VARCHAR(50) NOT NULL,
    production_step_id VARCHAR(50),
    material_id VARCHAR(50) NOT NULL,
    individual_product_id VARCHAR(50),
    consumed_quantity DECIMAL(10,2) NOT NULL,
    waste_quantity DECIMAL(10,2) DEFAULT 0,
    consumption_date DATE DEFAULT CURRENT_DATE,
    operator VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (production_batch_id) REFERENCES production_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (production_step_id) REFERENCES production_steps(id) ON DELETE SET NULL,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (individual_product_id) REFERENCES individual_products(id) ON DELETE SET NULL
);

-- Purchase Orders table
CREATE TABLE purchase_orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id VARCHAR(50),
    supplier_name VARCHAR(255) NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    total_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    created_by VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(100) DEFAULT 'admin',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Legacy fields for compatibility
    module VARCHAR(50),
    entity_id VARCHAR(50),
    entity_name VARCHAR(255),
    previous_state JSONB,
    new_state JSONB,
    details TEXT,
    ip_address INET,
    user_agent TEXT
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed')),
    module VARCHAR(50) CHECK (module IN ('orders', 'products', 'materials', 'production')),
    related_id VARCHAR(50),
    related_data JSONB,
    created_by VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_individual_products_product_id ON individual_products(product_id);
CREATE INDEX idx_individual_products_status ON individual_products(status);
CREATE INDEX idx_individual_products_qr_code ON individual_products(qr_code);
CREATE INDEX idx_raw_materials_category ON raw_materials(category);
CREATE INDEX idx_raw_materials_status ON raw_materials(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_module ON notifications(module);

-- Step 4: Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_individual_products_updated_at BEFORE UPDATE ON individual_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON raw_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON production_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_steps_updated_at BEFORE UPDATE ON production_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_recipes_updated_at BEFORE UPDATE ON product_recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Insert some sample data for testing
INSERT INTO products (id, name, category, color, pattern, unit, base_quantity, status, individual_stock_tracking, min_stock_level, max_stock_level) VALUES
('PRO-250917-001', 'Traditional Persian Carpet', 'Carpets', 'Red', 'Persian', 'pieces', 0, 'in-stock', true, 5, 100),
('PRO-250917-002', 'Modern Geometric Carpet', 'Carpets', 'Blue', 'Geometric', 'pieces', 0, 'in-stock', true, 5, 100),
('PRO-250917-003', 'Marble Powder (Fine Grade)', 'Raw Materials', 'White', 'Fine', 'kg', 100, 'in-stock', false, 10, 1000);

INSERT INTO raw_materials (id, name, category, current_stock, unit, min_threshold, max_capacity, reorder_point, cost_per_unit, total_value, status) VALUES
('RM-250917-001', 'Wool Yarn', 'Yarn', 50, 'kg', 10, 200, 20, 500, 25000, 'in-stock'),
('RM-250917-002', 'Cotton Thread', 'Thread', 30, 'kg', 5, 100, 10, 300, 9000, 'in-stock'),
('RM-250917-003', 'Dye (Red)', 'Dye', 5, 'liters', 2, 20, 5, 200, 1000, 'in-stock');

INSERT INTO customers (id, name, email, phone, customer_type, status) VALUES
('CUST-250917-001', 'John Doe', 'john@example.com', '+1234567890', 'individual', 'active'),
('CUST-250917-002', 'ABC Corporation', 'contact@abc.com', '+1234567891', 'business', 'active');

INSERT INTO suppliers (id, name, contact_person, email, phone, status) VALUES
('SUPP-250917-001', 'Wool Suppliers Ltd', 'Jane Smith', 'jane@woolsuppliers.com', '+1234567892', 'active'),
('SUPP-250917-002', 'Dye Manufacturers Inc', 'Bob Johnson', 'bob@dyemanufacturers.com', '+1234567893', 'active');

-- Step 6: Verify the schema
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('products', 'individual_products', 'raw_materials', 'orders', 'order_items', 'customers', 'audit_logs', 'notifications')
    AND (column_name = 'id' OR column_name LIKE '%_id')
ORDER BY table_name, column_name;

-- Step 7: Show foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
ORDER BY tc.table_name, kcu.column_name;

COMMIT;
