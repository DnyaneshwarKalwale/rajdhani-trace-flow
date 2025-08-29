import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Eye, Package, Barcode, Calendar } from "lucide-react";

interface FinishedProduct {
  id: string;
  uniqueId: string;
  productName: string;
  category: string;
  dimensions: string;
  color: string;
  gsm: number;
  thickness: number;
  manufactureDate: string;
  batchNumber: string;
  rawMaterials: string[];
  status: "available" | "reserved" | "sold";
  qualityGrade: "A" | "B" | "C";
  location: string;
}

const finishedGoods: FinishedProduct[] = [
  {
    id: "1",
    uniqueId: "RC-2024-001",
    productName: "Red Premium Carpet",
    category: "Carpet",
    dimensions: "4x6ft",
    color: "#DC2626",
    gsm: 1200,
    thickness: 12,
    manufactureDate: "2024-01-15",
    batchNumber: "B-001",
    rawMaterials: ["Cotton Yarn", "Red Dye", "Backing Cloth"],
    status: "available",
    qualityGrade: "A",
    location: "A-01-05"
  },
  {
    id: "2",
    uniqueId: "BC-2024-002",
    productName: "Blue Standard Carpet",
    category: "Carpet",
    dimensions: "6x8ft",
    color: "#2563EB",
    gsm: 1000,
    thickness: 10,
    manufactureDate: "2024-01-14",
    batchNumber: "B-002",
    rawMaterials: ["Cotton Yarn", "Blue Dye", "Backing Cloth"],
    status: "reserved",
    qualityGrade: "A",
    location: "A-02-03"
  },
  {
    id: "3",
    uniqueId: "GC-2024-003",
    productName: "Green Luxury Carpet",
    category: "Carpet",
    dimensions: "5x7ft",
    color: "#16A34A",
    gsm: 1500,
    thickness: 15,
    manufactureDate: "2024-01-16",
    batchNumber: "B-003",
    rawMaterials: ["Wool", "Green Dye", "Silk Backing"],
    status: "available",
    qualityGrade: "A",
    location: "A-01-08"
  }
];

const statusStyles = {
  available: "bg-success text-success-foreground",
  reserved: "bg-warning text-warning-foreground",
  sold: "bg-muted text-muted-foreground"
};

const gradeStyles = {
  A: "bg-success text-success-foreground",
  B: "bg-warning text-warning-foreground",
  C: "bg-destructive text-destructive-foreground"
};

export default function FinishedGoods() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");

  const filteredProducts = finishedGoods.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.uniqueId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesGrade = gradeFilter === "all" || product.qualityGrade === gradeFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesGrade;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Finished Goods Inventory" 
        subtitle="Track individual finished products with complete traceability"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search by product name or unique ID..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Carpet">Carpet</SelectItem>
            <SelectItem value="Rug">Rug</SelectItem>
            <SelectItem value="Mat">Mat</SelectItem>
          </SelectContent>
        </Select>

        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="A">Grade A</SelectItem>
            <SelectItem value="B">Grade B</SelectItem>
            <SelectItem value="C">Grade C</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {finishedGoods.filter(p => p.status === "available").length}
                </p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">
                  {finishedGoods.filter(p => p.status === "reserved").length}
                </p>
                <p className="text-sm text-muted-foreground">Reserved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {finishedGoods.filter(p => p.status === "sold").length}
                </p>
                <p className="text-sm text-muted-foreground">Sold</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{finishedGoods.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{product.productName}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Barcode className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">{product.uniqueId}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={statusStyles[product.status]}>
                    {product.status}
                  </Badge>
                  <Badge className={gradeStyles[product.qualityGrade]}>
                    Grade {product.qualityGrade}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Dimensions:</span>
                  <p className="font-medium">{product.dimensions}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{product.location}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">GSM:</span>
                  <p className="font-medium">{product.gsm}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Thickness:</span>
                  <p className="font-medium">{product.thickness}mm</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Color:</span>
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: product.color }}
                />
                <span className="text-sm font-medium">{product.color}</span>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Raw Materials:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.rawMaterials.map((material) => (
                    <Badge key={material} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Mfg:</span>
                  <span className="font-medium">{product.manufactureDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Batch:</span>
                  <span className="font-medium">{product.batchNumber}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}