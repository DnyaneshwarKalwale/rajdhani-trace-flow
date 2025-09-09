import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFromStorage, saveProductRecipe, createRecipeFromMaterials } from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Package, AlertTriangle, QrCode, Calendar, 
  Edit, Eye, Hash, Image, ShoppingCart, Star, Truck,
  CheckCircle, Clock, MapPin, Scale, Ruler, Layers
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
  manufacturingDate: string;
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
    manufacturingDate: "2024-01-20",
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
  }
];

const individualProducts: IndividualProduct[] = [
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
    status: "available"
  }
];

const statusStyles = {
  "in-stock": "bg-success text-success-foreground",
  "low-stock": "bg-warning text-warning-foreground",
  "out-of-stock": "bg-destructive text-destructive-foreground",
  "expired": "bg-destructive text-destructive-foreground"
};

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [individualProducts, setIndividualProducts] = useState<IndividualProduct[]>([]);
  const [recipeSaved, setRecipeSaved] = useState(false);

  useEffect(() => {
    // Initialize sample data if not exists
    initializeSampleData();

    // Find product by ID from localStorage
    const allProducts = getFromStorage('rajdhani_products') || [];
    console.log('ProductDetail - Loading products:', allProducts);
    console.log('ProductDetail - Looking for productId:', productId);
    
    const foundProduct = allProducts.find((p: Product) => p?.id === productId);
    console.log('ProductDetail - Found product:', foundProduct);
    
    if (foundProduct) {
      console.log('ProductDetail - Product materialsUsed:', foundProduct.materialsUsed);
      console.log('ProductDetail - Product totalCost:', foundProduct.totalCost);
      setProduct(foundProduct);
      setSelectedImage(foundProduct.imageUrl || "");
    }

    // Load individual products for this product
    const allIndividualProducts = getFromStorage('rajdhani_individual_products') || [];
    const productIndividualStocks = allIndividualProducts.filter((item: IndividualProduct) => 
      item?.productId === productId
    );
    console.log('ProductDetail - Individual products:', productIndividualStocks);
    setIndividualProducts(productIndividualStocks);
  }, [productId]);

  // Initialize sample data to localStorage
  const initializeSampleData = () => {
    // Check if products already exist in localStorage
    const existingProducts = getFromStorage('rajdhani_products');
    if (existingProducts.length === 0) {
      // Add sample products to localStorage
      const productsWithTimestamps = sampleProducts.map(product => ({
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      localStorage.setItem('rajdhani_products', JSON.stringify(productsWithTimestamps));
    }

    // Check if individual products already exist in localStorage
    const existingIndividualProducts = getFromStorage('rajdhani_individual_products');
    if (existingIndividualProducts.length === 0) {
      // Add sample individual products to localStorage
      localStorage.setItem('rajdhani_individual_products', JSON.stringify(individualProducts));
    }
  };

  // Save material recipe to localStorage
  const handleSaveRecipe = () => {
    if (!product) return;

    // Get raw materials from inventory to match IDs
    const rawMaterials = getFromStorage('rajdhani_raw_materials') || [];
    
    // Convert product materials to recipe format with actual raw material IDs
    const recipeMaterials = (product.materialsUsed || []).map(material => {
      // Try to find matching raw material by name with better matching logic
      const matchingRawMaterial = rawMaterials.find(rm => {
        const rmName = rm.name.toLowerCase();
        const materialName = material.materialName.toLowerCase();
        
        // Exact match
        if (rmName === materialName) return true;
        
        // Check if material name contains raw material name or vice versa
        if (rmName.includes(materialName) || materialName.includes(rmName)) return true;
        
        // Check for key words (e.g., "Cotton Yarn" matches "Cotton Yarn (Premium)")
        const rmKeywords = rmName.split(/[\s\(\)]+/).filter(word => word.length > 2);
        const materialKeywords = materialName.split(/[\s\(\)]+/).filter(word => word.length > 2);
        
        return rmKeywords.some(keyword => 
          materialKeywords.some(materialKeyword => 
            keyword.includes(materialKeyword) || materialKeyword.includes(keyword)
          )
        );
      });
      
      if (matchingRawMaterial) {
        return {
          id: matchingRawMaterial.id,
          name: matchingRawMaterial.name,
          selectedQuantity: material.quantity,
          unit: material.unit,
          costPerUnit: matchingRawMaterial.costPerUnit
        };
      } else {
        // If no match found, create a placeholder with the original material name
        return {
          id: `MAT_${material.materialName.replace(/\s+/g, '_').toUpperCase()}`,
          name: material.materialName,
          selectedQuantity: material.quantity,
          unit: material.unit,
          costPerUnit: material.cost / material.quantity
        };
      }
    });

    const recipe = createRecipeFromMaterials(
      product.id,
      product.name,
      recipeMaterials
    );

    console.log('Saving recipe:', recipe);
    console.log('Raw materials available:', rawMaterials.map(rm => ({ id: rm.id, name: rm.name, brand: rm.brand, supplier: rm.supplier })));
    saveProductRecipe(recipe);
    setRecipeSaved(true);
  };

  // Save complete product data and individual stock details to localStorage
  const handleSaveCompleteData = () => {
    if (!product) return;

    // Create complete product data with individual stock details
    const completeProductData = {
      ...product,
      individualStocks: individualProducts,
      savedAt: new Date().toISOString()
    };

    // Save to production product data storage
    const existingProductData = getFromStorage('rajdhani_production_product_data');
    const updatedProductData = existingProductData.filter((item: any) => item.id !== product.id);
    updatedProductData.push(completeProductData);
    localStorage.setItem('rajdhani_production_product_data', JSON.stringify(updatedProductData));

    // Also save individual stock details separately
    const existingIndividualStocks = getFromStorage('rajdhani_individual_products');
    const updatedIndividualStocks = existingIndividualStocks.filter((item: any) => item.productId !== product.id);
    updatedIndividualStocks.push(...individualProducts);
    localStorage.setItem('rajdhani_individual_products', JSON.stringify(updatedIndividualStocks));
  };

  const getSimilarProducts = (currentProduct: Product) => {
    const allProducts = getFromStorage('rajdhani_products') || [];
    return allProducts.filter(p => 
      p?.pattern === currentProduct.pattern && 
      p?.id !== currentProduct.id
    );
  };

  const getIndividualProducts = (productId: string) => {
    return (individualProducts || []).filter(ind => ind?.productId === productId);
  };

  // Calculate available pieces for each product (excluding sold and damaged)
  const getAvailablePieces = (productId: string) => {
    return (individualProducts || []).filter(ind => 
      ind?.productId === productId && ind?.status === "available"
    ).length;
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
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">Product Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/product-stock/${product.id}`)}>
            <Hash className="w-4 h-4 mr-2" />
            View Stock ({getAvailablePieces(product.id)} available)
          </Button>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Similar Products */}
          {getSimilarProducts(product).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Products Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {(getSimilarProducts(product) || []).map((similarProduct) => (
                    <div 
                      key={similarProduct.id} 
                      className="text-center cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors"
                      onClick={() => navigate(`/product/${similarProduct.id}`)}
                    >
                      <div className="w-full aspect-square rounded overflow-hidden bg-muted mb-2">
                        {similarProduct.imageUrl ? (
                          <img 
                            src={similarProduct.imageUrl} 
                            alt={similarProduct.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium">{similarProduct.color}</p>
                      <p className="text-xs text-muted-foreground">{getAvailablePieces(similarProduct.id)} available</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Product Details */}
        <div className="space-y-6">
          {/* Product Header */}
          <div>
            <h2 className="text-3xl font-bold">{product.name}</h2>
            <p className="text-xl text-muted-foreground mt-2">{product.pattern}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline" className="text-lg px-3 py-1">{product.category}</Badge>
              <Badge className={`${statusStyles[product.status]} text-lg px-3 py-1`}>
                {product.status.replace("-", " ")}
              </Badge>
            </div>
          </div>

          {/* Price and Stock */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">₹{product.sellingPrice.toLocaleString()}</p>
                  <p className="text-muted-foreground">per piece</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{product.quantity} {product.unit} available</p>
                  <p className="text-sm text-muted-foreground">In stock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={() => navigate(`/product-stock/${product.id}`)}
            >
              <Hash className="w-5 h-5 mr-2" />
              View Individual Stock
            </Button>
            <Button variant="outline" size="lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Order
            </Button>
          </div>

          {/* Product Details Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Product Overview</CardTitle>
                    <Button 
                      onClick={handleSaveCompleteData}
                      variant="outline"
                      size="sm"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Save Complete Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{product.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Manufacturing Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(product.manufacturingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Scale className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Weight</p>
                        <p className="text-sm text-muted-foreground">{product.weight}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Ruler className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Dimensions</p>
                        <p className="text-sm text-muted-foreground">{product.dimensions}</p>
                      </div>
                    </div>
                  </div>
                  {product.notes && (
                    <div>
                      <p className="font-medium mb-2">Notes</p>
                      <p className="text-sm text-muted-foreground">{product.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Material Composition</Label>
                        <p className="text-sm text-muted-foreground">{product.materialComposition}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Thickness</Label>
                        <p className="text-sm text-muted-foreground">{product.thickness}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Pile Height</Label>
                        <p className="text-sm text-muted-foreground">{product.pileHeight}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Size</Label>
                        <p className="text-sm text-muted-foreground">{product.size}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Color</Label>
                        <p className="text-sm text-muted-foreground">{product.color}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Pattern</Label>
                        <p className="text-sm text-muted-foreground">{product.pattern}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Materials Used</CardTitle>
                    <Button 
                      onClick={handleSaveRecipe}
                      variant={recipeSaved ? "secondary" : "default"}
                      size="sm"
                      className={recipeSaved ? "bg-green-100 text-green-700" : ""}
                    >
                      {recipeSaved ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Recipe Saved
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 mr-2" />
                          Save Recipe
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(product.materialsUsed || []).map((material, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{material.materialName}</p>
                          <p className="text-sm text-muted-foreground">
                            {material.quantity} {material.unit}
                          </p>
                        </div>
                        <p className="font-medium">₹{material.cost.toLocaleString()}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-t">
                      <p className="font-medium">Total Material Cost</p>
                      <p className="font-bold">₹{product.totalCost.toLocaleString()}</p>
                    </div>
                  </div>
                  {recipeSaved && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✅ Material recipe saved! This recipe will be auto-loaded when you add this product to production.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>QR Code Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <QrCode className="w-5 h-5 text-primary" />
                        <h4 className="font-medium">Product QR Code</h4>
                      </div>
                      <div className="font-mono text-lg bg-background p-3 rounded border">
                        {product.qrCode}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Each piece has a unique QR code for individual tracking
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">Quality Assured</p>
                        <p className="text-sm text-muted-foreground">All pieces individually inspected</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Traceable</p>
                        <p className="text-sm text-muted-foreground">Full manufacturing history available</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Stock Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Individual Stock Details ({individualProducts.length} pieces)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {individualProducts.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {(individualProducts || []).map((stock) => (
                        <div key={stock.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-gray-500">ID:</span> {stock.id}</div>
                            <div><span className="text-gray-500">QR Code:</span> {stock.qrCode}</div>
                            <div><span className="text-gray-500">Dimensions:</span> {stock.finalDimensions}</div>
                            <div><span className="text-gray-500">Weight:</span> {stock.finalWeight}</div>
                            <div><span className="text-gray-500">Thickness:</span> {stock.finalThickness}</div>
                            <div><span className="text-gray-500">Pile Height:</span> {stock.finalPileHeight}</div>
                            <div><span className="text-gray-500">Quality:</span> 
                              <Badge variant={stock.qualityGrade === "A+" ? "default" : "secondary"} className="ml-1 text-xs">
                                {stock.qualityGrade}
                              </Badge>
                            </div>
                            <div><span className="text-gray-500">Status:</span> 
                              <Badge variant={stock.status === "available" ? "default" : "secondary"} className="ml-1 text-xs">
                                {stock.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No individual stock details available</p>
                      <p className="text-sm">Individual pieces will be created during production</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
