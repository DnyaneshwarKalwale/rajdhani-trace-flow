# Rajdhani ERP - Supabase Backend Setup Guide

This guide will help you set up the complete Supabase backend for your Rajdhani ERP system.

## 📋 Overview

Your Rajdhani ERP now has a complete Supabase backend with:
- ✅ Customer Management
- ✅ Order Management with Items
- ✅ Product Catalog with Individual Product Tracking
- ✅ Raw Materials Inventory
- ✅ Supplier Management
- ✅ Production Batch Management
- ✅ Production Steps Tracking
- ✅ Material Consumption Tracking
- ✅ Product Recipes
- ✅ Notifications System
- ✅ Audit Logging
- ✅ Purchase Orders
- ✅ Full TypeScript Support

## 🚀 Setup Instructions

### Step 1: Database Setup
1. Go to your Supabase project: https://rysixsktewsnlmezmprg.supabase.co
2. Open the SQL Editor
3. Copy the entire contents of `supabase-schema.sql`
4. Execute the SQL script in your Supabase SQL editor
5. Verify all tables are created successfully

### Step 2: Environment Configuration
Your `.env` file is already configured:
```bash
VITE_SUPABASE_URL=https://rysixsktewsnlmezmprg.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Install Dependencies
All required dependencies are already in your `package.json`:
- `@supabase/supabase-js` - Supabase client
- `@tanstack/react-query` - Data fetching and caching

### Step 4: Test the Backend
Run the demo to test all functionality:
```typescript
import { SupabaseDemo } from './src/demo/supabaseDemo';

// Test connection
await SupabaseDemo.testConnection();

// Run complete demo
await SupabaseDemo.runCompleteDemo();
```

## 📊 Database Tables Created

### Core Tables
- **customers** - Customer information and contact details
- **products** - Product catalog (master products)
- **individual_products** - Individual product instances with QR codes
- **raw_materials** - Raw materials inventory
- **suppliers** - Supplier information

### Transaction Tables
- **orders** - Customer orders
- **order_items** - Items within orders
- **order_item_products** - Links orders to specific individual products
- **purchase_orders** - Purchase orders to suppliers
- **purchase_order_items** - Items in purchase orders

### Production Tables
- **production_batches** - Production batches
- **production_steps** - Steps within production batches
- **material_consumption** - Material usage tracking
- **product_recipes** - Product manufacturing recipes
- **recipe_materials** - Materials required for products

### System Tables
- **notifications** - System notifications
- **audit_logs** - System audit trail
- **performance_metrics** - System performance tracking
- **system_settings** - Application settings

## 🔧 Service Usage Examples

### Customer Management
```typescript
import { CustomerService } from './src/services';

// Create customer
const result = await CustomerService.createCustomer({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91 9876543210',
  customer_type: 'individual'
});

// Get all customers
const customers = await CustomerService.getCustomers();

// Update customer
await CustomerService.updateCustomer(customerId, {
  status: 'inactive'
});
```

### Order Management
```typescript
import { OrderService } from './src/services';

// Create order
const order = await OrderService.createOrder({
  customer_name: 'John Doe',
  items: [{
    product_name: 'Premium Carpet',
    quantity: 2,
    unit_price: 15000,
    product_type: 'product'
  }]
});

// Update order status
await OrderService.updateOrder(orderId, {
  status: 'accepted'
});
```

### Product Management
```typescript
import { ProductService } from './src/services';

// Create product
const product = await ProductService.createProduct({
  name: 'Premium Carpet',
  category: 'Carpets',
  selling_price: 15000
});

// Create individual product instances
const individual = await ProductService.createIndividualProduct({
  product_id: productId,
  manufacturing_date: '2024-01-15',
  quality_grade: 'A+',
  inspector: 'Quality Team'
});
```

### Inventory Management
```typescript
import { RawMaterialService } from './src/services';

// Create raw material
const material = await RawMaterialService.createRawMaterial({
  name: 'Premium Wool',
  category: 'Yarn',
  current_stock: 500,
  unit: 'kg',
  supplier_name: 'Wool Suppliers Ltd',
  cost_per_unit: 150
});

// Record consumption
await RawMaterialService.recordMaterialConsumption({
  production_batch_id: batchId,
  material_id: materialId,
  consumed_quantity: 50
});
```

### Production Management
```typescript
import { ProductionService } from './src/services';

// Create production batch
const batch = await ProductionService.createProductionBatch({
  product_id: productId,
  planned_quantity: 10,
  production_steps: [
    {
      step_number: 1,
      step_name: 'Material Preparation',
      estimated_duration: 60
    },
    {
      step_number: 2,
      step_name: 'Weaving',
      estimated_duration: 240
    }
  ]
});

// Start production
await ProductionService.startProductionBatch(batchId);

// Complete batch and create individual products
await ProductionService.completeProductionBatch(
  batchId,
  actualQuantity,
  individualProductsData
);
```

## 🔐 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Currently configured for authenticated users
- Can be customized for role-based access

### Audit Logging
- All operations are automatically logged
- Tracks user actions, changes, and timestamps
- Includes previous and new states

### Data Validation
- TypeScript interfaces for type safety
- Server-side validation in service functions
- Prevents invalid data insertion

## 📈 Analytics & Reporting

### Built-in Statistics
All services provide statistics methods:
```typescript
// Customer stats
const customerStats = await CustomerService.getCustomerStats();

// Order stats
const orderStats = await OrderService.getOrderStats();

// Inventory stats
const inventoryStats = await RawMaterialService.getInventoryStats();

// Production stats
const productionStats = await ProductionService.getProductionStats();
```

### Notification System
Automatic notifications for:
- Low stock alerts
- Order status changes
- Production updates
- System events

## 🔄 Data Migration

### From localStorage to Supabase
Your existing localStorage data can be migrated:

1. Export current data:
```typescript
const orders = getFromStorage(STORAGE_KEYS.ORDERS);
const customers = getFromStorage(STORAGE_KEYS.CUSTOMERS);
// ... etc
```

2. Import to Supabase:
```typescript
for (const customer of customers) {
  await CustomerService.createCustomer(customer);
}
// ... etc
```

## 📱 Frontend Integration

### Replace localStorage calls
Update your existing components to use Supabase services:

**Before:**
```typescript
const customers = getFromStorage(STORAGE_KEYS.CUSTOMERS);
```

**After:**
```typescript
const { data: customers } = await CustomerService.getCustomers();
```

### Error Handling
All services return `{ data, error }` format:
```typescript
const { data, error } = await CustomerService.createCustomer(customerData);
if (error) {
  console.error('Error:', error);
  // Handle error
} else {
  console.log('Success:', data);
  // Use data
}
```

## 🧪 Testing

### Connection Test
```typescript
import { testSupabaseConnection } from './src/services';

const isConnected = await testSupabaseConnection();
console.log('Connected:', isConnected);
```

### Full Demo
```typescript
import { SupabaseDemo } from './src/demo/supabaseDemo';

// Run complete backend demo
await SupabaseDemo.runCompleteDemo();
```

## 🔧 Maintenance

### Database Cleanup
Automatic cleanup functions:
- `NotificationService.deleteOldNotifications(30)` - Remove old notifications
- `AuditService.cleanupOldAuditLogs(365)` - Remove old audit logs

### Performance Monitoring
- Performance metrics are automatically tracked
- Query performance can be monitored via Supabase dashboard

## 📚 API Reference

All services are fully documented with TypeScript interfaces. Check the `src/services/` directory for:

- `customerService.ts` - Customer operations
- `orderService.ts` - Order management
- `productService.ts` - Product and individual product management
- `rawMaterialService.ts` - Inventory and supplier management
- `productionService.ts` - Production batch and steps
- `notificationService.ts` - Notification management
- `auditService.ts` - Audit logging

## ✅ Next Steps

1. **Execute the SQL schema** in your Supabase project
2. **Test the connection** using the demo functions
3. **Start migrating** your frontend components to use Supabase services
4. **Configure Row Level Security** for your specific user roles
5. **Set up real-time subscriptions** for live updates (if needed)

## 🆘 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check environment variables
   - Verify Supabase project URL and keys
   - Check network connectivity

2. **RLS Policies**
   - Ensure user is authenticated
   - Check policy configurations in Supabase dashboard

3. **Type Errors**
   - Ensure all required fields are provided
   - Check TypeScript interfaces in service files

### Getting Help

- Check Supabase documentation: https://supabase.com/docs
- Review the demo file: `src/demo/supabaseDemo.ts`
- Check the audit logs for system events

---

**🎉 Congratulations! Your Rajdhani ERP now has a complete, production-ready Supabase backend!**