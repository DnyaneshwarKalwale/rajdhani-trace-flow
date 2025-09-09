import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFromStorage, saveToStorage } from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, Search, Package, AlertTriangle, Upload, Image, X, Download, 
  FileSpreadsheet, CheckCircle, AlertCircle, QrCode, Calendar, 
  Edit, Eye, Filter, SortAsc, SortDesc, Hash, Play, RefreshCw
} from "lucide-react";

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
  expiryDate?: string;
  materialsUsed: ProductMaterial[];
  totalCost: number;
  sellingPrice: number;
  status: "in-stock" | "low-stock" | "out-of-stock" | "expired";
  location: string;
  notes: string;
  imageUrl?: string;
  dimensions: string;
  weight: string;
  thickness: string;
  pileHeight: string;
  materialComposition: string;
}

interface IndividualProduct {
  id: string;
  qrCode: string;
  productId: string;
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
    materialsUsed: [
      { materialName: "Cotton Yarn (Premium)", quantity: 15, unit: "rolls", cost: 6750 },
      { materialName: "Red Dye (Industrial)", quantity: 8, unit: "liters", cost: 1440 },
      { materialName: "Latex Solution", quantity: 12, unit: "liters", cost: 3840 }
    ],
    totalCost: 12030,
    sellingPrice: 25000,
    status: "in-stock",
    location: "Warehouse A - Shelf 1",
    notes: "High-quality traditional design, perfect for living rooms",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    dimensions: "8' x 10' (2.44m x 3.05m)",
    weight: "45 kg",
    thickness: "12 mm",
    pileHeight: "8 mm",
    materialComposition: "80% Cotton, 20% Wool"
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
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 20, unit: "rolls", cost: 7600 },
      { materialName: "Blue Dye (Industrial)", quantity: 10, unit: "liters", cost: 1900 },
      { materialName: "Backing Cloth", quantity: 54, unit: "sqm", cost: 1350 }
    ],
    totalCost: 10850,
    sellingPrice: 18000,
    status: "in-stock",
    location: "Warehouse B - Shelf 3",
    notes: "Contemporary design, suitable for modern interiors",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    dimensions: "6' x 9' (1.83m x 2.74m)",
    weight: "32 kg",
    thickness: "10 mm",
    pileHeight: "6 mm",
    materialComposition: "100% Synthetic"
  },
  {
    id: "PROD003",
    qrCode: "QR-CARPET-003",
    name: "Wool Blend Carpet",
    category: "Handmade",
    color: "Green & Brown",
    size: "10x12 feet",
    pattern: "Tribal",
    quantity: 3,
    unit: "pieces",
    materialsUsed: [
      { materialName: "Cotton Yarn (Premium)", quantity: 25, unit: "rolls", cost: 11250 },
      { materialName: "Red Dye (Industrial)", quantity: 6, unit: "liters", cost: 1080 },
      { materialName: "Latex Solution", quantity: 15, unit: "liters", cost: 4800 }
    ],
    totalCost: 17130,
    sellingPrice: 35000,
    status: "low-stock",
    location: "Warehouse A - Shelf 2",
    notes: "Premium wool blend, luxury finish",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    dimensions: "10' x 12' (3.05m x 3.66m)",
    weight: "68 kg",
    thickness: "15 mm",
    pileHeight: "12 mm",
    materialComposition: "60% Wool, 40% Cotton"
  },
  {
    id: "PROD004",
    qrCode: "QR-CARPET-004",
    name: "Kids Room Carpet",
    category: "Machine Made",
    color: "Rainbow",
    size: "5x7 feet",
    pattern: "Cartoon Characters",
    quantity: 0,
    unit: "pieces",
    materialsUsed: [
      { materialName: "Synthetic Yarn", quantity: 12, unit: "rolls", cost: 4560 },
      { materialName: "Red Dye (Industrial)", quantity: 4, unit: "liters", cost: 720 },
      { materialName: "Blue Dye (Industrial)", quantity: 4, unit: "liters", cost: 760 }
    ],
    totalCost: 6040,
    sellingPrice: 12000,
    status: "out-of-stock",
    location: "Warehouse C - Shelf 1",
    notes: "Child-safe materials, vibrant colors",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center",
    dimensions: "5' x 7' (1.52m x 2.13m)",
    weight: "18 kg",
    thickness: "8 mm",
    pileHeight: "5 mm",
    materialComposition: "100% Synthetic"
  }
];

// Individual product pieces with unique QR codes
const individualProducts: IndividualProduct[] = [
  // Traditional Persian Carpet (PROD001) - 5 pieces
  {
    id: "IND001",
    qrCode: "QR-CARPET-001-001",
    productId: "PROD001",
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

const statusStyles = {
  "in-stock": "bg-success text-success-foreground",
  "low-stock": "bg-warning text-warning-foreground",
  "out-of-stock": "bg-destructive text-destructive-foreground",
  "expired": "bg-destructive text-destructive-foreground"
};

export default function Products() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isImportProductsOpen, setIsImportProductsOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Load products from localStorage
  useEffect(() => {
    const loadProducts = () => {
      const existingProducts = getFromStorage('rajdhani_products');
      console.log('Loading products from localStorage:', existingProducts);
      console.log('Type of existingProducts:', typeof existingProducts);
      console.log('Is array:', Array.isArray(existingProducts));
      console.log('Length:', existingProducts?.length);
      
      // Ensure we have a proper array
      if (Array.isArray(existingProducts)) {
        setProducts(existingProducts);
      } else {
        console.log('Not an array, setting empty array');
        setProducts([]);
      }
    };

    loadProducts();
  }, []);

  // Reload products when page becomes visible (in case data was updated)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const existingProducts = getFromStorage('rajdhani_products');
        console.log('Page visible, reloading products:', existingProducts);
        setProducts(existingProducts || []);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    color: "",
    size: "",
    pattern: "",
    quantity: "",
    unit: "",
    sellingPrice: "",
    location: "",
    notes: ""
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Generate unique QR code
  const generateQRCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `QR-CARPET-${timestamp}-${random}`;
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
  };

  // Get similar products by pattern
  const getSimilarProducts = (currentProduct: Product) => {
    return (products || []).filter(product => 
      product?.pattern === currentProduct.pattern && 
      product?.id !== currentProduct.id
    );
  };

  // Get individual products for a specific product
  const getIndividualProducts = (productId: string) => {
    return (individualProducts || []).filter(ind => ind?.productId === productId);
  };



  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportStatus('idle');
      setImportErrors([]);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        setImportPreview(data.slice(0, 5));
      };
      reader.readAsText(file);
    }
  };

  // Download sample template
  const downloadTemplate = () => {
    const template = `Product Name,Category,Color,Size,Pattern,Quantity,Unit,Selling Price,Location,Notes
Traditional Persian Carpet,Handmade,Red & Gold,8x10 feet,Persian Medallion,5,pieces,25000,Warehouse A - Shelf 1,High-quality traditional design
Modern Geometric Carpet,Machine Made,Blue & White,6x9 feet,Geometric,12,pieces,18000,Warehouse B - Shelf 3,Contemporary design
Wool Blend Carpet,Handmade,Green & Brown,10x12 feet,Tribal,3,pieces,35000,Warehouse A - Shelf 2,Premium wool blend`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Process import
  const processImport = () => {
    if (!importFile) return;
    
    setImportStatus('processing');
    setImportErrors([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).filter(line => line.trim());
      
      const errors: string[] = [];
      const validProducts: Product[] = [];
      
      data.forEach((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, headerIndex) => {
          row[header] = values[headerIndex] || '';
        });
        
        // Validate required fields
        if (!row['Product Name']) {
          errors.push(`Row ${index + 2}: Product Name is required`);
          return;
        }
        if (!row['Category']) {
          errors.push(`Row ${index + 2}: Category is required`);
          return;
        }
        if (!row['Quantity'] || isNaN(Number(row['Quantity']))) {
          errors.push(`Row ${index + 2}: Quantity must be a valid number`);
          return;
        }
        
                 // Create product object
         const product: Product = {
           id: `PROD${Date.now()}_${index}`,
           qrCode: generateQRCode(),
           name: row['Product Name'],
           category: row['Category'],
           color: row['Color'] || 'N/A',
           size: row['Size'] || 'N/A',
           pattern: row['Pattern'] || 'N/A',
           quantity: parseInt(row['Quantity']),
           unit: row['Unit'] || 'pieces',
           materialsUsed: [],
           totalCost: 0,
           sellingPrice: parseFloat(row['Selling Price']) || 0,
           status: "in-stock",
           location: row['Location'] || 'Warehouse A',
           notes: row['Notes'] || '',
           imageUrl: "",
           dimensions: row['Dimensions'] || 'Standard',
           weight: row['Weight'] || 'Standard',
           thickness: row['Thickness'] || 'Standard',
           pileHeight: row['Pile Height'] || 'Standard',
           materialComposition: row['Material Composition'] || 'Standard'
         };
        
        validProducts.push(product);
      });
      
      if (errors.length > 0) {
        setImportErrors(errors);
        setImportStatus('error');
        return;
      }
      
      console.log('Imported products:', validProducts);
      
      // Save products to localStorage
      const existingProducts = JSON.parse(localStorage.getItem('rajdhani_products') || '[]');
      const updatedProducts = [...existingProducts, ...validProducts];
      localStorage.setItem('rajdhani_products', JSON.stringify(updatedProducts));
      
      // Create individual stock details for each product
      const individualProducts: IndividualProduct[] = [];
      validProducts.forEach(product => {
        for (let i = 0; i < product.quantity; i++) {
          const individualProduct: IndividualProduct = {
            id: `${product.id}_${i + 1}`,
            qrCode: generateQRCode(),
            productId: product.id,
            materialsUsed: [],
            finalDimensions: product.dimensions,
            finalWeight: product.weight,
            finalThickness: product.thickness,
            finalPileHeight: product.pileHeight,
            qualityGrade: 'A', // Default quality grade
            inspector: 'System Import',
            status: 'available',
            notes: `Imported from Excel - Item ${i + 1} of ${product.quantity}`
          };
          individualProducts.push(individualProduct);
        }
      });
      
      // Save individual products to localStorage
      const existingIndividualProducts = JSON.parse(localStorage.getItem('rajdhani_individual_products') || '[]');
      const updatedIndividualProducts = [...existingIndividualProducts, ...individualProducts];
      localStorage.setItem('rajdhani_individual_products', JSON.stringify(updatedIndividualProducts));
      
      setImportStatus('success');
      
      setTimeout(() => {
        setIsImportProductsOpen(false);
        setImportFile(null);
        setImportPreview([]);
        setImportStatus('idle');
        setImportErrors([]);
        alert(`Successfully imported ${validProducts.length} products with ${individualProducts.length} individual stock items!`);
      }, 2000);
    };
    reader.readAsText(importFile);
  };

  // Filter and sort products
  const filteredProducts = (products || [])
    .filter(product => {
      if (!product) return false;
      
      const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.qrCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.color || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      
      let matchesStatus = true;
      if (statusFilter === "low-stock") {
        matchesStatus = product.status === "low-stock";
      } else if (statusFilter === "out-of-stock") {
        matchesStatus = product.status === "out-of-stock";
      } else if (statusFilter === "in-stock") {
        matchesStatus = product.status === "in-stock";
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));

  const categories = [...new Set((products || []).map(p => p?.category).filter(Boolean))];
  const totalProducts = (products || []).length;
  const lowStockCount = (products || []).filter(p => p?.status === "low-stock" || p?.status === "out-of-stock").length;
  const totalValue = (products || []).reduce((sum, p) => sum + ((p?.quantity || 0) * (p?.sellingPrice || 0)), 0);

  // Calculate available pieces for each product (excluding sold and damaged)
  const getAvailablePieces = (productId: string) => {
    return (individualProducts || []).filter(ind => 
      ind?.productId === productId && ind?.status === "available"
    ).length;
  };

  // Handle adding product to production
  const handleAddToProduction = (product: Product) => {
    // Get all individual stock details for this product
    const individualProducts = getFromStorage('rajdhani_individual_products') || [];
    const productIndividualStocks = individualProducts.filter((item: IndividualProduct) => 
      item.productId === product.id
    );

    // Create complete product data with individual stock details
    const completeProductData = {
      ...product,
      individualStocks: productIndividualStocks
    };

    navigate('/production/new-batch', { 
      state: { 
        selectedProduct: completeProductData
      }
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Product Inventory Management" 
        subtitle="Track finished carpet products, manage stock levels and monitor inventory"
      />

      {/* Debug and Refresh Section */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Products loaded: {products.length} | 
          localStorage: {localStorage.getItem('rajdhani_products') ? 'Has data' : 'Empty'} |
          {products.length > 0 && `First product: ${products[0]?.name || 'No name'}`}
        </div>
        <Button 
          onClick={() => {
            const existingProducts = getFromStorage('rajdhani_products');
            console.log('Manual refresh - products:', existingProducts);
            console.log('Raw localStorage data:', localStorage.getItem('rajdhani_products'));
            console.log('Type of existingProducts:', typeof existingProducts);
            console.log('Is array:', Array.isArray(existingProducts));
            
            if (Array.isArray(existingProducts)) {
              setProducts(existingProducts);
            } else {
              console.log('Not an array, setting empty array');
              setProducts([]);
            }
          }}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <div className="flex flex-col gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="inventory">Product Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search products or QR codes..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 shrink-0">
              {/* Import Products Button */}
              <Dialog open={isImportProductsOpen} onOpenChange={setIsImportProductsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Import Products
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Import Products from Excel/CSV</DialogTitle>
                    <DialogDescription>
                      Import your finished products from an Excel or CSV file. Download the template below to see the required format.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Template Download */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Download Template</h4>
                          <p className="text-sm text-blue-700">
                            Download our CSV template to ensure your data is in the correct format.
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={downloadTemplate}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Template
                        </Button>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div>
                      <Label>Upload CSV/Excel File</Label>
                      <div className="mt-2">
                        {importFile ? (
                          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-green-900">{importFile.name}</span>
                            </div>
                            <p className="text-sm text-green-700 mb-3">
                              File selected successfully. Review the preview below.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImportFile(null);
                                setImportPreview([]);
                                setImportStatus('idle');
                                setImportErrors([]);
                              }}
                            >
                              Change File
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                            <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">Click to upload CSV or Excel file</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('import-file')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                            <input
                              id="import-file"
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              className="hidden"
                              onChange={handleFileImport}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Import Preview */}
                    {importPreview.length > 0 && (
                      <div>
                        <Label>Data Preview (First 5 rows)</Label>
                        <div className="mt-2 border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted">
                                <tr>
                                  {Object.keys(importPreview[0] || {}).map(header => (
                                    <th key={header} className="p-2 text-left font-medium">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {importPreview.map((row, index) => (
                                  <tr key={index} className="border-t">
                                    {Object.values(row).map((value, valueIndex) => (
                                      <td key={valueIndex} className="p-2">
                                        {String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Import Errors */}
                    {importErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <h4 className="font-medium text-red-900">Import Errors</h4>
                        </div>
                        <div className="space-y-1">
                          {importErrors.map((error, index) => (
                            <p key={index} className="text-sm text-red-700">{error}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Import Status */}
                    {importStatus === 'processing' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-blue-900">Processing import...</span>
                        </div>
                      </div>
                    )}

                    {importStatus === 'success' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-900">Import completed successfully!</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsImportProductsOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={processImport}
                      disabled={!importFile || importStatus === 'processing'}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Import Products
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Add Product Button */}
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product to Inventory</DialogTitle>
                    <DialogDescription>
                      Add a finished carpet product to your inventory with unique QR code tracking.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="e.g., Traditional Persian Carpet"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Handmade">Handmade</SelectItem>
                            <SelectItem value="Machine Made">Machine Made</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          value={newProduct.color}
                          onChange={(e) => setNewProduct({...newProduct, color: e.target.value})}
                          placeholder="e.g., Red & Gold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="size">Size</Label>
                        <Input
                          id="size"
                          value={newProduct.size}
                          onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}
                          placeholder="e.g., 8x10 feet"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pattern">Pattern</Label>
                        <Input
                          id="pattern"
                          value={newProduct.pattern}
                          onChange={(e) => setNewProduct({...newProduct, pattern: e.target.value})}
                          placeholder="e.g., Persian Medallion"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newProduct.quantity}
                          onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                          placeholder="5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={newProduct.unit} onValueChange={(value) => setNewProduct({...newProduct, unit: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pieces">Pieces</SelectItem>
                            <SelectItem value="sqm">Square Meters</SelectItem>
                            <SelectItem value="sets">Sets</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                      </div>
                      <div>
                        <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                        <Input
                          id="sellingPrice"
                          type="number"
                          value={newProduct.sellingPrice}
                          onChange={(e) => setNewProduct({...newProduct, sellingPrice: e.target.value})}
                          placeholder="25000"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newProduct.location}
                        onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                        placeholder="e.g., Warehouse A - Shelf 1"
                      />
                    </div>
                                         <div>
                       <Label htmlFor="notes">Notes</Label>
                       <Textarea
                         id="notes"
                         value={newProduct.notes}
                         onChange={(e) => setNewProduct({...newProduct, notes: e.target.value})}
                         placeholder="Additional notes about the product..."
                         className="min-h-[60px]"
                       />
                     </div>
                     
                     {/* Image Upload */}
                     <div>
                       <Label>Product Image (Optional)</Label>
                       <div className="mt-2">
                         {imagePreview ? (
                           <div className="relative">
                             <img 
                               src={imagePreview} 
                               alt="Preview" 
                               className="w-32 h-32 object-cover rounded-lg border"
                             />
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               className="absolute top-2 right-2"
                               onClick={removeImage}
                             >
                               <X className="w-4 h-4" />
                             </Button>
                           </div>
                         ) : (
                           <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                             <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                             <p className="text-sm text-muted-foreground mb-2">Click to upload product image</p>
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               onClick={() => document.getElementById('product-image')?.click()}
                             >
                               <Upload className="w-4 h-4 mr-2" />
                               Choose Image
                             </Button>
                             <input
                               id="product-image"
                               type="file"
                               accept="image/*"
                               className="hidden"
                               onChange={handleImageUpload}
                             />
                           </div>
                         )}
                       </div>
                     </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      // Add product logic here
                      setIsAddProductOpen(false);
                      alert("Product added successfully! QR codes will be generated for each piece.");
                    }}>
                      Add Product
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <TabsContent value="inventory" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Different product types
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Package className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{(totalValue || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Inventory value
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Pieces</CardTitle>
                <QrCode className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(products || []).reduce((sum, p) => sum + getAvailablePieces(p?.id || ''), 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for sale
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">QR Code</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => (
                      <tr key={product?.id || `product-${index}`} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Image className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{product.name || 'Unnamed Product'}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.color || 'Unknown'} • {product.size || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{product.qrCode || 'No QR Code'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{product.category || 'Unknown'}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">
                              {getAvailablePieces(product.id || '')} {product.unit || 'pieces'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ₹{(product.sellingPrice || 0).toLocaleString()} each
                            </div>
                            {getAvailablePieces(product.id || '') !== (product.quantity || 0) && (
                              <div className="text-xs text-muted-foreground">
                                Total: {product.quantity || 0} pieces
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={statusStyles[product.status || 'in-stock']}>
                            {(product.status || 'in-stock').replace("-", " ")}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-foreground">{product.location || 'Not specified'}</div>
                        </td>
                                                                         <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/product-stock/${product.id}`)}
                            >
                              <Hash className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsEditProductOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddToProduction(product)}
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              <Play className="w-4 h-4" />
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
        </TabsContent>
             </Tabs>

       {/* Edit Product Dialog */}
       <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
         <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Edit Product</DialogTitle>
             <DialogDescription>
               Update product information and details.
             </DialogDescription>
           </DialogHeader>
           {selectedProduct && (
             <div className="space-y-4">
               <div>
                 <Label htmlFor="editName">Product Name</Label>
                 <Input
                   id="editName"
                   value={selectedProduct.name}
                   onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="editQuantity">Quantity</Label>
                   <Input
                     id="editQuantity"
                     type="number"
                     value={selectedProduct.quantity}
                     onChange={(e) => setSelectedProduct({...selectedProduct, quantity: parseInt(e.target.value)})}
                   />
                 </div>
                 <div>
                   <Label htmlFor="editPrice">Selling Price (₹)</Label>
                   <Input
                     id="editPrice"
                     type="number"
                     value={selectedProduct.sellingPrice}
                     onChange={(e) => setSelectedProduct({...selectedProduct, sellingPrice: parseFloat(e.target.value)})}
                   />
                 </div>
               </div>
               <div>
                 <Label htmlFor="editLocation">Location</Label>
                 <Input
                   id="editLocation"
                   value={selectedProduct.location}
                   onChange={(e) => setSelectedProduct({...selectedProduct, location: e.target.value})}
                 />
               </div>
               <div>
                 <Label htmlFor="editNotes">Notes</Label>
                 <Textarea
                   id="editNotes"
                   value={selectedProduct.notes}
                   onChange={(e) => setSelectedProduct({...selectedProduct, notes: e.target.value})}
                   className="min-h-[60px]"
                 />
               </div>
             </div>
           )}
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
               Cancel
             </Button>
             <Button onClick={() => {
               setIsEditProductOpen(false);
               alert("Product updated successfully!");
             }}>
               Save Changes
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>


     </div>
   );
 }
