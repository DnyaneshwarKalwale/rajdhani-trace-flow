import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, AlertTriangle, Plus, Trash2, Save, Factory, Info
} from "lucide-react";
import { getFromStorage, updateStorage, saveToStorage, replaceStorage, generateUniqueId } from "@/lib/storage";
import { updateProductionStep, moveToNextStep, getProductionFlow } from "@/lib/machines";
import ProductionProgressBar from "@/components/production/ProductionProgressBar";

interface MaterialConsumption {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  cost: number;
  consumedAt: string;
}

interface WasteItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  wasteType: "scrap" | "defective" | "excess";
  canBeReused: boolean;
  notes: string;
}

interface ProductionProduct {
  id: string;
  productId: string;
  productName: string;
  category: string;
  color: string;
  size: string;
  pattern: string;
  targetQuantity: number;
  priority: "normal" | "high" | "urgent";
  status: "planning" | "active" | "completed";
  expectedCompletion: string;
  createdAt: string;
  materialsConsumed: MaterialConsumption[];
  wasteGenerated: WasteItem[];
  notes: string;
}

interface RawMaterial {
  id: string;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  supplierId: string;
  status: "in-stock" | "low-stock" | "out-of-stock" | "overstock";
  location?: string;
  batchNumber?: string;
}

export default function WasteGeneration() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [productionProduct, setProductionProduct] = useState<ProductionProduct | null>(null);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [isAddingWaste, setIsAddingWaste] = useState(false);
  const [productionFlow, setProductionFlow] = useState<any>(null);
  
  // Waste form
  const [newWaste, setNewWaste] = useState({
    materialId: "",
    materialName: "",
    quantity: "",
    unit: "",
    wasteType: "scrap" as const,
    canBeReused: false,
    notes: ""
  });

  useEffect(() => {
    if (productId) {
      const products = getFromStorage('rajdhani_production_products');
      const product = products.find((p: ProductionProduct) => p.id === productId);
      if (product) {
        setProductionProduct(product);
      }
    }
    
    // Load raw materials
    const materials = getFromStorage('rajdhani_raw_materials') || [];
    setRawMaterials(materials);
    
    // Load production flow
    if (productId) {
      const flow = getProductionFlow(productId);
      if (flow) {
        // Auto-set waste tracking step to 'in_progress' if it's pending
        const wasteStep = flow.steps.find(s => s.stepType === 'wastage_tracking');
        if (wasteStep && wasteStep.status === 'pending') {
          const updatedFlow = {
            ...flow,
            steps: flow.steps.map(step => 
              step.id === wasteStep.id 
                ? { 
                    ...step, 
                    status: 'in_progress' as const, 
                    startTime: new Date().toISOString()
                  }
                : step
            ),
            updatedAt: new Date().toISOString()
          };
          
          // Save updated flow
          const flows = getFromStorage('rajdhani_production_flows') || [];
          const updatedFlows = flows.map(f => f.id === flow.id ? updatedFlow : f);
          replaceStorage('rajdhani_production_flows', updatedFlows);
          
          setProductionFlow(updatedFlow);
          console.log('Waste tracking step automatically set to in_progress');
        } else {
      setProductionFlow(flow);
        }
      }
    }
  }, [productId]);

  // Handle waste material selection change
  const handleWasteMaterialSelection = (materialId: string) => {
    const selectedMaterial = rawMaterials.find(m => m.id === materialId);
    if (selectedMaterial) {
      setNewWaste({
        ...newWaste,
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        unit: selectedMaterial.unit
      });
    }
  };

  const updateProductionProduct = (updatedProduct: ProductionProduct) => {
    const products = getFromStorage('rajdhani_production_products');
    const updatedProducts = products.map((p: ProductionProduct) => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    localStorage.setItem('rajdhani_production_products', JSON.stringify(updatedProducts));
    setProductionProduct(updatedProduct);
  };

  const addWasteItem = () => {
    if (!productionProduct || !newWaste.materialId || !newWaste.quantity) return;

    const waste: WasteItem = {
      materialId: newWaste.materialId,
      materialName: newWaste.materialName,
      quantity: parseFloat(newWaste.quantity),
      unit: newWaste.unit,
      wasteType: newWaste.wasteType,
      canBeReused: newWaste.canBeReused,
      notes: newWaste.notes
    };

    const updatedProduct: ProductionProduct = {
      ...productionProduct,
      wasteGenerated: [...(productionProduct.wasteGenerated || []), waste]
    };

    updateProductionProduct(updatedProduct);
    
    // Update production flow if wastage step is active
    const flow = getProductionFlow(productionProduct.id);
    if (flow) {
      const wastageStep = flow.steps.find(s => s.stepType === 'wastage_tracking' && s.status === 'in_progress');
      if (wastageStep) {
        // Auto-complete wastage step when waste is added
        updateProductionStep(flow.id, wastageStep.id, {
          status: 'completed',
          endTime: new Date().toISOString(),
          inspectorName: 'Admin',
          qualityNotes: `Wastage recorded: ${updatedProduct.wasteGenerated.length} items`
        });
        moveToNextStep(flow.id);
      }
    }
    
    // Reset form
    setNewWaste({
      materialId: "",
      materialName: "",
      quantity: "",
      unit: "",
      wasteType: "scrap",
      canBeReused: false,
      notes: ""
    });
    setIsAddingWaste(false);
  };

  const removeWasteItem = (index: number) => {
    if (!productionProduct) return;
    
    const updatedWasteItems = productionProduct.wasteGenerated?.filter((_, i) => i !== index) || [];
    const updatedProduct: ProductionProduct = {
      ...productionProduct,
      wasteGenerated: updatedWasteItems
    };
    
    updateProductionProduct(updatedProduct);
  };

  const completeWasteTracking = () => {
    if (!productionProduct) return;
    
    // 1. Deduct consumed materials from raw material inventory
    if (productionProduct.materialsConsumed && productionProduct.materialsConsumed.length > 0) {
      const updatedRawMaterials = rawMaterials.map(material => {
        const consumed = productionProduct.materialsConsumed.find(cm => cm.materialId === material.id);
        if (consumed) {
          const newQuantity = material.currentStock - consumed.quantity;
          return {
            ...material,
            currentStock: Math.max(0, newQuantity),
            status: newQuantity <= 0 ? "out-of-stock" as const : 
                    newQuantity <= 10 ? "low-stock" as const : "in-stock" as const
          };
        }
        return material;
      });
      
      // Update raw materials in localStorage
      replaceStorage('rajdhani_raw_materials', updatedRawMaterials);
      // Update local state to reflect changes in UI
      setRawMaterials(updatedRawMaterials);
      console.log('✅ Materials deducted from inventory after waste generation');
      console.log('Updated materials:', updatedRawMaterials.filter(m => 
        productionProduct.materialsConsumed.some(cm => cm.materialId === m.id)
      ));
    }
    
    // 2. Add waste items to waste management system
    if (productionProduct.wasteGenerated && productionProduct.wasteGenerated.length > 0) {
      const wasteManagementItems = productionProduct.wasteGenerated.map(waste => ({
        id: generateUniqueId('WASTE'),
        materialId: waste.materialId,
        materialName: waste.materialName,
        quantity: waste.quantity,
        unit: waste.unit,
        wasteType: waste.wasteType,
        canBeReused: waste.canBeReused,
        notes: waste.notes,
        productionId: productionProduct.id,
        productName: productionProduct.productName,
        generatedAt: new Date().toISOString(),
        status: waste.canBeReused ? 'available_for_reuse' : 'disposed'
      }));
      
      // Get existing waste management data
      const existingWaste = getFromStorage('rajdhani_waste_management') || [];
      console.log('Existing waste data:', existingWaste);
      console.log('New waste items to add:', wasteManagementItems);
      
      // Ensure existingWaste is a flat array
      const flatExistingWaste = Array.isArray(existingWaste) ? existingWaste : [];
      const updatedWaste = [...flatExistingWaste, ...wasteManagementItems];
      
      saveToStorage('rajdhani_waste_management', updatedWaste);
      console.log('✅ Waste items added to waste management system');
      console.log('Waste management items:', wasteManagementItems);
      console.log('Total waste in system:', updatedWaste.length);
      console.log('Final waste data structure:', updatedWaste);
    }
    
    // 3. Mark waste generation step as completed
    const flow = getProductionFlow(productionProduct.id);
    if (flow) {
      const wasteStep = flow.steps.find(s => s.stepType === 'wastage_tracking');
      if (wasteStep && wasteStep.status !== 'completed') {
        // Update the waste step to completed
        const updatedFlow = {
          ...flow,
          steps: flow.steps.map(step => 
            step.id === wasteStep.id 
              ? { 
                  ...step, 
                  status: 'completed' as const, 
                  endTime: new Date().toISOString(),
                  inspector: 'Admin',
                  qualityNotes: `Waste tracking completed with ${(productionProduct?.wasteGenerated || []).length} items. Materials deducted from inventory.`
                }
              : step
          ),
          updatedAt: new Date().toISOString()
        };
        
        // Save updated flow using replaceStorage for consistency
        const flows = getFromStorage('rajdhani_production_flows') || [];
        const updatedFlows = flows.map(f => f.id === flow.id ? updatedFlow : f);
        replaceStorage('rajdhani_production_flows', updatedFlows);
        
        // Update local production flow state
        setProductionFlow(updatedFlow);
        
        console.log('Waste tracking completed, updated flow:', updatedFlow);
      }
    }
    
    // Navigate directly to individual details section (Complete page)
      navigate(`/production/complete/${productId}`);
  };

  if (!productionProduct) {
    return <div className="p-6">Loading...</div>;
  }

  const totalWasteQuantity = (productionProduct.wasteGenerated || []).reduce((sum, w) => sum + w.quantity, 0);

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title={`Waste Generation: ${productionProduct.productName}`}
        subtitle="Track waste generated during production process"
      />

      {/* Production Progress Bar */}
      <ProductionProgressBar
        currentStep="wastage_tracking"
        steps={[
          {
            id: "material_selection",
            name: "Material Selection",
            status: "completed",
            stepType: "material_selection"
          },
          {
            id: "machine_operation",
            name: "Machine Operations",
            status: productionFlow?.steps?.some((s: any) => s.stepType === 'machine_operation') ? "completed" : "pending",
            stepType: "machine_operation"
          },
          {
            id: "wastage_tracking",
            name: "Waste Generation",
            status: productionFlow?.steps?.find((s: any) => s.stepType === 'wastage_tracking')?.status === 'completed' ? "completed" : 
                   productionFlow?.steps?.find((s: any) => s.stepType === 'wastage_tracking')?.status === 'in_progress' ? "in_progress" : "pending",
            stepType: "wastage_tracking"
          },
          {
            id: "testing_individual",
            name: "Individual Details",
            status: "pending",
            stepType: "testing_individual"
          }
        ]}
        machineSteps={productionFlow?.steps?.filter((s: any) => s.stepType === 'machine_operation') || []}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(`/production/${productId}/dynamic-flow`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Production Flow
        </Button>
      </div>

      {/* Waste Generation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Waste Tracking Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {productionProduct.wasteGenerated?.length || 0}
              </div>
              <div className="text-sm text-gray-500">Waste Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {totalWasteQuantity.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">Total Waste Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(productionProduct.wasteGenerated || []).filter(w => w.canBeReused).length}
              </div>
              <div className="text-sm text-gray-500">Reusable Items</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Waste Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Waste Generation Tracking
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingWaste(!isAddingWaste)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Waste Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingWaste && (
            <div className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Waste Tracking</span>
                </div>
                <p className="text-sm text-blue-700">
                  Track waste generated during production. Materials used in production are shown first for easy selection.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Material *</Label>
                  <select
                    value={newWaste.materialId}
                    onChange={(e) => handleWasteMaterialSelection(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Choose a material...</option>
                    <optgroup label="Materials Used in Production">
                      {productionProduct.materialsConsumed?.map((material) => (
                        <option key={material.materialId} value={material.materialId}>
                          {material.materialName} - Used: {material.quantity} {material.unit}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="All Raw Materials">
                      {rawMaterials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name} - {material.currentStock} {material.unit} in stock
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <Label>Material Name</Label>
                  <Input
                    value={newWaste.materialName}
                    onChange={(e) => setNewWaste({...newWaste, materialName: e.target.value})}
                    placeholder="Auto-filled from selection"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Waste Quantity *</Label>
                  <Input
                    type="number"
                    value={newWaste.quantity}
                    onChange={(e) => setNewWaste({...newWaste, quantity: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={newWaste.unit}
                    onChange={(e) => setNewWaste({...newWaste, unit: e.target.value})}
                    placeholder="Auto-filled from selection"
                    readOnly
                  />
                </div>
                <div>
                  <Label>Waste Type</Label>
                  <select
                    value={newWaste.wasteType}
                    onChange={(e) => setNewWaste({...newWaste, wasteType: e.target.value as any})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="scrap">Scrap</option>
                    <option value="defective">Defective</option>
                    <option value="excess">Excess</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="canBeReused"
                  checked={newWaste.canBeReused}
                  onChange={(e) => setNewWaste({...newWaste, canBeReused: e.target.checked})}
                />
                <Label htmlFor="canBeReused">Can be reused/recycled</Label>
              </div>
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newWaste.notes}
                  onChange={(e) => setNewWaste({...newWaste, notes: e.target.value})}
                  placeholder="Waste description and handling notes"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addWasteItem} className="bg-orange-600 hover:bg-orange-700">
                  <Save className="w-4 h-4 mr-2" />
                  Add Waste Item
                </Button>
                <Button variant="outline" onClick={() => setIsAddingWaste(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Waste Items */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              Recorded Waste Items
              {productionProduct.wasteGenerated && productionProduct.wasteGenerated.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {productionProduct.wasteGenerated.length} items
                </Badge>
              )}
            </h4>
            
            {productionProduct.wasteGenerated?.map((waste, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{waste.materialName}</div>
                  <div className="text-sm text-gray-500">
                    {waste.quantity} {waste.unit} • {waste.wasteType} • {waste.canBeReused ? "Reusable" : "Non-reusable"}
                  </div>
                  {waste.notes && <div className="text-sm text-gray-600 mt-1">{waste.notes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={waste.canBeReused ? "default" : "destructive"}>
                    {waste.wasteType}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeWasteItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {(!productionProduct.wasteGenerated || productionProduct.wasteGenerated.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No waste items recorded yet</p>
                <p className="text-sm">Click "Add Waste Item" to start tracking waste</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complete Waste Tracking */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Complete Waste Tracking</h3>
              <p className="text-sm text-gray-600">
                Once you've recorded all waste items, proceed to the next step in production
              </p>
            </div>
            <Button 
              onClick={completeWasteTracking}
              className="bg-green-600 hover:bg-green-700"
            >
              <Factory className="w-4 h-4 mr-2" />
              Complete & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}