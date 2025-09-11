import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, TrendingDown, Package, AlertTriangle, Recycle, ShoppingCart, History, Upload, Image, X, Download, FileSpreadsheet, CheckCircle, AlertCircle, Clock, RotateCcw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { rawMaterialsStorage, materialOrdersStorage, suppliersStorage } from "@/utils/localStorage";

// Generate unique ID function
const generateUniqueId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `${prefix}_${timestamp}_${randomStr}`;
};
import { useToast } from "@/hooks/use-toast";

/*
 * MATERIAL HANDLING LOGIC:
 * 
 * 1. "Create Material Order" (Materials page):
 *    - ALWAYS creates NEW materials
 *    - Even if name is same, different supplier/price/quality = NEW material
 *    - Order goes to Manage Stock page
 *    - When delivered, checks for EXACT matches in existing inventory
 * 
 * 2. "Add to Inventory" (Materials page):
 *    - ALWAYS creates NEW materials
 *    - For adding materials directly to inventory
 *    - No merging with existing materials
 * 
 * 3. "Restock" (Manage Stock page):
 *    - Only when order is delivered
 *    - Checks ALL fields: name, brand, category, supplier, price, quality, unit
 *    - If EXACT match found = RESTOCK (update existing)
 *    - If ANY field different = NEW MATERIAL (create new entry)
 * 
 * This ensures materials with same name but different specifications
 * are treated as separate products, maintaining inventory accuracy.
 */

interface RawMaterial {
  id: string;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  reorderPoint: number;
  lastRestocked: string;
  dailyUsage: number;
  status: "in-stock" | "low-stock" | "out-of-stock" | "overstock";
  supplier: string;
  supplierId: string;
  costPerUnit: number;
  totalValue: number;
  batchNumber: string;
  qualityGrade?: string;
  imageUrl?: string;
  materialsUsed: MaterialConsumption[];
  supplierPerformance: number;
}

interface MaterialConsumption {
  id: string;
  productionBatchId: string;
  stepId: number;
  stepName: string;
  consumedQuantity: number;
  wasteQuantity: number;
  consumptionDate: string;
  operator: string;
  productId?: string;
  individualProductId?: string;
}

interface MaterialPurchase {
  id: string;
  materialId: string;
  materialName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  purchaseDate: string;
  expectedDelivery: string;
  status: "ordered" | "in-transit" | "received" | "inspected";
  inspector: string;
  inspectionDate: string;
  notes: string;
}

interface StockAlert {
  id: string;
  materialId: string;
  materialName: string;
  alertType: "low-stock" | "out-of-stock" | "overstock" | "expiry";
  currentLevel: number;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  date: string;
  status: "active" | "acknowledged" | "resolved";
}

// Raw materials will be loaded from localStorage

const statusStyles = {
  "in-stock": "bg-success text-success-foreground",
  "low-stock": "bg-warning text-warning-foreground",
  "out-of-stock": "bg-destructive text-destructive-foreground",
  "overstock": "bg-blue-100 text-blue-800 border-blue-200"
};

export default function Materials() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isAddToInventoryOpen, setIsAddToInventoryOpen] = useState(false);
  const [isImportInventoryOpen, setIsImportInventoryOpen] = useState(false); // New state for import
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false); // New state for details
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [wasteRecoveryRefresh, setWasteRecoveryRefresh] = useState(0); // For refreshing waste recovery count
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    brand: "",
    category: "",
    batchNumber: "",
    currentStock: "",
    unit: "",
    minThreshold: "",
    maxCapacity: "",
    supplier: "",
    costPerUnit: "",
    expectedDelivery: "",
    imageUrl: ""
  });
  const [newInventoryMaterial, setNewInventoryMaterial] = useState({
    name: "",
    brand: "",
    category: "",
    batchNumber: "",
    currentStock: "",
    unit: "",
    minThreshold: "",
    maxCapacity: "",
    supplier: "",
    costPerUnit: "",
    imageUrl: ""
  });
  
  // Dynamic dropdown states
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customUnits, setCustomUnits] = useState<string[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newUnitName, setNewUnitName] = useState("");
  const [orderDetails, setOrderDetails] = useState({
    quantity: "",
    unit: "",
    supplier: "",
    costPerUnit: "",
    expectedDelivery: "",
    notes: ""
  });

  // Remove materials with duplicate batch numbers
  const removeDuplicateBatchNumbers = (materials: RawMaterial[]) => {
    const seen = new Set<string>();
    const uniqueMaterials = materials.filter(material => {
      if (seen.has(material.batchNumber)) {
        console.log(`Removing duplicate batch number: ${material.batchNumber} for material: ${material.name}`);
        return false;
      }
      seen.add(material.batchNumber);
      return true;
    });
    
    if (uniqueMaterials.length !== materials.length) {
      console.log(`Removed ${materials.length - uniqueMaterials.length} materials with duplicate batch numbers`);
      // Update localStorage with unique materials
      localStorage.setItem('rajdhani_raw_materials', JSON.stringify(uniqueMaterials));
    }
    
    return uniqueMaterials;
  };

  // Initialize localStorage and load raw materials
  useEffect(() => {
    // Only initialize if localStorage is empty (first time)
    if (rawMaterialsStorage.needsInitialization()) {
      rawMaterialsStorage.initialize();
    }
    
    // Load raw materials from localStorage
    const materials = rawMaterialsStorage.getAll();
    
    // Remove any materials with duplicate batch numbers
    const uniqueMaterials = removeDuplicateBatchNumbers(materials);
    setRawMaterials(uniqueMaterials);
    
    // Process any pre-filled order data from navigation
    if (location.state?.prefillOrder) {
      const { materialName, supplier, quantity, unit, costPerUnit } = location.state.prefillOrder;
      setOrderDetails({
        quantity: quantity?.toString() || "",
        unit: unit || "",
        supplier: supplier || "",
        costPerUnit: costPerUnit?.toString() || "",
        expectedDelivery: "",
        notes: ""
      });
      setIsOrderDialogOpen(true);
    }
  }, [location.state]);

  // Get waste recovery count for the dashboard
  const getWasteRecoveryCount = () => {
    try {
      const wasteData = JSON.parse(localStorage.getItem('rajdhani_waste_management') || '[]');
      const flatWasteData = Array.isArray(wasteData) && wasteData.length > 0 && Array.isArray(wasteData[0]) 
        ? wasteData.flat() 
        : wasteData;
      const count = flatWasteData.filter((waste: any) => waste.status === 'added_to_inventory').length;
      // Use the refresh state to trigger re-renders
      wasteRecoveryRefresh; // This ensures the component re-renders when this value changes
      return count;
    } catch (error) {
      console.error('Error getting waste recovery count:', error);
      return 0;
    }
  };

  // Load custom categories and units from localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem('rajdhani_custom_categories');
    const savedUnits = localStorage.getItem('rajdhani_custom_units');
    
    if (savedCategories) {
      try {
        setCustomCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error loading custom categories:', error);
      }
    }
    
    if (savedUnits) {
      try {
        setCustomUnits(JSON.parse(savedUnits));
      } catch (error) {
        console.error('Error loading custom units:', error);
      }
    }
  }, []);
  
  // Show stock update notifications when page loads
  useEffect(() => {
    // Check if there are any recent stock updates from localStorage
    const lastStockUpdate = localStorage.getItem('last_stock_update');
    if (lastStockUpdate) {
      try {
        const updateInfo = JSON.parse(lastStockUpdate);
        const timeDiff = Date.now() - updateInfo.timestamp;
        
        // Show notification if update was within last 5 minutes
        if (timeDiff < 5 * 60 * 1000) {
          let title = "📊 Stock Recently Updated";
          let description = `${updateInfo.materialName} stock updated to ${updateInfo.newStock} ${updateInfo.unit}`;
          
          // Customize notification based on action type
          if (updateInfo.action === 'added_to_inventory') {
            title = "🆕 New Material Added";
            description = `${updateInfo.materialName} added to inventory with ${updateInfo.newStock} ${updateInfo.unit}`;
          } else if (updateInfo.action === 'imported_inventory') {
            title = "📥 Inventory Imported";
            description = `${updateInfo.newStock} materials imported to inventory`;
          } else if (updateInfo.action === 'order_delivered') {
            title = "📦 Stock Restocked";
            description = `${updateInfo.materialName} stock increased by ${updateInfo.quantity} ${updateInfo.unit} (${updateInfo.oldStock} → ${updateInfo.newStock})`;
          } else if (updateInfo.action === 'new_material_added') {
            title = "🆕 New Material Added";
            description = `${updateInfo.materialName} (${updateInfo.supplier}) added as new material with ${updateInfo.quantity} ${updateInfo.unit}`;
          }
          
          toast({
            title: title,
            description: description,
            variant: "default",
          });
        }
        
        // Clear the notification after showing
        localStorage.removeItem('last_stock_update');
      } catch (error) {
        console.error('Error parsing stock update info:', error);
      }
    }
  }, [toast]);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedInventoryImage, setSelectedInventoryImage] = useState<File | null>(null);
  const [inventoryImagePreview, setInventoryImagePreview] = useState<string>("");
  
  // Restock functionality states
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedRestockMaterial, setSelectedRestockMaterial] = useState<RawMaterial | null>(null);
  const [restockForm, setRestockForm] = useState({
    supplier: "",
    brand: "",
    quantity: "",
    costPerUnit: "",
    expectedDelivery: "",
    notes: ""
  });
  
  // Import related states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Handle purchase material from production
  useEffect(() => {
    if (location.state?.purchaseMaterial) {
      const { materialId, materialName, supplier, unit, cost } = location.state.purchaseMaterial;
      
      // Pre-fill the order dialog with the material details
      setSelectedMaterial({
        id: materialId,
        name: materialName,
        brand: "Unknown",
        category: "Unknown",
        currentStock: 0,
        unit: unit,
        minThreshold: 0,
        maxCapacity: 0,
        reorderPoint: 0,
        lastRestocked: new Date().toISOString().split('T')[0],
        dailyUsage: 0,
        status: "out-of-stock",
        supplier: supplier,
        supplierId: "unknown",
        costPerUnit: cost,
        totalValue: 0,
        batchNumber: "BATCH-UNKNOWN",
        materialsUsed: [],
        supplierPerformance: 0
      });
      
      setOrderDetails({
        quantity: "1",
        unit: unit,
        supplier: supplier,
        costPerUnit: cost.toString(),
        expectedDelivery: "",
        notes: `Purchase request from production for ${materialName}`
      });
      
      setIsOrderDialogOpen(true);
      
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  // Get available suppliers for the selected material
  const getAvailableSuppliers = (materialName: string) => {
    const suppliers = rawMaterials
      .filter(m => m.name.toLowerCase() === materialName.toLowerCase())
      .map(m => ({
        name: m.supplier,
        brand: m.brand,
        costPerUnit: m.costPerUnit,
        currentStock: m.currentStock,
        unit: m.unit
      }));
    return suppliers;
  };

  // Get available suppliers for restocking based on material category
  const getAvailableSuppliersForRestock = (materialCategory: string, materialName: string) => {
    // Get suppliers from same category (e.g., all dye suppliers for dye materials)
    const categorySuppliers = rawMaterials
      .filter(m => m.category === materialCategory)
      .map(m => ({
        name: m.supplier,
        brand: m.brand,
        costPerUnit: m.costPerUnit,
        unit: m.unit,
        materialName: m.name
      }))
      .filter((supplier, index, self) => 
        // Remove duplicate suppliers, keep unique ones
        index === self.findIndex(s => s.name === supplier.name)
      );
    
    // Also include suppliers from exact material name matches
    const exactSuppliers = rawMaterials
      .filter(m => m.name.toLowerCase() === materialName.toLowerCase())
      .map(m => ({
        name: m.supplier,
        brand: m.brand,
        costPerUnit: m.costPerUnit,
        unit: m.unit,
        materialName: m.name
      }));
    
    // Combine and remove duplicates
    const allSuppliers = [...categorySuppliers, ...exactSuppliers];
    const uniqueSuppliers = allSuppliers.filter((supplier, index, self) => 
      index === self.findIndex(s => s.name === supplier.name)
    );
    
    return uniqueSuppliers;
  };

  // Generate unique batch number
  const generateUniqueBatchNumber = () => {
    const year = new Date().getFullYear();
    const existingBatchNumbers = rawMaterials.map(m => m.batchNumber);
    
    // Find the highest batch number for this year
    let maxNumber = 0;
    existingBatchNumbers.forEach(batch => {
      const match = batch.match(new RegExp(`BATCH-${year}-(\\d+)`));
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) maxNumber = num;
      }
    });
    
    // Generate next unique batch number
    const nextNumber = maxNumber + 1;
    return `BATCH-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  // Get priority score for sorting (lower stock = higher priority)
  const getPriorityScore = (material: RawMaterial) => {
    switch (material.status) {
      case "out-of-stock": return 0;
      case "low-stock": return 1;
      case "in-stock": return 2;
      case "overstock": return 3;
      default: return 4;
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setNewMaterial({ ...newMaterial, imageUrl: "" });
  };

  // Handle adding new category
  const handleAddCategory = () => {
    if (newCategoryName.trim() && !customCategories.includes(newCategoryName.trim())) {
      const updatedCategories = [...customCategories, newCategoryName.trim()];
      setCustomCategories(updatedCategories);
      setNewInventoryMaterial({...newInventoryMaterial, category: newCategoryName.trim()});
      
      // Save to localStorage
      localStorage.setItem('rajdhani_custom_categories', JSON.stringify(updatedCategories));
      
      setNewCategoryName("");
      setShowAddCategory(false);
    }
  };

  // Handle adding new unit
  const handleAddUnit = () => {
    if (newUnitName.trim() && !customUnits.includes(newUnitName.trim())) {
      const updatedUnits = [...customUnits, newUnitName.trim()];
      setCustomUnits(updatedUnits);
      setNewInventoryMaterial({...newInventoryMaterial, unit: newUnitName.trim()});
      
      // Save to localStorage
      localStorage.setItem('rajdhani_custom_units', JSON.stringify(updatedUnits));
      
      setNewUnitName("");
      setShowAddUnit(false);
    }
  };

  // Get all available categories (default + custom)
  const getAllCategories = () => {
    const defaultCategories = ["Yarn", "Dye", "Chemical", "Fabric", "Other"];
    return [...defaultCategories, ...customCategories];
  };

  // Get all available units (default + custom)
  const getAllUnits = () => {
    const defaultUnits = ["rolls", "liters", "kg", "sqm", "pieces"];
    return [...defaultUnits, ...customUnits];
  };

  // Handle opening restock dialog
  const handleOpenRestockDialog = (material: RawMaterial) => {
    setSelectedRestockMaterial(material);
    
    // Get available suppliers for this material
    const availableSuppliers = getAvailableSuppliersForRestock(material.category, material.name);
    
          // Pre-fill with first available supplier if any
      if (availableSuppliers.length > 0) {
        const firstSupplier = availableSuppliers[0];
        const materialIsOutOfStock = material.status === "out-of-stock";
        setRestockForm({
          supplier: firstSupplier.name,
          brand: firstSupplier.brand,
          quantity: "",
          costPerUnit: firstSupplier.costPerUnit.toString(),
          expectedDelivery: "",
          notes: `${materialIsOutOfStock ? 'Order' : 'Restock'} for ${material.name}`
        });
      } else {
        // Reset form if no suppliers available
        const materialIsOutOfStock = material.status === "out-of-stock";
        setRestockForm({
          supplier: "",
          brand: "",
          quantity: "",
          costPerUnit: "",
          expectedDelivery: "",
          notes: `${materialIsOutOfStock ? 'Order' : 'Restock'} for ${material.name}`
        });
      }
    
    setIsRestockDialogOpen(true);
  };

  // Handle supplier change in restock form
  const handleRestockSupplierChange = (supplierName: string) => {
    const availableSuppliers = getAvailableSuppliersForRestock(
      selectedRestockMaterial?.category || "", 
      selectedRestockMaterial?.name || ""
    );
    
    const selectedSupplier = availableSuppliers.find(s => s.name === supplierName);
    
    if (selectedSupplier) {
      setRestockForm(prev => ({
        ...prev,
        supplier: supplierName,
        brand: selectedSupplier.brand,
        costPerUnit: selectedSupplier.costPerUnit.toString()
      }));
    }
  };

  // Handle restock submission
  const handleRestockSubmit = () => {
    if (!selectedRestockMaterial || !restockForm.supplier || !restockForm.quantity || !restockForm.costPerUnit) {
      toast({
        title: "⚠️ Missing Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create order (restock or new order based on material status)
      const orderIsOutOfStock = selectedRestockMaterial.status === "out-of-stock";
      const orderData = {
        id: generateUniqueId('ORD'),
        materialName: selectedRestockMaterial.name,
        materialBrand: restockForm.brand || selectedRestockMaterial.brand,
        materialCategory: selectedRestockMaterial.category,
        materialBatchNumber: generateUniqueBatchNumber(),
        supplier: restockForm.supplier,
        quantity: parseInt(restockForm.quantity),
        unit: selectedRestockMaterial.unit,
        costPerUnit: parseFloat(restockForm.costPerUnit),
        totalCost: parseInt(restockForm.quantity) * parseFloat(restockForm.costPerUnit),
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: restockForm.expectedDelivery || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "ordered",
        notes: restockForm.notes,
        minThreshold: selectedRestockMaterial.minThreshold,
        maxCapacity: selectedRestockMaterial.maxCapacity,
        qualityGrade: selectedRestockMaterial.qualityGrade || "A", // Add missing quality grade
        isRestock: !orderIsOutOfStock // Mark as restock order only if not out of stock
      };

      // Add to material orders storage
      materialOrdersStorage.add(orderData);
      
      // Close dialog and reset form
      setIsRestockDialogOpen(false);
      setRestockForm({
        supplier: "",
        brand: "",
        quantity: "",
        costPerUnit: "",
        expectedDelivery: "",
        notes: ""
      });
      
      // Navigate to Manage Stock with the order details
      navigate("/manage-stock", { 
        state: { 
          prefillOrder: {
            materialName: selectedRestockMaterial.name,
            materialBrand: restockForm.brand,
            materialCategory: selectedRestockMaterial.category,
            materialBatchNumber: generateUniqueBatchNumber(),
            supplier: restockForm.supplier,
            quantity: restockForm.quantity,
            unit: selectedRestockMaterial.unit,
            costPerUnit: restockForm.costPerUnit,
            expectedDelivery: restockForm.expectedDelivery,
            minThreshold: selectedRestockMaterial.minThreshold,
            maxCapacity: selectedRestockMaterial.maxCapacity,
            isRestock: !orderIsOutOfStock
          }
        }
      });
      
      // Show success message
      toast({
        title: orderIsOutOfStock ? "✅ Material Order Created!" : "✅ Restock Order Created!",
        description: `${selectedRestockMaterial.name} ${orderIsOutOfStock ? 'order' : 'restock order'} has been created and sent to Manage Stock.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating restock order:", error);
      toast({
        title: "❌ Error Creating Restock Order",
        description: "There was an error creating the restock order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle inventory image upload
  const handleInventoryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedInventoryImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setInventoryImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected inventory image
  const removeInventoryImage = () => {
    setSelectedInventoryImage(null);
    setInventoryImagePreview("");
    setNewInventoryMaterial({ ...newInventoryMaterial, imageUrl: "" });
  };

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportStatus('idle');
      setImportErrors([]);
      
      // Read and preview the file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        setImportPreview(data.slice(0, 5)); // Show first 5 rows as preview
      };
      reader.readAsText(file);
    }
  };

  // Download sample template
  const downloadTemplate = () => {
    const template = `Material Name,Brand,Category,Batch Number,Current Stock,Unit,Min Threshold,Max Capacity,Supplier,Cost Per Unit
Cotton Yarn (Premium),TextilePro,Yarn,BATCH-2025-001,100,rolls,50,500,Gujarat Textiles Ltd,450
Red Dye (Industrial),ColorMax,Dye,BATCH-2025-002,85,liters,25,200,Chemical Works India,180
Latex Solution,FlexiChem,Chemical,BATCH-2025-003,75,liters,30,150,Industrial Chemicals Co,320
Backing Cloth,SupportFabric,Fabric,BATCH-2025-004,150,sqm,80,1000,Fabric Solutions Ltd,25
Blue Dye (Industrial),ColorMax,Dye,BATCH-2025-005,60,liters,25,200,Chemical Works India,190`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Process import
  const processImport = () => {
    if (!importFile) return;
    
    setImportStatus('processing');
    setImportErrors([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).filter(line => line.trim());
      
      const errors: string[] = [];
      const validMaterials: RawMaterial[] = [];
      
      data.forEach((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, headerIndex) => {
          row[header] = values[headerIndex] || '';
        });
        
        // Validate required fields
        if (!row['Material Name']) {
          errors.push(`Row ${index + 2}: Material Name is required`);
          return;
        }
        if (!row['Brand']) {
          errors.push(`Row ${index + 2}: Brand is required`);
          return;
        }
        if (!row['Category']) {
          errors.push(`Row ${index + 2}: Category is required`);
          return;
        }
        if (!row['Batch Number']) {
          errors.push(`Row ${index + 2}: Batch Number is required`);
          return;
        }
        if (!row['Current Stock'] || isNaN(Number(row['Current Stock']))) {
          errors.push(`Row ${index + 2}: Current Stock must be a valid number`);
          return;
        }
        if (!row['Unit']) {
          errors.push(`Row ${index + 2}: Unit is required`);
          return;
        }
        if (!row['Min Threshold'] || isNaN(Number(row['Min Threshold']))) {
          errors.push(`Row ${index + 2}: Min Threshold must be a valid number`);
          return;
        }
        if (!row['Max Capacity'] || isNaN(Number(row['Max Capacity']))) {
          errors.push(`Row ${index + 2}: Max Capacity must be a valid number`);
          return;
        }
        if (!row['Supplier']) {
          errors.push(`Row ${index + 2}: Supplier is required`);
          return;
        }
        if (!row['Cost Per Unit'] || isNaN(Number(row['Cost Per Unit']))) {
          errors.push(`Row ${index + 2}: Cost Per Unit must be a valid number`);
          return;
        }
        
        // Create material object
        const material: RawMaterial = {
          id: generateUniqueId('MAT'),
          name: row['Material Name'],
          brand: row['Brand'],
          category: row['Category'],
          batchNumber: row['Batch Number'],
          currentStock: parseInt(row['Current Stock']),
          unit: row['Unit'],
          minThreshold: parseInt(row['Min Threshold']),
          maxCapacity: parseInt(row['Max Capacity']),
          reorderPoint: parseInt(row['Min Threshold']),
          lastRestocked: new Date().toISOString().split('T')[0],
          dailyUsage: 0,
          status: "in-stock",
          supplier: row['Supplier'],
          costPerUnit: parseFloat(row['Cost Per Unit']),
          supplierId: `supplier_${Date.now()}_${index}`,
          totalValue: parseInt(row['Current Stock']) * parseFloat(row['Cost Per Unit']),
          materialsUsed: [],
          supplierPerformance: 0,
          imageUrl: ""
        };
        
        validMaterials.push(material);
      });
      
      if (errors.length > 0) {
        setImportErrors(errors);
        setImportStatus('error');
        return;
      }
      
      // Add materials to localStorage
      try {
        validMaterials.forEach(material => {
          rawMaterialsStorage.add(material);
        });
        
        // Update local state
        setRawMaterials(prev => [...prev, ...validMaterials]);
        
        setImportStatus('success');
        
        // Store stock update info for notification
        localStorage.setItem('last_stock_update', JSON.stringify({
          materialName: `${validMaterials.length} materials`,
          oldStock: 0,
          newStock: validMaterials.length,
          quantity: validMaterials.length,
          unit: 'items',
          timestamp: Date.now(),
          action: 'imported_inventory'
        }));
        
        // Reset form after successful import
        setTimeout(() => {
          setIsImportInventoryOpen(false);
          setImportFile(null);
          setImportPreview([]);
          setImportStatus('idle');
          setImportErrors([]);
          toast({
            title: "✅ Import Successful!",
            description: `Successfully imported ${validMaterials.length} materials to inventory.`,
            variant: "default",
          });
        }, 2000);
      } catch (error) {
        console.error('Error importing materials:', error);
        setImportErrors(['Error saving materials to storage. Please try again.']);
        setImportStatus('error');
      }
    };
    reader.readAsText(importFile);
  };

  // Filter and sort materials based on search, category, and status
  const filteredMaterials = rawMaterials
    .filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || material.category === categoryFilter;
      
      let matchesStatus = true;
          if (statusFilter === "low-stock") {
      matchesStatus = material.status === "low-stock";
    } else if (statusFilter === "in-stock") {
      matchesStatus = material.status === "in-stock";
    } else if (statusFilter === "out-of-stock") {
      matchesStatus = material.status === "out-of-stock";
    } else if (statusFilter === "overstock") {
      matchesStatus = material.status === "overstock";
    }
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const priorityDiff = getPriorityScore(a) - getPriorityScore(b);
      if (priorityDiff !== 0) return priorityDiff;
      return a.name.localeCompare(b.name);
    });

  const categories = [...new Set(rawMaterials.map(m => m.category))];

  const handleOrderMaterial = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setOrderDetails({
      quantity: (material.maxCapacity - material.currentStock).toString(),
      unit: material.unit,
      supplier: material.supplier,
      costPerUnit: material.costPerUnit.toString(),
      expectedDelivery: "",
      notes: `Restocking ${material.name} - Current stock: ${material.currentStock} ${material.unit}`
    });
    setIsOrderDialogOpen(true);
  };

  const handleAddMaterial = () => {
    // Validate required fields
        if (!newMaterial.name || !newMaterial.brand || !newMaterial.category || !newMaterial.batchNumber || !newMaterial.unit ||
        !newMaterial.minThreshold || !newMaterial.maxCapacity || !newMaterial.supplier || !newMaterial.costPerUnit) {
      toast({
        title: "⚠️ Missing Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Store the values before resetting the form
      const materialName = newMaterial.name;
      const orderQuantity = parseInt(newMaterial.currentStock) || 0;
      
      // Step 1: Add material to inventory with 0 quantity
      const newInventoryMaterialData = {
        name: newMaterial.name,
        brand: newMaterial.brand,
        category: newMaterial.category,
        batchNumber: newMaterial.batchNumber,
        currentStock: 0, // Always start with 0 quantity
        unit: newMaterial.unit,
        minThreshold: parseInt(newMaterial.minThreshold) || 0,
        maxCapacity: parseInt(newMaterial.maxCapacity) || 0,
        supplier: newMaterial.supplier,
        costPerUnit: parseFloat(newMaterial.costPerUnit) || 0,
        imageUrl: imagePreview || newMaterial.imageUrl || "",
        status: "out-of-stock",
        lastRestocked: new Date().toISOString().split('T')[0],
        dailyUsage: 0,
        qualityGrade: "A",
        manufacturingDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      // Add to localStorage using the utility function
      const addedMaterial = rawMaterialsStorage.add(newInventoryMaterialData);
      console.log('Added new material to inventory with 0 stock:', addedMaterial);
      
      // Update local state with the new material
      const updatedMaterials = rawMaterialsStorage.getAll();
      const uniqueMaterials = removeDuplicateBatchNumbers(updatedMaterials);
      setRawMaterials(uniqueMaterials);
      
      // Step 2: Create material order for the quantity requested
      const materialOrder = {
        materialName: newMaterial.name,
        materialBrand: newMaterial.brand,
        materialCategory: newMaterial.category,
        materialBatchNumber: newMaterial.batchNumber,
        supplier: newMaterial.supplier,
        quantity: orderQuantity,
        unit: newMaterial.unit,
        costPerUnit: parseFloat(newMaterial.costPerUnit) || 0,
        expectedDelivery: newMaterial.expectedDelivery || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minThreshold: parseInt(newMaterial.minThreshold) || 0,
        maxCapacity: parseInt(newMaterial.maxCapacity) || 0
      };

      // Reset form
      setIsAddMaterialOpen(false);
      setNewMaterial({
        name: "",
        brand: "",
        category: "",
        batchNumber: "",
        currentStock: "",
        unit: "",
        minThreshold: "",
        maxCapacity: "",
        supplier: "",
        costPerUnit: "",
        expectedDelivery: "",
        imageUrl: ""
      });
      setSelectedImage(null);
      setImagePreview("");
      
      // Navigate to Manage Stock with the order details
      // The order will be created in Manage Stock, not here
      navigate("/manage-stock", { 
        state: { 
          prefillOrder: {
            materialName: materialName,
            materialBrand: newMaterial.brand,
            materialCategory: newMaterial.category,
            materialBatchNumber: newMaterial.batchNumber,
            supplier: newMaterial.supplier,
            quantity: newMaterial.currentStock,
            unit: newMaterial.unit,
            costPerUnit: newMaterial.costPerUnit,
            expectedDelivery: newMaterial.expectedDelivery,
            minThreshold: newMaterial.minThreshold,
            maxCapacity: newMaterial.maxCapacity
          }
        }
      });
      
      // Show success message
      toast({
        title: "✅ Material Order Data Prepared!",
        description: `${materialName} order details have been sent to Manage Stock.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating material order:", error);
      toast({
        title: "❌ Error Creating Order",
        description: "There was an error creating the material order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToInventory = () => {
    // Validate required fields
    if (!newInventoryMaterial.name || !newInventoryMaterial.brand || !newInventoryMaterial.category || !newInventoryMaterial.batchNumber || !newInventoryMaterial.unit ||
        !newInventoryMaterial.minThreshold || !newInventoryMaterial.maxCapacity || !newInventoryMaterial.supplier || !newInventoryMaterial.costPerUnit) {
      toast({
        title: "⚠️ Missing Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // IMPORTANT: "Add to Inventory" is for adding NEW materials to inventory
    // This is different from "Restock" - it always creates new material entries
    // Even if name is same, different supplier/price/quality = NEW material
    // Only when order is delivered in Manage Stock will it check for exact matches
    const newInventoryMaterialData: RawMaterial = {
      id: Date.now().toString(),
      name: newInventoryMaterial.name,
      brand: newInventoryMaterial.brand,
      category: newInventoryMaterial.category,
      currentStock: parseInt(newInventoryMaterial.currentStock) || 0,
      unit: newInventoryMaterial.unit,
      minThreshold: parseInt(newInventoryMaterial.minThreshold) || 0,
      maxCapacity: parseInt(newInventoryMaterial.maxCapacity) || 0,
      reorderPoint: parseInt(newInventoryMaterial.minThreshold) || 0,
      lastRestocked: new Date().toISOString().split('T')[0],
      dailyUsage: 0, // Will be calculated based on usage over time
      status: "in-stock", // Default status
      supplier: newInventoryMaterial.supplier,
      costPerUnit: parseFloat(newInventoryMaterial.costPerUnit) || 0,
      supplierId: `supplier_${Date.now()}`,
      totalValue: (parseInt(newInventoryMaterial.currentStock) || 0) * (parseFloat(newInventoryMaterial.costPerUnit) || 0),
      batchNumber: generateUniqueBatchNumber(),
      materialsUsed: [],
      supplierPerformance: 0,
      imageUrl: inventoryImagePreview || newInventoryMaterial.imageUrl
    };

    try {
      // Store the name before resetting the form
      const materialName = newInventoryMaterial.name;
      
      // Add to localStorage using the utility function
      const addedMaterial = rawMaterialsStorage.add(newInventoryMaterialData);
      console.log('Added inventory material to localStorage:', addedMaterial);
      
      // Update local state with the new material
      setRawMaterials(prev => {
        const newState = [...prev, addedMaterial];
        console.log('Updated rawMaterials state:', newState);
        return newState;
      });
      
      // Reset form
      setIsAddToInventoryOpen(false);
      setNewInventoryMaterial({
        name: "",
        brand: "",
        category: "",
        batchNumber: "",
        currentStock: "",
        unit: "",
        minThreshold: "",
        maxCapacity: "",
        supplier: "",
        costPerUnit: "",
        imageUrl: ""
      });
      setSelectedInventoryImage(null);
      setInventoryImagePreview("");
      
      // Show success message
              toast({
          title: "✅ Material Added to Inventory!",
          description: `${materialName} has been successfully added to your inventory.`,
          variant: "default",
        });
        
        // Store stock update info for notification
        localStorage.setItem('last_stock_update', JSON.stringify({
          materialName: materialName,
          oldStock: 0,
          newStock: parseInt(newInventoryMaterial.currentStock) || 0,
          quantity: parseInt(newInventoryMaterial.currentStock) || 0,
          unit: newInventoryMaterial.unit,
          timestamp: Date.now(),
          action: 'added_to_inventory'
        }));
    } catch (error) {
      console.error("Error adding material to inventory:", error);
      toast({
        title: "❌ Error Adding to Inventory",
        description: "There was an error adding the material to inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlaceOrder = () => {
    if (selectedMaterial) {
      navigate("/manage-stock", { 
        state: { 
          prefillOrder: {
            materialName: selectedMaterial.name,
            materialBrand: selectedMaterial.brand,
            materialCategory: selectedMaterial.category,
            materialBatchNumber: selectedMaterial.batchNumber,
            supplier: orderDetails.supplier,
            quantity: orderDetails.quantity,
            unit: orderDetails.unit,
            costPerUnit: orderDetails.costPerUnit,
            expectedDelivery: orderDetails.expectedDelivery,
            minThreshold: selectedMaterial.minThreshold,
            maxCapacity: selectedMaterial.maxCapacity,
            qualityGrade: selectedMaterial.qualityGrade || "A",
            notes: orderDetails.notes,
            isRestock: false
          }
        }
      });
    }
    setIsOrderDialogOpen(false);
  };

  const lowStockCount = rawMaterials.filter(m => m.status === "low-stock" || m.status === "out-of-stock").length;
  const totalMaterials = rawMaterials.length;
  const totalStockValue = rawMaterials.reduce((sum, m) => sum + (m.currentStock * m.costPerUnit), 0);

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Raw Materials Management" 
        subtitle="Track material consumption, manage inventory and optimize procurement"
      />

      <Tabs defaultValue="inventory" className="space-y-6">
        <div className="flex flex-col gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="inventory">Material Inventory</TabsTrigger>
            <TabsTrigger value="consumption">Usage Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Production Notifications</TabsTrigger>
            <TabsTrigger value="waste">Waste Management</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
              <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search materials..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="sufficient">Sufficient</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 shrink-0">

              
              {/* Import Inventory Button */}
              <Dialog open={isImportInventoryOpen} onOpenChange={setIsImportInventoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Import Inventory
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Import Inventory from Excel/CSV</DialogTitle>
                    <DialogDescription>
                      Import your existing inventory data from an Excel or CSV file. Download the template below to see the required format.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Template Download */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Download Template</h4>
                          <p className="text-sm text-blue-700">
                            Download our CSV template to ensure your data is in the correct format.
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={downloadTemplate}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Template
                        </Button>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div>
                      <Label>Upload CSV/Excel File</Label>
                      <div className="mt-2">
                        {importFile ? (
                          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-green-900">{importFile.name}</span>
                            </div>
                            <p className="text-sm text-green-700 mb-3">
                              File selected successfully. Review the preview below.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImportFile(null);
                                setImportPreview([]);
                                setImportStatus('idle');
                                setImportErrors([]);
                              }}
                            >
                              Change File
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                            <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">Click to upload CSV or Excel file</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('import-file')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="import-file"
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              className="hidden"
                              onChange={handleFileImport}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Import Preview */}
                    {importPreview.length > 0 && (
                      <div>
                        <Label>Data Preview (First 5 rows)</Label>
                        <div className="mt-2 border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted">
                                <tr>
                                  {Object.keys(importPreview[0] || {}).map(header => (
                                    <th key={header} className="p-2 text-left font-medium">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {importPreview.map((row, index) => (
                                  <tr key={index} className="border-t">
                                    {Object.values(row).map((value, valueIndex) => (
                                      <td key={valueIndex} className="p-2">
                                        {String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Import Errors */}
                    {importErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <h4 className="font-medium text-red-900">Import Errors</h4>
                        </div>
                        <div className="space-y-1">
                          {importErrors.map((error, index) => (
                            <p key={index} className="text-sm text-red-700">{error}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Import Status */}
                    {importStatus === 'processing' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-blue-900">Processing import...</span>
                        </div>
                      </div>
                    )}

                    {importStatus === 'success' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-900">Import completed successfully!</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsImportInventoryOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={processImport}
                      disabled={!importFile || importStatus === 'processing'}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Import Materials
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Add Material to Inventory Button */}
              <Dialog open={isAddToInventoryOpen} onOpenChange={setIsAddToInventoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Add to Inventory
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Material to Inventory</DialogTitle>
                    <DialogDescription>
                      Add a new raw material directly to your inventory system. This is for initial setup - the material will be added directly to your inventory list.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Image Upload Section */}
                    <div>
                      <Label>Material Image (Optional)</Label>
                      <div className="mt-2">
                        {inventoryImagePreview ? (
                          <div className="relative">
                            <img 
                              src={inventoryImagePreview} 
                              alt="Preview" 
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={removeInventoryImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">Click to upload image</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('inventory-image-upload')?.click()}
                            >
                              <Image className="w-4 h-4 mr-2" />
                              Upload Image
                            </Button>
                            <input
                              id="inventory-image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleInventoryImageUpload}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="inventoryMaterialName">Material Name *</Label>
                      <Input
                        id="inventoryMaterialName"
                        value={newInventoryMaterial.name}
                        onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, name: e.target.value})}
                        placeholder="e.g., Cotton Yarn (Premium)"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="inventorySupplier">Supplier Name *</Label>
                        <Input
                          id="inventorySupplier"
                          value={newInventoryMaterial.supplier}
                          onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, supplier: e.target.value})}
                          placeholder="e.g., ABC Textiles Ltd."
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="inventoryCategory">Category *</Label>
                        <div className="space-y-2">
                          <Select value={newInventoryMaterial.category} onValueChange={(value) => {
                            if (value === "add_new") {
                              setShowAddCategory(true);
                            } else {
                              setNewInventoryMaterial({...newInventoryMaterial, category: value});
                            }
                          }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                              {getAllCategories().map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                              <SelectItem value="add_new" className="text-blue-600 font-medium">
                                <div className="flex items-center gap-2">
                                  <Plus className="w-4 h-4" />
                                  Add New Category
                                </div>
                              </SelectItem>
                          </SelectContent>
                        </Select>
                          {showAddCategory && (
                            <div className="flex gap-2">
                              <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Enter new category"
                                className="flex-1"
                              />
                              <Button type="button" size="sm" onClick={handleAddCategory}>Add</Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => {setShowAddCategory(false); setNewCategoryName("");}}>Cancel</Button>
                      </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="inventoryBrand">Brand Name *</Label>
                      <Input
                        id="inventoryBrand"
                        value={newInventoryMaterial.brand}
                        onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, brand: e.target.value})}
                        placeholder="e.g., TextilePro"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="inventoryBatchNumber">Batch Number *</Label>
                      <Input
                        id="inventoryBatchNumber"
                        value={newInventoryMaterial.batchNumber}
                        onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, batchNumber: e.target.value})}
                        placeholder="e.g., BATCH-2024-001"
                        required
                      />
                    </div>
                      <div>
                        <Label htmlFor="inventoryUnit">Unit *</Label>
                      <div className="space-y-2">
                        <Select value={newInventoryMaterial.unit} onValueChange={(value) => {
                          if (value === "add_new") {
                            setShowAddUnit(true);
                          } else {
                            setNewInventoryMaterial({...newInventoryMaterial, unit: value});
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllUnits().map(unit => (
                              <SelectItem key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</SelectItem>
                            ))}
                            <SelectItem value="add_new" className="text-blue-600 font-medium">
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add New Unit
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {showAddUnit && (
                          <div className="flex gap-2">
                        <Input
                              value={newUnitName}
                              onChange={(e) => setNewUnitName(e.target.value)}
                              placeholder="Enter new unit"
                              className="flex-1"
                            />
                            <Button type="button" size="sm" onClick={handleAddUnit}>Add</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => {setShowAddUnit(false); setNewUnitName("");}}>Cancel</Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="inventoryCurrentStock">Current Stock *</Label>
                        <Input
                          id="inventoryCurrentStock"
                          type="number"
                          value={newInventoryMaterial.currentStock}
                          onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, currentStock: e.target.value})}
                          placeholder="100"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">Current quantity in stock</p>
                      </div>
                      <div>
                        <Label htmlFor="inventoryMinThreshold">Min Threshold *</Label>
                        <Input
                          id="inventoryMinThreshold"
                          type="number"
                          value={newInventoryMaterial.minThreshold}
                          onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, minThreshold: e.target.value})}
                          placeholder="50"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">Reorder point</p>
                      </div>
                      <div>
                        <Label htmlFor="inventoryMaxCapacity">Max Capacity *</Label>
                        <Input
                          id="inventoryMaxCapacity"
                          type="number"
                          value={newInventoryMaterial.maxCapacity}
                          onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, maxCapacity: e.target.value})}
                          placeholder="500"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">Maximum storage capacity</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="inventoryCostPerUnit">Cost/Unit (₹) *</Label>
                      <Input
                        id="inventoryCostPerUnit"
                        type="number"
                        value={newInventoryMaterial.costPerUnit}
                        onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, costPerUnit: e.target.value})}
                        placeholder="450"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Cost per unit</p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This material will be added directly to your inventory. 
                        Use "Order Now" or "Restock" buttons to create purchase orders when stock is low.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddToInventoryOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddToInventory}>
                      Add to Inventory
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Original Add Material Button (for ordering) */}
              <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
              Create Material Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                                      <DialogTitle>Create Material Procurement Order</DialogTitle>
                  <DialogDescription>
                    Create a new material order that will be sent to Manage Stock for procurement. The material will be added with 0 quantity first, then orders will manage stock levels.
                  </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Image Upload Section */}
                    <div>
                      <Label>Material Image (Optional)</Label>
                      <div className="mt-2">
                        {imagePreview ? (
                          <div className="relative">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={removeImage}
                            >
                              <X className="h-3 w-3" />
            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">Click to upload image</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('image-upload')?.click()}
                            >
                              <Image className="w-4 h-4 mr-2" />
                              Upload Image
                            </Button>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="materialName">Material Name</Label>
                      <Input
                        id="materialName"
                        value={newMaterial.name}
                        onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                        placeholder="e.g., Cotton Yarn (Premium)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="supplier">Supplier Name *</Label>
                        <Input
                          id="supplier"
                          value={newMaterial.supplier}
                          onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                          placeholder="e.g., ABC Textiles Ltd."
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <div className="space-y-2">
                          <Select value={newMaterial.category} onValueChange={(value) => {
                            if (value === "add_new") {
                              setShowAddCategory(true);
                            } else {
                              setNewMaterial({...newMaterial, category: value});
                            }
                          }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                              {getAllCategories().map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                              <SelectItem value="add_new" className="text-blue-600 font-medium">
                                <div className="flex items-center gap-2">
                                  <Plus className="w-4 h-4" />
                                  Add New Category
                                </div>
                              </SelectItem>
                          </SelectContent>
                        </Select>
                          {showAddCategory && (
                            <div className="flex gap-2">
                              <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Enter new category"
                                className="flex-1"
                              />
                              <Button type="button" size="sm" onClick={() => {
                                if (newCategoryName.trim() && !customCategories.includes(newCategoryName.trim())) {
                                  const updatedCategories = [...customCategories, newCategoryName.trim()];
                                  setCustomCategories(updatedCategories);
                                  setNewMaterial({...newMaterial, category: newCategoryName.trim()});
                                  localStorage.setItem('rajdhani_custom_categories', JSON.stringify(updatedCategories));
                                  setNewCategoryName("");
                                  setShowAddCategory(false);
                                }
                              }}>Add</Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => {setShowAddCategory(false); setNewCategoryName("");}}>Cancel</Button>
                      </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="brand">Brand Name *</Label>
                      <Input
                        id="brand"
                        value={newMaterial.brand}
                        onChange={(e) => setNewMaterial({...newMaterial, brand: e.target.value})}
                        placeholder="e.g., TextilePro"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="batchNumber">Batch Number</Label>
                      <Input
                        id="batchNumber"
                        value={newMaterial.batchNumber}
                        onChange={(e) => setNewMaterial({...newMaterial, batchNumber: e.target.value})}
                        placeholder="e.g., BATCH-2024-001"
                      />
                    </div>
                      <div>
                      <Label htmlFor="unit">Unit *</Label>
                      <div className="space-y-2">
                        <Select value={newMaterial.unit} onValueChange={(value) => {
                          if (value === "add_new") {
                            setShowAddUnit(true);
                          } else {
                            setNewMaterial({...newMaterial, unit: value});
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllUnits().map(unit => (
                              <SelectItem key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</SelectItem>
                            ))}
                            <SelectItem value="add_new" className="text-blue-600 font-medium">
                              <div className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add New Unit
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {showAddUnit && (
                          <div className="flex gap-2">
                        <Input
                              value={newUnitName}
                              onChange={(e) => setNewUnitName(e.target.value)}
                              placeholder="Enter new unit"
                              className="flex-1"
                            />
                            <Button type="button" size="sm" onClick={() => {
                              if (newUnitName.trim() && !customUnits.includes(newUnitName.trim())) {
                                const updatedUnits = [...customUnits, newUnitName.trim()];
                                setCustomUnits(updatedUnits);
                                setNewMaterial({...newMaterial, unit: newUnitName.trim()});
                                localStorage.setItem('rajdhani_custom_units', JSON.stringify(updatedUnits));
                                setNewUnitName("");
                                setShowAddUnit(false);
                              }
                            }}>Add</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => {setShowAddUnit(false); setNewUnitName("");}}>Cancel</Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="orderStock">Order Stock</Label>
                        <Input
                          id="orderStock"
                          type="number"
                          value={newMaterial.currentStock || ""}
                          onChange={(e) => setNewMaterial({...newMaterial, currentStock: e.target.value})}
                          placeholder="100"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Quantity to order for this material</p>
                      </div>
                      <div>
                        <Label htmlFor="minThreshold">Min Threshold</Label>
                        <Input
                          id="minThreshold"
                          type="number"
                          value={newMaterial.minThreshold}
                          onChange={(e) => setNewMaterial({...newMaterial, minThreshold: e.target.value})}
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxCapacity">Max Capacity</Label>
                        <Input
                          id="maxCapacity"
                          type="number"
                          value={newMaterial.maxCapacity}
                          onChange={(e) => setNewMaterial({...newMaterial, maxCapacity: e.target.value})}
                          placeholder="500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="costPerUnit">Cost/Unit (₹)</Label>
                        <Input
                          id="costPerUnit"
                          type="number"
                          value={newMaterial.costPerUnit}
                          onChange={(e) => setNewMaterial({...newMaterial, costPerUnit: e.target.value})}
                          placeholder="450"
                        />
                      </div>

                      
                    </div>
                    
                    <div>
                      <Label htmlFor="expectedDelivery">Expected Delivery Date</Label>
                      <Input
                        id="expectedDelivery"
                        type="date"
                        value={newMaterial.expectedDelivery || ""}
                        onChange={(e) => setNewMaterial({...newMaterial, expectedDelivery: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddMaterialOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMaterial}>
              Add Material
            </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <TabsContent value="inventory" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
                <Package className="h-4 w-4 text-materials" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMaterials}</div>
                <p className="text-xs text-muted-foreground">
                  Different material types
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">
                  Need reordering
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                <TrendingDown className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalStockValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Current inventory value
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waste Recovery</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setWasteRecoveryRefresh(prev => prev + 1)}
                    className="h-6 w-6 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                <Recycle className="h-4 w-4 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getWasteRecoveryCount()}</div>
                <p className="text-xs text-muted-foreground">
                  Items recovered from waste
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Materials Table */}
          <Card>
            <CardHeader>
              <CardTitle>Material Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-muted-foreground">Material</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Current Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Supplier</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Cost/Unit</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((material) => {
                      const stockPercent = (material.currentStock / material.maxCapacity) * 100;
                      
                      return (
                        <tr key={material.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {material.imageUrl ? (
                                  <img 
                                    src={material.imageUrl} 
                                    alt={material.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <Image className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            <div>
                              <div className="font-medium text-foreground">{material.name}</div>
                              <div className="text-sm text-muted-foreground">{material.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{material.category}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="font-medium text-foreground">
                                {material.currentStock} {material.unit}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {stockPercent.toFixed(1)}% of capacity
                              </div>
                              <div className="w-24 bg-muted rounded-full h-1.5">
                                <div 
                                  className="h-1.5 rounded-full bg-primary" 
                                  style={{ width: `${Math.min(stockPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={statusStyles[material.status]}>
                              {material.status.replace("-", " ")}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-foreground">{material.supplier}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-foreground">
                              ₹{material.costPerUnit}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                variant={material.status === "out-of-stock" ? "default" : "outline"} 
                                size="sm"
                                onClick={() => handleOpenRestockDialog(material)}
                              >
                                {material.status === "out-of-stock" ? "Order Now" : "Restock"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedMaterial(material);
                                  setIsDetailsDialogOpen(true);
                                }}
                              >
                                Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-6">
          {/* Usage Analytics Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Usage</CardTitle>
                <TrendingDown className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  No production data
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Consumption</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Total materials used
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usage Efficiency</CardTitle>
                <TrendingDown className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  % of materials utilized
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Used</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  Top consumed material
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Material Consumption Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" />
                Material Consumption Trends
              </CardTitle>
              <CardDescription>
                Track material usage patterns and consumption rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingDown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Production Integration Required</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Usage analytics will show real-time data from production processes, including:
                </p>
                <div className="mt-6 text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Daily material consumption rates</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Monthly usage trends and patterns</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Material efficiency analysis</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Production step consumption breakdown</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="notifications" className="space-y-6">
          <ProductionNotifications />
        </TabsContent>

        <TabsContent value="waste" className="space-y-6">
          <WasteManagement />

          {/* Waste Analysis Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="w-5 h-5 text-success" />
                Waste Analysis by Material
              </CardTitle>
              <CardDescription>
                Track which materials generate the most waste during production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Recycle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Production Integration Required</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Waste tracking will show real-time data from production processes, including:
                </p>
                <div className="mt-6 text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Material consumption per production step</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Waste generation during cutting/dyeing</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Quality defects and rejected materials</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Recycling opportunities and cost savings</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Material</DialogTitle>
            <DialogDescription>
              Place an order for {selectedMaterial?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Material</Label>
              <div className="p-3 border rounded-md bg-muted">
                <div className="flex items-center gap-3">
                  {selectedMaterial?.imageUrl && (
                    <img 
                      src={selectedMaterial.imageUrl} 
                      alt={selectedMaterial.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{selectedMaterial?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Current stock: {selectedMaterial?.currentStock} {selectedMaterial?.unit}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Label>Available Suppliers</Label>
              <div className="space-y-2 max-h-24 overflow-y-auto border rounded-md p-2">
                {selectedMaterial && getAvailableSuppliers(selectedMaterial.name).map((supplier, index) => (
                  <div key={index} className="p-2 border rounded-md text-sm bg-background">
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-muted-foreground text-xs">
                      Brand: {supplier.brand} | Stock: {supplier.currentStock} {supplier.unit} | Cost: ₹{supplier.costPerUnit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="orderSupplier">Supplier</Label>
              <Select 
                value={orderDetails.supplier} 
                onValueChange={(value) => setOrderDetails({...orderDetails, supplier: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMaterial && getAvailableSuppliers(selectedMaterial.name).map((supplier, index) => (
                    <SelectItem key={index} value={supplier.name}>
                      {supplier.name} - ₹{supplier.costPerUnit}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">New Supplier</SelectItem>
                </SelectContent>
              </Select>
              {orderDetails.supplier === "new" && (
                <Input
                  placeholder="Enter new supplier name"
                  className="mt-2"
                  onChange={(e) => setOrderDetails({...orderDetails, supplier: e.target.value})}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderQuantity">Quantity</Label>
                <Input
                  id="orderQuantity"
                  type="number"
                  value={orderDetails.quantity}
                  onChange={(e) => setOrderDetails({...orderDetails, quantity: e.target.value})}
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <Label htmlFor="orderUnit">Unit</Label>
                <Select value={orderDetails.unit} onValueChange={(value) => setOrderDetails({...orderDetails, unit: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rolls">Rolls</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="sqm">Square Meters</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="tons">Tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="orderCostPerUnit">Cost per Unit (₹)</Label>
              <Input
                id="orderCostPerUnit"
                type="number"
                value={orderDetails.costPerUnit}
                onChange={(e) => setOrderDetails({...orderDetails, costPerUnit: e.target.value})}
                placeholder="Enter cost per unit"
              />
            </div>

            <div>
              <Label htmlFor="expectedDelivery">Expected Delivery</Label>
              <Input
                id="expectedDelivery"
                type="date"
                value={orderDetails.expectedDelivery}
                onChange={(e) => setOrderDetails({...orderDetails, expectedDelivery: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="orderNotes">Notes</Label>
              <Textarea
                id="orderNotes"
                value={orderDetails.notes}
                onChange={(e) => setOrderDetails({...orderDetails, notes: e.target.value})}
                placeholder="Additional notes..."
                className="min-h-[60px] max-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder} className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Material Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Material Details: {selectedMaterial?.name}
            </DialogTitle>
            <DialogDescription>
              Complete information about this raw material
            </DialogDescription>
          </DialogHeader>
          
          {selectedMaterial && (
            <div className="space-y-6">
              {/* Material Image and Basic Info */}
              <div className="flex gap-6">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  {selectedMaterial.imageUrl ? (
                    <img 
                      src={selectedMaterial.imageUrl} 
                      alt={selectedMaterial.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedMaterial.name}</h3>
                    <p className="text-lg text-muted-foreground">{selectedMaterial.brand}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                      <p className="font-medium">{selectedMaterial.category}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Batch Number</Label>
                      <p className="font-mono text-sm">{selectedMaterial.batchNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge 
                        className={
                          selectedMaterial.status === "in-stock" ? "bg-green-100 text-green-800 border-green-200" :
                          selectedMaterial.status === "low-stock" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                          selectedMaterial.status === "out-of-stock" ? "bg-red-100 text-red-800 border-red-200" :
                          "bg-blue-100 text-blue-800 border-blue-200"
                        }
                      >
                        {selectedMaterial.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stock Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedMaterial.currentStock}</div>
                      <div className="text-sm text-muted-foreground">Current Stock</div>
                      <div className="text-xs text-muted-foreground">{selectedMaterial.unit}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedMaterial.minThreshold}</div>
                      <div className="text-sm text-muted-foreground">Min Threshold</div>
                      <div className="text-xs text-muted-foreground">{selectedMaterial.unit}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedMaterial.maxCapacity}</div>
                      <div className="text-sm text-muted-foreground">Max Capacity</div>
                      <div className="text-xs text-muted-foreground">{selectedMaterial.unit}</div>
                    </div>
                  </div>
                  
                  {/* Stock Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Stock Level</span>
                      <span>{Math.round((selectedMaterial.currentStock / selectedMaterial.maxCapacity) * 100)}% of capacity</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          selectedMaterial.currentStock <= selectedMaterial.minThreshold ? 'bg-red-500' :
                          selectedMaterial.currentStock <= selectedMaterial.minThreshold * 1.5 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((selectedMaterial.currentStock / selectedMaterial.maxCapacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Cost per Unit</Label>
                      <p className="text-xl font-bold text-green-600">₹{selectedMaterial.costPerUnit.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Total Value</Label>
                      <p className="text-xl font-bold text-blue-600">₹{selectedMaterial.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supplier Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Supplier Name</Label>
                      <p className="font-medium">{selectedMaterial.supplier}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Supplier Performance</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${selectedMaterial.supplierPerformance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{selectedMaterial.supplierPerformance}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates and History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dates & History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Restocked</Label>
                      <p className="font-medium">{new Date(selectedMaterial.lastRestocked).toLocaleDateString()}</p>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsDetailsDialogOpen(false);
                handleOrderMaterial(selectedMaterial!);
              }}
            >
              Order Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {selectedRestockMaterial?.status === "out-of-stock" ? "Order" : "Restock"} {selectedRestockMaterial?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedRestockMaterial?.status === "out-of-stock" 
                ? "Order this material from available suppliers" 
                : "Restock this material from available suppliers"
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedRestockMaterial && (
            <div className="space-y-4">
              {/* Material Info */}
              <div className="p-3 border rounded-md bg-muted">
                <div className="flex items-center gap-3">
                  {selectedRestockMaterial.imageUrl && (
                    <img 
                      src={selectedRestockMaterial.imageUrl} 
                      alt={selectedRestockMaterial.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{selectedRestockMaterial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Current stock: {selectedRestockMaterial.currentStock} {selectedRestockMaterial.unit}
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Selection */}
              <div>
                <Label htmlFor="restockSupplier">Supplier</Label>
                <Select 
                  value={restockForm.supplier} 
                  onValueChange={handleRestockSupplierChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSuppliersForRestock(selectedRestockMaterial.category, selectedRestockMaterial.name).map((supplier, index) => (
                      <SelectItem key={index} value={supplier.name}>
                        <div className="flex flex-col">
                          <span className="font-medium">{supplier.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {supplier.brand} • ₹{supplier.costPerUnit} • {supplier.unit}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Available suppliers for {selectedRestockMaterial.category} materials
                </p>
              </div>

              {/* Brand (Auto-filled based on supplier) */}
              <div>
                <Label htmlFor="restockBrand">Brand</Label>
                <Input
                  id="restockBrand"
                  value={restockForm.brand}
                  onChange={(e) => setRestockForm({...restockForm, brand: e.target.value})}
                  placeholder="Brand will be auto-filled based on supplier"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Brand from selected supplier (can be modified)
                </p>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="restockQuantity">Quantity</Label>
                <Input
                  id="restockQuantity"
                  type="number"
                  value={restockForm.quantity}
                  onChange={(e) => setRestockForm({...restockForm, quantity: e.target.value})}
                  placeholder="Enter quantity to restock"
                  min="1"
                />
              </div>

              {/* Cost per Unit (Auto-filled based on supplier) */}
              <div>
                <Label htmlFor="restockCostPerUnit">Cost per Unit (₹)</Label>
                <Input
                  id="restockCostPerUnit"
                  type="number"
                  value={restockForm.costPerUnit}
                  onChange={(e) => setRestockForm({...restockForm, costPerUnit: e.target.value})}
                  placeholder="Cost will be auto-filled based on supplier"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cost from selected supplier (can be modified)
                </p>
              </div>

              {/* Expected Delivery */}
              <div>
                <Label htmlFor="restockExpectedDelivery">Expected Delivery Date</Label>
                <Input
                  id="restockExpectedDelivery"
                  type="date"
                  value={restockForm.expectedDelivery}
                  onChange={(e) => setRestockForm({...restockForm, expectedDelivery: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="restockNotes">Notes</Label>
                <Textarea
                  id="restockNotes"
                  value={restockForm.notes}
                  onChange={(e) => setRestockForm({...restockForm, notes: e.target.value})}
                  placeholder="Additional notes for this restock order"
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestockSubmit}>
              {selectedRestockMaterial?.status === "out-of-stock" ? "Create Order" : "Create Restock Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Production Notifications Component
function ProductionNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [wasteData, setWasteData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('rajdhani_material_notifications') || '[]');
    console.log('Loading notifications from localStorage:', storedNotifications);
    setNotifications(storedNotifications);
    
    // Load waste data from localStorage
    const storedWasteData = JSON.parse(localStorage.getItem('rajdhani_waste_management') || '[]');
    console.log('Loading waste data from localStorage:', storedWasteData);
    setWasteData(storedWasteData);
    
    setIsLoading(false);
  }, []);

  const markAsResolved = (notificationId: string) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, status: 'resolved' }
        : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('rajdhani_material_notifications', JSON.stringify(updatedNotifications));
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem('rajdhani_material_notifications', JSON.stringify(updatedNotifications));
  };


  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const resolvedNotifications = notifications.filter(n => n.status === 'resolved');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Notifications */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Pending Notifications ({pendingNotifications.length})
        </h3>
        
        {pendingNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>No pending material shortage notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingNotifications.map((notification) => (
              <div key={notification.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive" className="text-xs">HIGH PRIORITY</Badge>
                      <Badge variant="outline" className="text-xs">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-orange-900 mb-1">
                      {notification.materialName} - Shortage Alert
                    </h4>
                    <div className="text-sm text-orange-800 space-y-1">
                      <p><strong>Required:</strong> {notification.requiredQuantity} {notification.unit}</p>
                      <p><strong>Current Stock:</strong> {notification.currentStock} {notification.unit}</p>
                      <p><strong>Supplier:</strong> {notification.supplier}</p>
                      <p><strong>Estimated Cost:</strong> ₹{notification.estimatedCost.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => markAsResolved(notification.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Resolved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Notifications */}
      {resolvedNotifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Resolved Notifications ({resolvedNotifications.length})
          </h3>
          <div className="space-y-3">
            {resolvedNotifications.map((notification) => (
              <div key={notification.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">RESOLVED</Badge>
                      <Badge variant="outline" className="text-xs">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-green-900 mb-1">
                      {notification.materialName} - Shortage Resolved
                    </h4>
                    <div className="text-sm text-green-800">
                      <p><strong>Required:</strong> {notification.requiredQuantity} {notification.unit}</p>
                      <p><strong>Supplier:</strong> {notification.supplier}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Waste Management Component
function WasteManagement() {
  const [wasteData, setWasteData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load waste data from localStorage
    const storedWasteData = JSON.parse(localStorage.getItem('rajdhani_waste_management') || '[]');
    console.log('Loading waste data from localStorage:', storedWasteData);
    
    // Flatten the data if it's nested and fix localStorage
    let flatWasteData = storedWasteData;
    if (Array.isArray(storedWasteData) && storedWasteData.length > 0 && Array.isArray(storedWasteData[0])) {
      flatWasteData = storedWasteData.flat();
      console.log('Flattened waste data:', flatWasteData);
      
      // Fix the localStorage data structure
      localStorage.setItem('rajdhani_waste_management', JSON.stringify(flatWasteData));
      console.log('Fixed localStorage waste data structure');
    }
    
    setWasteData(flatWasteData);
    setIsLoading(false);
  }, []);

  // Calculate waste statistics
  const totalWasteItems = wasteData.length;
  const totalWasteQuantity = wasteData.reduce((sum, waste) => sum + waste.quantity, 0);
  const reusableWaste = wasteData.filter(waste => waste.canBeReused && waste.status === 'available_for_reuse').length;
  const addedWaste = wasteData.filter(waste => waste.status === 'added_to_inventory').length;
  const recyclingRate = totalWasteItems > 0 ? Math.round((reusableWaste / totalWasteItems) * 100) : 0;
  
  // Find most wasted material
  const materialWasteCount = wasteData.reduce((acc, waste) => {
    acc[waste.materialName] = (acc[waste.materialName] || 0) + waste.quantity;
    return acc;
  }, {} as Record<string, number>);
  const mostWastedMaterial = Object.entries(materialWasteCount).reduce((max, [material, count]) => 
    (count as number) > max.count ? { material, count: count as number } : max, 
    { material: 'None', count: 0 }
  );

  const handleReturnToInventory = (waste: any) => {
    // Get current raw materials
    const rawMaterials = JSON.parse(localStorage.getItem('rajdhani_raw_materials') || '[]');
    
    // Find the material in raw materials inventory
    const materialIndex = rawMaterials.findIndex((material: any) => material.id === waste.materialId);
    
    if (materialIndex !== -1) {
      // Update the material's current stock
      rawMaterials[materialIndex].currentStock += waste.quantity;
      
      // Update material status based on new stock level
      const newStock = rawMaterials[materialIndex].currentStock;
      rawMaterials[materialIndex].status = newStock <= 0 ? "out-of-stock" : 
                                          newStock <= 10 ? "low-stock" : "in-stock";
      
      // Save updated raw materials
      localStorage.setItem('rajdhani_raw_materials', JSON.stringify(rawMaterials));
      
      // Update waste item status to 'added_to_inventory'
      const updatedWasteData = wasteData.map(w => 
        w.id === waste.id 
          ? { ...w, status: 'added_to_inventory', addedAt: new Date().toISOString() }
          : w
      );
      
      // Save updated waste data
      localStorage.setItem('rajdhani_waste_management', JSON.stringify(updatedWasteData));
      setWasteData(updatedWasteData);
      
      console.log(`✅ ${waste.quantity} ${waste.unit} of ${waste.materialName} added back to inventory`);
      console.log(`📈 Material stock increased from ${rawMaterials[materialIndex].currentStock - waste.quantity} to ${rawMaterials[materialIndex].currentStock} ${waste.unit}`);
      
      // Show success message with stock details
      alert(`✅ Successfully added ${waste.quantity} ${waste.unit} of ${waste.materialName} back to inventory!\n\nStock increased to: ${rawMaterials[materialIndex].currentStock} ${waste.unit}\nStatus: ${rawMaterials[materialIndex].status}`);
    } else {
      console.error('Material not found in raw materials inventory:', waste.materialId);
      alert('Error: Material not found in inventory. Please check the material ID.');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading waste data...</div>;
  }

  return (
    <>
      {/* Waste Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waste Items</CardTitle>
            <Recycle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWasteItems}</div>
            <p className="text-xs text-muted-foreground">
              {totalWasteItems === 0 ? 'No waste recorded' : `${totalWasteQuantity} total units`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reusable Waste</CardTitle>
            <Recycle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reusableWaste}</div>
            <p className="text-xs text-muted-foreground">
              Items available for reuse
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Added to Inventory</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addedWaste}</div>
            <p className="text-xs text-muted-foreground">
              Items added back to stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recycling Rate</CardTitle>
            <Recycle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recyclingRate}%</div>
            <p className="text-xs text-muted-foreground">
              % of waste that can be reused
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Wasted</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostWastedMaterial.count.toString()}</div>
            <p className="text-xs text-muted-foreground">
              {mostWastedMaterial.material}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Waste Recovery Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Waste Recovery Summary
          </CardTitle>
          <CardDescription>
            Track which materials became waste and their recovery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(materialWasteCount).map(([materialName, totalWaste]) => {
              const materialWasteItems = wasteData.filter(w => w.materialName === materialName);
              const addedItems = materialWasteItems.filter(w => w.status === 'added_to_inventory');
              const availableItems = materialWasteItems.filter(w => w.status === 'available_for_reuse');
              const disposedItems = materialWasteItems.filter(w => w.status === 'disposed');
              
              return (
                <div key={materialName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{materialName}</h4>
                    <Badge variant="outline">{totalWaste.toString()} units wasted</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-medium">{addedItems.length}</div>
                      <div className="text-muted-foreground">Added to Inventory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 font-medium">{availableItems.length}</div>
                      <div className="text-muted-foreground">Available for Reuse</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-medium">{disposedItems.length}</div>
                      <div className="text-muted-foreground">Disposed</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Waste Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="w-5 h-5 text-success" />
                Waste Items
              </CardTitle>
              <CardDescription>
                Track all waste generated during production processes
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const storedWasteData = JSON.parse(localStorage.getItem('rajdhani_waste_management') || '[]');
                let flatWasteData = storedWasteData;
                if (Array.isArray(storedWasteData) && storedWasteData.length > 0 && Array.isArray(storedWasteData[0])) {
                  flatWasteData = storedWasteData.flat();
                  localStorage.setItem('rajdhani_waste_management', JSON.stringify(flatWasteData));
                }
                setWasteData(flatWasteData);
              }}
            >
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {wasteData.length === 0 ? (
            <div className="text-center py-12">
              <Recycle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Waste Data</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Waste items will appear here once production processes generate waste materials.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Material</th>
                    <th className="text-left p-3 font-medium">Quantity</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Waste Source</th>
                    <th className="text-left p-3 font-medium">Generated Date</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteData.map((waste) => (
                    <tr key={waste.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{waste.materialName}</div>
                        <div className="text-sm text-muted-foreground">{waste.materialId}</div>
                      </td>
                      <td className="p-3">
                        {waste.quantity} {waste.unit}
                      </td>
                      <td className="p-3">
                        <Badge variant={waste.wasteType === 'scrap' ? 'secondary' : 
                                      waste.wasteType === 'defective' ? 'destructive' : 'outline'}>
                          {waste.wasteType}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={
                          waste.status === 'available_for_reuse' ? 'default' : 
                          waste.status === 'added_to_inventory' ? 'outline' : 'secondary'
                        }>
                          {waste.status === 'available_for_reuse' ? 'Reusable' : 
                           waste.status === 'added_to_inventory' ? 'Added' : 'Disposed'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium">{waste.productName}</div>
                        <div className="text-xs text-muted-foreground">Production: {waste.productionId}</div>
                        <div className="text-xs text-blue-600">Waste Type: {waste.wasteType}</div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        <div>{new Date(waste.generatedAt).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(waste.generatedAt).toLocaleTimeString()}</div>
                        {waste.addedAt && (
                          <div className="text-xs text-green-600 mt-1">
                            Added: {new Date(waste.addedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {waste.status === 'available_for_reuse' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturnToInventory(waste)}
                            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Return to Inventory
                          </Button>
                        )}
                        {waste.status === 'added_to_inventory' && (
                          <div className="text-sm text-green-600 font-medium">
                            ✓ Added
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}