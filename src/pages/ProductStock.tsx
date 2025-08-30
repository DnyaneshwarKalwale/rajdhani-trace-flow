import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, Package, AlertTriangle, QrCode, Calendar, 
  Edit, Eye, Hash, Image, Search, Filter, Download,
  CheckCircle, Clock, MapPin, Scale, Ruler, Layers,
  User, Star, Truck, FileText
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductMaterial {
  materialName: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface Product {
  id: string;
  qrCode: string;
  name: string;
  category: string;
  color: string;
  size: string;
  pattern: string;
  quantity: number;
  unit: string;
  manufacturingDate: string;
  imageUrl?: string;
  location: string;
}

interface IndividualProduct {
  id: string;
  qrCode: string;
  productId: string;
  manufacturingDate: string;
  materialsUsed: ProductMaterial[];
  finalDimensions: string;
  finalWeight: string;
  finalThickness: string;
  finalPileHeight: string;
  qualityGrade: string;
  inspector: string;
  notes: string;
  status: "available" | "sold" | "damaged";
}

// Sample data (in real app, this would come from API)
const sampleProducts: Product[] = [
  {
    id: "PROD001",
    qrCode: "QR-CARPET-001",
    name: "Traditional Persian Carpet",
    category: "Handmade",
    color: "Red & Gold",
    size: "8x10 feet",
    pattern: "Persian Medallion",
    quantity: 5,
    unit: "pieces",
    manufacturingDate: "2024-01-15",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    location: "Warehouse A - Shelf 1"
  },
  {
    id: "PROD002",
    qrCode: "QR-CARPET-002",
    name: "Modern Geometric Carpet",
    category: "Machine Made",
    color: "Blue & White",
    size: "6x9 feet",
    pattern: "Geometric",
    quantity: 12,
    unit: "pieces",
    manufacturingDate: "2024-01-20",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    location: "Warehouse B - Shelf 3"
  }
];

const individualProducts: IndividualProduct[] = [
  // Traditional Persian Carpet (PROD001) - 5 pieces
  {
    id: "IND001",
    qrCode: "QR-CARPET-001-001",
    productId: "PROD001",
    manufacturingDate: "2024-01-15",
    materialsUsed: [
      { materialName: "Cotton Yarn (Premium)", quantity: 3, unit: "rolls", cost: 1350 },
      { materialName: "Red Dye (Industrial)", quantity: 1.6, unit: "liters", cost: 288 },
      { materialName: "Latex Solution", quantity: 2.4, unit: "liters", cost: 768 }
    ],
    finalDimensions: "8'2\" x 10'1\" (2.49m x 3.07m)",
    finalWeight: "46.2 kg",
    finalThickness: "12.5 mm",
    finalPileHeight: "8.2 mm",
    qualityGrade: "A+",
    inspector: "Ahmed Khan",
    notes: "Perfect finish, no defects",
    status: "available"
  },
  {
    id: "IND002",
    qrCode: "QR-CARPET-001-002",
    productId: "PROD001",
    manufacturingDate: "2024-01-15",
    materialsUsed: [
      { materialName: "Cotton Yarn (Premium)", quantity: 3, unit: "rolls", cost: 1350 },
      { materialName: "Red Dye (Industrial)", quantity: 1.6, unit: "liters", cost: 288 },
      { materialName: "Latex Solution", quantity: 2.4, unit: "liters", cost: 768 }
    ],
    finalDimensions: "8'0\" x 10'0\" (2.44m x 3.05m)",
    finalWeight: "45.0 kg",
    finalThickness: "12.0 mm",
    finalPileHeight: "8.0 mm",
    qualityGrade: "A",
    inspector: "Ahmed Khan",
    notes: "Minor color variation",
    status: "sold"
  },
  {
    id: "IND003",
    qrCode: "QR-CARPET-001-003",
    productId: "PROD001",
    manufacturingDate: "2024-01-15",
    materialsUsed: [
      { materialName: "Cotton Yarn (Premium)", quantity: 3, unit: "rolls", cost: 1350 },
      { materialName: "Red Dye (Industrial)", quantity: 1.6, unit: "liters", cost: 288 },
      { materialName: "Latex Solution", quantity: 2.4, unit: "liters", cost: 768 }
    ],
    finalDimensions: "8'1\" x 10'0\" (2.46m x 3.05m)",
    finalWeight: "45.5 kg",
    finalThickness: "12.2 mm",
    finalPileHeight: "8.1 mm",
    qualityGrade: "A+",
    inspector: "Ahmed Khan",
    notes: "Excellent quality, premium finish",
    status: "available"
  },
  {
    id: "IND004",
    qrCode: "QR-CARPET-001-004",
    productId: "PROD001",
    manufacturingDate: "2024-01-15",
    materialsUsed: [
      { materialName: "Cotton Yarn (Premium)", quantity: 3, unit: "rolls", cost: 1350 },
      { materialName: "Red Dye (Industrial)", quantity: 1.6, unit: "liters", cost: 288 },
      { materialName: "Latex Solution", quantity: 2.4, unit: "liters", cost: 768 }
    ],
    finalDimensions: "8'0\" x 10'1\" (2.44m x 3.07m)",
    finalWeight: "45.8 kg",
    finalThickness: "12.3 mm",
    finalPileHeight: "8.0 mm",
    qualityGrade: "A",
    inspector: "Ahmed Khan",
    notes: "Standard quality, good finish",
    status: "damaged"
  },
  {
    id: "IND005",
    qrCode: "QR-CARPET-001-005",
    productId: "PROD001",
    manufacturingDate: "2024-01-15",
    materialsUsed: [
      { materialName: "Cotton Yarn (Premium)", quantity: 3, unit: "rolls", cost: 1350 },
      { materialName: "Red Dye (Industrial)", quantity: 1.6, unit: "liters", cost: 288 },
      { materialName: "Latex Solution", quantity: 2.4, unit: "liters", cost: 768 }
    ],
    finalDimensions: "8'1\" x 10'1\" (2.46m x 3.07m)",
    finalWeight: "46.0 kg",
    finalThickness: "12.4 mm",
    finalPileHeight: "8.1 mm",
    qualityGrade: "A+",
    inspector: "Ahmed Khan",
    notes: "Perfect dimensions, premium quality",
    status: "available"
  },

  // Modern Geometric Carpet (PROD002) - 12 pieces
  {
    id: "IND006",
    qrCode: "QR-CARPET-002-001",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
    finalWeight: "33.5 kg",
    finalThickness: "10.2 mm",
    finalPileHeight: "6.1 mm",
    qualityGrade: "A+",
    inspector: "Priya Sharma",
    notes: "Excellent geometric precision",
    status: "available"
  },
  {
    id: "IND007",
    qrCode: "QR-CARPET-002-002",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
    finalWeight: "32.0 kg",
    finalThickness: "10.0 mm",
    finalPileHeight: "6.0 mm",
    qualityGrade: "A",
    inspector: "Priya Sharma",
    notes: "Standard quality",
    status: "sold"
  },
  {
    id: "IND008",
    qrCode: "QR-CARPET-002-003",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'0\" x 9'1\" (1.83m x 2.77m)",
    finalWeight: "32.8 kg",
    finalThickness: "10.1 mm",
    finalPileHeight: "6.0 mm",
    qualityGrade: "A",
    inspector: "Priya Sharma",
    notes: "Slight size variation",
    status: "available"
  },
  {
    id: "IND009",
    qrCode: "QR-CARPET-002-004",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'1\" x 9'1\" (1.85m x 2.77m)",
    finalWeight: "33.2 kg",
    finalThickness: "10.3 mm",
    finalPileHeight: "6.2 mm",
    qualityGrade: "A+",
    inspector: "Priya Sharma",
    notes: "Perfect geometric alignment",
    status: "available"
  },
  {
    id: "IND010",
    qrCode: "QR-CARPET-002-005",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
    finalWeight: "32.0 kg",
    finalThickness: "10.0 mm",
    finalPileHeight: "6.0 mm",
    qualityGrade: "A",
    inspector: "Priya Sharma",
    notes: "Good quality finish",
    status: "sold"
  },
  {
    id: "IND011",
    qrCode: "QR-CARPET-002-006",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
    finalWeight: "33.1 kg",
    finalThickness: "10.1 mm",
    finalPileHeight: "6.1 mm",
    qualityGrade: "A+",
    inspector: "Priya Sharma",
    notes: "Excellent precision",
    status: "available"
  },
  {
    id: "IND012",
    qrCode: "QR-CARPET-002-007",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'0\" x 9'1\" (1.83m x 2.77m)",
    finalWeight: "32.5 kg",
    finalThickness: "10.2 mm",
    finalPileHeight: "6.0 mm",
    qualityGrade: "A",
    inspector: "Priya Sharma",
    notes: "Standard finish",
    status: "available"
  },
  {
    id: "IND013",
    qrCode: "QR-CARPET-002-008",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'1\" x 9'1\" (1.85m x 2.77m)",
    finalWeight: "33.3 kg",
    finalThickness: "10.3 mm",
    finalPileHeight: "6.2 mm",
    qualityGrade: "A+",
    inspector: "Priya Sharma",
    notes: "Premium quality",
    status: "sold"
  },
  {
    id: "IND014",
    qrCode: "QR-CARPET-002-009",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'0\" x 9'0\" (1.83m x 2.74m)",
    finalWeight: "32.2 kg",
    finalThickness: "10.1 mm",
    finalPileHeight: "6.0 mm",
    qualityGrade: "A",
    inspector: "Priya Sharma",
    notes: "Good geometric pattern",
    status: "available"
  },
  {
    id: "IND015",
    qrCode: "QR-CARPET-002-010",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'1\" x 9'0\" (1.85m x 2.74m)",
    finalWeight: "33.0 kg",
    finalThickness: "10.2 mm",
    finalPileHeight: "6.1 mm",
    qualityGrade: "A+",
    inspector: "Priya Sharma",
    notes: "Perfect finish",
    status: "available"
  },
  {
    id: "IND016",
    qrCode: "QR-CARPET-002-011",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'0\" x 9'1\" (1.83m x 2.77m)",
    finalWeight: "32.7 kg",
    finalThickness: "10.1 mm",
    finalPileHeight: "6.0 mm",
    qualityGrade: "A",
    inspector: "Priya Sharma",
    notes: "Standard quality",
    status: "damaged"
  },
  {
    id: "IND017",
    qrCode: "QR-CARPET-002-012",
    productId: "PROD002",
    manufacturingDate: "2024-01-20",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 1.67, unit: "rolls", cost: 633 },
      { materialName: "Blue Dye (Industrial)", quantity: 0.83, unit: "liters", cost: 158 },
      { materialName: "Backing Cloth", quantity: 4.5, unit: "sqm", cost: 112 }
    ],
    finalDimensions: "6'1\" x 9'1\" (1.85m x 2.77m)",
    finalWeight: "33.4 kg",
    finalThickness: "10.3 mm",
    finalPileHeight: "6.2 mm",
    qualityGrade: "A+",
    inspector: "Priya Sharma",
    notes: "Excellent geometric precision",
    status: "available"
  }
];

export default function ProductStock() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<IndividualProduct | null>(null);

  useEffect(() => {
    // Find product by ID
    const foundProduct = sampleProducts.find(p => p.id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [productId]);

  const getIndividualProducts = (productId: string) => {
    return individualProducts.filter(ind => ind.productId === productId);
  };

  const filteredItems = getIndividualProducts(productId || "").filter(item => {
    const matchesSearch = item.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesQuality = qualityFilter === "all" || item.qualityGrade === qualityFilter;
    
    return matchesSearch && matchesStatus && matchesQuality;
  });

  const getStatusCount = (status: string) => {
    return getIndividualProducts(productId || "").filter(item => item.status === status).length;
  };

  const getQualityCount = (grade: string) => {
    return getIndividualProducts(productId || "").filter(item => item.qualityGrade === grade).length;
  };

  if (!product) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Individual Stock Management</h1>
            <p className="text-muted-foreground">Manage individual pieces for {product.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/product/${product.id}`)}>
            <Eye className="w-4 h-4 mr-2" />
            View Product Details
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Stock Report
          </Button>
        </div>
      </div>

      {/* Product Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-muted-foreground">{product.color} • {product.size} • {product.pattern}</p>
                             <div className="flex items-center gap-4 mt-2">
                 <div className="flex items-center gap-2">
                   <Hash className="w-4 h-4 text-muted-foreground" />
                   <span className="text-sm font-medium">Total Stock: {product.quantity} pieces</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <CheckCircle className="w-4 h-4 text-success" />
                   <span className="text-sm text-success">Available: {getStatusCount("available")} pieces</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-muted-foreground" />
                   <span className="text-sm text-muted-foreground">{product.location}</span>
                 </div>
               </div>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-success">{getStatusCount("available")}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{getStatusCount("sold")}</p>
                  <p className="text-xs text-muted-foreground">Sold</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{getStatusCount("damaged")}</p>
                  <p className="text-xs text-muted-foreground">Damaged</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search by ID, QR code, or inspector..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="A+">A+ Grade</SelectItem>
                <SelectItem value="A">A Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quality Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">A+ Grade</p>
                <p className="text-2xl font-bold text-success">{getQualityCount("A+")}</p>
              </div>
              <Star className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">A Grade</p>
                <p className="text-2xl font-bold text-warning">{getQualityCount("A")}</p>
              </div>
              <Star className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pieces</p>
                <p className="text-2xl font-bold">{filteredItems.length}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Pieces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">QR Code</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Manufacturing Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Final Dimensions</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Quality Grade</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Inspector</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{item.id}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{item.qrCode}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(item.manufacturingDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm">{item.finalDimensions}</td>
                    <td className="p-3">
                      <Badge variant={item.qualityGrade === "A+" ? "default" : "secondary"}>
                        {item.qualityGrade}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{item.inspector}</td>
                    <td className="p-3">
                      <Badge 
                        variant={item.status === "available" ? "default" : 
                                item.status === "sold" ? "secondary" : "destructive"}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Individual Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Individual Piece Details</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* QR Code Section */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  <h4 className="font-medium">QR Code</h4>
                </div>
                <div className="font-mono text-lg bg-background p-3 rounded border">
                  {selectedItem.qrCode}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Manufacturing Date</Label>
                  <p className="text-sm">{new Date(selectedItem.manufacturingDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quality Grade</Label>
                  <Badge variant={selectedItem.qualityGrade === "A+" ? "default" : "secondary"}>
                    {selectedItem.qualityGrade}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Inspector</Label>
                  <p className="text-sm">{selectedItem.inspector}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge 
                    variant={selectedItem.status === "available" ? "default" : 
                            selectedItem.status === "sold" ? "secondary" : "destructive"}
                  >
                    {selectedItem.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Final Dimensions</Label>
                  <p className="text-sm">{selectedItem.finalDimensions}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Final Weight</Label>
                  <p className="text-sm">{selectedItem.finalWeight}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Final Thickness</Label>
                  <p className="text-sm">{selectedItem.finalThickness}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Final Pile Height</Label>
                  <p className="text-sm">{selectedItem.finalPileHeight}</p>
                </div>
              </div>

              {/* Materials Used */}
              <div>
                <Label className="text-sm font-medium">Materials Used</Label>
                <div className="mt-2 space-y-2">
                  {selectedItem.materialsUsed.map((material, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <div>
                        <p className="text-sm font-medium">{material.materialName}</p>
                        <p className="text-xs text-muted-foreground">
                          {material.quantity} {material.unit}
                        </p>
                      </div>
                      <p className="text-sm font-medium">₹{material.cost.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedItem.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm mt-1">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
