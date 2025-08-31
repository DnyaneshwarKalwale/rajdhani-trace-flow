import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Package, Recycle, AlertTriangle, Plus, Minus, Factory, TrendingUp, Target, BarChart3, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CompletedItem {
  id: string;
  uniqueId: string;
  qrCode: string;
  dimensions: string;
  weight: string;
  thickness: string;
  pileHeight: string;
  grade: "A+" | "A" | "B" | "C";
  status: "available" | "damaged" | "sold";
  notes: string;
  inspector: string;
  inspectionDate: string;
}

interface WasteItem {
  id: string;
  materialName: string;
  wasteQuantity: number;
  unit: string;
  wasteType: "recyclable" | "non-recyclable";
  notes: string;
  estimatedValue: number;
}

interface BatchToComplete {
  id: string;
  batchNumber: string;
  productName: string;
  currentStep: number;
  totalSteps: number;
  expectedOutput: number;
  materials: { name: string; used: number; unit: string; cost: number }[];
  location: string;
  startDate: string;
  expectedCompletion: string;
}

// Enhanced batch data
const batchToComplete: BatchToComplete = {
  id: "1",
  batchNumber: "PB-2024-002",
  productName: "Blue Standard Carpet 6x8ft",
  currentStep: 5,
  totalSteps: 5,
  expectedOutput: 75,
  location: "Factory Floor 2",
  startDate: "2024-01-18",
  expectedCompletion: "2024-01-22",
  materials: [
    { name: "Synthetic Yarn", used: 60, unit: "rolls", cost: 22800 },
    { name: "Blue Dye (Industrial)", used: 25, unit: "liters", cost: 4750 },
    { name: "Backing Cloth", used: 90, unit: "sqm", cost: 2250 },
    { name: "Latex Solution", used: 30, unit: "liters", cost: 9600 }
  ]
};

export default function Complete() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([]);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [completionNotes, setCompletionNotes] = useState("");
  const [qualityCheck, setQualityCheck] = useState({
    inspector: "",
    overallGrade: "A" as "A+" | "A" | "B" | "C",
    defects: "",
    recommendations: ""
  });

  // Initialize with expected output
  useState(() => {
    const initialItems: CompletedItem[] = [];
    for (let i = 1; i <= batchToComplete.expectedOutput; i++) {
      initialItems.push({
        id: `item-${i}`,
        uniqueId: `BC-2024-${String(i).padStart(3, '0')}`,
        qrCode: `QR-${batchToComplete.batchNumber}-${String(i).padStart(3, '0')}`,
        dimensions: "6x8ft",
        weight: "45kg",
        thickness: "12mm",
        pileHeight: "8mm",
        grade: "A",
        status: "available",
        notes: "",
        inspector: "",
        inspectionDate: new Date().toISOString().split('T')[0]
      });
    }
    setCompletedItems(initialItems);
  });

  const addCompletedItem = () => {
    const newItem: CompletedItem = {
      id: Date.now().toString(),
      uniqueId: `BC-2024-${String(completedItems.length + 1).padStart(3, '0')}`,
      qrCode: `QR-${batchToComplete.batchNumber}-${String(completedItems.length + 1).padStart(3, '0')}`,
      dimensions: "6x8ft",
      weight: "45kg",
      thickness: "12mm",
      pileHeight: "8mm",
      grade: "A",
      status: "available",
      notes: "",
      inspector: "",
      inspectionDate: new Date().toISOString().split('T')[0]
    };
    setCompletedItems([...completedItems, newItem]);
  };

  const updateCompletedItem = (id: string, field: keyof CompletedItem, value: any) => {
    setCompletedItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeCompletedItem = (id: string) => {
    if (completedItems.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one completed item must be recorded",
        variant: "destructive"
      });
      return;
    }
    setCompletedItems(items => items.filter(item => item.id !== id));
  };

  const addWasteItem = () => {
    const newWaste: WasteItem = {
      id: Date.now().toString(),
      materialName: "",
      wasteQuantity: 0,
      unit: "kg",
      wasteType: "recyclable",
      notes: "",
      estimatedValue: 0
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

  const calculateEfficiency = () => {
    const totalProduced = completedItems.length;
    const availableItems = completedItems.filter(item => item.status === "available").length;
    const damagedItems = completedItems.filter(item => item.status === "damaged").length;
    const efficiency = (availableItems / batchToComplete.expectedOutput) * 100;
    
    return {
      totalProduced,
      availableItems,
      damagedItems,
      efficiency: Math.round(efficiency)
    };
  };

  const calculateTotalCost = () => {
    const materialCost = batchToComplete.materials.reduce((sum, material) => sum + material.cost, 0);
    const wasteValue = wasteItems.reduce((sum, waste) => sum + waste.estimatedValue, 0);
    return {
      materialCost,
      wasteValue,
      totalCost: materialCost + wasteValue
    };
  };

  const handleCompleteProduction = () => {
    if (!qualityCheck.inspector.trim()) {
      toast({
        title: "Inspector Required",
        description: "Please assign an inspector before completing production",
        variant: "destructive"
      });
      return;
    }

    const efficiency = calculateEfficiency();
    const costs = calculateTotalCost();

    // Create production completion record
    const completionRecord = {
      batchId: batchToComplete.id,
      batchNumber: batchToComplete.batchNumber,
      productName: batchToComplete.productName,
      completionDate: new Date().toISOString().split('T')[0],
      inspector: qualityCheck.inspector,
      overallGrade: qualityCheck.overallGrade,
      efficiency: efficiency.efficiency,
      totalProduced: efficiency.totalProduced,
      availableItems: efficiency.availableItems,
      damagedItems: efficiency.damagedItems,
      materialCost: costs.materialCost,
      wasteValue: costs.wasteValue,
      totalCost: costs.totalCost,
      completedItems: completedItems,
      wasteItems: wasteItems,
      notes: completionNotes,
      defects: qualityCheck.defects,
      recommendations: qualityCheck.recommendations
    };

    // Store in localStorage for demo
    const existingCompletions = JSON.parse(localStorage.getItem('productionCompletions') || '[]');
    existingCompletions.push(completionRecord);
    localStorage.setItem('productionCompletions', JSON.stringify(existingCompletions));

    toast({
      title: "Production Completed",
      description: `Batch ${batchToComplete.batchNumber} has been completed successfully`,
    });

    // Navigate back to production page
    navigate('/production');
  };

  const efficiency = calculateEfficiency();
  const costs = calculateTotalCost();

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Complete Production Batch" 
        subtitle="Final quality inspection, individual product tracking, and waste management"
      />

      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/production')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Production
        </Button>
      </div>

      {/* Batch Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Batch Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Batch Number</div>
              <div className="font-medium">{batchToComplete.batchNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Product</div>
              <div className="font-medium">{batchToComplete.productName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Expected Output</div>
              <div className="font-medium">{batchToComplete.expectedOutput} pieces</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-medium">{batchToComplete.location}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produced</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{efficiency.totalProduced}</div>
            <p className="text-xs text-muted-foreground">
              pieces completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{efficiency.availableItems}</div>
            <p className="text-xs text-muted-foreground">
              ready for sale
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Damaged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{efficiency.damagedItems}</div>
            <p className="text-xs text-muted-foreground">
              quality issues
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{efficiency.efficiency}%</div>
            <p className="text-xs text-muted-foreground">
              production yield
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completed Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Completed Items
              </CardTitle>
              <Button onClick={addCompletedItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {completedItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{item.uniqueId}</div>
                      <Badge variant={
                        item.status === "available" ? "default" :
                        item.status === "damaged" ? "destructive" :
                        "secondary"
                      }>
                        {item.status}
                      </Badge>
                      <Badge variant={
                        item.grade === "A+" ? "default" :
                        item.grade === "A" ? "secondary" :
                        item.grade === "B" ? "outline" :
                        "destructive"
                      }>
                        Grade {item.grade}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCompletedItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dimensions:</span>
                      <input
                        type="text"
                        value={item.dimensions}
                        onChange={(e) => updateCompletedItem(item.id, 'dimensions', e.target.value)}
                        className="ml-2 px-2 py-1 border rounded text-xs w-20"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <input
                        type="text"
                        value={item.weight}
                        onChange={(e) => updateCompletedItem(item.id, 'weight', e.target.value)}
                        className="ml-2 px-2 py-1 border rounded text-xs w-16"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground">Thickness:</span>
                      <input
                        type="text"
                        value={item.thickness}
                        onChange={(e) => updateCompletedItem(item.id, 'thickness', e.target.value)}
                        className="ml-2 px-2 py-1 border rounded text-xs w-16"
                      />
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pile Height:</span>
                      <input
                        type="text"
                        value={item.pileHeight}
                        onChange={(e) => updateCompletedItem(item.id, 'pileHeight', e.target.value)}
                        className="ml-2 px-2 py-1 border rounded text-xs w-16"
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-muted-foreground text-sm">Notes:</span>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateCompletedItem(item.id, 'notes', e.target.value)}
                      className="ml-2 px-2 py-1 border rounded text-xs w-full"
                      placeholder="Quality notes..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waste Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Recycle className="w-5 h-5" />
                Waste Management
              </CardTitle>
              <Button onClick={addWasteItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Waste
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {wasteItems.map((waste) => (
                <div key={waste.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={waste.wasteType === "recyclable" ? "default" : "destructive"}>
                        {waste.wasteType}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeWasteItem(waste.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground text-sm">Material:</span>
                      <input
                        type="text"
                        value={waste.materialName}
                        onChange={(e) => updateWasteItem(waste.id, 'materialName', e.target.value)}
                        className="ml-2 px-2 py-1 border rounded text-xs w-32"
                        placeholder="Material name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground text-sm">Quantity:</span>
                        <input
                          type="number"
                          value={waste.wasteQuantity}
                          onChange={(e) => updateWasteItem(waste.id, 'wasteQuantity', parseFloat(e.target.value) || 0)}
                          className="ml-2 px-2 py-1 border rounded text-xs w-16"
                        />
                        <select
                          value={waste.unit}
                          onChange={(e) => updateWasteItem(waste.id, 'unit', e.target.value)}
                          className="ml-1 px-1 py-1 border rounded text-xs"
                        >
                          <option value="kg">kg</option>
                          <option value="liters">liters</option>
                          <option value="sqm">sqm</option>
                          <option value="rolls">rolls</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Value:</span>
                        <input
                          type="number"
                          value={waste.estimatedValue}
                          onChange={(e) => updateWasteItem(waste.id, 'estimatedValue', parseFloat(e.target.value) || 0)}
                          className="ml-2 px-2 py-1 border rounded text-xs w-20"
                          placeholder="₹"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Notes:</span>
                      <input
                        type="text"
                        value={waste.notes}
                        onChange={(e) => updateWasteItem(waste.id, 'notes', e.target.value)}
                        className="ml-2 px-2 py-1 border rounded text-xs w-full"
                        placeholder="Waste description..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quality Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inspector">Inspector Name *</Label>
              <Input
                id="inspector"
                value={qualityCheck.inspector}
                onChange={(e) => setQualityCheck(prev => ({ ...prev, inspector: e.target.value }))}
                placeholder="Enter inspector name"
              />
            </div>
            <div>
              <Label htmlFor="overallGrade">Overall Grade</Label>
              <Select
                value={qualityCheck.overallGrade}
                onValueChange={(value: any) => setQualityCheck(prev => ({ ...prev, overallGrade: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+ (Excellent)</SelectItem>
                  <SelectItem value="A">A (Very Good)</SelectItem>
                  <SelectItem value="B">B (Good)</SelectItem>
                  <SelectItem value="C">C (Average)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="defects">Defects Found</Label>
            <Textarea
              id="defects"
              value={qualityCheck.defects}
              onChange={(e) => setQualityCheck(prev => ({ ...prev, defects: e.target.value }))}
              placeholder="Describe any defects found during inspection..."
              rows={3}
            />
          </div>
          
          <div className="mt-4">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea
              id="recommendations"
              value={qualityCheck.recommendations}
              onChange={(e) => setQualityCheck(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Any recommendations for improvement..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">₹{costs.materialCost.toLocaleString()}</div>
              <div className="text-sm text-blue-700">Material Cost</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">₹{costs.wasteValue.toLocaleString()}</div>
              <div className="text-sm text-red-700">Waste Value</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₹{costs.totalCost.toLocaleString()}</div>
              <div className="text-sm text-green-700">Total Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Additional notes about the production completion..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/production')}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCompleteProduction}
          disabled={!qualityCheck.inspector.trim()}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          Complete Production
        </Button>
      </div>
    </div>
  );
}