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
import { Plus, Minus, Calculator, AlertTriangle, Package, Clock, TrendingUp, Factory, Save, ArrowLeft } from "lucide-react";
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
}

interface ProductionStep {
  id: string;
  name: string;
  description: string;
  materials: RawMaterial[];
  expectedOutput: number;
  estimatedTime: number;
  isCustomStep?: boolean;
}

// Enhanced raw materials with more realistic data
const mockRawMaterials: RawMaterial[] = [
  { id: "1", name: "Cotton Yarn (Premium)", unit: "rolls", availableStock: 500, requiredQuantity: 0, costPerUnit: 450, category: "Yarn", supplier: "Premium Textiles Ltd", minStockLevel: 100 },
  { id: "2", name: "Synthetic Yarn", unit: "rolls", availableStock: 300, requiredQuantity: 0, costPerUnit: 380, category: "Yarn", supplier: "Synthetic Solutions", minStockLevel: 80 },
  { id: "3", name: "Wool Yarn (Premium)", unit: "rolls", availableStock: 150, requiredQuantity: 0, costPerUnit: 650, category: "Yarn", supplier: "Wool Masters", minStockLevel: 50 },
  { id: "4", name: "Red Dye (Industrial)", unit: "liters", availableStock: 85, requiredQuantity: 0, costPerUnit: 180, category: "Dye", supplier: "ColorChem Industries", minStockLevel: 20 },
  { id: "5", name: "Blue Dye (Industrial)", unit: "liters", availableStock: 92, requiredQuantity: 0, costPerUnit: 190, category: "Dye", supplier: "ColorChem Industries", minStockLevel: 20 },
  { id: "6", name: "Green Dye (Industrial)", unit: "liters", availableStock: 0, requiredQuantity: 0, costPerUnit: 200, category: "Dye", supplier: "ColorChem Industries", minStockLevel: 20 },
  { id: "7", name: "Latex Solution", unit: "liters", availableStock: 120, requiredQuantity: 0, costPerUnit: 320, category: "Chemical", supplier: "ChemCorp Ltd", minStockLevel: 30 },
  { id: "8", name: "Backing Cloth", unit: "sqm", availableStock: 300, requiredQuantity: 0, costPerUnit: 25, category: "Fabric", supplier: "FabricWorld", minStockLevel: 100 },
  { id: "9", name: "Premium Backing Cloth", unit: "sqm", availableStock: 150, requiredQuantity: 0, costPerUnit: 35, category: "Fabric", supplier: "Premium Fabrics", minStockLevel: 50 }
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

export default function NewBatch() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [batchDetails, setBatchDetails] = useState({
    productName: "",
    productType: "",
    batchSize: 100,
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: "",
    expectedCompletion: "",
    location: "Factory Floor 1"
  });
  
  const [steps, setSteps] = useState<ProductionStep[]>(productionSteps);
  const [selectedStepId, setSelectedStepId] = useState<string>("1");
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate material requirements based on batch size
  const calculateMaterialRequirements = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const updatedSteps = steps.map(step => {
        const baseQuantity = batchDetails.batchSize;
        let materials: RawMaterial[] = [];
        
        switch (step.id) {
          case "1": // Material Preparation
            materials = [
              { ...mockRawMaterials[0], requiredQuantity: Math.ceil(baseQuantity * 0.8) }, // Cotton Yarn
              { ...mockRawMaterials[3], requiredQuantity: Math.ceil(baseQuantity * 0.3) }, // Red Dye
            ];
            break;
          case "2": // Punching/Weaving
            materials = [
              { ...mockRawMaterials[0], requiredQuantity: Math.ceil(baseQuantity * 0.6) }, // Cotton Yarn
            ];
            break;
          case "3": // Dyeing Process
            materials = [
              { ...mockRawMaterials[3], requiredQuantity: Math.ceil(baseQuantity * 0.2) }, // Red Dye
              { ...mockRawMaterials[6], requiredQuantity: Math.ceil(baseQuantity * 0.4) }, // Latex Solution
            ];
            break;
          case "4": // Cutting & Finishing
            materials = [
              { ...mockRawMaterials[7], requiredQuantity: Math.ceil(baseQuantity * 1.2) }, // Backing Cloth
            ];
            break;
          case "5": // Quality Inspection
            materials = []; // No materials needed for inspection
            break;
        }
        
        return {
          ...step,
          materials,
          expectedOutput: baseQuantity
        };
      });
      
      setSteps(updatedSteps);
      setIsCalculating(false);
      
      toast({
        title: "Material Requirements Calculated",
        description: `Calculated material requirements for ${batchDetails.batchSize} pieces`,
      });
    }, 1000);
  };

  const updateStepMaterial = (stepId: string, materialId: string, quantity: number) => {
    setSteps(prevSteps => 
      prevSteps.map(step => {
        if (step.id === stepId) {
          const existingMaterialIndex = step.materials.findIndex(m => m.id === materialId);
          const material = mockRawMaterials.find(m => m.id === materialId);
          
          if (!material) return step;
          
          const newMaterial: RawMaterial = {
            ...material,
            requiredQuantity: quantity
          };
          
          if (existingMaterialIndex >= 0) {
            const updatedMaterials = [...step.materials];
            if (quantity > 0) {
              updatedMaterials[existingMaterialIndex] = newMaterial;
            } else {
              updatedMaterials.splice(existingMaterialIndex, 1);
            }
            return { ...step, materials: updatedMaterials };
          } else if (quantity > 0) {
            return { ...step, materials: [...step.materials, newMaterial] };
          }
        }
        return step;
      })
    );
  };

  const addCustomStep = () => {
    const newStep: ProductionStep = {
      id: `custom-${Date.now()}`,
      name: "Custom Step",
      description: "Custom production step",
      materials: [],
      expectedOutput: batchDetails.batchSize,
      estimatedTime: 120,
      isCustomStep: true
    };
    setSteps([...steps, newStep]);
  };

  const removeCustomStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const calculateTotalCost = () => {
    return steps.reduce((total, step) => {
      return total + step.materials.reduce((stepTotal, material) => {
        return stepTotal + (material.requiredQuantity * material.costPerUnit);
      }, 0);
    }, 0);
  };

  const calculateTotalTime = () => {
    return steps.reduce((total, step) => total + step.estimatedTime, 0);
  };

  const checkMaterialAvailability = () => {
    const insufficientMaterials: { name: string; required: number; available: number; unit: string }[] = [];
    
    steps.forEach(step => {
      step.materials.forEach(material => {
        if (material.requiredQuantity > material.availableStock) {
          insufficientMaterials.push({
            name: material.name,
            required: material.requiredQuantity,
            available: material.availableStock,
            unit: material.unit
          });
        }
      });
    });
    
    return insufficientMaterials;
  };

  const handleCreateBatch = () => {
    if (!batchDetails.productName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name",
        variant: "destructive"
      });
      return;
    }

    const insufficientMaterials = checkMaterialAvailability();
    if (insufficientMaterials.length > 0) {
      toast({
        title: "Insufficient Materials",
        description: `${insufficientMaterials.length} materials have insufficient stock`,
        variant: "destructive"
      });
      return;
    }

    // Create production batch and navigate to production page
    const productionBatch = {
      id: `PROD${Date.now()}`,
      batchNumber: `BATCH-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      productName: batchDetails.productName,
      quantity: batchDetails.batchSize,
      priority: batchDetails.priority,
      steps: steps,
      totalCost: calculateTotalCost(),
      estimatedTime: calculateTotalTime(),
      location: batchDetails.location,
      notes: batchDetails.notes
    };

    // Store in localStorage for demo
    const existingBatches = JSON.parse(localStorage.getItem('productionBatches') || '[]');
    existingBatches.push(productionBatch);
    localStorage.setItem('productionBatches', JSON.stringify(existingBatches));

    toast({
      title: "Production Batch Created",
      description: `Batch ${productionBatch.batchNumber} has been created successfully`,
    });

    // Navigate to production page
    navigate('/production', { 
      state: { 
        newBatch: productionBatch 
      }
    });
  };

  const insufficientMaterials = checkMaterialAvailability();
  const totalCost = calculateTotalCost();
  const totalTime = calculateTotalTime();

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Create New Production Batch" 
        subtitle="Plan and configure production batches with material requirements and step management"
      />

      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/production')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Production
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Batch Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Batch Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={batchDetails.productName}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <Label htmlFor="productType">Product Type</Label>
                <Select 
                  value={batchDetails.productType} 
                  onValueChange={(value) => setBatchDetails(prev => ({ ...prev, productType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="handmade">Handmade Carpet</SelectItem>
                    <SelectItem value="machine-made">Machine Made Carpet</SelectItem>
                    <SelectItem value="luxury">Luxury Carpet</SelectItem>
                    <SelectItem value="standard">Standard Carpet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="batchSize">Batch Size *</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={batchDetails.batchSize}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={batchDetails.priority} 
                  onValueChange={(value: any) => setBatchDetails(prev => ({ ...prev, priority: value }))}
                >
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
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={batchDetails.scheduledDate}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="location">Production Location</Label>
                <Select 
                  value={batchDetails.location} 
                  onValueChange={(value) => setBatchDetails(prev => ({ ...prev, location: value }))}
                >
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
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={batchDetails.notes}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this batch..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Batch Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{totalCost.toLocaleString()}</div>
                  <div className="text-sm text-blue-700">Total Cost</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{Math.round(totalTime / 60)}h</div>
                  <div className="text-sm text-green-700">Estimated Time</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{steps.length}</div>
                  <div className="text-sm text-purple-700">Production Steps</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{batchDetails.batchSize}</div>
                  <div className="text-sm text-orange-700">Pieces</div>
                </div>
              </div>

              {insufficientMaterials.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Insufficient Materials</span>
                  </div>
                  <div className="text-sm text-red-700">
                    {insufficientMaterials.length} materials need to be purchased
                  </div>
                </div>
              )}

              <Button 
                onClick={calculateMaterialRequirements}
                disabled={isCalculating || batchDetails.batchSize <= 0}
                className="w-full"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Requirements
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Production Steps */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Factory className="w-5 h-5" />
                  Production Steps
                </CardTitle>
                <Button onClick={addCustomStep} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Step
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{step.name}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.isCustomStep && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustomStep(step.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm">Expected Output</Label>
                        <div className="text-lg font-medium">{step.expectedOutput} pieces</div>
                      </div>
                      <div>
                        <Label className="text-sm">Estimated Time</Label>
                        <div className="text-lg font-medium">{Math.round(step.estimatedTime / 60)} hours</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Required Materials</Label>
                      {step.materials.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No materials required for this step</div>
                      ) : (
                        <div className="grid gap-2">
                          {step.materials.map((material) => (
                            <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{material.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {material.requiredQuantity} {material.unit} × ₹{material.costPerUnit} = ₹{(material.requiredQuantity * material.costPerUnit).toLocaleString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={material.requiredQuantity > material.availableStock ? "destructive" : "default"}>
                                  {material.availableStock} available
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/production')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBatch}
              disabled={!batchDetails.productName.trim() || insufficientMaterials.length > 0}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Production Batch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}