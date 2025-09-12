// Rajdhani ERP - Real-time localStorage Management System

// Storage Keys for all modules
export const STORAGE_KEYS = {
  ORDERS: 'rajdhani_orders',
  PRODUCTS: 'rajdhani_products',
  INDIVIDUAL_PRODUCTS: 'rajdhani_individual_products',
  PRODUCTION_PRODUCTS: 'rajdhani_production_products',
  PRODUCT_RECIPES: 'rajdhani_product_recipes',
  PRODUCTION_PRODUCT_DATA: 'rajdhani_production_product_data',

  RAW_MATERIALS: 'rajdhani_raw_materials',
  CUSTOMERS: 'rajdhani_customers',
  MATERIAL_CONSUMPTION: 'rajdhani_material_consumption',
  SYSTEM_SETTINGS: 'rajdhani_settings',
  AUDIT_LOG: 'rajdhani_audit_log',
  PURCHASE_ORDERS: 'rajdhani_purchase_orders',
  PERFORMANCE_METRICS: 'rajdhani_performance',
  NOTIFICATIONS: 'rajdhani_notifications'
};

// Core Interfaces
export interface SystemData {
  orders: any[];
  products: any[];
  individualProducts: any[];

  rawMaterials: any[];
  customers: any[];
  materialConsumption: any[];
  lastSync: string;
  version: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  module: 'orders' | 'products' | 'materials';
  userId: string;
  details: any;
  previousState?: any;
  newState?: any;
}

export interface Notification {
  id: string;
  type: 'production_request' | 'low_stock' | 'order_alert' | 'system_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'dismissed' | 'resolved';
  module: 'orders' | 'products' | 'materials' | 'production';
  relatedId?: string; // Order ID, Product ID, etc.
  relatedData?: any; // Additional data like order details, product info
  createdAt: string;
  readAt?: string;
  resolvedAt?: string;
  createdBy: string;
}

export interface ProductRecipe {
  id: string;
  productId: string;
  productName: string;
  materials: {
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
  }[];
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Removed Real-time Synchronization Class

// Storage Utility Functions
export const getFromStorage = (key: string): any[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
};

export const saveToStorage = (key: string, item: any) => {
  try {
    const existingData = getFromStorage(key);
    existingData.push(item);
    localStorage.setItem(key, JSON.stringify(existingData));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

export const updateStorage = (key: string, updatedItem: any) => {
  try {
    const existingData = getFromStorage(key);
    const index = existingData.findIndex((item: any) => item.id === updatedItem.id);
    
    if (index !== -1) {
      existingData[index] = { ...existingData[index], ...updatedItem };
      localStorage.setItem(key, JSON.stringify(existingData));
    }
  } catch (error) {
    console.error(`Error updating localStorage (${key}):`, error);
  }
};

// Replace entire array in storage
export const replaceStorage = (key: string, data: any[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error replacing localStorage (${key}):`, error);
  }
};

export const deleteFromStorage = (key: string, itemId: string) => {
  try {
    const existingData = getFromStorage(key);
    const filteredData = existingData.filter((item: any) => item.id !== itemId);
    localStorage.setItem(key, JSON.stringify(filteredData));
  } catch (error) {
    console.error(`Error deleting from localStorage (${key}):`, error);
  }
};

// Recipe Management Functions
export const getProductRecipe = (productId: string): ProductRecipe | null => {
  try {
    const recipes = getFromStorage(STORAGE_KEYS.PRODUCT_RECIPES);
    console.log('All recipes in storage:', recipes);
    console.log('Looking for productId:', productId);
    const foundRecipe = recipes.find((recipe: ProductRecipe) => recipe.productId === productId);
    console.log('Found recipe:', foundRecipe);
    return foundRecipe || null;
  } catch (error) {
    console.error('Error getting product recipe:', error);
    return null;
  }
};

export const saveProductRecipe = (recipe: ProductRecipe): void => {
  try {
    const existingRecipes = getFromStorage(STORAGE_KEYS.PRODUCT_RECIPES);
    console.log('Existing recipes before save:', existingRecipes);
    const existingIndex = existingRecipes.findIndex((r: ProductRecipe) => r.productId === recipe.productId);
    
    if (existingIndex !== -1) {
      // Update existing recipe
      existingRecipes[existingIndex] = recipe;
      console.log('Updated existing recipe at index:', existingIndex);
    } else {
      // Add new recipe
      existingRecipes.push(recipe);
      console.log('Added new recipe');
    }
    
    console.log('Saving recipes to localStorage:', existingRecipes);
    localStorage.setItem(STORAGE_KEYS.PRODUCT_RECIPES, JSON.stringify(existingRecipes));
  } catch (error) {
    console.error('Error saving product recipe:', error);
  }
};

export const createRecipeFromMaterials = (
  productId: string, 
  productName: string, 
  materials: any[], 
  createdBy: string = 'admin'
): ProductRecipe => {
  const totalCost = materials.reduce((sum, material) => 
    sum + ((material.costPerUnit || 0) * (material.selectedQuantity || 1)), 0
  );

  return {
    id: generateUniqueId('RECIPE'),
    productId,
    productName,
    materials: materials.map(material => ({
      materialId: material.id,
      materialName: material.name,
      quantity: material.selectedQuantity || 1,
      unit: material.unit,
      costPerUnit: material.costPerUnit || 0
    })),
    totalCost,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy
  };
};

export const getProductionProductData = (productId: string): any | null => {
  try {
    const productData = getFromStorage(STORAGE_KEYS.PRODUCTION_PRODUCT_DATA);
    return productData.find((item: any) => item.id === productId) || null;
  } catch (error) {
    console.error('Error getting production product data:', error);
    return null;
  }
};

// Audit Logging System
export const logAudit = (action: string, module: AuditLog['module'], details: any, userId: string = 'admin') => {
  try {
    const auditLog: AuditLog = {
      id: generateUniqueId('AUDIT'),
      timestamp: new Date().toISOString(),
      action,
      module,
      userId,
      details
    };
    
    const existingLogs = getFromStorage(STORAGE_KEYS.AUDIT_LOG);
    existingLogs.push(auditLog);
    
    // Keep only last 1000 audit logs
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(existingLogs));
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

// Unique ID Generation
export const generateUniqueId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `${prefix}_${timestamp}_${randomStr}`;
};

// QR Code Generation
export const generateQRCode = (batchId: string, index: number): string => {
  const timestamp = Date.now().toString(36);
  return `QR_${batchId}_${index}_${timestamp}`;
};

// Removed Data Backup System

// Performance Monitoring
export class PerformanceMonitor {
  static trackOperation(operation: string, startTime: number) {
    try {
      const duration = Date.now() - startTime;
      
      const metrics = {
        operation,
        duration,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      // Store performance metrics
      const existingMetrics = getFromStorage(STORAGE_KEYS.PERFORMANCE_METRICS);
      existingMetrics.push(metrics);
      
      // Keep only last 1000 metrics
      if (existingMetrics.length > 1000) {
        existingMetrics.splice(0, existingMetrics.length - 1000);
      }
      
      localStorage.setItem(STORAGE_KEYS.PERFORMANCE_METRICS, JSON.stringify(existingMetrics));
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }
  
  static getAveragePerformance(operation: string): number {
    try {
      const metrics = getFromStorage(STORAGE_KEYS.PERFORMANCE_METRICS);
      const operationMetrics = metrics.filter((m: any) => m.operation === operation);
      
      if (operationMetrics.length === 0) return 0;
      
      const totalDuration = operationMetrics.reduce((sum: number, m: any) => sum + m.duration, 0);
      return totalDuration / operationMetrics.length;
    } catch (error) {
      console.error('Error calculating average performance:', error);
      return 0;
    }
  }
}

// System Initialization
export class RajdhaniERP {
  static initialize() {
    try {
      // Initialize localStorage with default data
      this.initializeStorage();
      
      // Initialize audit logging
      this.initializeAuditLog();
      
      console.log('Rajdhani ERP System initialized successfully');
    } catch (error) {
      console.error('Error initializing Rajdhani ERP:', error);
    }
  }
  
  static initializeStorage() {
    // Initialize with empty arrays if storage keys don't exist
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
  }

  // Clear all customer data from localStorage
  static clearCustomerData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
      console.log('✅ Customer data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing customer data:', error);
    }
  }
  
  static initializeAuditLog() {
    // Create initial audit log entry
    logAudit('system_initialized', 'orders', {
      message: 'Rajdhani ERP System initialized',
      timestamp: new Date().toISOString()
    });
  }
  
  // Removed setupEventListeners - no longer needed
  
  static getSystemStatus() {
    try {
      const orders = getFromStorage(STORAGE_KEYS.ORDERS);
      const products = getFromStorage(STORAGE_KEYS.INDIVIDUAL_PRODUCTS);

      const rawMaterials = getFromStorage(STORAGE_KEYS.RAW_MATERIALS);
      
      return {
        totalOrders: orders.length,
        totalProducts: products.length,

        totalMaterials: rawMaterials.length,
        lastSync: new Date().toISOString(),
        systemVersion: '1.0.0'
      };
    } catch (error) {
      console.error('Error getting system status:', error);
      return null;
    }
  }
}

// Notification Management Functions
export const createNotification = (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: generateUniqueId('NOTIF'),
    createdAt: new Date().toISOString()
  };
  
  const existingNotifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS) || [];
  // Flatten any nested arrays before adding new notification
  const flattenedNotifications = existingNotifications.flat(Infinity);
  const updatedNotifications = [newNotification, ...flattenedNotifications];
  replaceStorage(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
  
  return newNotification;
};

export const getNotifications = (module?: string, status?: string): Notification[] => {
  const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS) || [];
  // Flatten any nested arrays
  const flattenedNotifications = notifications.flat(Infinity);
  
  let filtered = flattenedNotifications;
  if (module) {
    filtered = filtered.filter(n => n && n.module === module);
  }
  if (status) {
    filtered = filtered.filter(n => n && n.status === status);
  }
  
  return filtered;
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS) || [];
  const flattenedNotifications = notifications.flat(Infinity);
  const updatedNotifications = flattenedNotifications.map(n => 
    n && n.id === notificationId 
      ? { ...n, status: 'read' as const, readAt: new Date().toISOString() }
      : n
  );
  replaceStorage(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
};

export const resolveNotification = (notificationId: string): void => {
  const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS) || [];
  const flattenedNotifications = notifications.flat(Infinity);
  const updatedNotifications = flattenedNotifications.map(n => 
    n && n.id === notificationId 
      ? { ...n, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
      : n
  );
  replaceStorage(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
};

// Utility function to fix nested arrays in localStorage
export const fixNestedArray = (data: any[]): any[] => {
  if (!Array.isArray(data) || data.length === 0) return data;
  
  // Check if first element is an array (indicating nested structure)
  if (Array.isArray(data[0])) {
    console.log('🔧 Fixing nested array structure');
    return data.flat();
  }
  
  return data;
};

// Export default initialization
export default RajdhaniERP;
