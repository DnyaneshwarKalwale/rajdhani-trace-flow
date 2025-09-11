import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  STORAGE_KEYS, 
  getFromStorage, 
  saveToStorage, 
  updateStorage, 
  generateUniqueId
} from '@/lib/storage';
import { 
  Package, 
  ShoppingCart, 
  Factory, 
  Truck, 
  Plus, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const RealTimeDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setOrders(getFromStorage(STORAGE_KEYS.ORDERS));
    setProducts(getFromStorage(STORAGE_KEYS.INDIVIDUAL_PRODUCTS));
    setMaterials(getFromStorage(STORAGE_KEYS.RAW_MATERIALS));
    setLastUpdate(new Date().toLocaleTimeString());
  };









  // Calculate statistics
  const stats = {
    totalOrders: (orders || []).length,
    pendingOrders: (orders || []).filter(o => o?.status === 'pending').length,
    confirmedOrders: (orders || []).filter(o => o?.status === 'confirmed').length,
    totalProducts: (products || []).length,
    availableProducts: (products || []).filter(p => p?.status === 'available').length,
    soldProducts: (products || []).filter(p => p?.status === 'sold').length,
    totalMaterials: (materials || []).length,
    lowStockMaterials: (materials || []).filter(m => m?.status === 'low-stock').length,
    outOfStockMaterials: (materials || []).filter(m => m?.status === 'out-of-stock').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">
            Data from localStorage - Last updated: {lastUpdate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{stats.pendingOrders} Pending</Badge>
              <Badge variant="default">{stats.confirmedOrders} Confirmed</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{stats.availableProducts} Available</Badge>
              <Badge variant="secondary">{stats.soldProducts} Sold</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Raw Materials</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{stats.lowStockMaterials} Low Stock</Badge>
              <Badge variant="destructive">{stats.outOfStockMaterials} Out of Stock</Badge>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Dashboard Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Click "Refresh Data" to update statistics with latest data from localStorage.
          </p>
        </CardContent>
      </Card>

      {/* Recent Data */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(orders || []).slice(-5).map((order) => (
                <div key={order?.id || 'unknown'} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">Order {order?.id?.slice(-6) || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      ₹{order?.totalAmount || 0} • {order?.status || 'Unknown'}
                    </div>
                  </div>
                  <Badge variant={order?.status === 'confirmed' ? 'default' : 'outline'}>
                    {order?.status || 'Unknown'}
                  </Badge>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No orders yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(products || []).slice(-5).map((product) => (
                <div key={product?.id || 'unknown'} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">Product {product?.id?.slice(-6) || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      {product?.qualityGrade || 'N/A'} • {product?.status || 'Unknown'}
                    </div>
                  </div>
                  <Badge variant={product?.status === 'available' ? 'default' : 'secondary'}>
                    {product?.status || 'Unknown'}
                  </Badge>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No products yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">Dashboard system active</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Last update: {lastUpdate}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm">
              {stats.lowStockMaterials + stats.outOfStockMaterials} materials need attention
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
