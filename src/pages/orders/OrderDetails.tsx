import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Package, User, Calendar, MapPin, Phone, Mail, 
  AlertTriangle, Factory, CheckCircle, Clock, DollarSign,
  FileText, Download, Printer, Share2, Edit, Trash2
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
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  expectedDelivery: string;
  notes: string;
  status: "pending" | "confirmed" | "ready" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;

}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading order data
    // In real app, this would be an API call
    setTimeout(() => {
      const mockOrder: Order = {
        id: orderId || "ORD001",
        customer: {
          id: "1",
          name: "Sharma Enterprises",
          email: "contact@sharma.com",
          phone: "+91 9876543210",
          address: "Mumbai, Maharashtra, India"
        },
        items: [
          {
            id: "1",
            productId: "PROD001",
            productName: "Traditional Persian Carpet",
            quantity: 7,
            unitPrice: 2500,
            totalPrice: 17500,
            availableStock: 50,
            needsProduction: false,
            productionAlert: false,
            selectedIndividualProducts: [
              { id: "IND001_027", qrCode: "QR-PERSIAN-027" },
              { id: "IND001_004", qrCode: "QR-PERSIAN-004" },
              { id: "IND001_009", qrCode: "QR-PERSIAN-009" }
            ]
          },
          {
            id: "2",
            productId: "PROD002",
            productName: "Modern Geometric Carpet",
            quantity: 3,
            unitPrice: 3500,
            totalPrice: 10500,
            availableStock: 25,
            needsProduction: true,
            productionAlert: true,
            selectedIndividualProducts: []
          }
        ],
        totalAmount: 28000,
        paidAmount: 10000,
        outstandingAmount: 18000,
        expectedDelivery: "2024-02-15",
        notes: "Customer prefers delivery in the morning. Handle with care - premium products.",
        status: "confirmed",
        createdAt: "2024-01-20T10:30:00Z",
        updatedAt: "2024-01-20T15:45:00Z",
        productionRequired: true,
        productionItems: ["Modern Geometric Carpet"]
      };
      
      setOrder(mockOrder);
      setLoading(false);
    }, 1000);
  }, [orderId]);

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
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-production": return "bg-orange-100 text-orange-800 border-orange-200";
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "in-production": return <Factory className="w-4 h-4" />;
      case "ready": return <Package className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title={`Order #${order.id}`} 
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
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.productName}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity} pieces • Unit Price: ₹{item.unitPrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">₹{item.totalPrice.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Stock: {item.availableStock} pieces
                        </div>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-4 mb-3">
                      <Badge className={
                        item.needsProduction 
                          ? "bg-red-100 text-red-800 border-red-200" 
                          : "bg-green-100 text-green-800 border-green-200"
                      }>
                        {item.needsProduction ? "⚠️ Production Required" : "✅ In Stock"}
                      </Badge>
                      
                      {item.selectedIndividualProducts.length > 0 && (
                        <div className="text-sm text-blue-600">
                          <span className="font-medium">{item.selectedIndividualProducts.length}</span> specific pieces selected
                        </div>
                      )}
                    </div>

                    {/* Selected Pieces */}
                    {item.selectedIndividualProducts.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-800 mb-2">Selected Pieces:</div>
                        <div className="flex flex-wrap gap-2">
                          {item.selectedIndividualProducts.map((piece) => (
                            <Badge key={piece.id} variant="outline" className="text-xs">
                              {piece.id} ({piece.qrCode})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Production Alert */}
                    {item.needsProduction && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 text-red-800 mb-2">
                          <Factory className="w-4 h-4" />
                          <span className="font-medium">Production Required</span>
                        </div>
                        <div className="text-sm text-red-700">
                          Need to produce {item.quantity - item.availableStock} more pieces to fulfill this order.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Production Requirements */}
          {order.productionRequired && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Factory className="w-5 h-5" />
                  Production Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-orange-700">
                    This order requires production planning for the following items:
                  </div>
                  <div className="space-y-2">
                    {order.productionItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-orange-800">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                    <Factory className="w-4 h-4 mr-2" />
                    Send to Production
                  </Button>
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
                <div className="font-medium">{order.customer.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="w-3 h-3" />
                  {order.customer.email}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Phone className="w-3 h-3" />
                  {order.customer.phone}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3" />
                  {order.customer.address}
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
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">₹{order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Amount:</span>
                <span className="text-green-600 font-semibold">₹{order.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outstanding:</span>
                <span className="text-red-600 font-semibold">₹{order.outstandingAmount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Balance Due:</span>
                  <span className="text-red-600">₹{order.outstandingAmount.toLocaleString()}</span>
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

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Ready
              </Button>
              <Button className="w-full" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Schedule Delivery
              </Button>
              <Button className="w-full" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
              <Button className="w-full" variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
