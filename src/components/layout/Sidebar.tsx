import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Cog, 
  Factory, 
  BarChart3,
  Settings,
  Users,
  AlertTriangle,
  Home
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-primary"
  },
  {
    title: "Order Management",
    icon: ShoppingCart,
    href: "/orders",
    color: "text-orders"
  },
  {
    title: "Inventory System",
    icon: Package,
    href: "/inventory",
    color: "text-inventory"
  },
  {
    title: "Production",
    icon: Cog,
    href: "/production",
    color: "text-production"
  },
  {
    title: "Raw Materials",
    icon: Factory,
    href: "/materials",
    color: "text-materials"
  },
  {
    title: "Products",
    icon: Package,
    href: "/products",
    color: "text-products"
  },
  {
    title: "Manage Stock",
    icon: AlertTriangle,
    href: "/manage-stock",
    color: "text-warning"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    color: "text-accent"
  },
  {
    title: "Customers",
    icon: Users,
    href: "/customers",
    color: "text-muted-foreground"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-muted-foreground"
  }
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={cn("flex h-full w-64 flex-col bg-card border-r", className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
            <Factory className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Rajdhani Carpet</h1>
            <p className="text-sm text-muted-foreground">ERP System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 text-left",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15",
                  !isActive && "hover:bg-muted"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : item.color)} />
                <span className="font-medium">{item.title}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}