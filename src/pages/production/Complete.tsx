import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Package, Recycle, AlertTriangle, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompletedItem {
  id: string;
  uniqueId: string;
  dimensions: string;
  grade: "A" | "B" | "C";
  notes: string;
}

interface WasteItem {
  id: string;
  materialName: string;
  wasteQuantity: number;
  unit: string;
  wasteType: "recyclable" | "non-recyclable";
  notes: string;
}

interface BatchToComplete {
  id: string;
  batchNumber: string;
  productName: string;
  currentStep: number;
  totalSteps: number;
  expectedOutput: number;
  materials: { name: string; used: number; unit: string }[];
}

const batchToComplete: BatchToComplete = {
  id: "1",
  batchNumber: "PB-2024-002",
  productName: "Blue Standard Carpet 6x8ft",
  currentStep: 3,
  totalSteps: 3,
  expectedOutput: 75,
  materials: [
    { name: "Cotton Yarn", used: 40, unit: "kg" },
    { name: "Blue Dye", used: 12, unit: "liters" },
    { name: "Backing Cloth", used: 65, unit: "sqm" },
    { name: "Latex Solution", used: 8, unit: "liters" }
  ]
};

export default function Complete() {
  const { toast } = useToast();
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([]);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [completionNotes, setCompletionNotes] = useState("");
  const [qualityCheck, setQualityCheck] = useState({
    inspector: "",
    overallGrade: "A" as "A" | "B" | "C",
    defects: "",
    recommendations: ""
  });

  const addCompletedItem = () => {
    const newItem: CompletedItem = {
      id: Date.now().toString(),
      uniqueId: `BC-2024-${String(completedItems.length + 1).padStart(3, '0')}`,
      dimensions: "6x8ft",
      grade: "A",
      notes: ""
    };
    setCompletedItems([...completedItems, newItem]);
  };

  const updateCompletedItem = (id: string, field: keyof CompletedItem, value: any) => {
    setCompletedItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeCompletedItem = (id: string) => {
    setCompletedItems(items => items.filter(item => item.id !== id));
  };

  const addWasteItem = () => {
    const newWaste: WasteItem = {
      id: Date.now().toString(),
      materialName: "",
      wasteQuantity: 0,
      unit: "kg",
      wasteType: "recyclable",
      notes: ""
    };
    setWasteItems([...wasteItems, newWaste]);
  };

  const updateWasteItem = (id: string, field: keyof WasteItem, value: any) => {
    setWasteItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeWasteItem = (id: string) => {
    setWasteItems(items => items.filter(item => item.id !== id));
  };

  const getGradeDistribution = () => {
    const gradeA = completedItems.filter(item => item.grade === "A").length;
    const gradeB = completedItems.filter(item => item.grade === "B").length;
    const gradeC = completedItems.filter(item => item.grade === "C").length;
    return { gradeA, gradeB, gradeC };
  };

  const calculateEfficiency = () => {
    if (batchToComplete.expectedOutput === 0) return 0;
    return Math.round((completedItems.length / batchToComplete.expectedOutput) * 100);
  };

  const handleComplete = () => {
    if (completedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one completed item",
        variant: "destructive"
      });
      return;
    }

    if (!qualityCheck.inspector) {
      toast({
        title: "Error", 
        description: "Please assign a quality inspector",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Production batch completed successfully!",
    });
  };

  const { gradeA, gradeB, gradeC } = getGradeDistribution();
  const efficiency = calculateEfficiency();

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Complete Production Batch" 
        subtitle="Record completed items and manage waste materials"
      />

      {/* Batch Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Package className="w-5 h-5" />
            {batchToComplete.productName}
            <Badge className="bg-success text-success-foreground">
              Step {batchToComplete.currentStep}/{batchToComplete.totalSteps} - Final
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Batch Number:</span>
              <p className="font-medium">{batchToComplete.batchNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Expected Output:</span>
              <p className="font-medium">{batchToComplete.expectedOutput} pcs</p>
            </div>
            <div>
              <span className="text-muted-foreground">Actual Output:</span>
              <p className="font-medium">{completedItems.length} pcs</p>
            </div>
            <div>
              <span className="text-muted-foreground">Efficiency:</span>
              <p className={`font-medium ${efficiency >= 90 ? 'text-success' : efficiency >= 75 ? 'text-warning' : 'text-destructive'}`}>
                {efficiency}%
              </p>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Materials Used:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {batchToComplete.materials.map((material) => (
                <Badge key={material.name} variant="outline" className="text-xs">
                  {material.name}: {material.used} {material.unit}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completed Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Completed Items</CardTitle>
              <Button onClick={addCompletedItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedItems.map((item) => (
                <div key={item.id} className="grid grid-cols-5 gap-4 items-end p-4 border rounded-lg">
                  <div>
                    <Label>Unique ID</Label>
                    <Input 
                      value={item.uniqueId}
                      onChange={(e) => updateCompletedItem(item.id, 'uniqueId', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Dimensions</Label>
                    <Input 
                      value={item.dimensions}
                      onChange={(e) => updateCompletedItem(item.id, 'dimensions', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <Select 
                      value={item.grade} 
                      onValueChange={(value: "A" | "B" | "C") => updateCompletedItem(item.id, 'grade', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Grade A</SelectItem>
                        <SelectItem value="B">Grade B</SelectItem>
                        <SelectItem value="C">Grade C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input 
                      value={item.notes}
                      onChange={(e) => updateCompletedItem(item.id, 'notes', e.target.value)}
                      placeholder="Quality notes..."
                    />
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeCompletedItem(item.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Waste Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Recycle className="w-5 h-5" />
                Waste Management
              </CardTitle>
              <Button onClick={addWasteItem} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Waste
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {wasteItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No waste items recorded. Add waste materials to track recycling.
                </p>
              ) : (
                wasteItems.map((waste) => (
                  <div key={waste.id} className="grid grid-cols-6 gap-4 items-end p-4 border rounded-lg">
                    <div>
                      <Label>Material</Label>
                      <Select 
                        value={waste.materialName} 
                        onValueChange={(value) => updateWasteItem(waste.id, 'materialName', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cotton Yarn">Cotton Yarn</SelectItem>
                          <SelectItem value="Backing Cloth">Backing Cloth</SelectItem>
                          <SelectItem value="Dye">Dye</SelectItem>
                          <SelectItem value="Latex">Latex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input 
                        type="number"
                        value={waste.wasteQuantity}
                        onChange={(e) => updateWasteItem(waste.id, 'wasteQuantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Select 
                        value={waste.unit} 
                        onValueChange={(value) => updateWasteItem(waste.id, 'unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="liters">liters</SelectItem>
                          <SelectItem value="sqm">sqm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={waste.wasteType} 
                        onValueChange={(value: "recyclable" | "non-recyclable") => updateWasteItem(waste.id, 'wasteType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recyclable">Recyclable</SelectItem>
                          <SelectItem value="non-recyclable">Non-recyclable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Input 
                        value={waste.notes}
                        onChange={(e) => updateWasteItem(waste.id, 'notes', e.target.value)}
                        placeholder="Waste notes..."
                      />
                    </div>
                    <div>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeWasteItem(waste.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quality Check */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inspector">Quality Inspector</Label>
                  <Input 
                    id="inspector"
                    value={qualityCheck.inspector}
                    onChange={(e) => setQualityCheck(prev => ({ ...prev, inspector: e.target.value }))}
                    placeholder="Inspector name"
                  />
                </div>
                <div>
                  <Label htmlFor="overallGrade">Overall Grade</Label>
                  <Select 
                    value={qualityCheck.overallGrade} 
                    onValueChange={(value: "A" | "B" | "C") => setQualityCheck(prev => ({ ...prev, overallGrade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A</SelectItem>
                      <SelectItem value="B">Grade B</SelectItem>
                      <SelectItem value="C">Grade C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="defects">Defects Found</Label>
                <Textarea 
                  id="defects"
                  value={qualityCheck.defects}
                  onChange={(e) => setQualityCheck(prev => ({ ...prev, defects: e.target.value }))}
                  placeholder="Describe any defects or quality issues..."
                />
              </div>
              
              <div>
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea 
                  id="recommendations"
                  value={qualityCheck.recommendations}
                  onChange={(e) => setQualityCheck(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Quality improvement recommendations..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completion Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Expected Output:</span>
                  <span className="font-medium">{batchToComplete.expectedOutput} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual Output:</span>
                  <span className="font-medium">{completedItems.length} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className={`font-medium ${efficiency >= 90 ? 'text-success' : efficiency >= 75 ? 'text-warning' : 'text-destructive'}`}>
                    {efficiency}%
                  </span>
                </div>
              </div>

              {efficiency < 75 && (
                <div className="flex items-center gap-2 p-2 bg-warning/10 rounded">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm text-warning">Low efficiency detected</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quality Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Grade A:</span>
                  <span className="font-medium text-success">{gradeA} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span>Grade B:</span>
                  <span className="font-medium text-warning">{gradeB} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span>Grade C:</span>
                  <span className="font-medium text-destructive">{gradeC} pcs</span>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-3">
                <div className="flex h-3 rounded-full overflow-hidden">
                  {completedItems.length > 0 && (
                    <>
                      <div 
                        className="bg-success"
                        style={{ width: `${(gradeA / completedItems.length) * 100}%` }}
                      />
                      <div 
                        className="bg-warning"
                        style={{ width: `${(gradeB / completedItems.length) * 100}%` }}
                      />
                      <div 
                        className="bg-destructive"
                        style={{ width: `${(gradeC / completedItems.length) * 100}%` }}
                      />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Waste Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Waste Items:</span>
                  <span className="font-medium">{wasteItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recyclable:</span>
                  <span className="font-medium text-success">
                    {wasteItems.filter(w => w.wasteType === "recyclable").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Non-recyclable:</span>
                  <span className="font-medium text-destructive">
                    {wasteItems.filter(w => w.wasteType === "non-recyclable").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="completionNotes">Completion Notes</Label>
            <Textarea 
              id="completionNotes"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Additional notes about the batch completion..."
              className="mt-2"
            />
          </div>

          <Button onClick={handleComplete} className="w-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Batch
          </Button>
        </div>
      </div>
    </div>
  );
}