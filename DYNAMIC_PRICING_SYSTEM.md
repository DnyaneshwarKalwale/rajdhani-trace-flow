# Dynamic Pricing System with GSM and Denier Support

## Overview

The Rajdhani ERP system now includes a comprehensive dynamic pricing system that supports industry-standard textile units including **GSM (Grams per Square Meter)** and **Denier** for accurate carpet and textile pricing.

## Key Features

### 🧵 Textile Units Support
- **GSM (Grams per Square Meter)**: Primary unit for carpet weight measurement
- **Denier**: Fiber linear density measurement (grams per 9,000 meters)
- **Tex**: Alternative fiber density measurement (grams per 1,000 meters)
- **Oz per Square Yard**: Imperial carpet weight measurement
- **Thread Count**: Fabric density measurement

### 📐 Comprehensive Unit Categories
- **Area-based**: sqft, sqm, piece, roll
- **Volume-based**: liter, ml, gallon, cubic_meter, cubic_foot
- **Weight-based**: kg, gram, ton, pound, ounce
- **Length-based**: meter, cm, mm, foot, inch, yard
- **Count-based**: unit, dozen, hundred, thousand
- **Textile-based**: gsm, denier, tex, oz_per_sqyd, thread_count

### 🎯 Smart Unit Selection
The system automatically suggests the most appropriate pricing unit based on:
- Product type (carpet, textile, fiber, raw_material)
- Available dimensions and properties
- Industry best practices

## Database Schema Updates

### New Tables
1. **`pricing_units`**: Reference table for all supported pricing units
2. **`product_dimensions`**: Detailed product dimensions and properties

### Updated Tables
1. **`orders`**: Added pricing_unit, unit_value, product dimensions
2. **`order_items`**: Added comprehensive pricing and dimension fields
3. **`products`**: Added textile properties (gsm, denier, tex, etc.)
4. **`raw_materials`**: Added textile properties and material_type

### New Functions
1. **`get_suggested_pricing_unit()`**: Returns optimal pricing unit
2. **`calculate_unit_value()`**: Calculates unit value from dimensions
3. **`calculate_total_price()`**: Calculates total price

## Frontend Components

### Updated Components
1. **`NewOrder.tsx`**: Integrated with dynamic pricing system
2. **`DynamicPricingForm.tsx`**: Comprehensive pricing configuration
3. **`usePricingCalculator.ts`**: Pricing calculation logic
4. **`unitConverter.ts`**: Unit conversion utilities

### New Features
- Real-time price calculation
- Dynamic unit selection
- Validation and error handling
- Product dimension input
- Textile property support

## Usage Examples

### Carpet Pricing with GSM
```typescript
// Persian Carpet: 2m × 3m, 500 GSM, ₹2 per GSM, 10 pieces
const carpet = {
  width: 2,      // meters
  height: 3,     // meters
  gsm: 500,      // grams per square meter
  pricing_unit: 'gsm',
  unit_price: 2, // ₹2 per GSM
  quantity: 10
};

// Calculation:
// Area per piece: 2m × 3m = 6 sqm
// Weight per piece: 6 sqm × 500 GSM = 3,000 grams = 3 kg
// Total weight: 3 kg × 10 pieces = 30 kg
// Total price: 30 kg × ₹2 per GSM = ₹60,000
```

### Fiber Pricing with Denier
```typescript
// Polyester Fiber: 100 denier, ₹0.5 per denier, 1000 meters
const fiber = {
  length: 1000,  // meters
  denier: 100,   // grams per 9000 meters
  pricing_unit: 'denier',
  unit_price: 0.5, // ₹0.5 per denier
  quantity: 1
};

// Calculation:
// Total price: 100 denier × ₹0.5 = ₹50 per 9000 meters
// For 1000 meters: ₹50 × (1000/9000) = ₹5.56
```

### Textile Pricing with Thread Count
```typescript
// Cotton Fabric: 200 thread count, ₹0.1 per thread count, 5 sqm
const fabric = {
  width: 2,      // meters
  height: 2.5,   // meters
  thread_count: 200,
  pricing_unit: 'thread_count',
  unit_price: 0.1, // ₹0.1 per thread count
  quantity: 1
};

// Calculation:
// Total price: 200 × ₹0.1 × 5 = ₹100
```

## Conversion Formulas

### GSM ↔ Oz/SqYd
- 1 GSM = 0.0295 oz/sqyd
- 1 oz/sqyd = 33.906 GSM

### Denier ↔ Tex
- 1 tex = 9 denier
- 1 denier = 0.111 tex

### GSM Calculation
- GSM = (Weight in grams) / (Area in square meters)
- GSM = (Weight in kg × 1000) / (Width × Height)

## Product Type Support

### Carpets
- **Primary units**: GSM, sqm, sqft
- **Properties**: width, height, gsm, weight
- **Suggested unit**: GSM (if available), otherwise sqm

### Textiles/Fibers
- **Primary units**: gsm, denier, tex, thread_count
- **Properties**: gsm, denier, tex, thread_count, fiber_density
- **Suggested unit**: gsm → denier → tex → thread_count → kg

### Raw Materials
- **Primary units**: kg, liter, unit
- **Properties**: weight, volume, density
- **Suggested unit**: kg (if weight available), otherwise liter

## Implementation Steps

### 1. Database Setup
```sql
-- Run the SQL script
\i update-pricing-system.sql
```

### 2. Frontend Integration
- The NewOrder page now uses `DynamicPricingForm`
- Product selection automatically suggests pricing units
- Real-time price calculation and validation

### 3. Product Configuration
- Add textile properties to existing products
- Set appropriate product types
- Configure dimensions and properties

## Benefits

### For Carpet Industry
- **Accurate pricing** based on actual carpet weight (GSM)
- **Quality indicator** - higher GSM = better quality
- **Cost calculation** - direct relationship between GSM and material cost

### For Textile Industry
- **Standard units** - denier for fiber pricing
- **Fabric weight** - GSM determines fabric weight and quality
- **Thread density** - thread count indicates fabric quality

### For Business
- **Flexible pricing** - multiple unit options
- **Accurate calculations** - automated price computation
- **Industry standards** - supports common textile units
- **Real-time updates** - instant price recalculation

## Testing

### Test Cases
1. **Carpet with GSM**: Verify GSM-based pricing calculations
2. **Fiber with Denier**: Test denier-based pricing
3. **Unit conversions**: Verify conversion accuracy
4. **Product selection**: Test automatic unit suggestion
5. **Price validation**: Ensure calculation accuracy

### Sample Data
The system includes sample data for testing:
- Carpet products with GSM values
- Fiber materials with denier values
- Various product types and dimensions

## Future Enhancements

### Planned Features
1. **Bulk pricing** - volume discounts
2. **Currency support** - multiple currencies
3. **Price history** - track price changes
4. **Market rates** - real-time market pricing
5. **Custom units** - user-defined pricing units

### Integration Opportunities
1. **ERP integration** - connect with existing systems
2. **API endpoints** - external system integration
3. **Reporting** - pricing analytics and reports
4. **Mobile app** - mobile pricing calculator

## Support

For questions or issues with the dynamic pricing system:
1. Check the database schema updates
2. Verify product configuration
3. Test with sample data
4. Review calculation formulas
5. Contact development team

---

**Note**: This system is designed specifically for the carpet and textile industry, with special focus on GSM and Denier units as requested by the client. The implementation follows industry standards and best practices for accurate pricing calculations.
