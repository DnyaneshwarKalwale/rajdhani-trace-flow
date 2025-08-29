import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Eye, QrCode, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InventoryItem {
  id: string;
  productName: string;
  category: "finished-goods" | "raw-materials";
  totalQuantity: number;
  availableQuantity: number;
  unit: string;
  minThreshold: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
  uniqueIds?: string[];
}

const inventoryItems: InventoryItem[] = [
  {
    id: "1",
    productName: "Red Premium Carpet 4x6ft",
    category: "finished-goods",
    totalQuantity: 125,
    availableQuantity: 87,
    unit: "pieces",
    minThreshold: 20,
    status: "in-stock",
    lastUpdated: "2024-01-16",
    uniqueIds: ["RC-2024-001", "RC-2024-002", "RC-2024-003"]
  },
  {
    id: "2",
    productName: "Cotton Yarn (Premium)",
    category: "raw-materials",
    totalQuantity: 45,
    availableQuantity: 45,
    unit: "rolls",
    minThreshold: 100,
    status: "low-stock",
    lastUpdated: "2024-01-15"
  },
  {
    id: "3",
    productName: "Blue Standard Carpet 6x8ft",
    category: "finished-goods",
    totalQuantity: 67,
    availableQuantity: 45,
    unit: "pieces",
    minThreshold: 25,
    status: "in-stock",
    lastUpdated: "2024-01-16",
    uniqueIds: ["BC-2024-015", "BC-2024-016", "BC-2024-017"]
  },
  {
    id: "4",
    productName: "Latex Solution",
    category: "raw-materials",
    totalQuantity: 0,
    availableQuantity: 0,
    unit: "liters",
    minThreshold: 50,
    status: "out-of-stock",
    lastUpdated: "2024-01-14"
  }
];

const statusStyles = {
  "in-stock": "bg-success text-success-foreground",
  "low-stock": "bg-warning text-warning-foreground",
  "out-of-stock": "bg-destructive text-destructive-foreground"
};

export default function Inventory() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Inventory System" 
        subtitle="Track products with unique IDs and manage stock levels"
      />

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="finished-goods">Finished Goods</TabsTrigger>
            <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search inventory..." className="pl-10 w-64" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <Package className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">8</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Finished Goods</CardTitle>
                <Package className="h-4 w-4 text-inventory" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">847</div>
                <p className="text-xs text-muted-foreground">
                  Ready for sale
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Raw Materials</CardTitle>
                <Package className="h-4 w-4 text-materials" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">400</div>
                <p className="text-xs text-muted-foreground">
                  Production ready
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Available</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Unique IDs</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">Updated: {item.lastUpdated}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {item.category.replace("-", " ")}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-foreground">
                            {item.totalQuantity} {item.unit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Min: {item.minThreshold} {item.unit}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-foreground">
                            {item.availableQuantity} {item.unit}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={statusStyles[item.status]}>
                            {item.status.replace("-", " ")}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {item.uniqueIds ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {item.uniqueIds.length} IDs tracked
                              </div>
                              <Button variant="outline" size="sm">
                                <QrCode className="w-3 h-3 mr-1" />
                                View IDs
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Bulk tracking
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Update
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}