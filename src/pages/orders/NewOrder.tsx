import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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

const mockProducts = [
  { id: "1", name: "Red Premium Carpet 4x6ft", price: 2500, stock: 50 },
  { id: "2", name: "Blue Standard Carpet 6x8ft", price: 3500, stock: 25 },
  { id: "3", name: "Green Luxury Carpet 5x7ft", price: 3000, stock: 75 },
];

export default function NewOrder() {
  const { toast } = useToast();
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

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const product = mockProducts.find(p => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.unitPrice = product.price;
            updated.totalPrice = updated.quantity * product.price;
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

    toast({
      title: "Success",
      description: "Order created successfully!",
    });
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
            {orderItems.map((item) => (
              <div key={item.id} className="grid grid-cols-6 gap-4 items-end p-4 border rounded-lg">
                <div>
                  <Label>Product</Label>
                  <Select 
                    value={item.productId} 
                    onValueChange={(value) => updateOrderItem(item.id, 'productId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input 
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateOrderItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Total</Label>
                  <Input value={`₹${item.totalPrice.toLocaleString()}`} disabled />
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeOrderItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
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
          <div className="flex gap-4 mt-6">
            <Button variant="outline" className="flex-1">Save as Draft</Button>
            <Button onClick={handleSubmit} className="flex-1">Create Order</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}