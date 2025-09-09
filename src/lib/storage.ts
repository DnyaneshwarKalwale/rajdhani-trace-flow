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
  PERFORMANCE_METRICS: 'rajdhani_performance'
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

// Real-time Synchronization Class
export class RealTimeSync {
  private static instance: RealTimeSync;
  private listeners: Map<string, Function[]> = new Map();
  
  static getInstance(): RealTimeSync {
    if (!RealTimeSync.instance) {
      RealTimeSync.instance = new RealTimeSync();
    }
    return RealTimeSync.instance;
  }
  
  // Subscribe to data changes
  subscribe(key: string, callback: Function) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);
  }
  
  // Unsubscribe from data changes
  unsubscribe(key: string, callback: Function) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  // Notify all listeners of data changes
  notify(key: string, data: any) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in storage listener:', error);
        }
      });
    }
  }
  
  // Update data and notify listeners
  updateData(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notify(key, data);
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  }
}

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
    RealTimeSync.getInstance().notify(key, existingData);
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
      RealTimeSync.getInstance().notify(key, existingData);
    }
  } catch (error) {
    console.error(`Error updating localStorage (${key}):`, error);
  }
};

export const deleteFromStorage = (key: string, itemId: string) => {
  try {
    const existingData = getFromStorage(key);
    const filteredData = existingData.filter((item: any) => item.id !== itemId);
    localStorage.setItem(key, JSON.stringify(filteredData));
    RealTimeSync.getInstance().notify(key, filteredData);
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
    RealTimeSync.getInstance().notify(STORAGE_KEYS.PRODUCT_RECIPES, existingRecipes);
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

// Data Backup System
export class DataBackup {
  private static backupInterval = 5 * 60 * 1000; // 5 minutes
  private static backupTimer: NodeJS.Timeout | null = null;
  
  static startBackup() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
    
    this.backupTimer = setInterval(() => {
      this.createBackup();
    }, this.backupInterval);
  }
  
  static stopBackup() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = null;
    }
  }
  
  static createBackup() {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          orders: getFromStorage(STORAGE_KEYS.ORDERS),
          products: getFromStorage(STORAGE_KEYS.PRODUCTS),
          individualProducts: getFromStorage(STORAGE_KEYS.INDIVIDUAL_PRODUCTS),

          rawMaterials: getFromStorage(STORAGE_KEYS.RAW_MATERIALS),
          customers: getFromStorage(STORAGE_KEYS.CUSTOMERS),
          materialConsumption: getFromStorage(STORAGE_KEYS.MATERIAL_CONSUMPTION),
          auditLog: getFromStorage(STORAGE_KEYS.AUDIT_LOG)
        },
        version: '1.0.0'
      };
      
      const backupKey = `rajdhani_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));
      
      // Keep only last 10 backups
      this.cleanupOldBackups();
      
      console.log('Backup created successfully:', backupKey);
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }
  
  static cleanupOldBackups() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('rajdhani_backup_'));
      if (keys.length > 10) {
        keys.sort().slice(0, keys.length - 10).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }
  
  static restoreFromBackup(backupKey: string): boolean {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) return false;
      
      const backup = JSON.parse(backupData);
      
      // Restore all data
      Object.entries(backup.data).forEach(([key, data]) => {
        localStorage.setItem(key, JSON.stringify(data));
      });
      
      console.log('Backup restored successfully from:', backupKey);
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }
}

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
      
      // Start real-time synchronization
      RealTimeSync.getInstance();
      
      // Start automatic backup
      DataBackup.startBackup();
      
      // Initialize audit logging
      this.initializeAuditLog();
      
      // Set up event listeners for real-time updates
      this.setupEventListeners();
      
      console.log('Rajdhani ERP System initialized successfully');
    } catch (error) {
      console.error('Error initializing Rajdhani ERP:', error);
    }
  }
  
  static initializeStorage() {
    // Initialize with sample data if empty
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
  }
  
  static initializeAuditLog() {
    // Create initial audit log entry
    logAudit('system_initialized', 'orders', {
      message: 'Rajdhani ERP System initialized',
      timestamp: new Date().toISOString()
    });
  }
  
  static setupEventListeners() {
    // Listen for storage changes across tabs
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('rajdhani_')) {
        try {
          const newData = e.newValue ? JSON.parse(e.newValue) : [];
          RealTimeSync.getInstance().notify(e.key, newData);
        } catch (error) {
          console.error('Error handling storage event:', error);
        }
      }
    });
  }
  
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

// Export default initialization
export default RajdhaniERP;
