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
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

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
    icon: Factory,
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
  },
  {
    title: "Data Initializer",
    icon: Settings,
    href: "/data-initializer",
    color: "text-green-600"
  }
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "flex h-full flex-col bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className={cn("border-b", isCollapsed ? "p-2" : "p-6")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-primary">Rajdhani Carpet</h1>
                <p className="text-sm text-muted-foreground">ERP System</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-2", isCollapsed ? "p-2" : "p-4")}>
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full h-12 text-left",
                  isCollapsed ? "justify-center px-0" : "justify-start",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/15",
                  !isActive && "hover:bg-muted"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5", 
                  isActive ? "text-primary" : item.color,
                  !isCollapsed && "mr-3"
                )} />
                {!isCollapsed && (
                  <span className="font-medium">{item.title}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("border-t", isCollapsed ? "p-2" : "p-4")}>
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground text-center">
            Version 1.0.0
          </div>
        )}
      </div>
    </div>
  );
}