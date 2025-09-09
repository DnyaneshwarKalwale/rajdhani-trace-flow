import { generateUniqueId } from './storage';

export interface Machine {
  id: string;
  name: string;
  type: 'cutting' | 'needle-punching' | 'testing' | 'other';
  status: 'available' | 'busy' | 'maintenance';
  capacity: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionStep {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  machineId: string | null;
  machineName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'quality_check';
  startTime?: string;
  endTime?: string;
  inspectorId?: string;
  inspectorName?: string;
  qualityNotes?: string;
  isQualityStep?: boolean;
  isFixedStep?: boolean;
  stepType?: 'material_selection' | 'machine_operation' | 'wastage_tracking' | 'testing_individual';
  createdAt: string;
}

export interface ProductionFlow {
  id: string;
  productionProductId: string;
  steps: ProductionStep[];
  currentStepIndex: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Default machines
const defaultMachines: Machine[] = [
  {
    id: 'machine-1',
    name: 'BR3C-Cutter',
    type: 'cutting',
    status: 'available',
    capacity: 'Cutting 3.5 mm sheets',
    description: 'High precision cutting machine for carpet manufacturing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'machine-2', 
    name: 'CUTTING MACHINE',
    type: 'cutting',
    status: 'available',
    capacity: 'General cutting operations',
    description: 'Multi-purpose cutting machine',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'machine-3',
    name: 'NEEDLE PUNCHING',
    type: 'needle-punching',
    status: 'available', 
    capacity: 'Needle punching operations',
    description: 'Specialized needle punching machine for carpet fiber processing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'machine-4',
    name: 'Testing Station',
    type: 'testing',
    status: 'available',
    capacity: 'Quality testing and inspection',
    description: 'Final quality testing and product inspection station',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Machine management functions
export const getMachines = (): Machine[] => {
  const machines = localStorage.getItem('rajdhani_machines');
  if (!machines) {
    // Initialize with default machines
    localStorage.setItem('rajdhani_machines', JSON.stringify(defaultMachines));
    return defaultMachines;
  }
  return JSON.parse(machines);
};

export const saveMachine = (machine: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>): Machine => {
  const machines = getMachines();
  const newMachine: Machine = {
    ...machine,
    id: generateUniqueId('MACH'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  machines.push(newMachine);
  localStorage.setItem('rajdhani_machines', JSON.stringify(machines));
  return newMachine;
};

export const updateMachine = (id: string, updates: Partial<Machine>): Machine | null => {
  const machines = getMachines();
  const index = machines.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  machines[index] = {
    ...machines[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem('rajdhani_machines', JSON.stringify(machines));
  return machines[index];
};

export const deleteMachine = (id: string): boolean => {
  const machines = getMachines();
  const filteredMachines = machines.filter(m => m.id !== id);
  if (filteredMachines.length === machines.length) return false;
  
  localStorage.setItem('rajdhani_machines', JSON.stringify(filteredMachines));
  return true;
};

export const getAvailableMachines = (): Machine[] => {
  return getMachines().filter(m => m.status === 'available');
};

export const getMachinesByType = (type: Machine['type']): Machine[] => {
  return getMachines().filter(m => m.type === type);
};

// Production Flow management functions
export const getProductionFlows = (): ProductionFlow[] => {
  const flows = localStorage.getItem('rajdhani_production_flows');
  return flows ? JSON.parse(flows) : [];
};

export const saveProductionFlow = (flow: ProductionFlow): void => {
  const flows = getProductionFlows();
  const existingIndex = flows.findIndex(f => f.id === flow.id);
  
  if (existingIndex >= 0) {
    flows[existingIndex] = { ...flow, updatedAt: new Date().toISOString() };
  } else {
    flows.push(flow);
  }
  
  localStorage.setItem('rajdhani_production_flows', JSON.stringify(flows));
};

export const getProductionFlow = (productionProductId: string): ProductionFlow | null => {
  const flows = getProductionFlows();
  return flows.find(f => f.productionProductId === productionProductId) || null;
};

export const createDefaultProductionFlow = (productionProductId: string): ProductionFlow => {
  const machines = getMachines();
  const testingMachine = machines.find(m => m.type === 'testing');
  
  const defaultSteps: ProductionStep[] = [
    {
      id: generateUniqueId('STEP'),
      stepNumber: 1,
      name: 'Raw Material Selection',
      description: 'Select and prepare raw materials for production',
      machineId: null,
      machineName: 'Manual Process',
      status: 'pending',
      isQualityStep: false,
      isFixedStep: true,
      stepType: 'material_selection',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateUniqueId('STEP'),
      stepNumber: 2,
      name: 'Initial Processing',
      description: 'First stage of carpet processing - select machine',
      machineId: null,
      machineName: 'Select Machine',
      status: 'pending',
      isQualityStep: false,
      isFixedStep: false,
      stepType: 'machine_operation',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateUniqueId('STEP'),
      stepNumber: 3,
      name: 'Raw Material Wastage',
      description: 'Track and record raw material wastage during production',
      machineId: null,
      machineName: 'Manual Process',
      status: 'pending',
      isQualityStep: false,
      isFixedStep: true,
      stepType: 'wastage_tracking',
      createdAt: new Date().toISOString(),
    },
    {
      id: generateUniqueId('STEP'),
      stepNumber: 4,
      name: 'Testing & Individual Product Details',
      description: 'Final quality testing and individual product details entry',
      machineId: testingMachine?.id || null,
      machineName: testingMachine?.name || 'Testing Station',
      status: 'pending',
      isQualityStep: true,
      isFixedStep: true,
      stepType: 'testing_individual',
      createdAt: new Date().toISOString(),
    },
  ];

  const flow: ProductionFlow = {
    id: generateUniqueId('FLOW'),
    productionProductId,
    steps: defaultSteps,
    currentStepIndex: 0,
    status: 'not_started',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return flow;
};

export const updateProductionStep = (
  flowId: string, 
  stepId: string, 
  updates: Partial<ProductionStep>
): ProductionFlow | null => {
  const flows = getProductionFlows();
  const flowIndex = flows.findIndex(f => f.id === flowId);
  if (flowIndex === -1) return null;

  const stepIndex = flows[flowIndex].steps.findIndex(s => s.id === stepId);
  if (stepIndex === -1) return null;

  flows[flowIndex].steps[stepIndex] = {
    ...flows[flowIndex].steps[stepIndex],
    ...updates,
  };

  flows[flowIndex].updatedAt = new Date().toISOString();
  localStorage.setItem('rajdhani_production_flows', JSON.stringify(flows));
  return flows[flowIndex];
};

export const addProductionStep = (
  flowId: string, 
  stepData: Omit<ProductionStep, 'id' | 'stepNumber' | 'createdAt'>
): ProductionFlow | null => {
  const flows = getProductionFlows();
  const flowIndex = flows.findIndex(f => f.id === flowId);
  if (flowIndex === -1) return null;

  const newStep: ProductionStep = {
    ...stepData,
    id: generateUniqueId('STEP'),
    stepNumber: flows[flowIndex].steps.length,
    createdAt: new Date().toISOString(),
    isFixedStep: false,
    stepType: 'machine_operation',
  };

  // Find the position to insert - after machine operations but before wastage step
  const steps = flows[flowIndex].steps;
  let insertIndex = steps.length;
  
  // Find the wastage step (second last fixed step)
  const wastageStepIndex = steps.findIndex(s => s.stepType === 'wastage_tracking');
  if (wastageStepIndex !== -1) {
    insertIndex = wastageStepIndex;
  }
  
  // Insert the new step
  flows[flowIndex].steps.splice(insertIndex, 0, newStep);
  
  // Renumber all steps
  flows[flowIndex].steps.forEach((step, index) => {
    step.stepNumber = index + 1;
  });

  flows[flowIndex].updatedAt = new Date().toISOString();
  localStorage.setItem('rajdhani_production_flows', JSON.stringify(flows));
  return flows[flowIndex];
};

export const moveToNextStep = (flowId: string): ProductionFlow | null => {
  const flows = getProductionFlows();
  const flowIndex = flows.findIndex(f => f.id === flowId);
  if (flowIndex === -1) return null;

  const flow = flows[flowIndex];
  if (flow.currentStepIndex < flow.steps.length - 1) {
    flow.currentStepIndex++;
    flow.steps[flow.currentStepIndex].status = 'in_progress';
    flow.steps[flow.currentStepIndex].startTime = new Date().toISOString();
  }

  if (flow.currentStepIndex === flow.steps.length - 1) {
    flow.status = 'completed';
  } else {
    flow.status = 'in_progress';
  }

  flow.updatedAt = new Date().toISOString();
  localStorage.setItem('rajdhani_production_flows', JSON.stringify(flows));
  return flows[flowIndex];
};

export const getProgressPercentage = (flow: ProductionFlow): number => {
  if (!flow.steps.length) return 0;
  const completedSteps = flow.steps.filter(s => s.status === 'completed').length;
  return Math.round((completedSteps / flow.steps.length) * 100);
};