import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2, AlertTriangle, Factory, Package, X, CheckCircle, Eye, Save, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { saveToStorage, getFromStorage, STORAGE_KEYS, generateUniqueId, createNotification, fixNestedArray, replaceStorage } from "@/lib/storage";
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
  productType: 'product' | 'raw_material'; // Whether this is a finished product or raw material
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableStock: number;
  needsProduction: boolean; // Whether this item requires production
  selectedIndividualProducts: IndividualProduct[]; // Track which specific pieces are selected
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  customerType: "individual" | "business";
  status: "active" | "inactive";
  totalOrders: number;
  totalValue: number;
  lastOrderDate: string;
  registrationDate: string;
  gstNumber?: string;
  companyName?: string;
}


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


export default function NewOrder() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [individualProducts, setIndividualProducts] = useState<any[]>([]);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    customerType: "individual" as "individual" | "business",
    gstNumber: "",
    companyName: ""
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

  // Load customers and products from storage on component mount
  useEffect(() => {
    const storedCustomers = getFromStorage(STORAGE_KEYS.CUSTOMERS);
    setCustomers(storedCustomers);
    
    const storedProducts = getFromStorage(STORAGE_KEYS.PRODUCTS);
    const storedIndividualProducts = getFromStorage(STORAGE_KEYS.INDIVIDUAL_PRODUCTS);
    const storedRawMaterials = getFromStorage('rajdhani_raw_materials');
    
    // Transform stored products to match the expected format and calculate stock
    const transformedProducts = storedProducts.map((product: any) => {
      // Only count products that are actually available (not sold or damaged)
      const availableIndividualProducts = storedIndividualProducts.filter(
        (item: any) => item.productId === product.id && item.status === "available"
      );
      
      // Count total individual products for debugging
      const totalIndividualProducts = storedIndividualProducts.filter(
        (item: any) => item.productId === product.id
      );
      const soldProducts = totalIndividualProducts.filter(item => item.status === "sold");
      const damagedProducts = totalIndividualProducts.filter(item => item.status === "damaged");
      
      console.log(`📦 Product ${product.name}:`, {
        total: totalIndividualProducts.length,
        available: availableIndividualProducts.length,
        sold: soldProducts.length,
        damaged: damagedProducts.length
      });

      return {
        id: product.id,
        name: product.name,
        price: product.sellingPrice || product.totalCost || 0,
        stock: product.individualStockTracking === false ? product.quantity : availableIndividualProducts.length, // Use quantity for bulk products, individual count for tracked products
        category: product.category,
        color: product.color,
        size: product.size,
        pattern: product.pattern,
        dimensions: product.dimensions,
        weight: product.weight,
        imageUrl: product.imageUrl,
        status: product.status,
        location: product.location,
        unit: product.unit, // Add unit field
        individualStockTracking: product.individualStockTracking // Add individualStockTracking field
      };
    });
    
    // Transform raw materials to match the expected format
    const transformedRawMaterials = storedRawMaterials.map((material: any) => ({
      id: material.id,
      name: material.name,
      price: material.costPerUnit || 0,
      stock: material.currentStock || 0, // Use stock field for UI consistency
      category: material.category,
      brand: material.brand,
      unit: material.unit,
      supplier: material.supplier,
      status: material.status,
      location: material.location || 'Warehouse'
    }));
    
    setRealProducts(transformedProducts);
    setIndividualProducts(storedIndividualProducts);
    setRawMaterials(transformedRawMaterials);
    
    console.log('📦 Loaded products from storage:', transformedProducts.length);
    console.log('🔍 Loaded individual products from storage:', storedIndividualProducts.length);
    console.log('🧱 Loaded raw materials from storage:', transformedRawMaterials.length);
  }, []);

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: generateUniqueId('ORDITEM'),
      productId: "",
      productName: "",
      productType: 'product', // Default to product
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      availableStock: 0,
      needsProduction: false,
      selectedIndividualProducts: []
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          // Find product based on productType
          const product = updated.productType === 'raw_material' 
            ? rawMaterials.find(p => p.id === value)
            : realProducts.find(p => p.id === value);
            
          if (product) {
            updated.productName = product.name;
            updated.unitPrice = product.price;
            updated.totalPrice = updated.quantity * product.price;
            updated.availableStock = product.stock || 0;
            updated.needsProduction = updated.quantity > (product.stock || 0);

            // Reset selected individual products when product changes
            updated.selectedIndividualProducts = [];
          }
        }
        if (field === 'quantity') {
          const product = updated.productType === 'raw_material' 
            ? rawMaterials.find(p => p.id === updated.productId)
            : realProducts.find(p => p.id === updated.productId);
          if (product) {
            updated.totalPrice = updated.quantity * updated.unitPrice;
            // Both products and raw materials now use stock field
            updated.needsProduction = updated.quantity > (product.stock || 0);
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

  // Check if product has individual stock tracking
  const hasIndividualStock = (productId: string, productType: 'product' | 'raw_material' = 'product') => {
    // Raw materials never have individual stock tracking
    if (productType === 'raw_material') {
      return false;
    }
    
    const product = realProducts.find(p => p.id === productId);
    const hasIndividual = product && product.individualStockTracking !== false;
    
    // Debug logging
    console.log(`🔍 hasIndividualStock check for ${productId}:`, {
      productType,
      product: product?.name,
      individualStockTracking: product?.individualStockTracking,
      hasIndividual
    });
    
    return hasIndividual;
  };

  // Get the correct unit for display based on product type
  const getDisplayUnit = (productId: string, productType: 'product' | 'raw_material') => {
    if (productType === 'raw_material') {
      const material = rawMaterials.find(m => m.id === productId);
      return material?.unit || 'units';
    } else {
      const product = realProducts.find(p => p.id === productId);
      return product?.unit || 'pieces';
    }
  };

  // Get available individual products for a product (only available ones for ordering)
  const getAvailableIndividualProducts = (productId: string) => {
    return individualProducts
      .filter(p => p.productId === productId && p.status === "available") // Only available products
      .map(p => ({
        ...p,
        // Calculate age in days from manufacturing date
        age: Math.floor((new Date().getTime() - new Date(p.manufacturingDate).getTime()) / (1000 * 60 * 60 * 24)),
        // Map fields to match expected interface
        dimensions: p.finalDimensions || p.dimensions || "N/A",
        weight: p.finalWeight || p.weight || "N/A",
        productName: realProducts.find(rp => rp.id === productId)?.name || "Unknown Product",
        location: p.location || "Warehouse"
      }))
      .sort((a, b) => a.age - b.age); // Sort by age (oldest first)
  };

  // Get all products for display (including damaged for information)
  const getAllIndividualProducts = (productId: string) => {
    return individualProducts
      .filter(p => p.productId === productId)
      .map(p => ({
        ...p,
        // Calculate age in days from manufacturing date
        age: Math.floor((new Date().getTime() - new Date(p.manufacturingDate).getTime()) / (1000 * 60 * 60 * 24)),
        // Map fields to match expected interface
        dimensions: p.finalDimensions || p.dimensions || "N/A",
        weight: p.finalWeight || p.weight || "N/A",
        productName: realProducts.find(rp => rp.id === productId)?.name || "Unknown Product",
        location: p.location || "Warehouse",
        isDamaged: p.status === "damaged",
        isSold: p.status === "sold"
      }))
      .sort((a, b) => {
        // Sort: available first, then damaged, then sold
        if (a.status !== b.status) {
          if (a.status === "available") return -1;
          if (b.status === "available") return 1;
          if (a.status === "damaged") return -1;
          if (b.status === "damaged") return 1;
        }
        return a.age - b.age;
      });
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

  const handleProductionAlert = (item: OrderItem) => {
    setProductionAlertItem(item);
    setShowProductionAlert(true);
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

    // Calculate order totals for validation
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const gstRate = 18;
    const gstAmount = (subtotal * gstRate) / 100;
    const totalAmount = subtotal + gstAmount;

    // Validate minimum payment requirement
    if (orderDetails.paidAmount <= 0) {
      toast({
        title: "Payment Required",
        description: "A minimum payment is required to accept the order. Please enter an advance amount.",
        variant: "destructive"
      });
      return;
    }

    if (orderDetails.paidAmount < totalAmount * 0.1) {
      toast({
        title: "Insufficient Advance Payment",
        description: `Minimum 10% advance payment required (₹${Math.ceil(totalAmount * 0.1).toLocaleString()}). Current: ₹${orderDetails.paidAmount.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Calculate order totals
      const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const gstRate = 18; // 18% GST
      const gstAmount = (subtotal * gstRate) / 100;
      const totalAmount = subtotal + gstAmount;
      const paidAmount = orderDetails.paidAmount || 0;
      const outstandingAmount = totalAmount - paidAmount;

      // Create the order
      const newOrder = {
        id: generateUniqueId('ORD'),
        orderNumber: `ORD-${Date.now()}`,
        customerId: selectedCustomer?.id || '',
        customerName: selectedCustomer?.name || '',
        customerEmail: selectedCustomer?.email || '',
        customerPhone: selectedCustomer?.phone || '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: orderDetails.expectedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productType: item.productType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          selectedProducts: hasIndividualStock(item.productId, item.productType) ? item.selectedIndividualProducts : [],
          qualityGrade: hasIndividualStock(item.productId, item.productType) && item.selectedIndividualProducts.length > 0 ? item.selectedIndividualProducts[0].qualityGrade : 'A'
        })),
        subtotal,
        gstRate,
        gstAmount,
        discountAmount: 0,
        totalAmount,
        paidAmount,
        outstandingAmount,
        paymentMethod: paidAmount > 0 ? "cash" : "credit",
        paymentTerms: paidAmount > 0 ? "Paid in full" : "30 days",
        dueDate: paidAmount > 0 ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "accepted" as const,
        workflowStep: "accept" as const,
        acceptedAt: new Date().toISOString(),
        notes: orderDetails.notes || ""
      };

      // Save order to localStorage
      const existingOrders = getFromStorage(STORAGE_KEYS.ORDERS) || [];
      
      // Ensure existingOrders is a flat array (fix nested array issue)
      const flatExistingOrders = fixNestedArray(existingOrders);
      if (flatExistingOrders !== existingOrders) {
        console.log('🔧 Fixed nested orders array before adding new order');
      }
      
      const updatedOrders = [...flatExistingOrders, newOrder];
      replaceStorage(STORAGE_KEYS.ORDERS, updatedOrders);

      // Note: Stock will be deducted only when order is dispatched, not when accepted
      // This allows orders to be accepted even with low stock, and production can be planned

      // Update customer order history
      if (selectedCustomer) {
        const updatedCustomers = customers.map(customer => {
          if (customer.id === selectedCustomer.id) {
            return {
              ...customer,
              totalOrders: customer.totalOrders + 1,
              totalValue: customer.totalValue + totalAmount,
              lastOrderDate: newOrder.orderDate
            };
          }
          return customer;
        });
        replaceStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    }

    // Check if any items need production
    const itemsNeedingProduction = orderItems.filter(item => item.needsProduction);
    
    // Always send notifications to products section for items needing production
    if (itemsNeedingProduction.length > 0) {
      // Send notifications to products section for each item needing production
      itemsNeedingProduction.forEach(item => {
        // Check if notification already exists to prevent duplicates
        const existingNotifications = getFromStorage('rajdhani_notifications') || [];
        const flattenedNotifications = existingNotifications.flat(Infinity);
        const hasExistingNotification = flattenedNotifications.some(n => 
          n && n.type === 'production_request' && 
          n.relatedId === item.productId && 
          n.status === 'unread'
        );
        
        if (!hasExistingNotification) {
          createNotification({
            type: 'production_request',
            title: `Product Stock Alert - ${item.productName}`,
            message: `Order ${newOrder.orderNumber} requires ${item.quantity} ${getDisplayUnit(item.productId, item.productType)} of ${item.productName}. Current stock: ${item.availableStock} ${getDisplayUnit(item.productId, item.productType)}. Need to produce: ${item.quantity - item.availableStock} more ${getDisplayUnit(item.productId, item.productType)}.`,
            priority: 'high',
            status: 'unread',
            module: 'products',
            relatedId: item.productId,
            relatedData: {
              productId: item.productId,
              productName: item.productName,
              requiredQuantity: item.quantity,
              availableStock: item.availableStock,
              shortfall: item.quantity - item.availableStock,
              orderId: newOrder.id,
              orderNumber: newOrder.orderNumber
            },
            createdBy: 'system'
          });
        }
      });
      
      toast({
          title: "✅ Order Created - Stock Alert Sent",
          description: `Order ${newOrder.orderNumber} created! ${itemsNeedingProduction.length} items need production. Products section has been notified.`,
      });
    } else {
      // All items have sufficient stock
    toast({
          title: "✅ Order Created Successfully",
          description: `Order ${newOrder.orderNumber} created! All items have sufficient stock.`,
        });
      }

      // Navigate back to orders list
      setTimeout(() => {
        navigate('/orders');
      }, 2000);

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "❌ Order Creation Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
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
                {customers.map((customer) => (
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
                    {customer.companyName && (
                      <div className="text-sm text-muted-foreground">{customer.companyName}</div>
                    )}
                    <div className="text-sm text-muted-foreground">{customer.email} • {customer.phone}</div>
                    <div className="text-sm text-muted-foreground">{customer.address}, {customer.city}, {customer.state} - {customer.pincode}</div>
                    {customer.gstNumber && (
                      <div className="text-xs text-muted-foreground">GST: {customer.gstNumber}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Customer Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Customer Type *</Label>
                <Select 
                  value={newCustomer.customerType} 
                  onValueChange={(value: "individual" | "business") => 
                    setNewCustomer({...newCustomer, customerType: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      placeholder="Enter customer full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      placeholder="Enter email address (e.g., customer@gmail.com)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={newCustomer.gstNumber}
                      onChange={(e) => setNewCustomer({...newCustomer, gstNumber: e.target.value})}
                      placeholder="Enter GST number (optional)"
                    />
                  </div>
                </div>

                {newCustomer.customerType === "business" && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={newCustomer.companyName}
                      onChange={(e) => setNewCustomer({...newCustomer, companyName: e.target.value})}
                      placeholder="Enter company name"
                    />
                  </div>
                )}
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    placeholder="Enter full address"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={newCustomer.state}
                      onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})}
                      placeholder="Enter state"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={newCustomer.pincode}
                      onChange={(e) => setNewCustomer({...newCustomer, pincode: e.target.value})}
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Add Customer Button */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewCustomer({
                      name: "",
                      email: "",
                      phone: "",
                      address: "",
                      city: "",
                      state: "",
                      pincode: "",
                      customerType: "individual",
                      gstNumber: "",
                      companyName: ""
                    });
                    setShowNewCustomerForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Basic validation
                    if (!newCustomer.name.trim() || !newCustomer.email.trim() || !newCustomer.phone.trim()) {
                      toast({
                        title: "Error",
                        description: "Please fill in required fields: Name, Email, and Phone",
                        variant: "destructive"
                      });
                      return;
                    }

                    // Create new customer and save to localStorage
                    const newCustomerData: Customer = {
                      id: generateUniqueId('ORDITEM'),
                      name: newCustomer.name.trim(),
                      email: newCustomer.email.trim(),
                      phone: newCustomer.phone.trim(),
                      address: newCustomer.address.trim(),
                      city: newCustomer.city.trim(),
                      state: newCustomer.state.trim(),
                      pincode: newCustomer.pincode.trim(),
                      customerType: newCustomer.customerType,
                      status: "active",
                      totalOrders: 0,
                      totalValue: 0,
                      lastOrderDate: "",
                      registrationDate: new Date().toISOString().split('T')[0],
                      gstNumber: newCustomer.gstNumber.trim() || undefined,
                      companyName: newCustomer.companyName.trim() || undefined
                    };

                    // Add to customers array and save to localStorage
                    const updatedCustomers = [...customers, newCustomerData];
                    setCustomers(updatedCustomers);
                    replaceStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
                    
                    // Select the newly created customer
                    setSelectedCustomer(newCustomerData);
                    
                    // Reset form and hide form
                    setNewCustomer({
                      name: "",
                      email: "",
                      phone: "",
                      address: "",
                      city: "",
                      state: "",
                      pincode: "",
                      customerType: "individual",
                      gstNumber: "",
                      companyName: ""
                    });
                    setShowNewCustomerForm(false);
                    
                    toast({
                      title: "Success",
                      description: `Customer "${newCustomerData.name}" added successfully and selected for this order!`,
                    });
                  }}
                  disabled={!newCustomer.name.trim() || !newCustomer.email.trim() || !newCustomer.phone.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
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
                        className="mt-2 text-orange-600 border-orange-300 hover:bg-orange-100"
                        onClick={() => handleProductionAlert(item)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Stock Low - Notify
                      </Button>
                    </div>
                  )}

                                     {/* Product Selection */}
                   <div className="space-y-4">
                     {/* Product Type Selection */}
                     <div className="mb-4">
                       <Label className="text-sm font-medium text-gray-700 mb-2 block">Item Type</Label>
                       <div className="flex gap-4">
                         <label className="flex items-center space-x-2">
                           <input
                             type="radio"
                             name={`productType-${item.id}`}
                             value="product"
                             checked={item.productType === 'product'}
                             onChange={() => {
                               updateOrderItem(item.id, 'productType', 'product');
                               updateOrderItem(item.id, 'productId', ''); // Clear selection when type changes
                             }}
                             className="text-blue-600"
                           />
                           <span className="text-sm">Finished Product</span>
                         </label>
                         <label className="flex items-center space-x-2">
                           <input
                             type="radio"
                             name={`productType-${item.id}`}
                             value="raw_material"
                             checked={item.productType === 'raw_material'}
                             onChange={() => {
                               updateOrderItem(item.id, 'productType', 'raw_material');
                               updateOrderItem(item.id, 'productId', ''); // Clear selection when type changes
                             }}
                             className="text-blue-600"
                           />
                           <span className="text-sm">Raw Material</span>
                         </label>
                       </div>
                     </div>

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
                                     <div className="font-medium">
                                       {item.productType === 'raw_material' 
                                         ? rawMaterials.find(p => p.id === item.productId)?.name
                                         : realProducts.find(p => p.id === item.productId)?.name}
                                     </div>
                                     <div className="text-sm text-muted-foreground">
                                       {item.productType === 'raw_material' 
                                         ? `${rawMaterials.find(p => p.id === item.productId)?.category} • ${rawMaterials.find(p => p.id === item.productId)?.brand} • ${rawMaterials.find(p => p.id === item.productId)?.unit}`
                                         : `${realProducts.find(p => p.id === item.productId)?.category} • ${realProducts.find(p => p.id === item.productId)?.color} • ${realProducts.find(p => p.id === item.productId)?.size}`}
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
                                 Search and select {item.productType === 'raw_material' ? 'raw material' : 'product'}...
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
                               Available: {item.availableStock} {getDisplayUnit(item.productId, item.productType)}
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
                           {hasIndividualStock(item.productId, item.productType) && (
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
                           )}
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
            <Label htmlFor="paidAmount">Advance Payment (Required)</Label>
            <Input 
              id="paidAmount"
              type="number"
              value={orderDetails.paidAmount}
              onChange={(e) => setOrderDetails(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
              placeholder={`Min: ₹${Math.ceil(calculateTotal() * 0.1).toLocaleString()}`}
              className={orderDetails.paidAmount < calculateTotal() * 0.1 ? 'border-red-300' : ''}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 10% advance required (₹{Math.ceil(calculateTotal() * 0.1).toLocaleString()})
            </p>
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
                 ? "Accept Order (Plan Production)" 
                 : "Accept Order"
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Stock Low Alert
            </DialogTitle>
            <DialogDescription>
              This product has insufficient stock for the order.
            </DialogDescription>
          </DialogHeader>

          {productionAlertItem && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-center">
                  <h3 className="font-semibold text-orange-800 mb-2">{productionAlertItem.productName}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium text-green-600">{productionAlertItem.availableStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required:</span>
                      <span className="font-medium text-red-600">{productionAlertItem.quantity}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-600">Need to produce:</span>
                      <span className="font-bold text-orange-600">
                        {productionAlertItem.quantity - productionAlertItem.availableStock} more pieces
                      </span>
                    </div>
                      </div>
                    </div>
                  </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowProductionAlert(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // Check if notification already exists to prevent duplicates
                    const existingNotifications = getFromStorage('rajdhani_notifications') || [];
                    const flattenedNotifications = existingNotifications.flat(Infinity);
                    const hasExistingNotification = flattenedNotifications.some(n => 
                      n && n.type === 'production_request' && 
                      n.relatedId === productionAlertItem.productId && 
                      n.status === 'unread'
                    );
                    
                    if (!hasExistingNotification) {
                      // Create notification when user clicks "Notify Production"
                      createNotification({
                        type: 'production_request',
                        title: `Production Request - ${productionAlertItem.productName}`,
                        message: `Order requires ${productionAlertItem.quantity} units of ${productionAlertItem.productName}. Current stock: ${productionAlertItem.availableStock} units.`,
                        priority: 'high',
                        status: 'unread',
                        module: 'production',
                        relatedId: productionAlertItem.productId,
                        relatedData: {
                          productId: productionAlertItem.productId,
                          productName: productionAlertItem.productName,
                          requiredQuantity: productionAlertItem.quantity,
                          availableStock: productionAlertItem.availableStock,
                          shortfall: productionAlertItem.quantity - productionAlertItem.availableStock
                        },
                        createdBy: 'user'
                      });
                      
                      toast({
                        title: "✅ Production Notification Sent",
                        description: "Production team has been notified about this request.",
                      });
                    } else {
                      toast({
                        title: "ℹ️ Notification Already Exists",
                        description: "A production request for this product already exists.",
                      });
                    }
                    
                    setShowProductionAlert(false);
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Production
                </Button>
                      </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Individual Product Selection Dialog */}
      <Dialog open={showIndividualProductSelection} onOpenChange={setShowIndividualProductSelection}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Select Specific Pieces - {currentOrderItem?.productName}
            </DialogTitle>
            <DialogDescription>
              Choose which specific pieces to include in this order. Oldest stock is shown first.
            </DialogDescription>
          </DialogHeader>
          
          {currentOrderItem && (
            <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {/* Summary */}
              <div className="flex-shrink-0 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
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
                    Available: {getAvailableIndividualProducts(currentOrderItem.productId).length} {getDisplayUnit(currentOrderItem.productId, currentOrderItem.productType)}
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
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border border-gray-200 rounded p-2">
                {getAvailableIndividualProducts(currentOrderItem.productId).length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No individual products available</p>
                    <p className="text-sm mt-2">Individual pieces will appear here when available in inventory</p>
                  </div>
                ) : (
                  getAvailableIndividualProducts(currentOrderItem.productId).map((product) => {
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
                            <span className="truncate">{product.location || "Warehouse"}</span>
                          </div>
                          {product.inspector && (
                            <div className="flex justify-between">
                              <span>Inspector:</span>
                              <span>{product.inspector}</span>
                            </div>
                          )}
                        </div>

                        {product.notes && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
                            <div className="font-medium">Notes:</div>
                            <div>{product.notes}</div>
                          </div>
                        )}

                        {isSelected && (
                          <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
                            <div className="font-medium">Selected for Order</div>
                            <div>This piece will be included in the shipment</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
                )}
                </div>
              </div>

              {/* Selection Summary */}
              {currentOrderItem.selectedIndividualProducts.length > 0 && (
                <Card className="flex-shrink-0 border-blue-200 bg-blue-50">
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
              Search and Select {currentOrderItem?.productType === 'raw_material' ? 'Raw Material' : 'Product'}
            </DialogTitle>
            <DialogDescription>
              Find the perfect {currentOrderItem?.productType === 'raw_material' ? 'raw material' : 'product'} for your order. Use search, filters, and browse by category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={`Search ${currentOrderItem?.productType === 'raw_material' ? 'raw materials by name, category, brand, or unit' : 'products by name, category, color, or size'}...`}
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
              {(currentOrderItem?.productType === 'raw_material' ? rawMaterials : realProducts).map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    currentOrderItem?.productId === product.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    // Update both productId and unitPrice in a single operation
                    setOrderItems(items => items.map(item => {
                      if (item.id === currentOrderItem!.id) {
                        const updated = { ...item, productId: product.id, unitPrice: product.price };
                        updated.productName = product.name;
                        updated.totalPrice = updated.quantity * product.price;
                        updated.availableStock = product.stock || 0;
                        updated.needsProduction = updated.quantity > (product.stock || 0);
                        updated.selectedIndividualProducts = []; // Reset selected individual products
                        return updated;
                      }
                      return item;
                    }));
                    setShowProductSearch(false);
                  }}
                >
                  {/* Product Image */}
                  <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    <div className="text-xs text-muted-foreground">
                      {currentOrderItem?.productType === 'raw_material' 
                        ? `${product.category} • ${product.brand} • ${product.unit}`
                        : `${product.category} • ${product.color} • ${product.size}`}
                    </div>
                    {currentOrderItem?.productType === 'raw_material' ? (
                      product.supplier && (
                        <div className="text-xs text-muted-foreground">
                          Supplier: {product.supplier}
                        </div>
                      )
                    ) : (
                      product.pattern && (
                      <div className="text-xs text-muted-foreground">
                        Pattern: {product.pattern}
                      </div>
                      )
                    )}
                    {product.location && (
                      <div className="text-xs text-muted-foreground">
                        📍 {product.location}
                      </div>
                    )}
                    
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

            {realProducts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No products available</p>
                <p className="text-sm mt-2">Products will be loaded from inventory when available</p>
              </div>
            )}

            {/* Quick Stats */}
            {realProducts.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
              <span>Showing {realProducts.length} products</span>
              <span>Click on a product to select it for your order</span>
            </div>
            )}
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