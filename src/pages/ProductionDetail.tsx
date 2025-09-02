import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, Play, Pause, CheckCircle, Cog, AlertTriangle, Eye, 
  Package, Clock, Users, TrendingUp, Factory, ArrowRight,
  Edit, Trash2, Save, X, AlertCircle, FileText, Hash, Calendar,
  MapPin, Ruler, Scale, Star, Plus, Minus, Package2, ShoppingCart,
  Search, Filter, Info, ChevronRight, ChevronLeft, MoreHorizontal,
  Download, Upload, Settings, Bell, Target, BarChart3, Thermometer,
  Gauge, Timer, Zap, RefreshCw, Copy, QrCode, CheckSquare, Square
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
  status: "pending" | "active" | "paused" | "completed" | "issue";
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
  isCustomStep?: boolean;
  stepOrder?: number;
}

interface ProductionProduct {
  id: string;
  batchNumber: string;
  productName: string;
  productId?: string;
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
  dimensions?: string;
  weight?: string;
  thickness?: string;
  pileHeight?: string;
  materialComposition?: string;
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
  brand?: string;
  description?: string;
  minStockLevel: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

// Complete raw materials inventory
const rawMaterials: RawMaterial[] = [
  {
    id: "RM001",
    name: "Cotton Yarn (Premium)",
    category: "Yarn",
    currentStock: 150,
    unit: "rolls",
    cost: 450,
    supplier: "Premium Textiles Ltd",
    location: "Warehouse A - Section 1",
    brand: "Premium Cotton",
    description: "High-quality cotton yarn for premium carpets",
    minStockLevel: 50,
    status: "in-stock"
  },
  {
    id: "RM002",
    name: "Cotton Yarn (Standard)",
    category: "Yarn",
    currentStock: 200,
    unit: "rolls",
    cost: 380,
    supplier: "Standard Textiles",
    location: "Warehouse A - Section 1",
    brand: "Standard Cotton",
    description: "Standard quality cotton yarn",
    minStockLevel: 50,
    status: "in-stock"
  },
  {
    id: "RM003",
    name: "Synthetic Yarn",
    category: "Yarn",
    currentStock: 200,
    unit: "rolls",
    cost: 380,
    supplier: "Synthetic Solutions",
    location: "Warehouse A - Section 2",
    brand: "SynthPro",
    description: "Durable synthetic yarn",
    minStockLevel: 50,
    status: "in-stock"
  },
  {
    id: "RM004",
    name: "Wool Yarn (Premium)",
    category: "Yarn",
    currentStock: 80,
    unit: "rolls",
    cost: 650,
    supplier: "Wool Masters",
    location: "Warehouse A - Section 3",
    brand: "Premium Wool",
    description: "Premium wool yarn for luxury carpets",
    minStockLevel: 30,
    status: "in-stock"
  },
  {
    id: "RM005",
    name: "Red Dye (Industrial)",
    category: "Dye",
    currentStock: 85,
    unit: "liters",
    cost: 180,
    supplier: "ColorChem Industries",
    location: "Warehouse B - Section 1",
    brand: "ColorChem Red",
    description: "Industrial grade red dye",
    minStockLevel: 20,
    status: "in-stock"
  },
  {
    id: "RM006",
    name: "Red Dye (Premium)",
    category: "Dye",
    currentStock: 45,
    unit: "liters",
    cost: 220,
    supplier: "Premium Dyes",
    location: "Warehouse B - Section 1",
    brand: "Premium Red",
    description: "Premium quality red dye",
    minStockLevel: 15,
    status: "in-stock"
  },
  {
    id: "RM007",
    name: "Blue Dye (Industrial)",
    category: "Dye",
    currentStock: 92,
    unit: "liters",
    cost: 190,
    supplier: "ColorChem Industries",
    location: "Warehouse B - Section 1",
    brand: "ColorChem Blue",
    description: "Industrial grade blue dye",
    minStockLevel: 20,
    status: "in-stock"
  },
  {
    id: "RM008",
    name: "Green Dye (Industrial)",
    category: "Dye",
    currentStock: 0,
    unit: "liters",
    cost: 200,
    supplier: "ColorChem Industries",
    location: "Warehouse B - Section 1",
    brand: "ColorChem Green",
    description: "Industrial grade green dye",
    minStockLevel: 20,
    status: "out-of-stock"
  },
  {
    id: "RM009",
    name: "Latex Solution",
    category: "Chemical",
    currentStock: 120,
    unit: "liters",
    cost: 320,
    supplier: "ChemCorp Ltd",
    location: "Warehouse B - Section 2",
    brand: "ChemCorp Latex",
    description: "High-quality latex solution",
    minStockLevel: 30,
    status: "in-stock"
  },
  {
    id: "RM010",
    name: "Backing Cloth",
    category: "Fabric",
    currentStock: 300,
    unit: "sqm",
    cost: 25,
    supplier: "FabricWorld",
    location: "Warehouse C - Section 1",
    brand: "FabricWorld Backing",
    description: "Standard backing cloth",
    minStockLevel: 100,
    status: "in-stock"
  },
  {
    id: "RM011",
    name: "Premium Backing Cloth",
    category: "Fabric",
    currentStock: 150,
    unit: "sqm",
    cost: 35,
    supplier: "Premium Fabrics",
    location: "Warehouse C - Section 1",
    brand: "Premium Backing",
    description: "Premium quality backing cloth",
    minStockLevel: 50,
    status: "in-stock"
  }
];

// Production history for auto-material selection
const productionHistory = {
  "PROD001": { // Traditional Persian Carpet
    steps: [
      {
        stepId: 1,
        materials: [
          { materialId: "RM001", quantity: 3, unit: "rolls" },
          { materialId: "RM005", quantity: 1.6, unit: "liters" }
        ]
      },
      {
        stepId: 2,
        materials: [
          { materialId: "RM001", quantity: 3, unit: "rolls" }
        ]
      },
      {
        stepId: 3,
        materials: [
          { materialId: "RM005", quantity: 1.6, unit: "liters" },
          { materialId: "RM009", quantity: 2.4, unit: "liters" }
        ]
      },
      {
        stepId: 4,
        materials: [
          { materialId: "RM010", quantity: 6.5, unit: "sqm" }
        ]
      }
    ]
  },
  "PROD002": { // Modern Geometric Carpet
    steps: [
      {
        stepId: 1,
        materials: [
          { materialId: "RM003", quantity: 1.67, unit: "rolls" },
          { materialId: "RM007", quantity: 0.83, unit: "liters" }
        ]
      },
      {
        stepId: 2,
        materials: [
          { materialId: "RM003", quantity: 1.67, unit: "rolls" }
        ]
      },
      {
        stepId: 3,
        materials: [
          { materialId: "RM007", quantity: 0.83, unit: "liters" },
          { materialId: "RM009", quantity: 1.5, unit: "liters" }
        ]
      },
      {
        stepId: 4,
        materials: [
          { materialId: "RM010", quantity: 4.5, unit: "sqm" }
        ]
      }
    ]
  }
};

// Enhanced status styles with better visual hierarchy
const statusStyles = {
  "planning": "bg-slate-100 text-slate-700 border-slate-200",
  "active": "bg-blue-100 text-blue-700 border-blue-200",
  "paused": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "completed": "bg-green-100 text-green-700 border-green-200",
  "issue": "bg-red-100 text-red-700 border-red-200"
};

const stepStatusStyles = {
  "pending": "bg-slate-100 text-slate-700 border-slate-200",
  "active": "bg-blue-100 text-blue-700 border-blue-200",
  "paused": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "completed": "bg-green-100 text-green-700 border-green-200",
  "issue": "bg-red-100 text-red-700 border-red-200"
};

const priorityStyles = {
  "normal": "bg-gray-100 text-gray-700 border-gray-200",
  "high": "bg-orange-100 text-orange-700 border-orange-200",
  "urgent": "bg-red-100 text-red-700 border-red-200"
};

const materialStatusStyles = {
  "in-stock": "bg-green-100 text-green-800 border-green-200",
  "low-stock": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "out-of-stock": "bg-red-100 text-red-800 border-red-200"
};

export default function ProductionDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState<ProductionProduct | null>(null);
  const [currentStepView, setCurrentStepView] = useState<number>(1);
  const [isMaterialSelectionOpen, setIsMaterialSelectionOpen] = useState(false);
  const [isStepCompletionOpen, setIsStepCompletionOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isPurchaseMaterialOpen, setIsPurchaseMaterialOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<ProductionStep | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<{ [key: string]: number }>({});
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState("all");
  const [stepCompletionData, setStepCompletionData] = useState({
    actualOutput: 0,
    waste: 0,
    defective: 0,
    notes: ""
  });
  const [inspectionData, setInspectionData] = useState({
    inspector: "",
    inspectionDate: "",
    inspectionNotes: "",
    qualityGrade: "",
    individualProducts: [] as IndividualProduct[]
  });
  const [showIndividualProducts, setShowIndividualProducts] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: keyof IndividualProduct } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [viewMode, setViewMode] = useState<"overview" | "steps" | "materials" | "inspection">("overview");

  // Load product data
  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
    } else if (productId) {
      // Load from API or local storage in real app
      // For now, we'll use the state from navigation
    }
  }, [productId, location.state]);

  if (!product) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Header title="Production Detail" subtitle="Loading..." />
        <div className="text-center">Loading product details...</div>
      </div>
    );
  }

  // Get current step
  const currentStep = product.steps.find(step => step.id === currentStepView);

  // Filter materials based on search and category
  const filteredMaterials = rawMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
                         material.supplier.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
                         material.brand?.toLowerCase().includes(materialSearchTerm.toLowerCase());
    const matchesCategory = materialCategoryFilter === "all" || material.category === materialCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get auto-fill materials based on production flow
  const getAutoFillMaterials = (stepId: number) => {
    if (!product) return {};
    
    const autoMaterials: { [key: string]: number } = {};
    
    // Step 1: Initial raw materials (Punching)
    if (stepId === 1) {
      if (product.productId) {
        // Use production history for existing products
        const history = productionHistory[product.productId as keyof typeof productionHistory];
        if (history) {
          const stepHistory = history.steps.find(s => s.stepId === stepId);
          if (stepHistory) {
            stepHistory.materials.forEach(material => {
              autoMaterials[material.materialId] = material.quantity * product.quantity;
            });
          }
        }
      } else {
        // For new products, suggest common materials
        autoMaterials["RM001"] = 3 * product.quantity; // Cotton Yarn
        autoMaterials["RM005"] = 1.6 * product.quantity; // Red Dye
      }
    }
    
    // Step 2: Use output from Step 1 + additional materials (Dyeing)
    if (stepId === 2) {
      const step1 = product.steps.find(s => s.id === 1);
      if (step1 && step1.status === "completed" && step1.actualOutput) {
        // Auto-select the output from step 1 as input for step 2
        autoMaterials["STEP1_OUTPUT"] = step1.actualOutput;
        // Add dyeing materials
        autoMaterials["RM005"] = 1.6 * step1.actualOutput; // Red Dye
        autoMaterials["RM009"] = 2.4 * step1.actualOutput; // Latex Solution
      }
    }
    
    // Step 3: Use output from Step 2 + additional materials (Cutting)
    if (stepId === 3) {
      const step2 = product.steps.find(s => s.id === 2);
      if (step2 && step2.status === "completed" && step2.actualOutput) {
        // Auto-select the output from step 2 as input for step 3
        autoMaterials["STEP2_OUTPUT"] = step2.actualOutput;
        // Add cutting materials
        autoMaterials["RM010"] = 6.5 * step2.actualOutput; // Backing Cloth
      }
    }
    
    // Step 4: Use output from Step 3 + additional materials (Finishing)
    if (stepId === 4) {
      const step3 = product.steps.find(s => s.id === 3);
      if (step3 && step3.status === "completed" && step3.actualOutput) {
        // Auto-select the output from step 3 as input for step 4
        autoMaterials["STEP3_OUTPUT"] = step3.actualOutput;
        // Add finishing materials
        autoMaterials["RM009"] = 1.5 * step3.actualOutput; // Latex Solution
      }
    }
    
    // Step 5: Quality Inspection (no materials needed, just inspection)
    if (stepId === 5) {
      const step4 = product.steps.find(s => s.id === 4);
      if (step4 && step4.status === "completed" && step4.actualOutput) {
        // This step is for quality inspection, no materials needed
        // The output from step 4 becomes the final product
      }
    }
    
    return autoMaterials;
  };

  // Enhanced step activation with material selection
  const handleStepActivate = (step: ProductionStep) => {
    setSelectedStep(step);
    
    // Auto-fill materials based on production history and step requirements
    const autoMaterials = getAutoFillMaterials(step.id);
    setSelectedMaterials(autoMaterials);
    setIsMaterialSelectionOpen(true);
  };

  // Enhanced material selection confirmation with better validation
  const handleMaterialSelectionConfirm = () => {
    if (!selectedStep) return;

    // Validate material availability
    const insufficientMaterials = Object.entries(selectedMaterials).filter(([materialId, quantity]) => {
      const material = rawMaterials.find(m => m.id === materialId);
      return material && quantity > material.currentStock;
    });

    if (insufficientMaterials.length > 0) {
      alert(`Insufficient stock for the following materials:\n${insufficientMaterials.map(([id, qty]) => {
        const material = rawMaterials.find(m => m.id === id);
        return `• ${material?.name}: Required ${qty} ${material?.unit}, Available ${material?.currentStock} ${material?.unit}`;
      }).join('\n')}\n\nPlease purchase additional materials or adjust quantities.`);
      return;
    }

    const updatedMaterials = Object.entries(selectedMaterials).map(([materialId, quantity]) => {
      const material = rawMaterials.find(m => m.id === materialId);
      return {
        materialId,
        materialName: material?.name || "",
        requiredQuantity: quantity,
        usedQuantity: quantity, // Mark as used immediately
        unit: material?.unit || "",
        cost: material?.cost || 0,
        supplier: material?.supplier || ""
      };
    });

    // Calculate expected output based on step and previous step output
    let expectedOutput = product.quantity;
    if (selectedStep.id > 1) {
      const previousStep = product.steps.find(s => s.id === selectedStep.id - 1);
      if (previousStep && previousStep.status === "completed" && previousStep.actualOutput) {
        expectedOutput = previousStep.actualOutput;
      }
    }

    setProduct(prev => {
      if (!prev) return prev;
      
      const updatedSteps = prev.steps.map(step => {
        if (step.id === selectedStep.id) {
          return {
            ...step,
            status: "active" as const,
            startDate: new Date().toISOString().split('T')[0],
            materials: updatedMaterials,
            expectedOutput: expectedOutput
          };
        }
        return step;
      });

      const completedSteps = updatedSteps.filter(s => s.status === "completed").length;
      const progress = (completedSteps / prev.totalSteps) * 100;
      const currentStep = completedSteps < prev.totalSteps ? completedSteps + 1 : prev.totalSteps;
      
      return {
        ...prev,
        steps: updatedSteps,
        progress,
        currentStep,
        status: "active" as const
      };
    });

    setIsMaterialSelectionOpen(false);
    setSelectedMaterials({});
  };

  // Enhanced step completion with waste management
  const handleStepComplete = (step: ProductionStep) => {
    setSelectedStep(step);
    setStepCompletionData({
      actualOutput: step.expectedOutput,
      waste: 0,
      defective: 0,
      notes: ""
    });
    setIsStepCompletionOpen(true);
  };

  // Handle step completion confirmation
  const handleStepCompletionConfirm = () => {
    if (!selectedStep) return;

    setProduct(prev => {
      if (!prev) return prev;
      
      const updatedSteps = prev.steps.map(step => {
        if (step.id === selectedStep.id) {
          return {
            ...step,
            status: "completed" as const,
            completionDate: new Date().toISOString().split('T')[0],
            actualOutput: stepCompletionData.actualOutput,
            waste: stepCompletionData.waste,
            defective: stepCompletionData.defective,
            notes: stepCompletionData.notes
          };
        }
        return step;
      });

      const completedSteps = updatedSteps.filter(s => s.status === "completed").length;
      const progress = (completedSteps / prev.totalSteps) * 100;
      const currentStep = completedSteps < prev.totalSteps ? completedSteps + 1 : prev.totalSteps;
      
      // Check if all steps are completed
      const allCompleted = updatedSteps.every(s => s.status === "completed");

      return {
        ...prev,
        steps: updatedSteps,
        progress,
        currentStep,
        status: allCompleted ? "completed" as const : "active" as const,
        actualCompletion: allCompleted ? new Date().toISOString().split('T')[0] : undefined
      };
    });

    setIsStepCompletionOpen(false);
    setStepCompletionData({
      actualOutput: 0,
      waste: 0,
      defective: 0,
      notes: ""
    });
  };

  // Handle quality inspection
  const handleQualityInspection = (step: ProductionStep) => {
    setSelectedStep(step);
    setInspectionData({
      inspector: "",
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectionNotes: "",
      qualityGrade: "A",
      individualProducts: []
    });
    setIsInspectionOpen(true);
  };

  // Handle inspection completion
  const handleInspectionComplete = () => {
    if (!selectedStep || inspectionData.individualProducts.length === 0) return;

    setProduct(prev => {
      if (!prev) return prev;
      
      const updatedSteps = prev.steps.map(step => {
        if (step.id === selectedStep.id) {
          return {
            ...step,
            status: "completed" as const,
            completionDate: new Date().toISOString().split('T')[0],
            actualOutput: inspectionData.individualProducts.length,
            notes: inspectionData.inspectionNotes,
            inspector: inspectionData.inspector,
            inspectionDate: inspectionData.inspectionDate,
            inspectionNotes: inspectionData.inspectionNotes
          };
        }
        return step;
      });

      const completedSteps = updatedSteps.filter(s => s.status === "completed").length;
      const progress = (completedSteps / prev.totalSteps) * 100;
      const currentStep = completedSteps < prev.totalSteps ? completedSteps + 1 : prev.totalSteps;
      
      // Check if all steps are completed
      const allCompleted = updatedSteps.every(s => s.status === "completed");
      
      return {
        ...prev,
        steps: updatedSteps,
        progress,
        currentStep,
        status: allCompleted ? "completed" as const : "active" as const,
        actualCompletion: allCompleted ? new Date().toISOString().split('T')[0] : undefined,
        individualProducts: inspectionData.individualProducts
      };
    });

    setIsInspectionOpen(false);
    setInspectionData({
      inspector: "",
      inspectionDate: "",
      inspectionNotes: "",
      qualityGrade: "",
      individualProducts: []
    });
  };

  // Handle step pause
  const handlePauseStep = (step: ProductionStep) => {
    setProduct(prev => {
      if (!prev) return prev;
      
      const updatedSteps = prev.steps.map(s => {
        if (s.id === step.id) {
          return { ...s, status: "paused" as const };
        }
        return s;
      });
      
      return {
        ...prev,
        steps: updatedSteps,
        status: "paused" as const
      };
    });
  };

  // Handle step details view
  const handleViewStepDetails = (step: ProductionStep) => {
    setSelectedStep(step);
    // You can implement a detailed view modal here
    console.log("View step details:", step);
  };

  // Handle start step
  const handleStartStep = (step: ProductionStep) => {
    handleStepActivate(step);
  };

  // Enhanced inspection with individual product creation
  const handleInspection = (step: ProductionStep) => {
    setSelectedStep(step);
    setInspectionData({
      inspector: "",
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectionNotes: "",
      qualityGrade: "A",
      individualProducts: []
    });
    
    // For final step (Step 5), show individual products page
    if (step.id === 5 && step.actualOutput) {
      // Check if individual products already exist
      if (product.individualProducts && product.individualProducts.length > 0) {
        setShowIndividualProducts(true);
      } else {
        // Generate new individual products with auto-filled product details
        const individualProducts: IndividualProduct[] = [];
        for (let i = 1; i <= step.actualOutput; i++) {
          individualProducts.push({
            id: `IND${Date.now()}_${i}`,
            qrCode: "", // Will be generated from admin-provided ID
            productId: product.productId || product.id,
            manufacturingDate: new Date().toISOString().split('T')[0],
            materialsUsed: step.materials,
            finalDimensions: product.dimensions || `${product.size} (Standard)`,
            finalWeight: product.weight || "Standard",
            finalThickness: product.thickness || "Standard",
            finalPileHeight: product.pileHeight || "Standard",
            qualityGrade: "A",
            inspector: "",
            notes: `Piece ${i} of ${step.actualOutput} - ${product.productName}`,
            status: "available"
          });
        }
        setProduct(prev => prev ? { ...prev, individualProducts } : null);
      }
    } else {
      setIsInspectionOpen(true);
    }
  };

  // Enhanced inspection confirmation with better quality control
  const handleInspectionConfirm = () => {
    if (!selectedStep) return;

    // Generate individual products for final inspection
    const individualProducts: IndividualProduct[] = [];
    const step = product.steps.find(s => s.id === selectedStep.id);
    
    if (step?.actualOutput) {
      for (let i = 1; i <= step.actualOutput; i++) {
        individualProducts.push({
          id: `IND${Date.now()}_${i}`,
          qrCode: `QR-${product.batchNumber}-${selectedStep.id}-${String(i).padStart(3, '0')}`,
          productId: product.productId || product.id,
          manufacturingDate: new Date().toISOString().split('T')[0],
          materialsUsed: step.materials,
          finalDimensions: product.dimensions || "Standard",
          finalWeight: product.weight || "Standard",
          finalThickness: product.thickness || "Standard",
          finalPileHeight: product.pileHeight || "Standard",
          qualityGrade: inspectionData.qualityGrade,
          inspector: inspectionData.inspector,
          notes: inspectionData.inspectionNotes,
          status: "available"
        });
      }
    }

    setProduct(prev => {
      if (!prev) return prev;
      
      const updatedSteps = prev.steps.map(step => {
        if (step.id === selectedStep.id) {
          return {
            ...step,
            inspector: inspectionData.inspector,
            inspectionDate: inspectionData.inspectionDate,
            inspectionNotes: inspectionData.inspectionNotes
          };
        }
        return step;
      });

      // If this is the final step (step 5), update the main Products inventory
      if (selectedStep.id === 5 && individualProducts.length > 0) {
        // Update the main Products page inventory
        // In a real app, this would be an API call
        // For now, we'll store in localStorage and show a success message
        
        const productionResult = {
          productId: product.productId || product.id,
          productName: product.productName,
          newQuantity: individualProducts.length,
          individualProducts: individualProducts,
          manufacturingDate: new Date().toISOString().split('T')[0],
          batchNumber: product.batchNumber
        };

        // Store in localStorage for demo purposes
        const existingInventory = JSON.parse(localStorage.getItem('productionInventory') || '[]');
        existingInventory.push(productionResult);
        localStorage.setItem('productionInventory', JSON.stringify(existingInventory));

        // Show success message
        alert(`Production completed successfully!\n\n${individualProducts.length} pieces added to inventory.\n\nProduct: ${product.productName}\nBatch: ${product.batchNumber}\nQuality Grade: ${inspectionData.qualityGrade}\n\nIndividual products with QR codes have been generated and added to the main Products inventory.`);
      }

      return {
        ...prev,
        steps: updatedSteps,
        individualProducts: selectedStep.id === 5 ? individualProducts : prev.individualProducts
      };
    });

    setIsInspectionOpen(false);
    setInspectionData({
      inspector: "",
      inspectionDate: "",
      inspectionNotes: "",
      qualityGrade: "A",
      individualProducts: []
    });
  };

  // Enhanced QR code generation with better validation
  const generateQRFromID = (customId: string) => {
    if (!customId.trim()) return "";
    // Create a unique QR code based on the custom ID and batch number
    return `QR-${product.batchNumber}-${customId.toUpperCase().replace(/\s+/g, '-')}`;
  };

  // Enhanced individual product update with validation
  const handleIndividualProductUpdate = (index: number, field: keyof IndividualProduct, value: any) => {
    setProduct(prev => {
      if (!prev) return prev;
      const updatedProducts = [...prev.individualProducts];
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      return { ...prev, individualProducts: updatedProducts };
    });
  };

  // Enhanced individual products completion with better inventory management
  const handleIndividualProductsComplete = () => {
    // Validate inspector assignment
    if (!inspectionData.inspector.trim()) {
      alert('Please assign an inspector before completing production.');
      return;
    }

    // Calculate available pieces (excluding damaged ones)
    const availablePieces = product.individualProducts?.filter(p => p.status === 'available').length || 0;
    const damagedPieces = product.individualProducts?.filter(p => p.status === 'damaged').length || 0;

    // Update the main Products page inventory
    const productionResult = {
      productId: product.productId || product.id,
      productName: product.productName,
      newQuantity: availablePieces, // Only count available pieces
      totalProduced: product.individualProducts?.length || 0, // Total pieces produced
      damagedPieces: damagedPieces,
      individualProducts: product.individualProducts,
      manufacturingDate: new Date().toISOString().split('T')[0],
      batchNumber: product.batchNumber,
      inspector: inspectionData.inspector,
      inspectionDate: inspectionData.inspectionDate,
      customSteps: product.steps.filter(step => step.isCustomStep) // Save custom steps
    };

    // Store in localStorage for demo purposes
    const existingInventory = JSON.parse(localStorage.getItem('productionInventory') || '[]');
    existingInventory.push(productionResult);
    localStorage.setItem('productionInventory', JSON.stringify(existingInventory));

    // Update product status to completed
    setProduct(prev => {
      if (!prev) return prev;
      
      const updatedSteps = prev.steps.map(step => {
        if (step.id === 5) {
          return {
            ...step,
            inspector: inspectionData.inspector,
            inspectionDate: inspectionData.inspectionDate,
            inspectionNotes: inspectionData.inspectionNotes
          };
        }
        return step;
      });

      return {
        ...prev,
        steps: updatedSteps,
        status: "completed" as const,
        progress: 100,
        actualCompletion: new Date().toISOString().split('T')[0],
        individualProducts: product.individualProducts
      };
    });

    setShowIndividualProducts(false);
    
    // Show detailed success message
    const successMessage = `Production completed successfully!

📦 Production Summary:
• Product: ${product.productName}
• Batch: ${product.batchNumber}
• Total Pieces Produced: ${product.individualProducts?.length || 0}
• Available for Sale: ${availablePieces}
• Damaged/Defective: ${damagedPieces}
• Inspector: ${inspectionData.inspector || 'Not assigned'}
• Inspection Date: ${inspectionData.inspectionDate}

✅ Individual products with QR codes have been generated and added to:
• Main Products Inventory (quantity updated)
• Individual Stock Management

The product quantity has been updated in the main inventory.`;
    
    alert(successMessage);
  };

  // Enhanced purchase material with better navigation
  const handlePurchaseMaterial = (material: RawMaterial) => {
    // Navigate to Materials page to purchase
    navigate('/materials', { 
      state: { 
        purchaseMaterial: {
          materialId: material.id,
          materialName: material.name,
          supplier: material.supplier,
          unit: material.unit,
          requiredQuantity: selectedMaterials[material.id] || 0
        }
      }
    });
  };

  // Enhanced Step Card Component
  const StepCard = ({ step, stepIndex }: { step: ProductionStep; stepIndex: number }) => {
    const isCurrentStep = stepIndex === currentStepView - 1;
    const isAccessible = step.status === "completed" || step.status === "active" || 
                        (step.status === "pending" && stepIndex === 0);

    return (
      <Card className={`relative overflow-hidden transition-all duration-300 ${
        isCurrentStep ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      } ${!isAccessible ? 'opacity-60' : ''}`}>
        {/* Status Indicator Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          step.status === "completed" ? "bg-green-500" :
          step.status === "active" ? "bg-blue-500" :
          step.status === "issue" ? "bg-red-500" :
          "bg-gray-300"
        }`} />
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step.status === "completed" ? "bg-green-100 text-green-700" :
                step.status === "active" ? "bg-blue-100 text-blue-700" :
                step.status === "issue" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {stepIndex + 1}
              </div>
        <div>
                <CardTitle className="text-lg">{step.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>
            </div>
            <Badge className={`${stepStatusStyles[step.status]} shadow-sm`}>
              {step.status === "active" && <Cog className="w-3 h-3 mr-1" />}
              {step.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
              {step.status === "issue" && <AlertTriangle className="w-3 h-3 mr-1" />}
              {step.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
        <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{step.progress}%</span>
            </div>
            <Progress value={step.progress} className="h-2" />
        </div>
        
          {/* Materials Used */}
          {step.materials.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Materials Used</h4>
              <div className="space-y-2">
                {step.materials.map((material, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{material.materialName}</span>
                    <span className="font-medium">{material.usedQuantity} {material.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <span className="text-muted-foreground text-xs">Expected Output</span>
              <div className="font-semibold">{step.expectedOutput}</div>
            </div>
            {step.actualOutput !== undefined && (
              <div className="bg-green-50 p-3 rounded">
                <span className="text-muted-foreground text-xs">Actual Output</span>
                <div className="font-semibold">{step.actualOutput}</div>
              </div>
            )}
          </div>

          {/* Waste and Defects */}
          {(step.waste || step.defective) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {step.waste && (
                <div className="bg-yellow-50 p-3 rounded">
                  <span className="text-muted-foreground text-xs">Waste</span>
                  <div className="font-semibold text-yellow-700">{step.waste}</div>
                </div>
              )}
              {step.defective && (
                <div className="bg-red-50 p-3 rounded">
                  <span className="text-muted-foreground text-xs">Defective</span>
                  <div className="font-semibold text-red-700">{step.defective}</div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {step.status === "pending" && isAccessible && (
              <Button 
                size="sm" 
                onClick={() => handleStartStep(step)}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Step
          </Button>
            )}
            {step.status === "active" && (
              <>
          <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStepComplete(step)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Step
          </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePauseStep(step)}
                >
                  <Pause className="w-4 h-4" />
                </Button>
              </>
            )}
            {step.status === "completed" && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleViewStepDetails(step)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            )}
      </div>

          {/* Step Notes */}
          {step.notes && (
            <div className="bg-gray-50 p-3 rounded text-sm">
              <span className="font-medium">Notes:</span> {step.notes}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Enhanced Excel-like Table Component for Individual Products
  const ExcelLikeTable = ({ data, onDataChange }: { 
    data: IndividualProduct[]; 
    onDataChange: (data: IndividualProduct[]) => void 
  }) => {
    const handleCellClick = (rowIndex: number, field: keyof IndividualProduct) => {
      setEditingCell({ row: rowIndex, col: field });
      setEditValue(String(data[rowIndex][field] || ""));
    };

    const handleCellSave = () => {
      if (editingCell) {
        const newData = [...data];
        const { row, col } = editingCell;
        
        // Process the value based on the field type
        let processedValue = editValue;
        if (col === 'status') {
          processedValue = editValue as "available" | "damaged" | "sold";
        } else if (col === 'qualityGrade') {
          processedValue = editValue as "A+" | "A" | "B" | "C";
        }
        
        newData[row] = { ...newData[row], [col]: processedValue as any };
        onDataChange(newData);
        setEditingCell(null);
        setEditValue("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleCellSave();
      } else if (e.key === 'Escape') {
        setEditingCell(null);
        setEditValue("");
      }
    };

    const addRow = () => {
      const newProduct: IndividualProduct = {
        id: `IND${Date.now()}`,
        qrCode: `QR-${product?.batchNumber}-${String(data.length + 1).padStart(3, '0')}`,
        productId: product?.id || "",
        manufacturingDate: new Date().toISOString().split('T')[0],
        materialsUsed: [],
        finalDimensions: "",
        finalWeight: "",
        finalThickness: "",
        finalPileHeight: "",
        qualityGrade: "A",
        inspector: "",
        notes: "",
        status: "available"
      };
      onDataChange([...data, newProduct]);
    };

    const removeRow = (index: number) => {
      const newData = data.filter((_, i) => i !== index);
      onDataChange(newData);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Individual Product Inspection</h3>
          <Button onClick={addRow} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </div>
        
      <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Row</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Custom ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">QR Code</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dimensions</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Weight</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thickness</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Pile Height</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quality Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, rowIndex) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{rowIndex + 1}</td>
                    <td className="px-4 py-3">
                      {editingCell?.row === rowIndex && editingCell?.col === 'id' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCellSave}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                          onClick={() => handleCellClick(rowIndex, 'id')}
                        >
                          {item.id}
            </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.qrCode}</td>
                    <td className="px-4 py-3">
                      {editingCell?.row === rowIndex && editingCell?.col === 'finalDimensions' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCellSave}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                          onClick={() => handleCellClick(rowIndex, 'finalDimensions')}
                        >
                          {item.finalDimensions || "Click to edit"}
              </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingCell?.row === rowIndex && editingCell?.col === 'finalWeight' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCellSave}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                          onClick={() => handleCellClick(rowIndex, 'finalWeight')}
                        >
                          {item.finalWeight || "Click to edit"}
            </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingCell?.row === rowIndex && editingCell?.col === 'finalThickness' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCellSave}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                          onClick={() => handleCellClick(rowIndex, 'finalThickness')}
                        >
                          {item.finalThickness || "Click to edit"}
          </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingCell?.row === rowIndex && editingCell?.col === 'finalPileHeight' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCellSave}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                          onClick={() => handleCellClick(rowIndex, 'finalPileHeight')}
                        >
                          {item.finalPileHeight || "Click to edit"}
        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingCell?.row === rowIndex && editingCell?.col === 'qualityGrade' ? (
                        <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                      onBlur={handleCellSave}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        >
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                          onClick={() => handleCellClick(rowIndex, 'qualityGrade')}
                        >
                          <Badge className={
                            item.qualityGrade === "A+" ? "bg-green-100 text-green-800" :
                            item.qualityGrade === "A" ? "bg-blue-100 text-blue-800" :
                            item.qualityGrade === "B" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {item.qualityGrade}
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingCell?.row === rowIndex && editingCell?.col === 'status' ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                          onBlur={handleCellSave}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                        >
                          <option value="available">Available</option>
                          <option value="damaged">Damaged</option>
                          <option value="sold">Sold</option>
                        </select>
                  ) : (
                    <div 
                          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                          onClick={() => handleCellClick(rowIndex, 'status')}
                        >
                          <Badge className={
                            item.status === "available" ? "bg-green-100 text-green-800" :
                            item.status === "damaged" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                          }>
                            {item.status}
                          </Badge>
                    </div>
                  )}
                    </td>
                    <td className="px-4 py-3">
                      {editingCell?.row === rowIndex && editingCell?.col === 'notes' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleCellSave}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                          onClick={() => handleCellClick(rowIndex, 'notes')}
                        >
                          {item.notes || "Click to edit"}
                </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                <Button
                  size="sm"
                        variant="outline"
                  onClick={() => removeRow(rowIndex)}
                        className="text-red-600 hover:text-red-700"
                >
                        <Trash2 className="w-4 h-4" />
                </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Add new step
  const handleAddStep = (stepData: { name: string; description: string }) => {
    if (!product) return;
    
    const newStep: ProductionStep = {
      id: Date.now(), // Unique ID
      name: stepData.name,
      description: stepData.description,
      status: "pending",
      progress: 0,
      materials: [],
      expectedOutput: 0,
      notes: "",
      isCustomStep: true,
      stepOrder: product.steps.length + 1
    };

    setProduct(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: [...prev.steps, newStep],
        totalSteps: prev.totalSteps + 1
      };
    });
  };

  // Edit existing step
  const handleEditStep = (stepId: number, stepData: { name: string; description: string }) => {
    if (!product) return;
    
    setProduct(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(step => 
          step.id === stepId 
            ? { ...step, name: stepData.name, description: stepData.description }
            : step
        )
      };
    });
  };

  // Delete step
  const handleDeleteStep = (stepId: number) => {
    if (!product) return;
    
    setProduct(prev => {
      if (!prev) return prev;
      const updatedSteps = prev.steps.filter(step => step.id !== stepId);
      return {
        ...prev,
        steps: updatedSteps,
        totalSteps: updatedSteps.length
      };
    });
  };

  // Reorder steps
  const handleReorderSteps = (newOrder: ProductionStep[]) => {
    if (!product) return;
    
    const reorderedSteps = newOrder.map((step, index) => ({
      ...step,
      stepOrder: index + 1
    }));

    setProduct(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: reorderedSteps
      };
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Production Detail" 
        subtitle="Manage production workflow, track materials, and complete quality inspection"
      />

      {product ? (
        <>
          {/* Enhanced Product Overview */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.productName} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground" />
                         )}
                       </div>
                  <div>
                    <h1 className="text-2xl font-bold">{product.productName}</h1>
                    <p className="text-muted-foreground font-mono">{product.batchNumber}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className={`${statusStyles[product.status]} shadow-sm`}>
                        {product.status === "active" && <Factory className="w-3 h-3 mr-1" />}
                        {product.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {product.status}
                          </Badge>
                      <Badge className={`${priorityStyles[product.priority]} shadow-sm`}>
                        {product.priority === "urgent" && <Zap className="w-3 h-3 mr-1" />}
                        {product.priority}
                      </Badge>
                        </div>
                        </div>
                      </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate('/production')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Production
                        </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                      </Button>
              </div>
            </div>

              {/* Progress Overview */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{product.progress}%</span>
                  </div>
                <Progress value={product.progress} className="h-3" />
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>Step {product.currentStep} of {product.totalSteps}</span>
                  <span>Expected: {product.expectedCompletion}</span>
                  </div>
                </div>
          </CardContent>
        </Card>

          {/* Enhanced Navigation Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                       <Button
                variant={viewMode === "overview" ? "default" : "ghost"}
                         size="sm"
                onClick={() => setViewMode("overview")}
                       >
                Overview
                       </Button>
                           <Button
                variant={viewMode === "steps" ? "default" : "ghost"}
                             size="sm"
                onClick={() => setViewMode("steps")}
                           >
                Production Steps
                           </Button>
                           <Button
                variant={viewMode === "materials" ? "default" : "ghost"}
                             size="sm"
                onClick={() => setViewMode("materials")}
                           >
                Materials
                           </Button>
                           <Button
                variant={viewMode === "inspection" ? "default" : "ghost"}
                             size="sm"
                onClick={() => setViewMode("inspection")}
                           >
                Quality Inspection
                           </Button>
                </div>
              </div>
              
          {/* Content based on view mode */}
          {viewMode === "overview" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color</span>
                    <span className="font-medium">{product.color}</span>
                </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{product.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pattern</span>
                    <span className="font-medium">{product.pattern}</span>
                </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{product.quantity} {product.unit}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
           <Card>
             <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Financial
                  </CardTitle>
             </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-medium">₹{product.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Selling Price</span>
                    <span className="font-medium">₹{product.sellingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="font-medium">₹{(product.quantity * product.sellingPrice).toLocaleString()}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <span className="font-medium text-green-600">
                      ₹{((product.quantity * product.sellingPrice) - product.totalCost).toLocaleString()}
                    </span>
          </div>
        </CardContent>
      </Card>

              {/* Timeline */}
           <Card>
             <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Timeline
                        </CardTitle>
             </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">{new Date(product.startDate).toLocaleDateString()}</span>
                      </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Completion</span>
                    <span className="font-medium">{new Date(product.expectedCompletion).toLocaleDateString()}</span>
                    </div>
                  {product.actualCompletion && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual Completion</span>
                      <span className="font-medium">{new Date(product.actualCompletion).toLocaleDateString()}</span>
                        </div>
                      )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{product.location}</span>
                    </div>
             </CardContent>
           </Card>
                  </div>
         )}

          {viewMode === "steps" && (
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Production Steps</h2>
                     <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Steps
                        </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Steps
                      </Button>
                    </div>
                  </div>

              <div className="grid gap-6 md:grid-cols-2">
                {product.steps.map((step, index) => (
                  <StepCard key={step.id} step={step} stepIndex={index} />
                  ))}
                </div>
              </div>
            )}

          {viewMode === "materials" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Material Management</h2>
                <Button onClick={() => setIsMaterialSelectionOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Materials
                </Button>
                  </div>
              
              {/* Material summary cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Material cards will be rendered here */}
                    </div>
                    </div>
                  )}

          {viewMode === "inspection" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Quality Inspection</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Codes
             </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                    </div>
                </div>
              
              {product.individualProducts && product.individualProducts.length > 0 ? (
                <ExcelLikeTable 
                  data={product.individualProducts} 
                  onDataChange={(newData) => {
                    setProduct(prev => prev ? { ...prev, individualProducts: newData } : null);
                  }}
                />
              ) : (
                <Card className="p-12 text-center">
                  <CheckSquare className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-3">No Individual Products</h3>
                  <p className="text-muted-foreground mb-6">
                    Individual products will be created during the final quality inspection step
                  </p>
                  <Button onClick={() => setViewMode("steps")}>
                    <Cog className="w-4 h-4 mr-2" />
                    Go to Production Steps
                  </Button>
                </Card>
                )}
              </div>
            )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-3">Product Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The production batch you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/production')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Production
          </Button>
        </Card>
      )}

      {/* Enhanced Material Selection Dialog */}
      <Dialog open={isMaterialSelectionOpen} onOpenChange={setIsMaterialSelectionOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Material Selection for Step {selectedStep?.id}: {selectedStep?.name}
            </DialogTitle>
            <DialogDescription>
              Select and configure materials for this production step. Materials will be automatically consumed when the step is completed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-full space-y-4">
            {/* Material Selection Tabs */}
            <div className="flex items-center justify-between border-b">
              <div className="flex space-x-1">
                <Button
                  variant={materialCategoryFilter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMaterialCategoryFilter("all")}
                >
                  All Materials
                </Button>
                <Button
                  variant={materialCategoryFilter === "Yarn" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMaterialCategoryFilter("Yarn")}
                >
                  Yarn
                </Button>
                <Button
                  variant={materialCategoryFilter === "Dye" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMaterialCategoryFilter("Dye")}
                >
                  Dye
                </Button>
                <Button
                  variant={materialCategoryFilter === "Chemical" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMaterialCategoryFilter("Chemical")}
                >
                  Chemical
                </Button>
                <Button
                  variant={materialCategoryFilter === "Fabric" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMaterialCategoryFilter("Fabric")}
                >
                  Fabric
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const autoMaterials = getAutoFillMaterials(selectedStep?.id || 1);
                    setSelectedMaterials(autoMaterials);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Auto-Fill
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMaterials({})}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                  placeholder="Search materials by name, supplier, or brand..."
                    value={materialSearchTerm}
                    onChange={(e) => setMaterialSearchTerm(e.target.value)}
                  className="pl-10"
                  />
              </div>
              <Select value={materialCategoryFilter} onValueChange={setMaterialCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Yarn">Yarn</SelectItem>
                  <SelectItem value="Dye">Dye</SelectItem>
                  <SelectItem value="Chemical">Chemical</SelectItem>
                  <SelectItem value="Fabric">Fabric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Material Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-96">
               {filteredMaterials.map((material) => {
                const isSelected = selectedMaterials[material.id] > 0;
                const selectedQuantity = selectedMaterials[material.id] || 0;
                const isInsufficient = selectedQuantity > material.currentStock;
                 
                 return (
                  <Card 
                    key={material.id} 
                    className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    } ${isInsufficient ? 'border-red-200 bg-red-50' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        const newSelected = { ...selectedMaterials };
                        delete newSelected[material.id];
                        setSelectedMaterials(newSelected);
                      } else {
                        setSelectedMaterials(prev => ({
                          ...prev,
                          [material.id]: 1
                        }));
                      }
                    }}
                  >
                    {/* Status Indicator */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      material.status === "out-of-stock" ? "bg-red-500" :
                      material.status === "low-stock" ? "bg-yellow-500" :
                      "bg-green-500"
                    }`} />
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                     <div className="flex-1">
                          <h3 className="font-semibold text-sm">{material.name}</h3>
                          <p className="text-xs text-muted-foreground">{material.brand}</p>
                       </div>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <Badge className="bg-blue-100 text-blue-800">
                              {selectedQuantity} {material.unit}
                            </Badge>
                          )}
                          <Badge className={
                            material.status === "out-of-stock" ? "bg-red-100 text-red-800" :
                            material.status === "low-stock" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {material.status === "out-of-stock" ? "Out of Stock" :
                             material.status === "low-stock" ? "Low Stock" : "In Stock"}
                          </Badge>
                       </div>
                           </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-medium">{material.currentStock} {material.unit}</span>
                           </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">₹{material.cost}/{material.unit}</span>
                           </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Supplier:</span>
                          <span className="font-medium truncate">{material.supplier}</span>
                         </div>
                     </div>

                      {isSelected && (
                        <div className="mt-3 space-y-2">
                         <div className="flex items-center gap-2">
                            <Label htmlFor={`qty-${material.id}`} className="text-xs">Quantity:</Label>
                            <div className="flex items-center gap-1">
                           <Button
                             size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (selectedQuantity > 1) {
                                    setSelectedMaterials(prev => ({
                               ...prev,
                                      [material.id]: selectedQuantity - 1
                                    }));
                                  }
                                }}
                                disabled={selectedQuantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                           </Button>
                                                       <Input
                                id={`qty-${material.id}`}
                              type="number"
                                value={selectedQuantity}
                              onChange={(e) => {
                                  e.stopPropagation();
                                  const value = parseInt(e.target.value) || 0;
                                setSelectedMaterials(prev => ({
                                  ...prev,
                                  [material.id]: value
                                }));
                              }}
                                className="w-16 h-8 text-center text-xs"
                                min="0"
                                max={material.currentStock}
                            />
                           <Button
                             size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (selectedQuantity < material.currentStock) {
                                    setSelectedMaterials(prev => ({
                               ...prev,
                                      [material.id]: selectedQuantity + 1
                                    }));
                                  }
                                }}
                                disabled={selectedQuantity >= material.currentStock}
                              >
                                <Plus className="w-3 h-3" />
                           </Button>
                         </div>
                          </div>
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Total Cost:</span>
                            <span className="font-medium">₹{(selectedQuantity * material.cost).toLocaleString()}</span>
                          </div>

                          {isInsufficient && (
                            <div className="p-2 bg-red-100 rounded text-red-700 text-xs">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              Insufficient stock! Need {selectedQuantity - material.currentStock} more {material.unit}
                            </div>
                         )}
                       </div>
                        )}
                    </CardContent>
                  </Card>
                );
              })}
                   </div>

            {/* Selected Materials Summary */}
            {Object.keys(selectedMaterials).length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">Selected Materials Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(selectedMaterials).map(([materialId, quantity]) => {
                      const material = rawMaterials.find(m => m.id === materialId);
                      if (!material) return null;
                      
                      const totalCost = quantity * material.cost;
                      const isInsufficient = quantity > material.currentStock;
                      
                      return (
                        <div key={materialId} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              isInsufficient ? 'bg-red-500' : 'bg-green-500'
                            }`} />
                            <div>
                              <div className="font-medium">{material.name}</div>
                              <div className="text-sm text-muted-foreground">{material.brand}</div>
                 </div>
             </div>
                          <div className="text-right">
                            <div className="font-medium">{quantity} {material.unit}</div>
                            <div className="text-sm text-muted-foreground">₹{totalCost.toLocaleString()}</div>
          </div>
                        </div>
                      );
                    })}
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total Cost:</span>
                      <span className="font-bold text-lg">
                        ₹{Object.entries(selectedMaterials).reduce((total, [materialId, quantity]) => {
                          const material = rawMaterials.find(m => m.id === materialId);
                          return total + (quantity * (material?.cost || 0));
                        }, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Material Alerts */}
            {(() => {
              const insufficientMaterials = Object.entries(selectedMaterials).filter(([materialId, quantity]) => {
                const material = rawMaterials.find(m => m.id === materialId);
                return material && quantity > material.currentStock;
              });

              if (insufficientMaterials.length > 0) {
                return (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h4 className="font-medium text-red-800">Material Shortage Alert</h4>
                      </div>
                      <p className="text-red-700 text-sm mb-3">
                        The following materials have insufficient stock:
                      </p>
                      <div className="space-y-1">
                        {insufficientMaterials.map(([materialId, quantity]) => {
                          const material = rawMaterials.find(m => m.id === materialId);
                          if (!material) return null;
                          const shortage = quantity - material.currentStock;
                          return (
                            <div key={materialId} className="flex justify-between text-sm">
                              <span>{material.name}</span>
                              <span className="font-medium">Shortage: {shortage} {material.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Order Materials
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Adjust Quantities
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>
                {Object.keys(selectedMaterials).length} material(s) selected • 
                Total: ₹{Object.entries(selectedMaterials).reduce((total, [materialId, quantity]) => {
                  const material = rawMaterials.find(m => m.id === materialId);
                  return total + (quantity * (material?.cost || 0));
                }, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsMaterialSelectionOpen(false)}>
              Cancel
            </Button>
              <Button 
                onClick={handleMaterialSelectionConfirm}
                disabled={Object.keys(selectedMaterials).length === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Selection
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Step Completion Dialog */}
      <Dialog open={isStepCompletionOpen} onOpenChange={setIsStepCompletionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Complete Step {selectedStep?.id}: {selectedStep?.name}
            </DialogTitle>
            <DialogDescription>
              Record the actual output, waste, and defects for this production step.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="actualOutput">Actual Output</Label>
              <Input
                id="actualOutput"
                type="number"
                value={stepCompletionData.actualOutput}
                onChange={(e) => setStepCompletionData(prev => ({
                  ...prev,
                  actualOutput: parseInt(e.target.value) || 0
                }))}
                  placeholder="Number of pieces produced"
              />
            </div>
              <div>
                <Label htmlFor="waste">Waste</Label>
                <Input
                  id="waste"
                  type="number"
                  value={stepCompletionData.waste}
                  onChange={(e) => setStepCompletionData(prev => ({
                    ...prev,
                    waste: parseInt(e.target.value) || 0
                  }))}
                  placeholder="Waste quantity"
                />
              </div>
            </div>

              <div>
              <Label htmlFor="defective">Defective Pieces</Label>
                <Input
                  id="defective"
                  type="number"
                  value={stepCompletionData.defective}
                  onChange={(e) => setStepCompletionData(prev => ({
                    ...prev,
                    defective: parseInt(e.target.value) || 0
                  }))}
                placeholder="Number of defective pieces"
                />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={stepCompletionData.notes}
                onChange={(e) => setStepCompletionData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                placeholder="Additional notes about this step completion..."
                rows={3}
              />
            </div>

            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedStep?.expectedOutput ? 
                        Math.round((stepCompletionData.actualOutput / selectedStep.expectedOutput) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Yield Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {stepCompletionData.actualOutput}
                    </div>
                    <div className="text-sm text-muted-foreground">Good Pieces</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {stepCompletionData.defective + stepCompletionData.waste}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Loss</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStepCompletionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStepCompletionConfirm}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Quality Inspection Dialog */}
      <Dialog open={isInspectionOpen} onOpenChange={setIsInspectionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Quality Inspection & Individual Product Creation
            </DialogTitle>
            <DialogDescription>
              Create individual products with unique IDs and QR codes. Complete the quality inspection for each piece.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inspector">Inspector Name</Label>
                <Input
                  id="inspector"
                  value={inspectionData.inspector}
                  onChange={(e) => setInspectionData(prev => ({
                    ...prev,
                    inspector: e.target.value
                  }))}
                  placeholder="Enter inspector name"
                />
              </div>
              <div>
                <Label htmlFor="inspectionDate">Inspection Date</Label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={inspectionData.inspectionDate}
                  onChange={(e) => setInspectionData(prev => ({
                    ...prev,
                    inspectionDate: e.target.value
                  }))}
                />
              </div>
            </div>
            
              <div>
              <Label htmlFor="qualityGrade">Overall Quality Grade</Label>
                <Select
                  value={inspectionData.qualityGrade}
                  onValueChange={(value) => setInspectionData(prev => ({
                    ...prev,
                    qualityGrade: value
                  }))}
                >
                  <SelectTrigger>
                  <SelectValue placeholder="Select quality grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+ (Excellent)</SelectItem>
                    <SelectItem value="A">A (Very Good)</SelectItem>
                    <SelectItem value="B">B (Good)</SelectItem>
                  <SelectItem value="C">C (Acceptable)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
            <div>
              <Label htmlFor="inspectionNotes">Inspection Notes</Label>
              <Textarea
                id="inspectionNotes"
                value={inspectionData.inspectionNotes}
                onChange={(e) => setInspectionData(prev => ({
                  ...prev,
                  inspectionNotes: e.target.value
                }))}
                placeholder="General inspection notes..."
                rows={3}
              />
          </div>

            {/* Individual Products Table */}
             <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Individual Products</h3>
                <Button
                  onClick={() => {
                    const newProduct: IndividualProduct = {
                      id: `IND${Date.now()}`,
                      qrCode: `QR-${product?.batchNumber}-${String(inspectionData.individualProducts.length + 1).padStart(3, '0')}`,
                      productId: product?.id || "",
                      manufacturingDate: new Date().toISOString().split('T')[0],
                      materialsUsed: selectedStep?.materials || [],
                      finalDimensions: "",
                      finalWeight: "",
                      finalThickness: "",
                      finalPileHeight: "",
                      qualityGrade: inspectionData.qualityGrade || "A",
                      inspector: inspectionData.inspector,
                      notes: "",
                      status: "available"
                    };
                    setInspectionData(prev => ({
                      ...prev,
                      individualProducts: [...prev.individualProducts, newProduct]
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
               </Button>
           </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">QR Code</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dimensions</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Weight</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quality</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectionData.individualProducts.map((item, index) => (
                        <tr key={item.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{item.id}</td>
                          <td className="px-4 py-3 text-sm font-mono">{item.qrCode}</td>
                          <td className="px-4 py-3">
                   <Input
                              value={item.finalDimensions}
                              onChange={(e) => {
                                const newProducts = [...inspectionData.individualProducts];
                                newProducts[index].finalDimensions = e.target.value;
                                setInspectionData(prev => ({
                       ...prev,
                                  individualProducts: newProducts
                                }));
                              }}
                              placeholder="e.g., 8x10ft"
                              className="w-24 h-8 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3">
                   <Input
                              value={item.finalWeight}
                              onChange={(e) => {
                                const newProducts = [...inspectionData.individualProducts];
                                newProducts[index].finalWeight = e.target.value;
                                setInspectionData(prev => ({
                       ...prev,
                                  individualProducts: newProducts
                                }));
                              }}
                              placeholder="e.g., 45kg"
                              className="w-20 h-8 text-xs"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={item.qualityGrade}
                              onValueChange={(value) => {
                                const newProducts = [...inspectionData.individualProducts];
                                newProducts[index].qualityGrade = value;
                                setInspectionData(prev => ({
                                  ...prev,
                                  individualProducts: newProducts
                                }));
                              }}
                            >
                              <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={item.status}
                              onValueChange={(value) => {
                                const newProducts = [...inspectionData.individualProducts];
                                newProducts[index].status = value as "available" | "damaged" | "sold";
                                setInspectionData(prev => ({
                                  ...prev,
                                  individualProducts: newProducts
                                }));
                              }}
                            >
                              <SelectTrigger className="w-24 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="damaged">Damaged</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3">
                         <Button 
                           size="sm"
                              variant="outline"
                              onClick={() => {
                                const newProducts = inspectionData.individualProducts.filter((_, i) => i !== index);
                                setInspectionData(prev => ({
                                  ...prev,
                                  individualProducts: newProducts
                                }));
                              }}
                           className="text-red-600 hover:text-red-700"
                         >
                              <Trash2 className="w-3 h-3" />
                         </Button>
                          </td>
                        </tr>
                 ))}
                    </tbody>
                  </table>
               </div>
               </div>
             </div>
           </div>

           <DialogFooter>
            <Button variant="outline" onClick={() => setIsInspectionOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInspectionComplete}
              disabled={inspectionData.individualProducts.length === 0}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Inspection
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 }

 
