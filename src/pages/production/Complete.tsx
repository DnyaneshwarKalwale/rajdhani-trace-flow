import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, Package, CheckCircle, Plus, Trash2, Download, Upload,
  Save, QrCode, AlertTriangle
} from "lucide-react";
import { getFromStorage, saveToStorage, generateUniqueId } from "@/lib/storage";
import { getProductionFlow, updateProductionStep } from "@/lib/machines";
import { Loading } from "@/components/ui/loading";
import ProductionProgressBar from "@/components/production/ProductionProgressBar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface IndividualProduct {
  id: string;
  qrCode: string;
  productId: string;
  customId: string;
  manufacturingDate: string;
  finalDimensions: string;
  finalWeight: string;
  finalThickness: string;
  finalWidth: string;
  finalHeight: string;
  finalPileHeight: string;
  qualityGrade: "A+" | "A" | "B" | "C" | "D";
  status: "available" | "damaged";
  inspector: string;
  inspectorId?: string;
  productionSteps: Array<{
    stepName: string;
    machineUsed: string;
  inspector: string;
    completedAt: string;
    qualityNotes?: string;
  }>;
  notes: string;
}

export default function Complete() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [productionProduct, setProductionProduct] = useState<any>(null);
  const [individualProducts, setIndividualProducts] = useState<IndividualProduct[]>([]);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [inspector, setInspector] = useState("Admin");
  const [productionFlow, setProductionFlow] = useState<any>(null);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{index: number, productId: string, missingFields: string[]}>>([]);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<{
    totalProducts: number;
    available: number;
    damaged: number;
    averageQuality: string;
  } | null>(null);

  // Function to generate globally unique custom ID
  const generateGloballyUniqueCustomId = (productName: string): string => {
    // Get all existing individual products from storage
    const allIndividualProducts = getFromStorage('rajdhani_individual_products') || [];
    
    // Create product prefix from first 3 characters
    const prefix = productName.substring(0, 3).toUpperCase();
    
    // Find all existing IDs with this prefix
    const existingIds = allIndividualProducts
      .filter((product: any) => product.customId?.startsWith(prefix + '-'))
      .map((product: any) => product.customId);
    
    // Also include current batch IDs to avoid conflicts
    const currentBatchIds = individualProducts.map(p => p.customId);
    const allExistingIds = [...existingIds, ...currentBatchIds];
    
    // Find the next available number
    let counter = 1;
    let newId = `${prefix}-${String(counter).padStart(3, '0')}`;
    
    while (allExistingIds.includes(newId)) {
      counter++;
      newId = `${prefix}-${String(counter).padStart(3, '0')}`;
    }
    
    return newId;
  };

  useEffect(() => {
    if (productId) {
      const products = getFromStorage('rajdhani_production_products');
      const product = products.find((p: any) => p.id === productId);
      if (product) {
        setProductionProduct(product);
        
        // Get production flow to extract step history
        const flow = getProductionFlow(product.id);
        setProductionFlow(flow);
        const productionSteps = flow?.steps.filter(s => s.status === 'completed').map(step => ({
          stepName: step.name,
          machineUsed: step.machineName,
          inspector: step.inspectorName || 'Unknown',
          completedAt: step.endTime || '',
          qualityNotes: step.qualityNotes
        })) || [];
        
        // Function to calculate dimensions from size
        const calculateDimensionsFromSize = (size: string) => {
          const sizeMap: { [key: string]: { width: string, height: string, dimensions: string } } = {
            "3x5 feet": { width: "0.91m", height: "1.52m", dimensions: "3' x 5' (0.91m x 1.52m)" },
            "5x7 feet": { width: "1.52m", height: "2.13m", dimensions: "5' x 7' (1.52m x 2.13m)" },
            "6x9 feet": { width: "1.83m", height: "2.74m", dimensions: "6' x 9' (1.83m x 2.74m)" },
            "8x10 feet": { width: "2.44m", height: "3.05m", dimensions: "8' x 10' (2.44m x 3.05m)" },
            "9x12 feet": { width: "2.74m", height: "3.66m", dimensions: "9' x 12' (2.74m x 3.66m)" },
            "10x14 feet": { width: "3.05m", height: "4.27m", dimensions: "10' x 14' (3.05m x 4.27m)" },
            "Custom": { width: "", height: "", dimensions: "" }
          };
          return sizeMap[size] || { width: "", height: "", dimensions: "" };
        };

        // Initialize individual products with production history and auto-calculated dimensions
        const calculatedDimensions = calculateDimensionsFromSize(product.size);
        
        // Generate globally unique custom IDs for all products in this batch
        const customIds = [];
        for (let i = 0; i < product.targetQuantity; i++) {
          customIds.push(generateGloballyUniqueCustomId(product.productName));
        }
        
        const initialProducts: IndividualProduct[] = Array.from({ length: product.targetQuantity }, (_, index) => ({
          id: generateUniqueId('IND'),
          qrCode: generateUniqueId('QR'),
          productId: product.productId,
          customId: customIds[index],
          manufacturingDate: new Date().toISOString().split('T')[0],
          finalDimensions: product.size,
          finalWeight: "",
          finalThickness: "",
          finalWidth: calculatedDimensions.width,
          finalHeight: calculatedDimensions.height,
          finalPileHeight: "",
          qualityGrade: "A" as const,
          status: "available" as const,
          inspector: inspector,
          inspectorId: generateUniqueId('INSP'),
          productionSteps: productionSteps,
          notes: ""
        }));
        setIndividualProducts(initialProducts);
      }
    }
  }, [productId, inspector]);

  const handleCellClick = (rowIndex: number, field: keyof IndividualProduct) => {
    setEditingCell({ row: rowIndex, col: field });
    setEditValue(String(individualProducts[rowIndex][field] || ""));
  };

  const handleCellSave = () => {
    if (editingCell) {
      const newData = [...individualProducts];
      const { row, col } = editingCell;
      newData[row] = { ...newData[row], [col]: editValue };
      setIndividualProducts(newData);
      
      // Auto-save to localStorage
      const existing = getFromStorage('rajdhani_individual_products') || [];
      const updated = existing.map((item: any) => 
        item.id === newData[row].id ? newData[row] : item
      );
      localStorage.setItem('rajdhani_individual_products', JSON.stringify(updated));
      
      setEditingCell(null);
      setEditValue("");
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const addRow = () => {
    // Get production flow to extract step history
    const flow = getProductionFlow(productionProduct.id);
    const productionSteps = flow?.steps.filter(s => s.status === 'completed').map(step => ({
      stepName: step.name,
      machineUsed: step.machineName,
      inspector: step.inspectorName || 'Unknown',
      completedAt: step.endTime || '',
      qualityNotes: step.qualityNotes
    })) || [];
    
    // Function to calculate dimensions from size
    const calculateDimensionsFromSize = (size: string) => {
      const sizeMap: { [key: string]: { width: string, height: string, dimensions: string } } = {
        "3x5 feet": { width: "0.91m", height: "1.52m", dimensions: "3' x 5' (0.91m x 1.52m)" },
        "5x7 feet": { width: "1.52m", height: "2.13m", dimensions: "5' x 7' (1.52m x 2.13m)" },
        "6x9 feet": { width: "1.83m", height: "2.74m", dimensions: "6' x 9' (1.83m x 2.74m)" },
        "8x10 feet": { width: "2.44m", height: "3.05m", dimensions: "8' x 10' (2.44m x 3.05m)" },
        "9x12 feet": { width: "2.74m", height: "3.66m", dimensions: "9' x 12' (2.74m x 3.66m)" },
        "10x14 feet": { width: "3.05m", height: "4.27m", dimensions: "10' x 14' (3.05m x 4.27m)" },
        "Custom": { width: "", height: "", dimensions: "" }
      };
      return sizeMap[size] || { width: "", height: "", dimensions: "" };
    };

    const calculatedDimensions = calculateDimensionsFromSize(productionProduct.size);
    const newProduct: IndividualProduct = {
      id: generateUniqueId('IND'),
      qrCode: generateUniqueId('QR'),
      productId: productionProduct.productId,
      customId: generateGloballyUniqueCustomId(productionProduct.productName),
      manufacturingDate: new Date().toISOString().split('T')[0],
      finalDimensions: productionProduct.size,
      finalWeight: "",
      finalThickness: "",
      finalWidth: calculatedDimensions.width,
      finalHeight: calculatedDimensions.height,
      finalPileHeight: "",
      qualityGrade: "A" as const,
      status: "available" as const,
      inspector: inspector,
      inspectorId: generateUniqueId('INSP'),
      productionSteps: productionSteps,
      notes: ""
    };
    const updatedProducts = [...individualProducts, newProduct];
    setIndividualProducts(updatedProducts);
    
    // Auto-save to localStorage
    const existing = getFromStorage('rajdhani_individual_products') || [];
    existing.push(newProduct);
    localStorage.setItem('rajdhani_individual_products', JSON.stringify(existing));
  };

  const removeRow = (index: number) => {
    const productToRemove = individualProducts[index];
    const updatedProducts = individualProducts.filter((_, i) => i !== index);
    setIndividualProducts(updatedProducts);
    
    // Auto-save to localStorage
    const existing = getFromStorage('rajdhani_individual_products') || [];
    const updated = existing.filter((item: any) => item.id !== productToRemove.id);
    localStorage.setItem('rajdhani_individual_products', JSON.stringify(updated));
  };

  const handleCompleteProduction = () => {
    // Validate all required fields are filled (excluding optional fields like pile height and notes)
    const requiredFields = ['finalDimensions', 'finalWeight', 'finalThickness', 'qualityGrade'];
    const fieldLabels = {
      'finalDimensions': 'Final Dimensions',
      'finalWeight': 'Final Weight', 
      'finalThickness': 'Final Thickness',
      'qualityGrade': 'Quality Grade'
    };
    
    const errors: Array<{index: number, productId: string, missingFields: string[]}> = [];
    
    individualProducts.forEach((product, index) => {
      const missingFields = requiredFields.filter(field => 
        !product[field as keyof IndividualProduct] || product[field as keyof IndividualProduct] === ""
      );
      
      if (missingFields.length > 0) {
        errors.push({
          index: index + 1,
          productId: product.id,
          missingFields: missingFields.map(field => fieldLabels[field as keyof typeof fieldLabels])
        });
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationPopup(true);
      return;
    }

    // Save individual products with complete production history
    const existing = getFromStorage('rajdhani_individual_products');
    existing.push(...individualProducts);
    localStorage.setItem('rajdhani_individual_products', JSON.stringify(existing));

    // Update main product inventory
    const availableProducts = getFromStorage('rajdhani_products');
    const productIndex = availableProducts.findIndex((p: any) => p.id === productionProduct.productId);
    
    if (productIndex !== -1) {
      const availableCount = individualProducts.filter(p => p.status === "available").length;
      const damagedCount = individualProducts.filter(p => p.status === "damaged").length;
      
      // Update quantity with available products only
      availableProducts[productIndex].quantity += availableCount;
      
      // Update status back to "in-stock" when production is completed
      const newQuantity = availableProducts[productIndex].quantity;
      availableProducts[productIndex].status = newQuantity <= 0 ? 'out-of-stock' : 
                                              newQuantity <= 5 ? 'low-stock' : 'in-stock';
      
      // Add production batch information
      if (!availableProducts[productIndex].productionBatches) {
        availableProducts[productIndex].productionBatches = [];
      }
      
      availableProducts[productIndex].productionBatches.push({
        batchId: productionProduct.id,
        productionDate: new Date().toISOString(),
        totalProduced: individualProducts.length,
        availableCount,
        damagedCount,
        inspector: inspector,
        averageQualityGrade: calculateAverageQualityGrade(individualProducts)
      });
      
      localStorage.setItem('rajdhani_products', JSON.stringify(availableProducts));
    }

    // Mark production as completed
    const productionProducts = getFromStorage('rajdhani_production_products');
    const updatedProduction = productionProducts.map((p: any) => 
      p.id === productionProduct.id ? { 
        ...p, 
        status: "completed",
        completedAt: new Date().toISOString(),
        finalInspector: inspector,
        actualQuantity: individualProducts.length,
        qualityDistribution: getQualityDistribution(individualProducts)
      } : p
    );
    localStorage.setItem('rajdhani_production_products', JSON.stringify(updatedProduction));

    // Update production flow status
    const flow = getProductionFlow(productionProduct.id);
    if (flow && flow.status !== 'completed') {
      const lastStep = flow.steps[flow.steps.length - 1];
      if (lastStep) {
        updateProductionStep(flow.id, lastStep.id, {
          status: 'completed',
          endTime: new Date().toISOString(),
          inspectorName: inspector,
          qualityNotes: `Production completed with ${individualProducts.length} products. Quality distribution: ${getQualityDistribution(individualProducts).map(q => `${q.grade}: ${q.count}`).join(', ')}`
        });
      }
    }

    // Show completion summary popup
    setCompletionSummary({
      totalProducts: individualProducts.length,
      available: individualProducts.filter(p => p.status === "available").length,
      damaged: individualProducts.filter(p => p.status === "damaged").length,
      averageQuality: calculateAverageQualityGrade(individualProducts)
    });
    setShowCompletionPopup(true);
  };

  const calculateAverageQualityGrade = (products: IndividualProduct[]): string => {
    const gradeValues = { 'A+': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    const totalValue = products.reduce((sum, p) => sum + gradeValues[p.qualityGrade], 0);
    const average = totalValue / products.length;
    
    if (average >= 4.5) return 'A+';
    if (average >= 3.5) return 'A';
    if (average >= 2.5) return 'B';
    if (average >= 1.5) return 'C';
    return 'D';
  };

  const getQualityDistribution = (products: IndividualProduct[]) => {
    const distribution = products.reduce((acc, p) => {
      acc[p.qualityGrade] = (acc[p.qualityGrade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(distribution).map(([grade, count]) => ({ grade, count }));
  };

  if (!productionProduct) {
    return <Loading message="Loading individual product details..." />;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Complete Production"
        subtitle={`Final product creation for ${productionProduct.productName}`}
      />

      {/* Production Progress Bar */}
      <ProductionProgressBar
        currentStep="testing_individual"
        steps={[
          {
            id: "material_selection",
            name: "Material Selection",
            status: "completed",
            stepType: "material_selection"
          },
          {
            id: "machine_operation",
            name: "Machine Operations",
            status: productionFlow?.steps?.some((s: any) => s.stepType === 'machine_operation') ? "completed" : "pending",
            stepType: "machine_operation"
          },
          {
            id: "wastage_tracking",
            name: "Waste Generation",
            status: productionFlow?.steps?.some((s: any) => s.stepType === 'wastage_tracking' && s.status === 'completed') ? "completed" : "pending",
            stepType: "wastage_tracking"
          },
          {
            id: "testing_individual",
            name: "Individual Details",
            status: "in_progress",
            stepType: "testing_individual"
          }
        ]}
        machineSteps={productionFlow?.steps?.filter((s: any) => s.stepType === 'machine_operation') || []}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/production')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Production
        </Button>
      </div>

      {/* Product Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Production Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-gray-500">Product</Label>
              <p className="font-medium">{productionProduct.productName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Target Quantity</Label>
              <p className="font-medium">{productionProduct.targetQuantity}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Priority</Label>
              <Badge className={
                productionProduct.priority === "urgent" ? "bg-red-100 text-red-800" :
                productionProduct.priority === "high" ? "bg-orange-100 text-orange-800" :
                "bg-blue-100 text-blue-800"
              }>
                {productionProduct.priority}
              </Badge>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Inspector</Label>
              <Input
                value={inspector}
                onChange={(e) => {
                  setInspector(e.target.value);
                  // Auto-save inspector name to localStorage
                  const existing = getFromStorage('rajdhani_individual_products') || [];
                  const updated = existing.map((item: any) => 
                    individualProducts.some(p => p.id === item.id) ? { ...item, inspector: e.target.value } : item
                  );
                  localStorage.setItem('rajdhani_individual_products', JSON.stringify(updated));
                }}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Product Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
              Individual Product Details
              </CardTitle>
            <div className="flex gap-2">
              <Button onClick={addRow} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Row
                    </Button>
                  </div>
            </div>
          </CardHeader>
          <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Custom ID</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">QR Code</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Manufacturing Date</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Final Dimensions</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Final Weight</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Final Thickness</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Final Pile Height</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Quality Grade</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Status</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Notes</th>
                  <th className="border border-gray-200 p-2 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {individualProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-2">
                      {editingCell?.row === index && editingCell?.col === 'customId' ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer p-1 hover:bg-blue-50 rounded"
                          onClick={() => handleCellClick(index, 'customId')}
                        >
                          {product.customId}
                  </div>
                      )}
                    </td>
                    <td className="border border-gray-200 p-2 text-sm text-gray-600">
                      {product.qrCode}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {editingCell?.row === index && editingCell?.col === 'manufacturingDate' ? (
                        <Input
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer p-1 hover:bg-blue-50 rounded"
                          onClick={() => handleCellClick(index, 'manufacturingDate')}
                        >
                          {product.manufacturingDate}
                    </div>
                      )}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {editingCell?.row === index && editingCell?.col === 'finalDimensions' ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer p-1 hover:bg-blue-50 rounded"
                          onClick={() => handleCellClick(index, 'finalDimensions')}
                        >
                          {product.finalDimensions}
                      </div>
                      )}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {editingCell?.row === index && editingCell?.col === 'finalWeight' ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer p-1 hover:bg-blue-50 rounded"
                          onClick={() => handleCellClick(index, 'finalWeight')}
                        >
                          {product.finalWeight || "Click to edit"}
                      </div>
                      )}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {editingCell?.row === index && editingCell?.col === 'finalThickness' ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer p-1 hover:bg-blue-50 rounded"
                          onClick={() => handleCellClick(index, 'finalThickness')}
                        >
                          {product.finalThickness || "Click to edit"}
                    </div>
                      )}
                    </td>
                    <td className="border border-gray-200 p-2">
                      {editingCell?.row === index && editingCell?.col === 'finalPileHeight' ? (
              <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                          autoFocus
                          placeholder="e.g., 8mm"
                        />
                      ) : (
                        <div
                          className="cursor-pointer p-1 hover:bg-blue-50 rounded"
                          onClick={() => handleCellClick(index, 'finalPileHeight')}
                        >
                          {product.finalPileHeight || "Click to edit"}
            </div>
                      )}
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Select
                        value={product.qualityGrade}
                        onValueChange={(value: any) => {
                          const newData = [...individualProducts];
                          newData[index].qualityGrade = value;
                          setIndividualProducts(newData);
                          
                          // Auto-save to localStorage
                          const existing = getFromStorage('rajdhani_individual_products') || [];
                          const updated = existing.map((item: any) => 
                            item.id === newData[index].id ? newData[index] : item
                          );
                          localStorage.setItem('rajdhani_individual_products', JSON.stringify(updated));
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="border border-gray-200 p-2">
              <Select
                        value={product.status}
                        onValueChange={(value: any) => {
                          const newData = [...individualProducts];
                          newData[index].status = value;
                          setIndividualProducts(newData);
                          
                          // Auto-save to localStorage
                          const existing = getFromStorage('rajdhani_individual_products') || [];
                          const updated = existing.map((item: any) => 
                            item.id === newData[index].id ? newData[index] : item
                          );
                          localStorage.setItem('rajdhani_individual_products', JSON.stringify(updated));
                        }}
                      >
                        <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
                    </td>
                    <td className="border border-gray-200 p-2">
                      {editingCell?.row === index && editingCell?.col === 'notes' ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCellSave}
                          onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer p-1 hover:bg-blue-50 rounded"
                          onClick={() => handleCellClick(index, 'notes')}
                        >
                          {product.notes || "Click to edit"}
          </div>
                      )}
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRow(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Complete Production */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Ready to Complete Production?</h3>
              <p className="text-sm text-gray-500">
                {individualProducts.filter(p => p.status === "available").length} products will be added to inventory
              </p>
              {(() => {
                const requiredFields = ['finalDimensions', 'finalWeight', 'finalThickness', 'qualityGrade'];
                const incompleteProducts = individualProducts.filter(product => 
                  requiredFields.some(field => !product[field as keyof IndividualProduct] || product[field as keyof IndividualProduct] === "")
                );
                return incompleteProducts.length > 0 ? (
                  <div className="text-sm text-red-600 mt-1">
                    <p>⚠️ {incompleteProducts.length} products have incomplete data.</p>
                    <p className="text-xs mt-1">Missing: Final Dimensions, Final Weight, Final Thickness, or Quality Grade</p>
                  </div>
                ) : (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ All products have complete data. Ready to complete production.
                  </p>
                );
              })()}
          </div>
        <Button 
          onClick={handleCompleteProduction}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
        >
              <CheckCircle className="w-5 h-5 mr-2" />
          Complete Production
        </Button>
      </div>
        </CardContent>
      </Card>

      {/* Validation Error Popup */}
      <Dialog open={showValidationPopup} onOpenChange={setShowValidationPopup}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Incomplete Product Data
            </DialogTitle>
            <DialogDescription>
              Please fill all required fields for the following products before completing production.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {validationErrors.map((error, index) => (
              <div key={error.productId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="text-xs">
                    Product #{error.index}
                  </Badge>
                  <span className="font-mono text-sm text-gray-600">{error.productId}</span>
                </div>
                <div className="text-sm text-red-700">
                  <div className="font-medium mb-1">Missing fields:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {error.missingFields.map((field, fieldIndex) => (
                      <li key={fieldIndex} className="text-red-600">
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowValidationPopup(false)}
              className="w-full"
            >
              Close and Fix Issues
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Production Completion Success Popup */}
      <Dialog open={showCompletionPopup} onOpenChange={setShowCompletionPopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Production Completed Successfully!
            </DialogTitle>
            <DialogDescription>
              Your production batch has been completed and products have been added to inventory.
            </DialogDescription>
          </DialogHeader>
          
          {completionSummary && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{completionSummary.totalProducts}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{completionSummary.available}</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{completionSummary.damaged}</div>
                  <div className="text-sm text-gray-600">Damaged</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{completionSummary.averageQuality}</div>
                  <div className="text-sm text-gray-600">Avg Quality</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowCompletionPopup(false);
                navigate('/production');
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue to Production
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
