import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Search, Package, Factory, Play, Clock, 
  CheckCircle, Filter, SortAsc, SortDesc, FileSpreadsheet,
  Truck, AlertTriangle
} from "lucide-react";
import { getFromStorage, saveToStorage, updateStorage, generateUniqueId } from "@/lib/storage";
import { getProductionFlow, getProgressPercentage } from "@/lib/machines";
import { Loading } from "@/components/ui/loading";

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

export default function Production() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"priority" | "createdAt" | "expectedCompletion">("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [productionProducts, setProductionProducts] = useState<ProductionProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load production products from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rajdhani_production_products');
    if (saved) {
      setProductionProducts(JSON.parse(saved));
    }
  }, []);

  // Save production products to localStorage
  const saveProductionProducts = (products: ProductionProduct[]) => {
    localStorage.setItem('rajdhani_production_products', JSON.stringify(products));
    setProductionProducts(products);
  };

  // Add product to production
  const handleAddToProduction = () => {
    navigate('/production/new-batch');
  };

  // Start production for a product (planning phase)
  const handleStartProduction = (product: ProductionProduct) => {
    setIsLoading(true);
    // Small delay for better UX
    setTimeout(() => {
      navigate(`/production-detail/${product.id}`);
    }, 300);
  };

  // Continue production for active products
  const handleContinueProduction = (product: ProductionProduct) => {
    navigate(`/production-detail/${product.id}`);
  };

  // Complete production and add to inventory
  const handleCompleteProduction = (product: ProductionProduct) => {
    setIsLoading(true);
    // Small delay for better UX
    setTimeout(() => {
      navigate(`/production/complete/${product.id}`);
    }, 300);
  };

  // Filter and sort products
  const filteredProducts = (productionProducts || [])
    .filter(product => {
      if (!product || !product.productName || !product.category) return false;
      
      const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || product.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "priority":
          const priorityOrder = { urgent: 3, high: 2, normal: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case "createdAt":
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "expectedCompletion":
          comparison = new Date(a.expectedCompletion).getTime() - new Date(b.expectedCompletion).getTime();
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
      <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading...
                </h3>
                <p className="text-sm text-gray-600">
                  Preparing your production details
                </p>
              </div>
            </div>
          </div>
            </div>
          )}
      <Header 
        title="Production Management" 
        subtitle="Track material consumption, waste generation, and complete manufacturing processes"
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleAddToProduction} className="bg-production hover:bg-production/90">
            <Plus className="w-4 h-4 mr-2" />
            Add to Production
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
        </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Production Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Production ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="planning">Planning ({filteredProducts.filter(p => p && p.status === "planning").length})</TabsTrigger>
          <TabsTrigger value="active">Active ({filteredProducts.filter(p => p && p.status === "active").length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filteredProducts.filter(p => p && p.status === "completed").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductionCard
                key={product.id}
                product={product}
                onStartProduction={handleStartProduction}
                onContinueProduction={handleContinueProduction}
                onCompleteProduction={handleCompleteProduction}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts
              .filter(p => p && p.status === "planning")
              .map((product) => (
                <ProductionCard
                  key={product.id}
                  product={product}
                  onStartProduction={handleStartProduction}
                  onContinueProduction={handleContinueProduction}
                  onCompleteProduction={handleCompleteProduction}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts
              .filter(p => p && p.status === "active")
              .map((product) => (
                <ProductionCard
                  key={product.id}
                  product={product}
                  onStartProduction={handleStartProduction}
                  onContinueProduction={handleContinueProduction}
                  onCompleteProduction={handleCompleteProduction}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts
              .filter(p => p && p.status === "completed")
              .map((product) => (
                <ProductionCard
                  key={product.id}
                  product={product}
                  onStartProduction={handleStartProduction}
                  onContinueProduction={handleContinueProduction}
                  onCompleteProduction={handleCompleteProduction}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredProducts.length === 0 && (
        <Card className="text-center py-12">
          <Factory className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Production Items</h3>
          <p className="text-gray-500 mb-4">
            Start by adding products to production from the Product Inventory
          </p>
          <Button onClick={handleAddToProduction} className="bg-production hover:bg-production/90">
            <Plus className="w-4 h-4 mr-2" />
            Add to Production
          </Button>
        </Card>
      )}
    </div>
  );
}

// Production Card Component
interface ProductionCardProps {
  product: ProductionProduct;
  onStartProduction: (product: ProductionProduct) => void;
  onContinueProduction: (product: ProductionProduct) => void;
  onCompleteProduction: (product: ProductionProduct) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

function ProductionCard({
  product,
  onStartProduction,
  onContinueProduction,
  onCompleteProduction,
  getStatusColor,
  getPriorityColor
}: ProductionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {product.productName}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(product.status)}>
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </Badge>
              <Badge className={getPriorityColor(product.priority)}>
                {product.priority.charAt(0).toUpperCase() + product.priority.slice(1)}
              </Badge>
            </div>
          </div>
          <Package className="w-8 h-8 text-gray-400" />
      </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Category:</span>
            <p className="font-medium">{product.category}</p>
          </div>
          <div>
            <span className="text-gray-500">Color:</span>
            <p className="font-medium">{product.color}</p>
          </div>
          <div>
            <span className="text-gray-500">Size:</span>
            <p className="font-medium">{product.size}</p>
          </div>
          <div>
            <span className="text-gray-500">Quantity:</span>
            <p className="font-medium">{product.targetQuantity}</p>
            </div>
            </div>

        <div className="text-sm text-gray-500">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3" />
            Expected: {new Date(product.expectedCompletion).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Truck className="w-3 h-3" />
            Materials: {product.materialsConsumed?.length || 0} consumed
            {product.status === "active" && (!product.materialsConsumed || product.materialsConsumed.length === 0) && (
              <span className="text-red-600 text-xs ml-1">⚠️ Required</span>
            )}
          </div>
          {(() => {
            const flow = getProductionFlow(product.id);
            const progressPercentage = flow ? getProgressPercentage(flow) : 0;
            return flow && product.status === 'active' && (
              <div className="flex items-center gap-1">
                <Factory className="w-3 h-3" />
                Production Progress: {progressPercentage}%
                <div className="w-16 bg-gray-200 rounded-full h-1 ml-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            );
          })()}
          {product.wasteGenerated?.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Waste: {product.wasteGenerated.length} items
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {product.status === "planning" && (
            <Button 
              onClick={() => onStartProduction(product)}
              className="flex-1 bg-production hover:bg-production/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Plan Materials
            </Button>
          )}

          {product.status === "active" && (() => {
            const flow = getProductionFlow(product.id);
            const isFlowCompleted = flow?.status === 'completed';
            return (
              <Button 
                onClick={() => isFlowCompleted ? onCompleteProduction(product) : onContinueProduction(product)}
                className={`flex-1 ${isFlowCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isFlowCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Individual Product Details
                  </>
                ) : (
                  <>
                    <Factory className="w-4 h-4 mr-2" />
                    Continue Production Flow
                  </>
                )}
              </Button>
            );
          })()}

          {product.status === "completed" && (
            <Button 
              onClick={() => onCompleteProduction(product)}
              variant="outline"
              className="flex-1"
            >
              <Package className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
