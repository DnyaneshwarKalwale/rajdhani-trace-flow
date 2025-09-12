import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFromStorage, saveToStorage } from '@/lib/storage';
import rawMaterialsData from '@/data/rawMaterials.json';

// Pre-generated globally unique custom IDs for sample data
// Traditional Persian Carpet: TRA-001 to TRA-005
// Modern Geometric Carpet: MOD-001 to MOD-012

// Sample product data with updated structure (with pileHeight, with width/height in meters)
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
      width: "2.44m",
      height: "3.05m",
      pileHeight: "8mm",
      materialsUsed: [
        {
          materialId: "MAT001",
          materialName: "Cotton Yarn (Premium)",
          quantity: 15,
          unit: "rolls",
          cost: 450
        },
        {
          materialId: "MAT002",
          materialName: "Red Dye (Industrial)",
          quantity: 8,
          unit: "liters",
          cost: 180
        },
        {
          materialId: "MAT003",
          materialName: "Latex Solution",
          quantity: 12,
          unit: "liters",
          cost: 320
        }
      ],
      notes: "High-quality traditional design, perfect for living rooms",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      individualStockTracking: true,
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
      width: "1.83m",
      height: "2.74m",
      pileHeight: "6mm",
      materialsUsed: [
        {
          materialId: "MAT004",
          materialName: "Synthetic Yarn",
          quantity: 20,
          unit: "rolls",
          cost: 380
        },
        {
          materialId: "MAT005",
          materialName: "Blue Dye (Industrial)",
          quantity: 10,
          unit: "liters",
          cost: 190
        },
        {
          materialId: "MAT006",
          materialName: "Backing Cloth",
          quantity: 54,
          unit: "sqm",
          cost: 25
        }
      ],
      notes: "Contemporary design, suitable for modern interiors",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      individualStockTracking: true,
      createdAt: "2024-01-20T10:00:00.000Z",
      updatedAt: "2024-01-20T10:00:00.000Z"
    },
    {
      id: "PROD003",
      qrCode: "QR-MARBLE-001",
      name: "Marble Powder (Fine Grade)",
      category: "Raw Material",
      color: "White",
      size: "NA",
      pattern: "NA",
      quantity: 4,
      unit: "tons",
      status: "in-stock",
      location: "Warehouse C - Bulk Storage",
      totalCost: 2500,
      sellingPrice: 15,
      dimensions: "Bulk Material",
      weight: "4 tons",
      thickness: "NA",
      width: "NA",
      height: "NA",
      materialsUsed: [],
      notes: "High-quality marble powder for construction and manufacturing",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center",
      individualStockTracking: false,
      createdAt: "2024-01-25T10:00:00.000Z",
      updatedAt: "2024-01-25T10:00:00.000Z"
    }
  ],
  individualProducts: [
    // Traditional Persian Carpet (PROD001) - 5 pieces: TRA-001 to TRA-005
    {
      id: "IND001",
      qrCode: "QR-CARPET-001-001",
      productId: "PROD001",
      customId: "TRA-001",
      manufacturingDate: "2024-01-15",
      materialsUsed: [],
      finalDimensions: "8'2\" x 10'1\" (2.49m x 3.07m)",
      finalWeight: "46.2 kg",
      finalThickness: "12.5 mm",
      finalWidth: "2.49m",
      finalHeight: "3.07m",
      finalPileHeight: "8mm",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      inspectorId: "INSP001",
      productionSteps: [
        {
          stepName: "Material Selection",
          machineUsed: "Manual",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T09:00:00.000Z",
          qualityNotes: "High-quality materials selected"
        },
        {
          stepName: "Weaving",
          machineUsed: "Loom-A1",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T16:00:00.000Z",
          qualityNotes: "Perfect weaving pattern"
        }
      ],
      notes: "Perfect finish, no defects",
      status: "available"
    },
    {
      id: "IND002",
      qrCode: "QR-CARPET-001-002",
      productId: "PROD001",
      customId: "TRA-002",
      manufacturingDate: "2024-01-15",
      materialsUsed: [],
      finalDimensions: "8'0\" x 10'0\" (2.44m x 3.05m)",
      finalWeight: "45.0 kg",
      finalThickness: "12.0 mm",
      finalWidth: "2.44m",
      finalHeight: "3.05m",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      inspectorId: "INSP001",
      productionSteps: [
        {
          stepName: "Material Selection",
          machineUsed: "Manual",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T09:30:00.000Z",
          qualityNotes: "High-quality materials selected"
        },
        {
          stepName: "Weaving",
          machineUsed: "Loom-A1",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T17:00:00.000Z",
          qualityNotes: "Good weaving quality"
        }
      ],
      notes: "Minor color variation",
      status: "available"
    },
    {
      id: "IND003",
      qrCode: "QR-CARPET-001-003",
      productId: "PROD001",
      customId: "TRA-003",
      manufacturingDate: "2024-01-15",
      materialsUsed: [],
      finalDimensions: "8'1\" x 10'0\" (2.46m x 3.05m)",
      finalWeight: "45.5 kg",
      finalThickness: "12.2 mm",
      finalWidth: "2.46m",
      finalHeight: "3.05m",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      inspectorId: "INSP001",
      productionSteps: [
        {
          stepName: "Material Selection",
          machineUsed: "Manual",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T10:00:00.000Z",
          qualityNotes: "Premium materials selected"
        },
        {
          stepName: "Weaving",
          machineUsed: "Loom-A1",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T18:00:00.000Z",
          qualityNotes: "Excellent weaving quality"
        }
      ],
      notes: "Excellent quality, premium finish",
      status: "sold"
    },
    {
      id: "IND004",
      qrCode: "QR-CARPET-001-004",
      productId: "PROD001",
      customId: "TRA-004",
      manufacturingDate: "2024-01-15",
      materialsUsed: [],
      finalDimensions: "8'0\" x 10'1\" (2.44m x 3.07m)",
      finalWeight: "45.8 kg",
      finalThickness: "12.3 mm",
      finalWidth: "2.44m",
      finalHeight: "3.07m",
      finalPileHeight: "8mm",
      qualityGrade: "A",
      inspector: "Ahmed Khan",
      inspectorId: "INSP001",
      productionSteps: [
        {
          stepName: "Material Selection",
          machineUsed: "Manual",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T10:30:00.000Z",
          qualityNotes: "Good materials selected"
        },
        {
          stepName: "Weaving",
          machineUsed: "Loom-A1",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T18:30:00.000Z",
          qualityNotes: "Standard weaving quality"
        }
      ],
      notes: "Good quality, minor texture variation",
      status: "available"
    },
    {
      id: "IND005",
      qrCode: "QR-CARPET-001-005",
      productId: "PROD001",
      customId: "TRA-005",
      manufacturingDate: "2024-01-15",
      materialsUsed: [],
      finalDimensions: "8'2\" x 10'0\" (2.49m x 3.05m)",
      finalWeight: "46.0 kg",
      finalThickness: "12.4 mm",
      finalWidth: "2.49m",
      finalHeight: "3.05m",
      qualityGrade: "A+",
      inspector: "Ahmed Khan",
      inspectorId: "INSP001",
      productionSteps: [
        {
          stepName: "Material Selection",
          machineUsed: "Manual",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T11:00:00.000Z",
          qualityNotes: "Premium materials selected"
        },
        {
          stepName: "Weaving",
          machineUsed: "Loom-A1",
          inspector: "Ahmed Khan",
          completedAt: "2024-01-15T19:00:00.000Z",
          qualityNotes: "Perfect weaving finish"
        }
      ],
      notes: "Perfect quality, no defects",
      status: "available"
    },
    // Modern Geometric Carpet (PROD002) - 12 pieces: MOD-001 to MOD-012
    {
      id: "IND006",
      qrCode: "QR-CARPET-002-001",
      productId: "PROD002",
      customId: "MOD-001",
      manufacturingDate: "2024-01-20",
      materialsUsed: [],
      finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
      finalWeight: "33.5 kg",
      finalThickness: "10.2 mm",
      finalWidth: "1.85m",
      finalHeight: "2.74m",
      finalPileHeight: "6mm",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      inspectorId: "INSP002",
      productionSteps: [
        {
          stepName: "Material Selection",
          machineUsed: "Manual",
          inspector: "Priya Sharma",
          completedAt: "2024-01-20T09:00:00.000Z",
          qualityNotes: "Synthetic materials selected"
        },
        {
          stepName: "Machine Weaving",
          machineUsed: "Auto-Loom-B2",
          inspector: "Priya Sharma",
          completedAt: "2024-01-20T15:00:00.000Z",
          qualityNotes: "Perfect geometric pattern"
        }
      ],
      notes: "Excellent geometric precision",
      status: "available"
    },
    {
      id: "IND007",
      qrCode: "QR-CARPET-002-002",
      productId: "PROD002",
      customId: "MOD-002",
      manufacturingDate: "2024-01-20",
      materialsUsed: [],
      finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
      finalWeight: "32.0 kg",
      finalThickness: "10.0 mm",
      finalWidth: "1.83m",
      finalHeight: "2.74m",
      finalPileHeight: "6mm",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      inspectorId: "INSP002",
      productionSteps: [
        {
          stepName: "Material Selection",
          machineUsed: "Manual",
          inspector: "Priya Sharma",
          completedAt: "2024-01-20T09:30:00.000Z",
          qualityNotes: "Standard materials selected"
        },
        {
          stepName: "Machine Weaving",
          machineUsed: "Auto-Loom-B2",
          inspector: "Priya Sharma",
          completedAt: "2024-01-20T15:30:00.000Z",
          qualityNotes: "Good geometric pattern"
        }
      ],
      notes: "Good quality finish",
      status: "sold"
    },
    {
      id: "IND008",
      qrCode: "QR-CARPET-002-003",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
      finalWeight: "33.1 kg",
      finalThickness: "10.1 mm",
      finalWidth: "1.85m",
      finalHeight: "2.74m",
      finalPileHeight: "6mm",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Excellent precision",
      status: "available"
    },
    {
      id: "IND009",
      qrCode: "QR-CARPET-002-004",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'0\" x 9'1\" (1.83m x 2.77m)",
      finalWeight: "32.5 kg",
      finalThickness: "10.2 mm",
      finalWidth: "1.83m",
      finalHeight: "2.77m",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      notes: "Standard finish",
      status: "available"
    },
    {
      id: "IND010",
      qrCode: "QR-CARPET-002-005",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'1\" x 9'1\" (1.85m x 2.77m)",
      finalWeight: "33.3 kg",
      finalThickness: "10.3 mm",
      finalWidth: "1.85m",
      finalHeight: "2.77m",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Premium quality",
      status: "sold"
    },
    {
      id: "IND011",
      qrCode: "QR-CARPET-002-006",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
      finalWeight: "32.2 kg",
      finalThickness: "10.1 mm",
      finalWidth: "1.83m",
      finalHeight: "2.74m",
      finalPileHeight: "6mm",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      notes: "Good geometric pattern",
      status: "available"
    },
    {
      id: "IND012",
      qrCode: "QR-CARPET-002-007",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
      finalWeight: "33.0 kg",
      finalThickness: "10.2 mm",
      finalWidth: "1.85m",
      finalHeight: "2.74m",
      finalPileHeight: "6mm",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Perfect finish",
      status: "available"
    },
    {
      id: "IND013",
      qrCode: "QR-CARPET-002-008",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'0\" x 9'1\" (1.83m x 2.77m)",
      finalWeight: "32.7 kg",
      finalThickness: "10.1 mm",
      finalWidth: "1.83m",
      finalHeight: "2.77m",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      notes: "Standard quality",
      status: "damaged"
    },
    {
      id: "IND014",
      qrCode: "QR-CARPET-002-009",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'1\" x 9'1\" (1.85m x 2.77m)",
      finalWeight: "33.4 kg",
      finalThickness: "10.3 mm",
      finalWidth: "1.85m",
      finalHeight: "2.77m",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Excellent geometric precision",
      status: "available"
    },
    {
      id: "IND015",
      qrCode: "QR-CARPET-002-010",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
      finalWeight: "32.8 kg",
      finalThickness: "10.0 mm",
      finalWidth: "1.83m",
      finalHeight: "2.74m",
      finalPileHeight: "6mm",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      notes: "Good quality",
      status: "available"
    },
    {
      id: "IND016",
      qrCode: "QR-CARPET-002-011",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
      finalWeight: "33.2 kg",
      finalThickness: "10.2 mm",
      finalWidth: "1.85m",
      finalHeight: "2.74m",
      finalPileHeight: "6mm",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Excellent finish",
      status: "available"
    },
    {
      id: "IND017",
      qrCode: "QR-CARPET-002-012",
      productId: "PROD002",
      materialsUsed: [],
      finalDimensions: "6'0\" x 9'1\" (1.83m x 2.77m)",
      finalWeight: "32.9 kg",
      finalThickness: "10.1 mm",
      finalWidth: "1.83m",
      finalHeight: "2.77m",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      notes: "Standard quality finish",
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
          materialId: "MAT001",
          materialName: "Cotton Yarn (Premium)",
          quantity: 15,
          unit: "rolls",
          costPerUnit: 450
        },
        {
          materialId: "MAT002",
          materialName: "Red Dye (Industrial)",
          quantity: 8,
          unit: "liters",
          costPerUnit: 180
        },
        {
          materialId: "MAT003",
          materialName: "Latex Solution",
          quantity: 12,
          unit: "liters",
          costPerUnit: 320
        }
      ],
      totalCost: 12030,
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
          materialId: "MAT004",
          materialName: "Synthetic Yarn",
          quantity: 20,
          unit: "rolls",
          costPerUnit: 380
        },
        {
          materialId: "MAT005",
          materialName: "Blue Dye (Industrial)",
          quantity: 10,
          unit: "liters",
          costPerUnit: 190
        },
        {
          materialId: "MAT006",
          materialName: "Backing Cloth",
          quantity: 54,
          unit: "sqm",
          costPerUnit: 25
        }
      ],
      totalCost: 10850,
      createdAt: "2024-01-20T10:00:00.000Z",
      updatedAt: "2024-01-20T10:00:00.000Z",
      createdBy: "admin"
    }
  ],
  productionBatches: [
    {
      id: "PROD_BATCH_001",
      productId: "PROD001",
      productName: "Traditional Persian Carpet",
      batchNumber: "BATCH-TRA-2024-001",
      targetQuantity: 5,
      actualQuantity: 5,
      status: "completed",
      priority: "normal",
      startDate: "2024-01-15T08:00:00.000Z",
      completionDate: "2024-01-15T20:00:00.000Z",
      supervisor: "Ahmed Khan",
      supervisorId: "SUP001",
      materialsConsumed: [
        {
          materialId: "MAT001",
          materialName: "Cotton Yarn (Premium)",
          quantityUsed: 75,
          unit: "rolls",
          costPerUnit: 450,
          totalCost: 33750,
          batchNumber: "CTN-2024-001",
          consumedAt: "2024-01-15T08:30:00.000Z",
          consumedBy: "Ahmed Khan"
        },
        {
          materialId: "MAT002",
          materialName: "Red Dye (Industrial)",
          quantityUsed: 40,
          unit: "liters",
          costPerUnit: 180,
          totalCost: 7200,
          batchNumber: "DYE-RED-2024-001",
          consumedAt: "2024-01-15T09:00:00.000Z",
          consumedBy: "Ahmed Khan"
        },
        {
          materialId: "MAT003",
          materialName: "Latex Solution",
          quantityUsed: 60,
          unit: "liters",
          costPerUnit: 320,
          totalCost: 19200,
          batchNumber: "LAT-2024-001",
          consumedAt: "2024-01-15T14:00:00.000Z",
          consumedBy: "Ahmed Khan"
        }
      ],
      productionSteps: [
        {
          stepId: "STEP_001",
          stepNumber: 1,
          stepName: "Material Preparation",
          stepType: "material_preparation",
          machineId: "PREP_STATION_01",
          machineName: "Material Prep Station 01",
          operatorName: "Ahmed Khan",
          operatorId: "OP001",
          inspectorName: "Ahmed Khan",
          inspectorId: "INSP001",
          startTime: "2024-01-15T08:00:00.000Z",
          endTime: "2024-01-15T08:45:00.000Z",
          duration: 45,
          status: "completed",
          qualityNotes: "All materials prepared and organized properly",
          stepNotes: "Cotton yarn, dyes, and latex solution prepared for weaving process"
        },
        {
          stepId: "STEP_002",
          stepNumber: 2,
          stepName: "Yarn Dyeing",
          stepType: "dyeing",
          machineId: "DYE_MACHINE_A1",
          machineName: "Industrial Dye Machine A1",
          operatorName: "Rajesh Kumar",
          operatorId: "OP002",
          inspectorName: "Ahmed Khan",
          inspectorId: "INSP001",
          startTime: "2024-01-15T09:00:00.000Z",
          endTime: "2024-01-15T12:00:00.000Z",
          duration: 180,
          status: "completed",
          qualityNotes: "Perfect color consistency achieved",
          stepNotes: "Red and gold colors applied to cotton yarn with traditional Persian patterns"
        },
        {
          stepId: "STEP_003",
          stepNumber: 3,
          stepName: "Traditional Hand Weaving",
          stepType: "weaving",
          machineId: "LOOM_A1",
          machineName: "Traditional Hand Loom A1",
          operatorName: "Master Weaver Ali",
          operatorId: "OP003",
          inspectorName: "Ahmed Khan",
          inspectorId: "INSP001",
          startTime: "2024-01-15T13:00:00.000Z",
          endTime: "2024-01-15T18:00:00.000Z",
          duration: 300,
          status: "completed",
          qualityNotes: "Excellent weaving quality, perfect Persian medallion pattern",
          stepNotes: "Hand-woven using traditional techniques, 5 carpets completed"
        },
        {
          stepId: "STEP_004",
          stepNumber: 4,
          stepName: "Latex Backing Application",
          stepType: "backing",
          machineId: "BACKING_MACHINE_01",
          machineName: "Automated Backing Machine 01",
          operatorName: "Suresh Patel",
          operatorId: "OP004",
          inspectorName: "Priya Sharma",
          inspectorId: "INSP002",
          startTime: "2024-01-15T18:15:00.000Z",
          endTime: "2024-01-15T19:30:00.000Z",
          duration: 75,
          status: "completed",
          qualityNotes: "Uniform backing application, good adhesion",
          stepNotes: "Latex solution applied evenly on all 5 carpets"
        },
        {
          stepId: "STEP_005",
          stepNumber: 5,
          stepName: "Final Quality Inspection",
          stepType: "quality_check",
          machineId: "QC_STATION_01",
          machineName: "Quality Control Station 01",
          operatorName: "Quality Inspector Ravi",
          operatorId: "OP005",
          inspectorName: "Priya Sharma",
          inspectorId: "INSP002",
          startTime: "2024-01-15T19:30:00.000Z",
          endTime: "2024-01-15T20:00:00.000Z",
          duration: 30,
          status: "completed",
          qualityNotes: "All 5 carpets passed final quality inspection",
          stepNotes: "Dimensions verified, quality grades assigned"
        }
      ],
      wasteGenerated: [
        {
          wasteId: "WASTE_001",
          materialId: "MAT001",
          materialName: "Cotton Yarn (Premium)",
          quantity: 3.5,
          unit: "rolls",
          wasteType: "excess",
          canBeReused: true,
          reason: "Extra yarn from cutting process",
          generatedAt: "2024-01-15T17:30:00.000Z",
          handledBy: "Ahmed Khan",
          notes: "Good quality excess yarn, can be reused for small repairs"
        },
        {
          wasteId: "WASTE_002",
          materialId: "MAT002",
          materialName: "Red Dye (Industrial)",
          quantity: 2.1,
          unit: "liters",
          wasteType: "excess",
          canBeReused: false,
          reason: "Leftover dye solution",
          generatedAt: "2024-01-15T12:00:00.000Z",
          handledBy: "Rajesh Kumar",
          notes: "Mixed dye solution cannot be reused, dispose according to environmental guidelines"
        }
      ],
      totalCost: 60150,
      notes: "First batch of traditional carpets for 2024, excellent quality achieved"
    },
    {
      id: "PROD_BATCH_002",
      productId: "PROD002",
      productName: "Modern Geometric Carpet",
      batchNumber: "BATCH-MOD-2024-001",
      targetQuantity: 12,
      actualQuantity: 12,
      status: "completed",
      priority: "high",
      startDate: "2024-01-20T08:00:00.000Z",
      completionDate: "2024-01-20T18:00:00.000Z",
      supervisor: "Priya Sharma",
      supervisorId: "SUP002",
      materialsConsumed: [
        {
          materialId: "MAT004",
          materialName: "Synthetic Yarn",
          quantityUsed: 240,
          unit: "rolls",
          costPerUnit: 380,
          totalCost: 91200,
          batchNumber: "SYN-2024-001",
          consumedAt: "2024-01-20T08:30:00.000Z",
          consumedBy: "Priya Sharma"
        },
        {
          materialId: "MAT005",
          materialName: "Blue Dye (Industrial)",
          quantityUsed: 120,
          unit: "liters",
          costPerUnit: 190,
          totalCost: 22800,
          batchNumber: "DYE-BLUE-2024-001",
          consumedAt: "2024-01-20T09:00:00.000Z",
          consumedBy: "Priya Sharma"
        },
        {
          materialId: "MAT006",
          materialName: "Backing Cloth",
          quantityUsed: 648,
          unit: "sqm",
          costPerUnit: 25,
          totalCost: 16200,
          batchNumber: "BCK-2024-001",
          consumedAt: "2024-01-20T14:00:00.000Z",
          consumedBy: "Priya Sharma"
        }
      ],
      productionSteps: [
        {
          stepId: "STEP_006",
          stepNumber: 1,
          stepName: "Synthetic Yarn Preparation",
          stepType: "material_preparation",
          machineId: "PREP_STATION_02",
          machineName: "Automated Prep Station 02",
          operatorName: "Machine Operator Dev",
          operatorId: "OP006",
          inspectorName: "Priya Sharma",
          inspectorId: "INSP002",
          startTime: "2024-01-20T08:00:00.000Z",
          endTime: "2024-01-20T08:30:00.000Z",
          duration: 30,
          status: "completed",
          qualityNotes: "Synthetic yarn quality verified and prepared",
          stepNotes: "Synthetic yarn arranged for geometric pattern production"
        },
        {
          stepId: "STEP_007",
          stepNumber: 2,
          stepName: "Automated Dyeing Process",
          stepType: "dyeing",
          machineId: "AUTO_DYE_B2",
          machineName: "Automated Dye Machine B2",
          operatorName: "Dye Specialist Mohan",
          operatorId: "OP007",
          inspectorName: "Priya Sharma",
          inspectorId: "INSP002",
          startTime: "2024-01-20T09:00:00.000Z",
          endTime: "2024-01-20T11:00:00.000Z",
          duration: 120,
          status: "completed",
          qualityNotes: "Perfect blue and white color combination achieved",
          stepNotes: "Blue and white dyes applied for modern geometric patterns"
        },
        {
          stepId: "STEP_008",
          stepNumber: 3,
          stepName: "Machine Weaving - Geometric Pattern",
          stepType: "weaving",
          machineId: "AUTO_LOOM_B2",
          machineName: "Automated Loom B2",
          operatorName: "Loom Operator Vikash",
          operatorId: "OP008",
          inspectorName: "Priya Sharma",
          inspectorId: "INSP002",
          startTime: "2024-01-20T11:30:00.000Z",
          endTime: "2024-01-20T15:30:00.000Z",
          duration: 240,
          status: "completed",
          qualityNotes: "Excellent geometric precision, consistent pattern quality",
          stepNotes: "12 geometric carpets woven with precise pattern alignment"
        },
        {
          stepId: "STEP_009",
          stepNumber: 4,
          stepName: "Backing Cloth Application",
          stepType: "backing",
          machineId: "BACKING_MACHINE_02",
          machineName: "High-Speed Backing Machine 02",
          operatorName: "Backing Specialist Arjun",
          operatorId: "OP009",
          inspectorName: "Quality Lead Ravi",
          inspectorId: "INSP003",
          startTime: "2024-01-20T15:45:00.000Z",
          endTime: "2024-01-20T17:00:00.000Z",
          duration: 75,
          status: "completed",
          qualityNotes: "Uniform backing application on all 12 carpets",
          stepNotes: "Backing cloth applied with industrial adhesive"
        },
        {
          stepId: "STEP_010",
          stepNumber: 5,
          stepName: "Final Inspection and Packaging",
          stepType: "quality_check",
          machineId: "QC_STATION_02",
          machineName: "Advanced QC Station 02",
          operatorName: "Senior Inspector Meera",
          operatorId: "OP010",
          inspectorName: "Quality Lead Ravi",
          inspectorId: "INSP003",
          startTime: "2024-01-20T17:00:00.000Z",
          endTime: "2024-01-20T18:00:00.000Z",
          duration: 60,
          status: "completed",
          qualityNotes: "All 12 carpets meet quality standards, ready for shipment",
          stepNotes: "Quality grades assigned, packaging completed"
        }
      ],
      wasteGenerated: [
        {
          wasteId: "WASTE_003",
          materialId: "MAT004",
          materialName: "Synthetic Yarn",
          quantity: 8.2,
          unit: "rolls",
          wasteType: "excess",
          canBeReused: true,
          reason: "Leftover yarn from geometric pattern cutting",
          generatedAt: "2024-01-20T15:00:00.000Z",
          handledBy: "Priya Sharma",
          notes: "High-quality synthetic yarn, suitable for repairs and small projects"
        },
        {
          wasteId: "WASTE_004",
          materialId: "MAT006",
          materialName: "Backing Cloth",
          quantity: 15.5,
          unit: "sqm",
          wasteType: "scrap",
          canBeReused: false,
          reason: "Edge trimming waste",
          generatedAt: "2024-01-20T16:30:00.000Z",
          handledBy: "Arjun",
          notes: "Small cloth pieces from trimming, not suitable for reuse"
        }
      ],
      totalCost: 130200,
      notes: "High-priority batch completed successfully, modern geometric design well received"
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
      width: "2.44m",
      height: "3.05m",
      materialsUsed: [
        {
          materialId: "MAT001",
          materialName: "Cotton Yarn (Premium)",
          quantity: 15,
          unit: "rolls",
          cost: 450
        },
        {
          materialId: "MAT002",
          materialName: "Red Dye (Industrial)",
          quantity: 8,
          unit: "liters",
          cost: 180
        },
        {
          materialId: "MAT003",
          materialName: "Latex Solution",
          quantity: 12,
          unit: "liters",
          cost: 320
        }
      ],
      notes: "High-quality traditional design, perfect for living rooms",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-01-15T10:00:00.000Z",
      individualStocks: [
        {
          id: "IND001",
          qrCode: "QR-CARPET-001-001",
          productId: "PROD001",
          materialsUsed: [],
          finalDimensions: "8'2\" x 10'1\" (2.49m x 3.07m)",
          finalWeight: "46.2 kg",
          finalThickness: "12.5 mm",
          finalWidth: "2.49m",
          finalHeight: "3.07m",
          finalPileHeight: "8mm",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Perfect finish, no defects",
          status: "available"
        },
        {
          id: "IND002",
          qrCode: "QR-CARPET-001-002",
          productId: "PROD001",
          materialsUsed: [],
          finalDimensions: "8'0\" x 10'0\" (2.44m x 3.05m)",
          finalWeight: "45.0 kg",
          finalThickness: "12.0 mm",
          finalWidth: "2.44m",
          finalHeight: "3.05m",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Minor color variation",
          status: "available"
        },
        {
          id: "IND003",
          qrCode: "QR-CARPET-001-003",
          productId: "PROD001",
          materialsUsed: [],
          finalDimensions: "8'1\" x 10'0\" (2.46m x 3.05m)",
          finalWeight: "45.5 kg",
          finalThickness: "12.2 mm",
          finalWidth: "2.46m",
          finalHeight: "3.05m",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Excellent quality, premium finish",
          status: "sold"
        },
        {
          id: "IND004",
          qrCode: "QR-CARPET-001-004",
          productId: "PROD001",
          materialsUsed: [],
          finalDimensions: "8'0\" x 10'1\" (2.44m x 3.07m)",
          finalWeight: "45.8 kg",
          finalThickness: "12.3 mm",
          finalWidth: "2.44m",
          finalHeight: "3.07m",
          finalPileHeight: "8mm",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Good quality, minor texture variation",
          status: "available"
        },
        {
          id: "IND005",
          qrCode: "QR-CARPET-001-005",
          productId: "PROD001",
          materialsUsed: [],
          finalDimensions: "8'2\" x 10'0\" (2.49m x 3.05m)",
          finalWeight: "46.0 kg",
          finalThickness: "12.4 mm",
          finalWidth: "2.49m",
          finalHeight: "3.05m",
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
      width: "1.83m",
      height: "2.74m",
      materialsUsed: [
        {
          materialId: "MAT004",
          materialName: "Synthetic Yarn",
          quantity: 20,
          unit: "rolls",
          cost: 380
        },
        {
          materialId: "MAT005",
          materialName: "Blue Dye (Industrial)",
          quantity: 10,
          unit: "liters",
          cost: 190
        },
        {
          materialId: "MAT006",
          materialName: "Backing Cloth",
          quantity: 54,
          unit: "sqm",
          cost: 25
        }
      ],
      notes: "Contemporary design, suitable for modern interiors",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      createdAt: "2024-01-20T10:00:00.000Z",
      updatedAt: "2024-01-20T10:00:00.000Z",
      individualStocks: [
        {
          id: "IND006",
          qrCode: "QR-CARPET-002-001",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
          finalWeight: "33.5 kg",
          finalThickness: "10.2 mm",
          finalWidth: "1.85m",
          finalHeight: "2.74m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Excellent geometric precision",
          status: "available"
        },
        {
          id: "IND007",
          qrCode: "QR-CARPET-002-002",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
          finalWeight: "32.0 kg",
          finalThickness: "10.0 mm",
          finalWidth: "1.83m",
          finalHeight: "2.74m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Good quality finish",
          status: "sold"
        },
        {
          id: "IND008",
          qrCode: "QR-CARPET-002-003",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
          finalWeight: "33.1 kg",
          finalThickness: "10.1 mm",
          finalWidth: "1.85m",
          finalHeight: "2.74m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Excellent precision",
          status: "available"
        },
        {
          id: "IND009",
          qrCode: "QR-CARPET-002-004",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'0\" x 9'1\" (1.83m x 2.77m)",
          finalWeight: "32.5 kg",
          finalThickness: "10.2 mm",
          finalWidth: "1.83m",
          finalHeight: "2.77m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Standard finish",
          status: "available"
        },
        {
          id: "IND010",
          qrCode: "QR-CARPET-002-005",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'1\" x 9'1\" (1.85m x 2.77m)",
          finalWeight: "33.3 kg",
          finalThickness: "10.3 mm",
          finalWidth: "1.85m",
          finalHeight: "2.77m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Premium quality",
          status: "sold"
        },
        {
          id: "IND011",
          qrCode: "QR-CARPET-002-006",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
          finalWeight: "32.2 kg",
          finalThickness: "10.1 mm",
          finalWidth: "1.83m",
          finalHeight: "2.74m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Good geometric pattern",
          status: "available"
        },
        {
          id: "IND012",
          qrCode: "QR-CARPET-002-007",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
          finalWeight: "33.0 kg",
          finalThickness: "10.2 mm",
          finalWidth: "1.85m",
          finalHeight: "2.74m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Perfect finish",
          status: "available"
        },
        {
          id: "IND013",
          qrCode: "QR-CARPET-002-008",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'0\" x 9'1\" (1.83m x 2.77m)",
          finalWeight: "32.7 kg",
          finalThickness: "10.1 mm",
          finalWidth: "1.83m",
          finalHeight: "2.77m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Standard quality",
          status: "damaged"
        },
        {
          id: "IND014",
          qrCode: "QR-CARPET-002-009",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'1\" x 9'1\" (1.85m x 2.77m)",
          finalWeight: "33.4 kg",
          finalThickness: "10.3 mm",
          finalWidth: "1.85m",
          finalHeight: "2.77m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Excellent geometric precision",
          status: "available"
        },
        {
          id: "IND015",
          qrCode: "QR-CARPET-002-010",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
          finalWeight: "32.8 kg",
          finalThickness: "10.0 mm",
          finalWidth: "1.83m",
          finalHeight: "2.74m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Good quality",
          status: "available"
        },
        {
          id: "IND016",
          qrCode: "QR-CARPET-002-011",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
          finalWeight: "33.2 kg",
          finalThickness: "10.2 mm",
          finalWidth: "1.85m",
          finalHeight: "2.74m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Excellent finish",
          status: "available"
        },
        {
          id: "IND017",
          qrCode: "QR-CARPET-002-012",
          productId: "PROD002",
          materialsUsed: [],
          finalDimensions: "6'0\" x 9'1\" (1.83m x 2.77m)",
          finalWeight: "32.9 kg",
          finalThickness: "10.1 mm",
          finalWidth: "1.83m",
          finalHeight: "2.77m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Standard quality finish",
          status: "available"
        }
      ]
    }
  ],
  rawMaterials: [
    {
      "id": "MAT001",
      "name": "Cotton Yarn (Premium)",
      "brand": "TextilePro",
      "category": "Yarn",
      "currentStock": 45,
      "unit": "rolls",
      "minThreshold": 100,
      "maxCapacity": 500,
      "reorderPoint": 120,
      "lastRestocked": "2024-01-10",
      "dailyUsage": 8,
      "status": "low-stock",
      "supplier": "Gujarat Textiles Ltd",
      "supplierId": "supplier_1",
      "costPerUnit": 450,
      "totalValue": 20250,
      "qualityGrade": "A+",
      "batchNumber": "BATCH-2024-001",
      "manufacturingDate": "2024-01-05",
      "expiryDate": "2025-01-05",
      "imageUrl": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=150&h=150&fit=crop&crop=center",
      "materialsUsed": [],
      "supplierPerformance": 85
    },
    {
      "id": "MAT007",
      "name": "Cotton Yarn (Standard)",
      "brand": "PremiumYarn",
      "category": "Yarn",
      "currentStock": 120,
      "unit": "rolls",
      "minThreshold": 100,
      "maxCapacity": 500,
      "reorderPoint": 120,
      "lastRestocked": "2024-01-12",
      "dailyUsage": 8,
      "status": "in-stock",
      "supplier": "ABC Textiles Ltd",
      "supplierId": "supplier_2",
      "costPerUnit": 520,
      "totalValue": 62400,
      "qualityGrade": "A",
      "batchNumber": "BATCH-2024-002",
      "manufacturingDate": "2024-01-08",
      "expiryDate": "2025-01-08",
      "imageUrl": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=150&h=150&fit=crop&crop=center",
      "materialsUsed": [],
      "supplierPerformance": 92
    },
    {
      "id": "MAT002",
      "name": "Red Dye (Industrial)",
      "brand": "ColorMax",
      "category": "Dye",
      "currentStock": 85,
      "unit": "liters",
      "minThreshold": 50,
      "maxCapacity": 200,
      "reorderPoint": 60,
      "lastRestocked": "2024-01-12",
      "dailyUsage": 3,
      "status": "in-stock",
      "supplier": "Chemical Works India",
      "supplierId": "supplier_3",
      "costPerUnit": 180,
      "totalValue": 15300,
      "qualityGrade": "A",
      "batchNumber": "BATCH-2024-003",
      "manufacturingDate": "2024-01-10",
      "expiryDate": "2024-07-10",
      "imageUrl": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center",
      "materialsUsed": [],
      "supplierPerformance": 78
    },
    {
      "id": "MAT005",
      "name": "Blue Dye (Industrial)",
      "brand": "ColorMax",
      "category": "Dye",
      "currentStock": 60,
      "unit": "liters",
      "minThreshold": 50,
      "maxCapacity": 200,
      "reorderPoint": 60,
      "lastRestocked": "2024-01-20",
      "dailyUsage": 2,
      "status": "in-stock",
      "supplier": "Chemical Works India",
      "supplierId": "supplier_3",
      "costPerUnit": 190,
      "totalValue": 11400,
      "qualityGrade": "A",
      "batchNumber": "BATCH-2024-004",
      "manufacturingDate": "2024-01-18",
      "expiryDate": "2024-07-18",
      "imageUrl": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center",
      "materialsUsed": [],
      "supplierPerformance": 78
    },
    {
      "id": "MAT003",
      "name": "Latex Solution",
      "brand": "BondMax",
      "category": "Chemical",
      "currentStock": 150,
      "unit": "liters",
      "minThreshold": 100,
      "maxCapacity": 300,
      "reorderPoint": 120,
      "lastRestocked": "2024-01-15",
      "dailyUsage": 5,
      "status": "in-stock",
      "supplier": "Adhesive Solutions Ltd",
      "supplierId": "supplier_4",
      "costPerUnit": 120,
      "totalValue": 18000,
      "qualityGrade": "A",
      "batchNumber": "BATCH-2024-005",
      "manufacturingDate": "2024-01-12",
      "expiryDate": "2024-04-12",
      "imageUrl": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=150&h=150&fit=crop&crop=center",
      "materialsUsed": [],
      "supplierPerformance": 88
    },
    {
      "id": "MAT006",
      "name": "Backing Cloth",
      "brand": "FabricPro",
      "category": "Fabric",
      "currentStock": 125,
      "unit": "sqm",
      "minThreshold": 100,
      "maxCapacity": 500,
      "reorderPoint": 120,
      "lastRestocked": "2024-01-18",
      "dailyUsage": 10,
      "status": "in-stock",
      "supplier": "Textile Solutions",
      "supplierId": "supplier_5",
      "costPerUnit": 85,
      "totalValue": 10625,
      "qualityGrade": "B",
      "batchNumber": "BATCH-2024-006",
      "manufacturingDate": "2024-01-15",
      "expiryDate": "2025-01-15",
      "imageUrl": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=150&h=150&fit=crop&crop=center",
      "materialsUsed": [],
      "supplierPerformance": 75
    },
    {
      "id": "MAT004",
      "name": "Synthetic Yarn",
      "brand": "SyntheticPro",
      "category": "Yarn",
      "currentStock": 200,
      "unit": "rolls",
      "minThreshold": 150,
      "maxCapacity": 600,
      "reorderPoint": 180,
      "lastRestocked": "2024-01-18",
      "dailyUsage": 12,
      "status": "in-stock",
      "supplier": "Synthetic Materials Corp",
      "supplierId": "supplier_6",
      "costPerUnit": 380,
      "totalValue": 76000,
      "qualityGrade": "A",
      "batchNumber": "BATCH-2024-007",
      "manufacturingDate": "2024-01-15",
      "expiryDate": "2025-01-15",
      "imageUrl": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=150&h=150&fit=crop&crop=center",
      "materialsUsed": [],
      "supplierPerformance": 92
    }
  ]
};

export default function DataInitializer() {
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const initializeData = async () => {
    setIsLoading(true);
    setStatus('Initializing sample product data...');
    
    try {
      // Clear existing data first
      localStorage.removeItem('rajdhani_products');
      localStorage.removeItem('rajdhani_individual_products');
      localStorage.removeItem('rajdhani_product_recipes');
      localStorage.removeItem('rajdhani_production_product_data');
      localStorage.removeItem('rajdhani_production_batches');
      localStorage.removeItem('rajdhani_raw_materials');
      
      // Add products with sample data
      localStorage.setItem('rajdhani_products', JSON.stringify(completeProductData.products));
      
      // Add individual products with sample data
      localStorage.setItem('rajdhani_individual_products', JSON.stringify(completeProductData.individualProducts));
      
      // Add product recipes with sample data
      localStorage.setItem('rajdhani_product_recipes', JSON.stringify(completeProductData.productRecipes));
      
      // Add production product data with sample data
      localStorage.setItem('rajdhani_production_product_data', JSON.stringify(completeProductData.productionProductData));
      
      // Add production batches with complete workflow data
      localStorage.setItem('rajdhani_production_batches', JSON.stringify(completeProductData.productionBatches));
      
      // Add raw materials (keep this as is)
      localStorage.setItem('rajdhani_raw_materials', JSON.stringify(completeProductData.rawMaterials));
      
      setStatus('✅ Sample product data initialized successfully!');
      
      // Verify data
      const products = getFromStorage('rajdhani_products');
      const individualProducts = getFromStorage('rajdhani_individual_products');
      const recipes = getFromStorage('rajdhani_product_recipes');
      const productionData = getFromStorage('rajdhani_production_product_data');
      const productionBatches = getFromStorage('rajdhani_production_batches');
      const rawMaterials = getFromStorage('rajdhani_raw_materials');
      
      setStatus(prev => prev + `\n\n📊 Sample Data Summary:\n- Products: ${products.length} (with globally unique custom IDs)\n- Individual Products: ${individualProducts.length} (TRA-001 to TRA-005, MOD-001 to MOD-012)\n- Recipes: ${recipes.length}\n- Production Data: ${productionData.length}\n- Production Batches: ${productionBatches.length} (complete workflow tracking)\n- Raw Materials: ${rawMaterials.length}\n\n🎯 Production Workflow Features:\n- Unique production batch IDs (PROD_BATCH_001, PROD_BATCH_002)\n- Complete step tracking (material prep, dyeing, weaving, backing, QC)\n- Material consumption tracking with batch numbers\n- Waste generation tracking\n- Inspector and operator details for each step`);
      
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
        localStorage.removeItem('rajdhani_production_batches');
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
    const productionBatches = getFromStorage('rajdhani_production_batches');
    
    setStatus(`📊 Current Data Status:\n- Products: ${products.length}\n- Individual Products: ${individualProducts.length}\n- Recipes: ${recipes.length}\n- Production Data: ${productionData.length}\n- Production Batches: ${productionBatches.length}\n\n${products.length > 0 ? `Product Names: ${products.map((p: any) => p.name).join(', ')}` : 'No products found - Ready to initialize sample data!'}\n\n${productionBatches.length > 0 ? `Production Batches: ${productionBatches.map((b: any) => b.batchNumber).join(', ')}` : ''}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏭 Sample Data Initializer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={initializeData} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? '⏳ Initializing...' : '🚀 Initialize Sample Data'}
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-bold">3</Badge>
            <p className="text-sm text-gray-600 mt-1">Products</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-bold">17</Badge>
            <p className="text-sm text-gray-600 mt-1">Individual Pieces</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-bold">2</Badge>
            <p className="text-sm text-gray-600 mt-1">Recipes</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-bold">2</Badge>
            <p className="text-sm text-gray-600 mt-1">Production Batches</p>
          </div>
          <div className="text-center">
            <Badge variant="outline" className="text-lg font-bold">10</Badge>
            <p className="text-sm text-gray-600 mt-1">Production Steps</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 Production Workflow System Features:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Globally unique individual product IDs (TRA-001, MOD-001, etc.)</li>
            <li>✅ Complete production batch tracking with unique batch IDs</li>
            <li>✅ Detailed production steps with machines, operators & inspectors</li>
            <li>✅ Material consumption tracking with batch numbers & timestamps</li>
            <li>✅ Waste generation tracking with reusability status</li>
            <li>✅ Quality control data for each production step</li>
            <li>✅ Cost tracking per batch and per material</li>
            <li>✅ Ready for complete production traceability</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}