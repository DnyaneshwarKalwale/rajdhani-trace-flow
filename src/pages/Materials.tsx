import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, TrendingDown, Package, AlertTriangle, Recycle, ShoppingCart, History, Upload, Image, X, Download, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface RawMaterial {
  id: string;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  lastRestocked: string;
  dailyUsage: number;
  status: "sufficient" | "low" | "critical" | "out-of-stock";
  supplier: string;
  costPerUnit: number;
  supplierId?: string;
  imageUrl?: string; // Added image URL
}

const rawMaterials: RawMaterial[] = [
  {
    id: "1",
    name: "Cotton Yarn (Premium)",
    brand: "TextilePro",
    category: "Base Materials",
    currentStock: 45,
    unit: "rolls",
    minThreshold: 100,
    maxCapacity: 500,
    lastRestocked: "2024-01-10",
    dailyUsage: 8,
    status: "low",
    supplier: "Gujarat Textiles Ltd",
    costPerUnit: 450,
    supplierId: "supplier_1",
    imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=150&h=150&fit=crop&crop=center"
  },
  {
    id: "2",
    name: "Cotton Yarn (Premium)",
    brand: "PremiumYarn",
    category: "Base Materials",
    currentStock: 120,
    unit: "rolls",
    minThreshold: 100,
    maxCapacity: 500,
    lastRestocked: "2024-01-12",
    dailyUsage: 8,
    status: "sufficient",
    supplier: "ABC Textiles Ltd",
    costPerUnit: 520,
    supplierId: "supplier_2",
    imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=150&h=150&fit=crop&crop=center"
  },
  {
    id: "3",
    name: "Red Dye (Industrial)",
    brand: "ColorMax",
    category: "Dyes & Chemicals",
    currentStock: 85,
    unit: "liters",
    minThreshold: 50,
    maxCapacity: 200,
    lastRestocked: "2024-01-12",
    dailyUsage: 3,
    status: "sufficient",
    supplier: "Chemical Works India",
    costPerUnit: 180,
    supplierId: "supplier_3",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center"
  },
  {
    id: "4",
    name: "Red Dye (Industrial)",
    brand: "DyeMaster",
    category: "Dyes & Chemicals",
    currentStock: 25,
    unit: "liters",
    minThreshold: 50,
    maxCapacity: 200,
    lastRestocked: "2024-01-08",
    dailyUsage: 3,
    status: "low",
    supplier: "Industrial Colors Co",
    costPerUnit: 165,
    supplierId: "supplier_4",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center"
  },
  {
    id: "5",
    name: "Latex Solution",
    brand: "FlexiChem",
    category: "Finishing Materials",
    currentStock: 0,
    unit: "liters",
    minThreshold: 50,
    maxCapacity: 150,
    lastRestocked: "2024-01-05",
    dailyUsage: 5,
    status: "out-of-stock",
    supplier: "Industrial Chemicals Co",
    costPerUnit: 320,
    supplierId: "supplier_5",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=150&h=150&fit=crop&crop=center"
  },
  {
    id: "6",
    name: "Backing Cloth",
    brand: "SupportFabric",
    category: "Base Materials",
    currentStock: 150,
    unit: "sqm",
    minThreshold: 100,
    maxCapacity: 1000,
    lastRestocked: "2024-01-14",
    dailyUsage: 12,
    status: "sufficient",
    supplier: "Fabric Solutions Ltd",
    costPerUnit: 25,
    supplierId: "supplier_6",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center"
  },
  {
    id: "7",
    name: "Blue Dye (Industrial)",
    brand: "ColorMax",
    category: "Dyes & Chemicals",
    currentStock: 12,
    unit: "liters",
    minThreshold: 50,
    maxCapacity: 200,
    lastRestocked: "2024-01-08",
    dailyUsage: 4,
    status: "critical",
    supplier: "Chemical Works India",
    costPerUnit: 190,
    supplierId: "supplier_7",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=150&fit=crop&crop=center"
  },
  {
    id: "8",
    name: "Synthetic Yarn",
    brand: "ModernTextile",
    category: "Base Materials",
    currentStock: 200,
    unit: "rolls",
    minThreshold: 150,
    maxCapacity: 600,
    lastRestocked: "2024-01-15",
    dailyUsage: 10,
    status: "sufficient",
    supplier: "Synthetic Yarn Co",
    costPerUnit: 380,
    supplierId: "supplier_8",
    imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=150&h=150&fit=crop&crop=center"
  }
];

const statusStyles = {
  sufficient: "bg-success text-success-foreground",
  low: "bg-warning text-warning-foreground",
  critical: "bg-destructive text-destructive-foreground",
  "out-of-stock": "bg-destructive text-destructive-foreground"
};

export default function Materials() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isAddToInventoryOpen, setIsAddToInventoryOpen] = useState(false);
  const [isImportInventoryOpen, setIsImportInventoryOpen] = useState(false); // New state for import
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    brand: "",
    category: "",
    unit: "",
    minThreshold: "",
    maxCapacity: "",
    supplier: "",
    costPerUnit: "",
    imageUrl: ""
  });
  const [newInventoryMaterial, setNewInventoryMaterial] = useState({
    name: "",
    brand: "",
    category: "",
    currentStock: "",
    unit: "",
    minThreshold: "",
    maxCapacity: "",
    supplier: "",
    costPerUnit: "",
    imageUrl: ""
  });
  const [orderDetails, setOrderDetails] = useState({
    quantity: "",
    unit: "",
    supplier: "",
    costPerUnit: "",
    expectedDelivery: "",
    notes: ""
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedInventoryImage, setSelectedInventoryImage] = useState<File | null>(null);
  const [inventoryImagePreview, setInventoryImagePreview] = useState<string>("");
  
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
        lastRestocked: new Date().toISOString().split('T')[0],
        dailyUsage: 0,
        status: "out-of-stock",
        supplier: supplier,
        costPerUnit: cost,
        supplierId: "unknown"
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

  // Get priority score for sorting (lower stock = higher priority)
  const getPriorityScore = (material: RawMaterial) => {
    switch (material.status) {
      case "out-of-stock": return 0;
      case "critical": return 1;
      case "low": return 2;
      case "sufficient": return 3;
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
    const template = `Material Name,Brand,Category,Current Stock,Unit,Min Threshold,Max Capacity,Supplier,Cost Per Unit
Cotton Yarn (Premium),TextilePro,Base Materials,100,rolls,50,500,Gujarat Textiles Ltd,450
Red Dye (Industrial),ColorMax,Dyes & Chemicals,85,liters,25,200,Chemical Works India,180
Latex Solution,FlexiChem,Finishing Materials,75,liters,30,150,Industrial Chemicals Co,320
Backing Cloth,SupportFabric,Base Materials,150,sqm,80,1000,Fabric Solutions Ltd,25
Blue Dye (Industrial),ColorMax,Dyes & Chemicals,60,liters,25,200,Chemical Works India,190`;
    
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
          id: Date.now().toString() + index,
          name: row['Material Name'],
          brand: row['Brand'],
          category: row['Category'],
          currentStock: parseInt(row['Current Stock']),
          unit: row['Unit'],
          minThreshold: parseInt(row['Min Threshold']),
          maxCapacity: parseInt(row['Max Capacity']),
          lastRestocked: new Date().toISOString().split('T')[0],
          dailyUsage: 0,
          status: "sufficient",
          supplier: row['Supplier'],
          costPerUnit: parseFloat(row['Cost Per Unit']),
          supplierId: `supplier_${Date.now()}_${index}`,
          imageUrl: ""
        };
        
        validMaterials.push(material);
      });
      
      if (errors.length > 0) {
        setImportErrors(errors);
        setImportStatus('error');
        return;
      }
      
      // Add materials to inventory (in real app, save to database)
      console.log('Imported materials:', validMaterials);
      setImportStatus('success');
      
      // Reset form after successful import
      setTimeout(() => {
        setIsImportInventoryOpen(false);
        setImportFile(null);
        setImportPreview([]);
        setImportStatus('idle');
        setImportErrors([]);
        alert(`Successfully imported ${validMaterials.length} materials to inventory!`);
      }, 2000);
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
        matchesStatus = material.status === "low" || material.status === "critical" || material.status === "out-of-stock";
      } else if (statusFilter === "sufficient") {
        matchesStatus = material.status === "sufficient";
      } else if (statusFilter === "out-of-stock") {
        matchesStatus = material.status === "out-of-stock";
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
    // Add new material logic here
    setIsAddMaterialOpen(false);
    setNewMaterial({
      name: "",
      brand: "",
      category: "",
      unit: "",
      minThreshold: "",
      maxCapacity: "",
      supplier: "",
      costPerUnit: "",
      imageUrl: ""
    });
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleAddToInventory = () => {
    // Create new material and add it directly to inventory
    const newInventoryMaterialData: RawMaterial = {
      id: Date.now().toString(),
      name: newInventoryMaterial.name,
      brand: newInventoryMaterial.brand,
      category: newInventoryMaterial.category,
      currentStock: parseInt(newInventoryMaterial.currentStock) || 0,
      unit: newInventoryMaterial.unit,
      minThreshold: parseInt(newInventoryMaterial.minThreshold) || 0,
      maxCapacity: parseInt(newInventoryMaterial.maxCapacity) || 0,
      lastRestocked: new Date().toISOString().split('T')[0],
      dailyUsage: 0, // Will be calculated based on usage over time
      status: "sufficient", // Default status
      supplier: newInventoryMaterial.supplier,
      costPerUnit: parseFloat(newInventoryMaterial.costPerUnit) || 0,
      supplierId: `supplier_${Date.now()}`,
      imageUrl: inventoryImagePreview || newInventoryMaterial.imageUrl
    };

    // Add to materials list (in a real app, this would be saved to database)
    console.log("New material added to inventory:", newInventoryMaterialData);
    
    // Reset form
    setIsAddToInventoryOpen(false);
    setNewInventoryMaterial({
      name: "",
      brand: "",
      category: "",
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
    alert("Material added successfully to inventory!");
  };

  const handlePlaceOrder = () => {
    if (selectedMaterial) {
      navigate("/manage-stock", { 
        state: { 
          prefillOrder: {
            materialName: selectedMaterial.name,
            supplier: orderDetails.supplier,
            quantity: orderDetails.quantity,
            unit: orderDetails.unit,
            costPerUnit: orderDetails.costPerUnit,
            expectedDelivery: orderDetails.expectedDelivery,
            notes: orderDetails.notes
          }
        }
      });
    }
    setIsOrderDialogOpen(false);
  };

  const lowStockCount = rawMaterials.filter(m => m.status === "low" || m.status === "critical" || m.status === "out-of-stock").length;
  const totalMaterials = rawMaterials.length;
  const dailyConsumption = rawMaterials.reduce((sum, m) => sum + (m.dailyUsage * m.costPerUnit), 0);

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
            <TabsTrigger value="procurement">Procurement</TabsTrigger>
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
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                        <Label htmlFor="inventoryBrand">Brand *</Label>
                        <Input
                          id="inventoryBrand"
                          value={newInventoryMaterial.brand}
                          onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, brand: e.target.value})}
                          placeholder="e.g., TextilePro"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="inventoryCategory">Category *</Label>
                        <Select value={newInventoryMaterial.category} onValueChange={(value) => setNewInventoryMaterial({...newInventoryMaterial, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Base Materials">Base Materials</SelectItem>
                            <SelectItem value="Dyes & Chemicals">Dyes & Chemicals</SelectItem>
                            <SelectItem value="Finishing Materials">Finishing Materials</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="inventoryUnit">Unit *</Label>
                        <Select value={newInventoryMaterial.unit} onValueChange={(value) => setNewInventoryMaterial({...newInventoryMaterial, unit: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rolls">Rolls</SelectItem>
                            <SelectItem value="liters">Liters</SelectItem>
                            <SelectItem value="kg">Kilograms</SelectItem>
                            <SelectItem value="sqm">Square Meters</SelectItem>
                            <SelectItem value="pieces">Pieces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="inventorySupplier">Supplier *</Label>
                        <Input
                          id="inventorySupplier"
                          value={newInventoryMaterial.supplier}
                          onChange={(e) => setNewInventoryMaterial({...newInventoryMaterial, supplier: e.target.value})}
                          placeholder="e.g., ABC Textiles Ltd."
                          required
                        />
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
              Add Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Raw Material</DialogTitle>
                    <DialogDescription>
                      Add a new raw material to your inventory system.
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
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={newMaterial.brand}
                          onChange={(e) => setNewMaterial({...newMaterial, brand: e.target.value})}
                          placeholder="e.g., TextilePro"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newMaterial.category} onValueChange={(value) => setNewMaterial({...newMaterial, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Base Materials">Base Materials</SelectItem>
                            <SelectItem value="Dyes & Chemicals">Dyes & Chemicals</SelectItem>
                            <SelectItem value="Finishing Materials">Finishing Materials</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={newMaterial.unit} onValueChange={(value) => setNewMaterial({...newMaterial, unit: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rolls">Rolls</SelectItem>
                            <SelectItem value="liters">Liters</SelectItem>
                            <SelectItem value="kg">Kilograms</SelectItem>
                            <SelectItem value="sqm">Square Meters</SelectItem>
                            <SelectItem value="pieces">Pieces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input
                          id="supplier"
                          value={newMaterial.supplier}
                          onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                          placeholder="e.g., ABC Textiles Ltd."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
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
                <CardTitle className="text-sm font-medium">Daily Consumption</CardTitle>
                <TrendingDown className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{dailyConsumption.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Material cost today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waste Recovery</CardTitle>
                <Recycle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15.2%</div>
                <p className="text-xs text-muted-foreground">
                  Materials recycled
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
                      <th className="text-left p-4 font-medium text-muted-foreground">Usage Rate</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Supplier</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Cost/Unit</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map((material) => {
                      const daysRemaining = Math.floor(material.currentStock / material.dailyUsage);
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
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {material.dailyUsage} {material.unit}/day
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {material.currentStock > 0 ? `${daysRemaining} days left` : "Out of stock"}
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
                                variant={material.status === "out-of-stock" || material.status === "critical" ? "default" : "outline"} 
                                size="sm"
                                onClick={() => handleOrderMaterial(material)}
                              >
                                {material.status === "out-of-stock" || material.status === "critical" ? "Order Now" : "Restock"}
                              </Button>
                              <Button variant="outline" size="sm">
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

        <TabsContent value="waste" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="w-5 h-5 text-success" />
                Waste Management & Recycling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Recycle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Waste Tracking System</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Track production waste, identify recycling opportunities, and optimize material usage to reduce environmental impact and costs.
                </p>
                <Button className="mt-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Waste
                </Button>
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
    </div>
  );
}