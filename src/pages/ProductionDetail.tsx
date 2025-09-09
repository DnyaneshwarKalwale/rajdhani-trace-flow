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
  XCircle, X
} from "lucide-react";
import { getFromStorage, updateStorage, getProductRecipe, saveProductRecipe, createRecipeFromMaterials, getProductionProductData } from "@/lib/storage";
import { ProductionFlowComponent } from "@/components/production/ProductionFlow";
import { getProductionFlow, updateProductionStep, moveToNextStep } from "@/lib/machines";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";

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
  const [isAddingWaste, setIsAddingWaste] = useState(false);
  const [isEditingExpected, setIsEditingExpected] = useState(false);
  const [isMaterialSelectionOpen, setIsMaterialSelectionOpen] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<Array<RawMaterial & { selectedQuantity: number }>>([]);
  const [notifications, setNotifications] = useState<Array<{id: string, type: 'success' | 'warning' | 'error', title: string, message: string, timestamp: Date}>>([]);
  const [materialsFromRecipe, setMaterialsFromRecipe] = useState(false);
  const [showProductionFlow, setShowProductionFlow] = useState(false);
  
  // Material consumption form
  const [newMaterial, setNewMaterial] = useState({
    materialId: "",
    materialName: "",
    quantity: "",
    unit: "",
    cost: ""
  });

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
        
        // Check if production flow exists to determine if we should show flow view
        const existingFlow = getProductionFlow(product.id);
        if (existingFlow && (product.status === "active" || existingFlow.status !== 'not_started')) {
          setShowProductionFlow(true);
          
          // Auto-complete material selection if materials are already selected and step is pending
          if (product.status === "active" && product.materialsConsumed && product.materialsConsumed.length > 0) {
            const materialStep = existingFlow.steps.find(s => s.stepType === 'material_selection');
            if (materialStep && materialStep.status === 'pending') {
              updateProductionStep(existingFlow.id, materialStep.id, {
                status: 'completed',
                endTime: new Date().toISOString(),
                inspectorName: 'Admin',
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
            if (!rawMaterial) {
              rawMaterial = rawMaterialsFromStorage.find(rm => 
                rm.name.toLowerCase() === recipeMaterial.materialName.toLowerCase()
              );
            }
            
            // If material not found in current inventory by ID or name, create a placeholder with recipe data
            if (!rawMaterial) {
              return {
                id: recipeMaterial.materialId,
                name: recipeMaterial.materialName,
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
          
          let notificationMessage = `Materials for ${product.productName} have been auto-selected from saved recipe.`;
          if (unavailableMaterials.length > 0) {
            notificationMessage += `\n\n⚠️ ${unavailableMaterials.length} material${unavailableMaterials.length > 1 ? 's are' : ' is'} currently out of stock and will need to be restocked before production.`;
          }
          if (availableMaterials.length > 0) {
            notificationMessage += `\n\n✅ ${availableMaterials.length} material${availableMaterials.length > 1 ? 's are' : ' is'} available and ready for production.`;
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
    
    // Update raw material inventory (deduct consumed quantities)
    updateRawMaterialInventory(availableMaterials);
    
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
      showNotification(
        `📝 Recipe Created & Saved`,
        `🎉 This is the first time materials were added for ${productionProduct.productName}!\n\n✅ Recipe has been automatically created and saved.\n📋 Next time you add this product to production, these ${availableMaterials.length} materials will be auto-filled:\n\n${availableMaterials.map(m => `• ${m.name} (${m.selectedQuantity} ${m.unit})`).join('\n')}`,
        'success'
      );
    } else {
      // Recipe exists - check if we should update it with new materials
      const currentMaterialIds = existingRecipe.materials.map(m => m.materialId);
      const newMaterialIds = availableMaterials.map(m => m.id);
      const hasNewMaterials = newMaterialIds.some(id => !currentMaterialIds.includes(id));
      
      if (hasNewMaterials || !materialsFromRecipe) {
        // Update existing recipe with current materials (including any new ones)
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
        showNotification(
          `📝 Recipe Updated`,
          `Recipe for ${productionProduct.productName} has been updated with current materials.\n\n🔄 Changes will be applied to future productions of this product.`,
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
          inspectorName: 'Admin',
          qualityNotes: `Materials selected: ${availableMaterials.length} items`
        });
        moveToNextStep(flow.id);
        setShowProductionFlow(true);
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
    
    // Update raw material inventory
    const consumedMaterial = rawMaterials.find(m => m.id === newMaterial.materialId);
    if (consumedMaterial) {
      updateRawMaterialInventory([{ ...consumedMaterial, selectedQuantity: parseFloat(newMaterial.quantity) }]);
    }
    
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
        setShowProductionFlow(true);
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

  const saveExpectedProduct = () => {
    if (!productionProduct) return;

    const updatedProduct: ProductionProduct = {
      ...productionProduct,
      expectedProduct: expectedProduct
    };

    updateProductionProduct(updatedProduct);
    setIsEditingExpected(false);
  };

  const startActiveProduction = () => {
    if (!productionProduct) return;
    
    // Check if materials have been added
    if (!productionProduct.materialsConsumed || productionProduct.materialsConsumed.length === 0) {
      alert("Please add at least one material before starting active production.");
      return;
    }
    
    const updatedProduct: ProductionProduct = {
      ...productionProduct,
      status: "active"
    };

    updateProductionProduct(updatedProduct);
    
    // Auto-complete the material selection step since materials are already selected
    const flow = getProductionFlow(productionProduct.id);
    if (flow) {
      const materialStep = flow.steps.find(s => s.stepType === 'material_selection');
      if (materialStep && materialStep.status === 'pending') {
        updateProductionStep(flow.id, materialStep.id, {
          status: 'completed',
          endTime: new Date().toISOString(),
          inspectorName: 'Admin',
          qualityNotes: `Materials already selected in planning phase: ${productionProduct.materialsConsumed.length} items`
        });
        // Move to next step (first machine step)
        moveToNextStep(flow.id);
      }
    }
    
    setShowProductionFlow(true);
  };

  const completeProduction = () => {
    if (!productionProduct) return;
    
    // Check if materials have been added
    if (!productionProduct.materialsConsumed || productionProduct.materialsConsumed.length === 0) {
      alert("Please add at least one material before proceeding to individual product details.");
            return;
          }
    
    // Check if waste has been added (optional but recommended)
    if (!productionProduct.wasteGenerated || productionProduct.wasteGenerated.length === 0) {
      const confirmProceed = confirm("No waste has been recorded. Do you want to proceed without waste tracking?");
      if (!confirmProceed) {
            return;
          }
    }
    
    // Navigate to individual product details page without changing status
    // Status will be changed to "completed" only when individual products are finalized
    navigate(`/production/complete/${productionProduct.id}`);
  };

  if (!productionProduct) {
    return <Loading message="Loading production details..." />;
  }

  const totalMaterialCost = (productionProduct.materialsConsumed || []).reduce((sum, m) => sum + m.cost, 0);
  const totalWasteQuantity = (productionProduct.wasteGenerated || []).reduce((sum, w) => sum + w.quantity, 0);

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

      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/production')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Production
            </Button>
        
        {productionProduct.status === "planning" && (
        <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Add materials and waste for planning phase
              {(!productionProduct.materialsConsumed || productionProduct.materialsConsumed.length === 0) && (
                <span className="text-red-600 ml-2">⚠️ Materials required</span>
              )}
            </div>
          <Button 
              onClick={startActiveProduction} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!productionProduct.materialsConsumed || productionProduct.materialsConsumed.length === 0}
            >
              <Factory className="w-4 h-4 mr-2" />
              Start Production Flow
          </Button>
          </div>
        )}
        
        {productionProduct.status === "active" && showProductionFlow && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Production flow is active - manage through steps below
            </div>
            <Button 
              onClick={() => setShowProductionFlow(false)}
              variant="outline"
            >
              Show Material Planning
            </Button>
          </div>
        )}
        
        {productionProduct.status === "active" && !showProductionFlow && (() => {
          const flow = getProductionFlow(productionProduct.id);
          const currentStep = flow?.steps[flow.currentStepIndex];
          const stepTypeMessage = 
            currentStep?.stepType === 'material_selection' ? 'Complete material selection to continue' :
            currentStep?.stepType === 'wastage_tracking' ? 'Complete wastage tracking to continue' :
            'Continue with production flow or add more materials';
          
          return (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {stepTypeMessage}
              </div>
              <Button 
                onClick={() => setShowProductionFlow(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Factory className="w-4 h-4 mr-2" />
                Continue Production Flow
              </Button>
            </div>
          );
        })()}
        
      </div>

      {/* Production Flow Component */}
      {showProductionFlow && productionProduct.status === "active" && (
        <ProductionFlowComponent 
          productionProductId={productionProduct.id}
          onStepComplete={(step) => {
            // Handle different step types
            if (step.stepType === 'material_selection') {
              // Mark materials as completed if materials are already selected
              if (productionProduct.materialsConsumed && productionProduct.materialsConsumed.length > 0) {
                const flow = getProductionFlow(productionProduct.id);
                if (flow) {
                  updateProductionStep(flow.id, step.id, {
                    status: 'completed',
                    endTime: new Date().toISOString(),
                    inspectorName: 'Admin',
                    qualityNotes: `Materials selected: ${productionProduct.materialsConsumed.length} items`
                  });
                  moveToNextStep(flow.id);
                }
              } else {
                // Show material selection section
                setShowProductionFlow(false);
              }
              return;
            }
            
            if (step.stepType === 'wastage_tracking') {
              // Show wastage section
              setShowProductionFlow(false);
              // Scroll to wastage section
              setTimeout(() => {
                const wasteSection = document.querySelector('[data-section="waste"]');
                if (wasteSection) {
                  wasteSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
              return;
            }
            
            showNotification(
              `✅ Step Completed`,
              `${step.name} has been completed successfully by ${step.inspectorName}`,
              'success'
            );
          }}
          onFlowComplete={(flow) => {
            showNotification(
              `🎉 Production Flow Completed`,
              `All production steps have been completed. Ready for individual product details.`,
              'success'
            );
            // Navigate to individual product completion
            navigate(`/production/complete/${productionProduct.id}`);
          }}
        />
      )}

      {/* Material Planning Section - Show when not in flow view */}
      {!showProductionFlow && (
        <>
      {/* Production Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Production Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {totalWasteQuantity.toFixed(2)}
                    </div>
              <div className="text-sm text-gray-500">Waste Generated</div>
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

      {/* Waste Management */}
           <Card data-section="waste">
             <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Waste Generation
            </CardTitle>
                       <Button
                         variant="outline"
                         size="sm"
              onClick={() => setIsAddingWaste(!isAddingWaste)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Waste
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
              <Button onClick={addWasteItem} className="bg-orange-600 hover:bg-orange-700">
                <Save className="w-4 h-4 mr-2" />
                Add Waste Item
            </Button>
             </div>
         )}

          <div className="space-y-2">
            {productionProduct.wasteGenerated?.map((waste, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                 <div>
                  <div className="font-medium">{waste.materialName}</div>
                  <div className="text-sm text-gray-500">
                    {waste.quantity} {waste.unit} • {waste.wasteType} • {waste.canBeReused ? "Reusable" : "Non-reusable"}
                 </div>
                  {waste.notes && <div className="text-sm text-gray-600 mt-1">{waste.notes}</div>}
                 </div>
                <Badge variant={waste.canBeReused ? "default" : "destructive"}>
                  {waste.wasteType}
                </Badge>
               </div>
            ))}
            {(!productionProduct.wasteGenerated || productionProduct.wasteGenerated.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No waste generated yet</p>
                <p className="text-sm">Click "Add Waste" to track waste items</p>
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
        </>
      )}
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
