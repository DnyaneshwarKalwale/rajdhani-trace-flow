import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Play, Pause, CheckCircle, Cog, AlertTriangle, Eye, 
  Package, Clock, Users, TrendingUp, Factory, ArrowRight,
  Edit, Trash2, Save, X, AlertCircle, FileText, Hash, Calendar,
  MapPin, Ruler, Scale, Star
} from "lucide-react";

interface ProductionMaterial {
  materialId: string;
  materialName: string;
  requiredQuantity: number;
  usedQuantity: number;
  unit: string;
  cost: number;
  supplier?: string;
}

interface ProductionStep {
  id: number;
  name: string;
  description: string;
  status: "pending" | "active" | "completed" | "issue";
  progress: number;
  materials: ProductionMaterial[];
  expectedOutput: number;
  actualOutput?: number;
  waste?: number;
  defective?: number;
  startDate?: string;
  completionDate?: string;
  notes: string;
  inspector?: string;
  inspectionDate?: string;
  inspectionNotes?: string;
}

interface ProductionProduct {
  id: string;
  batchNumber: string;
  productName: string;
  productId?: string; // For existing products
  isNewProduct: boolean;
  category: string;
  color: string;
  size: string;
  pattern: string;
  quantity: number;
  unit: string;
  status: "planning" | "active" | "paused" | "completed" | "issue";
  currentStep: number;
  totalSteps: number;
  progress: number;
  startDate: string;
  expectedCompletion: string;
  actualCompletion?: string;
  steps: ProductionStep[];
  location: string;
  notes: string;
  totalCost: number;
  sellingPrice: number;
  imageUrl?: string;
  priority: "normal" | "high" | "urgent";
  // For new products
  dimensions?: string;
  weight?: string;
  thickness?: string;
  pileHeight?: string;
  materialComposition?: string;
  // For completed products
  individualProducts?: IndividualProduct[];
}

interface IndividualProduct {
  id: string;
  qrCode: string;
  productId: string;
  manufacturingDate: string;
  materialsUsed: ProductionMaterial[];
  finalDimensions: string;
  finalWeight: string;
  finalThickness: string;
  finalPileHeight: string;
  qualityGrade: string;
  inspector: string;
  notes: string;
  status: "available" | "sold" | "damaged";
}

interface RawMaterial {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  cost: number;
  supplier: string;
  location: string;
}

// Sample raw materials for production
const rawMaterials: RawMaterial[] = [
  {
    id: "RM001",
    name: "Cotton Yarn (Premium)",
    category: "Yarn",
    currentStock: 150,
    unit: "rolls",
    cost: 450,
    supplier: "Premium Textiles Ltd",
    location: "Warehouse A - Section 1"
  },
  {
    id: "RM002",
    name: "Synthetic Yarn",
    category: "Yarn",
    currentStock: 200,
    unit: "rolls",
    cost: 380,
    supplier: "Synthetic Solutions",
    location: "Warehouse A - Section 2"
  },
  {
    id: "RM003",
    name: "Red Dye (Industrial)",
    category: "Dye",
    currentStock: 85,
    unit: "liters",
    cost: 180,
    supplier: "ColorChem Industries",
    location: "Warehouse B - Section 1"
  },
  {
    id: "RM004",
    name: "Blue Dye (Industrial)",
    category: "Dye",
    currentStock: 92,
    unit: "liters",
    cost: 190,
    supplier: "ColorChem Industries",
    location: "Warehouse B - Section 1"
  },
  {
    id: "RM005",
    name: "Latex Solution",
    category: "Chemical",
    currentStock: 120,
    unit: "liters",
    cost: 320,
    supplier: "ChemCorp Ltd",
    location: "Warehouse B - Section 2"
  },
  {
    id: "RM006",
    name: "Backing Cloth",
    category: "Fabric",
    currentStock: 300,
    unit: "sqm",
    cost: 25,
    supplier: "FabricWorld",
    location: "Warehouse C - Section 1"
  }
];

// Default production steps
const defaultProductionSteps = [
  {
    id: 1,
    name: "Material Preparation",
    description: "Prepare and organize raw materials for production",
    status: "pending" as const,
    progress: 0,
    materials: [],
    expectedOutput: 0,
    notes: ""
  },
  {
    id: 2,
    name: "Punching/Weaving",
    description: "Create the base carpet structure through punching or weaving",
    status: "pending" as const,
    progress: 0,
    materials: [],
    expectedOutput: 0,
    notes: ""
  },
  {
    id: 3,
    name: "Dyeing Process",
    description: "Apply color and dye treatments to the carpet",
    status: "pending" as const,
    progress: 0,
    materials: [],
    expectedOutput: 0,
    notes: ""
  },
  {
    id: 4,
    name: "Cutting & Finishing",
    description: "Cut to size and apply final finishing touches",
    status: "pending" as const,
    progress: 0,
    materials: [],
    expectedOutput: 0,
    notes: ""
  },
  {
    id: 5,
    name: "Quality Inspection",
    description: "Final quality check and inspection before completion",
    status: "pending" as const,
    progress: 0,
    materials: [],
    expectedOutput: 0,
    notes: ""
  }
];

// Sample production products
const productionProducts: ProductionProduct[] = [
  {
    id: "PROD001",
    batchNumber: "BATCH-2024-001",
    productName: "Wool Blend Carpet",
    productId: "PROD003", // Existing product ID
    isNewProduct: false,
    category: "Handmade",
    color: "Green & Brown",
    size: "10x12 feet",
    pattern: "Tribal",
    quantity: 3,
    unit: "pieces",
    status: "active",
    currentStep: 3,
    totalSteps: 5,
    progress: 60,
    startDate: "2024-01-15",
    expectedCompletion: "2024-01-25",
    location: "Factory Floor 1",
    notes: "Premium wool blend production for luxury market",
    totalCost: 17130,
    sellingPrice: 35000,
    priority: "high",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    steps: [
      {
        id: 1,
        name: "Material Preparation",
        description: "Prepare and organize raw materials for production",
        status: "completed",
        progress: 100,
        materials: [
          { materialId: "RM001", materialName: "Cotton Yarn (Premium)", requiredQuantity: 25, usedQuantity: 25, unit: "rolls", cost: 11250, supplier: "Premium Textiles Ltd" },
          { materialId: "RM003", materialName: "Red Dye (Industrial)", requiredQuantity: 6, usedQuantity: 6, unit: "liters", cost: 1080, supplier: "ColorChem Industries" }
        ],
        expectedOutput: 3,
        actualOutput: 3,
        waste: 0,
        defective: 0,
        startDate: "2024-01-15",
        completionDate: "2024-01-16",
        notes: "All materials prepared successfully",
        inspector: "Ahmed Khan",
        inspectionDate: "2024-01-16",
        inspectionNotes: "Materials meet quality standards"
      },
      {
        id: 2,
        name: "Punching/Weaving",
        description: "Create the base carpet structure through punching or weaving",
        status: "completed",
        progress: 100,
        materials: [
          { materialId: "RM001", materialName: "Cotton Yarn (Premium)", requiredQuantity: 25, usedQuantity: 24, unit: "rolls", cost: 10800, supplier: "Premium Textiles Ltd" }
        ],
        expectedOutput: 3,
        actualOutput: 3,
        waste: 1,
        defective: 0,
        startDate: "2024-01-17",
        completionDate: "2024-01-19",
        notes: "Weaving completed with minimal waste",
        inspector: "Priya Sharma",
        inspectionDate: "2024-01-19",
        inspectionNotes: "Weaving quality excellent, no defects found"
      },
      {
        id: 3,
        name: "Dyeing Process",
        description: "Apply color and dye treatments to the carpet",
        status: "active",
        progress: 75,
        materials: [
          { materialId: "RM003", materialName: "Red Dye (Industrial)", requiredQuantity: 6, usedQuantity: 4.5, unit: "liters", cost: 810, supplier: "ColorChem Industries" },
          { materialId: "RM005", materialName: "Latex Solution", requiredQuantity: 15, usedQuantity: 12, unit: "liters", cost: 3840, supplier: "ChemCorp Ltd" }
        ],
        expectedOutput: 3,
        actualOutput: 2,
        waste: 0.5,
        defective: 1,
        startDate: "2024-01-20",
        notes: "Dyeing in progress, one piece found defective",
        inspector: "Ahmed Khan",
        inspectionDate: "2024-01-21",
        inspectionNotes: "One piece has color variation, needs rework"
      },
      {
        id: 4,
        name: "Cutting & Finishing",
        description: "Cut to size and apply final finishing touches",
        status: "pending",
        progress: 0,
        materials: [],
        expectedOutput: 2,
        notes: ""
      },
      {
        id: 5,
        name: "Quality Inspection",
        description: "Final quality check and inspection before completion",
        status: "pending",
        progress: 0,
        materials: [],
        expectedOutput: 2,
        notes: ""
      }
    ]
  },
  {
    id: "PROD002",
    batchNumber: "BATCH-2024-002",
    productName: "Kids Room Carpet",
    productId: "PROD004", // Existing product ID
    isNewProduct: false,
    category: "Machine Made",
    color: "Rainbow",
    size: "5x7 feet",
    pattern: "Cartoon Characters",
    quantity: 5,
    unit: "pieces",
    status: "active",
    currentStep: 2,
    totalSteps: 5,
    progress: 40,
    startDate: "2024-01-18",
    expectedCompletion: "2024-01-28",
    location: "Factory Floor 2",
    notes: "Child-safe materials, vibrant colors for kids rooms",
    totalCost: 6040,
    sellingPrice: 12000,
    priority: "normal",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    steps: [
      {
        id: 1,
        name: "Material Preparation",
        description: "Prepare and organize raw materials for production",
        status: "completed",
        progress: 100,
        materials: [
          { materialId: "RM002", materialName: "Synthetic Yarn", requiredQuantity: 12, usedQuantity: 12, unit: "rolls", cost: 4560, supplier: "Synthetic Solutions" },
          { materialId: "RM003", materialName: "Red Dye (Industrial)", requiredQuantity: 4, usedQuantity: 4, unit: "liters", cost: 720, supplier: "ColorChem Industries" },
          { materialId: "RM004", materialName: "Blue Dye (Industrial)", requiredQuantity: 4, usedQuantity: 4, unit: "liters", cost: 760, supplier: "ColorChem Industries" }
        ],
        expectedOutput: 5,
        actualOutput: 5,
        waste: 0,
        defective: 0,
        startDate: "2024-01-18",
        completionDate: "2024-01-19",
        notes: "All materials prepared successfully",
        inspector: "Priya Sharma",
        inspectionDate: "2024-01-19",
        inspectionNotes: "Materials meet child safety standards"
      },
      {
        id: 2,
        name: "Punching/Weaving",
        description: "Create the base carpet structure through punching or weaving",
        status: "active",
        progress: 60,
        materials: [
          { materialId: "RM002", materialName: "Synthetic Yarn", requiredQuantity: 12, usedQuantity: 8, unit: "rolls", cost: 3040, supplier: "Synthetic Solutions" }
        ],
        expectedOutput: 5,
        actualOutput: 3,
        waste: 0,
        defective: 0,
        startDate: "2024-01-20",
        notes: "Weaving in progress, 3 pieces completed",
        inspector: "Ahmed Khan",
        inspectionDate: "2024-01-21",
        inspectionNotes: "Completed pieces meet quality standards"
      },
      {
        id: 3,
        name: "Dyeing Process",
        description: "Apply color and dye treatments to the carpet",
        status: "pending",
        progress: 0,
        materials: [],
        expectedOutput: 5,
        notes: ""
      },
      {
        id: 4,
        name: "Cutting & Finishing",
        description: "Cut to size and apply final finishing touches",
        status: "pending",
        progress: 0,
        materials: [],
        expectedOutput: 5,
        notes: ""
      },
      {
        id: 5,
        name: "Quality Inspection",
        description: "Final quality check and inspection before completion",
        status: "pending",
        progress: 0,
        materials: [],
        expectedOutput: 5,
        notes: ""
      }
    ]
  },
  {
    id: "PROD003",
    batchNumber: "BATCH-2024-003",
    productName: "Custom Persian Carpet",
    isNewProduct: true,
    category: "Handmade",
    color: "Burgundy & Gold",
    size: "9x12 feet",
    pattern: "Persian Medallion",
    quantity: 2,
    unit: "pieces",
    status: "planning",
    currentStep: 1,
    totalSteps: 5,
    progress: 0,
    startDate: "2024-01-22",
    expectedCompletion: "2024-02-05",
    location: "Factory Floor 1",
    notes: "Custom order for luxury client, premium materials required",
    totalCost: 0,
    sellingPrice: 45000,
    priority: "urgent",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    dimensions: "9' x 12' (2.74m x 3.66m)",
    weight: "75 kg",
    thickness: "18 mm",
    pileHeight: "15 mm",
    materialComposition: "70% Wool, 30% Silk",
    steps: defaultProductionSteps.map(step => ({ ...step }))
  },
  {
    id: "PROD004",
    batchNumber: "BATCH-2024-004",
    productName: "Traditional Persian Carpet",
    productId: "PROD001",
    isNewProduct: false,
    category: "Handmade",
    color: "Red & Gold",
    size: "8x10 feet",
    pattern: "Persian Medallion",
    quantity: 4,
    unit: "pieces",
    status: "completed",
    currentStep: 5,
    totalSteps: 5,
    progress: 100,
    startDate: "2024-01-10",
    expectedCompletion: "2024-01-20",
    actualCompletion: "2024-01-18",
    location: "Factory Floor 1",
    notes: "Successfully completed traditional Persian carpet production",
    totalCost: 12030,
    sellingPrice: 25000,
    priority: "normal",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    individualProducts: [
      {
        id: "IND001",
        qrCode: "QR-CARPET-001-001",
        productId: "PROD001",
        manufacturingDate: "2024-01-18",
        materialsUsed: [
          { materialId: "RM001", materialName: "Cotton Yarn (Premium)", requiredQuantity: 3, usedQuantity: 3, unit: "rolls", cost: 1350, supplier: "Premium Textiles Ltd" },
          { materialId: "RM003", materialName: "Red Dye (Industrial)", requiredQuantity: 1.6, usedQuantity: 1.6, unit: "liters", cost: 288, supplier: "ColorChem Industries" }
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
        manufacturingDate: "2024-01-18",
        materialsUsed: [
          { materialId: "RM001", materialName: "Cotton Yarn (Premium)", requiredQuantity: 3, usedQuantity: 3, unit: "rolls", cost: 1350, supplier: "Premium Textiles Ltd" },
          { materialId: "RM003", materialName: "Red Dye (Industrial)", requiredQuantity: 1.6, usedQuantity: 1.6, unit: "liters", cost: 288, supplier: "ColorChem Industries" }
        ],
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
        manufacturingDate: "2024-01-18",
        materialsUsed: [
          { materialId: "RM001", materialName: "Cotton Yarn (Premium)", requiredQuantity: 3, usedQuantity: 3, unit: "rolls", cost: 1350, supplier: "Premium Textiles Ltd" },
          { materialId: "RM003", materialName: "Red Dye (Industrial)", requiredQuantity: 1.6, usedQuantity: 1.6, unit: "liters", cost: 288, supplier: "ColorChem Industries" }
        ],
        finalDimensions: "8'1\" x 10'0\" (2.46m x 3.05m)",
        finalWeight: "45.5 kg",
        finalThickness: "12.2 mm",
        finalPileHeight: "8.1 mm",
        qualityGrade: "A+",
        inspector: "Ahmed Khan",
        notes: "Excellent quality, premium finish",
        status: "available"
      },
      {
        id: "IND004",
        qrCode: "QR-CARPET-001-004",
        productId: "PROD001",
        manufacturingDate: "2024-01-18",
        materialsUsed: [
          { materialId: "RM001", materialName: "Cotton Yarn (Premium)", requiredQuantity: 3, usedQuantity: 3, unit: "rolls", cost: 1350, supplier: "Premium Textiles Ltd" },
          { materialId: "RM003", materialName: "Red Dye (Industrial)", requiredQuantity: 1.6, usedQuantity: 1.6, unit: "liters", cost: 288, supplier: "ColorChem Industries" }
        ],
        finalDimensions: "8'0\" x 10'1\" (2.44m x 3.07m)",
        finalWeight: "45.8 kg",
        finalThickness: "12.3 mm",
        finalPileHeight: "8.0 mm",
        qualityGrade: "A",
        inspector: "Ahmed Khan",
        notes: "Standard quality, good finish",
        status: "available"
      }
    ],
    steps: [
      {
        id: 1,
        name: "Material Preparation",
        description: "Prepare and organize raw materials for production",
        status: "completed",
        progress: 100,
        materials: [
          { materialId: "RM001", materialName: "Cotton Yarn (Premium)", requiredQuantity: 12, usedQuantity: 12, unit: "rolls", cost: 5400, supplier: "Premium Textiles Ltd" },
          { materialId: "RM003", materialName: "Red Dye (Industrial)", requiredQuantity: 6.4, usedQuantity: 6.4, unit: "liters", cost: 1152, supplier: "ColorChem Industries" }
        ],
        expectedOutput: 4,
        actualOutput: 4,
        waste: 0,
        defective: 0,
        startDate: "2024-01-10",
        completionDate: "2024-01-11",
        notes: "All materials prepared successfully",
        inspector: "Ahmed Khan",
        inspectionDate: "2024-01-11",
        inspectionNotes: "Materials meet quality standards"
      },
      {
        id: 2,
        name: "Punching/Weaving",
        description: "Create the base carpet structure through punching or weaving",
        status: "completed",
        progress: 100,
        materials: [
          { materialId: "RM001", materialName: "Cotton Yarn (Premium)", requiredQuantity: 12, usedQuantity: 12, unit: "rolls", cost: 5400, supplier: "Premium Textiles Ltd" }
        ],
        expectedOutput: 4,
        actualOutput: 4,
        waste: 0,
        defective: 0,
        startDate: "2024-01-12",
        completionDate: "2024-01-14",
        notes: "Weaving completed successfully",
        inspector: "Priya Sharma",
        inspectionDate: "2024-01-14",
        inspectionNotes: "Weaving quality excellent"
      },
      {
        id: 3,
        name: "Dyeing Process",
        description: "Apply color and dye treatments to the carpet",
        status: "completed",
        progress: 100,
        materials: [
          { materialId: "RM003", materialName: "Red Dye (Industrial)", requiredQuantity: 6.4, usedQuantity: 6.4, unit: "liters", cost: 1152, supplier: "ColorChem Industries" },
          { materialId: "RM005", materialName: "Latex Solution", requiredQuantity: 12, usedQuantity: 12, unit: "liters", cost: 3840, supplier: "ChemCorp Ltd" }
        ],
        expectedOutput: 4,
        actualOutput: 4,
        waste: 0,
        defective: 0,
        startDate: "2024-01-15",
        completionDate: "2024-01-16",
        notes: "Dyeing completed successfully",
        inspector: "Ahmed Khan",
        inspectionDate: "2024-01-16",
        inspectionNotes: "Color consistency excellent"
      },
      {
        id: 4,
        name: "Cutting & Finishing",
        description: "Cut to size and apply final finishing touches",
        status: "completed",
        progress: 100,
        materials: [
          { materialId: "RM006", materialName: "Backing Cloth", requiredQuantity: 32, usedQuantity: 32, unit: "sqm", cost: 800, supplier: "FabricWorld" }
        ],
        expectedOutput: 4,
        actualOutput: 4,
        waste: 0,
        defective: 0,
        startDate: "2024-01-17",
        completionDate: "2024-01-17",
        notes: "Cutting and finishing completed",
        inspector: "Priya Sharma",
        inspectionDate: "2024-01-17",
        inspectionNotes: "Dimensions and finish perfect"
      },
      {
        id: 5,
        name: "Quality Inspection",
        description: "Final quality check and inspection before completion",
        status: "completed",
        progress: 100,
        materials: [],
        expectedOutput: 4,
        actualOutput: 4,
        waste: 0,
        defective: 0,
        startDate: "2024-01-18",
        completionDate: "2024-01-18",
        notes: "Final inspection completed, all pieces approved",
        inspector: "Ahmed Khan",
        inspectionDate: "2024-01-18",
        inspectionNotes: "All pieces meet quality standards, ready for inventory"
      }
    ]
  }
];

const statusStyles = {
  "planning": "bg-muted text-muted-foreground",
  "active": "bg-blue-500 text-white",
  "paused": "bg-yellow-500 text-white",
  "completed": "bg-green-500 text-white",
  "issue": "bg-red-500 text-white"
};

const priorityStyles = {
  "normal": "bg-gray-100 text-gray-800",
  "high": "bg-orange-100 text-orange-800",
  "urgent": "bg-red-100 text-red-800"
};

export default function Production() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<ProductionProduct[]>(productionProducts);

  // Handle incoming products from Products page
  useEffect(() => {
    if (location.state?.addToProduction) {
      const { product, quantity, priority, isNewProduct } = location.state.addToProduction;
      
      // Load custom steps if this product has been produced before
      let customSteps: ProductionStep[] = [];
      if (!isNewProduct && product.id) {
        const savedSteps = localStorage.getItem(`productSteps_${product.id}`);
        if (savedSteps) {
          customSteps = JSON.parse(savedSteps);
        }
      }
      
      // Combine default steps with custom steps
      const allSteps = [
        ...defaultProductionSteps.map(step => ({ ...step })),
        ...customSteps.map(step => ({ 
          ...step, 
          status: "pending" as const,
          progress: 0,
          materials: [],
          expectedOutput: 0,
          notes: ""
        }))
      ];
      
      // Create new production batch
      const newBatch: ProductionProduct = {
        id: `PROD${Date.now()}`,
        batchNumber: `BATCH-2024-${String(products.length + 1).padStart(3, '0')}`,
        productName: product.name,
        productId: isNewProduct ? undefined : product.id,
        isNewProduct,
        category: product.category,
        color: product.color,
        size: product.size,
        pattern: product.pattern,
        quantity: quantity,
        unit: product.unit,
        status: "planning",
        currentStep: 1,
        totalSteps: allSteps.length,
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        expectedCompletion: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
        location: "Factory Floor 1",
        notes: `Production batch for ${product.name}. Priority: ${priority}`,
        totalCost: 0,
        sellingPrice: product.sellingPrice,
        priority,
        imageUrl: product.imageUrl,
        steps: allSteps
      };
      
      setProducts(prev => [newBatch, ...prev]);
      
      // Clear the state to prevent re-adding on refresh
      navigate('/production', { replace: true });
    }
  }, [location.state, navigate]);

  // Calculate statistics for each category
  const planningProducts = products.filter(p => p.status === "planning");
  const activeProducts = products.filter(p => p.status === "active");
  const completedProducts = products.filter(p => p.status === "completed");

  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);

  // Handle product detail navigation
  const handleProductDetail = (product: ProductionProduct) => {
    navigate(`/production-detail/${product.id}`, { state: { product } });
  };

  // Production Product Card Component
  const ProductionCard = ({ product }: { product: ProductionProduct }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProductDetail(product)}>
      <div className="relative">
        <div className="w-full h-48 overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Package className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Priority Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={priorityStyles[product.priority]}>
            {product.priority}
          </Badge>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={statusStyles[product.status]}>
            {product.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        {product.status === "active" && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Progress</span>
              <span>{product.progress}%</span>
            </div>
            <Progress value={product.progress} className="h-1" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{product.productName}</h3>
            <p className="text-sm text-muted-foreground">{product.batchNumber}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{product.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Quantity: </span>
              <span className="font-medium">{product.quantity} {product.unit}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">₹</span>
              <span className="font-medium">{product.sellingPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Started: {product.startDate}</span>
          </div>

          {product.status === "active" && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Cog className="w-4 h-4" />
              <span>Step {product.currentStep} of {product.totalSteps}</span>
            </div>
          )}

          {product.status === "completed" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Completed: {product.actualCompletion}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ruler className="w-4 h-4" />
            <span>{product.size}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Scale className="w-4 h-4" />
            <span>{product.category}</span>
          </div>

          <Button className="w-full" variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Production Management" 
        subtitle="Track production batches, manage workflow steps, and monitor material usage"
      />

      {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
              Production batches
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Process</CardTitle>
            <Factory className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold text-blue-500">{activeProducts.length}</div>
                <p className="text-xs text-muted-foreground">
              Currently running
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold text-success">{completedProducts.length}</div>
                <p className="text-xs text-muted-foreground">
              Finished batches
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
              Production value
                </p>
              </CardContent>
            </Card>
          </div>

      {/* Production Categories */}
      <Tabs defaultValue="planning" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Come for Production ({planningProducts.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Factory className="w-4 h-4" />
            In Process ({activeProducts.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planning" className="space-y-6">
                  <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Come for Production</h2>
            <p className="text-muted-foreground">Products waiting to start production</p>
                  </div>

          {planningProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Products in Planning</h3>
              <p className="text-muted-foreground">Add products from the Products page to start production</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {planningProducts.map((product) => (
                <ProductionCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
                        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">In Process</h2>
            <p className="text-muted-foreground">Products currently in production</p>
                        </div>

          {activeProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <Factory className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Production</h3>
              <p className="text-muted-foreground">Start production from the planning stage</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeProducts.map((product) => (
                <ProductionCard key={product.id} product={product} />
                          ))}
                        </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Completed</h2>
            <p className="text-muted-foreground">Successfully completed production batches</p>
                          </div>
          
          {completedProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Completed Production</h3>
              <p className="text-muted-foreground">Completed batches will appear here</p>
              </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {completedProducts.map((product) => (
                <ProductionCard key={product.id} product={product} />
            ))}
          </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}