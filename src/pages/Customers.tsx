import { useState, useEffect } from "react";
import { saveToStorage, getFromStorage, replaceStorage, STORAGE_KEYS, fixNestedArray } from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Filter, Eye, Edit, MoreHorizontal, Phone, Mail, MapPin, ShoppingBag, Save, X, Calendar, DollarSign, Package, User, Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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


const statusStyles = {
  active: "bg-success text-success-foreground",
  inactive: "bg-muted text-muted-foreground"
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showEditCustomerDialog, setShowEditCustomerDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomerForm, setNewCustomerForm] = useState({
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

  // Load customers and orders from storage on component mount
  useEffect(() => {
    const storedCustomers = getFromStorage(STORAGE_KEYS.CUSTOMERS) || [];
    const storedOrders = getFromStorage(STORAGE_KEYS.ORDERS) || [];
    
    // Fix nested array issue for customers
    const flatCustomers = fixNestedArray(storedCustomers);
    if (flatCustomers !== storedCustomers) {
      console.log('🔧 Fixed nested customers array, flattened from', storedCustomers.length, 'to', flatCustomers.length);
      // Save the flattened array back to localStorage
      localStorage.setItem('rajdhani_customers', JSON.stringify(flatCustomers));
    }
    
    // Fix nested array issue for orders
    const flatOrders = fixNestedArray(storedOrders);
    if (flatOrders !== storedOrders) {
      console.log('🔧 Fixed nested orders array, flattened from', storedOrders.length, 'to', flatOrders.length);
      // Save the flattened array back to localStorage
      localStorage.setItem('rajdhani_orders', JSON.stringify(flatOrders));
    }
    
    setCustomers(flatCustomers);
    setOrders(flatOrders);
  }, []);

  // Auto-cleanup empty customers when orders are loaded
  useEffect(() => {
    if (orders.length > 0 && customers.length > 0) {
      const customersWithOrders = customers.filter(customer => {
        const customerOrders = orders.filter(order => order.customerId === customer.id);
        return customerOrders.length > 0;
      });
      
      if (customersWithOrders.length !== customers.length) {
        setCustomers(customersWithOrders);
        replaceStorage(STORAGE_KEYS.CUSTOMERS, customersWithOrders);
        console.log(`🧹 Auto-removed ${customers.length - customersWithOrders.length} empty customers`);
      }
    }
  }, [orders, customers]);

  // Get customer orders
  const getCustomerOrders = (customerId: string) => {
    return orders.filter(order => order.customerId === customerId);
  };

  // Get customer order statistics
  const getCustomerOrderStats = (customerId: string) => {
    const customerOrders = getCustomerOrders(customerId);
    const totalValue = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = customerOrders.length;
    const lastOrderDate = customerOrders.length > 0 
      ? customerOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0].orderDate
      : 'No orders';
    
    return {
      totalOrders,
      totalValue,
      lastOrderDate,
      orders: customerOrders
    };
  };

  // Remove empty customers (customers with no orders)
  const removeEmptyCustomers = () => {
    const customersWithOrders = customers.filter(customer => {
      const orderStats = getCustomerOrderStats(customer.id);
      return orderStats.totalOrders > 0;
    });
    
    if (customersWithOrders.length !== customers.length) {
      setCustomers(customersWithOrders);
      replaceStorage(STORAGE_KEYS.CUSTOMERS, customersWithOrders);
      console.log(`🧹 Removed ${customers.length - customersWithOrders.length} empty customers`);
    }
  };

  // Handle customer details view
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // Handle customer edit
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer({ ...customer });
    setShowEditCustomerDialog(true);
  };

  // Save customer edits
  const handleSaveCustomer = () => {
    if (!editingCustomer) return;
    
    const updatedCustomers = customers.map(customer => 
      customer.id === editingCustomer.id ? editingCustomer : customer
    );
    
    setCustomers(updatedCustomers);
    replaceStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    setShowEditCustomerDialog(false);
    setEditingCustomer(null);
  };

  // Get customer payment summary
  const getCustomerPaymentSummary = (customerId: string) => {
    const customerOrders = getCustomerOrders(customerId);
    const totalPaid = customerOrders.reduce((sum, order) => sum + (order.paidAmount || 0), 0);
    const totalOutstanding = customerOrders.reduce((sum, order) => sum + (order.outstandingAmount || 0), 0);
    const totalValue = customerOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    return {
      totalPaid,
      totalOutstanding,
      totalValue,
      paymentPercentage: totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0
    };
  };

  // Get customer order status statistics
  const getCustomerOrderStatusStats = (customerId: string) => {
    const customerOrders = getCustomerOrders(customerId);
    const statusCounts = {
      pending: 0,
      accepted: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0
    };
    
    customerOrders.forEach(order => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status as keyof typeof statusCounts]++;
      }
    });
    
    const totalOrders = customerOrders.length;
    const completedOrders = statusCounts.delivered;
    const inProgressOrders = statusCounts.accepted + statusCounts.dispatched;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    
    return {
      ...statusCounts,
      totalOrders,
      completedOrders,
      inProgressOrders,
      completionRate
    };
  };

  const filteredCustomers = customers.filter(customer => {
    if (!customer) return false;
    
    const matchesSearch = (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.phone || '').includes(searchTerm);
    const matchesType = typeFilter === "all" || customer.customerType === typeFilter;
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddCustomer = () => {
    // Basic validation
    if (!newCustomerForm.name.trim() || !newCustomerForm.email.trim() || !newCustomerForm.phone.trim()) {
      console.error('Please fill in required fields: Name, Email, and Phone');
      return;
    }

    // Create new customer
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: newCustomerForm.name.trim(),
      email: newCustomerForm.email.trim(),
      phone: newCustomerForm.phone.trim(),
      address: newCustomerForm.address.trim(),
      city: newCustomerForm.city.trim(),
      state: newCustomerForm.state.trim(),
      pincode: newCustomerForm.pincode.trim(),
      customerType: newCustomerForm.customerType,
      status: "active",
      totalOrders: 0,
      totalValue: 0,
      lastOrderDate: "",
      registrationDate: new Date().toISOString().split('T')[0],
      gstNumber: newCustomerForm.gstNumber.trim() || undefined,
      companyName: newCustomerForm.companyName.trim() || undefined
    };

    // Add to customers array and save to localStorage
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    replaceStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    
    // Reset form and close dialog
    resetForm();
    setShowAddCustomerDialog(false);
    
    console.log(`Customer "${newCustomer.name}" added successfully!`);
  };

  const resetForm = () => {
    setNewCustomerForm({
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
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const businessCustomers = customers.filter(c => c.customerType === "business").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalValue, 0);

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Customer Management" 
        subtitle="Manage customer information and relationships"
      />

      {/* Cleanup Actions */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={removeEmptyCustomers}
          className="text-orange-600 border-orange-300 hover:bg-orange-50"
        >
          🧹 Clean Empty Customers
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{activeCustomers}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-8 h-8 text-production" />
              <div>
                <p className="text-2xl font-bold">{businessCustomers}</p>
                <p className="text-sm text-muted-foreground">Business</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search customers..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Customer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
        
        <Button onClick={() => setShowAddCustomerDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  {customer.companyName && (
                    <p className="text-sm text-muted-foreground mt-1">{customer.companyName}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge className={statusStyles[customer.status]}>
                    {customer.status}
                  </Badge>
                  <Badge variant="outline">
                    {customer.customerType}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-xs">
                    {customer.address}, {customer.city}, {customer.state} - {customer.pincode}
                  </span>
                </div>
              </div>

              {customer.gstNumber && (
                <div className="text-sm">
                  <span className="text-muted-foreground">GST: </span>
                  <span className="font-mono text-xs">{customer.gstNumber}</span>
                </div>
              )}

              {(() => {
                const orderStats = getCustomerOrderStats(customer.id);
                return (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Orders:</span>
                      <p className="font-medium">{orderStats.totalOrders}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Value:</span>
                      <p className="font-medium">₹{orderStats.totalValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Order:</span>
                      <p className="font-medium text-xs">
                        {orderStats.lastOrderDate === 'No orders' 
                          ? 'No orders' 
                          : new Date(orderStats.lastOrderDate).toLocaleDateString()
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Customer Since:</span>
                      <p className="font-medium text-xs">{customer.registrationDate}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Recent Orders */}
              {(() => {
                const orderStats = getCustomerOrderStats(customer.id);
                const recentOrders = orderStats.orders.slice(0, 3); // Show last 3 orders
                
                if (recentOrders.length === 0) {
                  return (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground text-center">No orders yet</p>
                    </div>
                  );
                }

                return (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Orders</h4>
                    <div className="space-y-2">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">₹{order.totalAmount.toLocaleString()}</p>
                            <Badge className={`text-xs ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'dispatched' ? 'bg-orange-100 text-orange-800' :
                              order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewCustomer(customer)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditCustomer(customer)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Orders</DropdownMenuItem>
                    <DropdownMenuItem>Send Email</DropdownMenuItem>
                    <DropdownMenuItem>Export Data</DropdownMenuItem>
                    {customer.status === "active" ? (
                      <DropdownMenuItem className="text-destructive">
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-success">
                        Activate
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No customers found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer details to add them to your customer database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Customer Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Customer Type *</Label>
              <Select 
                value={newCustomerForm.customerType} 
                onValueChange={(value: "individual" | "business") => 
                  setNewCustomerForm({...newCustomerForm, customerType: value})
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
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})}
                    placeholder="Enter customer full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, email: e.target.value})}
                    placeholder="Enter email address (e.g., customer@gmail.com)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})}
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={newCustomerForm.gstNumber}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, gstNumber: e.target.value})}
                    placeholder="Enter GST number (optional)"
                  />
                </div>
              </div>

              {newCustomerForm.customerType === "business" && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={newCustomerForm.companyName}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, companyName: e.target.value})}
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
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({...newCustomerForm, address: e.target.value})}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newCustomerForm.city}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, city: e.target.value})}
                    placeholder="Enter city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newCustomerForm.state}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, state: e.target.value})}
                    placeholder="Enter state"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={newCustomerForm.pincode}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, pincode: e.target.value})}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
            </div>

          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setShowAddCustomerDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomer}
              disabled={!newCustomerForm.name.trim() || !newCustomerForm.email.trim() || !newCustomerForm.phone.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Details - {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription>
              Complete customer information and order history
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6 py-4">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">
                        {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}
                      </span>
                    </div>
                    {selectedCustomer.gstNumber && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">GST: {selectedCustomer.gstNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Customer since: {selectedCustomer.registrationDate}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(() => {
                      const orderStats = getCustomerOrderStats(selectedCustomer.id);
                      const paymentSummary = getCustomerPaymentSummary(selectedCustomer.id);
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Orders:</span>
                            <span className="font-medium">{orderStats.totalOrders}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Value:</span>
                            <span className="font-medium">₹{paymentSummary.totalValue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Paid:</span>
                            <span className="font-medium text-green-600">₹{paymentSummary.totalPaid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Outstanding:</span>
                            <span className="font-medium text-red-600">₹{paymentSummary.totalOutstanding.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment %:</span>
                            <span className="font-medium">{paymentSummary.paymentPercentage}%</span>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Order Status Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const statusStats = getCustomerOrderStatusStats(selectedCustomer.id);
                    return (
                      <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{statusStats.totalOrders}</p>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{statusStats.completedOrders}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">{statusStats.inProgressOrders}</p>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{statusStats.completionRate}%</p>
                            <p className="text-sm text-muted-foreground">Success Rate</p>
                          </div>
                        </div>

                        {/* Detailed Status Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <span className="text-sm">Pending</span>
                            </div>
                            <span className="font-medium">{statusStats.pending}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">Accepted</span>
                            </div>
                            <span className="font-medium">{statusStats.accepted}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="text-sm">Dispatched</span>
                            </div>
                            <span className="font-medium">{statusStats.dispatched}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm">Delivered</span>
                            </div>
                            <span className="font-medium">{statusStats.delivered}</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm">Cancelled</span>
                            </div>
                            <span className="font-medium">{statusStats.cancelled}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const orderStats = getCustomerOrderStats(selectedCustomer.id);
                    const customerOrders = orderStats.orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
                    
                    if (customerOrders.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No orders found for this customer</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {customerOrders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium">{order.orderNumber}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </p>
                                {order.workflowStep && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Workflow: {order.workflowStep}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">₹{order.totalAmount.toLocaleString()}</p>
                                <Badge className={`text-xs ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'dispatched' ? 'bg-orange-100 text-orange-800' :
                                  order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Items:</span>
                                <p className="font-medium">{order.items.length} {order.items.some(item => item.productType === 'raw_material') ? 'items' : 'products'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Paid:</span>
                                <p className="font-medium text-green-600">₹{(order.paidAmount || 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Outstanding:</span>
                                <p className="font-medium text-red-600">₹{(order.outstandingAmount || 0).toLocaleString()}</p>
                              </div>
                            </div>

                            {/* Order Items Details */}
                            <div className="mt-3 pt-3 border-t">
                              <h5 className="text-sm font-medium mb-2">Order Items:</h5>
                              <div className="space-y-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                    <div className="flex-1">
                                      <div className="font-medium">{item.productName}</div>
                                      <div className="text-xs text-gray-600">
                                        {item.productType === 'raw_material' ? 'Raw Material' : 'Finished Product'} • 
                                        Qty: {item.quantity} • 
                                        ₹{item.unitPrice}/unit
                                      </div>
                                      {item.selectedProducts && item.selectedProducts.length > 0 && (
                                        <div className="text-xs text-blue-600 mt-1">
                                          Individual IDs: {item.selectedProducts.map(p => p.qrCode || p.id).join(', ')}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-sm font-medium">
                                      ₹{item.totalPrice.toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Timeline */}
                            {(order.acceptedAt || order.dispatchedAt || order.deliveredAt) && (
                              <div className="mt-3 pt-3 border-t">
                                <h5 className="text-sm font-medium mb-2">Order Timeline:</h5>
                                <div className="space-y-1 text-xs">
                                  {order.acceptedAt && (
                                    <div className="flex justify-between">
                                      <span className="text-blue-600">✓ Accepted</span>
                                      <span className="text-muted-foreground">
                                        {new Date(order.acceptedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {order.dispatchedAt && (
                                    <div className="flex justify-between">
                                      <span className="text-orange-600">✓ Dispatched</span>
                                      <span className="text-muted-foreground">
                                        {new Date(order.dispatchedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {order.deliveredAt && (
                                    <div className="flex justify-between">
                                      <span className="text-green-600">✓ Delivered</span>
                                      <span className="text-muted-foreground">
                                        {new Date(order.deliveredAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Order Items */}
                            <div className="mt-3 pt-3 border-t">
                              <h5 className="text-sm font-medium mb-2">Order Items:</h5>
                              <div className="space-y-1">
                                {order.items.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span>{item.productName} x {item.quantity}</span>
                                    <span>₹{item.totalPrice.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCustomerDetails(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowCustomerDetails(false);
                handleEditCustomer(selectedCustomer!);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditCustomerDialog} onOpenChange={setShowEditCustomerDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer - {editingCustomer?.name}</DialogTitle>
            <DialogDescription>
              Update customer information and details
            </DialogDescription>
          </DialogHeader>
          
          {editingCustomer && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    placeholder="Enter customer name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-customer-type">Customer Type *</Label>
                  <Select 
                    value={editingCustomer.customerType} 
                    onValueChange={(value: "individual" | "business") => 
                      setEditingCustomer({...editingCustomer, customerType: value})
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
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingCustomer.status} 
                    onValueChange={(value: "active" | "inactive") => 
                      setEditingCustomer({...editingCustomer, status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-registration-date">Registration Date</Label>
                  <Input
                    id="edit-registration-date"
                    type="date"
                    value={editingCustomer.registrationDate}
                    onChange={(e) => setEditingCustomer({...editingCustomer, registrationDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={editingCustomer.city}
                    onChange={(e) => setEditingCustomer({...editingCustomer, city: e.target.value})}
                    placeholder="Enter city"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    value={editingCustomer.state}
                    onChange={(e) => setEditingCustomer({...editingCustomer, state: e.target.value})}
                    placeholder="Enter state"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-pincode">Pincode</Label>
                  <Input
                    id="edit-pincode"
                    value={editingCustomer.pincode}
                    onChange={(e) => setEditingCustomer({...editingCustomer, pincode: e.target.value})}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company Name</Label>
                  <Input
                    id="edit-company"
                    value={editingCustomer.companyName || ""}
                    onChange={(e) => setEditingCustomer({...editingCustomer, companyName: e.target.value})}
                    placeholder="Enter company name (optional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-gst">GST Number</Label>
                  <Input
                    id="edit-gst"
                    value={editingCustomer.gstNumber || ""}
                    onChange={(e) => setEditingCustomer({...editingCustomer, gstNumber: e.target.value})}
                    placeholder="Enter GST number (optional)"
                  />
                </div>
              </div>

              {/* Order Statistics (Read-only for reference) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-total-orders">Total Orders</Label>
                  <Input
                    id="edit-total-orders"
                    value={editingCustomer.totalOrders}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Auto-calculated"
                  />
                  <p className="text-xs text-muted-foreground">This is automatically calculated from order history</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-total-value">Total Value</Label>
                  <Input
                    id="edit-total-value"
                    value={editingCustomer.totalValue}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Auto-calculated"
                  />
                  <p className="text-xs text-muted-foreground">This is automatically calculated from order history</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditCustomerDialog(false);
                setEditingCustomer(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCustomer}
              disabled={!editingCustomer?.name.trim() || !editingCustomer?.email.trim() || !editingCustomer?.phone.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}