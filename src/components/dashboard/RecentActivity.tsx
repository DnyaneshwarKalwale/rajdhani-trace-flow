import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

interface Activity {
  id: string;
  type: "order" | "production" | "inventory" | "material";
  title: string;
  description: string;
  time: string;
  status: "completed" | "in-progress" | "alert" | "pending";
  user?: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    description: "Order #ORD-2024-001 - Red Carpet 4x6ft (Qty: 50)",
    time: "2 minutes ago",
    status: "pending",
    user: "Customer Portal"
  },
  {
    id: "2",
    type: "production",
    title: "Production Completed",
    description: "Batch #PROD-2024-045 - Blue Carpet completed (98/100 pieces)",
    time: "15 minutes ago",
    status: "completed",
    user: "Production Team"
  },
  {
    id: "3",
    type: "inventory",
    title: "Low Stock Alert",
    description: "Cotton Yarn inventory below threshold (45 rolls remaining)",
    time: "1 hour ago",
    status: "alert",
    user: "System"
  },
  {
    id: "4",
    type: "material",
    title: "Material Received",
    description: "Red Dye - 50 liters added to inventory",
    time: "2 hours ago",
    status: "completed",
    user: "Warehouse Team"
  },
  {
    id: "5",
    type: "production",
    title: "Production Started",
    description: "Batch #PROD-2024-046 - Green Carpet production initiated",
    time: "3 hours ago",
    status: "in-progress",
    user: "Production Team"
  }
];

const statusColors = {
  completed: "bg-success text-success-foreground",
  "in-progress": "bg-warning text-warning-foreground",
  alert: "bg-destructive text-destructive-foreground",
  pending: "bg-muted text-muted-foreground"
};

const typeColors = {
  order: "text-orders",
  production: "text-production",
  inventory: "text-inventory",
  material: "text-materials"
};

export function RecentActivity() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/avatars/${activity.type}.png`} />
              <AvatarFallback className={typeColors[activity.type]}>
                {activity.type.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                <Badge className={statusColors[activity.status]}>
                  {activity.status.replace("-", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{activity.user}</span>
                <span>{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}