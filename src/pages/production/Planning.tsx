import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, Package, AlertTriangle, Play, Pause, CheckCircle } from "lucide-react";

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
  materials: { name: string; required: number; available: number }[];
}

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
    totalSteps: 3,
    materials: [
      { name: "Cotton Yarn", required: 50, available: 500 },
      { name: "Red Dye", required: 15, available: 50 },
      { name: "Backing Cloth", required: 80, available: 200 }
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
    totalSteps: 3,
    materials: [
      { name: "Cotton Yarn", required: 40, available: 500 },
      { name: "Blue Dye", required: 12, available: 45 },
      { name: "Backing Cloth", required: 65, available: 200 }
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
    totalSteps: 3,
    materials: [
      { name: "Wool", required: 35, available: 100 },
      { name: "Green Dye", required: 10, available: 25 },
      { name: "Silk Backing", required: 40, available: 80 }
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
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  const filteredBatches = productionBatches.filter(batch => {
    if (filter === "all") return true;
    return batch.status === filter;
  });

  const sortedBatches = [...filteredBatches].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (sortBy === "date") {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    }
    return 0;
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProgress = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  const hasInsufficientMaterials = (materials: { name: string; required: number; available: number }[]) => {
    return materials.some(material => material.required > material.available);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Production Planning" 
        subtitle="Schedule and manage production batches"
      />

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="date">Scheduled Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>
          <Package className="w-4 h-4 mr-2" />
          New Batch
        </Button>
      </div>

      {/* Planning Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {productionBatches.filter(b => b.status === "scheduled").length}
                </p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Play className="w-8 h-8 text-production" />
              <div>
                <p className="text-2xl font-bold">
                  {productionBatches.filter(b => b.status === "in-progress").length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Pause className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">
                  {productionBatches.filter(b => b.status === "paused").length}
                </p>
                <p className="text-sm text-muted-foreground">Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {productionBatches.filter(b => b.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Batches */}
      <div className="space-y-4">
        {sortedBatches.map((batch) => (
          <Card key={batch.id} className={hasInsufficientMaterials(batch.materials) ? "border-warning" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {batch.productName}
                    <Badge className={priorityStyles[batch.priority]}>
                      {batch.priority.toUpperCase()}
                    </Badge>
                    <Badge className={statusStyles[batch.status]}>
                      {batch.status.replace("-", " ").toUpperCase()}
                    </Badge>
                    {hasInsufficientMaterials(batch.materials) && (
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Batch: {batch.batchNumber} • Quantity: {batch.quantity} pcs
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {batch.status === "scheduled" && (
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  )}
                  {batch.status === "in-progress" && (
                    <Button size="sm" variant="outline">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    Step {batch.currentStep} of {batch.totalSteps}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-production h-2 rounded-full transition-all"
                    style={{ width: `${getProgress(batch.currentStep, batch.totalSteps)}%` }}
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Scheduled:</span>
                    <p className="font-medium">{batch.scheduledDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{formatDuration(batch.estimatedDuration)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Workers:</span>
                    <p className="font-medium">{batch.assignedWorkers.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <p className="font-medium">{batch.quantity} pcs</p>
                  </div>
                </div>
              </div>

              {/* Assigned Workers */}
              <div>
                <span className="text-sm text-muted-foreground">Assigned Workers:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {batch.assignedWorkers.map((worker) => (
                    <Badge key={worker} variant="outline" className="text-xs">
                      {worker}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Materials Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Materials</span>
                  {hasInsufficientMaterials(batch.materials) && (
                    <Badge variant="destructive" className="text-xs">
                      Insufficient Stock
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {batch.materials.map((material) => {
                    const isInsufficient = material.required > material.available;
                    return (
                      <div 
                        key={material.name}
                        className={`p-2 rounded border text-xs ${
                          isInsufficient ? 'border-destructive bg-destructive/5' : 'border-border'
                        }`}
                      >
                        <div className="font-medium">{material.name}</div>
                        <div className="text-muted-foreground">
                          Need: {material.required} | Available: {material.available}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedBatches.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No production batches found</h3>
            <p className="text-muted-foreground">Create a new batch to start production planning</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}