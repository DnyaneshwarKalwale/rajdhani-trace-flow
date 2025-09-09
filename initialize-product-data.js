// Initialize Complete Product Data to localStorage
// This script adds all the product data from COMPLETE_PRODUCT_DATA.json to localStorage

const completeProductData = {
  "products": [
    {
      "id": "PROD001",
      "qrCode": "QR-CARPET-001",
      "name": "Traditional Persian Carpet",
      "category": "Handmade",
      "color": "Red & Gold",
      "size": "8x10 feet",
      "pattern": "Persian Medallion",
      "quantity": 5,
      "unit": "pieces",
      "status": "in-stock",
      "location": "Warehouse A - Shelf 1",
      "totalCost": 12030,
      "sellingPrice": 25000,
      "dimensions": "8' x 10' (2.44m x 3.05m)",
      "weight": "45 kg",
      "thickness": "12 mm",
      "pileHeight": "8 mm",
      "materialComposition": "80% Cotton, 20% Wool",
      "notes": "High-quality traditional design, perfect for living rooms",
      "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": "PROD002",
      "qrCode": "QR-CARPET-002",
      "name": "Modern Geometric Carpet",
      "category": "Machine Made",
      "color": "Blue & White",
      "size": "6x9 feet",
      "pattern": "Geometric",
      "quantity": 12,
      "unit": "pieces",
      "status": "in-stock",
      "location": "Warehouse B - Shelf 3",
      "totalCost": 10850,
      "sellingPrice": 18000,
      "dimensions": "6' x 9' (1.83m x 2.74m)",
      "weight": "32 kg",
      "thickness": "10 mm",
      "pileHeight": "6 mm",
      "materialComposition": "100% Synthetic",
      "notes": "Contemporary design, suitable for modern interiors",
      "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z"
    }
  ],
  "individualProducts": [
    {
      "id": "IND001",
      "qrCode": "QR-CARPET-001-001",
      "productId": "PROD001",
      "manufacturingDate": "2024-01-15",
      "finalDimensions": "8'2\" x 10'1\" (2.49m x 3.07m)",
      "finalWeight": "46.2 kg",
      "finalThickness": "12.5 mm",
      "finalPileHeight": "8.2 mm",
      "qualityGrade": "A+",
      "inspector": "Ahmed Khan",
      "notes": "Perfect finish, no defects",
      "status": "available"
    },
    {
      "id": "IND002",
      "qrCode": "QR-CARPET-001-002",
      "productId": "PROD001",
      "manufacturingDate": "2024-01-15",
      "finalDimensions": "8'0\" x 10'0\" (2.44m x 3.05m)",
      "finalWeight": "45.0 kg",
      "finalThickness": "12.0 mm",
      "finalPileHeight": "8.0 mm",
      "qualityGrade": "A",
      "inspector": "Ahmed Khan",
      "notes": "Minor color variation",
      "status": "available"
    },
    {
      "id": "IND003",
      "qrCode": "QR-CARPET-001-003",
      "productId": "PROD001",
      "manufacturingDate": "2024-01-16",
      "finalDimensions": "8'1\" x 10'0\" (2.46m x 3.05m)",
      "finalWeight": "45.5 kg",
      "finalThickness": "12.2 mm",
      "finalPileHeight": "8.1 mm",
      "qualityGrade": "A+",
      "inspector": "Ahmed Khan",
      "notes": "Excellent quality, premium finish",
      "status": "sold"
    },
    {
      "id": "IND004",
      "qrCode": "QR-CARPET-001-004",
      "productId": "PROD001",
      "manufacturingDate": "2024-01-16",
      "finalDimensions": "8'0\" x 10'1\" (2.44m x 3.07m)",
      "finalWeight": "45.8 kg",
      "finalThickness": "12.3 mm",
      "finalPileHeight": "8.0 mm",
      "qualityGrade": "A",
      "inspector": "Ahmed Khan",
      "notes": "Good quality, minor texture variation",
      "status": "available"
    },
    {
      "id": "IND005",
      "qrCode": "QR-CARPET-001-005",
      "productId": "PROD001",
      "manufacturingDate": "2024-01-17",
      "finalDimensions": "8'2\" x 10'0\" (2.49m x 3.05m)",
      "finalWeight": "46.0 kg",
      "finalThickness": "12.4 mm",
      "finalPileHeight": "8.2 mm",
      "qualityGrade": "A+",
      "inspector": "Ahmed Khan",
      "notes": "Perfect quality, no defects",
      "status": "available"
    }
  ],
  "productRecipes": [
    {
      "productId": "PROD001",
      "productName": "Traditional Persian Carpet",
      "materials": [
        {
          "id": "MAT_COTTON_YARN_PREMIUM",
          "name": "Cotton Yarn (Premium)",
          "quantity": 15,
          "unit": "rolls",
          "costPerUnit": 450
        },
        {
          "id": "MAT_RED_DYE_INDUSTRIAL",
          "name": "Red Dye (Industrial)",
          "quantity": 8,
          "unit": "liters",
          "costPerUnit": 180
        },
        {
          "id": "MAT_LATEX_SOLUTION",
          "name": "Latex Solution",
          "quantity": 12,
          "unit": "liters",
          "costPerUnit": 320
        }
      ],
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "productId": "PROD002",
      "productName": "Modern Geometric Carpet",
      "materials": [
        {
          "id": "MAT_SYNTHETIC_YARN",
          "name": "Synthetic Yarn",
          "quantity": 20,
          "unit": "rolls",
          "costPerUnit": 380
        },
        {
          "id": "MAT_BLUE_DYE_INDUSTRIAL",
          "name": "Blue Dye (Industrial)",
          "quantity": 10,
          "unit": "liters",
          "costPerUnit": 190
        },
        {
          "id": "MAT_BACKING_CLOTH",
          "name": "Backing Cloth",
          "quantity": 54,
          "unit": "sqm",
          "costPerUnit": 25
        }
      ],
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z"
    }
  ],
  "productionProductData": [
    {
      "id": "PROD001",
      "qrCode": "QR-CARPET-001",
      "name": "Traditional Persian Carpet",
      "category": "Handmade",
      "color": "Red & Gold",
      "size": "8x10 feet",
      "pattern": "Persian Medallion",
      "quantity": 5,
      "unit": "pieces",
      "status": "in-stock",
      "location": "Warehouse A - Shelf 1",
      "totalCost": 12030,
      "sellingPrice": 25000,
      "dimensions": "8' x 10' (2.44m x 3.05m)",
      "weight": "45 kg",
      "thickness": "12 mm",
      "pileHeight": "8 mm",
      "materialComposition": "80% Cotton, 20% Wool",
      "notes": "High-quality traditional design, perfect for living rooms",
      "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "individualStocks": [
        {
          "id": "IND001",
          "qrCode": "QR-CARPET-001-001",
          "productId": "PROD001",
          "manufacturingDate": "2024-01-15",
          "finalDimensions": "8'2\" x 10'1\" (2.49m x 3.07m)",
          "finalWeight": "46.2 kg",
          "finalThickness": "12.5 mm",
          "finalPileHeight": "8.2 mm",
          "qualityGrade": "A+",
          "inspector": "Ahmed Khan",
          "notes": "Perfect finish, no defects",
          "status": "available"
        },
        {
          "id": "IND002",
          "qrCode": "QR-CARPET-001-002",
          "productId": "PROD001",
          "manufacturingDate": "2024-01-15",
          "finalDimensions": "8'0\" x 10'0\" (2.44m x 3.05m)",
          "finalWeight": "45.0 kg",
          "finalThickness": "12.0 mm",
          "finalPileHeight": "8.0 mm",
          "qualityGrade": "A",
          "inspector": "Ahmed Khan",
          "notes": "Minor color variation",
          "status": "available"
        },
        {
          "id": "IND003",
          "qrCode": "QR-CARPET-001-003",
          "productId": "PROD001",
          "manufacturingDate": "2024-01-16",
          "finalDimensions": "8'1\" x 10'0\" (2.46m x 3.05m)",
          "finalWeight": "45.5 kg",
          "finalThickness": "12.2 mm",
          "finalPileHeight": "8.1 mm",
          "qualityGrade": "A+",
          "inspector": "Ahmed Khan",
          "notes": "Excellent quality, premium finish",
          "status": "sold"
        },
        {
          "id": "IND004",
          "qrCode": "QR-CARPET-001-004",
          "productId": "PROD001",
          "manufacturingDate": "2024-01-16",
          "finalDimensions": "8'0\" x 10'1\" (2.44m x 3.07m)",
          "finalWeight": "45.8 kg",
          "finalThickness": "12.3 mm",
          "finalPileHeight": "8.0 mm",
          "qualityGrade": "A",
          "inspector": "Ahmed Khan",
          "notes": "Good quality, minor texture variation",
          "status": "available"
        },
        {
          "id": "IND005",
          "qrCode": "QR-CARPET-001-005",
          "productId": "PROD001",
          "manufacturingDate": "2024-01-17",
          "finalDimensions": "8'2\" x 10'0\" (2.49m x 3.05m)",
          "finalWeight": "46.0 kg",
          "finalThickness": "12.4 mm",
          "finalPileHeight": "8.2 mm",
          "qualityGrade": "A+",
          "inspector": "Ahmed Khan",
          "notes": "Perfect quality, no defects",
          "status": "available"
        }
      ]
    },
    {
      "id": "PROD002",
      "qrCode": "QR-CARPET-002",
      "name": "Modern Geometric Carpet",
      "category": "Machine Made",
      "color": "Blue & White",
      "size": "6x9 feet",
      "pattern": "Geometric",
      "quantity": 12,
      "unit": "pieces",
      "status": "in-stock",
      "location": "Warehouse B - Shelf 3",
      "totalCost": 10850,
      "sellingPrice": 18000,
      "dimensions": "6' x 9' (1.83m x 2.74m)",
      "weight": "32 kg",
      "thickness": "10 mm",
      "pileHeight": "6 mm",
      "materialComposition": "100% Synthetic",
      "notes": "Contemporary design, suitable for modern interiors",
      "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      "createdAt": "2024-01-20T10:00:00.000Z",
      "updatedAt": "2024-01-20T10:00:00.000Z",
      "individualStocks": []
    }
  ]
};

// Function to initialize all data to localStorage
function initializeProductData() {
  try {
    console.log('🚀 Initializing complete product data to localStorage...');
    
    // Clear existing data first
    localStorage.removeItem('rajdhani_products');
    localStorage.removeItem('rajdhani_individual_products');
    localStorage.removeItem('rajdhani_product_recipes');
    localStorage.removeItem('rajdhani_production_product_data');
    
    // Add products
    localStorage.setItem('rajdhani_products', JSON.stringify(completeProductData.products));
    console.log('✅ Products added:', completeProductData.products.length);
    
    // Add individual products
    localStorage.setItem('rajdhani_individual_products', JSON.stringify(completeProductData.individualProducts));
    console.log('✅ Individual products added:', completeProductData.individualProducts.length);
    
    // Add product recipes
    localStorage.setItem('rajdhani_product_recipes', JSON.stringify(completeProductData.productRecipes));
    console.log('✅ Product recipes added:', completeProductData.productRecipes.length);
    
    // Add production product data
    localStorage.setItem('rajdhani_production_product_data', JSON.stringify(completeProductData.productionProductData));
    console.log('✅ Production product data added:', completeProductData.productionProductData.length);
    
    console.log('🎉 All product data successfully initialized to localStorage!');
    console.log('📊 Data Summary:');
    console.log('   - Products: 2');
    console.log('   - Individual Products: 5');
    console.log('   - Product Recipes: 2');
    console.log('   - Production Data: 2');
    
    // Verify data
    const products = JSON.parse(localStorage.getItem('rajdhani_products') || '[]');
    const individualProducts = JSON.parse(localStorage.getItem('rajdhani_individual_products') || '[]');
    const recipes = JSON.parse(localStorage.getItem('rajdhani_product_recipes') || '[]');
    const productionData = JSON.parse(localStorage.getItem('rajdhani_production_product_data') || '[]');
    
    console.log('🔍 Verification:');
    console.log('   - Products in localStorage:', products.length);
    console.log('   - Individual products in localStorage:', individualProducts.length);
    console.log('   - Recipes in localStorage:', recipes.length);
    console.log('   - Production data in localStorage:', productionData.length);
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing product data:', error);
    return false;
  }
}

// Function to clear all product data
function clearProductData() {
  try {
    console.log('🗑️ Clearing all product data from localStorage...');
    
    localStorage.removeItem('rajdhani_products');
    localStorage.removeItem('rajdhani_individual_products');
    localStorage.removeItem('rajdhani_product_recipes');
    localStorage.removeItem('rajdhani_production_product_data');
    
    console.log('✅ All product data cleared from localStorage');
    return true;
  } catch (error) {
    console.error('❌ Error clearing product data:', error);
    return false;
  }
}

// Function to show current data status
function showDataStatus() {
  console.log('📊 Current localStorage Data Status:');
  
  const products = JSON.parse(localStorage.getItem('rajdhani_products') || '[]');
  const individualProducts = JSON.parse(localStorage.getItem('rajdhani_individual_products') || '[]');
  const recipes = JSON.parse(localStorage.getItem('rajdhani_product_recipes') || '[]');
  const productionData = JSON.parse(localStorage.getItem('rajdhani_production_product_data') || '[]');
  
  console.log('   - Products:', products.length);
  console.log('   - Individual Products:', individualProducts.length);
  console.log('   - Product Recipes:', recipes.length);
  console.log('   - Production Data:', productionData.length);
  
  if (products.length > 0) {
    console.log('   - Product Names:', products.map(p => p.name).join(', '));
  }
  
  if (recipes.length > 0) {
    console.log('   - Recipe Products:', recipes.map(r => r.productName).join(', '));
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  // Browser environment
  window.initializeProductData = initializeProductData;
  window.clearProductData = clearProductData;
  window.showDataStatus = showDataStatus;
  
  console.log('🔧 Product Data Initialization Script Loaded');
  console.log('📝 Available functions:');
  console.log('   - initializeProductData() - Add all product data to localStorage');
  console.log('   - clearProductData() - Clear all product data from localStorage');
  console.log('   - showDataStatus() - Show current data status');
  
  // Auto-initialize if no data exists
  const existingProducts = JSON.parse(localStorage.getItem('rajdhani_products') || '[]');
  if (existingProducts.length === 0) {
    console.log('🔄 No existing product data found, auto-initializing...');
    initializeProductData();
  } else {
    console.log('ℹ️ Existing product data found, skipping auto-initialization');
    showDataStatus();
  }
} else {
  // Node.js environment
  module.exports = {
    initializeProductData,
    clearProductData,
    showDataStatus,
    completeProductData
  };
}
