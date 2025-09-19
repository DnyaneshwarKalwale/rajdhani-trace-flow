// Enhanced Pricing Form Component with Auto-fill and Field Filtering

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Info, AlertTriangle, Search, Package, Layers, Filter, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExtendedOrderItem, PricingCalculation } from '@/types/orderTypes';
import { PricingUnit, ProductDimensions, PRICING_UNITS, getSuggestedPricingUnit } from '@/utils/unitConverter';
import { usePricingCalculator } from '@/hooks/usePricingCalculator';

interface EnhancedPricingFormProps {
  item: ExtendedOrderItem;
  onUpdate: (updatedItem: ExtendedOrderItem) => void;
  onRemove?: () => void;
  isEditing?: boolean;
  products?: any[];
  rawMaterials?: any[];
  individualProducts?: any[];
  onProductSearch?: (item: ExtendedOrderItem) => void;
  onIndividualProductSelection?: (item: ExtendedOrderItem) => void;
}

export function EnhancedPricingForm({ 
  item, 
  onUpdate, 
  onRemove, 
  isEditing = false,
  products = [],
  rawMaterials = [],
  individualProducts = [],
  onProductSearch,
  onIndividualProductSelection
}: EnhancedPricingFormProps) {
  
  // Debug: Log products data when component mounts or products change
  useEffect(() => {
    console.log('🔍 EnhancedPricingForm received products:', products.length);
    products.slice(0, 3).forEach(product => {
      console.log(`📦 Product "${product.name}": individualStockTracking = ${product.individualStockTracking}, stock = ${product.stock}`);
    });
  }, [products]);

  const { 
    calculateItemPrice, 
    validateItem, 
    getAvailablePricingUnits, 
    formatPrice, 
    formatUnit 
  } = usePricingCalculator();
  
  const [localItem, setLocalItem] = useState<ExtendedOrderItem>(item);

  // Debug: Log when product_id changes
  useEffect(() => {
    if (localItem.product_id) {
      console.log('🎯 Product selected:', {
        product_id: localItem.product_id,
        product_name: localItem.product_name,
        hasIndividualStock: hasIndividualStock()
      });
    }
  }, [localItem.product_id]);
  const [calculation, setCalculation] = useState<PricingCalculation | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [filters, setFilters] = useState({
    // Product filters
    category: 'all',
    color: 'all',
    pattern: 'all',
    width: 'all',
    height: 'all',
    thickness: 'all',
    weight: 'all',
    // Raw material filters
    brand: 'all',
    supplier: 'all',
    qualityGrade: 'all',
    unit: 'all',
    minStock: '',
    maxStock: ''
  });
  
  // Available pricing units based on product dimensions (ensure unique)
  const availableUnits = [...new Set(getAvailablePricingUnits(item.product_dimensions))];
  
  useEffect(() => {
    // For simple units (roll, piece, unit), use simple calculation
    if (localItem.pricing_unit === 'roll' || localItem.pricing_unit === 'piece' || localItem.pricing_unit === 'unit') {
      const simpleTotal = localItem.unit_price * localItem.quantity;
      const updatedItem = {
        ...localItem,
        total_price: simpleTotal,
        unit_value: localItem.unit_price,
        isValid: true,
        errorMessage: ''
      };
      onUpdate(updatedItem);
      setCalculation(null); // No complex calculation needed
    } else {
      // For complex units (GSM, sqm, etc.), use the pricing calculator
      const calc = calculateItemPrice(localItem);
      setCalculation(calc);
      
      const updatedItem = {
        ...localItem,
        unit_value: calc.unitValue,
        total_price: calc.totalPrice,
        product_width: localItem.product_dimensions.width,
        product_height: localItem.product_dimensions.height,
        product_weight: localItem.product_dimensions.weight,
        isValid: calc.isValid,
        errorMessage: calc.errorMessage
      };
      
      onUpdate(updatedItem);
    }
  }, [localItem.pricing_unit, localItem.unit_price, localItem.quantity, calculateItemPrice]);

  // Auto-fill product details when product is selected (without pricing)
  useEffect(() => {
    if (item.product_id && item.product_type) {
      const product = item.product_type === 'raw_material'
        ? rawMaterials.find(p => p.id === item.product_id)
        : products.find(p => p.id === item.product_id);

      if (product) {
        const updatedItem = { ...item };

        // Auto-fill product name
        if (!updatedItem.product_name) {
          updatedItem.product_name = product.name;
        }

        // NO AUTO-FILL FOR PRICING - user must input their own price
        // Keep existing unit_price if already set, otherwise start with 0
        if (!updatedItem.unit_price) {
          updatedItem.unit_price = 0;
        }

        // Auto-fill dimensions if available (only show filled fields)
        const availableDimensions: ProductDimensions = {
          productType: item.product_type === 'raw_material' ? 'raw_material' : 'carpet'
        };

        // Only add dimensions that have values in the database
        if (product.width) {
          const widthValue = parseFloat(product.width.toString().replace(/[^\d.-]/g, ''));
          if (!isNaN(widthValue)) availableDimensions.width = widthValue;
        }
        if (product.height) {
          const heightValue = parseFloat(product.height.toString().replace(/[^\d.-]/g, ''));
          if (!isNaN(heightValue)) availableDimensions.height = heightValue;
        }
        if (product.weight) {
          const weightValue = parseFloat(product.weight.toString().replace(/[^\d.-]/g, ''));
          if (!isNaN(weightValue)) availableDimensions.weight = weightValue;
        }

        updatedItem.product_dimensions = availableDimensions;

        // Set default pricing unit to the product's unit (roll, piece, etc.)
        if (product.unit && !updatedItem.pricing_unit) {
          // Map common units to pricing units
          const unitMapping: { [key: string]: PricingUnit } = {
            'roll': 'roll',
            'piece': 'piece',
            'kg': 'kg',
            'meter': 'meter',
            'sqm': 'sqm',
            'sqft': 'sqft',
            'yard': 'yard',
            'liter': 'liter',
            'unit': 'unit'
          };
          updatedItem.pricing_unit = unitMapping[product.unit] || 'piece';
        }

        // Calculate total based on user input
        updatedItem.total_price = updatedItem.unit_price * updatedItem.quantity;
        updatedItem.unit_value = updatedItem.unit_price;
        updatedItem.isValid = updatedItem.unit_price > 0 && updatedItem.quantity > 0;
        updatedItem.errorMessage = updatedItem.unit_price <= 0 ? 'Please enter a price for this item' : '';

        onUpdate(updatedItem);
      }
    }
  }, [item.product_id, item.product_type, products, rawMaterials]);
  
  const handleUnitPriceChange = (value: string) => {
    const unitPrice = parseFloat(value) || 0;
    setLocalItem(prev => ({ 
      ...prev, 
      unit_price: unitPrice,
      // Simple calculation: unit_price * quantity
      total_price: unitPrice * prev.quantity
    }));
  };
  
  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 0;
    setLocalItem(prev => ({ 
      ...prev, 
      quantity,
      // Simple calculation: unit_price * quantity
      total_price: prev.unit_price * quantity
    }));
  };
  
  const handlePricingUnitChange = (unit: PricingUnit) => {
    setLocalItem(prev => ({ ...prev, pricing_unit: unit }));
  };

  const handleTotalPriceChange = (value: string) => {
    const totalPrice = parseFloat(value) || 0;
    setLocalItem(prev => ({ ...prev, total_price: totalPrice }));
  };
  
  const handleDimensionsChange = (field: keyof ProductDimensions, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalItem(prev => ({
      ...prev,
      product_dimensions: {
        ...prev.product_dimensions,
        [field]: numValue
      }
    }));
  };

  // Get available products/materials with filtering
  const getAvailableItems = useMemo(() => {
    const items = localItem.product_type === 'raw_material' ? rawMaterials : products;

    return items.filter(item => {
      // Basic validation
      if (!item.name || item.name.trim() === '') return false;

      // Search term filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(search);
        const matchesCategory = item.category?.toLowerCase().includes(search);
        const matchesColor = item.color?.toLowerCase().includes(search);
        const matchesBrand = item.brand?.toLowerCase().includes(search);
        const matchesSupplier = item.supplier?.toLowerCase().includes(search);

        if (!matchesName && !matchesCategory && !matchesColor && !matchesBrand && !matchesSupplier) {
          return false;
        }
      }

      // Product-specific filters
      if (localItem.product_type === 'product') {
        if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
        if (filters.color && filters.color !== 'all' && item.color !== filters.color) return false;
        if (filters.pattern && filters.pattern !== 'all' && item.pattern !== filters.pattern) return false;

        // Width filter
        if (filters.width && filters.width !== 'all' && item.width !== filters.width) return false;

        // Height filter
        if (filters.height && filters.height !== 'all' && item.height !== filters.height) return false;

        // Thickness filter
        if (filters.thickness && filters.thickness !== 'all') {
          const itemThickness = item.thickness?.toString() || '';
          if (itemThickness !== filters.thickness) return false;
        }

        // Weight filter
        if (filters.weight && filters.weight !== 'all') {
          const itemWeight = item.weight?.toString() || '';
          if (itemWeight !== filters.weight) return false;
        }

        // Stock filter for products
        if (filters.minStock || filters.maxStock) {
          const stock = item.stock ?? 0;
          if (filters.minStock && stock < parseInt(filters.minStock)) return false;
          if (filters.maxStock && stock > parseInt(filters.maxStock)) return false;
        }
      }

      // Raw material-specific filters
      if (localItem.product_type === 'raw_material') {
        if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
        if (filters.brand && filters.brand !== 'all' && item.brand !== filters.brand) return false;
        if (filters.supplier && filters.supplier !== 'all' && item.supplier !== filters.supplier) return false;
        if (filters.qualityGrade && filters.qualityGrade !== 'all' && item.qualityGrade !== filters.qualityGrade) return false;
        if (filters.unit && filters.unit !== 'all' && item.unit !== filters.unit) return false;

        // Stock filter
        if (filters.minStock || filters.maxStock) {
          const stock = item.stock || 0;
          if (filters.minStock && stock < parseInt(filters.minStock)) return false;
          if (filters.maxStock && stock > parseInt(filters.maxStock)) return false;
        }
      }

      return true;
    });
  }, [localItem.product_type, rawMaterials, products, searchTerm, filters]);

  // Get unique filter options from actual data
  const getFilterOptions = useMemo(() => {
    const items = localItem.product_type === 'raw_material' ? rawMaterials : products;

    if (localItem.product_type === 'product') {
      return {
        categories: [...new Set(items.map(item => item.category).filter(Boolean))],
        colors: [...new Set(items.map(item => item.color).filter(Boolean))],
        patterns: [...new Set(items.map(item => item.pattern).filter(Boolean))],
        widths: [...new Set(items.map(item => item.width).filter(Boolean))],
        heights: [...new Set(items.map(item => item.height).filter(Boolean))],
        thickness: [...new Set(items.map(item => item.thickness).filter(Boolean))],
        weights: [...new Set(items.map(item => item.weight).filter(Boolean))],
        units: [...new Set(items.map(item => item.unit).filter(Boolean))]
      };
    } else {
      return {
        categories: [...new Set(items.map(item => item.category).filter(Boolean))],
        brands: [...new Set(items.map(item => item.brand).filter(Boolean))],
        suppliers: [...new Set(items.map(item => item.supplier).filter(Boolean))],
        qualityGrades: [...new Set(items.map(item => item.qualityGrade).filter(Boolean))],
        units: [...new Set(items.map(item => item.unit).filter(Boolean))]
      };
    }
  }, [localItem.product_type, rawMaterials, products]);

  // Check if product has individual stock tracking
  const hasIndividualStock = () => {
    if (localItem.product_type === 'raw_material') return false;
    const product = products.find(p => p.id === localItem.product_id);
    
    console.log('🔍 hasIndividualStock check:', {
      product_id: localItem.product_id,
      product_name: product?.name,
      individualStockTracking: product?.individualStockTracking,
      hasIndividual: product && product.individualStockTracking !== false
    });
    
    return product && product.individualStockTracking !== false;
  };

  // Check if order quantity exceeds available stock
  const checkStockAvailability = () => {
    if (!localItem.product_id || localItem.quantity <= 0) return { isAvailable: true, shortfall: 0 };
    
    const item = localItem.product_type === 'raw_material'
      ? rawMaterials.find(m => m.id === localItem.product_id)
      : products.find(p => p.id === localItem.product_id);
    
    if (!item) return { isAvailable: true, shortfall: 0 };
    
    const availableStock = item.stock || 0;
    const shortfall = Math.max(0, localItem.quantity - availableStock);
    
    return {
      isAvailable: shortfall === 0,
      shortfall,
      availableStock,
      requiredQuantity: localItem.quantity
    };
  };

  const stockStatus = checkStockAvailability();

  const isItemValid = calculation?.isValid ?? false;
  
  return (
    <Card className={`w-full ${!isItemValid ? 'border-gray-200 bg-white' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            {localItem.product_type === 'raw_material' ? (
              <Layers className="w-5 h-5 text-orange-600" />
            ) : (
              <Package className="w-5 h-5 text-blue-600" />
            )}
            {localItem.product_name || 'Select Product'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isItemValid && (
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                {formatPrice(calculation?.totalPrice || 0)}
              </Badge>
            )}
            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="text-gray-600 hover:text-gray-700"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Product Selection */}
        <div className="space-y-4">
          {/* Product Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Item Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`productType-${item.id}`}
                  value="product"
                  checked={localItem.product_type === 'product'}
                  onChange={() => {
                    setLocalItem(prev => ({ 
                      ...prev, 
                      product_type: 'product',
                      product_id: '',
                      product_name: ''
                    }));
                  }}
                  className="text-blue-600"
                />
                <span className="text-sm">Finished Product</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`productType-${item.id}`}
                  value="raw_material"
                  checked={localItem.product_type === 'raw_material'}
                  onChange={() => {
                    setLocalItem(prev => ({ 
                      ...prev, 
                      product_type: 'raw_material',
                      product_id: '',
                      product_name: ''
                    }));
                  }}
                  className="text-orange-600"
                />
                <span className="text-sm">Raw Material</span>
              </label>
            </div>
          </div>

          {/* Product Selection Button */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              {localItem.product_type === 'raw_material' ? 'Raw Material' : 'Product'} Selection
            </Label>

            {/* Selected Product Display or Selection Button */}
            {localItem.product_id ? (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-blue-800">{localItem.product_name}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {localItem.product_type === 'raw_material' ? 'Raw Material' : 'Product'} •
                      Stock: {localItem.product_type === 'raw_material'
                        ? (rawMaterials.find(m => m.id === localItem.product_id)?.stock || 0)
                        : (products.find(p => p.id === localItem.product_id)?.stock || 0)
                      }
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProductModal(true)}
                    className="text-xs"
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowProductModal(true)}
                className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              >
                <Search className="w-4 h-4 mr-2" />
                Select {localItem.product_type === 'raw_material' ? 'Raw Material' : 'Product'}
              </Button>
            )}
          </div>























          {/* Selected Product Details */}
          {localItem.product_id && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-blue-800 font-medium mb-2">📦 Selected {localItem.product_type === 'raw_material' ? 'Raw Material' : 'Product'} Details</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Name:</span> {localItem.product_name}</div>
                <div><span className="font-medium">Unit:</span> {localItem.pricing_unit || 'N/A'}</div>
                <div><span className="font-medium">Your Price:</span> {localItem.unit_price > 0 ? `₹${localItem.unit_price}` : 'Not set'}</div>
                <div><span className="font-medium">Available:</span> {
                  (() => {
                    const item = localItem.product_type === 'raw_material'
                      ? rawMaterials.find(m => m.id === localItem.product_id)
                      : products.find(p => p.id === localItem.product_id);
                    const stock = localItem.product_type === 'raw_material'
                      ? (item?.stock ?? 0)
                      : (item?.stock ?? 0);
                    const unit = item?.unit || 'units';
                    return `${stock} ${unit}`;
                  })()
                }</div>
                {localItem.product_dimensions.width && (
                  <div><span className="font-medium">Width:</span> {localItem.product_dimensions.width} cm</div>
                )}
                {localItem.product_dimensions.height && (
                  <div><span className="font-medium">Height:</span> {localItem.product_dimensions.height} cm</div>
                )}
                {localItem.product_dimensions.weight && (
                  <div><span className="font-medium">Weight:</span> {localItem.product_dimensions.weight} kg</div>
                )}

                {/* Raw Material specific details */}
                {localItem.product_type === 'raw_material' && (
                  <>
                    {(() => {
                      const material = rawMaterials.find(m => m.id === localItem.product_id);
                      return (
                        <>
                          {material?.brand && <div><span className="font-medium">Brand:</span> {material.brand}</div>}
                          {material?.supplier && <div><span className="font-medium">Supplier:</span> {material.supplier}</div>}
                          {material?.qualityGrade && <div><span className="font-medium">Quality:</span> {material.qualityGrade}</div>}
                        </>
                      );
                    })()}
                  </>
                )}

                {/* Product specific details */}
                {localItem.product_type === 'product' && (
                  <>
                    {(() => {
                      const product = products.find(p => p.id === localItem.product_id);
                      return (
                        <>
                          {product?.color && <div><span className="font-medium">Color:</span> {product.color}</div>}
                          {product?.pattern && <div><span className="font-medium">Pattern:</span> {product.pattern}</div>}
                          {product?.thickness && <div><span className="font-medium">Thickness:</span> {product.thickness}</div>}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* Pricing Note */}
              {localItem.unit_price <= 0 && (
                <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                  ⚠️ <strong>Pricing Required:</strong> Please enter your selling price per {(() => {
                    const item = localItem.product_type === 'raw_material'
                      ? rawMaterials.find(m => m.id === localItem.product_id)
                      : products.find(p => p.id === localItem.product_id);
                    return item?.unit || 'unit';
                  })()} in the pricing section below.
                </div>
              )}
            </div>
          )}

          {/* Individual Product Selection (only for products with individual tracking AND available individual products) */}
          {localItem.product_id && hasIndividualStock() && (() => {
            const availableIndividualProducts = individualProducts.filter(ip => 
              ip.productId === localItem.product_id && ip.status === 'available'
            );
            return availableIndividualProducts.length > 0;
          })() && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Individual Product Selection</Label>
              {(() => { console.log('🎯 Individual Product Selection section is rendering for:', localItem.product_name); return null; })()}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onIndividualProductSelection?.(localItem)}
                className="w-full"
              >
                <Package className="w-4 h-4 mr-2" />
                Select Specific Pieces (Excel-like View)
              </Button>
            </div>
          )}
          
          {/* Show message when no individual products are available */}
          {localItem.product_id && hasIndividualStock() && (() => {
            const availableIndividualProducts = individualProducts.filter(ip => 
              ip.productId === localItem.product_id && ip.status === 'available'
            );
            return availableIndividualProducts.length === 0;
          })() && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                No individual products available for selection
              </div>
            </div>
          )}
        </div>

        {/* Pricing Configuration */}
        {localItem.product_id && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor={`quantity-${item.id}`} className="text-sm font-medium text-gray-700">
                  Quantity ({(() => {
                    const item = localItem.product_type === 'raw_material'
                      ? rawMaterials.find(m => m.id === localItem.product_id)
                      : products.find(p => p.id === localItem.product_id);
                    return item?.unit || 'units';
                  })()})
                </Label>
                <Input
                  id={`quantity-${item.id}`}
                  type="number"
                  min="1"
                  value={localItem.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder={`Enter quantity in ${(() => {
                    const item = localItem.product_type === 'raw_material'
                      ? rawMaterials.find(m => m.id === localItem.product_id)
                      : products.find(p => p.id === localItem.product_id);
                    return item?.unit || 'units';
                  })()}`}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  💡 For bulk items: if unit is 'kg' and you enter '1000', it means 1000 kg (not 1000 pieces)
                </p>
              </div>

              {/* Unit Price - User Input Required */}
              <div className="space-y-2">
                <Label htmlFor={`unitPrice-${item.id}`} className="text-sm font-medium text-gray-700">
                  Price per {localItem.pricing_unit || 'unit'} (₹) *
                </Label>
                <Input
                  id={`unitPrice-${item.id}`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={localItem.unit_price || ''}
                  onChange={(e) => handleUnitPriceChange(e.target.value)}
                  placeholder="Enter your price"
                  className={`w-full ${localItem.unit_price <= 0 ? 'border-gray-300 focus:border-gray-500' : ''}`}
                  required
                />
                {localItem.unit_price <= 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    💡 Enter the price you want to charge for this item
                  </p>
                )}
              </div>

              {/* Total Price (Editable) */}
              <div className="space-y-2">
                <Label htmlFor={`totalPrice-${item.id}`} className="text-sm font-medium text-gray-700">
                  Total Price (₹)
                </Label>
                <Input
                  id={`totalPrice-${item.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={localItem.total_price}
                  onChange={(e) => handleTotalPriceChange(e.target.value)}
                  placeholder="Total price"
                  className="w-full bg-green-50 border-green-200"
                />
              </div>
            </div>

            {/* Pricing Unit Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Pricing Unit</Label>
              <Select
                value={localItem.pricing_unit}
                onValueChange={handlePricingUnitChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing unit" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit, index) => {
                    const unitInfo = PRICING_UNITS.find(u => u.unit === unit);
                    return (
                      <SelectItem key={`${unit}-${index}`} value={unit}>
                        <div className="flex flex-col">
                          <span className="font-medium">{unitInfo?.label || unit}</span>
                          <span className="text-xs text-gray-500">{unitInfo?.description}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                💡 <strong>Simple Pricing:</strong> Enter price per unit above. 
                <br />
                💡 <strong>Unit Conversion:</strong> Select different unit (like GSM, sqm) to calculate price based on dimensions.
              </p>
            </div>


            {/* Calculation Display - Only show if using unit conversion */}
            {calculation && localItem.pricing_unit !== 'roll' && localItem.pricing_unit !== 'piece' && localItem.pricing_unit !== 'unit' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">Unit Conversion Calculation</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCalculation(!showCalculation)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Calculator className="w-4 h-4 mr-1" />
                    {showCalculation ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                
                {showCalculation && (
                  <div className="p-3 bg-blue-50 rounded-lg space-y-2 text-sm border border-blue-200">
                    <div className="text-blue-800 font-medium mb-2">🔄 Unit Conversion Active</div>
                    <div className="flex justify-between">
                      <span>Unit Value:</span>
                      <span className="font-medium">{calculation.unitValue.toFixed(2)} {formatUnit(calculation.pricingUnit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value:</span>
                      <span className="font-medium">{calculation.totalValue.toFixed(2)} {formatUnit(calculation.pricingUnit)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Calculated Price:</span>
                      <span className="font-bold text-green-600">₹{calculation.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      💡 You can edit the Total Price above to override this calculation
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Summary */}
            <div className={`p-3 rounded-lg border ${
              localItem.unit_price > 0 && localItem.quantity > 0
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className={`font-medium mb-1 ${
                localItem.unit_price > 0 && localItem.quantity > 0
                  ? 'text-green-800'
                  : 'text-yellow-800'
              }`}>
                {localItem.unit_price > 0 && localItem.quantity > 0 ? '✅ Pricing Complete' : '⚠️ Pricing Required'}
              </div>
              <div className={`text-sm ${
                localItem.unit_price > 0 && localItem.quantity > 0
                  ? 'text-green-700'
                  : 'text-yellow-700'
              }`}>
                {localItem.unit_price > 0 && localItem.quantity > 0 ? (
                  <>Total = ₹{localItem.unit_price} per {(() => {
                    const item = localItem.product_type === 'raw_material'
                      ? rawMaterials.find(m => m.id === localItem.product_id)
                      : products.find(p => p.id === localItem.product_id);
                    return item?.unit || 'unit';
                  })()} × {localItem.quantity} {(() => {
                    const item = localItem.product_type === 'raw_material'
                      ? rawMaterials.find(m => m.id === localItem.product_id)
                      : products.find(p => p.id === localItem.product_id);
                    return item?.unit || 'units';
                  })()} = ₹{localItem.total_price}</>
                ) : (
                  'Please enter quantity and your selling price to calculate total'
                )}
              </div>
              <div className={`text-xs mt-1 ${
                localItem.unit_price > 0 && localItem.quantity > 0
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}>
                💡 You can edit the Total Price above if needed
              </div>
            </div>

            {/* Stock Availability Info (Non-blocking) */}
            {localItem.product_id && localItem.quantity > 0 && !stockStatus.isAvailable && localItem.product_type === 'product' && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="space-y-2">
                    <div className="font-medium">ℹ️ Stock Information</div>
                    <div className="text-sm">
                      <div>Available Stock: <span className="font-medium">{stockStatus.availableStock}</span></div>
                      <div>Required Quantity: <span className="font-medium">{stockStatus.requiredQuantity}</span></div>
                      <div>Shortfall: <span className="font-medium text-blue-700">{stockStatus.shortfall}</span></div>
                    </div>
                    <div className="text-xs text-blue-700">
                      💡 Order will be accepted. Individual product selection and stock allocation will happen later in the workflow.
                    </div>
                    <div className="text-xs text-blue-700 mt-2">
                      💡 Production notification will be sent automatically when this order is accepted.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Validation Messages */}
            {localItem.product_id && (
              <>
                {localItem.unit_price <= 0 && (
                  <Alert className="border-gray-200 bg-white">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    <AlertDescription className="text-gray-700">Please enter a selling price for this item</AlertDescription>
                  </Alert>
                )}
                {localItem.quantity <= 0 && (
                  <Alert className="border-gray-200 bg-white">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    <AlertDescription className="text-gray-700">Please enter a quantity greater than 0</AlertDescription>
                  </Alert>
                )}
                {!isItemValid && calculation?.errorMessage && (
                  <Alert className="border-gray-200 bg-white">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    <AlertDescription className="text-gray-700">{calculation.errorMessage}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>

      {/* Product Selection Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {localItem.product_type === 'raw_material' ? (
                <Layers className="w-5 h-5 text-orange-600" />
              ) : (
                <Package className="w-5 h-5 text-blue-600" />
              )}
              Select {localItem.product_type === 'raw_material' ? 'Raw Material' : 'Product'}
            </DialogTitle>
            <DialogDescription>
              Choose from available {localItem.product_type === 'raw_material' ? 'raw materials' : 'products'}. Use search and filters to find what you need.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4 flex-1 min-h-0">
            {/* Search Bar */}
            <div className="relative">
              <Input
                placeholder={`Search ${localItem.product_type === 'raw_material' ? 'raw materials' : 'products'} by name, category, ${localItem.product_type === 'raw_material' ? 'brand, supplier' : 'color, pattern'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs"
              >
                <Filter className="w-4 h-4 mr-1" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    category: 'all', color: 'all', pattern: 'all', width: 'all', height: 'all',
                    thickness: 'all', weight: 'all',
                    brand: 'all', supplier: 'all', qualityGrade: 'all', unit: 'all',
                    minStock: '', maxStock: ''
                  });
                }}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {/* Common filters */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Category</Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getFilterOptions.categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product-specific filters */}
                  {localItem.product_type === 'product' && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Color</Label>
                        <Select value={filters.color} onValueChange={(value) => setFilters(prev => ({ ...prev, color: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Colors</SelectItem>
                            {getFilterOptions.colors?.map(color => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Pattern</Label>
                        <Select value={filters.pattern} onValueChange={(value) => setFilters(prev => ({ ...prev, pattern: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Patterns</SelectItem>
                            {getFilterOptions.patterns?.map(pattern => (
                              <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Width</Label>
                        <Select value={filters.width} onValueChange={(value) => setFilters(prev => ({ ...prev, width: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Widths</SelectItem>
                            {getFilterOptions.widths?.map(width => (
                              <SelectItem key={width} value={width}>{width}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Height</Label>
                        <Select value={filters.height} onValueChange={(value) => setFilters(prev => ({ ...prev, height: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Heights</SelectItem>
                            {getFilterOptions.heights?.map(height => (
                              <SelectItem key={height} value={height}>{height}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Thickness</Label>
                        <Select value={filters.thickness} onValueChange={(value) => setFilters(prev => ({ ...prev, thickness: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Thickness</SelectItem>
                            {getFilterOptions.thickness?.map(thickness => (
                              <SelectItem key={thickness} value={thickness}>{thickness}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Weight</Label>
                        <Select value={filters.weight} onValueChange={(value) => setFilters(prev => ({ ...prev, weight: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Weights</SelectItem>
                            {getFilterOptions.weights?.map(weight => (
                              <SelectItem key={weight} value={weight}>{weight}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Raw material-specific filters */}
                  {localItem.product_type === 'raw_material' && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Brand</Label>
                        <Select value={filters.brand} onValueChange={(value) => setFilters(prev => ({ ...prev, brand: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            {getFilterOptions.brands?.map(brand => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Supplier</Label>
                        <Select value={filters.supplier} onValueChange={(value) => setFilters(prev => ({ ...prev, supplier: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Suppliers</SelectItem>
                            {getFilterOptions.suppliers?.map(supplier => (
                              <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Quality Grade</Label>
                        <Select value={filters.qualityGrade} onValueChange={(value) => setFilters(prev => ({ ...prev, qualityGrade: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Grades</SelectItem>
                            {getFilterOptions.qualityGrades?.map(grade => (
                              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Unit</Label>
                        <Select value={filters.unit} onValueChange={(value) => setFilters(prev => ({ ...prev, unit: value }))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Units</SelectItem>
                            {getFilterOptions.units?.map(unit => (
                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Min Stock</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.minStock}
                          onChange={(e) => setFilters(prev => ({ ...prev, minStock: e.target.value }))}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Max Stock</Label>
                        <Input
                          type="number"
                          placeholder="∞"
                          value={filters.maxStock}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxStock: e.target.value }))}
                          className="h-8 text-xs"
                        />
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Found {getAvailableItems.length} {localItem.product_type === 'raw_material' ? 'raw materials' : 'products'}</span>
              {localItem.product_id && (
                <Badge variant="default" className="text-xs">
                  Selected: {localItem.product_name}
                </Badge>
              )}
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto">
              {getAvailableItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getAvailableItems.map((product) => {
                    const actualStock = localItem.product_type === 'raw_material'
                      ? (product.stock ?? 0)
                      : (product.stock ?? 0);

                    return (
                      <div
                        key={product.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          localItem.product_id === product.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setLocalItem(prev => ({
                            ...prev,
                            product_id: product.id,
                            product_name: product.name,
                            unit_price: 0, // No preset pricing
                            product_dimensions: {
                              productType: prev.product_type === 'raw_material' ? 'raw_material' : 'carpet',
                              width: product.width ? parseFloat(product.width.toString().replace(/[^\d.-]/g, '')) || undefined : undefined,
                              height: product.height ? parseFloat(product.height.toString().replace(/[^\d.-]/g, '')) || undefined : undefined,
                              weight: product.weight ? parseFloat(product.weight.toString().replace(/[^\d.-]/g, '')) || undefined : undefined
                            }
                          }));
                          setShowProductModal(false);
                        }}
                      >
                        {/* Product Image */}
                        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-10 h-10 text-gray-400" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>

                          {/* Category and basic info */}
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                            {localItem.product_type === 'product' ? (
                              <>
                                {product.color && <Badge variant="outline" className="text-xs">{product.color}</Badge>}
                                {product.pattern && <Badge variant="outline" className="text-xs">{product.pattern}</Badge>}
                              </>
                            ) : (
                              <>
                                {product.brand && <Badge variant="outline" className="text-xs">{product.brand}</Badge>}
                                {product.supplier && <Badge variant="outline" className="text-xs">{product.supplier}</Badge>}
                              </>
                            )}
                          </div>

                          {/* Specifications */}
                          <div className="text-xs text-gray-600 space-y-1">
                            {localItem.product_type === 'product' ? (
                              <>
                                {product.width && <div>Width: {product.width}</div>}
                                {product.height && <div>Height: {product.height}</div>}
                                {product.thickness && <div>Thickness: {product.thickness}</div>}
                                {product.weight && <div>Weight: {product.weight}</div>}
                              </>
                            ) : (
                              <>
                                {product.qualityGrade && <div>Quality: {product.qualityGrade}</div>}
                                <div>Unit: {product.unit}</div>
                              </>
                            )}
                          </div>

                          {/* Stock Status - Fixed to show actual stock */}
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={actualStock > 20 ? "default" : actualStock > 5 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              Stock: {actualStock} {product.unit || 'units'}
                            </Badge>
                            {localItem.product_id === product.id && (
                              <Badge variant="default" className="text-xs bg-blue-600">
                                Selected
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No {localItem.product_type === 'raw_material' ? 'raw materials' : 'products'} found</p>
                  <p className="text-xs mt-1">Try adjusting your search terms or filters</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductModal(false)}>
              Cancel
            </Button>
            {localItem.product_id && (
              <Button onClick={() => setShowProductModal(false)}>
                Confirm Selection
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
