import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  status: "pending" | "confirmed" | "ready-to-ship" | "completed" | "cancelled";
  notes: string;

}



// Sample data
const sampleCustomers: Customer[] = [
  {
    id: "CUST001",
    name: "Sharma Enterprises",
    email: "sharma@enterprises.com",
    phone: "+91-9876543210",
    address: "123 Business Park, Mumbai, Maharashtra",
    company: "Sharma Enterprises",
    taxId: "GST123456789",
    creditLimit: 500000,
    outstandingAmount: 75000,
    status: "active",
    orderHistory: []
  },
  {
    id: "CUST002",
    name: "Royal Interiors",
    email: "info@royalinteriors.com",
    phone: "+91-9876543211",
    address: "456 Luxury Lane, Delhi, NCR",
    company: "Royal Interiors Ltd",
    taxId: "GST987654321",
    creditLimit: 1000000,
    outstandingAmount: 0,
    status: "active",
    orderHistory: []
  }
];

const sampleProducts: Product[] = [
  {
    id: "PROD001",
    name: "Traditional Persian Carpet",
    category: "Handmade",
    color: "Red & Gold",
    size: "8x10 feet",
    pattern: "Persian Medallion",
    quantity: 5,
    sellingPrice: 25000,
    status: "in-stock",
    individualProducts: [
      {
        id: "IND001",
        qrCode: "QR-CARPET-001-001",
        productId: "PROD001",
        manufacturingDate: "2024-01-15",
        finalDimensions: "8x10 feet",
        finalWeight: "45 kg",
        finalThickness: "2.5 cm",
        finalPileHeight: "1.2 cm",
        qualityGrade: "A+",
        inspector: "John Smith",
        status: "available",
        batchNumber: "BATCH-2024-001"
      },
      {
        id: "IND002",
        qrCode: "QR-CARPET-001-002",
        productId: "PROD001",
        manufacturingDate: "2024-01-15",
        finalDimensions: "8x10 feet",
        finalWeight: "44 kg",
        finalThickness: "2.4 cm",
        finalPileHeight: "1.1 cm",
        qualityGrade: "A",
        inspector: "John Smith",
        status: "available",
        batchNumber: "BATCH-2024-001"
      }
    ]
  }
];

const sampleOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customerId: "CUST001",
    customerName: "Sharma Enterprises",
    customerEmail: "sharma@enterprises.com",
    customerPhone: "+91-9876543210",
    orderDate: "2024-01-15",
    expectedDelivery: "2024-01-25",
    items: [
      {
        productId: "PROD001",
        productName: "Traditional Persian Carpet",
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000,
        selectedProducts: [],
        qualityGrade: "A+"
      }
    ],
    subtotal: 50000,
    gstRate: 18,
    gstAmount: 9000,
    discountAmount: 0,
    totalAmount: 59000,
    paidAmount: 35000,
    outstandingAmount: 24000,
    paymentMethod: "credit",
    paymentTerms: "30 days",
    dueDate: "2024-02-14",
    status: "confirmed",
    notes: "Premium quality required"
  }
];

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  "in-production": "bg-orange-100 text-orange-800 border-orange-200",
  "ready-to-ship": "bg-green-100 text-green-800 border-green-200",
  completed: "bg-green-100 text-green-800 border-green-200",
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
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesCustomer = customerFilter === "all" || order.customerId === customerFilter;
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  // Enhanced Order Card Component
  const OrderCard = ({ order }: { order: Order }) => {
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
          order.status === "completed" ? "bg-green-500" :
          order.status === "ready-to-ship" ? "bg-green-500" :
          order.status === "in-production" ? "bg-orange-500" :
          order.status === "confirmed" ? "bg-blue-500" :
          order.status === "cancelled" ? "bg-red-500" :
          "bg-yellow-500"
        }`} />
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                {order.orderNumber}
              </h3>
              <p className="text-sm text-muted-foreground">{order.customerName}</p>
            </div>
            <Badge className={`${statusStyles[order.status]} shadow-sm`}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{order.status}</span>
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Order Date:</span>
                <div className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Expected Delivery:</span>
                <div className="font-medium">{new Date(order.expectedDelivery).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Items:</span>
                <div className="font-medium">{order.items.length} products</div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <div className="font-medium">₹{order.totalAmount.toLocaleString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Paid:</span>
                <div className="font-medium text-green-600">₹{order.paidAmount.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Outstanding:</span>
                <div className="font-medium text-red-600">₹{order.outstandingAmount.toLocaleString()}</div>
              </div>
            </div>

            {order.productionRequests && order.productionRequests.length > 0 && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 font-medium">
                  <Factory className="w-4 h-4" />
                  <span>Production in Progress</span>
                </div>
                <p className="text-orange-600 text-sm mt-1">
                  {order.productionRequests.length} product(s) being manufactured
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1" 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/orders/${order.id}`);
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
                  navigate('/orders/edit-order', { state: { order } });
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