import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Minus, Calculator, AlertTriangle, Package, Clock, TrendingUp, 
  Factory, Save, ArrowLeft, CheckCircle, Settings, Target, BarChart3,
  Thermometer, Gauge, Timer, Zap, RefreshCw, Copy, QrCode, 
  ChevronRight, ChevronLeft, MoreHorizontal, Info, AlertCircle,
  MapPin, Ruler, Scale, Star, ShoppingCart, Package2, Search,
  Filter, Download, Upload, Bell, Eye, Edit, Trash2, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  availableStock: number;
  requiredQuantity: number;
  costPerUnit: number;
  category: string;
  supplier: string;
  minStockLevel: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

interface ProductionStep {
  id: string;
  name: string;
  description: string;
  materials: RawMaterial[];
  expectedOutput: number;
  estimatedTime: number;
  isCustomStep?: boolean;
  stepOrder?: number;
}

interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultSteps: ProductionStep[];
  materialRequirements: { [materialId: string]: number };
  estimatedCost: number;
  estimatedTime: number;
  imageUrl?: string;
}

// Enhanced raw materials with more realistic data
const mockRawMaterials: RawMaterial[] = [
  { 
    id: "1", 
    name: "Cotton Yarn (Premium)", 
    unit: "rolls", 
    availableStock: 500, 
    requiredQuantity: 0, 
    costPerUnit: 450, 
    category: "Yarn", 
    supplier: "Premium Textiles Ltd", 
    minStockLevel: 100,
    status: "in-stock"
  },
  { 
    id: "2", 
    name: "Synthetic Yarn", 
    unit: "rolls", 
    availableStock: 300, 
    requiredQuantity: 0, 
    costPerUnit: 380, 
    category: "Yarn", 
    supplier: "Synthetic Solutions", 
    minStockLevel: 80,
    status: "in-stock"
  },
  { 
    id: "3", 
    name: "Wool Yarn (Premium)", 
    unit: "rolls", 
    availableStock: 150, 
    requiredQuantity: 0, 
    costPerUnit: 650, 
    category: "Yarn", 
    supplier: "Wool Masters", 
    minStockLevel: 50,
    status: "in-stock"
  },
  { 
    id: "4", 
    name: "Red Dye (Industrial)", 
    unit: "liters", 
    availableStock: 85, 
    requiredQuantity: 0, 
    costPerUnit: 180, 
    category: "Dye", 
    supplier: "ColorChem Industries", 
    minStockLevel: 20,
    status: "in-stock"
  },
  { 
    id: "5", 
    name: "Blue Dye (Industrial)", 
    unit: "liters", 
    availableStock: 92, 
    requiredQuantity: 0, 
    costPerUnit: 190, 
    category: "Dye", 
    supplier: "ColorChem Industries", 
    minStockLevel: 20,
    status: "in-stock"
  },
  { 
    id: "6", 
    name: "Green Dye (Industrial)", 
    unit: "liters", 
    availableStock: 0, 
    requiredQuantity: 0, 
    costPerUnit: 200, 
    category: "Dye", 
    supplier: "ColorChem Industries", 
    minStockLevel: 20,
    status: "out-of-stock"
  },
  { 
    id: "7", 
    name: "Latex Solution", 
    unit: "liters", 
    availableStock: 120, 
    requiredQuantity: 0, 
    costPerUnit: 320, 
    category: "Chemical", 
    supplier: "ChemCorp Ltd", 
    minStockLevel: 30,
    status: "in-stock"
  },
  { 
    id: "8", 
    name: "Backing Cloth", 
    unit: "sqm", 
    availableStock: 300, 
    requiredQuantity: 0, 
    costPerUnit: 25, 
    category: "Fabric", 
    supplier: "FabricWorld", 
    minStockLevel: 100,
    status: "in-stock"
  },
  { 
    id: "9", 
    name: "Premium Backing Cloth", 
    unit: "sqm", 
    availableStock: 150, 
    requiredQuantity: 0, 
    costPerUnit: 35, 
    category: "Fabric", 
    supplier: "Premium Fabrics", 
    minStockLevel: 50,
    status: "in-stock"
  }
];

// Enhanced production steps with better descriptions
const productionSteps: ProductionStep[] = [
  {
    id: "1",
    name: "Material Preparation",
    description: "Prepare and organize raw materials for production. Check material quality and availability.",
    materials: [],
    expectedOutput: 0,
    estimatedTime: 120
  },
  {
    id: "2",
    name: "Punching/Weaving",
    description: "Create the base carpet structure through punching or weaving process. This is the foundation layer.",
    materials: [],
    expectedOutput: 0,
    estimatedTime: 480
  },
  {
    id: "3",
    name: "Dyeing Process",
    description: "Apply color and dye treatments to the carpet. Ensure color consistency and quality.",
    materials: [],
    expectedOutput: 0,
    estimatedTime: 360
  },
  {
    id: "4",
    name: "Cutting & Finishing",
    description: "Cut to size and apply final finishing touches. Quality check for dimensions and finish.",
    materials: [],
    expectedOutput: 0,
    estimatedTime: 240
  },
  {
    id: "5",
    name: "Quality Inspection",
    description: "Final quality check and inspection before completion. Generate individual product IDs and QR codes.",
    materials: [],
    expectedOutput: 0,
    estimatedTime: 120
  }
];

// Product templates for quick setup
const productTemplates: ProductTemplate[] = [
  {
    id: "template-1",
    name: "Traditional Persian Carpet",
    category: "Handmade",
    description: "Premium handcrafted Persian carpet with traditional patterns",
    defaultSteps: productionSteps,
    materialRequirements: {
      "1": 3, // Cotton Yarn (Premium) - 3 rolls per piece
      "4": 1.6, // Red Dye - 1.6 liters per piece
      "7": 2.4, // Latex Solution - 2.4 liters per piece
      "8": 6.5 // Backing Cloth - 6.5 sqm per piece
    },
    estimatedCost: 2500,
    estimatedTime: 1320, // 22 hours
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center"
  },
  {
    id: "template-2",
    name: "Modern Geometric Carpet",
    category: "Machine Made",
    description: "Contemporary geometric pattern carpet for modern interiors",
    defaultSteps: productionSteps,
    materialRequirements: {
      "2": 1.67, // Synthetic Yarn - 1.67 rolls per piece
      "5": 0.83, // Blue Dye - 0.83 liters per piece
      "7": 1.5, // Latex Solution - 1.5 liters per piece
      "8": 4.5 // Backing Cloth - 4.5 sqm per piece
    },
    estimatedCost: 1200,
    estimatedTime: 960, // 16 hours
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center"
  },
  {
    id: "template-3",
    name: "Luxury Wool Carpet",
    category: "Handmade",
    description: "Premium wool carpet with intricate designs and superior quality",
    defaultSteps: productionSteps,
    materialRequirements: {
      "3": 2.5, // Wool Yarn (Premium) - 2.5 rolls per piece
      "4": 1.2, // Red Dye - 1.2 liters per piece
      "7": 2.0, // Latex Solution - 2.0 liters per piece
      "9": 5.0 // Premium Backing Cloth - 5.0 sqm per piece
    },
    estimatedCost: 3500,
    estimatedTime: 1440, // 24 hours
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center"
  }
];

export default function NewBatch() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [batchDetails, setBatchDetails] = useState({
    productName: "",
    productType: "",
    batchSize: 100,
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    category: "",
    color: "",
    size: "",
    pattern: "",
    description: "",
    location: "Factory Floor 1",
    expectedCompletion: "",
    notes: ""
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [materials, setMaterials] = useState<RawMaterial[]>(mockRawMaterials);
  const [steps, setSteps] = useState<ProductionStep[]>(productionSteps);
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState("all");
  const [showMaterialSelection, setShowMaterialSelection] = useState(false);
  const [selectedStepForMaterials, setSelectedStepForMaterials] = useState<ProductionStep | null>(null);

  // Calculate material requirements based on template and batch size
  const calculateMaterialRequirements = () => {
    if (!selectedTemplate) return;
    
    const template = productTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const updatedMaterials = materials.map(material => ({
      ...material,
      requiredQuantity: (template.materialRequirements[material.id] || 0) * batchDetails.batchSize
    }));
    
    setMaterials(updatedMaterials);
  };

  // Calculate total cost
  const totalCost = materials.reduce((sum, material) => {
    return sum + (material.requiredQuantity * material.costPerUnit);
  }, 0);

  // Check material availability
  const materialAvailability = materials.map(material => {
    const shortage = material.requiredQuantity - material.availableStock;
        return {
      ...material,
      shortage: shortage > 0 ? shortage : 0,
      status: shortage > 0 ? "insufficient" : "sufficient"
        };
      });
      
  const insufficientMaterials = materialAvailability.filter(m => m.status === "insufficient");

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = productTemplates.find(t => t.id === templateId);
    if (template) {
      setBatchDetails(prev => ({
        ...prev,
        productName: template.name,
        category: template.category,
        description: template.description
      }));
      setSteps(template.defaultSteps);
      calculateMaterialRequirements();
    }
  };

  // Handle step completion
  const handleStepComplete = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
            } else {
      // Create production batch
      handleCreateBatch();
    }
  };

  // Handle batch creation
  const handleCreateBatch = () => {
    if (insufficientMaterials.length > 0) {
      toast({
        title: "Material Shortage",
        description: `Some materials are insufficient. Please check: ${insufficientMaterials.map(m => m.name).join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Production Batch Created",
      description: `Successfully created production batch for ${batchDetails.productName}`,
    });

    // Navigate to production detail page
    navigate('/production');
  };

  // Enhanced Step Indicator Component
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[
          { number: 1, title: "Basic Details", icon: Package },
          { number: 2, title: "Product Template", icon: Settings },
          { number: 3, title: "Material Planning", icon: Calculator },
          { number: 4, title: "Review & Create", icon: CheckCircle }
        ].map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isActive ? "bg-blue-500 border-blue-500 text-white" :
                isCompleted ? "bg-green-500 border-green-500 text-white" :
                "bg-gray-100 border-gray-300 text-gray-500"
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  isActive ? "text-blue-600" :
                  isCompleted ? "text-green-600" :
                  "text-gray-500"
                }`}>
                  {step.title}
                </div>
              </div>
              {index < 3 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                }`} />
              )}
            </div>
          );
        })}
      </div>
      <Progress value={(currentStep / 4) * 100} className="mt-4" />
    </div>
  );

  // Enhanced Material Card Component
  const MaterialCard = ({ material }: { material: RawMaterial & { shortage?: number; status?: string } }) => (
    <Card className={`relative overflow-hidden ${
      material.status === "insufficient" ? "border-red-200 bg-red-50" : "hover:shadow-md"
    }`}>
      {material.status === "insufficient" && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
      )}
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">{material.name}</h3>
            <p className="text-sm text-muted-foreground">{material.category}</p>
          </div>
          <Badge className={
            material.status === "insufficient" ? "bg-red-100 text-red-800" :
            material.status === "low-stock" ? "bg-yellow-100 text-yellow-800" :
            "bg-green-100 text-green-800"
          }>
            {material.status === "insufficient" ? "Insufficient" :
             material.status === "low-stock" ? "Low Stock" : "In Stock"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Required:</span>
            <div className="font-semibold">{material.requiredQuantity} {material.unit}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Available:</span>
            <div className="font-semibold">{material.availableStock} {material.unit}</div>
          </div>
        </div>
        
        {material.shortage && material.shortage > 0 && (
          <div className="mt-3 p-2 bg-red-100 rounded text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Shortage: {material.shortage} {material.unit}
          </div>
        )}
        
        <div className="mt-3 text-sm">
          <span className="text-muted-foreground">Cost: </span>
          <span className="font-semibold">₹{(material.requiredQuantity * material.costPerUnit).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Create New Production Batch" 
        subtitle="Set up a new production batch with material planning and workflow configuration"
      />

      <StepIndicator />

      {/* Step 1: Basic Details */}
      {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
              Basic Product Details
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={batchDetails.productName}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={batchDetails.category} onValueChange={(value) => setBatchDetails(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Handmade">Handmade</SelectItem>
                    <SelectItem value="Machine Made">Machine Made</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={batchDetails.color}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Enter color"
                />
              </div>
              
              <div>
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={batchDetails.size}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, size: e.target.value }))}
                  placeholder="e.g., 8x10 feet"
                />
              </div>
              
              <div>
                <Label htmlFor="pattern">Pattern</Label>
                <Input
                  id="pattern"
                  value={batchDetails.pattern}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, pattern: e.target.value }))}
                  placeholder="Enter pattern"
                />
              </div>
              
              <div>
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={batchDetails.batchSize}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 0 }))}
                  placeholder="Number of pieces"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={batchDetails.priority} onValueChange={(value: any) => setBatchDetails(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Production Location</Label>
                <Select value={batchDetails.location} onValueChange={(value) => setBatchDetails(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Factory Floor 1">Factory Floor 1</SelectItem>
                    <SelectItem value="Factory Floor 2">Factory Floor 2</SelectItem>
                    <SelectItem value="Factory Floor 3">Factory Floor 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="expectedCompletion">Expected Completion</Label>
                <Input
                  id="expectedCompletion"
                  type="date"
                  value={batchDetails.expectedCompletion}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, expectedCompletion: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={batchDetails.description}
                onChange={(e) => setBatchDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                rows={3}
              />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={batchDetails.notes}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                rows={2}
                />
              </div>
            </CardContent>
          </Card>
      )}

      {/* Step 2: Product Template */}
      {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Select Product Template
              </CardTitle>
            <p className="text-muted-foreground">
              Choose a template to automatically configure production steps and material requirements
            </p>
            </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {productTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="w-full h-32 overflow-hidden">
                    <img 
                      src={template.imageUrl} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium">{template.category}</span>
                </div>
                      <div className="flex justify-between">
                        <span>Est. Cost:</span>
                        <span className="font-medium">₹{template.estimatedCost.toLocaleString()}</span>
              </div>
                      <div className="flex justify-between">
                        <span>Est. Time:</span>
                        <span className="font-medium">{Math.round(template.estimatedTime / 60)} hours</span>
                </div>
              </div>

                    {selectedTemplate === template.id && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-blue-700 text-sm">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Selected
                </div>
              )}
            </CardContent>
          </Card>
              ))}
        </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Custom Template</h4>
                <p className="text-sm text-muted-foreground">Create a custom production template</p>
              </div>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Material Planning */}
      {currentStep === 3 && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Material Planning & Requirements
                </CardTitle>
            <p className="text-muted-foreground">
              Review material requirements and check availability
            </p>
            </CardHeader>
          <CardContent className="space-y-6">
            {/* Material Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{materials.length}</div>
                  <p className="text-sm text-muted-foreground">Total Materials</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {materialAvailability.filter(m => m.status === "sufficient").length}
                        </div>
                  <p className="text-sm text-muted-foreground">Available</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {insufficientMaterials.length}
                        </div>
                  <p className="text-sm text-muted-foreground">Insufficient</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">₹{totalCost.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                </CardContent>
              </Card>
                      </div>

            {/* Material Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search materials..."
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

            {/* Materials Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {materialAvailability
                .filter(material => 
                  material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) &&
                  (materialCategoryFilter === "all" || material.category === materialCategoryFilter)
                )
                .map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
                    </div>

            {/* Material Alerts */}
            {insufficientMaterials.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium text-red-800">Material Shortage Alert</h4>
                                </div>
                  <p className="text-red-700 text-sm mb-3">
                    The following materials are insufficient for this production batch:
                  </p>
                  <div className="space-y-1">
                    {insufficientMaterials.map((material) => (
                      <div key={material.id} className="flex justify-between text-sm">
                        <span>{material.name}</span>
                        <span className="font-medium">Shortage: {material.shortage} {material.unit}</span>
                            </div>
                          ))}
                        </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Order Materials
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Adjust Requirements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Create */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Review & Create Production Batch
            </CardTitle>
            <p className="text-muted-foreground">
              Review all details before creating the production batch
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product Name</span>
                    <span className="font-medium">{batchDetails.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{batchDetails.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch Size</span>
                    <span className="font-medium">{batchDetails.batchSize} pieces</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <Badge className={
                      batchDetails.priority === "urgent" ? "bg-red-100 text-red-800" :
                      batchDetails.priority === "high" ? "bg-orange-100 text-orange-800" :
                      batchDetails.priority === "normal" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {batchDetails.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{batchDetails.location}</span>
              </div>
            </CardContent>
          </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Material Cost</span>
                    <span className="font-medium">₹{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Labor Cost (Est.)</span>
                    <span className="font-medium">₹{(totalCost * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overhead (Est.)</span>
                    <span className="font-medium">₹{(totalCost * 0.2).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Estimated Cost</span>
                    <span>₹{(totalCost * 1.5).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Material Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Material Status</CardTitle>
              </CardHeader>
              <CardContent>
                {insufficientMaterials.length > 0 ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Material Issues Found</span>
                    </div>
                    <p className="text-red-700 text-sm">
                      {insufficientMaterials.length} material(s) have insufficient stock. 
                      Please resolve before creating the batch.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">All Materials Available</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/production')}
            >
          <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
        
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          
            <Button 
            onClick={handleStepComplete}
            disabled={currentStep === 3 && insufficientMaterials.length > 0}
          >
            {currentStep === 4 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Batch
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
            </Button>
        </div>
      </div>
    </div>
  );
}