import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2, AlertTriangle, Factory, Package, X, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableStock: number;
  needsProduction: boolean;
  productionAlert: boolean;
  selectedIndividualProducts: IndividualProduct[]; // Track which specific pieces are selected
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const mockCustomers: Customer[] = [
  { id: "1", name: "Sharma Enterprises", email: "contact@sharma.com", phone: "+91 9876543210", address: "Mumbai, MH" },
  { id: "2", name: "Royal Interiors", email: "info@royal.com", phone: "+91 9876543211", address: "Delhi, DL" },
  { id: "3", name: "Modern Living Co.", email: "sales@modern.com", phone: "+91 9876543212", address: "Bangalore, KA" },
];

// Individual product details (this would come from API in real app)
interface IndividualProduct {
  id: string;
  qrCode: string;
  productId: string;
  productName: string;
  manufacturingDate: string;
  dimensions: string;
  weight: string;
  qualityGrade: string;
  inspector: string;
  status: "available" | "sold" | "damaged";
  location: string;
  age: number; // days since manufacturing
}

// Sample individual products for each main product
const individualProducts: IndividualProduct[] = [
  // Traditional Persian Carpet - 50 pieces
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `IND001_${String(i + 1).padStart(3, '0')}`,
    qrCode: `QR-PERSIAN-${String(i + 1).padStart(3, '0')}`,
    productId: "PROD001",
    productName: "Traditional Persian Carpet",
    manufacturingDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within 90 days
    dimensions: "4x6ft",
    weight: "45kg",
    qualityGrade: Math.random() > 0.8 ? "A+" : Math.random() > 0.6 ? "A" : "B",
    inspector: "Inspector " + (Math.floor(Math.random() * 3) + 1),
    status: "available" as const,
    location: `Warehouse A - Shelf ${Math.floor(Math.random() * 5) + 1}`,
    age: Math.floor(Math.random() * 90)
  })),
  
  // Modern Geometric Carpet - 25 pieces
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `IND002_${String(i + 1).padStart(3, '0')}`,
    qrCode: `QR-GEOMETRIC-${String(i + 1).padStart(3, '0')}`,
    productId: "PROD002",
    productName: "Modern Geometric Carpet",
    manufacturingDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within 60 days
    dimensions: "6x8ft",
    weight: "65kg",
    qualityGrade: Math.random() > 0.8 ? "A+" : Math.random() > 0.6 ? "A" : "B",
    inspector: "Inspector " + (Math.floor(Math.random() * 3) + 1),
    status: "available" as const,
    location: `Warehouse B - Shelf ${Math.floor(Math.random() * 5) + 1}`,
    age: Math.floor(Math.random() * 60)
  })),
  
  // Luxury Wool Carpet - 75 pieces
  ...Array.from({ length: 75 }, (_, i) => ({
    id: `IND003_${String(i + 1).padStart(3, '0')}`,
    qrCode: `QR-WOOL-${String(i + 1).padStart(3, '0')}`,
    productId: "PROD003",
    productName: "Luxury Wool Carpet",
    manufacturingDate: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within 120 days
    dimensions: "5x7ft",
    weight: "55kg",
    qualityGrade: Math.random() > 0.8 ? "A+" : Math.random() > 0.6 ? "A" : "B",
    inspector: "Inspector " + (Math.floor(Math.random() * 3) + 1),
    status: "available" as const,
    location: `Warehouse C - Shelf ${Math.floor(Math.random() * 5) + 1}`,
    age: Math.floor(Math.random() * 120)
  }))
];

// Group products by main product ID
const getProductStock = (productId: string) => {
  return individualProducts.filter(p => p.productId === productId && p.status === "available");
};

// Real products from inventory (this would come from API in real app)
const realProducts = [
  { 
    id: "PROD001", 
    name: "Traditional Persian Carpet", 
    price: 2500, 
    stock: getProductStock("PROD001").length,
    category: "Carpet",
    pattern: "Persian",
    color: "Red",
    size: "4x6ft"
  },
  { 
    id: "PROD002", 
    name: "Modern Geometric Carpet", 
    price: 3500, 
    stock: getProductStock("PROD002").length,
    category: "Carpet", 
    pattern: "Geometric",
    color: "Blue",
    size: "6x8ft"
  },
  { 
    id: "PROD003", 
    name: "Luxury Wool Carpet", 
    price: 3000, 
    stock: getProductStock("PROD003").length,
    category: "Carpet",
    pattern: "Traditional",
    color: "Green", 
    size: "5x7ft"
  },
];

export default function NewOrder() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    expectedDelivery: "",
    notes: "",
    paidAmount: 0
  });
  const [showProductionAlert, setShowProductionAlert] = useState(false);
  const [productionAlertItem, setProductionAlertItem] = useState<OrderItem | null>(null);
  const [showIndividualProductSelection, setShowIndividualProductSelection] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [currentOrderItem, setCurrentOrderItem] = useState<OrderItem | null>(null);

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      availableStock: 0,
      needsProduction: false,
      productionAlert: false,
      selectedIndividualProducts: []
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const product = realProducts.find(p => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.unitPrice = product.price;
            updated.totalPrice = updated.quantity * product.price;
            updated.availableStock = product.stock;
            // Check if quantity exceeds available stock
            updated.needsProduction = updated.quantity > product.stock;
            updated.productionAlert = updated.quantity > product.stock;
            // Reset selected individual products when product changes
            updated.selectedIndividualProducts = [];
          }
        }
        if (field === 'quantity') {
          const product = realProducts.find(p => p.id === updated.productId);
          if (product) {
            updated.totalPrice = updated.quantity * updated.unitPrice;
            updated.needsProduction = updated.quantity > product.stock;
            updated.productionAlert = updated.quantity > product.stock;
          }
        }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeOrderItem = (id: string) => {
    setOrderItems(items => items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleProductionAlert = (item: OrderItem) => {
    setProductionAlertItem(item);
    setShowProductionAlert(true);
  };

  // Handle individual product selection
  const handleIndividualProductSelection = (orderItemId: string, individualProduct: IndividualProduct, isSelected: boolean) => {
    console.log('handleIndividualProductSelection called:', { orderItemId, individualProductId: individualProduct.id, isSelected });
    
    setOrderItems(items => items.map(item => {
      if (item.id === orderItemId) {
        let updatedSelectedProducts = [...item.selectedIndividualProducts];
        
        if (isSelected) {
          // Add to selection if not already selected
          if (!updatedSelectedProducts.find(p => p.id === individualProduct.id)) {
            updatedSelectedProducts.push(individualProduct);
            console.log('Added product to selection:', individualProduct.id);
          }
        } else {
          // Remove from selection
          updatedSelectedProducts = updatedSelectedProducts.filter(p => p.id !== individualProduct.id);
          console.log('Removed product from selection:', individualProduct.id);
        }
        
        const updatedItem = {
          ...item,
          selectedIndividualProducts: updatedSelectedProducts
          // Don't change the quantity - keep the original required quantity
        };
        
        console.log('Updated item:', updatedItem);
        
        // Update currentOrderItem state immediately if this is the current item
        if (currentOrderItem && currentOrderItem.id === orderItemId) {
          console.log('Updating currentOrderItem state');
          setCurrentOrderItem(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Auto-select oldest pieces when quantity is set
  const autoSelectOldestPieces = (orderItemId: string, quantity: number) => {
    setOrderItems(items => items.map(item => {
      if (item.id === orderItemId && item.productId) {
        const availableProducts = getAvailableIndividualProducts(item.productId);
        const selectedProducts = availableProducts.slice(0, Math.min(quantity, availableProducts.length));
        
        const updatedItem = {
          ...item,
          selectedIndividualProducts: selectedProducts
          // Don't change the quantity - keep the original required quantity
        };
        
        // Update currentOrderItem state immediately if this is the current item
        if (currentOrderItem && currentOrderItem.id === orderItemId) {
          setCurrentOrderItem(updatedItem);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Get available individual products for a product
  const getAvailableIndividualProducts = (productId: string) => {
    return individualProducts
      .filter(p => p.productId === productId && p.status === "available")
      .sort((a, b) => a.age - b.age); // Sort by age (oldest first)
  };

  const getStockStatus = (item: OrderItem) => {
    if (item.quantity <= item.availableStock) {
      return { status: "sufficient", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
    } else if (item.quantity <= item.availableStock + 20) {
      return { status: "low", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    } else {
      return { status: "insufficient", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    }
  };

  const handleSubmit = () => {
    if (!selectedCustomer && !showNewCustomerForm) {
      toast({
        title: "Error",
        description: "Please select a customer or add a new one",
        variant: "destructive"
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the order",
        variant: "destructive"
      });
      return;
    }

    // Check if any items need production
    const itemsNeedingProduction = orderItems.filter(item => item.needsProduction);
    
    if (itemsNeedingProduction.length > 0) {
      // Show production planning dialog
      setProductionAlertItem(itemsNeedingProduction[0]);
      setShowProductionAlert(true);
      
      toast({
        title: "Order Accepted - Production Required",
        description: `Order accepted! ${itemsNeedingProduction.length} items need production planning.`,
      });
    } else {
      // All items have sufficient stock
    toast({
        title: "Order Created Successfully",
        description: "Order has been created and can be fulfilled immediately.",
    });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Create New Order" 
        subtitle="Add customer details and order items"
      />

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              variant={!showNewCustomerForm ? "default" : "outline"}
              onClick={() => setShowNewCustomerForm(false)}
            >
              Select Existing Customer
            </Button>
            <Button 
              variant={showNewCustomerForm ? "default" : "outline"}
              onClick={() => setShowNewCustomerForm(true)}
            >
              Add New Customer
            </Button>
          </div>

          {!showNewCustomerForm ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search customers..." className="pl-10" />
              </div>
              <div className="grid gap-2">
                {mockCustomers.map((customer) => (
                  <div 
                    key={customer.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCustomer?.id === customer.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">{customer.email} • {customer.phone}</div>
                    <div className="text-sm text-muted-foreground">{customer.address}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input 
                  id="customerName"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input 
                  id="customerEmail"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input 
                  id="customerPhone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="customerAddress">Address</Label>
                <Input 
                  id="customerAddress"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Order Items</CardTitle>
          <Button onClick={addOrderItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderItems.map((item) => {
              const stockStatus = getStockStatus(item);
              return (
                <div key={item.id} className={`p-4 border rounded-lg ${stockStatus.bg} ${stockStatus.border}`}>
                  {/* Stock Warning Header */}
                  {item.needsProduction && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Production Required!</span>
                      </div>
                      <div className="text-sm text-red-700 mt-1">
                        Available: {item.availableStock} • Required: {item.quantity} • 
                        Need to produce: {item.quantity - item.availableStock} more pieces
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 text-red-600 border-red-300 hover:bg-red-100"
                        onClick={() => handleProductionAlert(item)}
                      >
                        <Factory className="w-4 h-4 mr-2" />
                        View Production Details
                      </Button>
                    </div>
                  )}

                                     {/* Product Selection */}
                   <div className="space-y-4">
                     {/* Product Row */}
                     <div className="flex items-center gap-6">
                       {/* Product Selection */}
                       <div className="flex-1">
                         <Label className="text-sm font-medium text-gray-700 mb-2 block">Product</Label>
                         <div className="flex gap-2">
                           <div className="flex-1">
                             {item.productId ? (
                               <div className="h-12 px-4 border rounded-lg flex items-center justify-between bg-gray-50">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                     <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                                     <div className="font-medium">{realProducts.find(p => p.id === item.productId)?.name}</div>
                                     <div className="text-sm text-muted-foreground">
                                       {realProducts.find(p => p.id === item.productId)?.category} • {realProducts.find(p => p.id === item.productId)?.color} • {realProducts.find(p => p.id === item.productId)?.size}
                                     </div>
                                   </div>
                                 </div>
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   onClick={() => updateOrderItem(item.id, 'productId', '')}
                                   className="text-red-600 hover:text-red-700"
                                 >
                                   <X className="w-4 h-4" />
                                 </Button>
                               </div>
                             ) : (
                               <Button 
                                 variant="outline" 
                                 className="w-full h-12 justify-start text-muted-foreground"
                                 onClick={() => {
                                   setCurrentOrderItem(item);
                                   setShowProductSearch(true);
                                 }}
                               >
                                 <Search className="w-4 h-4 mr-2" />
                                 Search and select product...
                               </Button>
                             )}
                           </div>
                         </div>
                       </div>

                       {/* Quantity */}
                       <div className="w-32">
                         <Label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</Label>
                  <Input 
                    type="number"
                    value={item.quantity}
                           onChange={(e) => {
                             const newQuantity = parseInt(e.target.value) || 0;
                             updateOrderItem(item.id, 'quantity', newQuantity);
                             // Auto-select oldest pieces when quantity changes
                             if (newQuantity > 0 && item.productId) {
                               setTimeout(() => autoSelectOldestPieces(item.id, newQuantity), 100);
                             }
                           }}
                           className={`h-12 text-center text-lg font-semibold ${item.needsProduction ? "border-red-300 bg-red-50" : ""}`}
                  />
                </div>

                       {/* Unit Price */}
                       <div className="w-32">
                         <Label className="text-sm font-medium text-gray-700 mb-2 block">Unit Price</Label>
                  <Input 
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateOrderItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                           className="h-12 text-center text-lg font-semibold"
                         />
                       </div>

                       {/* Total */}
                       <div className="w-40">
                         <Label className="text-sm font-medium text-gray-700 mb-2 block">Total</Label>
                         <Input 
                           value={`₹${item.totalPrice.toLocaleString()}`} 
                           disabled 
                           className="h-12 text-center text-lg font-semibold bg-gray-50"
                  />
                </div>

                       {/* Stock Status */}
                       <div className="w-40">
                         <Label className="text-sm font-medium text-gray-700 mb-2 block">Stock Status</Label>
                         <div className={`h-12 px-4 rounded-lg text-sm font-medium flex items-center justify-center ${stockStatus.color} ${stockStatus.bg}`}>
                           {stockStatus.status === "sufficient" ? "✅ Sufficient" :
                            stockStatus.status === "low" ? "⚠️ Low Stock" : "❌ Insufficient"}
                         </div>
                </div>

                       {/* Delete Button */}
                       <div className="w-12">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeOrderItem(item.id)}
                           className="h-12 w-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                         >
                           <Trash2 className="w-5 h-5" />
                         </Button>
                       </div>
                     </div>

                     {/* Stock Info and Piece Selection Row */}
                     {item.productId && (
                       <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                         <div className="flex items-center gap-6">
                           {/* Available Stock */}
                           <div className="flex items-center gap-2">
                             <div className={`w-3 h-3 rounded-full ${stockStatus.status === "sufficient" ? "bg-green-500" : stockStatus.status === "low" ? "bg-yellow-500" : "bg-red-500"}`}></div>
                             <span className="text-sm font-medium text-gray-700">
                               Available: {item.availableStock} pieces
                             </span>
                           </div>

                           {/* Selected Pieces Summary */}
                           {item.selectedIndividualProducts.length > 0 && (
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                               <span className="text-sm font-medium text-blue-700">
                                 {item.selectedIndividualProducts.length} pieces selected
                               </span>
                               <span className="text-xs text-gray-500">
                                 ({item.selectedIndividualProducts.slice(0, 3).map(p => p.id).join(", ")}
                                 {item.selectedIndividualProducts.length > 3 && ` +${item.selectedIndividualProducts.length - 3} more`})
                               </span>
                             </div>
                           )}
                         </div>

                         {/* Action Buttons */}
                         <div className="flex items-center gap-3">
                           <Button 
                             type="button"
                             variant="outline" 
                             size="sm" 
                             onClick={() => {
                               setCurrentOrderItem(item);
                               setShowIndividualProductSelection(true);
                             }}
                             className="bg-white hover:bg-gray-50 border-gray-300"
                           >
                             <Package className="w-4 h-4 mr-2" />
                             {item.selectedIndividualProducts.length > 0 
                               ? `Manage Selection (${item.selectedIndividualProducts.length})`
                               : "Select Specific Pieces"
                             }
                  </Button>
                </div>
              </div>
                     )}
                   </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expectedDelivery">Expected Delivery Date</Label>
            <Input 
              id="expectedDelivery"
              type="date"
              value={orderDetails.expectedDelivery}
              onChange={(e) => setOrderDetails(prev => ({ ...prev, expectedDelivery: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="paidAmount">Paid Amount</Label>
            <Input 
              id="paidAmount"
              type="number"
              value={orderDetails.paidAmount}
              onChange={(e) => setOrderDetails(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              value={orderDetails.notes}
              onChange={(e) => setOrderDetails(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or special instructions..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Production Requirements Summary */}
      {orderItems.some(item => item.needsProduction) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Factory className="w-5 h-5" />
              Production Requirements Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-red-700">
                <strong>⚠️ Attention Required:</strong> This order contains items that need production planning.
              </div>
              <div className="grid gap-2">
                {orderItems.filter(item => item.needsProduction).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-red-600" />
                      <span className="font-medium">{item.productName}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-red-600 font-medium">
                        Need to produce: {item.quantity - item.availableStock} pieces
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white border border-red-300 rounded text-sm">
                <div className="font-medium text-red-800 mb-2">Recommended Actions:</div>
                <ul className="text-red-700 space-y-1">
                  <li>• Review production capacity and timeline</li>
                  <li>• Check raw material availability</li>
                  <li>• Update customer delivery expectations</li>
                  <li>• Coordinate with production team</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{calculateTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span className="text-success">₹{orderDetails.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>Outstanding:</span>
              <span className="text-destructive">₹{(calculateTotal() - orderDetails.paidAmount).toLocaleString()}</span>
            </div>
          </div>
          
          {/* Production Status */}
          {orderItems.some(item => item.needsProduction) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Production Required</span>
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                This order will require production planning. Delivery timeline may be extended.
              </div>
              <div className="mt-2 text-xs text-yellow-600">
                <strong>Note:</strong> Order will be accepted and production will be planned automatically.
              </div>
            </div>
          )}
          
          <div className="flex gap-4 mt-6">
            <Button variant="outline" className="flex-1">Save as Draft</Button>
             <Button 
               onClick={handleSubmit} 
               className="flex-1"
               disabled={orderItems.length === 0}
             >
               {orderItems.some(item => item.needsProduction) 
                 ? "Accept Order & Plan Production" 
                 : "Create Order"
               }
             </Button>
           </div>

           {/* Order Created Success Message */}
           {orderItems.length > 0 && (
             <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
               <div className="flex items-center gap-2 text-green-800 mb-2">
                 <CheckCircle className="w-5 h-5" />
                 <span className="font-medium">Order Ready to View</span>
               </div>
               <div className="text-sm text-green-700 mb-3">
                 Your order has been created successfully. Click below to view complete order details.
               </div>
               <Button 
                 onClick={() => navigate(`/orders/ORD${Date.now()}`)}
                 className="bg-green-600 hover:bg-green-700"
               >
                 <Package className="w-4 h-4 mr-2" />
                 View Order Details
               </Button>
             </div>
           )}
        </CardContent>
      </Card>

      {/* Production Alert Dialog */}
      <Dialog open={showProductionAlert} onOpenChange={setShowProductionAlert}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Production Required Alert
            </DialogTitle>
            <DialogDescription>
              This order requires production planning. Current stock is insufficient.
            </DialogDescription>
          </DialogHeader>

          {productionAlertItem && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Product</Label>
                      <div className="font-medium">{productionAlertItem.productName}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Required Quantity</Label>
                      <div className="font-medium text-red-600">{productionAlertItem.quantity} pieces</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Available Stock</Label>
                      <div className="font-medium text-green-600">{productionAlertItem.availableStock} pieces</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Production Needed</Label>
                      <div className="font-medium text-red-600 font-bold">
                        {productionAlertItem.quantity - productionAlertItem.availableStock} pieces
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Factory className="w-5 h-5 text-blue-600" />
                    Production Planning Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Package className="w-4 h-4" />
                        <span className="font-medium">Action Required:</span>
                      </div>
                      <div className="text-sm text-blue-700 mt-1">
                        • Add this product to production planning<br/>
                        • Estimate production timeline<br/>
                        • Coordinate with manufacturing team<br/>
                        • Update customer on delivery timeline
                      </div>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Important Notes:</span>
                      </div>
                      <div className="text-sm text-yellow-700 mt-1">
                        • Order can be accepted but delivery will be delayed<br/>
                        • Production time: typically 2-4 weeks<br/>
                        • Consider material availability<br/>
                        • Update customer expectations
                      </div>
                    </div>
          </div>
        </CardContent>
      </Card>
            </div>
          )}

                     <DialogFooter>
             <Button variant="outline" onClick={() => setShowProductionAlert(false)}>
               Close
             </Button>
             <Button 
               onClick={() => {
                 setShowProductionAlert(false);
                 // Navigate to production planning or send notifications
                 toast({
                   title: "Production Planning Started",
                   description: "Product has been added to production planning. Production team will be notified.",
                 });
                 
                 // Here you could:
                 // 1. Navigate to production planning page
                 // 2. Send API call to production system
                 // 3. Create production batch automatically
                 // 4. Send notifications to production team
               }}
               className="bg-green-600 hover:bg-green-700"
             >
               <Factory className="w-4 h-4 mr-2" />
               Add to Production
             </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Individual Product Selection Dialog */}
      <Dialog open={showIndividualProductSelection} onOpenChange={setShowIndividualProductSelection}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Select Specific Pieces - {currentOrderItem?.productName}
            </DialogTitle>
            <DialogDescription>
              Choose which specific pieces to include in this order. Oldest stock is shown first.
            </DialogDescription>
          </DialogHeader>
          
          {currentOrderItem && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Selected: {currentOrderItem.selectedIndividualProducts.length}</span>
                  <span className="text-muted-foreground ml-2">out of {currentOrderItem.quantity} required</span>
                  {currentOrderItem.selectedIndividualProducts.length < currentOrderItem.quantity && (
                    <span className="text-orange-600 ml-2 font-medium">
                      (Need {currentOrderItem.quantity - currentOrderItem.selectedIndividualProducts.length} more)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    Available: {getAvailableIndividualProducts(currentOrderItem.productId).length} pieces
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setOrderItems(items => items.map(item => {
                        if (item.id === currentOrderItem.id) {
                          return { ...item, selectedIndividualProducts: [] };
                        }
                        return item;
                      }));
                      // Update currentOrderItem state to reflect changes
                      setCurrentOrderItem(prev => prev ? { ...prev, selectedIndividualProducts: [] } : null);
                    }}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (currentOrderItem.quantity > 0) {
                        autoSelectOldestPieces(currentOrderItem.id, currentOrderItem.quantity);
                        // Update currentOrderItem state to reflect changes
                        setTimeout(() => {
                          const updatedItem = orderItems.find(item => item.id === currentOrderItem.id);
                          if (updatedItem) {
                            setCurrentOrderItem(updatedItem);
                          }
                        }, 100);
                      }
                    }}
                    className="text-xs"
                  >
                    Auto-Select Oldest
                  </Button>
                </div>
              </div>

              {/* Individual Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded p-2">
                {getAvailableIndividualProducts(currentOrderItem.productId).map((product) => {
                  const isSelected = currentOrderItem.selectedIndividualProducts.some(p => p.id === product.id);
                  const isDisabled = !isSelected && currentOrderItem.selectedIndividualProducts.length >= currentOrderItem.quantity;
                  
                  return (
                    <Card 
                      key={product.id} 
                      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (!isDisabled) {
                          // Toggle selection: if selected, deselect; if not selected, select
                          console.log('Clicking product:', product.id, 'Current selection:', isSelected, 'Will select:', !isSelected);
                          handleIndividualProductSelection(currentOrderItem.id, product, !isSelected);
                        }
                      }}
                    >
                      {/* Selection Status Indicator */}
                      <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-600' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      {/* Age Indicator */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${
                        product.age > 60 ? "bg-red-500" :
                        product.age > 30 ? "bg-yellow-500" :
                        "bg-green-500"
                      }`} />
                      
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{product.id}</div>
                            <div className="text-xs text-muted-foreground font-mono">{product.qrCode}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isSelected && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                Selected
                              </Badge>
                            )}
                            <Badge className={
                              product.qualityGrade === "A+" ? "bg-green-100 text-green-800" :
                              product.qualityGrade === "A" ? "bg-blue-100 text-blue-800" :
                              product.qualityGrade === "B" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }>
                              {product.qualityGrade}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Manufactured:</span>
                            <span>{new Date(product.manufacturingDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Age:</span>
                            <span className={`font-medium ${
                              product.age > 60 ? "text-red-600" :
                              product.age > 30 ? "text-yellow-600" :
                              "text-green-600"
                            }`}>
                              {product.age} days
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Dimensions:</span>
                            <span>{product.dimensions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Weight:</span>
                            <span>{product.weight}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="truncate">{product.location}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                            <div className="font-medium">Selected for Order</div>
                            <div>This piece will be included in the shipment</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Selection Summary */}
              {currentOrderItem.selectedIndividualProducts.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Pieces Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border border-gray-200 rounded">
                      {currentOrderItem.selectedIndividualProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              product.age > 60 ? "bg-red-500" :
                              product.age > 30 ? "bg-yellow-500" :
                              "bg-green-500"
                            }`} />
                            <span className="font-medium">{product.id}</span>
                            <span className="text-sm text-muted-foreground">({product.qrCode})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-muted-foreground">
                              {product.qualityGrade} • {product.age} days old
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIndividualProductSelection(currentOrderItem.id, product, false);
                              }}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIndividualProductSelection(false)}>
              Close
            </Button>
            <Button 
              onClick={() => setShowIndividualProductSelection(false)}
              disabled={currentOrderItem?.selectedIndividualProducts.length !== currentOrderItem?.quantity}
            >
              Confirm Selection ({currentOrderItem?.selectedIndividualProducts.length || 0} pieces)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Search Modal */}
      <Dialog open={showProductSearch} onOpenChange={setShowProductSearch}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search and Select Product
            </DialogTitle>
            <DialogDescription>
              Find the perfect product for your order. Use search, filters, and browse by category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products by name, category, color, or size..."
                  className="h-10"
                  onChange={(e) => {
                    // Filter products based on search
                    const searchTerm = e.target.value.toLowerCase();
                    // This would be implemented with proper filtering logic
                  }}
                />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="carpets">Carpets</SelectItem>
                  <SelectItem value="rugs">Rugs</SelectItem>
                  <SelectItem value="mats">Mats</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="brown">Brown</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {realProducts.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    currentOrderItem?.productId === product.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    updateOrderItem(currentOrderItem!.id, 'productId', product.id);
                    updateOrderItem(currentOrderItem!.id, 'unitPrice', product.price);
                    setShowProductSearch(false);
                  }}
                >
                  {/* Product Image Placeholder */}
                  <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    <div className="text-xs text-muted-foreground">
                      {product.category} • {product.color} • {product.size}
                    </div>
                    
                    {/* Stock Status */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={product.stock > 20 ? "default" : product.stock > 5 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        Stock: {product.stock}
                      </Badge>
                                        <div className="text-sm font-semibold text-green-600">
                    ₹{product.price.toLocaleString()}
                  </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderItem(currentOrderItem!.id, 'productId', product.id);
                          updateOrderItem(currentOrderItem!.id, 'unitPrice', product.price);
                          setShowProductSearch(false);
                        }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Select
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to product detail page
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
              <span>Showing {realProducts.length} products</span>
              <span>Click on a product to select it for your order</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductSearch(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}