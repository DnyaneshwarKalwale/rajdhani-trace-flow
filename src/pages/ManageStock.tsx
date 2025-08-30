import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useLocation } from "react-router-dom";

interface StockOrder {
  id: string;
  materialName: string;
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
}

const initialOrders: StockOrder[] = [
  {
    id: "1",
    materialName: "Cotton Yarn (Premium)",
    supplier: "ABC Textiles Ltd.",
    quantity: 500,
    unit: "rolls",
    costPerUnit: 1200,
    totalCost: 600000,
    orderDate: "2024-01-15",
    expectedDelivery: "2024-01-25",
    status: "delivered",
    notes: "High-quality yarn for premium carpets",
    actualDelivery: "2024-01-23"
  },
  {
    id: "2",
    materialName: "Red Dye (Industrial)",
    supplier: "ColorChem Industries",
    quantity: 200,
    unit: "liters",
    costPerUnit: 850,
    totalCost: 170000,
    orderDate: "2024-01-20",
    expectedDelivery: "2024-01-30",
    status: "in-transit",
    notes: "Fast-drying industrial dye"
  },
  {
    id: "3",
    materialName: "Latex Solution",
    supplier: "RubberCorp Solutions",
    quantity: 150,
    unit: "liters",
    costPerUnit: 1200,
    totalCost: 180000,
    orderDate: "2024-01-18",
    expectedDelivery: "2024-01-28",
    status: "ordered",
    notes: "High-adhesion latex for carpet backing"
  },
  {
    id: "4",
    materialName: "Backing Cloth",
    supplier: "FabricWorld Ltd.",
    quantity: 1000,
    unit: "sqm",
    costPerUnit: 45,
    totalCost: 45000,
    orderDate: "2024-01-22",
    expectedDelivery: "2024-02-01",
    status: "ordered",
    notes: "Durable backing material"
  }
];

const statusConfig = {
  "ordered": { label: "Ordered", icon: Clock, color: "bg-blue-100 text-blue-800" },
  "in-transit": { label: "In Transit", icon: Truck, color: "bg-yellow-100 text-yellow-800" },
  "delivered": { label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  "cancelled": { label: "Cancelled", icon: AlertTriangle, color: "bg-red-100 text-red-800" }
};

export default function ManageStock() {
  const location = useLocation();
  const [orders, setOrders] = useState<StockOrder[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Handle pre-filled order data from Materials page
  useEffect(() => {
    if (location.state?.prefillOrder) {
      const prefillData = location.state.prefillOrder;
      const newOrder: StockOrder = {
        id: Date.now().toString(),
        materialName: prefillData.materialName,
        supplier: prefillData.supplier,
        quantity: parseInt(prefillData.quantity),
        unit: prefillData.unit,
        costPerUnit: parseFloat(prefillData.costPerUnit),
        totalCost: parseInt(prefillData.quantity) * parseFloat(prefillData.costPerUnit),
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: prefillData.expectedDelivery,
        status: "ordered",
        notes: prefillData.notes
      };

      setOrders([newOrder, ...orders]);
      
      // Clear the state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: StockOrder["status"]) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            actualDelivery: newStatus === "delivered" ? new Date().toISOString().split('T')[0] : order.actualDelivery
          }
        : order
    ));
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
                    <Button size="sm" variant="secondary">
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
    </div>
  );
}
