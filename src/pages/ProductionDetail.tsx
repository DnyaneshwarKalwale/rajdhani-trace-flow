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
  ArrowLeft, Package, Factory, Plus, Trash2, Save,
  Truck, AlertTriangle, FileSpreadsheet, CheckCircle, Info, Search,
  XCircle, X, Settings, User
} from "lucide-react";
import { getFromStorage, updateStorage, replaceStorage, getProductRecipe, saveProductRecipe, createRecipeFromMaterials, getProductionProductData, generateUniqueId } from "@/lib/storage";
import { getProductionFlow, updateProductionStep, moveToNextStep } from "@/lib/machines";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface ExpectedProduct {
  name: string;
  category: string;
  dimensions: string;
  weight: string;
  thickness: string;
  pileHeight: string;
  materialComposition: string;
  qualityGrade: string;
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
  expectedProduct: ExpectedProduct;
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

export default function ProductionDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [productionProduct, setProductionProduct] = useState<ProductionProduct | null>(null);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [isEditingExpected, setIsEditingExpected] = useState(false);
  const [isMaterialSelectionOpen, setIsMaterialSelectionOpen] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<Array<RawMaterial & { selectedQuantity: number }>>([]);
  const [notifications, setNotifications] = useState<Array<{id: string, type: 'success' | 'warning' | 'error', title: string, message: string, timestamp: Date}>>([]);
  const [materialsFromRecipe, setMaterialsFromRecipe] = useState(false);
  
  // Machine selection popup states
  const [showMachineSelectionPopup, setShowMachineSelectionPopup] = useState(false);
  const [showAddMachinePopup, setShowAddMachinePopup] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [machines, setMachines] = useState<any[]>([]);
  const [productionFlow, setProductionFlow] = useState<any>(null);
  
  // New machine form
  const [newMachineForm, setNewMachineForm] = useState({
    name: "",
    location: "",
    description: ""
  });
  
  // Material consumption form
  const [newMaterial, setNewMaterial] = useState({
    materialId: "",
    materialName: "",
    quantity: "",
    unit: "",
    cost: ""
  });


  // Expected product form
  const [expectedProduct, setExpectedProduct] = useState<ExpectedProduct>({
    name: "",
    category: "",
    dimensions: "",
    weight: "",
    thickness: "",
    pileHeight: "",
    materialComposition: "",
    qualityGrade: ""
  });


  useEffect(() => {
    if (productId) {
      const products = getFromStorage('rajdhani_production_products');
      const product = products.find((p: ProductionProduct) => p.id === productId);
      if (product) {
        setProductionProduct(product);
        
        // Check if production flow exists and update status
        const existingFlow = getProductionFlow(product.id);
        if (existingFlow) {
          // Auto-complete material selection if materials are already selected and step is pending
          if (product.materialsConsumed && product.materialsConsumed.length > 0) {
            const materialStep = existingFlow.steps.find(s => s.stepType === 'material_selection');
            if (materialStep && materialStep.status === 'pending') {
              updateProductionStep(existingFlow.id, materialStep.id, {
                status: 'completed',
                endTime: new Date().toISOString(),
                inspectorId: 'Admin',
                qualityNotes: `Materials selected during planning: ${product.materialsConsumed.length} items`
              });
              // Move to next step if current step is material selection
              if (existingFlow.currentStepIndex === 0) {
                moveToNextStep(existingFlow.id);
              }
            }
          }
        }
        
        // If product is in active status and has completed all flow steps, redirect to individual details
        if (product.status === "active" && existingFlow?.status === 'completed') {
          navigate(`/production/complete/${product.id}`);
          return;
        }
        
        // Auto-fill expected product details from existing product info
        if (product.expectedProduct && Object.values(product.expectedProduct).some(v => v)) {
          setExpectedProduct(product.expectedProduct);
        } else {
          // Get complete product data with individual stock details
          const completeProductData = getProductionProductData(product.productId);
          
          if (completeProductData) {
            // Pre-fill with complete product details from inventory
            setExpectedProduct({
              name: completeProductData.name || product.productName || "",
              category: completeProductData.category || product.category || "",
              dimensions: completeProductData.dimensions || product.size || "",
              weight: completeProductData.weight || "", // From product details
              thickness: completeProductData.thickness || "", // From product details
              pileHeight: completeProductData.pileHeight || "", // From product details
              materialComposition: completeProductData.materialComposition || "", // From product details
              qualityGrade: "A+" // Pre-fill quality grade
            });
          } else {
            // Fallback to basic product details
            setExpectedProduct({
              name: product.productName || "",
              category: product.category || "",
              dimensions: product.size || "",
              weight: "", // Will be filled during production
              thickness: "", // Will be filled during production
              pileHeight: "", // Will be filled during production
              materialComposition: "", // Will be filled during production
              qualityGrade: "A+" // Pre-fill quality grade
            });
          }
        }

        // Check for existing recipe and auto-populate materials
        const existingRecipe = getProductRecipe(product.productId);
        if (existingRecipe && existingRecipe.materials.length > 0) {
          // Get raw materials from localStorage (should be initialized by DataInitializer)
          const rawMaterialsFromStorage = getFromStorage('rajdhani_raw_materials') || [];
          
          // Debug: Log raw materials loading
          console.log('Raw materials in storage:', rawMaterialsFromStorage.length, rawMaterialsFromStorage);
          console.log('Recipe materials to match:', existingRecipe.materials);
          
          // Convert recipe materials to selected materials format
          // Include ALL materials from recipe, even if not currently in inventory
          const recipeMaterials = existingRecipe.materials.map(recipeMaterial => {
            // First try to find by ID
            let rawMaterial = rawMaterialsFromStorage.find(rm => rm.id === recipeMaterial.materialId);
            
            // If not found by ID, try to find by name (in case IDs changed)
            if (!rawMaterial && recipeMaterial.materialName) {
              rawMaterial = rawMaterialsFromStorage.find(rm => 
                rm.name.toLowerCase() === recipeMaterial.materialName.toLowerCase()
              );
            }
            
            // If material not found in current inventory by ID or name, create a placeholder with recipe data
            if (!rawMaterial) {
              return {
                id: recipeMaterial.materialId,
                name: recipeMaterial.materialName || "Unknown Material",
                brand: "Recipe Item", // More descriptive than "Unknown"
                category: "From Recipe",
                currentStock: 0,
                unit: recipeMaterial.unit,
                costPerUnit: recipeMaterial.costPerUnit,
                supplier: "From Recipe",
                supplierId: recipeMaterial.materialId,
                status: "out-of-stock" as const,
                location: "Recipe Only",
                batchNumber: undefined,
                selectedQuantity: recipeMaterial.quantity
              };
            }
            
            // If material exists in inventory, use current inventory data but preserve recipe quantity
            return {
              id: rawMaterial.id,
              name: rawMaterial.name,
              brand: rawMaterial.brand,
              category: rawMaterial.category,
              currentStock: rawMaterial.currentStock,
              unit: rawMaterial.unit,
              costPerUnit: rawMaterial.costPerUnit,
              supplier: rawMaterial.supplier,
              supplierId: rawMaterial.supplierId,
              status: rawMaterial.status,
              location: rawMaterial.location,
              batchNumber: rawMaterial.batchNumber,
              selectedQuantity: recipeMaterial.quantity
            };
          });
          setSelectedMaterials(recipeMaterials);
          setMaterialsFromRecipe(true);
          
          // Show notification that materials were auto-selected from recipe
          const availableMaterials = recipeMaterials.filter(m => m.currentStock > 0);
          const unavailableMaterials = recipeMaterials.filter(m => m.currentStock === 0);
          
          let notificationMessage = `Recipe loaded successfully.`;
          if (unavailableMaterials.length > 0) {
            notificationMessage += ` ${unavailableMaterials.length} material${unavailableMaterials.length > 1 ? 's' : ''} out of stock.`;
          }
          
          showNotification(
            `📋 Recipe Auto-Filled`,
            notificationMessage,
            unavailableMaterials.length > 0 ? 'warning' : 'success'
          );
        }
      }
    }
    
    // Load raw materials from inventory (should be initialized by DataInitializer)
    const materials = getFromStorage('rajdhani_raw_materials') || [];
    setRawMaterials(materials);
    
    // Load machines
    const machinesData = getFromStorage('rajdhani_machines') || [];
    setMachines(machinesData);
    
    // Load production flow
    if (productId) {
      const flow = getProductionFlow(productId);
      setProductionFlow(flow);
    }
  }, [productId, navigate]);

  // Get available materials (in stock)
  const getAvailableMaterials = () => {
    return rawMaterials.filter(material => material.status === "in-stock" && material.currentStock > 0);
  };

  // Handle material selection change
  const handleMaterialSelection = (materialId: string) => {
    const selectedMaterial = rawMaterials.find(m => m.id === materialId);
    if (selectedMaterial) {
      setNewMaterial({
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        quantity: "",
        unit: selectedMaterial.unit,
        cost: selectedMaterial.costPerUnit.toString()
      });
    }
  };

  // Handle material selection from popup
  const handleMaterialSelectionFromPopup = (material: RawMaterial) => {
    setNewMaterial({
      materialId: material.id,
      materialName: material.name,
      quantity: "",
      unit: material.unit,
      cost: material.costPerUnit.toString()
    });
    setIsMaterialSelectionOpen(false);
  };

  // Add material to selection with quantity
  const addMaterialToSelection = (material: RawMaterial, quantity: number) => {
    const existingIndex = selectedMaterials.findIndex(m => m.id === material.id);
    if (existingIndex >= 0) {
      // Update existing material quantity
      const updated = [...selectedMaterials];
      updated[existingIndex].selectedQuantity = quantity;
      setSelectedMaterials(updated);
    } else {
      // Add new material
      setSelectedMaterials([...selectedMaterials, { ...material, selectedQuantity: quantity }]);
    }
  };

  // Remove material from selection
  const removeMaterialFromSelection = (materialId: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== materialId));
  };

  // Remove material from production and update recipe
  const removeMaterialFromProduction = (materialId: string) => {
    if (!productionProduct) return;

    const updatedMaterials = (productionProduct.materialsConsumed || []).filter(
      material => material.materialId !== materialId
    );

    const updatedProduct: ProductionProduct = {
      ...productionProduct,
      materialsConsumed: updatedMaterials
    };

    updateProductionProduct(updatedProduct);

    // Update recipe with current materials
    const recipe = createRecipeFromMaterials(
      productionProduct.productId,
      productionProduct.productName,
      updatedMaterials.map(m => ({
        id: m.materialId,
        name: m.materialName,
        selectedQuantity: m.quantity,
        unit: m.unit,
        costPerUnit: m.cost / m.quantity,
        currentStock: 0 // We don't need stock info for recipe
      }))
    );

    if (recipe) {
      const existingRecipe = getProductRecipe(productionProduct.productId);
      if (existingRecipe) {
        recipe.id = existingRecipe.id;
        recipe.createdAt = existingRecipe.createdAt;
        recipe.createdBy = existingRecipe.createdBy;
      }
      saveProductRecipe(recipe);
    }

    // Update the product's materialsUsed field in the main products storage
    updateProductMaterialsInStorage(productionProduct.productId, updatedMaterials.map(m => {
      const rawMaterial = rawMaterials.find(rm => rm.id === m.materialId);
      return {
        ...rawMaterial!,
        selectedQuantity: m.quantity
      };
    }));

    showNotification(
      `🗑️ Material Removed`,
      `Material removed from production. Recipe updated.`,
      'success'
    );
  };

  // Update product materials in main products storage
  const updateProductMaterialsInStorage = (productId: string, materials: Array<RawMaterial & { selectedQuantity: number }>) => {
    const products = getFromStorage('rajdhani_products') || [];
    const updatedProducts = products.map((product: any) => {
      if (product.id === productId) {
        return {
          ...product,
          materialsUsed: materials.map(m => ({
            materialName: m.name,
            quantity: m.selectedQuantity,
            unit: m.unit,
            cost: m.costPerUnit * m.selectedQuantity
          })),
          totalCost: materials.reduce((sum, m) => sum + (m.costPerUnit * m.selectedQuantity), 0)
        };
      }
      return product;
    });
    replaceStorage('rajdhani_products', updatedProducts);
  };

  // Show notification
  const showNotification = (title: string, message: string, type: 'success' | 'warning' | 'error') => {
    const notification = {
      id: `notification-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...(prev || []), notification]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => (prev || []).filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Send material shortage notification to material inventory
  const sendMaterialShortageNotification = (material: RawMaterial, shortage: number) => {
    const shortageNotification = {
      id: `shortage-${Date.now()}`,
      type: 'material-shortage',
      materialId: material.id,
      materialName: material.name,
      requiredQuantity: shortage,
      unit: material.unit,
      currentStock: material.currentStock,
      supplier: material.supplier,
      costPerUnit: material.costPerUnit,
      estimatedCost: shortage * material.costPerUnit,
      createdAt: new Date().toISOString(),
      status: 'pending',
      priority: 'high',
      source: 'production'
    };

    // Save to localStorage
    const existingNotifications = JSON.parse(localStorage.getItem('rajdhani_material_notifications') || '[]');
    existingNotifications.push(shortageNotification);
    localStorage.setItem('rajdhani_material_notifications', JSON.stringify(existingNotifications));
    
    // Debug: Log to console
    console.log('Notification sent:', shortageNotification);
    console.log('All notifications:', existingNotifications);
  };

  // Add all selected materials to production
  const addSelectedMaterialsToProduction = () => {
    if (!productionProduct) return;

    // Filter out materials with insufficient stock
    const availableMaterials = selectedMaterials.filter(material => 
      material.currentStock >= material.selectedQuantity
    );

    const unavailableMaterials = selectedMaterials.filter(material => 
      material.currentStock < material.selectedQuantity
    );

    // Show warning if some materials are unavailable
    if (unavailableMaterials.length > 0) {
      showNotification(
        `⚠️ ${unavailableMaterials.length} Material${unavailableMaterials.length > 1 ? 's' : ''} Not Added`,
        `Materials with insufficient stock were not added. Use the "Notify" button to request restocking.`,
        'warning'
      );
    }

    // Only add materials with sufficient stock
    if (availableMaterials.length === 0) {
      showNotification(
        `❌ No Materials Added`,
        `All selected materials have insufficient stock. Please notify for restocking or adjust quantities.`,
        'error'
      );
      return;
    }

    const newMaterials: MaterialConsumption[] = availableMaterials.map(material => ({
      materialId: material.id,
      materialName: material.name,
      quantity: material.selectedQuantity,
      unit: material.unit,
      cost: material.costPerUnit * material.selectedQuantity,
      consumedAt: new Date().toISOString()
    }));

    // Combine materials with same ID (add quantities together)
    const existingMaterials = productionProduct.materialsConsumed || [];
    const combinedMaterials = [...existingMaterials];
    
    newMaterials.forEach(newMaterial => {
      const existingIndex = combinedMaterials.findIndex(
        existing => existing.materialId === newMaterial.materialId
      );
      
      if (existingIndex >= 0) {
        // Combine with existing material
        combinedMaterials[existingIndex] = {
          ...combinedMaterials[existingIndex],
          quantity: combinedMaterials[existingIndex].quantity + newMaterial.quantity,
          cost: combinedMaterials[existingIndex].cost + newMaterial.cost
        };
      } else {
        // Add new material
        combinedMaterials.push(newMaterial);
      }
    });

    const updatedProduct: ProductionProduct = {
      ...productionProduct,
      materialsConsumed: combinedMaterials
    };

    updateProductionProduct(updatedProduct);
    
    // Note: Material inventory will be deducted only after waste generation step
    // This allows for proper waste tracking and management
    
    // Save or update recipe for future use
    const existingRecipe = getProductRecipe(productionProduct.productId);
    
    if (!existingRecipe) {
      // Create new recipe - this is the first time materials are added for this product
      const recipe = createRecipeFromMaterials(
        productionProduct.productId,
        productionProduct.productName,
        availableMaterials
      );
      saveProductRecipe(recipe);
      
      // Update the product's materialsUsed field in the main products storage
      updateProductMaterialsInStorage(productionProduct.productId, availableMaterials);
      
      showNotification(
        `📝 Recipe Created & Saved`,
        `Recipe saved for ${productionProduct.productName}. ${availableMaterials.length} materials will auto-fill next time.`,
        'success'
      );
    } else {
      // Recipe exists - always update it with current materials
        const updatedRecipe = createRecipeFromMaterials(
          productionProduct.productId,
          productionProduct.productName,
          availableMaterials
        );
        // Keep the original creation info but update the recipe
        updatedRecipe.id = existingRecipe.id;
        updatedRecipe.createdAt = existingRecipe.createdAt;
        updatedRecipe.createdBy = existingRecipe.createdBy;
        
        saveProductRecipe(updatedRecipe);
      
      // Update the product's materialsUsed field in the main products storage
      updateProductMaterialsInStorage(productionProduct.productId, availableMaterials);
      
      // Only show notification if materials were not auto-filled from recipe
      if (!materialsFromRecipe) {
        showNotification(
          `📝 Recipe Updated`,
          `Recipe for ${productionProduct.productName} has been updated with current materials.`,
          'success'
        );
      }
    }
    
    // Update production flow if material selection step is active
    const flow = getProductionFlow(productionProduct.id);
    if (flow) {
      const materialStep = flow.steps.find(s => s.stepType === 'material_selection' && s.status === 'in_progress');
      if (materialStep) {
        // Auto-complete material selection step
        updateProductionStep(flow.id, materialStep.id, {
          status: 'completed',
          endTime: new Date().toISOString(),
          inspectorId: 'Admin',
          qualityNotes: `Materials selected: ${availableMaterials.length} items`
        });
        moveToNextStep(flow.id);
      }
    }
    
    // Show success notification
    showNotification(
      `✅ ${availableMaterials.length} Material${availableMaterials.length > 1 ? 's' : ''} Added`,
      `Materials with sufficient stock have been added to production.`,
      'success'
    );
    
    setSelectedMaterials([]);
    setIsMaterialSelectionOpen(false);
  };

  // Update raw material inventory (deduct consumed quantities)
  const updateRawMaterialInventory = (consumedMaterials: Array<RawMaterial & { selectedQuantity: number }>) => {
    const updatedMaterials = rawMaterials.map(material => {
      const consumed = consumedMaterials.find(cm => cm.id === material.id);
      if (consumed) {
        const newQuantity = material.currentStock - consumed.selectedQuantity;
          return {
          ...material,
          currentStock: Math.max(0, newQuantity), // Ensure quantity doesn't go below 0
          status: newQuantity <= 0 ? "out-of-stock" as const : 
                  newQuantity <= 10 ? "low-stock" as const : "in-stock" as const
        };
      }
      return material;
    });
    
    // Update localStorage
    localStorage.setItem('rajdhani_raw_materials', JSON.stringify(updatedMaterials));
    setRawMaterials(updatedMaterials);
  };

  // Get filtered materials for search
  const getFilteredMaterials = () => {
    return rawMaterials.filter(material => 
      material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(materialSearchTerm.toLowerCase())
    );
  };

  // Machine management functions
  const addNewMachine = () => {
    if (!newMachineForm.name.trim()) {
      showNotification("Error", "Machine name is required", "error");
      return;
    }

    const newMachine = {
      id: generateUniqueId('MACHINE'),
      name: newMachineForm.name,
      location: newMachineForm.location || "Factory Floor",
      description: newMachineForm.description || ""
    };

    const updatedMachines = [...machines, newMachine];
    setMachines(updatedMachines);
    replaceStorage('rajdhani_machines', updatedMachines);

    // Reset form
    setNewMachineForm({ name: "", location: "", description: "" });
    setShowAddMachinePopup(false);
    
    showNotification("Success", `Machine "${newMachine.name}" added successfully`, "success");
  };

  const handleMachineSelection = () => {
    if (!selectedMachineId || !inspectorName.trim()) {
      showNotification("Error", "Please select a machine and enter inspector name", "error");
      return;
    }

    const selectedMachine = machines.find(m => m.id === selectedMachineId);
    if (!selectedMachine) {
      showNotification("Error", "Selected machine not found", "error");
      return;
    }

    // Add machine step to production flow
    addMachineStepToFlow(selectedMachine, inspectorName);
    
    // Update production status from "planning" to "active" when machine is added
    if (productionProduct && productionProduct.status === "planning") {
      const updatedProduct: ProductionProduct = {
        ...productionProduct,
        status: "active"
      };
      updateProductionProduct(updatedProduct);
      
      showNotification(
        "✅ Production Started",
        "Production status updated to Active. Machine operation has been added to the flow.",
        "success"
      );
    }
    
    // Navigate to dynamic flow page after machine selection
    navigate(`/production/${productId}/dynamic-flow`);
    
    // Reset form
    setSelectedMachineId("");
    setInspectorName("");
    setShowMachineSelectionPopup(false);
  };

  const addMachineStepToFlow = (machine: any, inspector: string) => {
    if (!productionProduct) return;

    console.log('Adding machine step to flow:', machine, inspector);
    console.log('Production product ID:', productionProduct.id);

    // Get or create production flow
    let flow = getProductionFlow(productionProduct.id);
    console.log('Existing flow:', flow);
    
    if (!flow) {
      // Create new flow if doesn't exist
      flow = {
        id: generateUniqueId('FLOW'),
        productionProductId: productionProduct.id,
        steps: [
          {
            id: generateUniqueId('STEP'),
            stepNumber: 1,
            name: 'Raw Material Selection',
            description: 'Materials already selected in planning phase',
            machineId: null,
            machineName: 'Completed',
            status: 'completed' as const,
            inspectorId: 'Admin',
            stepType: 'material_selection' as const,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            qualityNotes: 'Materials selected during planning phase',
            createdAt: new Date().toISOString()
          }
        ],
        currentStepIndex: 0,
        status: 'in_progress' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('Created new flow:', flow);
    }

    // Create new machine step
    const newStep = {
      id: generateUniqueId('STEP'),
      stepNumber: flow.steps.length + 1,
      name: machine.name,
      description: machine.description || `Machine operation using ${machine.name}`,
      machineId: machine.id,
      machineName: machine.name,
      status: 'pending' as const,
      inspector: inspector,
      stepType: 'machine_operation' as const,
      createdAt: new Date().toISOString()
    };

    console.log('Created new machine step:', newStep);

    // Add step to flow
    const updatedSteps = [...flow.steps, newStep];
    const updatedFlow = {
      ...flow,
      steps: updatedSteps,
      currentStepIndex: updatedSteps.length - 1,
      updatedAt: new Date().toISOString()
    };

    console.log('Updated flow:', updatedFlow);

    // Save flow using the same method as DynamicProductionFlow
    const flows = getFromStorage('rajdhani_production_flows') || [];
    const existingFlowIndex = flows.findIndex(f => f.id === flow.id);
    
    if (existingFlowIndex >= 0) {
      flows[existingFlowIndex] = updatedFlow;
    } else {
      flows.push(updatedFlow);
    }
    
    console.log('Saving flows to storage:', flows);
    replaceStorage('rajdhani_production_flows', flows);
    
    // Verify the flow was saved
    const savedFlows = getFromStorage('rajdhani_production_flows') || [];
    console.log('Verification - flows after saving:', savedFlows);
    const savedFlow = savedFlows.find(f => f.id === updatedFlow.id);
    console.log('Verification - saved flow found:', savedFlow);

    showNotification("Success", `Machine step "${machine.name}" added to production flow`, "success");
  };

  const skipToWasteGeneration = () => {
    if (!productionProduct) return;

    // Navigate to waste generation page
    navigate(`/production/${productId}/waste-generation`);
    setShowMachineSelectionPopup(false);
  };


  const updateProductionProduct = (updatedProduct: ProductionProduct) => {
    const products = getFromStorage('rajdhani_production_products');
    const updatedProducts = products.map((p: ProductionProduct) => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    localStorage.setItem('rajdhani_production_products', JSON.stringify(updatedProducts));
    setProductionProduct(updatedProduct);
  };

  const addMaterialConsumption = () => {
    if (!productionProduct || !newMaterial.materialId || !newMaterial.quantity) return;

    const material: MaterialConsumption = {
      materialId: newMaterial.materialId,
      materialName: newMaterial.materialName,
      quantity: parseFloat(newMaterial.quantity),
      unit: newMaterial.unit,
      cost: parseFloat(newMaterial.cost) || 0,
      consumedAt: new Date().toISOString()
    };

    // Combine materials with same ID (add quantities together)
    const existingMaterials = productionProduct.materialsConsumed || [];
    const combinedMaterials = [...existingMaterials];
    
    const existingIndex = combinedMaterials.findIndex(
      existing => existing.materialId === material.materialId
    );
    
    if (existingIndex >= 0) {
      // Combine with existing material
      combinedMaterials[existingIndex] = {
        ...combinedMaterials[existingIndex],
        quantity: combinedMaterials[existingIndex].quantity + material.quantity,
        cost: combinedMaterials[existingIndex].cost + material.cost
      };
    } else {
      // Add new material
      combinedMaterials.push(material);
    }

    const updatedProduct: ProductionProduct = {
      ...productionProduct,
      materialsConsumed: combinedMaterials
    };

    updateProductionProduct(updatedProduct);
    
    // Note: Material inventory will be deducted only after waste generation step
    // This allows for proper waste tracking and management
    
    // Create or update recipe with all current materials
    const existingRecipe = getProductRecipe(productionProduct.productId);
    if (!existingRecipe && combinedMaterials.length > 0) {
      // Convert MaterialConsumption to the format needed for recipe
      const materialsForRecipe = combinedMaterials.map(mat => {
        const rawMat = rawMaterials.find(rm => rm.id === mat.materialId);
        return {
          ...rawMat!,
          selectedQuantity: mat.quantity
        };
      });
      
      const recipe = createRecipeFromMaterials(
        productionProduct.productId,
        productionProduct.productName,
        materialsForRecipe
      );
      saveProductRecipe(recipe);
      showNotification(
        `📝 Recipe Auto-Created`,
        `Recipe created for ${productionProduct.productName} with ${combinedMaterials.length} material${combinedMaterials.length > 1 ? 's' : ''}.\n\nNext time you add this product to production, materials will auto-fill!`,
        'success'
      );
    }
    
    // Reset form
    setNewMaterial({
      materialId: "",
      materialName: "",
      quantity: "",
      unit: "",
      cost: ""
    });
    setIsAddingMaterial(false);
  };


  const saveExpectedProduct = () => {
    if (!productionProduct) return;

    const updatedProduct: ProductionProduct = {
      ...productionProduct,
      expectedProduct: expectedProduct
    };

    updateProductionProduct(updatedProduct);
    setIsEditingExpected(false);
  };


  const completeProduction = () => {
    if (!productionProduct) return;
    
    // Check if materials have been added
    if (!productionProduct.materialsConsumed || productionProduct.materialsConsumed.length === 0) {
      showNotification(
        "⚠️ Materials Required", 
        "Please add at least one material before proceeding to individual product details.", 
        "error"
      );
            return;
          }
    
    
    // Navigate to individual product details page without changing status
    // Status will be changed to "completed" only when individual products are finalized
    navigate(`/production/complete/${productionProduct.id}`);
  };

  if (!productionProduct) {
    return <Loading message="Loading production details..." />;
  }

  const totalMaterialCost = (productionProduct.materialsConsumed || []).reduce((sum, m) => sum + m.cost, 0);

    return (
    <div className="flex-1 space-y-6 p-6">
      {/* Notifications */}
      {notifications && notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`max-w-sm p-4 rounded-lg shadow-lg border-l-4 ${
                notification.type === 'success' ? 'bg-green-50 border-green-400' :
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-red-50 border-red-400'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                    </div>
                <div className="ml-3 flex-1">
                  <h4 className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' :
                    notification.type === 'warning' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {notification.title}
                  </h4>
                  <p className={`text-sm mt-1 whitespace-pre-line ${
                    notification.type === 'success' ? 'text-green-700' :
                    notification.type === 'warning' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Header 
        title={`Production: ${productionProduct.productName}`}
        subtitle={`Track material consumption and waste generation`}
      />

      {/* Production Progress Bar */}
      <ProductionProgressBar
        currentStep={
          productionProduct.status === "planning" ? "material_selection" :
          productionProduct.status === "active" ? "machine_operation" :
          "testing_individual"
        }
        steps={[
          {
            id: "material_selection",
            name: "Material Selection",
            status: productionProduct.materialsConsumed?.length > 0 ? "completed" : "in_progress",
            stepType: "material_selection"
          },
          {
            id: "machine_operation",
            name: "Machine Operations",
            status: productionFlow?.steps?.some((s: any) => s.stepType === 'machine_operation') ? "in_progress" : "pending",
            stepType: "machine_operation"
          },
          {
            id: "wastage_tracking",
            name: "Waste Generation",
            status: "pending",
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
        onStepClick={(stepType) => {
          switch (stepType) {
            case 'material_selection':
              // Stay on current page (material selection is handled here)
              break;
            case 'machine_operation':
              // Navigate to dynamic production flow page
              navigate(`/production/${productId}/dynamic-flow`);
              break;
            case 'wastage_tracking':
              // Navigate to waste generation page
              navigate(`/production/${productId}/waste-generation`);
              break;
            case 'testing_individual':
              // Navigate to complete/individual details page
              navigate(`/production/complete/${productId}`);
              break;
          }
        }}
      />

      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/production')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Production
            </Button> 
        
        {productionProduct.status === "planning" && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Add materials for planning phase
              {(!productionProduct.materialsConsumed || productionProduct.materialsConsumed.length === 0) && (
                <span className="text-red-600 ml-2">⚠️ Materials required</span>
              )}
            </div>
            <Button 
              onClick={() => {
                // Check if materials are added
                if (!productionProduct.materialsConsumed || productionProduct.materialsConsumed.length === 0) {
                  showNotification(
                    "⚠️ Materials Required", 
                    "Please add at least one material before starting production flow.", 
                    "error"
                  );
                  return;
                }
                // Show machine selection popup instead of direct navigation
                setSelectedMachineId("");
                setInspectorName("");
                setShowMachineSelectionPopup(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!productionProduct.materialsConsumed || productionProduct.materialsConsumed.length === 0}
            >
              <Factory className="w-4 h-4 mr-2" />
              Start Production Flow
            </Button>
          </div>
        )}

        {productionProduct.status === "active" && (
          <Button 
            onClick={() => {
              setSelectedMachineId("");
              setInspectorName("");
              setShowMachineSelectionPopup(true);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Factory className="w-4 h-4 mr-2" />
            Add Machine Operation
          </Button>
        )}
        
        
      </div>

      {/* Material Planning Section */}
      {/* Production Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Production Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                {productionProduct.targetQuantity}
              </div>
              <div className="text-sm text-gray-500">Target Quantity</div>
                       </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {productionProduct.materialsConsumed?.length || 0}
                        </div>
              <div className="text-sm text-gray-500">Materials Used</div>
                        </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ₹{totalMaterialCost.toLocaleString()}
                      </div>
              <div className="text-sm text-gray-500">Total Cost</div>
                        </div>
            </div>
        </CardContent>
      </Card>

      {/* Expected Product Details */}
      <Card>
        <CardHeader>
                  <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Expected Product Details
                        </CardTitle>
                      <Button 
                        variant="outline"
              size="sm"
              onClick={() => setIsEditingExpected(!isEditingExpected)}
            >
              {isEditingExpected ? "Cancel" : "Edit"}
                      </Button>
                  </div>
        </CardHeader>
        <CardContent>
          {isEditingExpected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                  <Label>Product Name</Label>
                  <Input
                    value={expectedProduct.name}
                    onChange={(e) => setExpectedProduct({...expectedProduct, name: e.target.value})}
                    placeholder="Expected product name"
                  />
                  </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={expectedProduct.category}
                    onChange={(e) => setExpectedProduct({...expectedProduct, category: e.target.value})}
                    placeholder="Product category"
                  />
                </div>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dimensions</Label>
                  <Input
                    value={expectedProduct.dimensions}
                    onChange={(e) => setExpectedProduct({...expectedProduct, dimensions: e.target.value})}
                    placeholder="e.g., 8' x 10'"
                  />
              </div>
                <div>
                  <Label>Weight</Label>
                  <Input
                    value={expectedProduct.weight}
                    onChange={(e) => setExpectedProduct({...expectedProduct, weight: e.target.value})}
                    placeholder="e.g., 45 kg"
                  />
                  </div>
                </div>
              <div className="grid grid-cols-2 gap-4">
                      <div>
                  <Label>Thickness</Label>
                  <Input
                    value={expectedProduct.thickness}
                    onChange={(e) => setExpectedProduct({...expectedProduct, thickness: e.target.value})}
                    placeholder="e.g., 12 mm"
                  />
                  </div>
                <div>
                  <Label>Pile Height</Label>
                  <Input
                    value={expectedProduct.pileHeight}
                    onChange={(e) => setExpectedProduct({...expectedProduct, pileHeight: e.target.value})}
                    placeholder="e.g., 8 mm"
                  />
                </div>
                  </div>
              <div>
                <Label>Material Composition</Label>
                <Input
                  value={expectedProduct.materialComposition}
                  onChange={(e) => setExpectedProduct({...expectedProduct, materialComposition: e.target.value})}
                  placeholder="e.g., 80% Cotton, 20% Wool"
                />
                </div>
              <div>
                <Label>Quality Grade</Label>
                <Input
                  value={expectedProduct.qualityGrade}
                  onChange={(e) => setExpectedProduct({...expectedProduct, qualityGrade: e.target.value})}
                  placeholder="e.g., A+, A, B"
                />
              </div>
              <Button onClick={saveExpectedProduct} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Expected Product
              </Button>
                  </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                <span className="text-gray-500">Name:</span>
                <p className="font-medium">{expectedProduct.name || "Not set"}</p>
                  </div>
                    <div>
                <span className="text-gray-500">Category:</span>
                <p className="font-medium">{expectedProduct.category || "Not set"}</p>
                    </div>
                    <div>
                <span className="text-gray-500">Dimensions:</span>
                <p className="font-medium">{expectedProduct.dimensions || "Not set"}</p>
                </div>
                    <div>
                <span className="text-gray-500">Weight:</span>
                <p className="font-medium">{expectedProduct.weight || "Not set"}</p>
              </div>
            </div>
            )}
        </CardContent>
      </Card>

            {/* Material Consumption Tracking */}
      <Card>
        <CardHeader>
                  <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Material Consumption
                        </CardTitle>
                       <Button
                         variant="outline"
                         size="sm"
              onClick={() => setIsMaterialSelectionOpen(true)}
                       >
              <Plus className="w-4 h-4 mr-2" />
              Select Materials
                       </Button>
                  </div>
                </CardHeader>
        <CardContent>
          {/* Selected Materials Table (Excel-like) */}
          {selectedMaterials.length > 0 && (
                  <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium">Selected Materials</h4>
                {materialsFromRecipe ? (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    From Saved Recipe
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                    <Plus className="w-3 h-3 mr-1" />
                    Will Create Recipe
                  </Badge>
                )}
                    </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left font-medium hidden lg:table-cell">Material ID</th>
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium hidden md:table-cell">Brand/Supplier</th>
                      <th className="p-3 text-left font-medium hidden lg:table-cell">Unit Price (₹)</th>
                      <th className="p-3 text-left font-medium hidden md:table-cell">Available Qty</th>
                      <th className="p-3 text-left font-medium">Using Qty</th>
                      <th className="p-3 text-left font-medium hidden lg:table-cell">Total Cost (₹)</th>
                      <th className="p-3 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMaterials.map((material, index) => (
                      <tr key={material.id || `material-${index}`} className={`border-t hover:bg-gray-50 ${material.currentStock === 0 ? 'bg-red-50' : ''}`}>
                        <td className="p-3 font-mono text-xs hidden lg:table-cell">
                          {material.id}
                          {material.supplier === "From Recipe" && (
                            <span className="ml-1 text-blue-600" title="Material from saved recipe">📋</span>
                          )}
                        </td>
                        <td className="p-3 font-medium">
                          {material.name}
                          {material.supplier === "From Recipe" && (
                            <Badge variant="secondary" className="ml-2 text-xs">Recipe</Badge>
                          )}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          {material.supplier === "From Recipe" ? (
                            <span className="text-blue-600">From Recipe</span>
                          ) : (
                            material.supplier
                          )}
                        </td>
                        <td className="p-3 hidden lg:table-cell">₹{material.costPerUnit}</td>
                        <td className="p-3 hidden md:table-cell">
                          {material.currentStock} {material.unit}
                          {material.currentStock === 0 && material.supplier === "From Recipe" && (
                            <span className="ml-1 text-red-600 text-xs">Not in inventory</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                                                       <Input
                              type="number"
                              value={material.selectedQuantity || 1}
                              onChange={(e) => addMaterialToSelection(material, parseFloat(e.target.value) || 1)}
                              className={`w-20 ${(material.selectedQuantity || 1) > material.currentStock ? 'border-red-300 bg-red-50' : ''}`}
                              min="1"
                            />
                            {(material.selectedQuantity || 1) > material.currentStock && (
                              <div className="space-y-1">
                                <div className="text-xs text-red-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Shortage: {(material.selectedQuantity || 1) - material.currentStock} {material.unit}
                  </div>
                        <Button 
                             size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const shortage = (material.selectedQuantity || 1) - material.currentStock;
                                    sendMaterialShortageNotification(material, shortage);
                                    showNotification(
                                      `📋 Notification Sent`,
                                      `Shortage notification sent to Material Inventory for ${material.name}`,
                                      'success'
                                    );
                                  }}
                                  className="text-xs h-6 px-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Notify
                        </Button>
                         </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-medium hidden lg:table-cell">₹{((material.costPerUnit || 0) * (material.selectedQuantity || 1)).toFixed(2)}</td>
                        <td className="p-3">
                      <Button 
                        variant="outline"
                             size="sm"
                            onClick={() => removeMaterialFromSelection(material.id)}
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
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Total Cost: ₹{selectedMaterials.reduce((sum, m) => sum + ((m.costPerUnit || 0) * (m.selectedQuantity || 1)), 0).toFixed(2)}
                            </div>
                <Button onClick={addSelectedMaterialsToProduction} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Add to Production
                           </Button>
                        </div>
                      </div>
                        )}
          
          {/* Consumed Materials List */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-medium">Materials Consumed in Production</h4>
              {productionProduct.materialsConsumed && productionProduct.materialsConsumed.length > 0 ? (
                materialsFromRecipe ? (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Auto-filled from Recipe
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                    📝 Recipe will be saved
                  </Badge>
                )
              ) : (
                <Badge variant="outline" className="text-xs text-gray-500">
                  No materials added yet
                </Badge>
              )}
                  </div>
            {productionProduct.materialsConsumed?.map((material, index) => {
              const rawMaterial = rawMaterials.find(rm => rm.id === material.materialId);
              const isAvailable = rawMaterial && rawMaterial.currentStock > 0;
              
              return (
                <div key={material.materialId || `material-${index}`} className={`flex items-center justify-between p-3 rounded-lg ${
                  isAvailable ? 'bg-gray-50' : 'bg-red-50 border border-red-200'
                }`}>
                      <div>
                        <div className="font-medium">{material.materialName}</div>
                        <div className="text-sm text-gray-500">
                          ID: {material.materialId} • Brand: {rawMaterial?.brand || "Unknown"} • Supplier: {rawMaterial?.supplier || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {material.quantity} {material.unit} • ₹{material.cost} • {new Date(material.consumedAt).toLocaleDateString()}
                      </div>
                        <div className="text-sm text-gray-500">
                          Available: {rawMaterial?.currentStock || 0} {material.unit} • Unit Price: ₹{rawMaterial?.costPerUnit || material.cost / material.quantity}
                      </div>
                    {!isAvailable && (
                      <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        Not in inventory - needs to be purchased
              </div>
            )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isAvailable && (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                    <Badge variant="outline">{material.materialId}</Badge>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => removeMaterialFromProduction(material.materialId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    </div>
                    </div>
              );
            })}
            {(!productionProduct.materialsConsumed || productionProduct.materialsConsumed.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No materials consumed yet</p>
                <p className="text-sm">Click "Select Materials" to start tracking</p>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>


      {/* Raw Material Selection Popup */}
      <Dialog open={isMaterialSelectionOpen} onOpenChange={setIsMaterialSelectionOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
            <DialogTitle>Select Raw Materials from Inventory</DialogTitle>
             <DialogDescription>
              Search and select materials from your raw material inventory. Set quantities and add to production.
             </DialogDescription>
           </DialogHeader>
           
          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search materials by name or category..."
                value={materialSearchTerm}
                onChange={(e) => setMaterialSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              {getFilteredMaterials().length} materials found
            </div>
               </div>
               
          {/* Materials Grid */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-4">
              {getFilteredMaterials().map((material) => (
                <MaterialSelectionCard
                  key={material.id}
                  material={material}
                  onAddToSelection={addMaterialToSelection}
                  isSelected={selectedMaterials.some(m => m.id === material.id)}
                />
              ))}
                       </div>
          </div>

          {/* Selected Materials Summary */}
          {selectedMaterials.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Selected Materials ({selectedMaterials.length})</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedMaterials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                       <div className="flex-1">
                      <span className="font-medium">{material.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {material.selectedQuantity || 1} {material.unit} • ₹{((material.costPerUnit || 0) * (material.selectedQuantity || 1)).toFixed(2)}
                      </span>
                       </div>
                       <Button 
                         variant="outline" 
                         size="sm"
                      onClick={() => removeMaterialFromSelection(material.id)}
                           className="text-red-600 hover:text-red-700"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                   </div>
                 ))}
               </div>
              <div className="flex justify-between items-center mt-4">
                <div className="font-medium">
                  Total Cost: ₹{(selectedMaterials || []).reduce((sum, m) => sum + ((m.costPerUnit || 0) * (m.selectedQuantity || 1)), 0).toFixed(2)}
             </div>
                <div className="flex flex-col items-end gap-2">
                  {selectedMaterials && selectedMaterials.some(m => (m.selectedQuantity || 1) > m.currentStock) && (
                    <div className="text-xs text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Some materials have insufficient stock
               </div>
                  )}
                  <Button 
                    onClick={addSelectedMaterialsToProduction} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!selectedMaterials || selectedMaterials.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Add Available Materials
                  </Button>
             </div>
           </div>
             </div>
          )}

           <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaterialSelectionOpen(false)}>
              Cancel
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

      {/* Machine Selection Popup - Enhanced UI */}
      <Dialog open={showMachineSelectionPopup} onOpenChange={setShowMachineSelectionPopup}>
        <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-600" />
              Add Machine
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Select machine and inspector or skip to waste generation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Inspector Name */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Inspector Name *
              </Label>
              <Input
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Enter inspector name"
                className="w-full"
              />
            </div>
            
            {/* Machine Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Select Machine *
              </Label>
              <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a machine..." />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name} - {machine.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Add New Machine */}
            <div className="pt-2 border-t border-gray-100">
              <Button 
                variant="outline"
                onClick={() => setShowAddMachinePopup(true)}
                className="w-full border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Machine
              </Button>
            </div>
          </div>
          
          <DialogFooter className="space-y-2 pt-4 border-t border-gray-100">
            <Button 
              onClick={handleMachineSelection}
              disabled={!selectedMachineId || !inspectorName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Factory className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                variant="outline"
                onClick={skipToWasteGeneration}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                size="sm"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Skip
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowMachineSelectionPopup(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Machine Popup */}
      <Dialog open={showAddMachinePopup} onOpenChange={setShowAddMachinePopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Machine
            </DialogTitle>
            <DialogDescription>
              Add a new machine to the system for production use.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="machine-name">Machine Name:</Label>
              <Input
                id="machine-name"
                value={newMachineForm.name}
                onChange={(e) => setNewMachineForm({...newMachineForm, name: e.target.value})}
                placeholder="Enter machine name"
              />
            </div>
            
            <div>
              <Label htmlFor="machine-location">Location:</Label>
              <Input
                id="machine-location"
                value={newMachineForm.location}
                onChange={(e) => setNewMachineForm({...newMachineForm, location: e.target.value})}
                placeholder="Enter machine location"
              />
            </div>
            
            <div>
              <Label htmlFor="machine-description">Description:</Label>
              <Textarea
                id="machine-description"
                value={newMachineForm.description}
                onChange={(e) => setNewMachineForm({...newMachineForm, description: e.target.value})}
                placeholder="Enter machine description"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddMachinePopup(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={addNewMachine}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newMachineForm.name.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
     </div>
   );
 }

// Material Selection Card Component
interface MaterialSelectionCardProps {
  material: RawMaterial;
  onAddToSelection: (material: RawMaterial, quantity: number) => void;
  isSelected: boolean;
}

function MaterialSelectionCard({ material, onAddToSelection, isSelected }: MaterialSelectionCardProps) {
  const handleAddToSelection = () => {
    // Add with default quantity of 1, will be editable on main page
    onAddToSelection(material, 1);
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
      <div className="flex-1">
        <div className="font-medium">{material.name}</div>
        <div className="text-sm text-gray-500">
          {material.category} • {material.currentStock} {material.unit} available • ₹{material.costPerUnit} per {material.unit}
        </div>
        <div className="text-xs text-gray-400">
          Brand: {material.brand} • Supplier: {material.supplier}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge 
          variant={material.status === "in-stock" ? "default" : "destructive"}
        >
          {material.status === "in-stock" ? "In Stock" : material.status}
        </Badge>
        <Button 
          size="sm" 
          variant={isSelected ? "default" : "outline"}
          onClick={handleAddToSelection}
          disabled={isSelected}
        >
          {isSelected ? "Added" : "Add"}
        </Button>
      </div>
     </div>
   );
 }
