import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFromStorage, saveToStorage } from '@/lib/storage';
import rawMaterialsData from '@/data/rawMaterials.json';

const completeProductData = {
  products: [
    {
      id: "PROD001",
      qrCode: "QR-CARPET-001",
      name: "Traditional Persian Carpet",
      category: "Handmade",
      color: "Red & Gold",
      size: "8x10 feet",
      pattern: "Persian Medallion",
      quantity: 5,
      unit: "pieces",
      status: "in-stock",
      location: "Warehouse A - Shelf 1",
      totalCost: 12030,
      sellingPrice: 25000,
      dimensions: "8' x 10' (2.44m x 3.05m)",
      weight: "45 kg",
      thickness: "12 mm",
      pileHeight: "8 mm",
      materialComposition: "80% Cotton, 20% Wool",
      notes: "High-quality traditional design, perfect for living rooms",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      materialsUsed: [
        {
          materialName: "Cotton Yarn (Premium)",
          quantity: 15,
          unit: "rolls",
          cost: 6750
        },
        {
          materialName: "Red Dye (Industrial)",
          quantity: 8,
          unit: "liters",
          cost: 1440
        },
        {
          materialName: "Latex Solution",
          quantity: 12,
          unit: "liters",
          cost: 3840
        }
      ],
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-01-15T10:00:00.000Z"
    },
    {
      id: "PROD002",
      qrCode: "QR-CARPET-002",
      name: "Modern Geometric Carpet",
      category: "Machine Made",
      color: "Blue & White",
      size: "6x9 feet",
      pattern: "Geometric",
      quantity: 12,
      unit: "pieces",
      status: "in-stock",
      location: "Warehouse B - Shelf 3",
      totalCost: 10850,
      sellingPrice: 18000,
      dimensions: "6' x 9' (1.83m x 2.74m)",
      weight: "32 kg",
      thickness: "10 mm",
      pileHeight: "6 mm",
      materialComposition: "100% Synthetic",
      notes: "Contemporary design, suitable for modern interiors",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      materialsUsed: [
        {
          materialName: "Synthetic Yarn",
          quantity: 20,
          unit: "rolls",
          cost: 7600
        },
        {
          materialName: "Blue Dye (Industrial)",
          quantity: 10,
          unit: "liters",
          cost: 1900
        },
        {
          materialName: "Backing Cloth",
          quantity: 54,
          unit: "sqm",
          cost: 1350
        }
      ],
      createdAt: "2024-01-20T10:00:00.000Z",
      updatedAt: "2024-01-20T10:00:00.000Z"
    }
  ],
  individualProducts: [
    {
      id: "IND001",
      qrCode: "QR-CARPET-001-001",
      productId: "PROD001",
      manufacturingDate: "2024-01-15",
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
      finalDimensions: "8'0\" x 10'0\" (2.44m x 3.05m)",
      finalWeight: "45.0 kg",
      finalThickness: "12.0 mm",
      finalPileHeight: "8.0 mm",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      notes: "Minor color variation",
      status: "available"
    },
    {
      id: "IND003",
      qrCode: "QR-CARPET-001-003",
      productId: "PROD001",
      manufacturingDate: "2024-01-16",
      finalDimensions: "8'1\" x 10'0\" (2.46m x 3.05m)",
      finalWeight: "45.5 kg",
      finalThickness: "12.2 mm",
      finalPileHeight: "8.1 mm",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      notes: "Excellent quality, premium finish",
      status: "sold"
    },
    {
      id: "IND004",
      qrCode: "QR-CARPET-001-004",
      productId: "PROD001",
      manufacturingDate: "2024-01-16",
      finalDimensions: "8'0\" x 10'1\" (2.44m x 3.07m)",
      finalWeight: "45.8 kg",
      finalThickness: "12.3 mm",
      finalPileHeight: "8.0 mm",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      notes: "Good quality, minor texture variation",
      status: "available"
    },
    {
      id: "IND005",
      qrCode: "QR-CARPET-001-005",
      productId: "PROD001",
      manufacturingDate: "2024-01-17",
      finalDimensions: "8'2\" x 10'0\" (2.49m x 3.05m)",
      finalWeight: "46.0 kg",
      finalThickness: "12.4 mm",
      finalPileHeight: "8.2 mm",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      notes: "Perfect quality, no defects",
      status: "available"
    },
    {
      id: "IND006",
      qrCode: "QR-CARPET-002-001",
      productId: "PROD002",
      manufacturingDate: "2024-01-20",
      finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
      finalWeight: "32.0 kg",
      finalThickness: "10.0 mm",
      finalPileHeight: "6.0 mm",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      notes: "Good quality, standard finish",
      status: "available"
    },
    {
      id: "IND007",
      qrCode: "QR-CARPET-002-002",
      productId: "PROD002",
      manufacturingDate: "2024-01-20",
      finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
      finalWeight: "32.5 kg",
      finalThickness: "10.2 mm",
      finalPileHeight: "6.1 mm",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      notes: "Excellent quality, premium finish",
      status: "available"
    },
    {
      id: "IND008",
      qrCode: "QR-CARPET-002-003",
      productId: "PROD002",
      manufacturingDate: "2024-01-21",
      finalDimensions: "6'0\" x 9'1\" (1.83m x 2.76m)",
      finalWeight: "32.2 kg",
      finalThickness: "10.1 mm",
      finalPileHeight: "6.0 mm",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      notes: "Good quality, minor texture variation",
      status: "available"
    },
    {
      id: "IND009",
      qrCode: "QR-CARPET-002-004",
      productId: "PROD002",
      manufacturingDate: "2024-01-21",
      finalDimensions: "6'1\" x 9'1\" (1.85m x 2.76m)",
      finalWeight: "32.8 kg",
      finalThickness: "10.3 mm",
      finalPileHeight: "6.2 mm",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      notes: "Perfect quality, no defects",
      status: "available"
    },
    {
      id: "IND010",
      qrCode: "QR-CARPET-002-005",
      productId: "PROD002",
      manufacturingDate: "2024-01-22",
      finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
      finalWeight: "32.1 kg",
      finalThickness: "10.0 mm",
      finalPileHeight: "6.0 mm",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      notes: "Good quality, standard finish",
      status: "available"
    },
    {
      id: "IND011",
      qrCode: "QR-CARPET-002-006",
      productId: "PROD002",
      manufacturingDate: "2024-01-22",
      finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
      finalWeight: "32.6 kg",
      finalThickness: "10.2 mm",
      finalPileHeight: "6.1 mm",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      notes: "Excellent quality, premium finish",
      status: "available"
    },
    {
      id: "IND012",
      qrCode: "QR-CARPET-002-007",
      productId: "PROD002",
      manufacturingDate: "2024-01-23",
      finalDimensions: "6'0\" x 9'1\" (1.83m x 2.76m)",
      finalWeight: "32.3 kg",
      finalThickness: "10.1 mm",
      finalPileHeight: "6.0 mm",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      notes: "Good quality, minor texture variation",
      status: "available"
    },
    {
      id: "IND013",
      qrCode: "QR-CARPET-002-008",
      productId: "PROD002",
      manufacturingDate: "2024-01-23",
      finalDimensions: "6'1\" x 9'1\" (1.85m x 2.76m)",
      finalWeight: "32.9 kg",
      finalThickness: "10.3 mm",
      finalPileHeight: "6.2 mm",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      notes: "Perfect quality, no defects",
      status: "available"
    },
    {
      id: "IND014",
      qrCode: "QR-CARPET-002-009",
      productId: "PROD002",
      manufacturingDate: "2024-01-24",
      finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
      finalWeight: "32.0 kg",
      finalThickness: "10.0 mm",
      finalPileHeight: "6.0 mm",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      notes: "Good quality, standard finish",
      status: "available"
    },
    {
      id: "IND015",
      qrCode: "QR-CARPET-002-010",
      productId: "PROD002",
      manufacturingDate: "2024-01-24",
      finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
      finalWeight: "32.5 kg",
      finalThickness: "10.2 mm",
      finalPileHeight: "6.1 mm",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      notes: "Excellent quality, premium finish",
      status: "available"
    },
    {
      id: "IND016",
      qrCode: "QR-CARPET-002-011",
      productId: "PROD002",
      manufacturingDate: "2024-01-25",
      finalDimensions: "6'0\" x 9'1\" (1.83m x 2.76m)",
      finalWeight: "32.2 kg",
      finalThickness: "10.1 mm",
      finalPileHeight: "6.0 mm",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      notes: "Good quality, minor texture variation",
      status: "available"
    },
    {
      id: "IND017",
      qrCode: "QR-CARPET-002-012",
      productId: "PROD002",
      manufacturingDate: "2024-01-25",
      finalDimensions: "6'1\" x 9'1\" (1.85m x 2.76m)",
      finalWeight: "32.8 kg",
      finalThickness: "10.3 mm",
      finalPileHeight: "6.2 mm",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      notes: "Perfect quality, no defects",
      status: "available"
    }
  ],
  productRecipes: [
    {
      id: "RECIPE_001",
      productId: "PROD001",
      productName: "Traditional Persian Carpet",
      materials: [
        {
          materialId: "1",
          materialName: "Cotton Yarn (Premium)",
          quantity: 15,
          unit: "rolls",
          costPerUnit: 450
        },
        {
          materialId: "3",
          materialName: "Red Dye (Industrial)",
          quantity: 8,
          unit: "liters",
          costPerUnit: 180
        },
        {
          materialId: "5",
          materialName: "Latex Solution",
          quantity: 12,
          unit: "liters",
          costPerUnit: 320
        }
      ],
      totalCost: 15240,
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-01-15T10:00:00.000Z",
      createdBy: "admin"
    },
    {
      id: "RECIPE_002",
      productId: "PROD002",
      productName: "Modern Geometric Carpet",
      materials: [
        {
          materialId: "2",
          materialName: "Cotton Yarn (Standard)",
          quantity: 20,
          unit: "rolls",
          costPerUnit: 520
        },
        {
          materialId: "4",
          materialName: "Blue Dye (Industrial)",
          quantity: 10,
          unit: "liters",
          costPerUnit: 190
        },
        {
          materialId: "6",
          materialName: "Backing Cloth",
          quantity: 54,
          unit: "sqm",
          costPerUnit: 85
        }
      ],
      totalCost: 16890,
      createdAt: "2024-01-20T10:00:00.000Z",
      updatedAt: "2024-01-20T10:00:00.000Z",
      createdBy: "admin"
    }
  ],
  productionProductData: [
    {
      id: "PROD001",
      qrCode: "QR-CARPET-001",
      name: "Traditional Persian Carpet",
      category: "Handmade",
      color: "Red & Gold",
      size: "8x10 feet",
      pattern: "Persian Medallion",
      quantity: 5,
      unit: "pieces",
      status: "in-stock",
      location: "Warehouse A - Shelf 1",
      totalCost: 12030,
      sellingPrice: 25000,
      dimensions: "8' x 10' (2.44m x 3.05m)",
      weight: "45 kg",
      thickness: "12 mm",
      pileHeight: "8 mm",
      materialComposition: "80% Cotton, 20% Wool",
      notes: "High-quality traditional design, perfect for living rooms",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-01-15T10:00:00.000Z",
      individualStocks: [
        {
          id: "IND001",
          qrCode: "QR-CARPET-001-001",
          productId: "PROD001",
          manufacturingDate: "2024-01-15",
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
          finalDimensions: "8'0\" x 10'0\" (2.44m x 3.05m)",
          finalWeight: "45.0 kg",
          finalThickness: "12.0 mm",
          finalPileHeight: "8.0 mm",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Minor color variation",
          status: "available"
        },
        {
          id: "IND003",
          qrCode: "QR-CARPET-001-003",
          productId: "PROD001",
          manufacturingDate: "2024-01-16",
          finalDimensions: "8'1\" x 10'0\" (2.46m x 3.05m)",
          finalWeight: "45.5 kg",
          finalThickness: "12.2 mm",
          finalPileHeight: "8.1 mm",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Excellent quality, premium finish",
          status: "sold"
        },
        {
          id: "IND004",
          qrCode: "QR-CARPET-001-004",
          productId: "PROD001",
          manufacturingDate: "2024-01-16",
          finalDimensions: "8'0\" x 10'1\" (2.44m x 3.07m)",
          finalWeight: "45.8 kg",
          finalThickness: "12.3 mm",
          finalPileHeight: "8.0 mm",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Good quality, minor texture variation",
          status: "available"
        },
        {
          id: "IND005",
          qrCode: "QR-CARPET-001-005",
          productId: "PROD001",
          manufacturingDate: "2024-01-17",
          finalDimensions: "8'2\" x 10'0\" (2.49m x 3.05m)",
          finalWeight: "46.0 kg",
          finalThickness: "12.4 mm",
          finalPileHeight: "8.2 mm",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Perfect quality, no defects",
          status: "available"
        }
      ]
    },
    {
      id: "PROD002",
      qrCode: "QR-CARPET-002",
      name: "Modern Geometric Carpet",
      category: "Machine Made",
      color: "Blue & White",
      size: "6x9 feet",
      pattern: "Geometric",
      quantity: 12,
      unit: "pieces",
      status: "in-stock",
      location: "Warehouse B - Shelf 3",
      totalCost: 10850,
      sellingPrice: 18000,
      dimensions: "6' x 9' (1.83m x 2.74m)",
      weight: "32 kg",
      thickness: "10 mm",
      pileHeight: "6 mm",
      materialComposition: "100% Synthetic",
      notes: "Contemporary design, suitable for modern interiors",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      createdAt: "2024-01-20T10:00:00.000Z",
      updatedAt: "2024-01-20T10:00:00.000Z",
      individualStocks: [
        {
          id: "IND006",
          qrCode: "QR-CARPET-002-001",
          productId: "PROD002",
          manufacturingDate: "2024-01-20",
          finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
          finalWeight: "32.0 kg",
          finalThickness: "10.0 mm",
          finalPileHeight: "6.0 mm",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Good quality, standard finish",
          status: "available"
        },
        {
          id: "IND007",
          qrCode: "QR-CARPET-002-002",
          productId: "PROD002",
          manufacturingDate: "2024-01-20",
          finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
          finalWeight: "32.5 kg",
          finalThickness: "10.2 mm",
          finalPileHeight: "6.1 mm",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Excellent quality, premium finish",
          status: "available"
        },
        {
          id: "IND008",
          qrCode: "QR-CARPET-002-003",
          productId: "PROD002",
          manufacturingDate: "2024-01-21",
          finalDimensions: "6'0\" x 9'1\" (1.83m x 2.76m)",
          finalWeight: "32.2 kg",
          finalThickness: "10.1 mm",
          finalPileHeight: "6.0 mm",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Good quality, minor texture variation",
          status: "available"
        },
        {
          id: "IND009",
          qrCode: "QR-CARPET-002-004",
          productId: "PROD002",
          manufacturingDate: "2024-01-21",
          finalDimensions: "6'1\" x 9'1\" (1.85m x 2.76m)",
          finalWeight: "32.8 kg",
          finalThickness: "10.3 mm",
          finalPileHeight: "6.2 mm",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Perfect quality, no defects",
          status: "available"
        },
        {
          id: "IND010",
          qrCode: "QR-CARPET-002-005",
          productId: "PROD002",
          manufacturingDate: "2024-01-22",
          finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
          finalWeight: "32.1 kg",
          finalThickness: "10.0 mm",
          finalPileHeight: "6.0 mm",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Good quality, standard finish",
          status: "available"
        },
        {
          id: "IND011",
          qrCode: "QR-CARPET-002-006",
          productId: "PROD002",
          manufacturingDate: "2024-01-22",
          finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
          finalWeight: "32.6 kg",
          finalThickness: "10.2 mm",
          finalPileHeight: "6.1 mm",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Excellent quality, premium finish",
          status: "available"
        },
        {
          id: "IND012",
          qrCode: "QR-CARPET-002-007",
          productId: "PROD002",
          manufacturingDate: "2024-01-23",
          finalDimensions: "6'0\" x 9'1\" (1.83m x 2.76m)",
          finalWeight: "32.3 kg",
          finalThickness: "10.1 mm",
          finalPileHeight: "6.0 mm",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Good quality, minor texture variation",
          status: "available"
        },
        {
          id: "IND013",
          qrCode: "QR-CARPET-002-008",
          productId: "PROD002",
          manufacturingDate: "2024-01-23",
          finalDimensions: "6'1\" x 9'1\" (1.85m x 2.76m)",
          finalWeight: "32.9 kg",
          finalThickness: "10.3 mm",
          finalPileHeight: "6.2 mm",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Perfect quality, no defects",
          status: "available"
        },
        {
          id: "IND014",
          qrCode: "QR-CARPET-002-009",
          productId: "PROD002",
          manufacturingDate: "2024-01-24",
          finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
          finalWeight: "32.0 kg",
          finalThickness: "10.0 mm",
          finalPileHeight: "6.0 mm",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Good quality, standard finish",
          status: "available"
        },
        {
          id: "IND015",
          qrCode: "QR-CARPET-002-010",
          productId: "PROD002",
          manufacturingDate: "2024-01-24",
          finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
          finalWeight: "32.5 kg",
          finalThickness: "10.2 mm",
          finalPileHeight: "6.1 mm",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Excellent quality, premium finish",
          status: "available"
        },
        {
          id: "IND016",
          qrCode: "QR-CARPET-002-011",
          productId: "PROD002",
          manufacturingDate: "2024-01-25",
          finalDimensions: "6'0\" x 9'1\" (1.83m x 2.76m)",
          finalWeight: "32.2 kg",
          finalThickness: "10.1 mm",
          finalPileHeight: "6.0 mm",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Good quality, minor texture variation",
          status: "available"
        },
        {
          id: "IND017",
          qrCode: "QR-CARPET-002-012",
          productId: "PROD002",
          manufacturingDate: "2024-01-25",
          finalDimensions: "6'1\" x 9'1\" (1.85m x 2.76m)",
          finalWeight: "32.8 kg",
          finalThickness: "10.3 mm",
          finalPileHeight: "6.2 mm",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Perfect quality, no defects",
          status: "available"
        }
      ]
    }
  ],
  rawMaterials: rawMaterialsData
};

export default function DataInitializer() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const initializeData = async () => {
    setIsLoading(true);
    setStatus('Initializing product data...');
    
    try {
      // Clear existing data first
      localStorage.removeItem('rajdhani_products');
      localStorage.removeItem('rajdhani_individual_products');
      localStorage.removeItem('rajdhani_product_recipes');
      localStorage.removeItem('rajdhani_production_product_data');
      localStorage.removeItem('rajdhani_raw_materials');
      
      // Add products
      localStorage.setItem('rajdhani_products', JSON.stringify(completeProductData.products));
      
      // Add individual products
      localStorage.setItem('rajdhani_individual_products', JSON.stringify(completeProductData.individualProducts));
      
      // Add product recipes
      localStorage.setItem('rajdhani_product_recipes', JSON.stringify(completeProductData.productRecipes));
      
      // Add production product data
      localStorage.setItem('rajdhani_production_product_data', JSON.stringify(completeProductData.productionProductData));
      
      // Add raw materials
      localStorage.setItem('rajdhani_raw_materials', JSON.stringify(completeProductData.rawMaterials));
      
      setStatus('✅ Product data successfully initialized!');
      
      // Verify data
      const products = getFromStorage('rajdhani_products');
      const individualProducts = getFromStorage('rajdhani_individual_products');
      const recipes = getFromStorage('rajdhani_product_recipes');
      const productionData = getFromStorage('rajdhani_production_product_data');
      const rawMaterials = getFromStorage('rajdhani_raw_materials');
      
      setStatus(prev => prev + `\n\n📊 Data Summary:\n- Products: ${products.length}\n- Individual Products: ${individualProducts.length}\n- Recipes: ${recipes.length}\n- Production Data: ${productionData.length}\n- Raw Materials: ${rawMaterials.length}`);
      
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = async () => {
    if (window.confirm('Are you sure you want to clear all product data?')) {
      setIsLoading(true);
      setStatus('Clearing product data...');
      
      try {
        localStorage.removeItem('rajdhani_products');
        localStorage.removeItem('rajdhani_individual_products');
        localStorage.removeItem('rajdhani_product_recipes');
        localStorage.removeItem('rajdhani_production_product_data');
        localStorage.removeItem('rajdhani_raw_materials');
        
        setStatus('✅ All product data cleared from localStorage');
      } catch (error) {
        setStatus(`❌ Error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const showStatus = () => {
    const products = getFromStorage('rajdhani_products');
    const individualProducts = getFromStorage('rajdhani_individual_products');
    const recipes = getFromStorage('rajdhani_product_recipes');
    const productionData = getFromStorage('rajdhani_production_product_data');
    
    setStatus(`📊 Current Data Status:\n- Products: ${products.length}\n- Individual Products: ${individualProducts.length}\n- Recipes: ${recipes.length}\n- Production Data: ${productionData.length}\n\n${products.length > 0 ? `Product Names: ${products.map((p: any) => p.name).join(', ')}` : 'No products found'}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏭 Product Data Initializer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={initializeData} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? '⏳ Initializing...' : '🚀 Initialize Data'}
          </Button>
          
          <Button 
            onClick={showStatus} 
            disabled={isLoading}
            variant="outline"
          >
            📊 Show Status
          </Button>
          
          <Button 
            onClick={clearData} 
            disabled={isLoading}
            variant="destructive"
          >
            🗑️ Clear Data
          </Button>
        </div>

        {status && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{status}</pre>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-bold">2</Badge>
            <p className="text-sm text-gray-600 mt-1">Products</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-bold">5</Badge>
            <p className="text-sm text-gray-600 mt-1">Individual Pieces</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-bold">2</Badge>
            <p className="text-sm text-gray-600 mt-1">Recipes</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-bold">2</Badge>
            <p className="text-sm text-gray-600 mt-1">Production Data</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 Features:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Real-time product data in localStorage</li>
            <li>✅ Auto-fill materials in production system</li>
            <li>✅ Complete individual product tracking</li>
            <li>✅ Recipe system for production</li>
            <li>✅ Dynamic data across all pages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
