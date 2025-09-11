import rawMaterialsData from '../data/rawMaterials.json';

// Generate unique ID function
const generateUniqueId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `${prefix}_${timestamp}_${randomStr}`;
};

// Storage keys
export const STORAGE_KEYS = {
  RAW_MATERIALS: 'rajdhani_raw_materials',
  MATERIAL_ORDERS: 'rajdhani_material_orders',
  SUPPLIERS: 'rajdhani_suppliers'
};

// Raw Materials localStorage functions
export const rawMaterialsStorage = {
  // Initialize with default data if localStorage is empty
  initialize: () => {
    const existingData = localStorage.getItem(STORAGE_KEYS.RAW_MATERIALS);
    if (!existingData || existingData === '[]' || existingData === 'null' || existingData === 'undefined') {
      localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(rawMaterialsData));
      return true;
    } else {
      return false;
    }
  },

  // Check if initialization is needed
  needsInitialization: () => {
    const existingData = localStorage.getItem(STORAGE_KEYS.RAW_MATERIALS);
    return !existingData || existingData === '[]' || existingData === 'null' || existingData === 'undefined';
  },

  // Get all raw materials
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RAW_MATERIALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading raw materials from localStorage:', error);
      return [];
    }
  },

  // Add new raw material
  add: (material: any) => {
    try {
      const materials = rawMaterialsStorage.getAll();
      const newMaterial = {
        ...material,
        id: generateUniqueId('MAT'),
        createdAt: new Date().toISOString(),
        materialsUsed: [],
        totalValue: material.currentStock * material.costPerUnit
      };
      materials.push(newMaterial);
      localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(materials));
      return newMaterial;
    } catch (error) {
      console.error('Error adding raw material to localStorage:', error);
      throw error;
    }
  },

  // Update existing raw material
  update: (id: string, updates: any) => {
    try {
      const materials = rawMaterialsStorage.getAll();
      const index = materials.findIndex((m: any) => m.id === id);
      if (index !== -1) {
        materials[index] = { ...materials[index], ...updates };
        // Recalculate total value if stock or cost changed
        if (updates.currentStock !== undefined || updates.costPerUnit !== undefined) {
          materials[index].totalValue = materials[index].currentStock * materials[index].costPerUnit;
        }
        localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(materials));
        return materials[index];
      }
      throw new Error('Material not found');
    } catch (error) {
      console.error('Error updating raw material in localStorage:', error);
      throw error;
    }
  },

  // Delete raw material
  delete: (id: string) => {
    try {
      const materials = rawMaterialsStorage.getAll();
      const filtered = materials.filter((m: any) => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting raw material from localStorage:', error);
      throw error;
    }
  },

  // Get material by ID
  getById: (id: string) => {
    try {
      const materials = rawMaterialsStorage.getAll();
      return materials.find((m: any) => m.id === id);
    } catch (error) {
      console.error('Error getting raw material by ID from localStorage:', error);
      return null;
    }
  },

  // Search materials
  search: (query: string) => {
    try {
      const materials = rawMaterialsStorage.getAll();
      const searchTerm = query.toLowerCase();
      return materials.filter((material: any) =>
        material.name.toLowerCase().includes(searchTerm) ||
        material.category.toLowerCase().includes(searchTerm) ||
        material.brand.toLowerCase().includes(searchTerm) ||
        material.supplier.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching raw materials in localStorage:', error);
      return [];
    }
  },

  // Filter materials by category
  filterByCategory: (category: string) => {
    try {
      const materials = rawMaterialsStorage.getAll();
      if (category === 'all') return materials;
      return materials.filter((m: any) => m.category === category);
    } catch (error) {
      console.error('Error filtering raw materials by category in localStorage:', error);
      return [];
    }
  },

  // Filter materials by status
  filterByStatus: (status: string) => {
    try {
      const materials = rawMaterialsStorage.getAll();
      if (status === 'all') return materials;
      return materials.filter((m: any) => m.status === status);
    } catch (error) {
      console.error('Error filtering raw materials by status in localStorage:', error);
      return [];
    }
  },

  // Get low stock materials
  getLowStock: () => {
    try {
      const materials = rawMaterialsStorage.getAll();
      return materials.filter((m: any) => m.currentStock <= m.minThreshold);
    } catch (error) {
      console.error('Error getting low stock materials from localStorage:', error);
      return [];
    }
  },

  // Update stock levels
  updateStock: (id: string, newStock: number) => {
    try {
      const material = rawMaterialsStorage.getById(id);
      if (material) {
        const updates = {
          currentStock: newStock,
          lastRestocked: new Date().toISOString(),
          status: newStock === 0 ? 'out-of-stock' : 
                  newStock <= material.minThreshold ? 'low-stock' : 'in-stock'
        };
        return rawMaterialsStorage.update(id, updates);
      }
      throw new Error('Material not found');
    } catch (error) {
      console.error('Error updating stock in localStorage:', error);
      throw error;
    }
  },

  // Clear all data (for testing)
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.RAW_MATERIALS);
      return true;
    } catch (error) {
      console.error('Error clearing raw materials from localStorage:', error);
      return false;
    }
  },

  // Reset to default data
  reset: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(rawMaterialsData));
      return true;
    } catch (error) {
      console.error('Error resetting raw materials in localStorage:', error);
      return false;
    }
  }
};

// Material Orders localStorage functions
export const materialOrdersStorage = {
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATERIAL_ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading material orders from localStorage:', error);
      return [];
    }
  },

  add: (order: any) => {
    try {
      const orders = materialOrdersStorage.getAll();
      const newOrder = {
        ...order,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
        // Don't override the status - use what's passed in
      };
      orders.push(newOrder);
      localStorage.setItem(STORAGE_KEYS.MATERIAL_ORDERS, JSON.stringify(orders));
      return newOrder;
    } catch (error) {
      console.error('Error adding material order to localStorage:', error);
      throw error;
    }
  },

  update: (id: string, updates: any) => {
    try {
      const orders = materialOrdersStorage.getAll();
      const index = orders.findIndex((o: any) => o.id === id);
      if (index !== -1) {
        orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.MATERIAL_ORDERS, JSON.stringify(orders));
        return orders[index];
      }
      throw new Error('Order not found');
    } catch (error) {
      console.error('Error updating material order in localStorage:', error);
      throw error;
    }
  }
};

// Suppliers localStorage functions
export const suppliersStorage = {
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading suppliers from localStorage:', error);
      return [];
    }
  },

  add: (supplier: any) => {
    try {
      const suppliers = suppliersStorage.getAll();
      const newSupplier = {
        ...supplier,
        id: `supplier_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      suppliers.push(newSupplier);
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
      return newSupplier;
    } catch (error) {
      console.error('Error adding supplier to localStorage:', error);
      throw error;
    }
  }
};
