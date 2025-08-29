import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, Clock, Target } from "lucide-react";

const analyticsData = {
  revenue: {
    current: 2450000,
    previous: 2100000,
    growth: 16.7
  },
  orders: {
    current: 156,
    previous: 142,
    growth: 9.9
  },
  customers: {
    current: 89,
    previous: 76,
    growth: 17.1
  },
  production: {
    current: 1850,
    previous: 1650,
    growth: 12.1
  }
};

const topProducts = [
  { name: "Red Premium Carpet 4x6ft", revenue: 675000, orders: 45, growth: 23.5 },
  { name: "Blue Standard Carpet 6x8ft", revenue: 520000, orders: 32, growth: 15.2 },
  { name: "Green Luxury Carpet 5x7ft", revenue: 485000, orders: 28, growth: 8.7 },
  { name: "Beige Classic Rug 3x5ft", revenue: 290000, orders: 22, growth: -5.3 },
  { name: "Multi-color Runner 2x8ft", revenue: 180000, orders: 18, growth: 12.8 }
];

const topCustomers = [
  { name: "Sharma Enterprises", revenue: 375000, orders: 15, type: "Business" },
  { name: "Royal Interiors", revenue: 290000, orders: 12, type: "Business" },
  { name: "Modern Living Co.", revenue: 220000, orders: 8, type: "Business" },
  { name: "Elite Furnishings", revenue: 185000, orders: 7, type: "Business" },
  { name: "Priya Patel", revenue: 95000, orders: 6, type: "Individual" }
];

const monthlyData = [
  { month: "Jan", revenue: 1850000, orders: 125, production: 1400 },
  { month: "Feb", revenue: 2100000, orders: 142, production: 1650 },
  { month: "Mar", revenue: 2450000, orders: 156, production: 1850 },
];

const productionMetrics = {
  efficiency: 94.5,
  wasteReduction: 8.2,
  qualityScore: 96.8,
  onTimeDelivery: 92.3
};

export default function Analytics() {
  const formatGrowth = (growth: number) => {
    const isPositive = growth > 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="text-sm font-medium">{Math.abs(growth).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex justify-between items-start">
        <Header 
          title="Business Analytics" 
          subtitle="Comprehensive insights into your carpet manufacturing business"
        />
        
        <div className="flex gap-4">
          <Select defaultValue="thisMonth">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="thisQuarter">This Quarter</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{(analyticsData.revenue.current / 100000).toFixed(1)}L</p>
                {formatGrowth(analyticsData.revenue.growth)}
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{analyticsData.orders.current}</p>
                {formatGrowth(analyticsData.orders.growth)}
              </div>
              <ShoppingCart className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{analyticsData.customers.current}</p>
                {formatGrowth(analyticsData.customers.growth)}
              </div>
              <Users className="w-8 h-8 text-production" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Production Output</p>
                <p className="text-2xl font-bold">{analyticsData.production.current}</p>
                {formatGrowth(analyticsData.production.growth)}
              </div>
              <Package className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Production Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{productionMetrics.efficiency}%</div>
              <p className="text-sm text-muted-foreground">Overall Efficiency</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-production">{productionMetrics.qualityScore}%</div>
              <p className="text-sm text-muted-foreground">Quality Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">{productionMetrics.onTimeDelivery}%</div>
              <p className="text-sm text-muted-foreground">On-Time Delivery</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive">{productionMetrics.wasteReduction}%</div>
              <p className="text-sm text-muted-foreground">Waste Reduction</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>₹{(product.revenue / 100000).toFixed(1)}L revenue</span>
                      <span>{product.orders} orders</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      #{index + 1}
                    </Badge>
                    {formatGrowth(product.growth)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{customer.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>₹{(customer.revenue / 100000).toFixed(1)}L revenue</span>
                      <span>{customer.orders} orders</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={customer.type === "Business" ? "default" : "outline"}
                      className="mb-1"
                    >
                      {customer.type}
                    </Badge>
                    <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {monthlyData.map((month, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{month.month}</div>
                  <p className="text-sm text-muted-foreground">Month</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-success">
                    ₹{(month.revenue / 100000).toFixed(1)}L
                  </div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-production">{month.orders}</div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-warning">{month.production}</div>
                  <p className="text-sm text-muted-foreground">Production</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <h4 className="font-medium text-success mb-2">Strong Performance</h4>
              <ul className="text-sm space-y-1">
                <li>• Revenue growth of 16.7% this month</li>
                <li>• Production efficiency at 94.5%</li>
                <li>• Quality score maintaining at 96.8%</li>
              </ul>
            </div>
            
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <h4 className="font-medium text-warning mb-2">Areas for Improvement</h4>
              <ul className="text-sm space-y-1">
                <li>• On-time delivery at 92.3% (target: 95%)</li>
                <li>• Beige Classic Rug showing -5.3% growth</li>
                <li>• Consider expanding popular product lines</li>
              </ul>
            </div>
            
            <div className="p-4 bg-production/10 rounded-lg border border-production/20">
              <h4 className="font-medium text-production mb-2">Growth Opportunities</h4>
              <ul className="text-sm space-y-1">
                <li>• Red Premium Carpet showing 23.5% growth</li>
                <li>• 17.1% increase in customer acquisition</li>
                <li>• Potential for premium product expansion</li>
              </ul>
            </div>
            
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <h4 className="font-medium text-destructive mb-2">Action Items</h4>
              <ul className="text-sm space-y-1">
                <li>• Investigate delivery delays and optimize logistics</li>
                <li>• Review pricing strategy for declining products</li>
                <li>• Implement waste reduction initiatives</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}