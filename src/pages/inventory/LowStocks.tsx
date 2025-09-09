import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search, ShoppingCart, Package, Plus, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LowStockItem {
  id: string;
  name: string;
  category: "finished_goods" | "raw_materials";
  currentStock: number;
  minimumStock: number;
  unit: string;
  lastRestocked: string;
  supplier?: string;
  averageUsage: number;
  daysToStockout: number;
  urgencyLevel: "critical" | "warning" | "low";
}

const lowStockItems: LowStockItem[] = [
  {
    id: "1",
    name: "Red Premium Carpet 4x6ft",
    category: "finished_goods",
    currentStock: 5,
    minimumStock: 20,
    unit: "pcs",
    lastRestocked: "2024-01-10",
    averageUsage: 2.5,
    daysToStockout: 2,
    urgencyLevel: "critical"
  },
  {
    id: "2",
    name: "Cotton Yarn - Grade A",
    category: "raw_materials",
    currentStock: 25,
    minimumStock: 100,
    unit: "kg",
    lastRestocked: "2024-01-12",
    supplier: "Textile Suppliers Ltd",
    averageUsage: 8,
    daysToStockout: 3,
    urgencyLevel: "critical"
  },
  {
    id: "3",
    name: "Blue Standard Carpet 6x8ft",
    category: "finished_goods",
    currentStock: 12,
    minimumStock: 25,
    unit: "pcs",
    lastRestocked: "2024-01-08",
    averageUsage: 1.5,
    daysToStockout: 8,
    urgencyLevel: "warning"
  },
  {
    id: "4",
    name: "Red Dye Concentrate",
    category: "raw_materials",
    currentStock: 15,
    minimumStock: 50,
    unit: "liters",
    lastRestocked: "2024-01-05",
    supplier: "Chemical Corp",
    averageUsage: 3,
    daysToStockout: 5,
    urgencyLevel: "warning"
  },
  {
    id: "5",
    name: "Backing Cloth - Heavy Duty",
    category: "raw_materials",
    currentStock: 80,
    minimumStock: 150,
    unit: "sqm",
    lastRestocked: "2024-01-14",
    supplier: "Fabric Manufacturers",
    averageUsage: 12,
    daysToStockout: 7,
    urgencyLevel: "low"
  }
];

const urgencyStyles = {
  critical: "bg-destructive text-destructive-foreground",
  warning: "bg-warning text-warning-foreground",
  low: "bg-secondary text-secondary-foreground"
};

const urgencyIcons = {
  critical: "🔴",
  warning: "🟡",
  low: "🟢"
};

export default function LowStocks() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const filteredItems = lowStockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesUrgency = urgencyFilter === "all" || item.urgencyLevel === urgencyFilter;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const handleReorder = (item: LowStockItem) => {
    toast({
      title: "Reorder Initiated",
      description: `Reorder request created for ${item.name}`,
    });
  };



  const getStockPercentage = (current: number, minimum: number) => {
    return Math.round((current / minimum) * 100);
  };

  const criticalCount = lowStockItems.filter(item => item.urgencyLevel === "critical").length;
  const warningCount = lowStockItems.filter(item => item.urgencyLevel === "warning").length;

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Low Stock Alert" 
        subtitle="Monitor and manage items below minimum stock levels"
      />

      {/* Alert Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-warning">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <TrendingDown className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">{warningCount}</p>
                <p className="text-sm text-muted-foreground">Warning</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
                <p className="text-sm text-muted-foreground">Total Low Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <ShoppingCart className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">₹2.5L</p>
                <p className="text-sm text-muted-foreground">Reorder Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search items..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="finished_goods">Finished Goods</SelectItem>
            <SelectItem value="raw_materials">Raw Materials</SelectItem>
          </SelectContent>
        </Select>

        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Low Stock Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`${item.urgencyLevel === 'critical' ? 'border-destructive' : item.urgencyLevel === 'warning' ? 'border-warning' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <Badge className={urgencyStyles[item.urgencyLevel]}>
                      {urgencyIcons[item.urgencyLevel]} {item.urgencyLevel.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {item.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Stock:</span>
                      <p className="font-medium text-lg">
                        {item.currentStock} {item.unit}
                      </p>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            getStockPercentage(item.currentStock, item.minimumStock) <= 25 
                              ? 'bg-destructive' 
                              : getStockPercentage(item.currentStock, item.minimumStock) <= 50 
                              ? 'bg-warning' 
                              : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(getStockPercentage(item.currentStock, item.minimumStock), 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Minimum Stock:</span>
                      <p className="font-medium">{item.minimumStock} {item.unit}</p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Days to Stockout:</span>
                      <p className={`font-medium ${item.daysToStockout <= 3 ? 'text-destructive' : item.daysToStockout <= 7 ? 'text-warning' : 'text-success'}`}>
                        {item.daysToStockout} days
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Avg. Usage:</span>
                      <p className="font-medium">{item.averageUsage} {item.unit}/day</p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Last Restocked:</span>
                      <p className="font-medium">{item.lastRestocked}</p>
                    </div>
                  </div>
                  
                  {item.supplier && (
                    <div className="mt-2">
                      <span className="text-sm text-muted-foreground">Supplier: </span>
                      <span className="text-sm font-medium">{item.supplier}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-6">
                  <Button size="sm" onClick={() => handleReorder(item)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Reorder
                  </Button>

                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No low stock items found</h3>
            <p className="text-muted-foreground">All items are above minimum stock levels or don't match your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}