import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Eye, Edit, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  product: string;
  quantity: number;
  totalAmount: number;
  paidAmount: number;
  status: "pending" | "confirmed" | "in-production" | "ready" | "completed" | "cancelled";
  orderDate: string;
  expectedDelivery: string;
}

const orders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customerName: "Sharma Enterprises",
    product: "Red Premium Carpet 4x6ft",
    quantity: 50,
    totalAmount: 125000,
    paidAmount: 75000,
    status: "in-production",
    orderDate: "2024-01-15",
    expectedDelivery: "2024-01-25"
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customerName: "Royal Interiors",
    product: "Blue Standard Carpet 6x8ft",
    quantity: 25,
    totalAmount: 87500,
    paidAmount: 87500,
    status: "ready",
    orderDate: "2024-01-14",
    expectedDelivery: "2024-01-22"
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customerName: "Modern Living Co.",
    product: "Green Luxury Carpet 5x7ft",
    quantity: 75,
    totalAmount: 225000,
    paidAmount: 112500,
    status: "confirmed",
    orderDate: "2024-01-16",
    expectedDelivery: "2024-01-28"
  }
];

const statusStyles = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary text-primary-foreground",
  "in-production": "bg-production text-production-foreground",
  ready: "bg-success text-success-foreground",
  completed: "bg-accent text-accent-foreground",
  cancelled: "bg-destructive text-destructive-foreground"
};

export default function Orders() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Order Management" 
        subtitle="Manage customer orders and track order lifecycle"
      />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search orders..." className="pl-10 w-64" />
          </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-production">In Production</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-muted-foreground">Order</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Payment</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Delivery</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">{order.orderDate}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{order.customerName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{order.product}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{order.quantity} pcs</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">₹{order.totalAmount.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-success">
                          ₹{order.paidAmount.toLocaleString()}
                        </div>
                        {order.paidAmount < order.totalAmount && (
                          <div className="text-sm text-destructive">
                            ₹{(order.totalAmount - order.paidAmount).toLocaleString()} due
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={statusStyles[order.status]}>
                        {order.status.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">{order.expectedDelivery}</div>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}