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
import { Plus, Minus, Calculator, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  availableStock: number;
  requiredQuantity: number;
  costPerUnit: number;
}

interface ProductionStep {
  id: string;
  name: string;
  description: string;
  materials: RawMaterial[];
  expectedOutput: number;
  estimatedTime: number;
}

const mockRawMaterials: RawMaterial[] = [
  { id: "1", name: "Cotton Yarn", unit: "kg", availableStock: 500, requiredQuantity: 0, costPerUnit: 250 },
  { id: "2", name: "Backing Cloth", unit: "sqm", availableStock: 200, requiredQuantity: 0, costPerUnit: 150 },
  { id: "3", name: "Red Dye", unit: "liters", availableStock: 50, requiredQuantity: 0, costPerUnit: 800 },
  { id: "4", name: "Blue Dye", unit: "liters", availableStock: 45, requiredQuantity: 0, costPerUnit: 800 },
  { id: "5", name: "Latex Solution", unit: "liters", availableStock: 30, requiredQuantity: 0, costPerUnit: 600 },
];

const productionSteps: ProductionStep[] = [
  {
    id: "1",
    name: "Punching (Base Layer)",
    description: "Creating the base weave structure",
    materials: [],
    expectedOutput: 0,
    estimatedTime: 480
  },
  {
    id: "2", 
    name: "Dyeing Process",
    description: "Adding color to the carpet",
    materials: [],
    expectedOutput: 0,
    estimatedTime: 360
  },
  {
    id: "3",
    name: "Cutting & Finishing",
    description: "Final cutting and finishing touches",
    materials: [],
    expectedOutput: 0,
    estimatedTime: 240
  }
];

export default function NewBatch() {
  const { toast } = useToast();
  const [batchDetails, setBatchDetails] = useState({
    productName: "",
    productType: "",
    batchSize: 100,
    priority: "normal",
    scheduledDate: "",
    notes: ""
  });
  
  const [steps, setSteps] = useState<ProductionStep[]>(productionSteps);
  const [selectedStepId, setSelectedStepId] = useState<string>("1");

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

  const updateStepOutput = (stepId: string, output: number) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, expectedOutput: output } : step
      )
    );
  };

  const calculateTotalCost = () => {
    return steps.reduce((total, step) => 
      total + step.materials.reduce((stepTotal, material) => 
        stepTotal + (material.requiredQuantity * material.costPerUnit), 0
      ), 0
    );
  };

  const calculateTotalTime = () => {
    return steps.reduce((total, step) => total + step.estimatedTime, 0);
  };

  const getInsufficientStockMaterials = () => {
    const insufficient: { step: string; material: string; needed: number; available: number }[] = [];
    
    steps.forEach(step => {
      step.materials.forEach(material => {
        if (material.requiredQuantity > material.availableStock) {
          insufficient.push({
            step: step.name,
            material: material.name,
            needed: material.requiredQuantity,
            available: material.availableStock
          });
        }
      });
    });
    
    return insufficient;
  };

  const handleSubmit = () => {
    if (!batchDetails.productName || !batchDetails.productType) {
      toast({
        title: "Error",
        description: "Please fill in product name and type",
        variant: "destructive"
      });
      return;
    }

    const insufficientStock = getInsufficientStockMaterials();
    if (insufficientStock.length > 0) {
      toast({
        title: "Insufficient Stock",
        description: `Some materials have insufficient stock. Please check the warnings.`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Production batch created successfully!",
    });
  };

  const currentStep = steps.find(step => step.id === selectedStepId);
  const insufficientStock = getInsufficientStockMaterials();

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Create Production Batch" 
        subtitle="Plan and schedule a new production batch with material requirements"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input 
                  id="productName"
                  value={batchDetails.productName}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="e.g., Red Premium Carpet"
                />
              </div>
              
              <div>
                <Label htmlFor="productType">Product Type</Label>
                <Select value={batchDetails.productType} onValueChange={(value) => setBatchDetails(prev => ({ ...prev, productType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carpet">Carpet</SelectItem>
                    <SelectItem value="rug">Rug</SelectItem>
                    <SelectItem value="mat">Mat</SelectItem>
                    <SelectItem value="runner">Runner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input 
                  id="batchSize"
                  type="number"
                  value={batchDetails.batchSize}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={batchDetails.priority} onValueChange={(value) => setBatchDetails(prev => ({ ...prev, priority: value }))}>
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
              
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes"
                  value={batchDetails.notes}
                  onChange={(e) => setBatchDetails(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or special instructions..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Production Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Production Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                {steps.map((step) => (
                  <Button
                    key={step.id}
                    variant={selectedStepId === step.id ? "default" : "outline"}
                    onClick={() => setSelectedStepId(step.id)}
                    className="flex-1"
                  >
                    Step {step.id}: {step.name}
                  </Button>
                ))}
              </div>

              {currentStep && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{currentStep.name}</h3>
                    <p className="text-muted-foreground mb-4">{currentStep.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expectedOutput">Expected Output</Label>
                        <Input 
                          id="expectedOutput"
                          type="number"
                          value={currentStep.expectedOutput}
                          onChange={(e) => updateStepOutput(currentStep.id, parseInt(e.target.value) || 0)}
                          placeholder="Number of pieces"
                        />
                      </div>
                      <div>
                        <Label>Estimated Time</Label>
                        <Input 
                          value={`${Math.floor(currentStep.estimatedTime / 60)}h ${currentStep.estimatedTime % 60}m`}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-4">Required Materials</h4>
                    <div className="space-y-4">
                      {mockRawMaterials.map((material) => {
                        const currentMaterial = currentStep.materials.find(m => m.id === material.id);
                        const quantity = currentMaterial?.requiredQuantity || 0;
                        const isInsufficient = quantity > material.availableStock;
                        
                        return (
                          <div key={material.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">{material.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Available: {material.availableStock} {material.unit} • ₹{material.costPerUnit}/{material.unit}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateStepMaterial(currentStep.id, material.id, Math.max(0, quantity - 1))}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              
                              <Input 
                                className="w-20 text-center"
                                type="number"
                                value={quantity}
                                onChange={(e) => updateStepMaterial(currentStep.id, material.id, parseInt(e.target.value) || 0)}
                              />
                              
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => updateStepMaterial(currentStep.id, material.id, quantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              
                              <span className="text-sm text-muted-foreground w-12">{material.unit}</span>
                              
                              {isInsufficient && (
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Batch Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span>Batch Size:</span>
                  <span className="font-medium">{batchDetails.batchSize} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cost:</span>
                  <span className="font-medium">₹{calculateTotalCost().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per Unit:</span>
                  <span className="font-medium">
                    ₹{batchDetails.batchSize > 0 ? Math.round(calculateTotalCost() / batchDetails.batchSize) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Time:</span>
                  <span className="font-medium">
                    {Math.floor(calculateTotalTime() / 60)}h {calculateTotalTime() % 60}m
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Priority</h4>
                <Badge 
                  className={
                    batchDetails.priority === 'urgent' ? 'bg-destructive text-destructive-foreground' :
                    batchDetails.priority === 'high' ? 'bg-warning text-warning-foreground' :
                    'bg-secondary text-secondary-foreground'
                  }
                >
                  {batchDetails.priority.toUpperCase()}
                </Badge>
              </div>

              {insufficientStock.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Stock Warnings
                    </h4>
                    <div className="space-y-2">
                      {insufficientStock.map((item, index) => (
                        <div key={index} className="text-sm p-2 bg-destructive/10 rounded">
                          <div className="font-medium">{item.material}</div>
                          <div className="text-muted-foreground">
                            Need: {item.needed}, Available: {item.available}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button variant="outline" className="w-full">Save as Draft</Button>
            <Button onClick={handleSubmit} className="w-full">Create Batch</Button>
          </div>
        </div>
      </div>
    </div>
  );
}