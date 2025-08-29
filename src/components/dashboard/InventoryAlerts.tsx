import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, TrendingDown, ShoppingCart } from "lucide-react";

interface InventoryAlert {
  id: string;
  productName: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  severity: "low" | "critical" | "out-of-stock";
  category: "finished-goods" | "raw-materials";
  uniqueIds?: string[];
}

const inventoryAlerts: InventoryAlert[] = [
  {
    id: "1",
    productName: "Cotton Yarn (Premium)",
    currentStock: 45,
    minThreshold: 100,
    unit: "rolls",
    severity: "low",
    category: "raw-materials"
  },
  {
    id: "2",
    productName: "Red Carpet 4x6ft",
    currentStock: 8,
    minThreshold: 20,
    unit: "pieces",
    severity: "critical",
    category: "finished-goods",
    uniqueIds: ["RC-2024-001", "RC-2024-002", "RC-2024-003"]
  },
  {
    id: "3",
    productName: "Latex Solution",
    currentStock: 0,
    minThreshold: 50,
    unit: "liters",
    severity: "out-of-stock",
    category: "raw-materials"
  },
  {
    id: "4",
    productName: "Blue Carpet 6x8ft",
    currentStock: 12,
    minThreshold: 25,
    unit: "pieces",
    severity: "low",
    category: "finished-goods",
    uniqueIds: ["BC-2024-015", "BC-2024-016"]
  }
];

const severityStyles = {
  "low": "bg-warning text-warning-foreground",
  "critical": "bg-destructive text-destructive-foreground",
  "out-of-stock": "bg-destructive text-destructive-foreground"
};

const categoryIcons = {
  "finished-goods": Package,
  "raw-materials": ShoppingCart
};

export function InventoryAlerts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Inventory Alerts
        </CardTitle>
        <Button variant="outline" size="sm">
          Manage Stock
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {inventoryAlerts.map((alert) => {
          const Icon = categoryIcons[alert.category];
          return (
            <div key={alert.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-foreground">{alert.productName}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {alert.category.replace("-", " ")}
                    </p>
                  </div>
                </div>
                <Badge className={severityStyles[alert.severity]}>
                  {alert.severity.replace("-", " ")}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span className="text-muted-foreground">
                    Current: <span className="font-medium text-foreground">{alert.currentStock} {alert.unit}</span>
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Min: {alert.minThreshold} {alert.unit}
                </span>
              </div>
              
              {alert.uniqueIds && (
                <div className="text-xs text-muted-foreground">
                  Available IDs: {alert.uniqueIds.slice(0, 3).join(", ")}
                  {alert.uniqueIds.length > 3 && ` +${alert.uniqueIds.length - 3} more`}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  {alert.category === "raw-materials" ? "Order Material" : "Start Production"}
                </Button>
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}