import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductService } from '@/services/ProductService';
import { CustomerService } from '@/services/customerService';
import { RawMaterialService } from '@/services/rawMaterialService';
import { individualProductService } from '@/services/individualProductService';
import { ProductRecipeService } from '@/services/productRecipeService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { QRCodeService, MainProductQRData, IndividualProductQRData } from '@/lib/qrCode';
import { IDGenerator } from '@/lib/idGenerator';
import rawMaterialsData from '@/data/rawMaterials.json';

// Helper functions for calculating specifications
const calculateSpecsFromCategory = (category: string) => {
  if (category === 'raw material') {
    return {
      weight: '800 GSM',
      thickness: 'N/A',
      width: 'N/A',
      height: 'N/A'
    };
  }
  
  // Specifications for different carpet categories using new client-specific options
  switch (category) {
    case 'plain paper print':
      return {
        weight: '400 GSM',
        thickness: '12mm',
        width: '5 feet',
        height: '148 feet'
      };
    case 'degital print':
      return {
        weight: '600 GSM',
        thickness: '10mm',
        width: '6 feet',
        height: '148 feet'
      };
    case 'digital print':
      return {
        weight: '700 GSM',
        thickness: '11mm',
        width: '10 feet',
        height: '45 meter'
      };
    case 'backing':
      return {
        weight: '800 GSM',
        thickness: '8mm',
        width: '1.25 meter',
        height: '45 meter'
      };
    case 'felt':
      return {
        weight: '400 GSM',
        thickness: '5mm',
        width: '1.83 meter',
        height: '45 meter'
      };
    default:
      return {
        weight: '400 GSM',
        thickness: '10mm',
        width: '5 feet',
        height: '148 feet'
      };
  }
};

// Pre-generated globally unique custom IDs for sample data
// Traditional Persian Carpet: TRA-001 to TRA-005
// Modern Geometric Carpet: MOD-001 to MOD-012

// Sample product data with updated structure using new client-specific dropdown options
const completeProductData = {
  products: [
    {
      id: "PROD001",
      qrCode: "", // Will be generated dynamically
      name: "Traditional Persian Carpet",
      category: "plain paper print",
      color: "Red",
      pattern: "Persian Medallion",
      quantity: 5,
      unit: "roll",
      status: "in-stock",
      weight: "400 GSM",
      thickness: "12mm",
      width: "5 feet",
      height: "148 feet",
      materialsUsed: [
        {
          materialId: "MAT001",
          materialName: "Cotton Yarn (Premium)",
          quantity: 0,
          unit: "rolls",
          cost: 450
        },
        {
          materialId: "MAT002",
          materialName: "Red Dye (Industrial)",
          quantity: 0,
          unit: "liters",
          cost: 180
        },
        {
          materialId: "MAT003",
          materialName: "Latex Solution",
          quantity: 0,
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
      qrCode: "", // Will be generated dynamically
      name: "Modern Geometric Carpet",
      category: "degital print",
      color: "Blue",
      pattern: "Geometric",
      quantity: 12,
      unit: "roll",
      status: "in-stock",
      weight: "600 GSM",
      thickness: "10mm",
      width: "6 feet",
      height: "148 feet",
      materialsUsed: [
        {
          materialId: "MAT004",
          materialName: "Synthetic Yarn",
          quantity: 0,
          unit: "rolls",
          cost: 380
        },
        {
          materialId: "MAT005",
          materialName: "Blue Dye (Industrial)",
          quantity: 0,
          unit: "liters",
          cost: 190
        },
        {
          materialId: "MAT006",
          materialName: "Backing Cloth",
          quantity: 0,
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
      qrCode: "", // Will be generated dynamically
      name: "Digital Print Carpet",
      category: "digital print",
      color: "Multi-color",
      pattern: "Digital Art",
      quantity: 8,
      unit: "roll",
      status: "in-stock",
      weight: "700 GSM",
      thickness: "11mm",
      width: "10 feet",
      height: "45 meter",
      materialsUsed: [
        {
          materialId: "MAT007",
          materialName: "Digital Ink",
          quantity: 0,
          unit: "liter",
          cost: 250
        },
        {
          materialId: "MAT008",
          materialName: "Base Fabric",
          quantity: 0,
          unit: "sqm",
          cost: 45
        }
      ],
      notes: "High-resolution digital print carpet with vibrant colors",
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
      individualStockTracking: true,
      createdAt: "2024-01-22T10:00:00.000Z",
      updatedAt: "2024-01-22T10:00:00.000Z"
    },
    {
      id: "PROD004",
      qrCode: "", // Will be generated dynamically
      name: "Backing Material",
      category: "backing",
      color: "Brown",
      pattern: "None",
      quantity: 15,
      unit: "roll",
      status: "in-stock",
      weight: "800 GSM",
      thickness: "8mm",
      width: "1.25 meter",
      height: "45 meter",
      materialsUsed: [
        {
          materialId: "MAT009",
          materialName: "Jute Fiber",
          quantity: 0,
          unit: "kg",
          cost: 35
        }
      ],
      notes: "High-quality backing material for carpet manufacturing",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center",
      individualStockTracking: false,
      createdAt: "2024-01-23T10:00:00.000Z",
      updatedAt: "2024-01-23T10:00:00.000Z"
    },
    {
      id: "PROD005",
      qrCode: "", // Will be generated dynamically
      name: "Felt Underlay",
      category: "felt",
      color: "Gray",
      pattern: "None",
      quantity: 20,
      unit: "roll",
      status: "in-stock",
      weight: "400 GSM",
      thickness: "5mm",
      width: "1.83 meter",
      height: "45 meter",
      materialsUsed: [
        {
          materialId: "MAT010",
          materialName: "Wool Fiber",
          quantity: 0,
          unit: "kg",
          cost: 120
        }
      ],
      notes: "Premium felt underlay for carpet installation",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center",
      individualStockTracking: false,
      createdAt: "2024-01-24T10:00:00.000Z",
      updatedAt: "2024-01-24T10:00:00.000Z"
    },
    {
      id: "PROD006",
      qrCode: "", // Will be generated dynamically
      name: "Marble Powder (Fine Grade)",
      category: "raw material",
      color: "White",
      pattern: "None",
      quantity: 4,
      unit: "kg",
      status: "in-stock",
      weight: "800 GSM",
      thickness: "N/A",
      width: "N/A",
      height: "N/A",
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
      qrCode: "", // Will be generated dynamically
      productId: "PROD001",
      customId: "TRA-001",
      manufacturingDate: new Date().toISOString().split('T')[0],
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "12mm",
      finalWidth: "5 feet",
      finalHeight: "148 feet",
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
      qrCode: "", // Will be generated dynamically
      productId: "PROD001",
      customId: "TRA-002",
      manufacturingDate: new Date().toISOString().split('T')[0],
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "12mm",
      finalWidth: "5 feet",
      finalHeight: "148 feet",
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
      qrCode: "", // Will be generated dynamically
      productId: "PROD001",
      customId: "TRA-003",
      manufacturingDate: new Date().toISOString().split('T')[0],
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "12mm",
      finalWidth: "5 feet",
      finalHeight: "148 feet",
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
      qrCode: "", // Will be generated dynamically
      productId: "PROD001",
      customId: "TRA-004",
      manufacturingDate: new Date().toISOString().split('T')[0],
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "12mm",
      finalWidth: "5 feet",
      finalHeight: "148 feet",
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
      qrCode: "", // Will be generated dynamically
      productId: "PROD001",
      customId: "TRA-005",
      manufacturingDate: new Date().toISOString().split('T')[0],
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "12mm",
      finalWidth: "5 feet",
      finalHeight: "148 feet",
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
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      customId: "MOD-001",
      manufacturingDate: new Date().toISOString().split('T')[0],
      materialsUsed: [],
      finalWeight: "600 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
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
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      customId: "MOD-002",
      manufacturingDate: new Date().toISOString().split('T')[0],
      materialsUsed: [],
      finalWeight: "600 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
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
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Excellent precision",
      status: "available"
    },
    {
      id: "IND009",
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      notes: "Standard finish",
      status: "available"
    },
    {
      id: "IND010",
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Premium quality",
      status: "sold"
    },
    {
      id: "IND011",
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "600 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      notes: "Good geometric pattern",
      status: "available"
    },
    {
      id: "IND012",
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Perfect finish",
      status: "available"
    },
    {
      id: "IND013",
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      notes: "Standard quality",
      status: "damaged"
    },
    {
      id: "IND014",
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Excellent geometric precision",
      status: "available"
    },
    {
      id: "IND015",
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "600 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
      qualityGrade: "A",
      inspector: "Priya Sharma",
      notes: "Good quality",
      status: "available"
    },
    {
      id: "IND016",
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
      qualityGrade: "A+",
      inspector: "Priya Sharma",
      notes: "Excellent finish",
      status: "available"
    },
    {
      id: "IND017",
      qrCode: "", // Will be generated dynamically
      productId: "PROD002",
      materialsUsed: [],
      finalWeight: "400 GSM",
      finalThickness: "10mm",
      finalWidth: "6 feet",
      finalHeight: "148 feet",
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
          quantity: 0,
          unit: "rolls",
          costPerUnit: 450
        },
        {
          materialId: "MAT002",
          materialName: "Red Dye (Industrial)",
          quantity: 0,
          unit: "liters",
          costPerUnit: 180
        },
        {
          materialId: "MAT003",
          materialName: "Latex Solution",
          quantity: 0,
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
          quantity: 0,
          unit: "rolls",
          costPerUnit: 380
        },
        {
          materialId: "MAT005",
          materialName: "Blue Dye (Industrial)",
          quantity: 0,
          unit: "liters",
          costPerUnit: 190
        },
        {
          materialId: "MAT006",
          materialName: "Backing Cloth",
          quantity: 0,
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
          quantityUsed: 0,
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
          quantityUsed: 0,
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
          quantityUsed: 0,
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
          quantityUsed: 0,
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
          quantityUsed: 0,
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
          quantityUsed: 0,
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
      qrCode: "", // Will be generated dynamically
      name: "Traditional Persian Carpet",
      category: "Handmade",
      color: "Red",
      pattern: "Persian Medallion",
      quantity: 5,
      unit: "pieces",
      status: "in-stock",
      weight: "45kg",
      thickness: "12mm",
      width: "2.44m",
      height: "3.05m",
      materialsUsed: [
        {
          materialId: "MAT001",
          materialName: "Cotton Yarn (Premium)",
          quantity: 0,
          unit: "rolls",
          cost: 450
        },
        {
          materialId: "MAT002",
          materialName: "Red Dye (Industrial)",
          quantity: 0,
          unit: "liters",
          cost: 180
        },
        {
          materialId: "MAT003",
          materialName: "Latex Solution",
          quantity: 0,
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
          qrCode: "", // Will be generated dynamically
          productId: "PROD001",
          materialsUsed: [],
          finalWeight: "400 GSM",
          finalThickness: "12mm",
          finalWidth: "2.49m",
          finalHeight: "3.07m",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Perfect finish, no defects",
          status: "available"
        },
        {
          id: "IND002",
          qrCode: "", // Will be generated dynamically
          productId: "PROD001",
          materialsUsed: [],
          finalWeight: "400 GSM",
          finalThickness: "12.0mm",
          finalWidth: "2.44m",
          finalHeight: "3.05m",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Minor color variation",
          status: "available"
        },
        {
          id: "IND003",
          qrCode: "", // Will be generated dynamically
          productId: "PROD001",
          materialsUsed: [],
          finalWeight: "400 GSM",
          finalThickness: "12mm",
          finalWidth: "2.46m",
          finalHeight: "3.05m",
          qualityGrade: "A+",
          inspector: "Ahmed Khan",
          notes: "Excellent quality, premium finish",
          status: "sold"
        },
        {
          id: "IND004",
          qrCode: "", // Will be generated dynamically
          productId: "PROD001",
          materialsUsed: [],
          finalWeight: "400 GSM",
          finalThickness: "12mm",
          finalWidth: "2.44m",
          finalHeight: "3.07m",
          qualityGrade: "A",
          inspector: "Ahmed Khan",
          notes: "Good quality, minor texture variation",
          status: "available"
        },
        {
          id: "IND005",
          qrCode: "", // Will be generated dynamically
          productId: "PROD001",
          materialsUsed: [],
          finalWeight: "400 GSM",
          finalThickness: "12mm",
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
      qrCode: "", // Will be generated dynamically
      name: "Modern Geometric Carpet",
      category: "Machine Made",
      color: "Blue",
      pattern: "Geometric",
      quantity: 12,
      unit: "pieces",
      status: "in-stock",
      weight: "32kg",
      thickness: "10mm",
      width: "1.83m",
      height: "2.74m",
      materialsUsed: [
        {
          materialId: "MAT004",
          materialName: "Synthetic Yarn",
          quantity: 0,
          unit: "rolls",
          cost: 380
        },
        {
          materialId: "MAT005",
          materialName: "Blue Dye (Industrial)",
          quantity: 0,
          unit: "liters",
          cost: 190
        },
        {
          materialId: "MAT006",
          materialName: "Backing Cloth",
          quantity: 0,
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
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.85m",
          finalHeight: "2.74m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Excellent geometric precision",
          status: "available"
        },
        {
          id: "IND007",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "400 GSM",
          finalThickness: "10mm",
          finalWidth: "1.83m",
          finalHeight: "2.74m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Good quality finish",
          status: "sold"
        },
        {
          id: "IND008",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.85m",
          finalHeight: "2.74m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Excellent precision",
          status: "available"
        },
        {
          id: "IND009",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.83m",
          finalHeight: "2.77m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Standard finish",
          status: "available"
        },
        {
          id: "IND010",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.85m",
          finalHeight: "2.77m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Premium quality",
          status: "sold"
        },
        {
          id: "IND011",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.83m",
          finalHeight: "2.74m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Good geometric pattern",
          status: "available"
        },
        {
          id: "IND012",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.85m",
          finalHeight: "2.74m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Perfect finish",
          status: "available"
        },
        {
          id: "IND013",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.83m",
          finalHeight: "2.77m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Standard quality",
          status: "damaged"
        },
        {
          id: "IND014",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.85m",
          finalHeight: "2.77m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Excellent geometric precision",
          status: "available"
        },
        {
          id: "IND015",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.83m",
          finalHeight: "2.74m",
          qualityGrade: "A",
          inspector: "Priya Sharma",
          notes: "Good quality",
          status: "available"
        },
        {
          id: "IND016",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
          finalWidth: "1.85m",
          finalHeight: "2.74m",
          qualityGrade: "A+",
          inspector: "Priya Sharma",
          notes: "Excellent finish",
          status: "available"
        },
        {
          id: "IND017",
          qrCode: "", // Will be generated dynamically
          productId: "PROD002",
          materialsUsed: [],
          finalWeight: "600 GSM",
          finalThickness: "10mm",
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
      "manufacturingDate": new Date().toISOString().split('T')[0],
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
      "manufacturingDate": new Date().toISOString().split('T')[0],
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
      "manufacturingDate": new Date().toISOString().split('T')[0],
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
      "manufacturingDate": new Date().toISOString().split('T')[0],
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
      "manufacturingDate": new Date().toISOString().split('T')[0],
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
      if (isSupabaseConfigured) {
        setStatus('🔄 Saving to Supabase database...');
        
        // Initialize products in Supabase
        let productsCreated = 0;
        let productsFailed = 0;
        const productIdMapping: { [key: string]: string } = {}; // Map old ID to new UUID
        
        for (const product of completeProductData.products) {
          try {
            // Generate QR code for main product
            const mainProductQRData: MainProductQRData = {
              product_id: product.id,
              product_name: product.name,
              description: product.notes || '',
              category: product.category,
              base_price: 0, // Pricing will be set manually per order
              total_quantity: product.quantity,
              available_quantity: product.quantity,
              recipe: {
                materials: (product.materialsUsed || []).map(m => ({
                  material_id: m.materialId,
                  material_name: m.materialName,
                  quantity: m.quantity,
                  unit: m.unit
                })),
                production_time: 8,
                difficulty_level: 'Medium'
              },
              machines_required: ['Loom', 'Dye Machine'],
              production_steps: ['Material Preparation', 'Weaving', 'Dyeing', 'Quality Check'],
              quality_standards: {
                min_weight: 10,
                max_weight: 50,
                dimensions_tolerance: 0.1,
                quality_criteria: ['A+', 'A']
              },
              created_at: product.createdAt || new Date().toISOString(),
              updated_at: product.updatedAt || new Date().toISOString()
            };
            
            const mainProductQRCode = await QRCodeService.generateMainProductQR(mainProductQRData);
            
            // Calculate specifications from category
            const calculatedSpecs = calculateSpecsFromCategory(product.category);
            
            const { data: createdProduct, error } = await ProductService.createProduct({
              name: product.name,
              category: product.category,
              color: product.color,
              pattern: product.pattern,
              unit: product.unit,
              individual_stock_tracking: product.individualStockTracking,
              base_quantity: product.individualStockTracking ? 0 : product.quantity, // Set base_quantity for bulk products
              min_stock_level: 10,
              max_stock_level: 1000,
              qr_code: mainProductQRCode,
              weight: calculatedSpecs.weight,
              thickness: calculatedSpecs.thickness,
              width: calculatedSpecs.width,
              height: calculatedSpecs.height
            });
            
            if (error) {
              console.warn(`Failed to create product ${product.name}:`, error);
              productsFailed++;
            } else {
              productsCreated++;
              // Store the mapping from old ID to new UUID
              if (createdProduct) {
                productIdMapping[product.id] = createdProduct.id;
                console.log(`🔗 Mapped product ID: ${product.id} -> ${createdProduct.id}`);
              } else {
                console.warn(`⚠️ No createdProduct returned for ${product.name}`);
              }
              console.log(`✅ Created product "${product.name}" with QR code: ${mainProductQRCode}`);
            }
          } catch (err) {
            console.warn(`Error creating product ${product.name}:`, err);
            productsFailed++;
          }
        }
        
        // Initialize raw materials in Supabase
        let materialsCreated = 0;
        let materialsFailed = 0;
        const materialIdMapping: { [key: string]: string } = {}; // Map old material ID to new UUID
        
        for (const material of completeProductData.rawMaterials) {
          try {
            const { data: createdMaterial, error } = await RawMaterialService.createRawMaterial({
              name: material.name,
              brand: material.brand,
              category: material.category,
              current_stock: material.currentStock,
              unit: material.unit,
              min_threshold: material.minThreshold,
              max_capacity: material.maxCapacity,
              reorder_point: material.reorderPoint,
              cost_per_unit: material.costPerUnit,
              supplier_name: material.supplier,
              quality_grade: material.qualityGrade,
              batch_number: material.batchNumber
            });
            
            if (error) {
              console.warn(`Failed to create material ${material.name}:`, error);
              materialsFailed++;
            } else {
              materialsCreated++;
              // Store the mapping from old ID to new UUID
              if (createdMaterial) {
                materialIdMapping[material.id] = createdMaterial.id;
                console.log(`🔗 Mapped material ID: ${material.id} -> ${createdMaterial.id}`);
              }
              console.log(`✅ Created raw material "${material.name}"`);
            }
          } catch (err) {
            console.warn(`Error creating material ${material.name}:`, err);
            materialsFailed++;
          }
        }

        // Debug: Log final materialIdMapping after all materials created
        console.log('🔍 Final Material ID Mapping after material creation:', materialIdMapping);
        
        // Initialize product recipes in Supabase
        setStatus('🔄 Saving product recipes to database...');
        let recipesCreated = 0;
        let recipesFailed = 0;
        
        for (const recipe of completeProductData.productRecipes) {
          try {
            // Get the mapped product ID (UUID) from the productIdMapping
            const mappedProductId = productIdMapping[recipe.productId];
            if (!mappedProductId) {
              console.warn(`No mapped product ID found for ${recipe.productName} (${recipe.productId})`);
              recipesFailed++;
              continue;
            }

            // Map material IDs to their corresponding UUIDs
            const mappedMaterials = recipe.materials.map(m => {
              const mappedMaterialId = materialIdMapping[m.materialId];
              if (!mappedMaterialId) {
                console.warn(`No mapped material ID found for ${m.materialName} (${m.materialId})`);
                return null;
              }
              return {
                material_id: mappedMaterialId, // Use the mapped UUID
                material_name: m.materialName,
                quantity: m.quantity,
                unit: m.unit,
                cost_per_unit: m.costPerUnit
              };
            }).filter(Boolean); // Remove null entries

            if (mappedMaterials.length === 0) {
              console.warn(`No valid materials found for recipe ${recipe.productName}, skipping recipe creation`);
              recipesFailed++;
              continue;
            }

            const { error } = await ProductRecipeService.createRecipe({
              product_id: mappedProductId, // Use the mapped UUID instead of the old ID
              product_name: recipe.productName,
              materials: mappedMaterials,
              created_by: recipe.createdBy || 'admin'
            });
            
            if (error) {
              console.warn(`Failed to create recipe for ${recipe.productName}:`, error);
              recipesFailed++;
            } else {
              recipesCreated++;
              console.log(`✅ Created recipe for "${recipe.productName}" with product ID: ${mappedProductId} and ${mappedMaterials.length} materials`);
            }
          } catch (err) {
            console.warn(`Error creating recipe for ${recipe.productName}:`, err);
            recipesFailed++;
          }
        }
        
        // Initialize individual products in Supabase
        let individualProductsCreated = 0;
        let individualProductsFailed = 0;
        
        for (let index = 0; index < completeProductData.individualProducts.length; index++) {
          const individualProduct = completeProductData.individualProducts[index];
          try {
            // Find the parent product to get color and pattern
            const parentProduct = completeProductData.products.find(p => p.id === individualProduct.productId);
            
            // Generate QR code for individual product
            const individualProductQRData: IndividualProductQRData = {
              id: individualProduct.id,
              product_id: individualProduct.productId,
              product_name: parentProduct?.name || individualProduct.productId,
              batch_id: individualProduct.customId || individualProduct.id,
              serial_number: individualProduct.qrCode,
              production_date: individualProduct.manufacturingDate || new Date().toISOString().split('T')[0],
              quality_grade: individualProduct.qualityGrade || 'A',
              dimensions: {
                length: parseFloat(individualProduct.finalWidth?.replace(/[^\d.]/g, '') || '0'),
                width: parseFloat(individualProduct.finalHeight?.replace(/[^\d.]/g, '') || '0'),
                thickness: parseFloat(individualProduct.finalThickness?.replace(/[^\d.]/g, '') || '0')
              },
              weight: parseFloat(individualProduct.finalWeight?.replace(/[^\d.]/g, '') || '0'),
              color: parentProduct?.color || 'N/A',
              pattern: parentProduct?.pattern || 'N/A',
              material_composition: (individualProduct.materialsUsed || []).map(m => m.materialName),
              production_steps: (individualProduct.productionSteps || []).map(step => ({
                step_name: step.stepName,
                completed_at: step.completedAt,
                operator: step.inspector,
                quality_check: true
              })),
              machine_used: (individualProduct.productionSteps || []).map(step => step.machineUsed),
              inspector: individualProduct.inspector || 'System',
              status: individualProduct.status as 'active' | 'sold' | 'damaged' | 'returned',
              created_at: individualProduct.manufacturingDate
            };
            
            // QR code will be generated dynamically by the system
            
            const { error } = await individualProductService.createIndividualProduct({
              // qr_code will be generated automatically
              product_id: productIdMapping[individualProduct.productId] || individualProduct.productId,
              product_name: parentProduct?.name || individualProduct.productId,
              color: parentProduct?.color,
              pattern: parentProduct?.pattern,
              weight: parentProduct?.weight,
              thickness: parentProduct?.thickness,
              width: parentProduct?.width,
              height: parentProduct?.height,
              final_weight: individualProduct.finalWeight,
              final_thickness: individualProduct.finalThickness,
              final_width: individualProduct.finalWidth,
              final_height: individualProduct.finalHeight,
              quality_grade: individualProduct.qualityGrade,
              status: individualProduct.status as 'available' | 'sold' | 'damaged' | 'in-production' | 'completed',
              location: 'Warehouse A - Section 1', // Default location for Traditional Persian Carpet
              notes: individualProduct.notes,
              added_date: individualProduct.manufacturingDate,
              production_date: individualProduct.manufacturingDate || new Date().toISOString().split('T')[0],
              completion_date: individualProduct.manufacturingDate,
              inspector: individualProduct.inspector
            });
            
            if (error) {
              console.warn(`Failed to create individual product ${individualProduct.qrCode}:`, error);
              individualProductsFailed++;
            } else {
              individualProductsCreated++;
              console.log(`✅ Created individual product "${parentProduct?.name || individualProduct.productId}" (QR code will be generated dynamically)`);
            }
          } catch (err) {
            console.warn(`Error creating individual product ${individualProduct.qrCode}:`, err);
            individualProductsFailed++;
          }
        }
        
        setStatus(`✅ Sample data initialized successfully!\n\n📊 Database Summary:\n- Products: ${productsCreated} created, ${productsFailed} failed\n- Raw Materials: ${materialsCreated} created, ${materialsFailed} failed\n- Product Recipes: ${recipesCreated} created, ${recipesFailed} failed\n- Individual Products: ${individualProductsCreated} created, ${individualProductsFailed} failed\n- Production Batches: ${completeProductData.productionBatches.length}\n\n🎯 Production Workflow Features:\n- Unique production batch IDs (PROD_BATCH_001, PROD_BATCH_002)\n- Complete step tracking (material prep, dyeing, weaving, backing, QC)\n- Material consumption tracking with batch numbers\n- Waste generation tracking\n- Inspector and operator details for each step\n- Product recipes with material requirements (quantities set to 0 for user input)\n\n📱 QR Code Features:\n- QR codes generated for ALL main products (scan to see product details)\n- QR codes generated for ALL individual products (scan to see individual item details)\n- Each QR code contains complete product information\n- Ready for scanning with QR scanner app!`);
        
      } else {
        setStatus('⚠️ Supabase not configured. Please configure Supabase to initialize data.');
      }
      
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
        if (isSupabaseConfigured) {
          setStatus('🔄 Clearing data from Supabase database...');
          
          setStatus('⚠️ Database clearing not implemented yet. To clear database data, please use the Supabase dashboard.');
        } else {
          setStatus('⚠️ Supabase not configured. Cannot clear database data.');
        }
      } catch (error) {
        setStatus(`❌ Error: ${error}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const showStatus = async () => {
    if (!isSupabaseConfigured) {
      setStatus('⚠️ Supabase not configured. Please configure Supabase to check data status.');
      return;
    }

    try {
      const [products, individualProducts, recipes, productionData, productionBatches] = await Promise.all([
        ProductService.getProducts(),
        ProductService.getIndividualProducts(),
        ProductRecipeService.getAllRecipes(), // Get recipes from database
        [], // productionData - need to implement service method
        [] // productionBatches - need to implement service method
      ]);

      const storageType = 'Supabase Database';

      setStatus(`📊 Current Data Status (${storageType}):\n- Products: ${products?.data?.length || 0}\n- Individual Products: ${individualProducts?.data?.length || 0}\n- Recipes: ${recipes?.data?.length || 0}\n- Production Data: ${productionData.length}\n- Production Batches: ${productionBatches.length}\n\n${(products?.data?.length || 0) > 0 ? `Product Names: ${products.data.map((p: any) => p.name).join(', ')}` : 'No products found - Ready to initialize sample data!'}\n\n${(recipes?.data?.length || 0) > 0 ? `Recipe Names: ${recipes.data.map((r: any) => r.product_name).join(', ')}` : 'No recipes found - Ready to initialize sample data!'}\n\n${productionBatches.length > 0 ? `Production Batches: ${productionBatches.map((b: any) => b.batchNumber).join(', ')}` : ''}\n\n✅ Supabase configured - data is stored in database`);
    } catch (error) {
      setStatus(`❌ Error checking data status: ${error}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏭 Sample Data Initializer
          <Badge variant={isSupabaseConfigured ? "default" : "secondary"} className="ml-2">
            {isSupabaseConfigured ? "Database Ready" : "Not Configured"}
          </Badge>
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