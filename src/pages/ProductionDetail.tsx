import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, Play, CheckCircle, Cog, Package2, Target,
  ChevronLeft, ChevronRight, Plus, Minus, Factory, Search
} from "lucide-react";
import { rawMaterialsStorage } from "@/utils/localStorage";
import { useToast } from "@/hooks/use-toast";

interface RawMaterial {
  id: string;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  batchNumber: string;
  imageUrl?: string;
}

interface ProductionProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  targetQuantity: number;
  currentStep: number;
  totalSteps: number;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  priority: "low" | "medium" | "high" | "urgent";
  startDate: string;
  expectedCompletion: string;
  actualCompletion?: string;
  materials: ProductionMaterial[];
  steps: ProductionStep[];
  imageUrl?: string;
  batchNumber: string;
  location: string;
  operator?: string;
  totalCost: number;
  sellingPrice: number;
}

interface ProductionMaterial {
  id: string;
  materialId: string;
  materialName: string;
  category: string;
  requiredQuantity: number;
  consumedQuantity: number;
  wasteQuantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  status: "available" | "insufficient" | "consumed";
}

interface ProductionStep {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "on-hold";
  startTime?: string;
  completionTime?: string;
  operator?: string;
  materials: ProductionMaterial[];
  waste: number;
  defects: number;
  qualityGrade: "A+" | "A" | "B" | "C" | "rejected";
  notes: string;
  progress: number;
  actualOutput?: number;
  expectedOutput?: number;
}

const statusColors = {
  "planning": "bg-slate-100 text-slate-700",
  "in-progress": "bg-blue-100 text-blue-700",
  "completed": "bg-green-100 text-green-700",
  "on-hold": "bg-red-100 text-red-700"
};

const stepStatusColors = {
  "pending": "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700", 
  "completed": "bg-green-100 text-green-700",
  "on-hold": "bg-red-100 text-red-700"
};

export default function ProductionDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<ProductionProduct | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<{[key: string]: number}>({});
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [stepData, setStepData] = useState({
    operator: "",
    actualOutput: 0,
    waste: 0,
    defects: 0,
    notes: ""
  });

  // Load product and materials
  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
    }
    
    const materials = rawMaterialsStorage.getAll();
    setRawMaterials(materials);
  }, [location.state]);

  if (!product) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Header title="Production Detail" subtitle="Loading..." />
        <div className="text-center">Loading product details...</div>
      </div>
    );
  }

  const currentStep = product.steps[currentStepIndex];
  const canGoNext = currentStepIndex < product.steps.length - 1;
  const canGoPrev = currentStepIndex > 0;
  const isStepAccessible = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    return product.steps[stepIndex - 1].status === "completed";
  };

  // Handle step start
  const handleStartStep = () => {
    if (!currentStep) return;

    const updatedProduct = { ...product };
    updatedProduct.steps[currentStepIndex] = {
      ...currentStep,
      status: "in-progress",
      startTime: new Date().toISOString(),
      operator: stepData.operator
    };
    
    setProduct(updatedProduct);
    
    toast({
      title: "✅ Step Started!",
      description: `${currentStep.name} has been started.`,
    });
  };

  // Handle step completion
  const handleCompleteStep = () => {
    if (!currentStep) return;

    // Update material stock
    selectedMaterials && Object.entries(selectedMaterials).forEach(([materialId, quantity]) => {
      const material = rawMaterials.find(m => m.id === materialId);
      if (material && material.currentStock >= quantity) {
        material.currentStock -= quantity;
        rawMaterialsStorage.update(materialId, material);
      }
    });

    const updatedProduct = { ...product };
    updatedProduct.steps[currentStepIndex] = {
      ...currentStep,
      status: "completed",
      completionTime: new Date().toISOString(),
      actualOutput: stepData.actualOutput,
      waste: stepData.waste,
      defects: stepData.defects,
      notes: stepData.notes,
      progress: 100,
      materials: Object.entries(selectedMaterials).map(([materialId, quantity]) => {
        const material = rawMaterials.find(m => m.id === materialId);
        return {
          id: Date.now().toString(),
          materialId,
          materialName: material?.name || "",
          category: material?.category || "",
          requiredQuantity: quantity,
          consumedQuantity: quantity,
          wasteQuantity: 0,
          unit: material?.unit || "",
          costPerUnit: material?.costPerUnit || 0,
          totalCost: quantity * (material?.costPerUnit || 0),
          status: "consumed" as const
        };
      })
    };
    
    // Check if all steps completed
    const allCompleted = updatedProduct.steps.every(s => s.status === "completed");
    if (allCompleted) {
      updatedProduct.status = "completed";
      updatedProduct.actualCompletion = new Date().toISOString().split('T')[0];
    }
    
    setProduct(updatedProduct);
    
    // Reset form
    setStepData({
      operator: "",
      actualOutput: 0,
      waste: 0,
      defects: 0,
      notes: ""
    });
    setSelectedMaterials({});
    
    toast({
      title: "✅ Step Completed!",
      description: `${currentStep.name} has been completed successfully.`,
    });

    // Auto move to next step if available
    if (canGoNext) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Handle material selection
  const handleMaterialSelect = (materialId: string, quantity: number) => {
    setSelectedMaterials(prev => ({
      ...prev,
      [materialId]: quantity
    }));
  };

  // Filter materials based on search
  const filteredMaterials = rawMaterials.filter(material => 
    material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    material.brand.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
    material.supplier.toLowerCase().includes(materialSearchTerm.toLowerCase())
  );

  // Calculate total progress
  const overallProgress = product.steps.filter(s => s.status === "completed").length / product.steps.length * 100;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/production')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Production
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">Batch: {product.batchNumber}</p>
          </div>
        </div>
        <Badge className={statusColors[product.status]}>
          {product.status}
        </Badge>
      </div>

      {/* Overall Progress */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {product.steps.length}
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(overallProgress)}%
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Horizontal Steps Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Production Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6 relative">
            {product.steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                {/* Step Circle */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer ${
                    step.status === "completed" 
                      ? "bg-green-500 text-white shadow-lg" 
                      : step.status === "in-progress"
                      ? "bg-blue-500 text-white shadow-lg animate-pulse"
                      : index === currentStepIndex
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-500"
                      : isStepAccessible(index)
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-400"
                  }`}
                  onClick={() => {
                    if (isStepAccessible(index) || step.status === "completed") {
                      setCurrentStepIndex(index);
                    }
                  }}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : step.status === "in-progress" ? (
                    <Play className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                
                {/* Step Name */}
                <div className="mt-2 text-center max-w-24">
                  <div className="text-sm font-medium">{step.name}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                
                {/* Connector Line */}
                {index < product.steps.length - 1 && (
                  <div 
                    className={`absolute top-6 left-full w-20 h-0.5 ${
                      product.steps[index + 1].status === "completed" || index < currentStepIndex
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                    style={{ transform: "translateX(-50%)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Detail */}
      {currentStep && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Step Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="w-5 h-5" />
                Step {currentStepIndex + 1}: {currentStep.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Description</h4>
                <p className="text-blue-700">{currentStep.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={stepStatusColors[currentStep.status]}>
                    {currentStep.status}
                  </Badge>
                </div>
                <div>
                  <Label>Progress</Label>
                  <div className="text-lg font-bold">{currentStep.progress}%</div>
                </div>
              </div>

              {currentStep.status === "pending" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="operator">Operator</Label>
                    <Input
                      id="operator"
                      value={stepData.operator}
                      onChange={(e) => setStepData({...stepData, operator: e.target.value})}
                      placeholder="Enter operator name"
                    />
                  </div>
                  <Button 
                    onClick={handleStartStep}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Step
                  </Button>
                </div>
              )}

              {currentStep.status === "in-progress" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="actualOutput">Actual Output</Label>
                      <Input
                        id="actualOutput"
                        type="number"
                        value={stepData.actualOutput}
                        onChange={(e) => setStepData({...stepData, actualOutput: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="waste">Waste</Label>
                      <Input
                        id="waste"
                        type="number"
                        value={stepData.waste}
                        onChange={(e) => setStepData({...stepData, waste: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="defects">Defects</Label>
                    <Input
                      id="defects"
                      type="number"
                      value={stepData.defects}
                      onChange={(e) => setStepData({...stepData, defects: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={stepData.notes}
                      onChange={(e) => setStepData({...stepData, notes: e.target.value})}
                      placeholder="Add notes about this step..."
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCompleteStep}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Step
                  </Button>
                </div>
              )}

              {currentStep.status === "completed" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded">
                      <span className="text-green-700 font-medium">Output</span>
                      <div className="text-green-900 font-bold">{currentStep.actualOutput}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <span className="text-red-700 font-medium">Waste</span>
                      <div className="text-red-900 font-bold">{currentStep.waste}</div>
                    </div>
                  </div>
                  {currentStep.notes && (
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium">Notes:</span> {currentStep.notes}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Material Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="w-5 h-5" />
                Materials Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep.status === "pending" || currentStep.status === "in-progress" ? (
                <div className="space-y-4">
                  {/* Material Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search materials by name, brand, category, or supplier..."
                      value={materialSearchTerm}
                      onChange={(e) => setMaterialSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Material Count */}
                  <div className="text-sm text-muted-foreground">
                    {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} found
                    {materialSearchTerm && ` for "${materialSearchTerm}"`}
                  </div>
                  
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {filteredMaterials.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No materials found</p>
                        <p className="text-sm">
                          {materialSearchTerm 
                            ? `Try searching for something else or clear the search.`
                            : `No materials available in inventory.`
                          }
                        </p>
                        {materialSearchTerm && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMaterialSearchTerm("")}
                            className="mt-3"
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    ) : (
                      filteredMaterials.map((material) => (
                        <div 
                          key={material.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            const currentQty = selectedMaterials[material.id] || 0;
                            handleMaterialSelect(material.id, currentQty + 1);
                          }}
                        >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{material.name}</div>
                            <div className="text-sm text-gray-600">{material.brand}</div>
                            <div className="text-xs text-gray-500">
                              Stock: {material.currentStock} {material.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              ₹{material.costPerUnit}/{material.unit}
                            </div>
                            {selectedMaterials[material.id] > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const qty = selectedMaterials[material.id];
                                    if (qty > 1) {
                                      handleMaterialSelect(material.id, qty - 1);
                                    } else {
                                      const newSelected = {...selectedMaterials};
                                      delete newSelected[material.id];
                                      setSelectedMaterials(newSelected);
                                    }
                                  }}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="font-medium">
                                  {selectedMaterials[material.id]}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedMaterials[material.id] < material.currentStock) {
                                      handleMaterialSelect(material.id, selectedMaterials[material.id] + 1);
                                    }
                                  }}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                  
                  {Object.keys(selectedMaterials).length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Selected Materials</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedMaterials).map(([materialId, quantity]) => {
                          const material = rawMaterials.find(m => m.id === materialId);
                          return (
                            <div key={materialId} className="flex justify-between text-sm">
                              <span>{material?.name}</span>
                              <span>{quantity} {material?.unit}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {currentStep.materials?.map((material, index) => (
                    <div key={index} className="flex justify-between p-3 bg-gray-50 rounded">
                      <span>{material.materialName}</span>
                      <span>{material.consumedQuantity} {material.unit}</span>
                    </div>
                  ))}
                  {(!currentStep.materials || currentStep.materials.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No materials used in this step</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStepIndex(prev => prev - 1)}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous Step
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => setCurrentStepIndex(prev => prev + 1)}
          disabled={!canGoNext || !isStepAccessible(currentStepIndex + 1)}
        >
          Next Step
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
