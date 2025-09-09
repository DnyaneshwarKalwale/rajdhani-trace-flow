# 🏭 Rajdhani Carpets - Product Data Structure Documentation

## 📋 Overview

This document outlines the complete data structure for the Rajdhani Carpets ERP system, covering three main product-related pages:
1. **Products Page** - Product inventory management
2. **Product Details Page** - Detailed product information and specifications
3. **Product Stock Page** - Individual product pieces management

---

## 🗂️ Data Structure Hierarchy

```
Product (Master Record)
├── Product Details (Specifications & Materials)
└── Individual Products (Individual Pieces)
    ├── Individual Product 1
    ├── Individual Product 2
    └── Individual Product N
```

---

## 📦 1. Product Interface (Master Record)

**Location**: `src/pages/Products.tsx`, `src/pages/ProductDetail.tsx`

### Core Product Information
```typescript
interface Product {
  // Unique Identifiers
  id: string;                    // "PROD001"
  qrCode: string;               // "QR-CARPET-001"
  
  // Basic Information
  name: string;                 // "Traditional Persian Carpet"
  category: string;             // "Handmade" | "Machine Made"
  color: string;                // "Red & Gold"
  size: string;                 // "8x10 feet"
  pattern: string;              // "Persian Medallion"
  
  // Inventory Management
  quantity: number;             // 5 (total pieces in inventory)
  unit: string;                 // "pieces"
  status: "in-stock" | "low-stock" | "out-of-stock" | "expired";
  location: string;             // "Warehouse A - Shelf 1"
  
  // Financial Information
  totalCost: number;            // 12030 (total production cost)
  sellingPrice: number;         // 25000 (retail price)
  
  // Materials & Production
  materialsUsed: ProductMaterial[];  // Array of materials used
  
  // Physical Specifications
  dimensions: string;           // "8' x 10' (2.44m x 3.05m)"
  weight: string;               // "45 kg"
  thickness: string;            // "12 mm"
  pileHeight: string;           // "8 mm"
  materialComposition: string;  // "80% Cotton, 20% Wool"
  
  // Additional Information
  notes: string;                // "High-quality traditional design..."
  imageUrl?: string;            // Product image URL
  expiryDate?: string;          // Optional expiry date
}
```

### Product Material Structure
```typescript
interface ProductMaterial {
  materialName: string;         // "Cotton Yarn (Premium)"
  quantity: number;             // 15
  unit: string;                 // "rolls"
  cost: number;                 // 6750
}
```

---

## 🔍 2. Product Details Page Data

**Location**: `src/pages/ProductDetail.tsx`

### Enhanced Product Information
The Product Details page displays the same `Product` interface but with additional context:

#### **Overview Tab**
- Complete product specifications
- Material composition details
- Financial breakdown (cost vs selling price)
- Quality metrics and ratings

#### **Materials Tab**
- Detailed material usage breakdown
- Cost analysis per material
- Recipe saving functionality for production

#### **Tracking Tab**
- Individual stock details
- Production history
- Quality control information

#### **Sample Data Example**
```typescript
const sampleProduct = {
  id: "PROD001",
  qrCode: "QR-CARPET-001",
  name: "Traditional Persian Carpet",
  category: "Handmade",
  color: "Red & Gold",
  size: "8x10 feet",
  pattern: "Persian Medallion",
  quantity: 5,
  unit: "pieces",
  materialsUsed: [
    { materialName: "Cotton Yarn (Premium)", quantity: 15, unit: "rolls", cost: 6750 },
    { materialName: "Red Dye (Industrial)", quantity: 8, unit: "liters", cost: 1440 },
    { materialName: "Latex Solution", quantity: 12, unit: "liters", cost: 3840 }
  ],
  totalCost: 12030,
  sellingPrice: 25000,
  status: "in-stock",
  location: "Warehouse A - Shelf 1",
  notes: "High-quality traditional design, perfect for living rooms",
  imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
  dimensions: "8' x 10' (2.44m x 3.05m)",
  weight: "45 kg",
  thickness: "12 mm",
  pileHeight: "8 mm",
  materialComposition: "80% Cotton, 20% Wool"
};
```

---

## 📋 3. Individual Product Interface (Individual Pieces)

**Location**: `src/pages/ProductStock.tsx`, `src/pages/ProductDetail.tsx`

### Individual Product Structure
```typescript
interface IndividualProduct {
  // Unique Identifiers
  id: string;                   // "IND001"
  qrCode: string;               // "QR-CARPET-001-001"
  productId: string;            // "PROD001" (links to master product)
  
  // Production Information
  manufacturingDate: string;    // "2024-01-15"
  materialsUsed: ProductMaterial[];  // Materials used for this specific piece
  
  // Final Specifications (Actual measurements after production)
  finalDimensions: string;      // "8'2\" x 10'1\" (2.49m x 3.07m)"
  finalWeight: string;          // "46.2 kg"
  finalThickness: string;       // "12.5 mm"
  finalPileHeight: string;      // "8.2 mm"
  
  // Quality Control
  qualityGrade: string;         // "A+" | "A" | "B" | "C"
  inspector: string;            // "Ahmed Khan"
  notes: string;                // "Perfect finish, no defects"
  
  // Status Management
  status: "available" | "sold" | "damaged";
}
```

### Sample Individual Products
```typescript
const sampleIndividualProducts = [
  {
    id: "IND001",
    qrCode: "QR-CARPET-001-001",
    productId: "PROD001",
    manufacturingDate: "2024-01-15",
    materialsUsed: [
      { materialName: "Cotton Yarn (Premium)", quantity: 3, unit: "rolls", cost: 1350 },
      { materialName: "Red Dye (Industrial)", quantity: 1.6, unit: "liters", cost: 288 },
      { materialName: "Latex Solution", quantity: 2.4, unit: "liters", cost: 768 }
    ],
    finalDimensions: "8'2\" x 10'1\" (2.49m x 3.07m)",
    finalWeight: "46.2 kg",
    finalThickness: "12.5 mm",
    finalPileHeight: "8.2 mm",
    qualityGrade: "A+",
    inspector: "Ahmed Khan",
    notes: "Perfect finish, no defects",
    status: "available"
  },
  {
    id: "IND002",
    qrCode: "QR-CARPET-001-002",
    productId: "PROD001",
    manufacturingDate: "2024-01-15",
    materialsUsed: [
      { materialName: "Cotton Yarn (Premium)", quantity: 3, unit: "rolls", cost: 1350 },
      { materialName: "Red Dye (Industrial)", quantity: 1.6, unit: "liters", cost: 288 },
      { materialName: "Latex Solution", quantity: 2.4, unit: "liters", cost: 768 }
    ],
    finalDimensions: "8'0\" x 10'0\" (2.44m x 3.05m)",
    finalWeight: "45.0 kg",
    finalThickness: "12.0 mm",
    finalPileHeight: "8.0 mm",
    qualityGrade: "A",
    inspector: "Ahmed Khan",
    notes: "Minor color variation",
    status: "available"
  }
];
```

---

## 💾 4. Local Storage Structure

### Storage Keys
```typescript
// Product Master Records
'rajdhani_products'           // Array of Product objects

// Individual Product Pieces
'rajdhani_individual_products' // Array of IndividualProduct objects

// Production Integration
'rajdhani_production_products' // Production batches
'rajdhani_product_recipes'     // Material recipes for production
'rajdhani_production_product_data' // Complete product data for production
```

### Data Flow
```
1. Products Page → Loads from 'rajdhani_products'
2. Product Details → Loads from 'rajdhani_products' + 'rajdhani_individual_products'
3. Product Stock → Loads from 'rajdhani_individual_products'
4. Production → Uses 'rajdhani_product_recipes' for auto-filling materials
```

---

## 🔄 5. Data Relationships

### One-to-Many Relationship
```
Product (PROD001) "Traditional Persian Carpet"
├── IndividualProduct (IND001) "QR-CARPET-001-001"
├── IndividualProduct (IND002) "QR-CARPET-001-002"
└── IndividualProduct (IND003) "QR-CARPET-001-003"
```

### Key Relationships
- **Product.id** ↔ **IndividualProduct.productId**
- **Product.qrCode** ↔ **IndividualProduct.qrCode** (with suffix)
- **Product.materialsUsed** ↔ **IndividualProduct.materialsUsed** (scaled down)

---

## 📊 6. Data Validation Rules

### Product Validation
- `id` must be unique across all products
- `qrCode` must be unique across all products
- `quantity` must be ≥ 0
- `totalCost` and `sellingPrice` must be > 0
- `status` must be one of the defined enum values

### Individual Product Validation
- `id` must be unique across all individual products
- `qrCode` must be unique across all individual products
- `productId` must reference an existing Product
- `qualityGrade` must be one of: "A+", "A", "B", "C"
- `status` must be one of: "available", "sold", "damaged"

---

## 🎯 7. Business Logic

### Quantity Management
- **Product.quantity** = Total pieces in inventory
- **Available pieces** = IndividualProducts with status "available"
- **Sold pieces** = IndividualProducts with status "sold"
- **Damaged pieces** = IndividualProducts with status "damaged"

### Cost Calculation
- **Product.totalCost** = Sum of all material costs
- **IndividualProduct cost** = Proportional material costs per piece
- **Profit margin** = sellingPrice - totalCost

### Quality Control
- Each individual piece has its own quality grade
- Inspector information is tracked per piece
- Final specifications may vary from planned specifications

---

## 🔧 8. Integration Points

### Production System
- Material recipes are saved from Product Details page
- Production uses recipes to auto-fill material requirements
- Individual products are created during production completion

### Inventory Management
- Products are added to inventory via Excel import
- Individual products are auto-generated during import
- Stock levels are calculated from individual product status

### Sales System
- Individual products are marked as "sold" when sold
- Product quantity is updated based on individual product status
- QR codes are used for individual piece tracking

---

## 📝 9. Sample Data Summary

### Current Sample Products
1. **Traditional Persian Carpet (PROD001)**
   - Category: Handmade
   - Size: 8x10 feet
   - Cost: ₹12,030, Price: ₹25,000
   - Individual Pieces: 2 (IND001, IND002)

2. **Modern Geometric Carpet (PROD002)**
   - Category: Machine Made
   - Size: 6x9 feet
   - Cost: ₹10,850, Price: ₹18,000
   - Individual Pieces: 0 (ready for production)

### Material Usage Examples
- **Cotton Yarn (Premium)**: 15 rolls @ ₹450/roll = ₹6,750
- **Red Dye (Industrial)**: 8 liters @ ₹180/liter = ₹1,440
- **Latex Solution**: 12 liters @ ₹320/liter = ₹3,840

---

## 🚀 10. Future Enhancements

### Planned Features
- Batch tracking for production runs
- Quality control workflows
- Automated reorder points
- Advanced analytics and reporting
- Integration with external systems

### Data Extensions
- Product variants and options
- Seasonal pricing models
- Customer preferences tracking
- Supplier performance metrics
- Environmental impact tracking

---

*This documentation provides a comprehensive overview of the product data structure in the Rajdhani Carpets ERP system. For technical implementation details, refer to the individual component files.*
