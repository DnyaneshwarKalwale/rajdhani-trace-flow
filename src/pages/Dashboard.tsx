import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ProductionOverview } from "@/components/dashboard/ProductionOverview";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { RealTimeDashboard } from "@/components/dashboard/RealTimeDashboard";
import { 
  Package, 
  ShoppingCart, 
  Factory, 
  Users,
  DollarSign,
  AlertTriangle
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Dashboard" 
        subtitle="Real-time overview of your carpet manufacturing operations"
      />
      
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Active Orders"
          value="127"
          description="12 new today"
          icon={ShoppingCart}
          trend={{ value: 12, isPositive: true }}
          color="text-orders"
        />
        <StatsCard
          title="Products in Stock"
          value="2,847"
          description="8 low stock alerts"
          icon={Package}
          trend={{ value: -5, isPositive: false }}
          color="text-inventory"
        />

        <StatsCard
          title="Raw Materials"
          value="1,245"
          description="5 need reordering"
          icon={Factory}
          trend={{ value: -12, isPositive: false }}
          color="text-materials"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Monthly Revenue"
          value="₹12.5L"
          description="vs last month"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
          color="text-success"
        />
        <StatsCard
          title="Customer Orders"
          value="847"
          description="this month"
          icon={Users}
          trend={{ value: 23, isPositive: true }}
          color="text-primary"
        />

        <StatsCard
          title="Urgent Alerts"
          value="8"
          description="require attention"
          icon={AlertTriangle}
          trend={{ value: -25, isPositive: true }}
          color="text-warning"
        />
      </div>

      {/* Main Content Grid - Fixed Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <RecentActivity />
        </div>
        <div className="lg:col-span-8">
          <ProductionOverview />
        </div>
      </div>

      {/* Real-Time Dashboard Section */}
      <div className="w-full">
        <RealTimeDashboard />
      </div>

      {/* Bottom Section - Full Width */}
      <div className="w-full">
        <InventoryAlerts />
      </div>
    </div>
  );
}