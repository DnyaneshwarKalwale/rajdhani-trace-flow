import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Eye, Edit, MoreHorizontal, Phone, Mail, MapPin, ShoppingBag } from "lucide-react";
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

const customers: Customer[] = [
  {
    id: "1",
    name: "Rajesh Sharma",
    email: "rajesh@sharma.com",
    phone: "+91 9876543210",
    address: "123 MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    customerType: "business",
    status: "active",
    totalOrders: 15,
    totalValue: 375000,
    lastOrderDate: "2024-01-15",
    registrationDate: "2023-06-15",
    gstNumber: "27AAAAA0000A1Z5",
    companyName: "Sharma Enterprises"
  },
  {
    id: "2",
    name: "Priya Patel",
    email: "priya.patel@royal.com",
    phone: "+91 9876543211",
    address: "456 CP Road",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    customerType: "business",
    status: "active",
    totalOrders: 8,
    totalValue: 220000,
    lastOrderDate: "2024-01-12",
    registrationDate: "2023-08-20",
    gstNumber: "07BBBBB1111B2Z6",
    companyName: "Royal Interiors"
  },
  {
    id: "3",
    name: "Amit Kumar",
    email: "amit.kumar@personal.com",
    phone: "+91 9876543212",
    address: "789 Brigade Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    customerType: "individual",
    status: "active",
    totalOrders: 3,
    totalValue: 45000,
    lastOrderDate: "2024-01-10",
    registrationDate: "2023-12-01"
  },
  {
    id: "4",
    name: "Sunita Desai",
    email: "sunita@modern.com",
    phone: "+91 9876543213",
    address: "321 FC Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    customerType: "business",
    status: "inactive",
    totalOrders: 12,
    totalValue: 290000,
    lastOrderDate: "2023-11-25",
    registrationDate: "2023-03-10",
    gstNumber: "27CCCCC2222C3Z7",
    companyName: "Modern Living Co."
  }
];

const statusStyles = {
  active: "bg-success text-success-foreground",
  inactive: "bg-muted text-muted-foreground"
};

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesType = typeFilter === "all" || customer.customerType === typeFilter;
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
        
        <Button>
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

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Orders:</span>
                  <p className="font-medium">{customer.totalOrders}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Value:</span>
                  <p className="font-medium">₹{customer.totalValue.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Order:</span>
                  <p className="font-medium text-xs">{customer.lastOrderDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer Since:</span>
                  <p className="font-medium text-xs">{customer.registrationDate}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
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
    </div>
  );
}