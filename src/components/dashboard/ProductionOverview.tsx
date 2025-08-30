import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cog, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductionBatch {
  id: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  progress: number;
  status: "on-track" | "delayed" | "completed" | "issue";
  expectedCompletion: string;
}

const productionBatches: ProductionBatch[] = [
  {
    id: "1",
    productName: "Red Premium Carpet",
    batchNumber: "PROD-2024-046",
    quantity: 100,
    currentStep: 2,
    totalSteps: 3,
    stepName: "Dyeing Process",
    progress: 75,
    status: "on-track",
    expectedCompletion: "Today 4:30 PM"
  },
  {
    id: "2",
    productName: "Blue Standard Carpet",
    batchNumber: "PROD-2024-047",
    quantity: 150,
    currentStep: 1,
    totalSteps: 3,
    stepName: "Punching (Weaving)",
    progress: 45,
    status: "delayed",
    expectedCompletion: "Tomorrow 10:00 AM"
  },
  {
    id: "3",
    productName: "Green Luxury Carpet",
    batchNumber: "PROD-2024-048",
    quantity: 75,
    currentStep: 3,
    totalSteps: 3,
    stepName: "Cutting & Finishing",
    progress: 90,
    status: "on-track",
    expectedCompletion: "Today 6:00 PM"
  }
];

const statusStyles = {
  "on-track": "bg-success text-success-foreground",
  "delayed": "bg-warning text-warning-foreground",
  "completed": "bg-primary text-primary-foreground",
  "issue": "bg-destructive text-destructive-foreground"
};

export function ProductionOverview() {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/production");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cog className="w-5 h-5 text-production" />
          Production Overview
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleViewAll}
          className="hover:bg-production/10 hover:text-production"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {productionBatches.map((batch) => (
            <div key={batch.id} className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{batch.productName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {batch.batchNumber} • Qty: {batch.quantity}
                  </p>
                </div>
                <Badge className={statusStyles[batch.status]}>
                  {batch.status.replace("-", " ")}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Step {batch.currentStep}/{batch.totalSteps}: {batch.stepName}
                  </span>
                  <span className="font-medium">{batch.progress}%</span>
                </div>
                <Progress value={batch.progress} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Expected: {batch.expectedCompletion}</span>
                <div className="flex items-center gap-1">
                  {batch.status === "on-track" && <CheckCircle className="w-3 h-3 text-success" />}
                  {batch.status === "delayed" && <AlertTriangle className="w-3 h-3 text-warning" />}
                  {batch.status === "issue" && <AlertTriangle className="w-3 h-3 text-destructive" />}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {productionBatches.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Cog className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active production batches</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}