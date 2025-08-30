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
  Search, Filter, Info
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

const statusStyles = {
  "planning": "bg-muted text-muted-foreground",
  "active": "bg-blue-500 text-white",
  "paused": "bg-yellow-500 text-white",
  "completed": "bg-green-500 text-white",
  "issue": "bg-red-500 text-white"
};

const stepStatusStyles = {
  "pending": "bg-muted text-muted-foreground",
  "active": "bg-blue-500 text-white",
  "completed": "bg-green-500 text-white",
  "issue": "bg-red-500 text-white"
};

const materialStatusStyles = {
  "in-stock": "bg-green-100 text-green-800",
  "low-stock": "bg-yellow-100 text-yellow-800",
  "out-of-stock": "bg-red-100 text-red-800"
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
  const [individualProductsData, setIndividualProductsData] = useState<IndividualProduct[]>([]);
  const [isStepManagementOpen, setIsStepManagementOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ProductionStep | null>(null);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);

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

  // Handle step activation with material selection
  const handleStepActivate = (step: ProductionStep) => {
    setSelectedStep(step);
    
    // Auto-fill materials based on production history
    const autoMaterials = getAutoFillMaterials(step.id);
    setSelectedMaterials(autoMaterials);
    setIsMaterialSelectionOpen(true);
  };

  // Handle material selection confirmation
  const handleMaterialSelectionConfirm = () => {
    if (!selectedStep) return;

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

    // Calculate expected output based on step
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

  // Handle step completion
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

    // Update raw material inventory (reduce stock based on materials used)
    const stepMaterials = selectedStep.materials;
    stepMaterials.forEach(material => {
      const rawMaterial = rawMaterials.find(rm => rm.id === material.materialId);
      if (rawMaterial) {
        // In a real app, this would be an API call to update inventory
        console.log(`Reducing ${material.usedQuantity} ${material.unit} of ${material.materialName} from inventory`);
        // For demo, we'll just log the reduction
      }
    });

    setProduct(prev => {
      if (!prev) return prev;
      
      const updatedSteps = prev.steps.map(step => {
        if (step.id === selectedStep.id) {
          return {
            ...step,
            status: "completed" as const,
            progress: 100,
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
      
      // If all steps completed, mark product as completed
      const status = completedSteps === prev.totalSteps ? "completed" as const : prev.status;

      return {
        ...prev,
        steps: updatedSteps,
        progress,
        currentStep,
        status,
        actualCompletion: status === "completed" ? new Date().toISOString().split('T')[0] : prev.actualCompletion
      };
    });

    setIsStepCompletionOpen(false);
    setStepCompletionData({ actualOutput: 0, waste: 0, defective: 0, notes: "" });
  };

  // Handle inspection
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
        setIndividualProductsData(product.individualProducts);
        setInspectionData({
          inspector: step.inspector || "",
          inspectionDate: step.inspectionDate || new Date().toISOString().split('T')[0],
          inspectionNotes: step.inspectionNotes || "",
          qualityGrade: "A",
          individualProducts: product.individualProducts
        });
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
        setIndividualProductsData(individualProducts);
      }
      setShowIndividualProducts(true);
    } else {
      setIsInspectionOpen(true);
    }
  };

  // Handle inspection confirmation
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

  // Generate QR code from custom ID
  const generateQRFromID = (customId: string) => {
    if (!customId.trim()) return "";
    // Create a unique QR code based on the custom ID
    return `QR-${product.batchNumber}-${customId.toUpperCase().replace(/\s+/g, '-')}`;
  };

  // Step Form Component
  function StepForm({ 
    step, 
    onSave, 
    onCancel 
  }: { 
    step: ProductionStep | null; 
    onSave: (data: { name: string; description: string }) => void; 
    onCancel: () => void; 
  }) {
    const [stepData, setStepData] = useState({
      name: step?.name || "",
      description: step?.description || ""
    });

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="stepName">Step Name</Label>
          <Input
            id="stepName"
            value={stepData.name}
            onChange={(e) => setStepData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Punching, Dyeing, Cutting"
          />
        </div>
        <div>
          <Label htmlFor="stepDescription">Description</Label>
          <Textarea
            id="stepDescription"
            value={stepData.description}
            onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what happens in this step..."
            className="min-h-[80px]"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(stepData)}
            disabled={!stepData.name.trim()}
          >
            {step ? 'Update Step' : 'Add Step'}
          </Button>
        </DialogFooter>
      </div>
    );
  }

  // Excel-like Table Component
  function ExcelLikeTable({ 
    data, 
    onDataChange 
  }: { 
    data: IndividualProduct[]; 
    onDataChange: (data: IndividualProduct[]) => void; 
  }) {
    const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleCellClick = (rowIndex: number, field: keyof IndividualProduct) => {
      setEditingCell({ row: rowIndex, col: field });
      setEditValue(String(data[rowIndex][field] || ""));
    };

    const handleCellSave = () => {
      if (editingCell) {
        const newData = [...data];
        const { row, col } = editingCell;
        newData[row] = { ...newData[row], [col]: editValue };
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
      const newRow: IndividualProduct = {
        id: `IND${Date.now()}_${data.length + 1}`,
        qrCode: "",
        productId: product?.productId || product?.id || "",
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
      onDataChange([...data, newRow]);
    };

    const removeRow = (index: number) => {
      const newData = data.filter((_, i) => i !== index);
      onDataChange(newData);
    };

    const columns = [
      { key: 'id', label: 'Custom ID', width: 'w-32' },
      { key: 'qrCode', label: 'QR Code', width: 'w-40' },
      { key: 'manufacturingDate', label: 'Date', width: 'w-32' },
      { key: 'finalDimensions', label: 'Dimensions', width: 'w-40' },
      { key: 'finalWeight', label: 'Weight', width: 'w-24' },
      { key: 'finalThickness', label: 'Thickness', width: 'w-28' },
      { key: 'finalPileHeight', label: 'Pile Height', width: 'w-28' },
      { key: 'qualityGrade', label: 'Grade', width: 'w-20' },
      { key: 'status', label: 'Status', width: 'w-24' },
      { key: 'notes', label: 'Notes', width: 'w-40' }
    ];

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-100 border-b">
          <div className="flex">
            <div className="w-12 bg-gray-200 border-r flex items-center justify-center text-xs font-medium text-gray-600">
              #
            </div>
            {columns.map((col) => (
              <div key={col.key} className={`${col.width} p-2 border-r text-xs font-medium text-gray-700`}>
                {col.label}
              </div>
            ))}
            <div className="w-16 p-2 text-xs font-medium text-gray-700">
              Actions
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="max-h-96 overflow-y-auto">
          {data.map((row, rowIndex) => (
            <div key={row.id} className="flex border-b hover:bg-gray-50">
              <div className="w-12 bg-gray-50 border-r flex items-center justify-center text-xs text-gray-600">
                {rowIndex + 1}
              </div>
              {columns.map((col) => (
                <div key={col.key} className={`${col.width} p-2 border-r text-xs`}>
                  {editingCell?.row === rowIndex && editingCell?.col === col.key ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCellSave}
                      onKeyDown={handleKeyDown}
                      className="h-6 text-xs p-1"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="h-6 flex items-center cursor-pointer hover:bg-blue-50 px-1 rounded"
                      onClick={() => handleCellClick(rowIndex, col.key as keyof IndividualProduct)}
                    >
                      {col.key === 'materialsUsed' 
                        ? Array.isArray(row[col.key as keyof IndividualProduct]) 
                          ? `${(row[col.key as keyof IndividualProduct] as ProductionMaterial[]).length} materials`
                          : ""
                        : String(row[col.key as keyof IndividualProduct] || "")}
                    </div>
                  )}
                </div>
              ))}
              <div className="w-16 p-2 flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRow(rowIndex)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        <div className="p-2 bg-gray-50 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={addRow}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </Button>
        </div>
      </div>
    );
  }

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

  // Handle individual product update
  const handleIndividualProductUpdate = (index: number, field: keyof IndividualProduct, value: any) => {
    setIndividualProductsData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // If updating the ID field, also update the QR code
      if (field === 'id' && value) {
        updated[index].qrCode = generateQRFromID(value);
      }
      
      return updated;
    });
  };

  // Handle individual products completion
  const handleIndividualProductsComplete = () => {
    // Calculate available pieces (excluding damaged ones)
    const availablePieces = individualProductsData.filter(p => p.status === 'available').length;
    const damagedPieces = individualProductsData.filter(p => p.status === 'damaged').length;

    // Update the main Products page inventory
    const productionResult = {
      productId: product.productId || product.id,
      productName: product.productName,
      newQuantity: availablePieces, // Only count available pieces
      totalProduced: individualProductsData.length, // Total pieces produced
      damagedPieces: damagedPieces,
      individualProducts: individualProductsData,
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
        individualProducts: individualProductsData
      };
    });

    setShowIndividualProducts(false);
    
    // Show detailed success message
    const successMessage = `Production completed successfully!

📦 Production Summary:
• Product: ${product.productName}
• Batch: ${product.batchNumber}
• Total Pieces Produced: ${individualProductsData.length}
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

  // Handle purchase material
  const handlePurchaseMaterial = (material: RawMaterial) => {
    // Navigate to Materials page to purchase
    navigate('/materials', { 
      state: { 
        purchaseMaterial: {
          materialId: material.id,
          materialName: material.name,
          supplier: material.supplier,
          unit: material.unit,
          cost: material.cost
        }
      }
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Clean Header Layout */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/production')} 
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">
              {product.productName}
            </h1>
            <Badge variant="outline" className="text-xs">
              {product.batchNumber}
            </Badge>
            <Badge className={`text-xs ${
              product.status === "completed" ? "bg-green-100 text-green-800" :
              product.status === "active" ? "bg-blue-100 text-blue-800" :
              product.status === "paused" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {product.status}
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setIsStepManagementOpen(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Cog className="w-4 h-4" />
          Manage Steps
        </Button>
      </div>



      {/* Horizontal Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Production Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Enhanced Step Navigation */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-muted rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(product.steps.filter(s => s.status === "completed").length / product.steps.length) * 100}%` }}
                />
              </div>
              
              {/* Steps */}
              <div className="relative flex items-center justify-between">
                                 {product.steps.map((step, index) => {
                   // Allow access to completed steps and current active step
                   const isStepAccessible = step.status === "completed" || 
                                          step.status === "active" || 
                                          (step.status === "pending" && 
                                           product.steps.slice(0, index).every(s => s.status === "completed"));
                   
                   // Only lock future steps that haven't been reached yet
                   const isStepLocked = step.status === "pending" && 
                                      product.steps.slice(0, index).some(s => s.status !== "completed");
                   
                   const isCurrentStep = currentStepView === step.id;
                   const isCompleted = step.status === "completed";
                   const isActive = step.status === "active";
                   
                   return (
                     <div key={step.id} className="flex flex-col items-center relative z-10">
                       {/* Step Circle */}
                       <div 
                         className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${
                           isStepLocked 
                             ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                             : "cursor-pointer hover:scale-105"
                         } ${
                           isCompleted 
                             ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-200" 
                             : isActive 
                             ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200 animate-pulse" 
                             : isCurrentStep 
                             ? "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-200" 
                             : "bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600"
                         }`}
                         onClick={() => !isStepLocked && setCurrentStepView(step.id)}
                       >
                         {isCompleted ? (
                           <CheckCircle className="w-8 h-8" />
                         ) : (
                           <span>{step.id}</span>
                         )}
                       </div>
                      
                      {/* Step Name */}
                      <div className="mt-3 text-center max-w-24">
                        <div className={`text-sm font-medium transition-colors ${
                          isCurrentStep ? "text-purple-600" : 
                          isCompleted ? "text-green-600" : 
                          isActive ? "text-blue-600" : 
                          "text-gray-500"
                        }`}>
                          {step.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {step.status === "completed" ? "Done" :
                           step.status === "active" ? "In Progress" :
                           step.status === "pending" ? "Pending" : "Issue"}
                        </div>
                      </div>
                      
                      {/* Step Status Indicator */}
                      {isActive && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Progress Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Production Progress</h3>
                    <p className="text-sm text-gray-600">Track your manufacturing journey</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{product.progress}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
              
              <Progress value={product.progress} className="h-4 mb-4" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-2xl font-bold text-blue-600">
                    {product.steps.filter(s => s.status === "completed").length}
                  </div>
                  <div className="text-xs text-gray-600">Steps Done</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-2xl font-bold text-purple-600">
                    {product.steps.filter(s => s.status === "active").length}
                  </div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </div>
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-2xl font-bold text-gray-600">
                    {product.steps.filter(s => s.status === "pending").length}
                  </div>
                  <div className="text-xs text-gray-600">Remaining</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Started: {new Date(product.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Expected: {new Date(product.expectedCompletion).toLocaleDateString()}</span>
                  </div>
                  {product.actualCompletion && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Completed: {new Date(product.actualCompletion).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

            {/* Enhanced Current Step Detail */}
            {currentStep && (
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className={`${
                  currentStep.status === "completed" ? "bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200" :
                  currentStep.status === "active" ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200" :
                  "bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                        currentStep.status === "completed" ? "bg-gradient-to-br from-green-500 to-green-600" :
                        currentStep.status === "active" ? "bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse" :
                        "bg-gradient-to-br from-gray-400 to-gray-500"
                      }`}>
                        {currentStep.status === "completed" ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          currentStep.id
                        )}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-4 text-xl">
                          {currentStep.name}
                          <Badge className={`${
                            currentStep.status === "completed" ? "bg-green-100 text-green-800 border-green-200" :
                            currentStep.status === "active" ? "bg-blue-100 text-blue-800 border-blue-200" :
                            "bg-gray-100 text-gray-800 border-gray-200"
                          }`}>
                            {currentStep.status === "completed" ? "✅ Completed" :
                             currentStep.status === "active" ? "🔄 In Progress" :
                             currentStep.status === "pending" ? "⏳ Pending" : "⚠️ Issue"}
                          </Badge>
                        </CardTitle>
                        <p className="text-gray-600 mt-2 max-w-2xl">{currentStep.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{currentStep.progress}%</div>
                      <div className="text-sm text-gray-600">
                        {currentStep.actualOutput ? `${currentStep.actualOutput}/` : ""}{currentStep.expectedOutput} pieces
                      </div>
                      {currentStep.startDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Started: {new Date(currentStep.startDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>



                <CardContent className="p-8">
                  {/* Enhanced Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Step Progress</span>
                      <span className="text-sm font-medium text-gray-900">{currentStep.progress}%</span>
                    </div>
                    <Progress value={currentStep.progress} className="h-3" />
                  </div>

                  {/* Enhanced Step Actions */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Step Actions</h4>
                    <div className="flex items-center gap-4">
                      {currentStep.status === "pending" && (
                        <Button 
                          onClick={() => handleStepActivate(currentStep)}
                          disabled={product.steps.slice(0, product.steps.indexOf(currentStep)).some(s => s.status !== "completed")}
                          className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Play className="w-5 h-5" />
                          Start Process
                        </Button>
                      )}
                      
                      {currentStep.status === "active" && (
                        <Button 
                          onClick={() => handleStepComplete(currentStep)}
                          className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Complete Step
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        onClick={() => handleInspection(currentStep)}
                        disabled={currentStep.status === "pending" && 
                                 product.steps.slice(0, product.steps.indexOf(currentStep)).some(s => s.status !== "completed")}
                        className="flex items-center gap-3 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      >
                        <FileText className="w-5 h-5" />
                        Quality Inspection
                      </Button>
                    </div>
                    
                    {/* Step Access Control Message */}
                    {currentStep.status === "pending" && 
                     product.steps.slice(0, product.steps.indexOf(currentStep)).some(s => s.status !== "completed") && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3 text-yellow-800">
                          <AlertTriangle className="w-5 h-5" />
                          <div>
                            <div className="font-medium">Step Locked</div>
                            <div className="text-sm text-yellow-700">
                              Complete all previous steps before accessing this step. 
                              Current progress: {product.steps.filter(s => s.status === "completed").length} of {product.totalSteps} steps completed.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

            {/* Materials Used */}
            {currentStep.materials.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Materials Used</h4>
                <div className="grid gap-3">
                  {currentStep.materials.map((material, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{material.materialName}</div>
                        <div className="text-sm text-muted-foreground">
                          {material.usedQuantity}/{material.requiredQuantity} {material.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">₹{material.cost.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{material.supplier}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step Details */}
            {currentStep.status === "completed" && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Step Completed</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Actual Output:</span>
                    <span className="ml-2 font-medium">{currentStep.actualOutput} pieces</span>
                  </div>
                  {currentStep.waste && (
                    <div>
                      <span className="text-muted-foreground">Waste:</span>
                      <span className="ml-2 font-medium text-warning">{currentStep.waste} units</span>
                    </div>
                  )}
                  {currentStep.defective && (
                    <div>
                      <span className="text-muted-foreground">Defective:</span>
                      <span className="ml-2 font-medium text-destructive">{currentStep.defective} pieces</span>
                    </div>
                  )}
                  {currentStep.inspector && (
                    <div>
                      <span className="text-muted-foreground">Inspector:</span>
                      <span className="ml-2 font-medium">{currentStep.inspector}</span>
                    </div>
                  )}
                </div>
                {currentStep.notes && (
                  <div className="mt-2">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="text-sm mt-1">{currentStep.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Material Selection Dialog */}
      <Dialog open={isMaterialSelectionOpen} onOpenChange={setIsMaterialSelectionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Materials for {selectedStep?.name}</DialogTitle>
            <DialogDescription>
              Choose materials required for this production step. Materials are auto-filled based on production history.
            </DialogDescription>
          </DialogHeader>
          
          {/* Material Search and Filter */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Search materials, suppliers, or brands..." 
                    className="pl-10"
                    value={materialSearchTerm}
                    onChange={(e) => setMaterialSearchTerm(e.target.value)}
                  />
                </div>
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

                         {/* Materials List */}
             <div className="space-y-3 max-h-96 overflow-y-auto">
               {/* Show Step Outputs from Previous Steps */}
               {selectedStep && selectedStep.id > 1 && (() => {
                 const previousStep = product.steps.find(s => s.id === selectedStep.id - 1);
                 if (previousStep && previousStep.status === "completed" && previousStep.actualOutput) {
                   return (
                     <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                       <div className="flex items-center gap-3 mb-2">
                         <Package2 className="w-5 h-5 text-blue-600" />
                         <div className="font-medium text-blue-900">Input from Step {previousStep.id} ({previousStep.name})</div>
                       </div>
                       <div className="text-sm text-blue-700">
                         <div>Output from previous step: <strong>{previousStep.actualOutput} pieces</strong></div>
                         <div>This will be automatically used as input for {selectedStep.name}</div>
                       </div>
                     </div>
                   );
                 }
                 return null;
               })()}
               
               {/* Raw Materials */}
               {filteredMaterials.map((material) => {
                 const requestedQuantity = selectedMaterials[material.id] || 0;
                 const isInsufficientStock = requestedQuantity > material.currentStock && material.status !== "out-of-stock";
                 
                 return (
                   <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg">
                     <div className="flex-1">
                       <div className="flex items-center gap-3">
                         <div className="font-medium">{material.name}</div>
                         <Badge className={materialStatusStyles[material.status]}>
                           {material.status}
                         </Badge>
                       </div>
                       <div className="text-sm text-muted-foreground mt-1">
                         <div>Brand: {material.brand} • Supplier: {material.supplier}</div>
                         <div>Available: {material.currentStock} {material.unit} • ₹{material.cost} per {material.unit}</div>
                         <div>Location: {material.location}</div>
                         {material.description && (
                           <div className="mt-1">{material.description}</div>
                         )}
                       </div>
                       {isInsufficientStock && (
                         <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                           <div className="flex items-center gap-2 text-yellow-800">
                             <AlertTriangle className="w-4 h-4" />
                             <span className="font-medium">Insufficient Stock</span>
                           </div>
                           <div className="text-yellow-700 mt-1">
                             Requested: {requestedQuantity} {material.unit} • Available: {material.currentStock} {material.unit}
                           </div>
                           <div className="text-yellow-700">
                             Need to purchase {requestedQuantity - material.currentStock} more {material.unit}
                           </div>
                         </div>
                       )}
                     </div>
                                     <div className="flex items-center gap-3">
                     {material.status === "out-of-stock" ? (
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handlePurchaseMaterial(material)}
                         className="flex items-center gap-2"
                       >
                         <ShoppingCart className="w-4 h-4" />
                         Purchase
                       </Button>
                     ) : (
                       <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setSelectedMaterials(prev => ({
                               ...prev,
                               [material.id]: Math.max(0, (prev[material.id] || 0) - 1)
                             }))}
                           >
                             <Minus className="w-4 h-4" />
                           </Button>
                                                       <Input
                              type="number"
                              min="0"
                              className="w-16 text-center"
                              value={selectedMaterials[material.id] || ""}
                              onChange={(e) => {
                                const value = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                                setSelectedMaterials(prev => ({
                                  ...prev,
                                  [material.id]: value
                                }));
                              }}
                            />
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setSelectedMaterials(prev => ({
                               ...prev,
                               [material.id]: (prev[material.id] || 0) + 1
                             }))}
                           >
                             <Plus className="w-4 h-4" />
                           </Button>
                         </div>
                         {isInsufficientStock && (
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => handlePurchaseMaterial(material)}
                             className="flex items-center gap-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                           >
                             <ShoppingCart className="w-4 h-4" />
                             Purchase Additional
                           </Button>
                         )}
                       </div>
                        )}
                   </div>
                 </div>
               )})}
             </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaterialSelectionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMaterialSelectionConfirm}>
              Start Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step Completion Dialog */}
      <Dialog open={isStepCompletionOpen} onOpenChange={setIsStepCompletionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete {selectedStep?.name}</DialogTitle>
            <DialogDescription>
              Record the actual output and any waste or defects.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="actualOutput">Actual Output (pieces)</Label>
              <Input
                id="actualOutput"
                type="number"
                value={stepCompletionData.actualOutput}
                onChange={(e) => setStepCompletionData(prev => ({
                  ...prev,
                  actualOutput: parseInt(e.target.value) || 0
                }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="waste">Waste (units)</Label>
                <Input
                  id="waste"
                  type="number"
                  value={stepCompletionData.waste}
                  onChange={(e) => setStepCompletionData(prev => ({
                    ...prev,
                    waste: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="defective">Defective (pieces)</Label>
                <Input
                  id="defective"
                  type="number"
                  value={stepCompletionData.defective}
                  onChange={(e) => setStepCompletionData(prev => ({
                    ...prev,
                    defective: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
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
                placeholder="Enter any notes about this step..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStepCompletionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStepCompletionConfirm}>
              Complete Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspection Dialog */}
      <Dialog open={isInspectionOpen} onOpenChange={setIsInspectionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quality Inspection - {selectedStep?.name}</DialogTitle>
            <DialogDescription>
              Record inspection details and quality assessment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
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
            
            {selectedStep?.id === 5 && (
              <div>
                <Label htmlFor="qualityGrade">Quality Grade</Label>
                <Select
                  value={inspectionData.qualityGrade}
                  onValueChange={(value) => setInspectionData(prev => ({
                    ...prev,
                    qualityGrade: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+ (Excellent)</SelectItem>
                    <SelectItem value="A">A (Very Good)</SelectItem>
                    <SelectItem value="B">B (Good)</SelectItem>
                    <SelectItem value="C">C (Average)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="inspectionNotes">Inspection Notes</Label>
              <Textarea
                id="inspectionNotes"
                value={inspectionData.inspectionNotes}
                onChange={(e) => setInspectionData(prev => ({
                  ...prev,
                  inspectionNotes: e.target.value
                }))}
                placeholder="Enter inspection findings and notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInspectionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInspectionConfirm}>
              Save Inspection
            </Button>
                     </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Individual Products Full Page View */}
       {showIndividualProducts && (
         <div className="space-y-6">
           {/* Header */}
           <div className="flex items-center justify-between">
             <div>
               <h2 className="text-2xl font-bold">Quality Inspection - Individual Products</h2>
               <p className="text-muted-foreground">
                 Fill in the details for each individual product piece. {individualProductsData.length} pieces need to be inspected.
               </p>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={() => setShowIndividualProducts(false)}>
                 <ArrowLeft className="w-4 h-4 mr-2" />
                 Back to Production
               </Button>
               <Button onClick={handleIndividualProductsComplete} className="bg-green-600 hover:bg-green-700">
                 <CheckCircle className="w-4 h-4 mr-2" />
                 Complete Production
               </Button>
             </div>
           </div>

           {/* Inspector Details */}
           <Card>
             <CardHeader>
               <CardTitle>Inspector Information</CardTitle>
             </CardHeader>
             <CardContent>
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
             </CardContent>
           </Card>

           {/* Excel-like Individual Products Table */}
           <Card>
             <CardHeader>
               <CardTitle>Individual Product Details</CardTitle>
               <p className="text-sm text-muted-foreground">
                 Click on any cell to edit. Press Enter to save, Escape to cancel. 
                 QR codes are auto-generated from Custom ID. Add or remove rows as needed.
               </p>
             </CardHeader>
             <CardContent>
               <ExcelLikeTable 
                 data={individualProductsData}
                 onDataChange={setIndividualProductsData}
               />
             </CardContent>
           </Card>

           {/* Summary */}
           <Card>
             <CardHeader>
               <CardTitle>Production Summary</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-4 gap-4">
                 <div className="text-center p-4 bg-blue-50 rounded-lg">
                   <div className="text-2xl font-bold text-blue-600">{individualProductsData.length}</div>
                   <div className="text-sm text-blue-700">Total Pieces</div>
                 </div>
                 <div className="text-center p-4 bg-green-50 rounded-lg">
                   <div className="text-2xl font-bold text-green-600">
                     {individualProductsData.filter(p => p.status === 'available').length}
                   </div>
                   <div className="text-sm text-green-700">Available</div>
                 </div>
                 <div className="text-center p-4 bg-yellow-50 rounded-lg">
                   <div className="text-2xl font-bold text-yellow-600">
                     {individualProductsData.filter(p => p.status === 'damaged').length}
                   </div>
                   <div className="text-sm text-yellow-700">Damaged</div>
                 </div>
                 <div className="text-center p-4 bg-purple-50 rounded-lg">
                   <div className="text-2xl font-bold text-purple-600">
                     {inspectionData.inspector ? 'Assigned' : 'Not Assigned'}
                   </div>
                   <div className="text-sm text-purple-700">Inspector</div>
                 </div>
               </div>
               <div className="mt-4 p-3 bg-muted rounded-lg">
                 <div className="text-sm">
                   <strong>Product:</strong> {product.productName} | 
                   <strong>Batch:</strong> {product.batchNumber} | 
                   <strong>Date:</strong> {inspectionData.inspectionDate}
                 </div>
               </div>
             </CardContent>
           </Card>
                    </div>
         )}

       {/* Step Management Dialog */}
       <Dialog open={isStepManagementOpen} onOpenChange={setIsStepManagementOpen}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Manage Production Steps</DialogTitle>
             <DialogDescription>
               Customize production steps for {product.productName}. Add, edit, or reorder steps as needed.
             </DialogDescription>
           </DialogHeader>
           
           <div className="space-y-6">
             {/* Current Steps */}
             <div>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-medium">Current Steps ({product.steps.length})</h3>
                 <Button onClick={() => setIsAddStepOpen(true)} className="flex items-center gap-2">
                   <Plus className="w-4 h-4" />
                   Add Step
                 </Button>
               </div>
               
               <div className="space-y-3">
                 {product.steps.map((step, index) => (
                   <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                     <div className="flex items-center gap-3 flex-1">
                       <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium text-sm">
                         {index + 1}
                       </div>
                       <div className="flex-1">
                         <h4 className="font-medium">{step.name}</h4>
                         <p className="text-sm text-muted-foreground">{step.description}</p>
                         {step.isCustomStep && (
                           <Badge variant="outline" className="text-xs mt-1">Custom Step</Badge>
                         )}
                       </div>
                     </div>
                     <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => {
                           setEditingStep(step);
                           setIsAddStepOpen(true);
                         }}
                       >
                         <Edit className="w-4 h-4" />
                       </Button>
                       {step.isCustomStep && (
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleDeleteStep(step.id)}
                           className="text-red-600 hover:text-red-700"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* Step Information */}
             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <h4 className="font-medium text-blue-900 mb-2">Step Management Information</h4>
               <div className="text-sm text-blue-700 space-y-1">
                 <div>• <strong>Default Steps:</strong> Cannot be deleted but can be edited</div>
                 <div>• <strong>Custom Steps:</strong> Can be added, edited, or deleted</div>
                 <div>• <strong>Step Order:</strong> Steps are executed in the order shown</div>
                 <div>• <strong>Product Memory:</strong> Steps are saved with the product for future production runs</div>
               </div>
             </div>
           </div>

           <DialogFooter>
             <Button variant="outline" onClick={() => setIsStepManagementOpen(false)}>
               Close
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Add/Edit Step Dialog */}
       <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>{editingStep ? 'Edit Step' : 'Add New Step'}</DialogTitle>
             <DialogDescription>
               {editingStep ? 'Modify the step details' : 'Add a new production step'}
             </DialogDescription>
           </DialogHeader>
           
           <StepForm 
             step={editingStep}
             onSave={(stepData) => {
               if (editingStep) {
                 handleEditStep(editingStep.id, stepData);
               } else {
                 handleAddStep(stepData);
               }
               setIsAddStepOpen(false);
               setEditingStep(null);
             }}
             onCancel={() => {
               setIsAddStepOpen(false);
               setEditingStep(null);
             }}
           />
         </DialogContent>
       </Dialog>
     </div>
   );
 }

 
