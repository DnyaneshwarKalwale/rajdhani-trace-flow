// Unit Conversion Utilities for Carpet Pricing
// Handles area conversions and pricing calculations

export type AreaUnit = 'sqft' | 'sqm' | 'piece' | 'roll' | 'kg' | 'meter' | 'yard';
export type VolumeUnit = 'liter' | 'ml' | 'gallon' | 'cubic_meter' | 'cubic_foot';
export type WeightUnit = 'kg' | 'gram' | 'ton' | 'pound' | 'ounce';
export type LengthUnit = 'meter' | 'cm' | 'mm' | 'foot' | 'inch' | 'linear_yard';
export type CountUnit = 'piece' | 'roll' | 'unit' | 'dozen' | 'hundred' | 'thousand';
export type TextileUnit = 'gsm' | 'denier' | 'tex' | 'oz_per_sqyd' | 'thread_count';

export type PricingUnit = AreaUnit | VolumeUnit | WeightUnit | LengthUnit | CountUnit | TextileUnit;

export interface ProductDimensions {
  // Area/Dimension properties
  width?: number; // in meters
  height?: number; // in meters
  length?: number; // in meters
  thickness?: number; // in mm
  
  // Weight properties
  weight?: number; // in kg
  density?: number; // kg per cubic meter
  
  // Volume properties
  volume?: number; // in liters
  
  // Textile properties
  gsm?: number; // grams per square meter
  denier?: number; // denier (grams per 9000 meters of fiber)
  tex?: number; // tex (grams per 1000 meters of fiber)
  thread_count?: number; // threads per square inch or cm
  fiber_density?: number; // density of fiber material in g/cm³
  
  // Product type
  productType?: 'carpet' | 'raw_material' | 'bulk_product' | 'finished_good' | 'textile' | 'fiber';
}

export interface PricingUnitInfo {
  unit: PricingUnit;
  label: string;
  description: string;
  category: 'area' | 'volume' | 'weight' | 'length' | 'count' | 'textile';
  requiresDimensions: boolean;
  applicableTo: ('carpet' | 'raw_material' | 'bulk_product' | 'finished_good' | 'textile' | 'fiber')[];
}

export const PRICING_UNITS: PricingUnitInfo[] = [
  // Area-based pricing (for carpets)
  {
    unit: 'sqft',
    label: 'Per Square Foot',
    description: 'Price per square foot of carpet',
    category: 'area',
    requiresDimensions: true,
    applicableTo: ['carpet', 'finished_good']
  },
  {
    unit: 'sqm',
    label: 'Per Square Meter',
    description: 'Price per square meter of carpet',
    category: 'area',
    requiresDimensions: true,
    applicableTo: ['carpet', 'finished_good']
  },
  {
    unit: 'yard',
    label: 'Per Square Yard',
    description: 'Price per square yard of carpet',
    category: 'area',
    requiresDimensions: true,
    applicableTo: ['carpet', 'finished_good']
  },
  
  // Weight-based pricing (for raw materials and bulk products)
  {
    unit: 'kg',
    label: 'Per Kilogram',
    description: 'Price per kilogram',
    category: 'weight',
    requiresDimensions: true,
    applicableTo: ['raw_material', 'bulk_product', 'carpet']
  },
  {
    unit: 'gram',
    label: 'Per Gram',
    description: 'Price per gram',
    category: 'weight',
    requiresDimensions: true,
    applicableTo: ['raw_material', 'bulk_product']
  },
  {
    unit: 'ton',
    label: 'Per Ton',
    description: 'Price per metric ton',
    category: 'weight',
    requiresDimensions: true,
    applicableTo: ['raw_material', 'bulk_product']
  },
  {
    unit: 'pound',
    label: 'Per Pound',
    description: 'Price per pound',
    category: 'weight',
    requiresDimensions: true,
    applicableTo: ['raw_material', 'bulk_product']
  },
  
  // Volume-based pricing (for liquids and bulk materials)
  {
    unit: 'liter',
    label: 'Per Liter',
    description: 'Price per liter',
    category: 'volume',
    requiresDimensions: true,
    applicableTo: ['raw_material', 'bulk_product']
  },
  {
    unit: 'ml',
    label: 'Per Milliliter',
    description: 'Price per milliliter',
    category: 'volume',
    requiresDimensions: true,
    applicableTo: ['raw_material', 'bulk_product']
  },
  {
    unit: 'gallon',
    label: 'Per Gallon',
    description: 'Price per gallon',
    category: 'volume',
    requiresDimensions: true,
    applicableTo: ['raw_material', 'bulk_product']
  },
  {
    unit: 'cubic_meter',
    label: 'Per Cubic Meter',
    description: 'Price per cubic meter',
    category: 'volume',
    requiresDimensions: true,
    applicableTo: ['raw_material', 'bulk_product']
  },
  
  // Length-based pricing
  {
    unit: 'meter',
    label: 'Per Meter',
    description: 'Price per linear meter',
    category: 'length',
    requiresDimensions: true,
    applicableTo: ['carpet', 'raw_material', 'finished_good']
  },
  {
    unit: 'cm',
    label: 'Per Centimeter',
    description: 'Price per centimeter',
    category: 'length',
    requiresDimensions: true,
    applicableTo: ['raw_material', 'finished_good']
  },
  {
    unit: 'foot',
    label: 'Per Foot',
    description: 'Price per linear foot',
    category: 'length',
    requiresDimensions: true,
    applicableTo: ['carpet', 'raw_material', 'finished_good']
  },
  {
    unit: 'linear_yard',
    label: 'Per Linear Yard',
    description: 'Price per linear yard',
    category: 'length',
    requiresDimensions: true,
    applicableTo: ['carpet', 'raw_material', 'finished_good']
  },
  
  // Count-based pricing
  {
    unit: 'piece',
    label: 'Per Piece',
    description: 'Fixed price per individual piece',
    category: 'count',
    requiresDimensions: false,
    applicableTo: ['carpet', 'finished_good', 'raw_material']
  },
  {
    unit: 'roll',
    label: 'Per Roll',
    description: 'Price per roll',
    category: 'count',
    requiresDimensions: false,
    applicableTo: ['carpet', 'finished_good']
  },
  {
    unit: 'unit',
    label: 'Per Unit',
    description: 'Price per unit',
    category: 'count',
    requiresDimensions: false,
    applicableTo: ['finished_good', 'raw_material']
  },
  {
    unit: 'dozen',
    label: 'Per Dozen',
    description: 'Price per dozen (12 units)',
    category: 'count',
    requiresDimensions: false,
    applicableTo: ['finished_good', 'raw_material']
  },
  {
    unit: 'hundred',
    label: 'Per Hundred',
    description: 'Price per hundred units',
    category: 'count',
    requiresDimensions: false,
    applicableTo: ['finished_good', 'raw_material']
  },
  {
    unit: 'thousand',
    label: 'Per Thousand',
    description: 'Price per thousand units',
    category: 'count',
    requiresDimensions: false,
    applicableTo: ['finished_good', 'raw_material']
  },
  
  // Textile-based pricing (for carpets, textiles, and fibers)
  {
    unit: 'gsm',
    label: 'Per GSM',
    description: 'Price per gram per square meter (carpet weight)',
    category: 'textile',
    requiresDimensions: true,
    applicableTo: ['carpet', 'textile', 'fiber']
  },
  {
    unit: 'denier',
    label: 'Per Denier',
    description: 'Price per denier (fiber linear density)',
    category: 'textile',
    requiresDimensions: true,
    applicableTo: ['textile', 'fiber', 'raw_material']
  },
  {
    unit: 'tex',
    label: 'Per Tex',
    description: 'Price per tex (grams per 1000 meters)',
    category: 'textile',
    requiresDimensions: true,
    applicableTo: ['textile', 'fiber', 'raw_material']
  },
  {
    unit: 'oz_per_sqyd',
    label: 'Per Oz/Sq Yd',
    description: 'Price per ounce per square yard',
    category: 'textile',
    requiresDimensions: true,
    applicableTo: ['carpet', 'textile']
  },
  {
    unit: 'thread_count',
    label: 'Per Thread Count',
    description: 'Price per thread count (threads per unit area)',
    category: 'textile',
    requiresDimensions: true,
    applicableTo: ['textile', 'fiber']
  }
];

// Conversion factors
const CONVERSION_FACTORS = {
  // Area conversions (relative to square meters)
  sqm: 1,
  sqft: 10.764, // 1 sqm = 10.764 sqft
  yard: 1.196, // 1 sqm = 1.196 sq yards
  
  // Length conversions (relative to meters)
  meter: 1,
  cm: 100, // 1 meter = 100 cm
  mm: 1000, // 1 meter = 1000 mm
  foot: 3.281, // 1 meter = 3.281 feet
  inch: 39.37, // 1 meter = 39.37 inches
  yard_length: 1.094, // 1 meter = 1.094 yards (for length)
  linear_yard: 1.094, // 1 meter = 1.094 linear yards
  
  // Weight conversions (relative to kg)
  kg: 1,
  gram: 1000, // 1 kg = 1000 grams
  ton: 0.001, // 1 kg = 0.001 tons
  pound: 2.205, // 1 kg = 2.205 pounds
  ounce: 35.274, // 1 kg = 35.274 ounces
  
  // Volume conversions (relative to liters)
  liter: 1,
  ml: 1000, // 1 liter = 1000 ml
  gallon: 0.264, // 1 liter = 0.264 gallons
  cubic_meter: 0.001, // 1 liter = 0.001 cubic meters
  cubic_foot: 0.035, // 1 liter = 0.035 cubic feet
  
  // Count conversions (relative to pieces)
  piece: 1,
  roll: 1,
  unit: 1,
  dozen: 0.083, // 1 piece = 0.083 dozen
  hundred: 0.01, // 1 piece = 0.01 hundred
  thousand: 0.001, // 1 piece = 0.001 thousand
  
  // Textile conversions
  gsm: 1, // grams per square meter (base unit)
  denier: 1, // denier (grams per 9000 meters)
  tex: 1, // tex (grams per 1000 meters)
  oz_per_sqyd: 33.906, // 1 gsm = 33.906 oz/sqyd
  thread_count: 1 // threads per unit area
};

/**
 * Convert area from one unit to another
 */
export function convertArea(value: number, fromUnit: AreaUnit, toUnit: AreaUnit): number {
  if (fromUnit === toUnit) return value;
  
  // Handle special cases
  if (fromUnit === 'piece' || fromUnit === 'roll') {
    return value; // No conversion for piece/roll
  }
  
  if (toUnit === 'piece' || toUnit === 'roll') {
    return value; // No conversion for piece/roll
  }
  
  // Convert to square meters first
  let valueInSqm = value;
  if (fromUnit !== 'sqm') {
    valueInSqm = value / CONVERSION_FACTORS[fromUnit];
  }
  
  // Convert from square meters to target unit
  if (toUnit === 'sqm') {
    return valueInSqm;
  }
  
  return valueInSqm * CONVERSION_FACTORS[toUnit];
}

/**
 * Calculate unit value from product dimensions based on pricing unit
 */
export function calculateUnitValue(dimensions: ProductDimensions, unit: PricingUnit): number {
  const unitInfo = PRICING_UNITS.find(u => u.unit === unit);
  if (!unitInfo) return 0;
  
  switch (unitInfo.category) {
    case 'area':
      if (!dimensions.width || !dimensions.height) return 0;
      const areaInSqm = dimensions.width * dimensions.height;
      return convertUnit(areaInSqm, 'sqm', unit);
      
    case 'volume':
      if (dimensions.volume) {
        return convertUnit(dimensions.volume, 'liter', unit);
      }
      // Calculate volume from dimensions if available
      if (dimensions.width && dimensions.height && dimensions.length) {
        const volumeInCubicMeters = dimensions.width * dimensions.height * dimensions.length;
        const volumeInLiters = volumeInCubicMeters * 1000; // 1 cubic meter = 1000 liters
        return convertUnit(volumeInLiters, 'liter', unit);
      }
      return 0;
      
    case 'weight':
      if (!dimensions.weight) return 0;
      return convertUnit(dimensions.weight, 'kg', unit);
      
    case 'length':
      if (unit === 'meter') return dimensions.width || 0;
      if (unit === 'cm') return (dimensions.width || 0) * 100;
      if (unit === 'mm') return (dimensions.width || 0) * 1000;
      if (unit === 'foot') return (dimensions.width || 0) * 3.281;
      if (unit === 'inch') return (dimensions.width || 0) * 39.37;
      if (unit === 'linear_yard') return (dimensions.width || 0) * 1.094;
      return dimensions.width || 0;
      
    case 'count':
      return 1; // Each piece/unit is 1
      
    case 'textile':
      return calculateTextileValue(dimensions, unit);
      
    default:
      return 0;
  }
}

/**
 * Calculate textile unit value based on dimensions
 */
function calculateTextileValue(dimensions: ProductDimensions, unit: PricingUnit): number {
  switch (unit) {
    case 'gsm':
      // GSM is already in grams per square meter
      return dimensions.gsm || 0;
      
    case 'denier':
      // Denier is grams per 9000 meters of fiber
      return dimensions.denier || 0;
      
    case 'tex':
      // Tex is grams per 1000 meters of fiber
      return dimensions.tex || 0;
      
    case 'oz_per_sqyd':
      // Convert GSM to oz/sqyd: 1 gsm = 0.0295 oz/sqyd
      return (dimensions.gsm || 0) * 0.0295;
      
    case 'thread_count':
      // Thread count per unit area
      return dimensions.thread_count || 0;
      
    default:
      return 0;
  }
}

/**
 * Convert between textile units
 */
function convertTextileUnit(value: number, fromUnit: PricingUnit, toUnit: PricingUnit): number {
  if (fromUnit === toUnit) return value;
  
  // Convert to base unit (GSM for area-based, Denier for linear-based)
  let baseValue = value;
  
  switch (fromUnit) {
    case 'gsm':
      baseValue = value;
      break;
    case 'oz_per_sqyd':
      baseValue = value / 0.0295; // Convert to GSM
      break;
    case 'denier':
      baseValue = value;
      break;
    case 'tex':
      baseValue = value * 9; // Convert tex to denier (1 tex = 9 denier)
      break;
    default:
      return value;
  }
  
  // Convert from base unit to target unit
  switch (toUnit) {
    case 'gsm':
      return baseValue;
    case 'oz_per_sqyd':
      return baseValue * 0.0295;
    case 'denier':
      return baseValue;
    case 'tex':
      return baseValue / 9; // Convert denier to tex
    default:
      return baseValue;
  }
}

/**
 * Convert between units of the same category
 */
function convertUnit(value: number, fromUnit: PricingUnit, toUnit: PricingUnit): number {
  if (fromUnit === toUnit) return value;
  
  // Handle textile units separately
  if (isTextileUnit(fromUnit) && isTextileUnit(toUnit)) {
    return convertTextileUnit(value, fromUnit, toUnit);
  }
  
  const fromFactor = CONVERSION_FACTORS[fromUnit] || 1;
  const toFactor = CONVERSION_FACTORS[toUnit] || 1;
  
  // Convert to base unit first, then to target unit
  const baseValue = value / fromFactor;
  return baseValue * toFactor;
}

/**
 * Check if a unit is a textile unit
 */
function isTextileUnit(unit: PricingUnit): boolean {
  return ['gsm', 'denier', 'tex', 'oz_per_sqyd', 'thread_count'].includes(unit);
}

/**
 * Calculate total price based on unit price, quantity, and product dimensions
 */
export function calculateTotalPrice(
  unitPrice: number,
  quantity: number,
  pricingUnit: PricingUnit,
  productDimensions: ProductDimensions
): number {
  const unitInfo = PRICING_UNITS.find(u => u.unit === pricingUnit);
  if (!unitInfo) return 0;
  
  if (unitInfo.category === 'count') {
    // Fixed price per piece/unit/dozen/etc.
    const countMultiplier = getCountMultiplier(pricingUnit);
    return unitPrice * quantity * countMultiplier;
  }
  
  // Calculate unit value based on dimensions
  const unitValue = calculateUnitValue(productDimensions, pricingUnit);
  const totalValue = unitValue * quantity;
  return unitPrice * totalValue;
}

/**
 * Get multiplier for count-based units
 */
function getCountMultiplier(unit: PricingUnit): number {
  switch (unit) {
    case 'dozen': return 12;
    case 'hundred': return 100;
    case 'thousand': return 1000;
    default: return 1;
  }
}

/**
 * Get the unit value of one unit of the product in the specified unit
 */
export function getUnitValue(productDimensions: ProductDimensions, unit: PricingUnit): number {
  return calculateUnitValue(productDimensions, unit);
}

/**
 * Format unit label with proper pluralization
 */
export function formatUnitLabel(unit: PricingUnit, quantity: number = 1): string {
  const unitInfo = PRICING_UNITS.find(u => u.unit === unit);
  if (!unitInfo) return unit;
  
  const label = unitInfo.label.toLowerCase();
  
  if (quantity === 1) {
    return label;
  }
  
  // Simple pluralization rules
  if (label.endsWith('piece')) return label.replace('piece', 'pieces');
  if (label.endsWith('roll')) return label.replace('roll', 'rolls');
  if (label.endsWith('foot')) return label.replace('foot', 'feet');
  if (label.endsWith('meter')) return label.replace('meter', 'meters');
  if (label.endsWith('yard')) return label.replace('yard', 'yards');
  if (label.endsWith('Linear Yard')) return label.replace('Linear Yard', 'Linear Yards');
  if (label.endsWith('kilogram')) return label.replace('kilogram', 'kilograms');
  if (label.endsWith('liter')) return label.replace('liter', 'liters');
  if (label.endsWith('gram')) return label.replace('gram', 'grams');
  if (label.endsWith('ton')) return label.replace('ton', 'tons');
  if (label.endsWith('gallon')) return label.replace('gallon', 'gallons');
  if (label.endsWith('dozen')) return label.replace('dozen', 'dozens');
  if (label.endsWith('hundred')) return label.replace('hundred', 'hundreds');
  if (label.endsWith('thousand')) return label.replace('thousand', 'thousands');
  if (label.endsWith('gsm')) return label; // GSM doesn't change
  if (label.endsWith('denier')) return label; // Denier doesn't change
  if (label.endsWith('tex')) return label; // Tex doesn't change
  if (label.endsWith('thread count')) return label.replace('thread count', 'thread counts');
  
  return label;
}

/**
 * Validate if product dimensions are sufficient for the selected pricing unit
 */
export function validateDimensionsForUnit(dimensions: ProductDimensions, unit: PricingUnit): boolean {
  const unitInfo = PRICING_UNITS.find(u => u.unit === unit);
  if (!unitInfo) return false;
  
  if (!unitInfo.requiresDimensions) return true;
  
  switch (unitInfo.category) {
    case 'area':
      return !!(dimensions.width && dimensions.height);
    case 'volume':
      return !!(dimensions.volume || (dimensions.width && dimensions.height && dimensions.length));
    case 'weight':
      return !!(dimensions.weight);
    case 'length':
      return !!(dimensions.width);
    case 'count':
      return true;
    case 'textile':
      return validateTextileDimensions(dimensions, unit);
    default:
      return true;
  }
}

/**
 * Validate textile-specific dimensions
 */
function validateTextileDimensions(dimensions: ProductDimensions, unit: PricingUnit): boolean {
  switch (unit) {
    case 'gsm':
      return !!(dimensions.gsm || (dimensions.width && dimensions.height && dimensions.weight));
    case 'denier':
      return !!(dimensions.denier || (dimensions.length && dimensions.weight));
    case 'tex':
      return !!(dimensions.tex || (dimensions.length && dimensions.weight));
    case 'oz_per_sqyd':
      return !!(dimensions.gsm || (dimensions.width && dimensions.height && dimensions.weight));
    case 'thread_count':
      return !!(dimensions.thread_count || (dimensions.width && dimensions.height));
    default:
      return true;
  }
}

/**
 * Get suggested pricing unit based on product type and dimensions
 */
export function getSuggestedPricingUnit(productDimensions: ProductDimensions): PricingUnit {
  const productType = productDimensions.productType;
  
  // For raw materials, prioritize weight or volume
  if (productType === 'raw_material') {
    if (productDimensions.weight) return 'kg';
    if (productDimensions.volume) return 'liter';
    return 'unit';
  }
  
  // For bulk products, prioritize weight or volume
  if (productType === 'bulk_product') {
    if (productDimensions.weight) return 'kg';
    if (productDimensions.volume) return 'liter';
    return 'unit';
  }
  
  // For carpets, prioritize GSM or area-based pricing
  if (productType === 'carpet') {
    if (productDimensions.gsm) return 'gsm';
    if (productDimensions.width && productDimensions.height) {
      return 'sqm'; // Default to square meters
    }
    if (productDimensions.width) {
      return 'meter'; // Linear meter if only width available
    }
    return 'piece';
  }
  
  // For textiles and fibers, prioritize textile units
  if (productType === 'textile' || productType === 'fiber') {
    if (productDimensions.gsm) return 'gsm';
    if (productDimensions.denier) return 'denier';
    if (productDimensions.tex) return 'tex';
    if (productDimensions.thread_count) return 'thread_count';
    if (productDimensions.weight) return 'kg';
    return 'unit';
  }
  
  // For finished goods, check dimensions
  if (productType === 'finished_good') {
    if (productDimensions.width && productDimensions.height) {
      return 'sqm';
    }
    if (productDimensions.width) {
      return 'meter';
    }
    return 'piece';
  }
  
  // Default logic for unknown product types
  if (productDimensions.weight) return 'kg';
  if (productDimensions.volume) return 'liter';
  if (productDimensions.width && productDimensions.height) return 'sqm';
  if (productDimensions.width) return 'meter';
  
  return 'piece';
}

/**
 * Get available pricing units for a product based on its type and dimensions
 */
export function getAvailablePricingUnits(productDimensions: ProductDimensions): PricingUnit[] {
  const productType = productDimensions.productType;
  
  return PRICING_UNITS
    .filter(unitInfo => {
      // Check if unit is applicable to this product type
      if (productType && !unitInfo.applicableTo.includes(productType)) {
        return false;
      }
      
      // Check if dimensions are sufficient
      return !unitInfo.requiresDimensions || validateDimensionsForUnit(productDimensions, unitInfo.unit);
    })
    .map(unitInfo => unitInfo.unit);
}
