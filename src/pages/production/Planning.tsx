import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, Package, AlertTriangle, Play, Pause, CheckCircle, Factory, TrendingUp, Target, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductionBatch {
  id: string;
  batchNumber: string;
  productName: string;
  quantity: number;
  priority: "low" | "normal" | "high" | "urgent";
  status: "scheduled" | "in-progress" | "paused" | "completed";
  scheduledDate: string;
  estimatedDuration: number;
  assignedWorkers: string[];
  currentStep: number;
  totalSteps: number;
  materials: { name: string; required: number; available: number; unit: string }[];
  location: string;
  totalCost: number;
  expectedCompletion: string;
}

// Enhanced production batches with more realistic data
const productionBatches: ProductionBatch[] = [
  {
    id: "1",
    batchNumber: "PB-2024-001",
    productName: "Red Premium Carpet 4x6ft",
    quantity: 100,
    priority: "urgent",
    status: "scheduled",
    scheduledDate: "2024-01-20",
    estimatedDuration: 1080,
    assignedWorkers: ["John Doe", "Jane Smith"],
    currentStep: 0,
    totalSteps: 5,
    location: "Factory Floor 1",
    totalCost: 45000,
    expectedCompletion: "2024-01-25",
    materials: [
      { name: "Cotton Yarn (Premium)", required: 80, available: 500, unit: "rolls" },
      { name: "Red Dye (Industrial)", required: 30, available: 85, unit: "liters" },
      { name: "Backing Cloth", required: 120, available: 300, unit: "sqm" }
    ]
  },
  {
    id: "2",
    batchNumber: "PB-2024-002",
    productName: "Blue Standard Carpet 6x8ft",
    quantity: 75,
    priority: "high",
    status: "in-progress",
    scheduledDate: "2024-01-18",
    estimatedDuration: 960,
    assignedWorkers: ["Mike Johnson", "Sarah Wilson"],
    currentStep: 2,
    totalSteps: 5,
    location: "Factory Floor 2",
    totalCost: 32000,
    expectedCompletion: "2024-01-22",
    materials: [
      { name: "Synthetic Yarn", required: 60, available: 300, unit: "rolls" },
      { name: "Blue Dye (Industrial)", required: 25, available: 92, unit: "liters" },
      { name: "Backing Cloth", required: 90, available: 300, unit: "sqm" }
    ]
  },
  {
    id: "3",
    batchNumber: "PB-2024-003",
    productName: "Green Luxury Carpet 5x7ft",
    quantity: 50,
    priority: "normal",
    status: "scheduled",
    scheduledDate: "2024-01-22",
    estimatedDuration: 840,
    assignedWorkers: ["Tom Brown"],
    currentStep: 0,
    totalSteps: 5,
    location: "Factory Floor 1",
    totalCost: 28000,
    expectedCompletion: "2024-01-26",
    materials: [
      { name: "Wool Yarn (Premium)", required: 40, available: 150, unit: "rolls" },
      { name: "Green Dye (Industrial)", required: 20, available: 0, unit: "liters" },
      { name: "Premium Backing Cloth", required: 60, available: 150, unit: "sqm" }
    ]
  },
  {
    id: "4",
    batchNumber: "PB-2024-004",
    productName: "Traditional Persian Carpet 8x10ft",
    quantity: 25,
    priority: "high",
    status: "scheduled",
    scheduledDate: "2024-01-24",
    estimatedDuration: 1200,
    assignedWorkers: ["Ahmed Khan", "Priya Sharma"],
    currentStep: 0,
    totalSteps: 5,
    location: "Factory Floor 3",
    totalCost: 75000,
    expectedCompletion: "2024-01-30",
    materials: [
      { name: "Wool Yarn (Premium)", required: 30, available: 150, unit: "rolls" },
      { name: "Red Dye (Industrial)", required: 15, available: 85, unit: "liters" },
      { name: "Premium Backing Cloth", required: 40, available: 150, unit: "sqm" }
    ]
  }
];

const priorityStyles = {
  urgent: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  normal: "bg-secondary text-secondary-foreground",
  low: "bg-muted text-muted-foreground"
};

const statusStyles = {
  scheduled: "bg-secondary text-secondary-foreground",
  "in-progress": "bg-production text-production-foreground",
  paused: "bg-warning text-warning-foreground",
  completed: "bg-success text-success-foreground"
};

export default function Planning() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBatches = productionBatches.filter(batch => {
    const matchesFilter = filter === "all" || batch.status === filter;
    const matchesSearch = batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedBatches = [...filteredBatches].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case "date":
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      case "quantity":
        return b.quantity - a.quantity;
      case "cost":
        return b.totalCost - a.totalCost;
      default:
        return 0;
    }
  });

  const scheduledBatches = productionBatches.filter(b => b.status === "scheduled");
  const inProgressBatches = productionBatches.filter(b => b.status === "in-progress");
  const completedBatches = productionBatches.filter(b => b.status === "completed");

  const totalValue = productionBatches.reduce((sum, b) => sum + b.totalCost, 0);
  const averageDuration = productionBatches.reduce((sum, b) => sum + b.estimatedDuration, 0) / productionBatches.length;

  const batchesWithMaterialIssues = productionBatches.filter(batch => 
    batch.materials.some(material => material.required > material.available)
  );

  const handleStartProduction = (batch: ProductionBatch) => {
    // Navigate to production detail page
    navigate(`/production-detail/${batch.id}`, { 
      state: { 
        product: {
          id: batch.id,
          batchNumber: batch.batchNumber,
          productName: batch.productName,
          quantity: batch.quantity,
          status: "active",
          currentStep: 1,
          totalSteps: batch.totalSteps,
          progress: 0,
          startDate: new Date().toISOString().split('T')[0],
          expectedCompletion: batch.expectedCompletion,
          location: batch.location,
          notes: `Started from planning - ${batch.batchNumber}`,
          totalCost: batch.totalCost,
          sellingPrice: batch.totalCost * 1.5, // Estimate selling price
          priority: batch.priority,
          steps: []
        }
      }
    });
  };

  const handleViewDetails = (batch: ProductionBatch) => {
    // Navigate to production detail page
    navigate(`/production-detail/${batch.id}`, { 
      state: { 
        product: {
          id: batch.id,
          batchNumber: batch.batchNumber,
          productName: batch.productName,
          quantity: batch.quantity,
          status: batch.status === "scheduled" ? "planning" : batch.status,
          currentStep: batch.currentStep,
          totalSteps: batch.totalSteps,
          progress: (batch.currentStep / batch.totalSteps) * 100,
          startDate: batch.scheduledDate,
          expectedCompletion: batch.expectedCompletion,
          location: batch.location,
          notes: `Planned batch - ${batch.batchNumber}`,
          totalCost: batch.totalCost,
          sellingPrice: batch.totalCost * 1.5,
          priority: batch.priority,
          steps: []
        }
      }
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Production Planning" 
        subtitle="Schedule and manage production batches with material availability and resource allocation"
      />

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{scheduledBatches.length}</div>
            <p className="text-xs text-muted-foreground">
              Waiting to start
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Factory className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{inProgressBatches.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">₹{totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Planned production
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{Math.round(averageDuration / 60)}h</div>
            <p className="text-xs text-muted-foreground">
              Per batch
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Material Issues Alert */}
      {batchesWithMaterialIssues.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-medium text-red-900">Material Availability Issues</h3>
                <p className="text-sm text-red-700">
                  {batchesWithMaterialIssues.length} batches have insufficient materials. Please purchase additional materials before starting production.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/materials')}>
                View Materials
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by product name or batch number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="priority">Sort by Priority</option>
                <option value="date">Sort by Date</option>
                <option value="quantity">Sort by Quantity</option>
                <option value="cost">Sort by Cost</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Batches */}
      <div className="space-y-4">
        {sortedBatches.map((batch) => {
          const hasMaterialIssues = batch.materials.some(material => material.required > material.available);
          
          return (
            <Card key={batch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{batch.productName}</h3>
                      <Badge className={priorityStyles[batch.priority]}>
                        {batch.priority}
                      </Badge>
                      <Badge className={statusStyles[batch.status]}>
                        {batch.status.replace("-", " ")}
                      </Badge>
                      {hasMaterialIssues && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Material Issues
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Batch Number</div>
                        <div className="font-medium">{batch.batchNumber}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Quantity</div>
                        <div className="font-medium">{batch.quantity} pieces</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Location</div>
                        <div className="font-medium">{batch.location}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Cost</div>
                        <div className="font-medium">₹{batch.totalCost.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Scheduled Date</div>
                        <div className="font-medium">{new Date(batch.scheduledDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Expected Completion</div>
                        <div className="font-medium">{new Date(batch.expectedCompletion).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium">{Math.round(batch.estimatedDuration / 60)} hours</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="font-medium">{batch.currentStep}/{batch.totalSteps} steps</div>
                      </div>
                    </div>

                    {/* Material Requirements */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Material Requirements</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {batch.materials.map((material, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="text-sm font-medium">{material.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {material.required} {material.unit} required
                              </div>
                            </div>
                            <Badge variant={material.required > material.available ? "destructive" : "default"}>
                              {material.available} available
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Workers */}
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Assigned Workers</div>
                      <div className="flex flex-wrap gap-2">
                        {batch.assignedWorkers.map((worker, index) => (
                          <Badge key={index} variant="outline">
                            <Users className="w-3 h-3 mr-1" />
                            {worker}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {batch.status === "scheduled" && (
                      <Button 
                        onClick={() => handleStartProduction(batch)}
                        disabled={hasMaterialIssues}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Production
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewDetails(batch)}
                      className="w-full"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedBatches.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Production Batches</h3>
          <p className="text-muted-foreground">No batches match your current filters</p>
        </Card>
      )}
    </div>
  );
}