import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, TrendingDown, Package, AlertTriangle, Recycle } from "lucide-react";

interface RawMaterial {
  id: string;
  name: string;
  brand: string;
  category: string;
  currentStock: number;
  unit: string;
  minThreshold: number;
  maxCapacity: number;
  lastRestocked: string;
  dailyUsage: number;
  status: "sufficient" | "low" | "critical" | "out-of-stock";
  supplier: string;
  costPerUnit: number;
}

const rawMaterials: RawMaterial[] = [
  {
    id: "1",
    name: "Cotton Yarn (Premium)",
    brand: "TextilePro",
    category: "Base Materials",
    currentStock: 45,
    unit: "rolls",
    minThreshold: 100,
    maxCapacity: 500,
    lastRestocked: "2024-01-10",
    dailyUsage: 8,
    status: "low",
    supplier: "Gujarat Textiles Ltd",
    costPerUnit: 450
  },
  {
    id: "2",
    name: "Red Dye (Industrial)",
    brand: "ColorMax",
    category: "Dyes & Chemicals",
    currentStock: 85,
    unit: "liters",
    minThreshold: 50,
    maxCapacity: 200,
    lastRestocked: "2024-01-12",
    dailyUsage: 3,
    status: "sufficient",
    supplier: "Chemical Works India",
    costPerUnit: 180
  },
  {
    id: "3",
    name: "Latex Solution",
    brand: "FlexiChem",
    category: "Finishing Materials",
    currentStock: 0,
    unit: "liters",
    minThreshold: 50,
    maxCapacity: 150,
    lastRestocked: "2024-01-05",
    dailyUsage: 5,
    status: "out-of-stock",
    supplier: "Industrial Chemicals Co",
    costPerUnit: 320
  },
  {
    id: "4",
    name: "Backing Cloth",
    brand: "SupportFabric",
    category: "Base Materials",
    currentStock: 150,
    unit: "sqm",
    minThreshold: 100,
    maxCapacity: 1000,
    lastRestocked: "2024-01-14",
    dailyUsage: 12,
    status: "sufficient",
    supplier: "Fabric Solutions Ltd",
    costPerUnit: 25
  }
];

const statusStyles = {
  sufficient: "bg-success text-success-foreground",
  low: "bg-warning text-warning-foreground",
  critical: "bg-destructive text-destructive-foreground",
  "out-of-stock": "bg-destructive text-destructive-foreground"
};

export default function Materials() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Raw Materials Management" 
        subtitle="Track material consumption, manage inventory and optimize procurement"
      />

      <Tabs defaultValue="inventory" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="inventory">Material Inventory</TabsTrigger>
            <TabsTrigger value="consumption">Usage Analytics</TabsTrigger>
            <TabsTrigger value="procurement">Procurement</TabsTrigger>
            <TabsTrigger value="waste">Waste Management</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search materials..." className="pl-10 w-64" />
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>
        </div>

        <TabsContent value="inventory" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
                <Package className="h-4 w-4 text-materials" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  Different material types
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">12</div>
                <p className="text-xs text-muted-foreground">
                  Need reordering
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Consumption</CardTitle>
                <TrendingDown className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹45,680</div>
                <p className="text-xs text-muted-foreground">
                  Material cost today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waste Recovery</CardTitle>
                <Recycle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15.2%</div>
                <p className="text-xs text-muted-foreground">
                  Materials recycled
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Materials Table */}
          <Card>
            <CardHeader>
              <CardTitle>Material Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-muted-foreground">Material</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Current Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Usage Rate</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Supplier</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Cost/Unit</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawMaterials.map((material) => {
                      const daysRemaining = Math.floor(material.currentStock / material.dailyUsage);
                      const stockPercent = (material.currentStock / material.maxCapacity) * 100;
                      
                      return (
                        <tr key={material.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-foreground">{material.name}</div>
                              <div className="text-sm text-muted-foreground">{material.brand}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{material.category}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="font-medium text-foreground">
                                {material.currentStock} {material.unit}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {stockPercent.toFixed(1)}% of capacity
                              </div>
                              <div className="w-24 bg-muted rounded-full h-1.5">
                                <div 
                                  className="h-1.5 rounded-full bg-primary" 
                                  style={{ width: `${Math.min(stockPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {material.dailyUsage} {material.unit}/day
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {material.currentStock > 0 ? `${daysRemaining} days left` : "Out of stock"}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={statusStyles[material.status]}>
                              {material.status.replace("-", " ")}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-foreground">{material.supplier}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-foreground">
                              ₹{material.costPerUnit}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                variant={material.status === "out-of-stock" || material.status === "critical" ? "default" : "outline"} 
                                size="sm"
                              >
                                {material.status === "out-of-stock" || material.status === "critical" ? "Order Now" : "Restock"}
                              </Button>
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waste" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="w-5 h-5 text-success" />
                Waste Management & Recycling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Recycle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Waste Tracking System</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Track production waste, identify recycling opportunities, and optimize material usage to reduce environmental impact and costs.
                </p>
                <Button className="mt-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Waste
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}