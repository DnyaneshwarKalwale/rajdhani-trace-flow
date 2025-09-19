// Custom hook for dynamic pricing calculations

import { useState, useCallback, useMemo } from 'react';
import { 
  PricingUnit, 
  ProductDimensions, 
  calculateTotalPrice, 
  getUnitValue, 
  validateDimensionsForUnit,
  formatUnitLabel,
  getAvailablePricingUnits
} from '../utils/unitConverter';
import { ExtendedOrderItem, PricingCalculation } from '../types/orderTypes';

export interface UsePricingCalculatorReturn {
  calculateItemPrice: (item: ExtendedOrderItem) => PricingCalculation;
  calculateOrderTotal: (items: ExtendedOrderItem[]) => number;
  validateItem: (item: ExtendedOrderItem) => boolean;
  getAvailablePricingUnits: (dimensions: ProductDimensions) => PricingUnit[];
  formatPrice: (price: number) => string;
  formatUnit: (unit: PricingUnit, quantity?: number) => string;
}

export function usePricingCalculator(): UsePricingCalculatorReturn {
  
  const calculateItemPrice = useCallback((item: ExtendedOrderItem): PricingCalculation => {
    const { unit_price, quantity, pricing_unit, product_dimensions } = item;
    
    // Validate dimensions for the selected pricing unit
    const isValidDimensions = validateDimensionsForUnit(product_dimensions, pricing_unit);
    
    if (!isValidDimensions) {
      return {
        unitPrice: unit_price,
        quantity,
        unitValue: 0,
        totalValue: 0,
        totalPrice: 0,
        pricingUnit: pricing_unit,
        isValid: false,
        errorMessage: `Product dimensions are required for ${formatUnitLabel(pricing_unit)} pricing`
      };
    }
    
    // Calculate unit value
    const unitValue = getUnitValue(product_dimensions, pricing_unit);
    
    // Calculate total price
    const totalPrice = calculateTotalPrice(unit_price, quantity, pricing_unit, product_dimensions);
    
    return {
      unitPrice: unit_price,
      quantity,
      unitValue,
      totalValue: unitValue * quantity,
      totalPrice,
      pricingUnit: pricing_unit,
      isValid: true
    };
  }, []);
  
  const calculateOrderTotal = useCallback((items: ExtendedOrderItem[]): number => {
    return items.reduce((total, item) => {
      const calculation = calculateItemPrice(item);
      return total + (calculation.isValid ? calculation.totalPrice : 0);
    }, 0);
  }, [calculateItemPrice]);
  
  const validateItem = useCallback((item: ExtendedOrderItem): boolean => {
    const calculation = calculateItemPrice(item);
    return calculation.isValid;
  }, [calculateItemPrice]);
  
  const getAvailablePricingUnitsForDimensions = useCallback((dimensions: ProductDimensions): PricingUnit[] => {
    return getAvailablePricingUnits(dimensions);
  }, []);
  
  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }, []);
  
  const formatUnit = useCallback((unit: PricingUnit, quantity: number = 1): string => {
    return formatUnitLabel(unit, quantity);
  }, []);
  
  return {
    calculateItemPrice,
    calculateOrderTotal,
    validateItem,
    getAvailablePricingUnits: getAvailablePricingUnitsForDimensions,
    formatPrice,
    formatUnit
  };
}
