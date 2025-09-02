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
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Search,
  Eye,
  Edit,
  ArrowRight,
  ArrowLeft,
  Lock,
  Unlock,
  Factory,
  Zap,
  Target,
  Calendar,
  Users,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { rawMaterialsStorage } from "@/utils/localStorage";
import { useToast } from "@/hooks/use-toast";

interface RawMaterial {
  id: string;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  supplier: string;
  costPerUnit: number;
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
}

const defaultProductionSteps = [
  {
    id: "1",
    stepNumber: 1,
    name: "Material Preparation",
    description: "Prepare and organize raw materials for production",
    status: "pending" as const,
    materials: [],
    waste: 0,
    defects: 0,
    qualityGrade: "A" as const,
    notes: "",
    progress: 0
  },
  {
    id: "2",
    stepNumber: 2,
    name: "Dyeing Process",
    description: "Apply dyes and color treatments to materials",
    status: "pending" as const,
    materials: [],
    waste: 0,
    defects: 0,
    qualityGrade: "A" as const,
    notes: "",
    progress: 0
  },
  {
    id: "3",
    stepNumber: 3,
    name: "Cutting & Shaping",
    description: "Cut materials to required dimensions and shapes",
    status: "pending" as const,
    materials: [],
    waste: 0,
    defects: 0,
    qualityGrade: "A" as const,
    notes: "",
    progress: 0
  },
  {
    id: "4",
    stepNumber: 4,
    name: "Assembly",
    description: "Assemble components into final product",
    status: "pending" as const,
    materials: [],
    waste: 0,
    defects: 0,
    qualityGrade: "A" as const,
    notes: "",
    progress: 0
  },
  {
    id: "5",
    stepNumber: 5,
    name: "Quality Inspection",
    description: "Final quality check and grading",
    status: "pending" as const,
    materials: [],
    waste: 0,
    defects: 0,
    qualityGrade: "A" as const,
    notes: "",
    progress: 0
  }
];

export default function Production() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [productionProducts, setProductionProducts] = useState<ProductionProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductionProduct | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    targetQuantity: "",
    priority: "medium" as const,
    expectedCompletion: "",
    imageUrl: "",
    location: "",
    operator: "",
    sellingPrice: ""
  });

  // Load raw materials from localStorage
  useEffect(() => {
    const materials = rawMaterialsStorage.getAll();
    setRawMaterials(materials);
    
    // Load production products from localStorage
    const savedProducts = localStorage.getItem('rajdhani_production_products');
    if (savedProducts) {
      setProductionProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save production products to localStorage
  useEffect(() => {
    localStorage.setItem('rajdhani_production_products', JSON.stringify(productionProducts));
  }, [productionProducts]);

  // Filter and sort production products
  const filteredProducts = productionProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || product.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      // Sort by priority first, then by status
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const statusOrder = { "in-progress": 0, planning: 1, "on-hold": 2, completed: 3 };
      
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return statusOrder[a.status] - statusOrder[b.status];
    });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "on-hold": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (product: ProductionProduct) => {
    if (product.totalSteps === 0) return 0;
    const completedSteps = product.steps.filter(step => step.status === "completed").length;
    return (completedSteps / product.totalSteps) * 100;
  };

  // Generate batch number
  const generateBatchNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PROD-${year}${month}${day}-${random}`;
  };

  // Handle adding new production product
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.targetQuantity) {
      toast({
        title: "⚠️ Missing Required Fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    const product: ProductionProduct = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      targetQuantity: parseInt(newProduct.targetQuantity),
      currentStep: 1,
      totalSteps: defaultProductionSteps.length,
      status: "planning",
      priority: newProduct.priority,
      startDate: new Date().toISOString().split('T')[0],
      expectedCompletion: newProduct.expectedCompletion,
      materials: [],
      steps: defaultProductionSteps.map(step => ({ ...step, id: `${Date.now()}_${step.stepNumber}` })),
      imageUrl: newProduct.imageUrl,
      batchNumber: generateBatchNumber(),
      location: newProduct.location,
      operator: newProduct.operator,
      totalCost: 0,
      sellingPrice: parseFloat(newProduct.sellingPrice) || 0
    };

    setProductionProducts(prev => [product, ...prev]);
    setIsAddProductOpen(false);
    setNewProduct({
      name: "",
      description: "",
      category: "",
      targetQuantity: "",
      priority: "medium",
      expectedCompletion: "",
      imageUrl: "",
      location: "",
      operator: "",
      sellingPrice: ""
    });

    toast({
      title: "✅ Production Product Created!",
      description: `${product.name} has been added to production queue.`,
      variant: "default",
    });
  };

  // Handle starting production
  const handleStartProduction = (product: ProductionProduct) => {
    const updatedProduct = { ...product, status: "in-progress" as const };
    setProductionProducts(prev => 
      prev.map(p => p.id === product.id ? updatedProduct : p)
    );
    
    toast({
      title: "🚀 Production Started!",
      description: `${product.name} production has begun.`,
      variant: "default",
    });
  };

  // Handle viewing production details
  const handleViewDetails = (product: ProductionProduct) => {
    navigate(`/production/${product.id}`, { state: { product } });
  };

  // Get production statistics
  const getProductionStats = () => {
    const total = productionProducts.length;
    const planning = productionProducts.filter(p => p.status === "planning").length;
    const inProgress = productionProducts.filter(p => p.status === "in-progress").length;
    const completed = productionProducts.filter(p => p.status === "completed").length;
    const onHold = productionProducts.filter(p => p.status === "on-hold").length;

    return { total, planning, inProgress, completed, onHold };
  };

  const stats = getProductionStats();

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Production Management" 
        subtitle="Manage production workflows, track progress, and optimize manufacturing processes"
      />

          {/* Production Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              In production queue
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planning</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">{stats.planning}</div>
                <p className="text-xs text-muted-foreground">
              Ready to start
                </p>
              </CardContent>
            </Card>
        <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Factory className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
              Currently manufacturing
                </p>
              </CardContent>
            </Card>
        <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
              Finished products
                </p>
              </CardContent>
            </Card>
        <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <Pause className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
            <div className="text-2xl font-bold">{stats.onHold}</div>
                <p className="text-xs text-muted-foreground">
              Paused production
                </p>
              </CardContent>
            </Card>
          </div>

      {/* Production Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search production products..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 shrink-0">
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4" />
                Add Production Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Production Product</DialogTitle>
                <DialogDescription>
                  Set up a new production batch with workflow steps and material requirements
                </DialogDescription>
              </DialogHeader>
          <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="e.g., Traditional Persian Carpet"
                    />
                    </div>
                  <div>
                    <Label htmlFor="productCategory">Category *</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Carpet">Carpet</SelectItem>
                        <SelectItem value="Rug">Rug</SelectItem>
                        <SelectItem value="Tapestry">Tapestry</SelectItem>
                        <SelectItem value="Textile">Textile</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                
                <div>
                  <Label htmlFor="productDescription">Description</Label>
                  <Textarea
                    id="productDescription"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Product description and specifications"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="targetQuantity">Target Quantity *</Label>
                    <Input
                      id="targetQuantity"
                      type="number"
                      value={newProduct.targetQuantity}
                      onChange={(e) => setNewProduct({...newProduct, targetQuantity: e.target.value})}
                      placeholder="100"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productPriority">Priority *</Label>
                    <Select value={newProduct.priority} onValueChange={(value: any) => setNewProduct({...newProduct, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  <div>
                    <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      value={newProduct.sellingPrice}
                      onChange={(e) => setNewProduct({...newProduct, sellingPrice: e.target.value})}
                      placeholder="5000"
                      min="0"
                    />
                    </div>
                  </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expectedCompletion">Expected Completion</Label>
                    <Input
                      id="expectedCompletion"
                      type="date"
                      value={newProduct.expectedCompletion}
                      onChange={(e) => setNewProduct({...newProduct, expectedCompletion: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                            </div>
                            <div>
                    <Label htmlFor="location">Production Location</Label>
                    <Input
                      id="location"
                      value={newProduct.location}
                      onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                      placeholder="e.g., Factory Floor A"
                    />
                            </div>
                          </div>

                <div>
                  <Label htmlFor="operator">Assigned Operator</Label>
                  <Input
                    id="operator"
                    value={newProduct.operator}
                    onChange={(e) => setNewProduct({...newProduct, operator: e.target.value})}
                    placeholder="e.g., John Smith"
                  />
                            </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Create Production Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
                          </div>
                        </div>

      {/* Production Products List */}
      <div className="space-y-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
                        <Badge variant="outline" className="font-mono text-xs">
                          {product.batchNumber}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{product.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Category: {product.category}</span>
                        <span className="text-muted-foreground">Target: {product.targetQuantity} units</span>
                        <span className="text-muted-foreground">Started: {new Date(product.startDate).toLocaleDateString()}</span>
                        {product.location && (
                          <span className="text-muted-foreground">Location: {product.location}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(product.priority)}>
                        {product.priority === "urgent" && <Zap className="w-3 h-3 mr-1" />}
                        {product.priority.charAt(0).toUpperCase() + product.priority.slice(1)}
                      </Badge>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status === "in-progress" && <Factory className="w-3 h-3 mr-1" />}
                        {product.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {product.status.replace("-", " ")}
                      </Badge>
                              </div>
                            </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Production Progress</span>
                      <span>{Math.round(getProgressPercentage(product))}%</span>
                    </div>
                    <Progress value={getProgressPercentage(product)} className="h-3" />
                        </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {product.status === "planning" && (
                      <Button 
                        onClick={() => handleStartProduction(product)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Play className="w-4 h-4" />
                        Start Production
                      </Button>
                    )}
                    {product.status === "in-progress" && (
                      <Button 
                        variant="outline"
                        onClick={() => handleViewDetails(product)}
                        className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                        Manage Production
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => handleViewDetails(product)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Production Steps Flow */}
                <div className="lg:w-96">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Production Steps
                  </h4>
                  <div className="space-y-3">
                    {product.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                          step.status === "completed" 
                            ? "bg-green-500 text-white shadow-lg" 
                            : step.status === "in-progress"
                            ? "bg-yellow-500 text-white shadow-lg animate-pulse"
                            : "bg-gray-200 text-gray-600"
                        }`}>
                          {step.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : step.status === "in-progress" ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            step.stepNumber
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{step.name}</div>
                          <div className="text-xs text-muted-foreground">{step.description}</div>
                          </div>
                        {index < product.steps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                  </div>
                </CardContent>
              </Card>
            ))}

        {filteredProducts.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <Factory className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Production Products</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first production product to begin manufacturing.
            </p>
            <Button onClick={() => setIsAddProductOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Production Product
            </Button>
          </Card>
        )}
          </div>
    </div>
  );
}