import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Construction, Bell, ShoppingCart } from 'lucide-react';

export default function LowStocks() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and manage low stock levels with automated alerts
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
          <CardTitle className="text-2xl">Low Stock Management Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground max-w-md mx-auto">
            We're developing an intelligent low stock monitoring system with automated alerts, 
            reorder suggestions, and inventory optimization features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 border rounded-lg bg-muted/50">
              <Bell className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Smart Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Automated notifications when stock levels fall below threshold
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Reorder Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent reorder recommendations based on usage patterns
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <AlertTriangle className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Critical Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Priority alerts for critical stock shortages
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Button disabled className="opacity-50 cursor-not-allowed">
              <Clock className="w-4 h-4 mr-2" />
              Low Stock Management Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Current Status
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
              <span className="text-muted-foreground">Alert Types:</span>
              <span className="font-medium">5+ Alert Types</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Planned Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled>
              <Bell className="w-4 h-4 mr-2" />
              Smart Alerts
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Reorder Suggestions
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Critical Alerts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}