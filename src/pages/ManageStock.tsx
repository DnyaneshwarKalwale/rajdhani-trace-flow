import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Building2,
  History,
  Plus
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { materialOrdersStorage, rawMaterialsStorage } from "@/utils/localStorage";

interface StockOrder {
  id: string;
  materialName: string;
  materialBrand?: string;
  materialCategory?: string;
  materialBatchNumber?: string;
  supplier: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  orderDate: string;
  expectedDelivery: string;
  status: "ordered" | "in-transit" | "delivered" | "cancelled";
  notes?: string;
  actualDelivery?: string;
  minThreshold?: number;
  maxCapacity?: number;
  qualityGrade?: string;
  isRestock?: boolean; // Indicates if this is a restock order
}

// No hardcoded orders - all orders are now loaded from localStorage

const statusConfig = {
  "ordered": { label: "Ordered", icon: Clock, color: "bg-blue-100 text-blue-800" },
  "in-transit": { label: "In Transit", icon: Truck, color: "bg-yellow-100 text-yellow-800" },
  "delivered": { label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  "cancelled": { label: "Cancelled", icon: AlertTriangle, color: "bg-red-100 text-red-800" }
};

export default function ManageStock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<StockOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StockOrder | null>(null);
  
  // Ref to track processed prefillOrders to prevent duplicates
  const processedPrefillOrders = useRef<Set<string>>(new Set());

  // Function to remove duplicate orders
  const removeDuplicateOrders = (orders: StockOrder[]) => {
    const seen = new Set<string>();
    return orders.filter(order => {
      const key = `${order.materialName}-${order.supplier}-${order.quantity}-${order.unit}-${order.costPerUnit}-${order.status}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  // Load orders from localStorage on component mount
  useEffect(() => {
    const loadedOrders = materialOrdersStorage.getAll();

    
    // Remove any duplicate orders that might exist
    const uniqueOrders = removeDuplicateOrders(loadedOrders);
    if (uniqueOrders.length !== loadedOrders.length) {

      // Update localStorage with unique orders
      uniqueOrders.forEach((order, index) => {
        if (index === 0) {
          localStorage.setItem('rajdhani_material_orders', JSON.stringify([order]));
        } else {
          const existing = JSON.parse(localStorage.getItem('rajdhani_material_orders') || '[]');
          existing.push(order);
          localStorage.setItem('rajdhani_material_orders', JSON.stringify(existing));
        }
      });
    }
    
    setOrders(uniqueOrders);
    
    // Cleanup function to clear processed prefillOrders when component unmounts
    return () => {
      processedPrefillOrders.current.clear();
    };
  }, []);

  // Handle pre-filled order data from Materials page
  useEffect(() => {
    if (location.state?.prefillOrder) {
      const prefillData = location.state.prefillOrder;
      
      // Create a unique key for this prefillOrder to prevent duplicates
      const prefillKey = `${prefillData.materialName}-${prefillData.supplier}-${prefillData.quantity}-${prefillData.unit}-${prefillData.costPerUnit}`;
      

      
      // Check if we've already processed this exact prefillOrder
      if (processedPrefillOrders.current.has(prefillKey)) {
        console.log('PrefillOrder already processed, skipping duplicate');
        // Clear the state to prevent re-opening on refresh
        window.history.replaceState({}, document.title);
        return;
      }
      
      // Check if this order already exists in localStorage to prevent duplicates
      const allOrders = materialOrdersStorage.getAll();
      const existingOrder = allOrders.find(order => 
        order.materialName === prefillData.materialName &&
        order.supplier === prefillData.supplier &&
        order.quantity === parseInt(prefillData.quantity) &&
        order.unit === prefillData.unit &&
        order.costPerUnit === parseFloat(prefillData.costPerUnit) &&
        order.status === "ordered"
      );
      
      // Also check for recent orders (within last 5 seconds) to prevent rapid duplicates
      const recentOrder = allOrders.find(order => {
        const orderTime = new Date(order.createdAt || order.orderDate).getTime();
        const currentTime = Date.now();
        const timeDiff = currentTime - orderTime;
        
        return order.materialName === prefillData.materialName &&
               order.supplier === prefillData.supplier &&
               order.quantity === parseInt(prefillData.quantity) &&
               order.unit === prefillData.unit &&
               order.costPerUnit === parseFloat(prefillData.costPerUnit) &&
               order.status === "ordered" &&
               timeDiff < 5000; // 5 seconds
      });
      
      if (recentOrder) {

        // Clear the state to prevent re-opening on refresh
        window.history.replaceState({}, document.title);
        return;
      }
      
      if (!existingOrder) {

        const newOrder: StockOrder = {
          id: Date.now().toString(),
          materialName: prefillData.materialName,
          materialBrand: prefillData.materialBrand || "Unknown",
          materialCategory: prefillData.materialCategory || "Other",
          materialBatchNumber: prefillData.materialBatchNumber || `BATCH-${Date.now()}`,
          supplier: prefillData.supplier,
          quantity: parseInt(prefillData.quantity),
          unit: prefillData.unit,
          costPerUnit: parseFloat(prefillData.costPerUnit),
          totalCost: parseInt(prefillData.quantity) * parseFloat(prefillData.costPerUnit),
          orderDate: new Date().toISOString().split('T')[0],
          expectedDelivery: prefillData.expectedDelivery || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "ordered",
          notes: prefillData.notes || `${prefillData.isRestock ? 'Restock' : 'New material procurement'} order for ${prefillData.materialName}`,
          minThreshold: prefillData.minThreshold || 100,
          maxCapacity: prefillData.maxCapacity || 1000,
          qualityGrade: prefillData.qualityGrade || "A",
          isRestock: prefillData.isRestock || false
        };

        // Add to localStorage and update state
        const savedOrder = materialOrdersStorage.add(newOrder);
        setOrders(prev => [savedOrder, ...prev]);
        
        // Update raw material status to "in-transit" if it's a restock order
        if (newOrder.isRestock) {
          console.log(`🚀 Calling updateRawMaterialStatusToInTransit for order:`, newOrder);
          updateRawMaterialStatusToInTransit(newOrder);
        } else {
          console.log(`⚠️ Order is not marked as restock, skipping status update:`, newOrder);
        }
        
        // Mark this prefillOrder as processed
        processedPrefillOrders.current.add(prefillKey);
        
        // Show success message
        toast({
          title: "✅ Material Order Created!",
          description: `${prefillData.materialName} order has been created successfully.`,
          variant: "default",
        });
        

      } else {

      }
      
      // Clear the state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
      
      // Also clear the location state to prevent any re-triggering
      if (location.state?.prefillOrder) {
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, navigate]); // Added navigate to dependencies

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: StockOrder["status"]) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            actualDelivery: newStatus === "delivered" ? new Date().toISOString().split('T')[0] : order.actualDelivery
          }
        : order
    );
    
    // Update local state
    setOrders(updatedOrders);
    
    // If status is "delivered", update the raw material inventory
    if (newStatus === "delivered") {
      const deliveredOrder = updatedOrders.find(order => order.id === orderId);
      if (deliveredOrder) {
        updateRawMaterialStock(deliveredOrder);
      }
    }
    
    // Update the order in localStorage
    const orderToUpdate = updatedOrders.find(order => order.id === orderId);
    if (orderToUpdate) {
      materialOrdersStorage.update(orderId, orderToUpdate);
    }
  };

  // Function to update raw material status to "in-transit" when order is created
  const updateRawMaterialStatusToInTransit = (order: StockOrder) => {
    const rawMaterials = rawMaterialsStorage.getAll();
    console.log(`🔍 Looking for material to update:`, {
      orderName: order.materialName,
      orderSupplier: order.supplier,
      orderUnit: order.unit
    });
    console.log(`📋 Available materials:`, rawMaterials.map(m => ({
      name: m.name,
      supplier: m.supplier,
      unit: m.unit,
      status: m.status
    })));
    
    let materialFound = false;
    const updatedMaterials = rawMaterials.map((material: any) => {
      // More flexible matching - check name first, then supplier and unit
      const nameMatches = material.name.toLowerCase().trim() === order.materialName.toLowerCase().trim();
      const supplierMatches = material.supplier.toLowerCase().trim() === order.supplier.toLowerCase().trim();
      const unitMatches = material.unit.toLowerCase().trim() === order.unit.toLowerCase().trim();
      
      if (nameMatches && supplierMatches && unitMatches) {
        materialFound = true;
        console.log(`✅ Found matching material: ${material.name} (${material.supplier})`);
        console.log(`🔄 Updating material ${material.name} status from "${material.status}" to "in-transit"`);
        return {
          ...material,
          status: "in-transit" as const
        };
      }
      return material;
    });
    
    if (!materialFound) {
      console.log(`❌ No matching material found for order:`, {
        name: order.materialName,
        supplier: order.supplier,
        unit: order.unit
      });
    }
    
    // Update localStorage
    rawMaterialsStorage.replaceAll(updatedMaterials);
    console.log(`📦 Updated ${order.materialName} status to "in-transit"`);
  };

      // Function to update raw material stock when order is delivered
      // SMART LOGIC: Automatically detects when to restock vs create new material
      // 
      // RESTOCK SCENARIO: Same name + same supplier + same brand + same quality (price can vary)
      // NEW MATERIAL SCENARIO: Different supplier OR different brand OR different quality
      // 
      // This means:
      // - Same material + same supplier + same brand + same quality = RESTOCK (update existing)
      // - Same material + different supplier = NEW MATERIAL (create new entry)
      // - Same material + same supplier + price change = RESTOCK (update existing, new price)
      // - Same material + same supplier + different quality = NEW MATERIAL (create new entry)
      const updateRawMaterialStock = (deliveredOrder: StockOrder) => {
    try {
      const rawMaterials = rawMaterialsStorage.getAll();
      console.log('📦 Processing delivered order:', deliveredOrder);
      console.log('📋 Current raw materials in inventory:', rawMaterials.length);
      
              // Check if this is EXACTLY the same material (ALL fields must match for restock)
        // SMART RESTOCK LOGIC: Only supplier, brand, and quality matter for restock
        // Price changes are allowed and don't create new materials
        // 
        // Example scenarios:
        // 1. RESTOCK: Cotton Yarn + ABC Textiles + Premium + Rolls (price can vary) = RESTOCK existing
        // 2. NEW MATERIAL: Cotton Yarn + XYZ Textiles + Premium + Rolls = NEW MATERIAL (different supplier)
        // 3. RESTOCK: Cotton Yarn + ABC Textiles + Premium + Rolls (price changed) = RESTOCK existing
        // 4. NEW MATERIAL: Cotton Yarn + ABC Textiles + Standard + Rolls = NEW MATERIAL (different quality)
        // 5. NEW MATERIAL: Cotton Yarn + ABC Textiles + Premium + Kg = NEW MATERIAL (different unit)
        
        // SMART RESTOCK LOGIC: Prioritize restock orders marked with isRestock flag
        // For restock orders: Match by name + supplier (most important fields)
        // For new orders: Match by all fields (name, brand, category, supplier, quality, unit)
        let existingMaterial;
        
        if (deliveredOrder.isRestock) {
          // RESTOCK ORDER: More flexible matching - prioritize name and supplier
          existingMaterial = rawMaterials.find(material => 
            material.name === deliveredOrder.materialName &&
            material.supplier === deliveredOrder.supplier &&
            material.unit === deliveredOrder.unit
          );
          console.log('🔄 Restock order detected - using flexible matching');
        } else {
          // NEW ORDER: Strict matching - all fields must match
          existingMaterial = rawMaterials.find(material => 
            material.name === deliveredOrder.materialName &&
            material.brand === deliveredOrder.materialBrand &&
            material.category === deliveredOrder.materialCategory &&
            material.supplier === deliveredOrder.supplier &&
            material.qualityGrade === deliveredOrder.qualityGrade &&
            material.unit === deliveredOrder.unit
          );
          console.log('🆕 New order detected - using strict matching');
        }
        
        console.log('🔍 Searching for existing material with criteria:');
        console.log('  - Name:', deliveredOrder.materialName);
        console.log('  - Brand:', deliveredOrder.materialBrand);
        console.log('  - Category:', deliveredOrder.materialCategory);
        console.log('  - Supplier:', deliveredOrder.supplier);
        console.log('  - Quality Grade:', deliveredOrder.qualityGrade);
        console.log('  - Unit:', deliveredOrder.unit);
        console.log('  - Is Restock Order:', deliveredOrder.isRestock);
        console.log('🎯 Match found:', !!existingMaterial);
        if (existingMaterial) {
          console.log('✅ Existing material:', existingMaterial);
        }
      
      if (existingMaterial) {
        // This is an EXACT match - automatically treat as RESTOCK
        const newStock = existingMaterial.currentStock + deliveredOrder.quantity;
        const updatedMaterial = {
          ...existingMaterial,
          currentStock: newStock,
          lastRestocked: new Date().toISOString().split('T')[0],
          status: newStock === 0 ? 'out-of-stock' : 
                  newStock <= existingMaterial.minThreshold ? 'low-stock' : 'in-stock',
          // Update cost per unit if it's different (allow price changes)
          costPerUnit: deliveredOrder.costPerUnit,
          totalValue: newStock * deliveredOrder.costPerUnit
        };
        rawMaterialsStorage.update(existingMaterial.id, updatedMaterial);
        
        console.log(`Restocked existing ${deliveredOrder.materialName} from ${existingMaterial.currentStock} to ${newStock}`);
        
        // Auto-detect action type: If fields match exactly, it's a restock
        const isAutoRestock = true; // Since we found an exact match
        const actionType = deliveredOrder.isRestock ? 'restock_completed' : 'stock_updated';
        const title = deliveredOrder.isRestock ? "✅ Stock Restocked Successfully!" : "✅ Stock Updated Successfully!";
        
        toast({
          title: title,
          description: `${deliveredOrder.materialName} (${deliveredOrder.supplier}): ${existingMaterial.currentStock} + ${deliveredOrder.quantity} = ${newStock} ${deliveredOrder.unit}`,
          variant: "default",
        });
        
        // Store stock update info for Materials page notification
        localStorage.setItem('last_stock_update', JSON.stringify({
          materialName: deliveredOrder.materialName,
          oldStock: existingMaterial.currentStock,
          newStock: newStock,
          quantity: deliveredOrder.quantity,
          unit: deliveredOrder.unit,
          timestamp: Date.now(),
          action: actionType
        }));
      } else {
        // This is a NEW material (different name, brand, supplier, quality, price, etc.)
        // Even if name is same, if ANY field is different, it's treated as NEW
        const newMaterial = {
          id: Date.now().toString(),
          name: deliveredOrder.materialName,
          brand: deliveredOrder.materialBrand || "Unknown",
          category: deliveredOrder.materialCategory || "Other",
          batchNumber: deliveredOrder.materialBatchNumber || `BATCH-${Date.now()}`,
          currentStock: deliveredOrder.quantity,
          unit: deliveredOrder.unit,
          minThreshold: deliveredOrder.minThreshold || 100,
          maxCapacity: deliveredOrder.maxCapacity || 1000,
          supplier: deliveredOrder.supplier,
          costPerUnit: deliveredOrder.costPerUnit,
          qualityGrade: deliveredOrder.qualityGrade || "A",
          expiryDate: "",
          imageUrl: "",
          lastRestocked: new Date().toISOString().split('T')[0],
          status: 'in-stock',
          totalValue: deliveredOrder.quantity * deliveredOrder.costPerUnit
        };
        
        rawMaterialsStorage.add(newMaterial);
        
        console.log(`Added NEW material ${deliveredOrder.materialName} from ${deliveredOrder.supplier} to inventory (different specifications)`);
        
        toast({
          title: "🆕 New Material Added to Inventory!",
          description: `${deliveredOrder.materialName} (${deliveredOrder.supplier}) has been added as a NEW material with ${deliveredOrder.quantity} ${deliveredOrder.unit}`,
          variant: "default",
        });
        
        // Store stock update info for Materials page notification
        localStorage.setItem('last_stock_update', JSON.stringify({
          materialName: deliveredOrder.materialName,
          oldStock: 0,
          newStock: deliveredOrder.quantity,
          quantity: deliveredOrder.quantity,
          unit: deliveredOrder.unit,
          supplier: deliveredOrder.supplier,
          timestamp: Date.now(),
          action: 'new_material_added'
        }));
      }
    } catch (error) {
      console.error('Error updating raw material stock:', error);
      toast({
        title: "❌ Error Updating Stock",
        description: "There was an error updating the stock. Please check console for details.",
        variant: "destructive",
        });
    }
  };

  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.totalCost, 0);
  const pendingOrders = orders.filter(order => order.status === "ordered" || order.status === "in-transit").length;
  const deliveredOrders = orders.filter(order => order.status === "delivered").length;

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Manage Stock" 
        subtitle="Track raw material orders, quantities, and delivery status"
      />



      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
            </div>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Total Value</span>
            </div>
            <div className="text-2xl font-bold">₹{(totalValue / 100000).toFixed(1)}L</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Pending</span>
            </div>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Delivered</span>
            </div>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search materials or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <History className="w-4 h-4" />
              <span>Orders from Materials page only</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Material Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              
              return (
                <div key={order.id} className="p-6 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{order.materialName}</h3>
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {order.supplier}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Ordered: {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">₹{(order.totalCost / 1000).toFixed(1)}K</div>
                      <div className="text-sm text-muted-foreground">
                        {order.quantity} {order.unit} × ₹{order.costPerUnit}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <div className="font-medium">{order.quantity} {order.unit}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected Delivery:</span>
                      <div className="font-medium">{new Date(order.expectedDelivery).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="font-medium">{status.label}</div>
                    </div>
                    {order.actualDelivery && (
                      <div>
                        <span className="text-muted-foreground">Delivered:</span>
                        <div className="font-medium">{new Date(order.actualDelivery).toLocaleDateString()}</div>
                      </div>
                    )}
                  </div>
                  
                  {order.notes && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    {order.status === "ordered" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, "in-transit")}
                      >
                        Mark In Transit
                      </Button>
                    )}
                    {order.status === "in-transit" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, "delivered")}
                      >
                        Mark Delivered
                      </Button>
                    )}
                    {(order.status === "ordered" || order.status === "in-transit") && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateOrderStatus(order.id, "cancelled")}
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders found matching your criteria</p>
                <p className="text-sm mt-2">Orders are created from the Materials page</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details: {selectedOrder?.materialName}
            </DialogTitle>
            <DialogDescription>
              Complete information about this material order
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Material Name</Label>
                      <p className="text-xl font-bold">{selectedOrder.materialName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                      <p className="font-mono text-sm">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Order Date</Label>
                      <p className="font-medium">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Order Status</Label>
                      <Badge className={statusConfig[selectedOrder.status]?.color || "bg-gray-100 text-gray-800"}>
                        {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Material Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Material Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Quantity</Label>
                      <p className="text-xl font-bold text-blue-600">{selectedOrder.quantity} {selectedOrder.unit}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Cost per Unit</Label>
                      <p className="text-xl font-bold text-green-600">₹{selectedOrder.costPerUnit.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Total Cost</Label>
                      <p className="text-2xl font-bold text-primary">₹{selectedOrder.totalCost.toLocaleString()}</p>
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
                      <p className="font-medium">{selectedOrder.supplier}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Expected Delivery</Label>
                      <p className="font-medium">
                        {selectedOrder.expectedDelivery ? 
                          new Date(selectedOrder.expectedDelivery).toLocaleDateString() : 
                          "Not specified"
                        }
                      </p>
                    </div>
                    {selectedOrder.actualDelivery && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Actual Delivery Date</Label>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{new Date(selectedOrder.actualDelivery).toLocaleDateString()}</p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const newDate = prompt("Enter new delivery date (YYYY-MM-DD):", selectedOrder.actualDelivery);
                              if (newDate && newDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                const updatedOrder = { ...selectedOrder, actualDelivery: newDate };
                                setSelectedOrder(updatedOrder);
                                updateOrderStatus(selectedOrder.id, selectedOrder.status);
                                setIsDetailsDialogOpen(false);
                              }
                            }}
                          >
                            Edit Date
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
