import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getFromStorage, fixNestedArray, saveToStorage } from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Search, Filter, Eye, Edit, MoreHorizontal, Users, Package, 
  ShoppingCart, Calendar, TrendingUp, AlertTriangle, CheckCircle,
  Clock, Factory, Truck, DollarSign, UserPlus, QrCode, Star,
  ArrowRight, ArrowLeft, RefreshCw, Settings, Bell, Target
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  taxId?: string;
  creditLimit: number;
  outstandingAmount: number;
  status: "active" | "suspended" | "new";
  orderHistory: Order[];
}

interface IndividualProduct {
  id: string;
  qrCode: string;
  productId: string;
  manufacturingDate: string;
  finalDimensions: string;
  finalWeight: string;
  finalThickness: string;
  finalPileHeight: string;
  qualityGrade: "A+" | "A" | "B" | "C";
  inspector: string;
  status: "available" | "sold" | "damaged";
  batchNumber?: string;
  soldDate?: string;
  customerId?: string;
  orderId?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  color: string;
  size: string;
  pattern: string;
  quantity: number;
  sellingPrice: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  individualProducts: IndividualProduct[];
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedProducts: IndividualProduct[];
  qualityGrade: string;
  specifications?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  expectedDelivery: string;
  items: OrderItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentMethod: "cash" | "card" | "bank-transfer" | "credit";
  paymentTerms: string;
  dueDate?: string;
  status: "pending" | "accepted" | "dispatched" | "delivered" | "cancelled";
  workflowStep: "accept" | "dispatch" | "delivered";
  acceptedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  notes: string;

}



// No hardcoded data - all data is now loaded from localStorage

// No hardcoded orders - all orders are now loaded from localStorage

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted: "bg-blue-100 text-blue-800 border-blue-200",
  dispatched: "bg-orange-100 text-orange-800 border-orange-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200"
};

const qualityStyles = {
  "A+": "bg-purple-100 text-purple-800 border-purple-200",
  "A": "bg-green-100 text-green-800 border-green-200",
  "B": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "C": "bg-red-100 text-red-800 border-red-200"
};

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Load data from localStorage
  useEffect(() => {
    const storedOrders = getFromStorage('rajdhani_orders') || [];
    const storedCustomers = getFromStorage('rajdhani_customers') || [];
    const storedProducts = getFromStorage('rajdhani_products') || [];
    
    // Fix nested array issue for orders
    const flatOrders = fixNestedArray(storedOrders);
    if (flatOrders !== storedOrders) {
      console.log('🔧 Fixed nested orders array, flattened from', storedOrders.length, 'to', flatOrders.length);
      // Save the flattened array back to localStorage
      localStorage.setItem('rajdhani_orders', JSON.stringify(flatOrders));
    }
    
    setOrders(flatOrders);
    setCustomers(storedCustomers);
    setProducts(storedProducts);
    
    console.log('📦 Loaded data from storage:');
    console.log('  - Orders:', flatOrders.length);
    console.log('  - Customers:', storedCustomers.length);
    console.log('  - Products:', storedProducts.length);
    console.log('📋 Orders data:', flatOrders);
  }, []);

  // Handle order dispatch - deduct stock and mark as dispatched
  const handleDispatchOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Deduct stock from products
    const updatedProducts = products.map(product => {
      const orderedItem = order.items.find(item => item.productId === product.id);
      if (orderedItem) {
        const newQuantity = product.quantity - orderedItem.quantity;
        return {
          ...product,
          quantity: Math.max(0, newQuantity),
          status: newQuantity <= 0 ? 'out-of-stock' as const : 
                 newQuantity <= 5 ? 'low-stock' as const : 'in-stock' as const
        };
      }
      return product;
    });

    // Update individual products status
    const updatedIndividualProducts = getFromStorage('rajdhani_individual_products') || [];
    const updatedIndProducts = updatedIndividualProducts.map(indProduct => {
      const selectedInOrder = order.items.some(item => 
        item.selectedProducts && item.selectedProducts.some(selected => selected.id === indProduct.id)
      );
      if (selectedInOrder) {
        return {
          ...indProduct,
          status: "sold",
          soldDate: new Date().toISOString().split('T')[0],
          customerId: order.customerId,
          orderId: order.id
        };
      }
      return indProduct;
    });

    // Update order status
    const updatedOrders = orders.map(o => 
      o.id === orderId 
        ? { 
            ...o, 
            status: 'dispatched' as const, 
            workflowStep: 'dispatch' as const,
            dispatchedAt: new Date().toISOString()
          }
        : o
    );

    // Save to localStorage
    saveToStorage('rajdhani_orders', updatedOrders);
    saveToStorage('rajdhani_products', updatedProducts);
    saveToStorage('rajdhani_individual_products', updatedIndProducts);

    // Update local state
    setOrders(updatedOrders);
    setProducts(updatedProducts);

    toast({
      title: "✅ Order Dispatched",
      description: "Stock has been deducted and order is ready for delivery.",
    });
  };

  // Handle order delivery - mark as delivered
  const handleDeliverOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Check if full payment is collected
    if (order.outstandingAmount > 0) {
      toast({
        title: "❌ Payment Required",
        description: `Full payment must be collected before delivery. Outstanding: ₹${order.outstandingAmount.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    const updatedOrders = orders.map(o => 
      o.id === orderId 
        ? { 
            ...o, 
            status: 'delivered' as const, 
            workflowStep: 'delivered' as const,
            deliveredAt: new Date().toISOString()
          }
        : o
    );

    // Save to localStorage
    saveToStorage('rajdhani_orders', updatedOrders);

    // Update local state
    setOrders(updatedOrders);

    toast({
      title: "🎉 Order Delivered",
      description: "Order has been successfully delivered to the customer.",
    });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    
    const matchesSearch = (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesCustomer = customerFilter === "all" || order.customerId === customerFilter;
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  // Enhanced Order Card Component
  const OrderCard = ({ order }: { order: Order }) => {
    if (!order) return null;
    
    const getStatusIcon = (status: string) => {
      switch (status) {
        case "pending": return <Clock className="w-4 h-4" />;
        case "confirmed": return <CheckCircle className="w-4 h-4" />;
        case "in-production": return <Factory className="w-4 h-4" />;
        case "ready-to-ship": return <Truck className="w-4 h-4" />;
        case "completed": return <CheckCircle className="w-4 h-4" />;
        case "cancelled": return <AlertTriangle className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
      }
    };

    return (
      <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200">
        {/* Status Indicator Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          order.status === "delivered" ? "bg-green-500" :
          order.status === "dispatched" ? "bg-orange-500" :
          order.status === "accepted" ? "bg-blue-500" :
          order.status === "cancelled" ? "bg-red-500" :
          "bg-yellow-500"
        }`} />
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                {order.orderNumber || 'N/A'}
              </h3>
              <p className="text-sm text-muted-foreground">{order.customerName || 'N/A'}</p>
            </div>
            <Badge className={`${statusStyles[order.status] || statusStyles.pending} shadow-sm`}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{order.status || 'pending'}</span>
            </Badge>
          </div>

          {/* Workflow Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Order Progress</span>
              <span>{order.workflowStep || 'accept'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    order.status === 'delivered' ? 'bg-green-500' :
                    order.status === 'dispatched' ? 'bg-orange-500' :
                    order.status === 'accepted' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}
                  style={{
                    width: order.status === 'delivered' ? '100%' :
                           order.status === 'dispatched' ? '66%' :
                           order.status === 'accepted' ? '33%' : '0%'
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span className={order.status === 'accepted' ? 'text-blue-600 font-medium' : ''}>Accept</span>
              <span className={order.status === 'dispatched' ? 'text-orange-600 font-medium' : ''}>Dispatch</span>
              <span className={order.status === 'delivered' ? 'text-green-600 font-medium' : ''}>Delivered</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Order Date:</span>
                <div className="font-medium">
                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Expected Delivery:</span>
                <div className="font-medium">
                  {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Items:</span>
                <div className="font-medium">{order.items?.length || 0} products</div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <div className="font-medium">₹{(order.totalAmount || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Paid:</span>
                <div className="font-medium text-green-600">₹{(order.paidAmount || 0).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Outstanding:</span>
                <div className="font-medium text-red-600">₹{(order.outstandingAmount || 0).toLocaleString()}</div>
              </div>
            </div>

            {order.status === "accepted" && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Order Accepted</span>
                </div>
                <p className="text-blue-600 text-sm mt-1">
                  Order is ready for dispatch when stock is available
                </p>
              </div>
            )}

            {/* Workflow Action Buttons */}
            {order.status === 'accepted' && (
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Order Accepted - Ready to Dispatch</span>
                </div>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDispatchOrder(order.id);
                  }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Dispatch Order
                </Button>
              </div>
            )}

            {order.status === 'dispatched' && (
              <div className="bg-orange-50 p-3 rounded-lg mb-3">
                <div className="flex items-center gap-2 text-orange-700 font-medium mb-2">
                  <Package className="w-4 h-4" />
                  <span>Order Dispatched - Ready to Deliver</span>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeliverOrder(order.id);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Delivered
                </Button>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1" 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (order.id) {
                    navigate(`/orders/${order.id}`);
                  }
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (order.id) {
                    navigate('/orders/edit-order', { state: { order } });
                  }
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Order Management" 
        subtitle="Manage customer orders, track production, and handle payments"
      />

      {/* Enhanced Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search orders by number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
          </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-production">In Production</SelectItem>
                <SelectItem value="ready-to-ship">Ready to Ship</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Refresh orders
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
          </Button>

            <Button onClick={() => setIsNewOrderOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>
        </div>
      </Card>

      {/* Enhanced Order Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <ShoppingCart className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-3">No Orders Found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || statusFilter !== "all" || customerFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Get started by creating your first order"}
          </p>
          <Button onClick={() => setIsNewOrderOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </Card>
      )}

      {/* New Order Dialog - This will be implemented in a separate component */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Order
            </DialogTitle>
            <DialogDescription>
              Create a new customer order with product selection and quality control.
            </DialogDescription>
          </DialogHeader>

          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Order Creation</h3>
            <p className="text-muted-foreground mb-6">
              Create new customer orders and manage order details
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsNewOrderOpen(false);
              navigate('/orders/new');
            }}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Order Creation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
    </div>
  );
}