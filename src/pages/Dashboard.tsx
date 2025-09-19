import { useState, useEffect } from "react";
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
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CustomerService,
  OrderService,
  ProductService,
  RawMaterialService,
  ProductionService
} from "@/services";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all statistics from Supabase
      const [
        orderStats,
        productStats,
        materialStats,
        customerStats,
        productionStats
      ] = await Promise.all([
        OrderService.getOrderStats(),
        ProductService.getProductStats(),
        RawMaterialService.getInventoryStats(),
        CustomerService.getCustomerStats(),
        ProductionService.getProductionStats()
      ]);

      setStats({
        orders: orderStats,
        products: productStats,
        materials: materialStats,
        customers: customerStats,
        production: productionStats
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Using local storage fallback.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Header
          title="Dashboard"
          subtitle="Loading real-time overview..."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <Header
          title="Dashboard"
          subtitle="Real-time overview of your operations"
        />
        <Button
          onClick={fetchDashboardData}
          variant="outline"
          size="sm"
          className="gap-2 w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sm:hidden">Refresh Data</span>
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Key Metrics - Mobile responsive grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Active Orders"
          value={stats?.orders?.total || 0}
          description={`${stats?.orders?.pending || 0} pending orders`}
          icon={ShoppingCart}
          trend={{
            value: stats?.orders?.delivered ? Math.round((stats.orders.delivered / stats.orders.total) * 100) : 0,
            isPositive: true
          }}
          color="text-orders"
        />
        <StatsCard
          title="Available Products"
          value={stats?.products?.availableUnits || 0}
          description={`${stats?.products?.lowStock || 0} low stock alerts`}
          icon={Package}
          trend={{
            value: stats?.products?.lowStock || 0,
            isPositive: (stats?.products?.lowStock || 0) === 0
          }}
          color="text-inventory"
        />

        <StatsCard
          title="Raw Materials"
          value={stats?.materials?.totalMaterials || 0}
          description={`${stats?.materials?.lowStock || 0} need reordering`}
          icon={Factory}
          trend={{
            value: stats?.materials?.outOfStock || 0,
            isPositive: (stats?.materials?.outOfStock || 0) === 0
          }}
          color="text-materials"
        />
      </div>

      {/* Secondary Metrics - Mobile responsive grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Monthly Revenue"
          value={`₹${((stats?.orders?.totalRevenue || 0) / 100000).toFixed(1)}L`}
          description="from completed orders"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
          color="text-success"
        />
        <StatsCard
          title="Total Customers"
          value={stats?.customers?.total || 0}
          description={`${stats?.customers?.active || 0} active customers`}
          icon={Users}
          trend={{
            value: stats?.customers?.active ? Math.round((stats.customers.active / stats.customers.total) * 100) : 0,
            isPositive: true
          }}
          color="text-primary"
        />

        <StatsCard
          title="Production Efficiency"
          value={`${stats?.production?.efficiency || 0}%`}
          description={`${stats?.production?.inProgress || 0} batches in progress`}
          icon={TrendingUp}
          trend={{
            value: stats?.production?.efficiency || 0,
            isPositive: (stats?.production?.efficiency || 0) >= 80
          }}
          color="text-production"
        />
      </div>

      {/* Main Content Grid - Mobile responsive layout */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <RecentActivity />
        </div>
        <div className="xl:col-span-7">
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