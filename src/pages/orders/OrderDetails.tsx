import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFromStorage, saveToStorage } from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Package, User, Calendar, MapPin, Phone, Mail, 
  AlertTriangle, Factory, CheckCircle, Clock, DollarSign,
  FileText, Download, Printer, Share2, Edit, Trash2, Plus, X
} from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableStock: number;

  selectedIndividualProducts: any[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
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

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditingPayment, setIsEditingPayment] = useState(false);

  useEffect(() => {
    // Load real order data from localStorage
    const orders = getFromStorage('rajdhani_orders') || [];
    const allProducts = getFromStorage('rajdhani_products') || [];
    
    const foundOrder = orders.find((o: any) => o.id === orderId);
    
    if (foundOrder) {
      setOrder(foundOrder);
      setEditingOrder(foundOrder);
    } else {
      toast({
        title: "Order Not Found",
        description: "The requested order could not be found.",
        variant: "destructive"
      });
      navigate('/orders');
    }
    
    setProducts(allProducts);
    setLoading(false);
  }, [orderId, navigate, toast]);

  // Handle order modification
  const handleSaveChanges = () => {
    if (!editingOrder) return;

    // Recalculate totals
    const subtotal = editingOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const gstAmount = (subtotal * editingOrder.gstRate) / 100;
    const totalAmount = subtotal + gstAmount;
    const outstandingAmount = totalAmount - editingOrder.paidAmount;

    const updatedOrder = {
      ...editingOrder,
      subtotal,
      gstAmount,
      totalAmount,
      outstandingAmount
    };

    // Save to localStorage
    const orders = getFromStorage('rajdhani_orders') || [];
    const updatedOrders = orders.map((o: any) => 
      o.id === orderId ? updatedOrder : o
    );
    saveToStorage('rajdhani_orders', updatedOrders);

    setOrder(updatedOrder);
    setIsEditing(false);

    toast({
      title: "Order Updated",
      description: "Order has been successfully updated.",
    });
  };

  // Add new item to order
  const handleAddItem = () => {
    if (!editingOrder) return;

    const newItem = {
      id: `item-${Date.now()}`,
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      availableStock: 0,
            selectedIndividualProducts: []
    };

    setEditingOrder({
      ...editingOrder,
      items: [...editingOrder.items, newItem]
    });
  };

  // Remove item from order
  const handleRemoveItem = (itemId: string) => {
    if (!editingOrder) return;

    setEditingOrder({
      ...editingOrder,
      items: editingOrder.items.filter(item => item.id !== itemId)
    });
  };

  // Update item in order
  const handleUpdateItem = (itemId: string, field: string, value: any) => {
    if (!editingOrder) return;

    const updatedItems = editingOrder.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total price if quantity or unit price changed
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        // Update product name if product changed
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.productName = product.name;
            updatedItem.unitPrice = product.sellingPrice;
            updatedItem.availableStock = product.quantity;
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          }
        }
        
        return updatedItem;
      }
      return item;
    });

    setEditingOrder({
      ...editingOrder,
      items: updatedItems
    });
  };

  // Handle payment update
  const handleUpdatePayment = (newPaidAmount: number) => {
    if (!editingOrder) return;

    const updatedOrder = {
      ...editingOrder,
      paidAmount: newPaidAmount,
      outstandingAmount: editingOrder.totalAmount - newPaidAmount
    };

    setEditingOrder(updatedOrder);
  };

  // Save payment changes
  const handleSavePayment = () => {
    if (!editingOrder) return;

    // Save to localStorage
    const orders = getFromStorage('rajdhani_orders') || [];
    const updatedOrders = orders.map((o: any) => 
      o.id === orderId ? editingOrder : o
    );
    saveToStorage('rajdhani_orders', updatedOrders);

    setOrder(editingOrder);
    setIsEditingPayment(false);

    toast({
      title: "Payment Updated",
      description: "Payment information has been updated successfully.",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Header title="Order Details" subtitle="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Header title="Order Details" subtitle="Order not found" />
        <Card className="p-12 text-center">
          <Package className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-3">Order Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "dispatched": return "bg-orange-100 text-orange-800 border-orange-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "accepted": return <CheckCircle className="w-4 h-4" />;
      case "dispatched": return <Package className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const currentOrder = isEditing ? editingOrder : order;
  const canModify = order.status === 'accepted';

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title={`Order ${order.orderNumber}`} 
        subtitle="View complete order details and manage status"
      />

      {/* Order Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <Badge className={`${getStatusColor(order.status)} flex items-center gap-2 px-3 py-2`}>
            {getStatusIcon(order.status)}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {canModify && (
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className={isEditing ? "" : "bg-blue-600 hover:bg-blue-700 text-white"}
              size="lg"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel Edit' : 'Edit Order'}
            </Button>
          )}
          {isEditing && (
            <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700" size="lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Order Status and Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
              <p className="text-muted-foreground">{order.customerName}</p>
            </div>
            <div className="text-right">
              <Badge className={`${getStatusColor(order.status)} flex items-center gap-2 px-3 py-2`}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {order.workflowStep}
              </p>
        </div>
      </div>

          {/* Progress Bar */}
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
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items - Different views based on status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {order.status === 'accepted' && 'Order Items'}
                {order.status === 'dispatched' && 'Order Items (Dispatched)'}
                {order.status === 'delivered' && 'Order Items (Delivered)'}
                {order.status === 'pending' && 'Order Items (Pending)'}
                ({currentOrder?.items.length || 0})
                {order.status === 'accepted' && !isEditing && (
                  <Badge className="ml-auto bg-blue-100 text-blue-800 border-blue-200">
                    <Edit className="w-3 h-3 mr-1" />
                    Click "Edit Order" to modify
                  </Badge>
                )}
                {isEditing && order.status === 'accepted' && (
                  <Button size="sm" onClick={handleAddItem} className="ml-auto bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentOrder?.items.map((item, index) => (
                  <div key={item.id} className={`border rounded-lg p-4 ${
                    order.status === 'accepted' ? 'border-blue-200 bg-blue-50' :
                    order.status === 'dispatched' ? 'border-orange-200 bg-orange-50' :
                    order.status === 'delivered' ? 'border-green-200 bg-green-50' :
                    'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* ACCEPTED STATUS - Editable */}
                        {order.status === 'accepted' && isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label>Product</Label>
                              <Select 
                                value={item.productId} 
                                onValueChange={(value) => handleUpdateItem(item.id, 'productId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(product => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name}
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
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                min="1"
                              />
                            </div>
                            <div>
                              <Label>Unit Price</Label>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label>Total Price</Label>
                              <Input
                                value={item.totalPrice}
                                readOnly
                                className="bg-gray-50"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                        <h3 className="font-semibold text-lg">{item.productName}</h3>
                            
                            {/* ACCEPTED STATUS - Basic Info */}
                            {order.status === 'accepted' && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity} pieces • Unit Price: ₹{item.unitPrice.toLocaleString()}
                              </div>
                            )}
                            
                            {/* DISPATCHED STATUS - More Details */}
                            {order.status === 'dispatched' && (
                              <div className="space-y-2 mt-2">
                                <div className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity} pieces • Unit Price: ₹{item.unitPrice.toLocaleString()}
                                </div>
                                <div className="text-sm text-orange-600 font-medium">
                                  ✓ Stock Deducted • Ready for Delivery
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Dispatched on: {order.dispatchedAt ? new Date(order.dispatchedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                            )}
                            
                            {/* DELIVERED STATUS - All Details */}
                            {order.status === 'delivered' && (
                              <div className="space-y-2 mt-2">
                        <div className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity} pieces • Unit Price: ₹{item.unitPrice.toLocaleString()}
                                </div>
                                <div className="text-sm text-green-600 font-medium">
                                  ✓ Delivered Successfully
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium">Accepted:</span> {order.acceptedAt ? new Date(order.acceptedAt).toLocaleDateString() : 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Dispatched:</span> {order.dispatchedAt ? new Date(order.dispatchedAt).toLocaleDateString() : 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Delivered:</span> {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Stock Status:</span> Deducted
                        </div>
                      </div>
                    </div>
                            )}
                        </div>
                      )}
                    </div>

                      {/* Action Buttons */}
                      {order.status === 'accepted' && isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-4 text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {/* Price Display */}
                      <div className="text-right">
                        <div className="text-xl font-bold">₹{item.totalPrice.toLocaleString()}</div>
                        {order.status === 'dispatched' && (
                          <div className="text-sm text-orange-600">Dispatched</div>
                        )}
                        {order.status === 'delivered' && (
                          <div className="text-sm text-green-600">Delivered</div>
                        )}
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Delivery Information - Only for Dispatched/Delivered Orders */}
          {(order.status === 'dispatched' || order.status === 'delivered') && (
            <Card className={order.status === 'dispatched' ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  order.status === 'dispatched' ? 'text-orange-800' : 'text-green-800'
                }`}>
                  <Package className="w-5 h-5" />
                  {order.status === 'dispatched' ? 'Dispatch Information' : 'Delivery Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.status === 'dispatched' && (
                    <div className="space-y-2">
                      <div className="text-orange-700">
                        <span className="font-medium">Dispatched on:</span> {order.dispatchedAt ? new Date(order.dispatchedAt).toLocaleString() : 'N/A'}
                      </div>
                      <div className="text-orange-700">
                        <span className="font-medium">Status:</span> Ready for Delivery
                      </div>
                  <div className="text-orange-700">
                        <span className="font-medium">Stock:</span> Deducted from inventory
                      </div>
                  </div>
                  )}
                  
                  {order.status === 'delivered' && (
                  <div className="space-y-2">
                      <div className="text-green-700">
                        <span className="font-medium">Delivered on:</span> {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'N/A'}
                      </div>
                      <div className="text-green-700">
                        <span className="font-medium">Status:</span> Successfully Delivered
                      </div>
                      <div className="text-green-700">
                        <span className="font-medium">Stock:</span> Deducted and confirmed
                      </div>
                      <div className="text-green-700">
                        <span className="font-medium">Order Complete:</span> All items delivered to customer
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Timeline - Only for Delivered Orders */}
          {order.status === 'delivered' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Clock className="w-5 h-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-green-800">Order Accepted</div>
                      <div className="text-sm text-green-600">
                        {order.acceptedAt ? new Date(order.acceptedAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-orange-800">Order Dispatched</div>
                      <div className="text-sm text-orange-600">
                        {order.dispatchedAt ? new Date(order.dispatchedAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-green-800">Order Delivered</div>
                      <div className="text-sm text-green-600">
                        {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'N/A'}
                      </div>
                      </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="w-3 h-3" />
                  {order.customerEmail}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Phone className="w-3 h-3" />
                  {order.customerPhone}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3" />
                  Order Date: {new Date(order.orderDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3" />
                  Expected Delivery: {new Date(order.expectedDelivery).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">₹{currentOrder?.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST ({currentOrder?.gstRate}%):</span>
                <span className="font-semibold">₹{currentOrder?.gstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">₹{currentOrder?.totalAmount.toLocaleString()}</span>
              </div>
              
              {/* Payment Section */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Paid Amount:</span>
                  {(order.status === 'dispatched' || order.status === 'accepted') && !isEditingPayment && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingPayment(true)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                
                {isEditingPayment ? (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={currentOrder?.paidAmount || 0}
                      onChange={(e) => handleUpdatePayment(parseFloat(e.target.value) || 0)}
                      className="text-green-600 font-semibold"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSavePayment} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setIsEditingPayment(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-green-600 font-semibold">₹{currentOrder?.paidAmount.toLocaleString()}</span>
                    {order.status === 'dispatched' && currentOrder && currentOrder.outstandingAmount > 0 && (
                      <Badge className="bg-orange-100 text-orange-800">
                        Payment Pending
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outstanding:</span>
                <span className={`font-semibold ${(currentOrder?.outstandingAmount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{currentOrder?.outstandingAmount.toLocaleString()}
                </span>
              </div>
              
              {/* Payment Status Warning */}
              {order.status === 'dispatched' && currentOrder && currentOrder.outstandingAmount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium text-sm">Payment Required Before Delivery</span>
                  </div>
                  <p className="text-orange-700 text-xs mt-1">
                    Full payment must be collected before marking order as delivered.
                  </p>
              </div>
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Balance Due:</span>
                  <span className={`${(currentOrder?.outstandingAmount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{currentOrder?.outstandingAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Created:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Delivery:</span>
                  <span>{new Date(order.expectedDelivery).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
