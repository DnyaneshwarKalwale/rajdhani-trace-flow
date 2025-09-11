import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Clock, Construction, BarChart3, AlertTriangle, QrCode } from 'lucide-react';

export default function Inventory() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory System</h1>
          <p className="text-muted-foreground">
            Track products with unique IDs and manage stock levels
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Coming Soon
        </Badge>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Construction className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Inventory System Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground max-w-md mx-auto">
            We're developing a comprehensive inventory management system with unique product tracking, 
            stock level monitoring, and real-time inventory updates.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 border rounded-lg bg-muted/50">
              <Package className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Product Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track individual products with unique QR codes and IDs
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <AlertTriangle className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Stock Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Automated low stock notifications and reorder alerts
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Inventory Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Real-time inventory reports and stock movement tracking
              </p>
          </div>
        </div>

          <div className="pt-6">
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Clock className="w-4 h-4 mr-2" />
              Inventory System Coming Soon
            </Button>
          </div>
              </CardContent>
            </Card>

      {/* Current System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Current Inventory Status
            </CardTitle>
              </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">System Status:</span>
              <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                In Development
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected Release:</span>
              <span className="font-medium">Q2 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Features Planned:</span>
              <span className="font-medium">15+ Features</span>
            </div>
              </CardContent>
            </Card>

            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Planned Features
            </CardTitle>
              </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled>
              <Package className="w-4 h-4 mr-2" />
              Product Tracking
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Stock Alerts
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <BarChart3 className="w-4 h-4 mr-2" />
              Inventory Reports
            </Button>
              </CardContent>
            </Card>
          </div>

      {/* Feature Preview */}
          <Card>
            <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory System Features Preview
          </CardTitle>
            </CardHeader>
            <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <p className="text-sm text-muted-foreground mt-1">Total Items</p>
                          </div>
            <div className="text-center p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <p className="text-sm text-muted-foreground mt-1">Low Stock Alerts</p>
                          </div>
            <div className="text-center p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <p className="text-sm text-muted-foreground mt-1">Finished Goods</p>
                          </div>
            <div className="text-center p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <p className="text-sm text-muted-foreground mt-1">Raw Materials</p>
                          </div>
              </div>
            </CardContent>
          </Card>
    </div>
  );
}