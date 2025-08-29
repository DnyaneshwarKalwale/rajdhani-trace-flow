import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Play, Pause, CheckCircle, Cog, AlertTriangle } from "lucide-react";

interface ProductionStep {
  id: number;
  name: string;
  status: "pending" | "active" | "completed" | "issue";
  progress: number;
  materials: { name: string; required: number; used: number; unit: string }[];
  expectedOutput: number;
  actualOutput?: number;
  waste?: number;
}

interface ProductionBatch {
  id: string;
  batchNumber: string;
  productName: string;
  quantity: number;
  status: "planning" | "active" | "paused" | "completed" | "issue";
  currentStep: number;
  totalSteps: number;
  progress: number;
  startDate: string;
  expectedCompletion: string;
  steps: ProductionStep[];
}

const productionBatches: ProductionBatch[] = [
  {
    id: "1",
    batchNumber: "PROD-2024-046",
    productName: "Red Premium Carpet 4x6ft",
    quantity: 100,
    status: "active",
    currentStep: 2,
    totalSteps: 3,
    progress: 65,
    startDate: "2024-01-15",
    expectedCompletion: "2024-01-20",
    steps: [
      {
        id: 1,
        name: "Punching (Weaving)",
        status: "completed",
        progress: 100,
        materials: [
          { name: "Cotton Yarn", required: 10, used: 10, unit: "rolls" },
          { name: "Backing Cloth", required: 50, used: 48, unit: "sqm" }
        ],
        expectedOutput: 100,
        actualOutput: 98,
        waste: 2
      },
      {
        id: 2,
        name: "Dyeing Process",
        status: "active",
        progress: 75,
        materials: [
          { name: "Red Dye", required: 15, used: 12, unit: "liters" }
        ],
        expectedOutput: 98,
        actualOutput: 95
      },
      {
        id: 3,
        name: "Cutting & Finishing",
        status: "pending",
        progress: 0,
        materials: [
          { name: "Latex Solution", required: 10, used: 0, unit: "liters" }
        ],
        expectedOutput: 95
      }
    ]
  },
  {
    id: "2",
    batchNumber: "PROD-2024-047",
    productName: "Blue Standard Carpet 6x8ft",
    quantity: 150,
    status: "planning",
    currentStep: 1,
    totalSteps: 3,
    progress: 15,
    startDate: "2024-01-17",
    expectedCompletion: "2024-01-25",
    steps: [
      {
        id: 1,
        name: "Punching (Weaving)",
        status: "active",
        progress: 45,
        materials: [
          { name: "Cotton Yarn", required: 15, used: 7, unit: "rolls" },
          { name: "Backing Cloth", required: 75, used: 30, unit: "sqm" }
        ],
        expectedOutput: 150,
        actualOutput: 68
      },
      {
        id: 2,
        name: "Dyeing Process",
        status: "pending",
        progress: 0,
        materials: [
          { name: "Blue Dye", required: 20, used: 0, unit: "liters" }
        ],
        expectedOutput: 150
      },
      {
        id: 3,
        name: "Cutting & Finishing",
        status: "pending",
        progress: 0,
        materials: [
          { name: "Latex Solution", required: 15, used: 0, unit: "liters" }
        ],
        expectedOutput: 150
      }
    ]
  }
];

const statusStyles = {
  planning: "bg-muted text-muted-foreground",
  active: "bg-production text-production-foreground",
  paused: "bg-warning text-warning-foreground",
  completed: "bg-success text-success-foreground",
  issue: "bg-destructive text-destructive-foreground"
};

const stepStatusStyles = {
  pending: "bg-muted text-muted-foreground",
  active: "bg-primary text-primary-foreground",
  completed: "bg-success text-success-foreground",
  issue: "bg-destructive text-destructive-foreground"
};

export default function Production() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Production Management" 
        subtitle="Monitor step-by-step production process and track efficiency"
      />

      <Tabs defaultValue="active" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="active">Active Batches</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Production Batch
          </Button>
        </div>

        <TabsContent value="active" className="space-y-6">
          {/* Production Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                <Cog className="h-4 w-4 text-production" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">
                  3 completing today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">
                  Above target (90%)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Output</CardTitle>
                <Cog className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">847</div>
                <p className="text-xs text-muted-foreground">
                  pieces completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">2</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Production Batches */}
          <div className="space-y-6">
            {productionBatches.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {batch.productName}
                        <Badge className={statusStyles[batch.status]}>
                          {batch.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {batch.batchNumber} • Quantity: {batch.quantity} pieces
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Play className="w-3 h-3 mr-1" />
                        Control
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium">{batch.progress}%</span>
                    </div>
                    <Progress value={batch.progress} className="h-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Started: {batch.startDate}</span>
                      <span>Expected: {batch.expectedCompletion}</span>
                    </div>
                  </div>

                  {/* Production Steps */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Production Steps</h4>
                    {batch.steps.map((step) => (
                      <div key={step.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                              {step.id}
                            </div>
                            <div>
                              <h5 className="font-medium text-foreground">{step.name}</h5>
                              <Badge className={stepStatusStyles[step.status]}>
                                {step.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{step.progress}%</div>
                            <div className="text-xs text-muted-foreground">
                              {step.actualOutput ? `${step.actualOutput}/` : ""}{step.expectedOutput} pcs
                            </div>
                          </div>
                        </div>

                        <Progress value={step.progress} className="h-2" />

                        {/* Materials Used */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {step.materials.map((material, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="font-medium text-foreground">{material.name}</div>
                              <div className="text-muted-foreground">
                                {material.used}/{material.required} {material.unit}
                              </div>
                            </div>
                          ))}
                        </div>

                        {step.waste && (
                          <div className="text-xs text-warning">
                            Waste: {step.waste} pieces ({((step.waste / step.expectedOutput) * 100).toFixed(1)}%)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}