import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFromStorage, saveToStorage, replaceStorage, saveProductRecipe, createRecipeFromMaterials, generateUniqueId, getNotifications, markNotificationAsRead, resolveNotification } from "@/lib/storage";
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
  Edit, Eye, Filter, SortAsc, SortDesc, Hash, Play, RefreshCw,
  Bell, Factory, Clock, ArrowRight, Copy
} from "lucide-react";

interface ProductMaterial {
  materialId: string;
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
  status: "in-stock" | "low-stock" | "out-of-stock" | "expired" | "in-production";
  location: string;
  notes: string;
  imageUrl?: string;
  dimensions: string;
  weight: string;
  thickness: string;
  width: string;
  height: string;
  pileHeight: string;
  manufacturingDate?: string;
  individualStockTracking?: boolean;
}

interface IndividualProduct {
  id: string;
  qrCode: string;
  productId: string;
  productName?: string;
  size?: string;
  color?: string;
  pattern?: string;
  pileHeight?: string;
  weight?: string;
  thickness?: string;
  dimensions?: string;
  width?: string;
  height?: string;
  materialsUsed: ProductMaterial[];
  finalDimensions: string;
  finalWeight: string;
  finalThickness: string;
  finalWidth: string;
  finalHeight: string;
  finalPileHeight?: string;
  finalQualityGrade?: string;
  qualityGrade: string;
  inspector?: string;
  notes: string;
  status: "available" | "sold" | "damaged";
  location?: string;
  addedDate?: string;
  productionDate?: string;
  completionDate?: string;
}

const statusStyles = {
  "in-stock": "bg-success text-success-foreground",
  "low-stock": "bg-warning text-warning-foreground",
  "out-of-stock": "bg-destructive text-destructive-foreground",
  "expired": "bg-destructive text-destructive-foreground",
  "in-production": "bg-orange-100 text-orange-800 border-orange-200"
};

export default function Products() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isImportProductsOpen, setIsImportProductsOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDuplicateProductOpen, setIsDuplicateProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [duplicateProduct, setDuplicateProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic dropdown state
  const [categories, setCategories] = useState<string[]>(["Handmade", "Machine Made", "Custom", "Plain Carpet"]);
  const [colors, setColors] = useState<string[]>(["Red", "Blue", "Green", "Brown", "White", "Black", "Red & Gold", "Blue & White", "Green & Gold", "Brown & Beige", "Black & White", "Multi-Color", "NA"]);
  const [colorSearchTerm, setColorSearchTerm] = useState("");
  const [sizes, setSizes] = useState<string[]>(["3x5 feet", "5x7 feet", "6x9 feet", "8x10 feet", "9x12 feet", "10x14 feet", "Custom"]);
  
  // Filter colors based on search term
  const getFilteredColors = () => {
    if (!colorSearchTerm.trim()) return colors;
    return colors.filter(color => 
      color.toLowerCase().includes(colorSearchTerm.toLowerCase())
    );
  };
  const [patterns, setPatterns] = useState<string[]>(["Persian Medallion", "Geometric", "Floral", "Traditional", "Modern", "Abstract", "Tribal", "Plain", "Custom"]);
  const [units, setUnits] = useState<string[]>(["pieces", "sqm", "sets", "rolls", "kg", "gm", "m", "cm", "mm"]);
  const [locations, setLocations] = useState<string[]>(["Warehouse A - Shelf 1", "Warehouse A - Shelf 2", "Warehouse B - Shelf 1", "Warehouse B - Shelf 2", "Warehouse C - Shelf 1"]);
  const [pileHeights, setPileHeights] = useState<string[]>(["3mm", "4mm", "5mm", "6mm", "7mm", "8mm", "9mm", "10mm", "11mm", "12mm", "13mm", "14mm", "15mm", "16mm", "18mm", "20mm", "22mm", "25mm"]);
  
  // Load products from storage on component mount
  useEffect(() => {
    const loadedProducts = getFromStorage('rajdhani_products') || [];
    console.log("Loaded products from storage:", loadedProducts);
    
    // Ensure we're working with a proper array
    if (Array.isArray(loadedProducts)) {
      setProducts(loadedProducts);
    } else {
      console.error("Products data is not an array:", loadedProducts);
      setProducts([]);
    }
  }, []);
  
  // New product form state with essential fields only
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
    notes: "",
    weight: "",
    thickness: "",
    dimensions: "",
    width: "",
    height: "",
    pileHeight: "",
    manufacturingDate: new Date().toISOString().split('T')[0] // Default to current date
  });

  // Materials section state
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [productMaterials, setProductMaterials] = useState<ProductMaterial[]>([]);
  const [newMaterial, setNewMaterial] = useState({
    materialId: "",
    materialName: "",
    quantity: "",
    unit: "",
    cost: ""
  });
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  
  // Add new item states
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newColorInput, setNewColorInput] = useState("");
  const [newSizeInput, setNewSizeInput] = useState("");
  const [newPatternInput, setNewPatternInput] = useState("");
  const [newUnitInput, setNewUnitInput] = useState("");
  const [newLocationInput, setNewLocationInput] = useState("");
  const [newPileHeightInput, setNewPileHeightInput] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddColor, setShowAddColor] = useState(false);
  const [showAddSize, setShowAddSize] = useState(false);
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddPileHeight, setShowAddPileHeight] = useState(false);
  const [materialsApplicable, setMaterialsApplicable] = useState(true);
  const [individualStockTracking, setIndividualStockTracking] = useState(true);

  // Load products and dynamic options from localStorage
  useEffect(() => {
    const loadProducts = () => {
      const existingProducts = getFromStorage('rajdhani_products');
      if (Array.isArray(existingProducts)) {
        setProducts(existingProducts);
      } else {
        setProducts([]);
      }
    };

    const loadDynamicOptions = () => {
      // Load dynamic dropdown options
      const savedCategories = getFromStorage('rajdhani_product_categories');
      const savedColors = getFromStorage('rajdhani_product_colors');
      const savedSizes = getFromStorage('rajdhani_product_sizes');
      const savedPatterns = getFromStorage('rajdhani_product_patterns');
      const savedUnits = getFromStorage('rajdhani_product_units');
      const savedLocations = getFromStorage('rajdhani_product_locations');
      const savedPileHeights = getFromStorage('rajdhani_product_pile_heights');
      
      if (savedCategories.length > 0) setCategories(savedCategories);
      if (savedColors.length > 0) setColors(savedColors);
      if (savedSizes.length > 0) setSizes(savedSizes);
      if (savedPatterns.length > 0) setPatterns(savedPatterns);
      if (savedUnits.length > 0) setUnits(savedUnits);
      if (savedLocations.length > 0) setLocations(savedLocations);
      if (savedPileHeights.length > 0) setPileHeights(savedPileHeights);
    };

    const loadRawMaterials = () => {
      const materials = getFromStorage('rajdhani_raw_materials') || [];
      setRawMaterials(materials);
    };

    loadProducts();
    loadDynamicOptions();
    loadRawMaterials();
  }, []);

  // Load notifications and check for low stock on component mount
  useEffect(() => {
    // Get all notifications and flatten nested arrays
    const allNotifications = getFromStorage('rajdhani_notifications') || [];
    const flattenedNotifications = allNotifications.flat(Infinity);
    
    // Filter for production and product notifications with unread status
    const productionNotifications = flattenedNotifications.filter((notification: any) => 
      notification && notification.module === 'production' && notification.status === 'unread'
    );
    
    const productNotifications = flattenedNotifications.filter((notification: any) => 
      notification && notification.module === 'products' && notification.status === 'unread'
    );
    
    // Combine both types of notifications
    const combinedNotifications = [...productionNotifications, ...productNotifications];
    
    setNotifications(combinedNotifications);
    console.log('📢 Loaded notifications:', combinedNotifications.length);
    console.log('📢 Production notifications:', productionNotifications.length);
    console.log('📢 Product notifications:', productNotifications.length);
    
  }, []);

  // Handle notification actions
  const handleMarkAsRead = (notificationId: string) => {
    // Actually remove the notification from localStorage instead of just marking as read
    const allNotifications = getFromStorage('rajdhani_notifications') || [];
    const flattenedNotifications = allNotifications.flat(Infinity);
    const updatedNotifications = flattenedNotifications.filter(n => n && n.id !== notificationId);
    saveToStorage('rajdhani_notifications', updatedNotifications);
    
    // Update local state
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    console.log('🗑️ Notification marked as read and removed from storage:', notificationId);
  };

  const handleResolveNotification = (notificationId: string) => {
    // Actually remove the notification from localStorage instead of just marking as resolved
    const allNotifications = getFromStorage('rajdhani_notifications') || [];
    const flattenedNotifications = allNotifications.flat(Infinity);
    const updatedNotifications = flattenedNotifications.filter(n => n && n.id !== notificationId);
    saveToStorage('rajdhani_notifications', updatedNotifications);
    
    // Update local state
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    console.log('🗑️ Notification dismissed and removed from storage:', notificationId);
  };

  const handleClearAllNotifications = () => {
    // Clear all notifications from localStorage
    localStorage.removeItem('rajdhani_notifications');
    setNotifications([]);
    console.log('🗑️ All notifications cleared');
  };

  const handleAddToProductionFromNotification = (notification: any) => {
    const product = products.find(p => p.id === notification.relatedData.productId);
    if (product) {
      handleAddToProduction(product);
      handleResolveNotification(notification.id);
    }
  };

  // Generate unique QR code
  const generateQRCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `QR-CARPET-${timestamp}-${random}`;
  };

  // Check if product has individual stock items
  const hasIndividualStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product && product.individualStockTracking !== undefined) {
      return product.individualStockTracking;
    }
    // Fallback: check if individual products exist
    const individualProducts = getFromStorage('rajdhani_individual_products') || [];
    return individualProducts.some((item: IndividualProduct) => item.productId === productId);
  };

  // Auto-calculate dimensions from size
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

  // Handle adding new product
  const handleDuplicateProduct = (product: Product) => {
    console.log("Original product being duplicated:", product);
    
    // Create a copy of the product with new ID and QR code
    const duplicatedProduct: Product = {
      ...product,
      id: generateUniqueId('PROD'),
      qrCode: generateQRCode(),
    };
    
    console.log("Duplicated product:", duplicatedProduct);
    
    setDuplicateProduct(duplicatedProduct);
    setIsDuplicateProductOpen(true);
  };

  const handleSaveDuplicateProduct = () => {
    if (!duplicateProduct) return;
    
    // Validation - required fields
    if (!duplicateProduct.name || !duplicateProduct.category || !duplicateProduct.sellingPrice || !duplicateProduct.unit) {
      console.error("Please fill in all required fields: Name, Category, Selling Price, and Unit");
      return;
    }

    try {
      // Ensure products is a proper array
      const currentProducts = Array.isArray(products) ? products : [];
      console.log("Current products before adding duplicate:", currentProducts);
      console.log("Duplicate product to add:", duplicateProduct);
      
      // Add the duplicated product to the products array
      const updatedProducts = [...currentProducts, duplicateProduct];
      console.log("Updated products after adding duplicate:", updatedProducts);
      
      // Ensure we're saving a clean array
      const cleanProducts = updatedProducts.filter(p => p && typeof p === 'object' && p.id);
      console.log("Clean products to save:", cleanProducts);
      
      setProducts(cleanProducts);
      replaceStorage('rajdhani_products', cleanProducts);

      // Generate individual products if quantity > 0 and individual stock tracking is enabled
      if (duplicateProduct.quantity > 0 && duplicateProduct.individualStockTracking) {
        const individualProducts = getFromStorage('rajdhani_individual_products') || [];
        const newIndividualProducts = [];
        
        // Get current date
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Generate individual products for each quantity
        for (let i = 0; i < duplicateProduct.quantity; i++) {
          const individualProduct: IndividualProduct = {
            id: generateUniqueId('IND'),
            qrCode: generateQRCode(),
            productId: duplicateProduct.id,
            productName: duplicateProduct.name,
            size: duplicateProduct.size,
            color: duplicateProduct.color,
            pattern: duplicateProduct.pattern,
            pileHeight: duplicateProduct.pileHeight,
            weight: duplicateProduct.weight,
            thickness: duplicateProduct.thickness,
            dimensions: duplicateProduct.dimensions,
            width: duplicateProduct.width,
            height: duplicateProduct.height,
            materialsUsed: duplicateProduct.materialsUsed || [],
            qualityGrade: "A", // Default quality grade
            status: "available",
            location: duplicateProduct.location,
            addedDate: currentDate,
            notes: `Auto-generated from ${duplicateProduct.name}`,
            finalPileHeight: duplicateProduct.pileHeight,
            finalWeight: duplicateProduct.weight,
            finalThickness: duplicateProduct.thickness,
            finalDimensions: duplicateProduct.dimensions,
            finalWidth: duplicateProduct.width,
            finalHeight: duplicateProduct.height,
            finalQualityGrade: "A",
            productionDate: currentDate,
            completionDate: currentDate
          };
          
          newIndividualProducts.push(individualProduct);
        }
        
        // Save individual products to storage
        const updatedIndividualProducts = [...(Array.isArray(individualProducts) ? individualProducts : []), ...newIndividualProducts];
        replaceStorage('rajdhani_individual_products', updatedIndividualProducts);
        
        console.log(`Generated ${duplicateProduct.quantity} individual products for ${duplicateProduct.name}`);
      }

      // Reset form and close dialog
      setDuplicateProduct(null);
      setIsDuplicateProductOpen(false);
      
      console.log("Product duplicated successfully:", duplicateProduct.name);
    } catch (error) {
      console.error("Error duplicating product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditProductOpen(true);
  };

  const handleSaveEditProduct = () => {
    if (!selectedProduct) return;
    
    // Validation - required fields
    if (!selectedProduct.name || !selectedProduct.category || !selectedProduct.sellingPrice || !selectedProduct.unit) {
      console.error("Please fill in all required fields: Name, Category, Selling Price, and Unit");
      return;
    }

    try {
      // Update the product in the products array
      const updatedProducts = products.map(p => 
        p.id === selectedProduct.id ? selectedProduct : p
      );
      setProducts(updatedProducts);
      replaceStorage('rajdhani_products', updatedProducts);

      // Reset form and close dialog
      setSelectedProduct(null);
      setIsEditProductOpen(false);
      
      console.log("Product updated successfully:", selectedProduct.name);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleAddProduct = () => {
    // Validation - required fields
    if (!newProduct.name || !newProduct.category || !newProduct.quantity || !newProduct.sellingPrice || !newProduct.unit) {
      console.error("Please fill in all required fields: Name, Category, Quantity, Selling Price, and Unit");
      return;
    }

    try {
      const productId = generateUniqueId('PROD');
      
      // Calculate total cost from materials
      const totalCost = productMaterials.reduce((sum, material) => sum + (material.quantity * material.cost), 0);

      // Create the product object with essential fields only
      const product: Product = {
        id: productId,
        qrCode: generateQRCode(),
        name: newProduct.name,
        category: newProduct.category,
        color: newProduct.color || "NA",
        size: newProduct.size || "NA",
        pattern: newProduct.pattern || "Standard",
        quantity: parseInt(newProduct.quantity),
        unit: newProduct.unit,
        materialsUsed: productMaterials,
        totalCost: totalCost,
        sellingPrice: parseFloat(newProduct.sellingPrice),
        status: "in-stock",
        location: newProduct.location || "Not specified",
        notes: newProduct.notes || "",
        imageUrl: imagePreview || "",
        dimensions: newProduct.dimensions || "Standard",
        weight: newProduct.weight || "NA",
        thickness: newProduct.thickness || "NA",
        width: newProduct.width || "NA",
        height: newProduct.height || "NA",
        pileHeight: newProduct.pileHeight || "NA",
        manufacturingDate: newProduct.manufacturingDate || new Date().toISOString().split('T')[0],
        individualStockTracking: individualStockTracking
      };

      // Save to products storage
      const existingProducts = getFromStorage('rajdhani_products') || [];
      const updatedProducts = Array.isArray(existingProducts) ? [...existingProducts, product] : [product];
      localStorage.setItem('rajdhani_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);

      // Create individual stock items only if individual tracking is enabled
      if (individualStockTracking) {
        const individualProducts: IndividualProduct[] = [];
        const currentDate = new Date().toISOString().split('T')[0];
        
        for (let i = 0; i < product.quantity; i++) {
          const individualProduct: IndividualProduct = {
            id: generateUniqueId('IND'),
            qrCode: generateQRCode(),
            productId: productId,
            productName: product.name,
            size: product.size,
            color: product.color,
            pattern: product.pattern,
            pileHeight: product.pileHeight,
            weight: product.weight,
            thickness: product.thickness,
            dimensions: product.dimensions,
            width: product.width,
            height: product.height,
            materialsUsed: product.materialsUsed || [],
            qualityGrade: 'A',
            status: 'available',
            location: product.location,
            addedDate: currentDate,
            notes: `Item ${i + 1} of ${product.quantity} - Auto-created from product entry`,
            finalPileHeight: product.pileHeight,
            finalWeight: product.weight,
            finalThickness: product.thickness,
            finalDimensions: product.dimensions,
            finalWidth: product.width,
            finalHeight: product.height,
            finalQualityGrade: 'A',
            productionDate: currentDate,
            completionDate: currentDate
          };
          individualProducts.push(individualProduct);
        }

      // Save individual products
      const existingIndividualProducts = getFromStorage('rajdhani_individual_products') || [];
      const updatedIndividualProducts = [...(Array.isArray(existingIndividualProducts) ? existingIndividualProducts : []), ...individualProducts];
      localStorage.setItem('rajdhani_individual_products', JSON.stringify(updatedIndividualProducts));
      }

      // Save recipe if materials were added
      if (productMaterials.length > 0) {
        const recipe = createRecipeFromMaterials(
          productId,
          product.name,
          productMaterials.map(material => ({
            id: material.materialId,
            name: material.materialName,
            quantity: material.quantity,
            unit: material.unit,
            costPerUnit: material.cost,
            selectedQuantity: material.quantity
          })),
          'admin'
        );
        saveProductRecipe(recipe);
        console.log('Recipe saved for product:', product.name, recipe);
      }

      // Update local state
      setProducts([...products, product]);

      // Reset form
      setNewProduct({
        name: "",
        category: "",
        color: "",
        size: "",
        pattern: "",
        quantity: "",
        unit: "",
        sellingPrice: "",
        location: "",
        notes: "",
        weight: "",
        thickness: "",
        dimensions: "",
        width: "",
        height: "",
        pileHeight: "",
        manufacturingDate: new Date().toISOString().split('T')[0]
      });
      setProductMaterials([]);
      setNewMaterial({
        materialId: "",
        materialName: "",
        quantity: "",
        unit: "",
        cost: ""
      });
      setImagePreview("");
      setSelectedImage(null);
      setMaterialsApplicable(true); // Reset to default
      setIndividualStockTracking(true); // Reset to default
      setIsAddProductOpen(false);

      const successMessage = individualStockTracking 
        ? `Product "${product.name}" added successfully!\n${product.quantity} individual stock items created with unique QR codes.`
        : `Product "${product.name}" added successfully!\nBulk quantity: ${product.quantity} ${product.unit} (no individual QR codes).`;
      
      console.log(successMessage);
      
    } catch (error) {
      console.error('Error adding product:', error);
      console.error('Error adding product. Please try again.');
    }
  };

  // Functions to add new options to dropdowns
  const addNewCategory = () => {
    if (newCategoryInput.trim() && !categories.includes(newCategoryInput.trim())) {
      const updatedCategories = [...categories, newCategoryInput.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('rajdhani_product_categories', JSON.stringify(updatedCategories));
      setNewProduct({...newProduct, category: newCategoryInput.trim()});
      setNewCategoryInput("");
      setShowAddCategory(false);
    }
  };

  const addNewColor = () => {
    if (newColorInput.trim() && !colors.includes(newColorInput.trim())) {
      const updatedColors = [...colors, newColorInput.trim()];
      setColors(updatedColors);
      localStorage.setItem('rajdhani_product_colors', JSON.stringify(updatedColors));
      setNewProduct({...newProduct, color: newColorInput.trim()});
      setNewColorInput("");
      setColorSearchTerm(""); // Clear search term when new color is added
      setShowAddColor(false);
    }
  };

  const addNewSize = () => {
    if (newSizeInput.trim() && !sizes.includes(newSizeInput.trim())) {
      const updatedSizes = [...sizes, newSizeInput.trim()];
      setSizes(updatedSizes);
      localStorage.setItem('rajdhani_product_sizes', JSON.stringify(updatedSizes));
      setNewProduct({...newProduct, size: newSizeInput.trim()});
      setNewSizeInput("");
      setShowAddSize(false);
    }
  };

  const addNewPattern = () => {
    if (newPatternInput.trim() && !patterns.includes(newPatternInput.trim())) {
      const updatedPatterns = [...patterns, newPatternInput.trim()];
      setPatterns(updatedPatterns);
      localStorage.setItem('rajdhani_product_patterns', JSON.stringify(updatedPatterns));
      setNewProduct({...newProduct, pattern: newPatternInput.trim()});
      setNewPatternInput("");
      setShowAddPattern(false);
    }
  };

  const addNewUnit = () => {
    if (newUnitInput.trim() && !units.includes(newUnitInput.trim())) {
      const updatedUnits = [...units, newUnitInput.trim()];
      setUnits(updatedUnits);
      localStorage.setItem('rajdhani_product_units', JSON.stringify(updatedUnits));
      setNewProduct({...newProduct, unit: newUnitInput.trim()});
      setNewUnitInput("");
      setShowAddUnit(false);
    }
  };

  const addNewLocation = () => {
    if (newLocationInput.trim() && !locations.includes(newLocationInput.trim())) {
      const updatedLocations = [...locations, newLocationInput.trim()];
      setLocations(updatedLocations);
      localStorage.setItem('rajdhani_product_locations', JSON.stringify(updatedLocations));
      setNewProduct({...newProduct, location: newLocationInput.trim()});
      setNewLocationInput("");
      setShowAddLocation(false);
    }
  };

  const addNewPileHeight = () => {
    if (newPileHeightInput.trim() && !pileHeights.includes(newPileHeightInput.trim())) {
      const updatedPileHeights = [...pileHeights, newPileHeightInput.trim()];
      setPileHeights(updatedPileHeights);
      localStorage.setItem('rajdhani_product_pile_heights', JSON.stringify(updatedPileHeights));
      setNewProduct({...newProduct, pileHeight: newPileHeightInput.trim()});
      setNewPileHeightInput("");
      setShowAddPileHeight(false);
    }
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

  // Material handling functions
  const handleMaterialSelection = (materialId: string) => {
    if (materialId === "add_new") {
      // Navigate to materials page to add new material
      navigate('/materials');
      return;
    }
    
    const selectedMaterial = rawMaterials.find(m => m.id === materialId);
    if (selectedMaterial) {
      setNewMaterial({
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        quantity: "",
        unit: selectedMaterial.unit || "kg",
        cost: selectedMaterial.costPerUnit?.toString() || ""
      });
    }
  };

  const addProductMaterial = () => {
    if (!newMaterial.materialId || !newMaterial.quantity || !newMaterial.cost) {
      console.error("Please fill in all material fields");
      return;
    }

    const material: ProductMaterial = {
      materialId: newMaterial.materialId,
      materialName: newMaterial.materialName,
      quantity: parseFloat(newMaterial.quantity),
      unit: newMaterial.unit,
      cost: parseFloat(newMaterial.cost)
    };

    setProductMaterials([...productMaterials, material]);
    setNewMaterial({
      materialId: "",
      materialName: "",
      quantity: "",
      unit: "",
      cost: ""
    });
  };

  const removeProductMaterial = (index: number) => {
    setProductMaterials(productMaterials.filter((_, i) => i !== index));
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
      } else if (statusFilter === "in-production") {
        matchesStatus = product.status === "in-production";
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));

  const dynamicCategories = [...new Set((products || []).map(p => p?.category).filter(Boolean))];
  const totalProducts = (products || []).length;
  const lowStockCount = (products || []).filter(p => p?.status === "low-stock" || p?.status === "out-of-stock").length;
  const totalValue = (products || []).reduce((sum, p) => sum + ((p?.quantity || 0) * (p?.sellingPrice || 0)), 0);

  // Calculate available pieces for each product (excluding sold and damaged)
  const getAvailablePieces = (productId: string) => {
    const product = products.find(p => p.id === productId);
    
    // If product doesn't have individual stock tracking, return the main quantity
    if (product && product.individualStockTracking === false) {
      return product.quantity || 0;
    }
    
    // For products with individual stock tracking, count available individual products
    const individualProducts = getFromStorage('rajdhani_individual_products') || [];
    return individualProducts.filter((ind: IndividualProduct) => 
      ind?.productId === productId && ind?.status === "available"
    ).length;
  };

  // Get individual products for a specific product
  const getIndividualProducts = (productId: string) => {
    const individualProducts = getFromStorage('rajdhani_individual_products') || [];
    return individualProducts.filter((ind: IndividualProduct) => ind?.productId === productId);
  };

  // Handle adding product to production
  const handleAddToProduction = (product: Product) => {
    console.log('Adding product to production:', product);
    
    // Update product status to "in-production"
    const updatedProducts = products.map(p => 
      p.id === product.id ? { ...p, status: "in-production" as const } : p
    );
    setProducts(updatedProducts);
    replaceStorage('rajdhani_products', updatedProducts);
    
    // Get all individual stock details for this product
    const individualProducts = getFromStorage('rajdhani_individual_products') || [];
    const productIndividualStocks = individualProducts.filter((item: IndividualProduct) => 
      item.productId === product.id
    );

    // Create complete product data with individual stock details
    const completeProductData = {
      ...product,
      status: "in-production" as const,
      individualStocks: productIndividualStocks
    };

    console.log('Navigating to production with data:', completeProductData);
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

      <Tabs defaultValue="inventory" className="space-y-6">
        <div className="flex flex-col gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="inventory">Product Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {notifications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
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
                  {dynamicCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="in-production">In Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 shrink-0">
              {/* Add Product Button */}
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product to Inventory</DialogTitle>
                    <DialogDescription>
                      Add a finished carpet product to your inventory with unique QR code tracking.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Basic Information */}
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
                      {/* Category Dropdown */}
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        {showAddCategory ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new category"
                              value={newCategoryInput}
                              onChange={(e) => setNewCategoryInput(e.target.value)}
                            />
                            <Button size="sm" onClick={addNewCategory}>Add</Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAddCategory(false)}>Cancel</Button>
                          </div>
                        ) : (
                          <Select value={newProduct.category} onValueChange={(value) => {
                            if (value === "add_new") {
                              setShowAddCategory(true);
                            } else {
                              // Auto-set color to NA for Plain Carpet
                              if (value === "Plain Carpet") {
                                setNewProduct({...newProduct, category: value, color: "NA"});
                              } else {
                                setNewProduct({...newProduct, category: value});
                              }
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                              <SelectItem value="add_new" className="text-blue-600 font-medium">
                                + Add New Category
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Color Dropdown */}
                      <div>
                        <Label htmlFor="color">Color</Label>
                        {showAddColor ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new color"
                              value={newColorInput}
                              onChange={(e) => setNewColorInput(e.target.value)}
                            />
                            <Button size="sm" onClick={addNewColor}>Add</Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAddColor(false)}>Cancel</Button>
                          </div>
                        ) : (
                          <Select value={newProduct.color} onValueChange={(value) => {
                            if (value === "add_new") {
                              setShowAddColor(true);
                            } else {
                              setNewProduct({...newProduct, color: value});
                              setColorSearchTerm(""); // Clear search when color is selected
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Search Input */}
                              <div className="p-2 border-b">
                                <Input
                                  placeholder="Search colors..."
                                  value={colorSearchTerm}
                                  onChange={(e) => setColorSearchTerm(e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              
                              {/* Add New Color Option - Always at top */}
                              <SelectItem value="add_new" className="text-blue-600 font-medium">
                                + Add New Color
                              </SelectItem>
                              
                              {/* Color Options */}
                              {getFilteredColors().map(color => (
                                <SelectItem key={color} value={color}>
                                  {color === "NA" ? (
                                    <span className="text-gray-500 italic">NA (No Color)</span>
                                  ) : (
                                    color
                                  )}
                                </SelectItem>
                              ))}
                              
                              {/* Show message if no colors found */}
                              {getFilteredColors().length === 0 && (
                                <div className="p-2 text-sm text-gray-500 text-center">
                                  No colors found matching "{colorSearchTerm}"
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Size Dropdown */}
                      <div>
                        <Label htmlFor="size">Size</Label>
                        {showAddSize ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new size (e.g., 12x15 feet)"
                              value={newSizeInput}
                              onChange={(e) => setNewSizeInput(e.target.value)}
                            />
                            <Button size="sm" onClick={addNewSize}>Add</Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAddSize(false)}>Cancel</Button>
                          </div>
                        ) : (
                          <Select value={newProduct.size} onValueChange={(value) => {
                            if (value === "add_new") {
                              setShowAddSize(true);
                            } else if (value === "NA") {
                              // Clear dimension fields when NA is selected
                              setNewProduct({
                                ...newProduct, 
                                size: value,
                                weight: "",
                                thickness: "",
                                width: "",
                                height: "",
                                dimensions: "",
                                pileHeight: ""
                              });
                            } else {
                              const calculatedDimensions = calculateDimensionsFromSize(value);
                              setNewProduct({
                                ...newProduct, 
                                size: value,
                                // Auto-calculate width, height, and dimensions from size
                                width: calculatedDimensions.width,
                                height: calculatedDimensions.height,
                                dimensions: calculatedDimensions.dimensions
                              });
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {sizes.map(size => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                              ))}
                              <SelectItem value="NA">
                                <span className="text-gray-500 italic">NA (Not Applicable)</span>
                              </SelectItem>
                              <SelectItem value="add_new" className="text-blue-600 font-medium">
                                + Add New Size
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Pattern Dropdown */}
                      <div>
                        <Label htmlFor="pattern">Pattern</Label>
                        {showAddPattern ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new pattern"
                              value={newPatternInput}
                              onChange={(e) => setNewPatternInput(e.target.value)}
                            />
                            <Button size="sm" onClick={addNewPattern}>Add</Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAddPattern(false)}>Cancel</Button>
                          </div>
                        ) : (
                          <Select value={newProduct.pattern} onValueChange={(value) => {
                            if (value === "add_new") {
                              setShowAddPattern(true);
                            } else {
                              setNewProduct({...newProduct, pattern: value});
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                            <SelectContent>
                              {patterns.map(pattern => (
                                <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                              ))}
                              <SelectItem value="NA">
                                <span className="text-gray-500 italic">NA (Not Applicable)</span>
                              </SelectItem>
                              <SelectItem value="add_new" className="text-blue-600 font-medium">
                                + Add New Pattern
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
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
                      
                      {/* Unit Dropdown */}
                      <div>
                        <Label htmlFor="unit">Unit *</Label>
                        {showAddUnit ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new unit (e.g., bundles)"
                              value={newUnitInput}
                              onChange={(e) => setNewUnitInput(e.target.value)}
                            />
                            <Button size="sm" onClick={addNewUnit}>Add</Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAddUnit(false)}>Cancel</Button>
                          </div>
                        ) : (
                          <Select value={newProduct.unit} onValueChange={(value) => {
                            if (value === "add_new") {
                              setShowAddUnit(true);
                            } else {
                              setNewProduct({...newProduct, unit: value});
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map(unit => (
                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                              ))}
                              <SelectItem value="add_new" className="text-blue-600 font-medium">
                                + Add New Unit
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    {/* Individual Stock Tracking Option */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Individual Stock Tracking</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="individualStockTracking"
                            value="yes"
                            checked={individualStockTracking === true}
                            onChange={() => setIndividualStockTracking(true)}
                            className="text-blue-600"
                          />
                          <span className="text-sm">Yes, track individual pieces (with QR codes)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="individualStockTracking"
                            value="no"
                            checked={individualStockTracking === false}
                            onChange={() => setIndividualStockTracking(false)}
                            className="text-blue-600"
                          />
                          <span className="text-sm">No, bulk tracking only (no QR codes)</span>
                        </label>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {individualStockTracking 
                          ? "Each piece will have a unique QR code for individual tracking" 
                          : "Product will be tracked as bulk quantity without individual QR codes"
                        }
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                      {/* Only show weight if size is not NA */}
                      {newProduct.size !== "NA" && (
                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={newProduct.weight}
                          onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                          placeholder="e.g., 45"
                        />
                      </div>
                      )}
                    </div>

                    {/* Only show thickness if size is not NA */}
                    {newProduct.size !== "NA" && (
                    <div>
                      <Label htmlFor="thickness">Thickness (mm) *</Label>
                      <Input
                        id="thickness"
                        type="number"
                        value={newProduct.thickness}
                        onChange={(e) => setNewProduct({...newProduct, thickness: e.target.value})}
                        placeholder="e.g., 12"
                          required
                      />
                    </div>
                    )}

                    {/* Only show pile height if size is not NA */}
                    {newProduct.size !== "NA" && (
                      <div>
                      <Label htmlFor="pileHeight">Pile Height (mm)</Label>
                      {showAddPileHeight ? (
                        <div className="flex gap-2">
                        <Input
                            placeholder="Enter new pile height (e.g., 8mm)"
                            value={newPileHeightInput}
                            onChange={(e) => setNewPileHeightInput(e.target.value)}
                          />
                          <Button size="sm" onClick={addNewPileHeight}>Add</Button>
                          <Button size="sm" variant="outline" onClick={() => setShowAddPileHeight(false)}>Cancel</Button>
                      </div>
                      ) : (
                        <Select value={newProduct.pileHeight} onValueChange={(value) => {
                          if (value === "add_new") {
                            setShowAddPileHeight(true);
                          } else {
                            setNewProduct({...newProduct, pileHeight: value});
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pile height" />
                          </SelectTrigger>
                          <SelectContent>
                            {pileHeights.map(pileHeight => (
                              <SelectItem key={pileHeight} value={pileHeight}>{pileHeight}</SelectItem>
                            ))}
                            <SelectItem value="add_new">
                              <span className="text-blue-600 font-medium">+ Add New Pile Height</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      </div>
                    )}

                    {/* Location Dropdown */}
                    <div>
                      <Label htmlFor="location">Location</Label>
                      {showAddLocation ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter new location (e.g., Warehouse D - Shelf 1)"
                            value={newLocationInput}
                            onChange={(e) => setNewLocationInput(e.target.value)}
                            />
                            <Button size="sm" onClick={addNewLocation}>Add</Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAddLocation(false)}>Cancel</Button>
                          </div>
                        ) : (
                          <Select value={newProduct.location} onValueChange={(value) => {
                            if (value === "add_new") {
                              setShowAddLocation(true);
                            } else {
                              setNewProduct({...newProduct, location: value});
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map(location => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                              <SelectItem value="NA">
                                <span className="text-gray-500 italic">NA (Not Applicable)</span>
                              </SelectItem>
                              <SelectItem value="add_new" className="text-blue-600 font-medium">
                                + Add New Location
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
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

                    {/* Materials Section - Moved to Bottom */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-lg font-medium">Materials Used</Label>
                        <div className="text-sm text-muted-foreground bg-blue-50 px-3 py-1 rounded-lg">
                          💡 Materials added here will be saved as recipe for future production
                        </div>
                      </div>
                      
                      {/* Materials Applicable Selection */}
                      <div className="mb-4">
                        <Label className="text-sm font-medium mb-2 block">Does this product use materials?</Label>
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="materialsApplicable"
                              value="yes"
                              checked={materialsApplicable === true}
                              onChange={() => setMaterialsApplicable(true)}
                              className="text-blue-600"
                            />
                            <span className="text-sm">Yes, add materials</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="materialsApplicable"
                              value="no"
                              checked={materialsApplicable === false}
                              onChange={() => {
                                setMaterialsApplicable(false);
                                // Clear any existing materials when NA is selected
                                setProductMaterials([]);
                              }}
                              className="text-blue-600"
                            />
                            <span className="text-sm">No, not applicable (NA)</span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Add Material Form - Only show if materials are applicable */}
                      {materialsApplicable && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label htmlFor="materialSelect">Select Material</Label>
                              <Select value={newMaterial.materialId} onValueChange={handleMaterialSelection}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose from existing materials" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rawMaterials.map((material) => (
                                    <SelectItem key={material.id} value={material.id}>
                                      {material.name} - {material.currentStock} {material.unit} available
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="add_new" className="text-blue-600 font-medium">
                                    + Add New Material
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="materialName">Material Name</Label>
                              <Input
                                id="materialName"
                                value={newMaterial.materialName}
                                onChange={(e) => setNewMaterial({...newMaterial, materialName: e.target.value})}
                                placeholder="Enter material name"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label htmlFor="materialQuantity">Quantity</Label>
                              <Input
                                id="materialQuantity"
                                type="number"
                                value={newMaterial.quantity}
                                onChange={(e) => setNewMaterial({...newMaterial, quantity: e.target.value})}
                                placeholder="e.g., 5"
                              />
                            </div>
                            <div>
                              <Label htmlFor="materialUnit">Unit</Label>
                              <Input
                                id="materialUnit"
                                value={newMaterial.unit}
                                onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                                placeholder="e.g., kg, rolls"
                              />
                            </div>
                            <div>
                              <Label htmlFor="materialCost">Cost per Unit (₹)</Label>
                              <Input
                                id="materialCost"
                                type="number"
                                value={newMaterial.cost}
                                onChange={(e) => setNewMaterial({...newMaterial, cost: e.target.value})}
                                placeholder="e.g., 150"
                              />
                            </div>
                          </div>
                          
                          <Button onClick={addProductMaterial} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Material to Product
                          </Button>
                        </div>
                      )}

                      {/* Added Materials List - Only show if materials are applicable */}
                      {materialsApplicable && productMaterials.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Added Materials:</Label>
                          {productMaterials.map((material, index) => (
                            <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{material.materialName}</div>
                                <div className="text-sm text-gray-600">
                                  {material.quantity} {material.unit} × ₹{material.cost} = ₹{(material.quantity * material.cost).toFixed(2)}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeProductMaterial(index)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="text-right font-medium text-lg">
                            Total Material Cost: ₹{productMaterials.reduce((sum, m) => sum + (m.quantity * m.cost), 0).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddProduct}>
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
                                  Total: {product.quantity || 0} {product.unit || 'pieces'}
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
                              {hasIndividualStock(product.id) && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/product-stock/${product.id}`)}
                              >
                                <Hash className="w-4 h-4" />
                              </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDuplicateProduct(product)}
                                className="border-green-500 text-green-600 hover:bg-green-50"
                                title="Duplicate Product"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              {hasIndividualStock(product.id) && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleAddToProduction(product)}
                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              )}
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

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Stock Level Distribution */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Distribution</CardTitle>
                  <Package className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>In Stock</span>
                      <span className="font-medium">{products.filter(p => getAvailablePieces(p?.id || '') > 5).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Low Stock</span>
                      <span className="font-medium text-warning">{products.filter(p => {
                        const stock = getAvailablePieces(p?.id || '');
                        return stock > 0 && stock <= 5;
                      }).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Out of Stock</span>
                      <span className="font-medium text-destructive">{products.filter(p => getAvailablePieces(p?.id || '') === 0).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">By Category</CardTitle>
                  <Package className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dynamicCategories.slice(0, 3).map(category => {
                      const count = products.filter(p => p?.category === category).length;
                      return (
                        <div key={category} className="flex justify-between text-sm">
                          <span className="truncate">{category}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                    {dynamicCategories.length > 3 && (
                      <div className="text-xs text-muted-foreground">+{dynamicCategories.length - 3} more</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Value Analytics */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Value Metrics</CardTitle>
                  <Package className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg. Price</span>
                      <span className="font-medium">₹{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (p?.sellingPrice || 0), 0) / products.length).toLocaleString() : 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Highest Value</span>
                      <span className="font-medium">₹{products.length > 0 ? Math.max(...products.map(p => p?.sellingPrice || 0)).toLocaleString() : 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Pieces</span>
                      <span className="font-medium">{products.reduce((sum, p) => sum + getAvailablePieces(p?.id || ''), 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Alerts */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Need Reorder</span>
                      <span className="font-medium text-warning">{products.filter(p => {
                        const stock = getAvailablePieces(p?.id || '');
                        return stock > 0 && stock <= 5;
                      }).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Critical (≤2)</span>
                      <span className="font-medium text-destructive">{products.filter(p => {
                        const stock = getAvailablePieces(p?.id || '');
                        return stock > 0 && stock <= 2;
                      }).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Good Stock</span>
                      <span className="font-medium text-success">{products.filter(p => getAvailablePieces(p?.id || '') > 5).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Products Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Products Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Available Stock</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Value at Risk</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(product => getAvailablePieces(product?.id || '') <= 5)
                        .sort((a, b) => getAvailablePieces(a?.id || '') - getAvailablePieces(b?.id || ''))
                        .map((product, index) => {
                          const availableStock = getAvailablePieces(product?.id || '');
                          const valueAtRisk = availableStock * (product?.sellingPrice || 0);
                          return (
                            <tr key={product?.id || `low-stock-${index}`} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                                    {product?.imageUrl ? (
                                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">{product?.name}</div>
                                    <div className="text-sm text-muted-foreground">{product?.category}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-medium">{availableStock} {product?.unit}</div>
                              </td>
                              <td className="p-4">
                                <Badge className={`${
                                  availableStock === 0 ? 'bg-destructive text-destructive-foreground' :
                                  availableStock <= 2 ? 'bg-destructive text-destructive-foreground' :
                                  'bg-warning text-warning-foreground'
                                }`}>
                                  {availableStock === 0 ? 'Out of Stock' :
                                   availableStock <= 2 ? 'Critical' : 'Low Stock'}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="font-medium">₹{valueAtRisk.toLocaleString()}</div>
                              </td>
                              <td className="p-4">
                                {hasIndividualStock(product.id) ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAddToProduction(product)}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  <Factory className="w-4 h-4 mr-1" />
                                  Produce
                                </Button>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Bulk Product</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      {products.filter(product => getAvailablePieces(product?.id || '') <= 5).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                            All products have adequate stock levels
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {/* Notifications Section */}
            {notifications.length > 0 ? (
              <Card className="border-orange-200 bg-orange-50">
                 <CardHeader className="pb-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <Bell className="w-5 h-5 text-orange-600" />
                       <CardTitle className="text-orange-800">Production Requests & Alerts</CardTitle>
                       <Badge variant="destructive" className="ml-2">
                         {notifications.length}
                       </Badge>
                     </div>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={handleClearAllNotifications}
                       className="text-red-600 border-red-300 hover:bg-red-50"
                     >
                       Clear All
                     </Button>
                   </div>
                 </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Factory className="w-4 h-4 text-orange-600" />
                            <h4 className="font-semibold text-orange-800">{notification.title}</h4>
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                          {notification.relatedData && (
                            <div className="text-xs text-gray-500">
                              {notification.relatedData.productName && (
                                <div>Product: {notification.relatedData.productName}</div>
                              )}
                              {notification.relatedData.requiredQuantity && (
                                <div>Required: {notification.relatedData.requiredQuantity} units</div>
                              )}
                              {notification.relatedData.availableStock !== undefined && (
                                <div>Available: {notification.relatedData.availableStock} units</div>
                              )}
                              {notification.relatedData.shortfall && (
                                <div>Shortfall: {notification.relatedData.shortfall} units</div>
                              )}
                              {notification.relatedData.threshold && (
                                <div>Threshold: {notification.relatedData.threshold} units</div>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {notification.type === 'production_request' || notification.type === 'low_stock' || notification.type === 'order_alert' ? (
                            hasIndividualStock(notification.relatedData.productId) ? (
                            <Button
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                              onClick={() => handleAddToProductionFromNotification(notification)}
                            >
                              <ArrowRight className="w-3 h-3 mr-1" />
                              Add to Production
                            </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">Bulk Product</span>
                            )
                          ) : null}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleResolveNotification(notification.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
                  <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">No pending notifications or production requests.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Duplicate Product Dialog */}
        <Dialog open={isDuplicateProductOpen} onOpenChange={setIsDuplicateProductOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Duplicate Product</DialogTitle>
              <DialogDescription>
                Edit the product details and save as a new product.
              </DialogDescription>
            </DialogHeader>
            
            {duplicateProduct && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duplicate-name">Product Name *</Label>
                    <Input
                      id="duplicate-name"
                      value={duplicateProduct.name}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                      placeholder="Product name (read-only)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duplicate-category">Category *</Label>
                    <Select
                      value={duplicateProduct.category}
                      disabled
                    >
                      <SelectTrigger className="bg-gray-50 cursor-not-allowed">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duplicate-color">Color</Label>
                    <Select
                      value={duplicateProduct.color}
                      onValueChange={(value) => setDuplicateProduct({...duplicateProduct, color: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duplicate-size">Size</Label>
                    <Select
                      value={duplicateProduct.size}
                      onValueChange={(value) => setDuplicateProduct({...duplicateProduct, size: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duplicate-pattern">Pattern</Label>
                    <Select
                      value={duplicateProduct.pattern}
                      onValueChange={(value) => setDuplicateProduct({...duplicateProduct, pattern: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        {patterns.map((pattern) => (
                          <SelectItem key={pattern} value={pattern}>
                            {pattern}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duplicate-pile-height">Pile Height</Label>
                    <Select
                      value={duplicateProduct.pileHeight}
                      onValueChange={(value) => setDuplicateProduct({...duplicateProduct, pileHeight: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pile height" />
                      </SelectTrigger>
                      <SelectContent>
                        {pileHeights.map((height) => (
                          <SelectItem key={height} value={height}>
                            {height}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duplicate-selling-price">Selling Price *</Label>
                    <Input
                      id="duplicate-selling-price"
                      type="number"
                      value={duplicateProduct.sellingPrice}
                      onChange={(e) => setDuplicateProduct({...duplicateProduct, sellingPrice: parseFloat(e.target.value) || 0})}
                      placeholder="Enter selling price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duplicate-unit">Unit *</Label>
                    <Select
                      value={duplicateProduct.unit}
                      onValueChange={(value) => setDuplicateProduct({...duplicateProduct, unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duplicate-quantity">Quantity *</Label>
                    <Input
                      id="duplicate-quantity"
                      type="number"
                      value={duplicateProduct.quantity}
                      onChange={(e) => setDuplicateProduct({...duplicateProduct, quantity: parseInt(e.target.value) || 0})}
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duplicate-weight">Weight</Label>
                    <Input
                      id="duplicate-weight"
                      value={duplicateProduct.weight}
                      onChange={(e) => setDuplicateProduct({...duplicateProduct, weight: e.target.value})}
                      placeholder="Enter weight"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duplicate-thickness">Thickness</Label>
                    <Input
                      id="duplicate-thickness"
                      value={duplicateProduct.thickness}
                      onChange={(e) => setDuplicateProduct({...duplicateProduct, thickness: e.target.value})}
                      placeholder="Enter thickness"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duplicate-location">Location</Label>
                    <Input
                      id="duplicate-location"
                      value={duplicateProduct.location}
                      onChange={(e) => setDuplicateProduct({...duplicateProduct, location: e.target.value})}
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="duplicate-notes">Notes</Label>
                  <Textarea
                    id="duplicate-notes"
                    value={duplicateProduct.notes}
                    onChange={(e) => setDuplicateProduct({...duplicateProduct, notes: e.target.value})}
                    placeholder="Enter product notes"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="generate-individual-products"
                    checked={duplicateProduct.individualStockTracking || false}
                    onChange={(e) => setDuplicateProduct({...duplicateProduct, individualStockTracking: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="generate-individual-products" className="text-sm">
                    Generate individual product details for each piece (Recommended for carpets)
                  </Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDuplicateProductOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDuplicateProduct}>
                Save as New Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the product details.
              </DialogDescription>
            </DialogHeader>
            
            {selectedProduct && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Product Name *</Label>
                    <Input
                      id="edit-name"
                      value={selectedProduct.name}
                      onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category *</Label>
                    <Select
                      value={selectedProduct.category}
                      onValueChange={(value) => setSelectedProduct({...selectedProduct, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-color">Color</Label>
                    <Select
                      value={selectedProduct.color}
                      onValueChange={(value) => setSelectedProduct({...selectedProduct, color: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-size">Size</Label>
                    <Select
                      value={selectedProduct.size}
                      onValueChange={(value) => setSelectedProduct({...selectedProduct, size: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-pattern">Pattern</Label>
                    <Select
                      value={selectedProduct.pattern}
                      onValueChange={(value) => setSelectedProduct({...selectedProduct, pattern: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        {patterns.map((pattern) => (
                          <SelectItem key={pattern} value={pattern}>
                            {pattern}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-pile-height">Pile Height</Label>
                    <Select
                      value={selectedProduct.pileHeight}
                      onValueChange={(value) => setSelectedProduct({...selectedProduct, pileHeight: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pile height" />
                      </SelectTrigger>
                      <SelectContent>
                        {pileHeights.map((height) => (
                          <SelectItem key={height} value={height}>
                            {height}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-selling-price">Selling Price *</Label>
                    <Input
                      id="edit-selling-price"
                      type="number"
                      value={selectedProduct.sellingPrice}
                      onChange={(e) => setSelectedProduct({...selectedProduct, sellingPrice: parseFloat(e.target.value) || 0})}
                      placeholder="Enter selling price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-unit">Unit *</Label>
                    <Select
                      value={selectedProduct.unit}
                      onValueChange={(value) => setSelectedProduct({...selectedProduct, unit: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-quantity">Quantity *</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      value={selectedProduct.quantity}
                      onChange={(e) => setSelectedProduct({...selectedProduct, quantity: parseInt(e.target.value) || 0})}
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-weight">Weight</Label>
                    <Input
                      id="edit-weight"
                      value={selectedProduct.weight}
                      onChange={(e) => setSelectedProduct({...selectedProduct, weight: e.target.value})}
                      placeholder="Enter weight"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-thickness">Thickness</Label>
                    <Input
                      id="edit-thickness"
                      value={selectedProduct.thickness}
                      onChange={(e) => setSelectedProduct({...selectedProduct, thickness: e.target.value})}
                      placeholder="Enter thickness"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={selectedProduct.location}
                      onChange={(e) => setSelectedProduct({...selectedProduct, location: e.target.value})}
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={selectedProduct.notes}
                    onChange={(e) => setSelectedProduct({...selectedProduct, notes: e.target.value})}
                    placeholder="Enter product notes"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditProduct}>
                Update Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }