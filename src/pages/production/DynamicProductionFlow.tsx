import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, Package, Factory, Plus, Trash2, Save, Play, Pause, CheckCircle, 
  Clock, User, Settings, ArrowRight, AlertCircle, Cog, Edit, ExternalLink, AlertTriangle, FileSpreadsheet
} from "lucide-react";
import { getFromStorage, saveToStorage, replaceStorage, generateUniqueId } from "@/lib/storage";
import ProductionProgressBar from "@/components/production/ProductionProgressBar";

/**
 * Dynamic Production Flow - New Step-by-Step Production System
 * 
 * Features:
 * - Horizontal progress tracking with visual indicators
 * - One-step-at-a-time focused interface
 * - Dynamic machine selection with simplified add-machine form
 * - Step navigation (Previous/Next)
 * - Flexible step creation (add machine steps, wastage, testing)
 * - Individual product details form as final step
 * - All data stored in localStorage
 */

interface Machine {
  id: string;
  name: string;
  location: string;
  description?: string;
}

interface ProductionStep {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  machineId: string | null;
  machineName: string;
  status: 'pending' | 'in_progress' | 'completed';
  startTime?: string;
  endTime?: string;
  inspector: string;
  qualityNotes?: string;
  stepType: 'material_selection' | 'machine_operation' | 'wastage_tracking' | 'testing_individual';
}

interface ProductionFlow {
  id: string;
  productionProductId: string;
  steps: ProductionStep[];
  currentStepIndex: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface WasteItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  wasteType: "scrap" | "defective" | "excess";
  canBeReused: boolean;
  notes: string;
}

interface IndividualProductData {
  id: string;
  qrCode: string;
  customId: string;
  finalDimensions: string;
  finalWeight: string;
  finalThickness: string;
  qualityGrade: "A+" | "A" | "B" | "C" | "D";
  status: "available" | "damaged";
  notes: string;
}

export default function DynamicProductionFlow() {
  const { productId } = useParams();
  const navigate = useNavigate();
  
  // Core state
  const [productionProduct, setProductionProduct] = useState<any>(null);
  const [productionFlow, setProductionFlow] = useState<ProductionFlow | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [currentStepData, setCurrentStepData] = useState<any>({});
  
  // Dialog states
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [showAddMachineDialog, setShowAddMachineDialog] = useState(false);
  const [showWastageDialog, setShowWastageDialog] = useState(false);
  const [showIndividualProductsDialog, setShowIndividualProductsDialog] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{index: number, productId: string, missingFields: string[]}>>([]);
  
  // Form states
  const [stepForm, setStepForm] = useState({
    name: '',
    description: '',
    machineId: '',
    inspector: '',
    qualityNotes: ''
  });
  
  const [newMachineForm, setNewMachineForm] = useState({
    name: '',
    location: '',
    description: ''
  });
  
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [individualProducts, setIndividualProducts] = useState<IndividualProductData[]>([]);
  
  // Function to generate globally unique custom ID
  const generateGloballyUniqueCustomId = (productName: string): string => {
    // Get all existing individual products from storage
    const allIndividualProducts = getFromStorage('rajdhani_individual_products') || [];
    
    // Create product prefix from first 3 characters
    const prefix = productName.substring(0, 3).toUpperCase();
    
    // Find all existing IDs with this prefix
    const existingIds = allIndividualProducts
      .filter((product: any) => product.customId?.startsWith(prefix + '-'))
      .map((product: any) => product.customId);
    
    // Also include current batch IDs to avoid conflicts
    const currentBatchIds = individualProducts.map(p => p.customId);
    const allExistingIds = [...existingIds, ...currentBatchIds];
    
    // Find the next available number
    let counter = 1;
    let newId = `${prefix}-${String(counter).padStart(3, '0')}`;
    
    while (allExistingIds.includes(newId)) {
      counter++;
      newId = `${prefix}-${String(counter).padStart(3, '0')}`;
    }
    
    return newId;
  };
  
  // Initialize data
  useEffect(() => {
    cleanupMachinesData();
    loadInitialData();
  }, [productId]);

  // Reload production flow when component mounts to get latest data
  useEffect(() => {
    if (productId) {
      const flows = getFromStorage('rajdhani_production_flows') || [];
      const flow = flows.find((f: ProductionFlow) => f.productionProductId === productId);
      if (flow) {
        setProductionFlow(flow);
      }
    }
  }, [productId]);


  // Clean up corrupted machine data
  const cleanupMachinesData = () => {
    const storedMachines = getFromStorage('rajdhani_machines');
    
    if (storedMachines && Array.isArray(storedMachines)) {
      // Function to deeply flatten any nested arrays
      const deepFlatten = (arr) => {
        return arr.reduce((flat, item) => {
          if (Array.isArray(item)) {
            return flat.concat(deepFlatten(item));
          } else if (item && typeof item === 'object' && item.id && item.name) {
            return flat.concat(item);
          }
          return flat;
        }, []);
      };
      
      const flatMachines = deepFlatten(storedMachines);
      
      // Remove duplicates based on ID
      const uniqueMachines = flatMachines.filter((machine, index, self) => 
        index === self.findIndex(m => m.id === machine.id)
      );
      
      
      if (uniqueMachines.length !== storedMachines.length || storedMachines.some(item => Array.isArray(item))) {
        replaceStorage('rajdhani_machines', uniqueMachines);
        return uniqueMachines;
      }
    }
    return storedMachines;
  };
  
  const loadInitialData = () => {
    // Load production product
    const products = getFromStorage('rajdhani_production_products') || [];
    const product = products.find((p: any) => p.id === productId);
    if (product) {
      setProductionProduct(product);
    }
    
    // Load machines
    loadMachines();
    
    // Load or create production flow with proper 4-step structure
    loadProductionFlow();
  };
  
  const loadMachines = () => {
    // Get cleaned machines from cleanup function
    let storedMachines = cleanupMachinesData() || [];
    
    const defaultMachines = [
      {
        id: generateUniqueId('MACHINE'),
        name: 'BR3C-Cutter',
        location: 'Factory Floor A',
        description: 'High precision cutting machine'
      },
      {
        id: generateUniqueId('MACHINE'),
        name: 'CUTTING MACHINE',
        location: 'Factory Floor B',
        description: 'Multi-purpose cutting machine'
      },
      {
        id: generateUniqueId('MACHINE'),
        name: 'NEEDLE PUNCHING',
        location: 'Factory Floor C',
        description: 'Specialized needle punching machine'
      }
    ];
    
    
    if (!Array.isArray(storedMachines) || storedMachines.length === 0) {
      replaceStorage('rajdhani_machines', defaultMachines);
      setMachines(defaultMachines);
    } else {
      // Ensure each machine has proper structure
      const validMachines = storedMachines.filter(machine => 
        machine && typeof machine === 'object' && machine.id && machine.name
      ).map(machine => ({
        id: machine.id,
        name: machine.name,
        location: machine.location || 'Factory Floor',
        description: machine.description || ''
      }));
      
      setMachines(validMachines);
    }
  };
  
  const loadProductionFlow = () => {
    let flows = getFromStorage('rajdhani_production_flows') || [];
    
    // Clean up corrupted flows data
    if (Array.isArray(flows) && flows.length > 0) {
      // Check if we have nested arrays (corrupted data)
      const hasNestedArrays = flows.some(item => Array.isArray(item));
      if (hasNestedArrays) {
        // Extract valid flow objects from the corrupted structure
        const validFlows = [];
        const extractFlows = (arr) => {
          arr.forEach(item => {
            if (Array.isArray(item)) {
              extractFlows(item);
            } else if (item && typeof item === 'object' && item.id && item.productionProductId) {
              validFlows.push(item);
            }
          });
        };
        extractFlows(flows);
        flows = validFlows;
        // Save cleaned flows
        try {
          replaceStorage('rajdhani_production_flows', flows);
        } catch (error) {
          console.error('Error saving cleaned flows:', error);
          // If still quota exceeded, clear all flows
          replaceStorage('rajdhani_production_flows', []);
          flows = [];
        }
      }
    }
    
    
    let flow = flows.find((f: ProductionFlow) => f.productionProductId === productId);
    
    
    
    if (!flow) {
      // Create initial flow with proper 4-step structure
      flow = {
        id: generateUniqueId('FLOW'),
        productionProductId: productId!,
        steps: [
          {
            id: generateUniqueId('STEP'),
            stepNumber: 1,
            name: 'Raw Material Selection',
            description: 'Materials already selected in planning phase',
            machineId: null,
            machineName: 'Completed',
            status: 'completed' as const, // Auto-completed since materials are already selected
            inspector: 'Admin',
            stepType: 'material_selection' as const,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            qualityNotes: 'Materials selected during planning phase'
          },
          {
            id: generateUniqueId('STEP'),
            stepNumber: 2,
            name: 'Waste Generation Tracking',
            description: 'Track and record production wastage',
            machineId: null,
            machineName: 'Manual Process',
            status: 'pending' as const,
            inspector: '',
            stepType: 'wastage_tracking' as const
          },
          {
            id: generateUniqueId('STEP'),
            stepNumber: 3,
            name: 'Individual Product Details',
            description: 'Fill individual product details and complete production',
            machineId: null,
            machineName: 'Manual Process',
            status: 'pending' as const,
            inspector: '',
            stepType: 'testing_individual' as const
          }
        ],
        currentStepIndex: 1, // Start at waste generation (step 2)
        status: 'in_progress' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      flows.push(flow);
      try {
        replaceStorage('rajdhani_production_flows', flows);
      } catch (error) {
        console.error('Error saving new flow:', error);
        if (error.name === 'QuotaExceededError') {
          console.error('Storage quota exceeded. Clearing flows and saving new one.');
          // Clear all flows and save just this one
          replaceStorage('rajdhani_production_flows', [flow]);
        }
      }
    } else {
      // If flow exists, ensure material selection is completed if materials are already selected
      if (productionProduct?.materialsConsumed?.length > 0) {
        const materialStep = flow.steps.find(s => s.stepType === 'material_selection');
        if (materialStep && materialStep.status === 'pending') {
          materialStep.status = 'completed';
          materialStep.endTime = new Date().toISOString();
          materialStep.inspector = 'Admin';
          materialStep.qualityNotes = 'Materials selected during planning phase';
          
          // Update current step index to machine operations
          if (flow.currentStepIndex === 0) {
            flow.currentStepIndex = 1;
          }
          
          // Save updated flow
          const updatedFlows = flows.map(f => f.id === flow.id ? flow : f);
          replaceStorage('rajdhani_production_flows', updatedFlows);
        }
      }
      
      // Check if we have machine operations and set current step index correctly
      const machineSteps = flow.steps.filter(s => s.stepType === 'machine_operation');
      if (machineSteps.length > 0) {
        // Find the first pending machine step
        const pendingMachineStep = machineSteps.find(s => s.status === 'pending');
        if (pendingMachineStep) {
          const stepIndex = flow.steps.findIndex(s => s.id === pendingMachineStep.id);
          if (stepIndex !== -1) {
            flow.currentStepIndex = stepIndex;
          }
        } else {
          // All machine steps are completed, move to waste generation
          const wasteStepIndex = flow.steps.findIndex(s => s.stepType === 'wastage_tracking');
          if (wasteStepIndex !== -1) {
            flow.currentStepIndex = wasteStepIndex;
          }
        }
      }
      
    }
    
    setProductionFlow(flow);
  };
  
  const getCurrentStep = (): ProductionStep | null => {
    if (!productionFlow) return null;
    return productionFlow.steps[productionFlow.currentStepIndex] || null;
  };
  
  const getProgressPercentage = (): number => {
    if (!productionFlow || productionFlow.steps.length === 0) return 0;
    const completedSteps = productionFlow.steps.filter(s => s.status === 'completed').length;
    return Math.round((completedSteps / productionFlow.steps.length) * 100);
  };
  
  const handleStartStep = (step: ProductionStep) => {
    setCurrentStepData(step);
    setStepForm({
      name: step.name,
      description: step.description,
      machineId: step.machineId || '',
      inspector: step.inspector || '',
      qualityNotes: step.qualityNotes || ''
    });
    
    if (step.stepType === 'material_selection') {
      // Material selection is already completed, show message
      console.log('Material selection is already completed. Redirecting to production details page.');
      navigate(`/production/${productionProduct.id}`);
    } else if (step.stepType === 'machine_operation') {
      // For machine operations, show the machine selection popup
      setShowMachineSelectionPopup(true);
    } else if (step.stepType === 'wastage_tracking') {
      // Navigate to separate waste generation page
      navigate(`/production/${productId}/waste-generation`);
    } else if (step.stepType === 'testing_individual') {
      // Navigate to individual product details page
      navigate(`/production/complete/${productId}`);
    }
  };
  
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [showMachineSelectionPopup, setShowMachineSelectionPopup] = useState(false);
  const [showAddMachinePopup, setShowAddMachinePopup] = useState(false);
  const [inspectorName, setInspectorName] = useState('');

  const selectMachine = (machineId: string, inspector: string) => {
    if (!productionFlow || !machineId || !inspector) return;
    
    const selectedMachine = machines.find(m => m.id === machineId);
    if (!selectedMachine) return;
    
    
    // Create a new machine step
    const newMachineStep: ProductionStep = {
      id: generateUniqueId('STEP'),
      stepNumber: productionFlow.steps.length + 1,
      name: selectedMachine.name,
      description: getMachineDescription(selectedMachine.name),
      machineId: machineId,
      machineName: selectedMachine.name,
      status: 'pending' as const,
      inspector: inspector,
      stepType: 'machine_operation' as const
    };
    
    // Insert before waste tracking step
    const wasteStepIndex = productionFlow.steps.findIndex(s => s.stepType === 'wastage_tracking');
    const insertIndex = wasteStepIndex > -1 ? wasteStepIndex : productionFlow.steps.length;
    
    const updatedSteps = [...productionFlow.steps];
    updatedSteps.splice(insertIndex, 0, newMachineStep);
    
    // Update step numbers
    updatedSteps.forEach((step, index) => {
      step.stepNumber = index + 1;
    });
    
    const updatedFlow = {
      ...productionFlow,
      steps: updatedSteps,
      currentStepIndex: insertIndex,
      updatedAt: new Date().toISOString()
    };
    
    
    // Save to storage
    const flows = getFromStorage('rajdhani_production_flows') || [];
    const updatedFlows = flows.map(f => f.id === productionFlow.id ? updatedFlow : f);
    replaceStorage('rajdhani_production_flows', updatedFlows);
    
    setProductionFlow(updatedFlow);
    setSelectedMachineId('');
    setInspectorName('');
    setShowMachineSelectionPopup(false);
  };

  const updateMachineStepStatus = (newStatus: 'pending' | 'in_progress' | 'completed') => {
    if (!productionFlow) return;
    
    const currentStep = getCurrentStep();
    if (!currentStep || currentStep.stepType !== 'machine_operation') return;
    
    const updatedSteps = productionFlow.steps.map(s => 
      s.id === currentStep.id 
        ? {
            ...s,
            status: newStatus,
            startTime: newStatus === 'in_progress' ? new Date().toISOString() : s.startTime,
            endTime: newStatus === 'completed' ? new Date().toISOString() : undefined,
            inspector: newStatus === 'completed' ? 'Machine Operator' : s.inspector,
            qualityNotes: newStatus === 'completed' ? `${s.machineName} work completed` : s.qualityNotes
          }
        : s
    );
    
    let updatedFlow = {
      ...productionFlow,
      steps: updatedSteps,
      updatedAt: new Date().toISOString()
    };
    
    // If completed, show machine selection popup for next step
    if (newStatus === 'completed') {
      // Show machine selection popup
      setShowMachineSelectionPopup(true);
    }
    
    // Save to storage
    const flows = getFromStorage('rajdhani_production_flows') || [];
    const updatedFlows = flows.map(f => f.id === productionFlow.id ? updatedFlow : f);
    replaceStorage('rajdhani_production_flows', updatedFlows);
    
    setProductionFlow(updatedFlow);
  };

  const skipToWasteGeneration = () => {
    if (!productionFlow) return;
    
    // Check if waste tracking step already exists
    const wasteStepIndex = productionFlow.steps.findIndex(s => s.stepType === 'wastage_tracking');
    
    if (wasteStepIndex === -1) {
      // Create waste tracking step
      const wasteStep: ProductionStep = {
        id: generateUniqueId('STEP'),
        stepNumber: productionFlow.steps.length + 1,
        name: 'Waste Generation Tracking',
        description: 'Track and record production wastage',
        machineId: null,
        machineName: 'Manual Process',
        status: 'pending' as const,
        inspector: '',
        stepType: 'wastage_tracking' as const
      };
      
      const updatedSteps = [...productionFlow.steps, wasteStep];
      const updatedFlow = {
        ...productionFlow,
        steps: updatedSteps,
        currentStepIndex: updatedSteps.length - 1,
        updatedAt: new Date().toISOString()
      };
      
      const flows = getFromStorage('rajdhani_production_flows') || [];
      const updatedFlows = flows.map(f => f.id === productionFlow.id ? updatedFlow : f);
      replaceStorage('rajdhani_production_flows', updatedFlows);
      setProductionFlow(updatedFlow);
    } else {
      // Move to existing waste step
      const updatedFlow = {
        ...productionFlow,
        currentStepIndex: wasteStepIndex,
        updatedAt: new Date().toISOString()
      };
      
      const flows = getFromStorage('rajdhani_production_flows') || [];
      const updatedFlows = flows.map(f => f.id === productionFlow.id ? updatedFlow : f);
      replaceStorage('rajdhani_production_flows', updatedFlows);
      setProductionFlow(updatedFlow);
    }
    
    setShowMachineSelectionPopup(false);
    
    // Navigate directly to waste generation page
    navigate(`/production/${productId}/waste-generation`);
  };

  const getMachineDescription = (machineName: string): string => {
    switch (machineName) {
      case 'BR3C-Cutter':
        return 'High precision cutting machine for carpet trimming and shaping';
      case 'CUTTING MACHINE':
        return 'Multi-purpose cutting machine for various carpet operations';
      case 'NEEDLE PUNCHING':
        return 'Needle punching machine for carpet finishing and texture work';
      default:
        return 'Machine operation for production process';
    }
  };

  // Machine management functions
  const addNewMachine = () => {
    if (!newMachineForm.name.trim()) {
      console.error('Machine name is required');
      return;
    }

    const newMachine = {
      id: generateUniqueId('MACHINE'),
      name: newMachineForm.name.trim(),
      location: newMachineForm.location.trim() || "Factory Floor",
      description: newMachineForm.description.trim() || ""
    };

    
    // Get fresh cleaned machines from storage to prevent nesting
    const currentStoredMachines = cleanupMachinesData() || [];
    const validCurrentMachines = Array.isArray(currentStoredMachines) ? currentStoredMachines : [];
    
    // Check for duplicates
    const isDuplicate = validCurrentMachines.some(m => m.name === newMachine.name);
    if (isDuplicate) {
      console.error(`Machine "${newMachine.name}" already exists!`);
      return;
    }
    
    const updatedMachines = [...validCurrentMachines, newMachine];
    
    
    // Update both state and storage
    setMachines(updatedMachines);
    replaceStorage('rajdhani_machines', updatedMachines);

    // Reset form
    setNewMachineForm({ name: "", location: "", description: "" });
    setShowAddMachinePopup(false);
    
    console.log(`Machine "${newMachine.name}" added successfully!`);
  };

  const handleMachineSelection = () => {
    if (!selectedMachineId || !inspectorName.trim()) {
      console.error('Please select a machine and enter inspector name');
      return;
    }

    selectMachine(selectedMachineId, inspectorName);
  };


  const handleCompleteStep = () => {
    if (!productionFlow) return;
    
    const currentStep = getCurrentStep();
    if (!currentStep) return;
    
    // Update the current step
    let updatedSteps = productionFlow.steps.map(s => 
      s.id === currentStep.id 
        ? {
            ...s,
            status: 'completed' as const,
            endTime: new Date().toISOString(),
            inspector: stepForm.inspector,
            qualityNotes: stepForm.qualityNotes
          }
        : s
    );
    
    // If this was a machine operation step, create a new machine operations step
    if (currentStep.stepType === 'machine_operation') {
      const newMachineStep: ProductionStep = {
        id: generateUniqueId('STEP'),
        stepNumber: updatedSteps.length + 1,
        name: 'Machine Operations',
        description: 'Add and complete machine operations for production',
        machineId: null,
        machineName: 'Add Machine Step',
        status: 'pending' as const,
        inspector: '',
        stepType: 'machine_operation' as const
      };
      
      // Insert new machine step before waste tracking
      const wasteStepIndex = updatedSteps.findIndex(s => s.stepType === 'wastage_tracking');
      const insertIndex = wasteStepIndex > -1 ? wasteStepIndex : updatedSteps.length;
      updatedSteps.splice(insertIndex, 0, newMachineStep);
      
      // Update step numbers
      updatedSteps.forEach((step, index) => {
        step.stepNumber = index + 1;
      });
    }
    
    // Move to next step if not the last
    let newCurrentStepIndex = productionFlow.currentStepIndex;
    if (productionFlow.currentStepIndex < updatedSteps.length - 1) {
      newCurrentStepIndex = productionFlow.currentStepIndex + 1;
    }
    
    const updatedFlow = {
      ...productionFlow,
      steps: updatedSteps,
      currentStepIndex: newCurrentStepIndex,
      status: (newCurrentStepIndex === productionFlow.steps.length - 1 && updatedSteps[newCurrentStepIndex].status === 'completed') 
        ? 'completed' as const 
        : 'in_progress' as const,
      updatedAt: new Date().toISOString()
    };
    
    // Save to storage
    const flows = getFromStorage('rajdhani_production_flows') || [];
    const updatedFlows = flows.map((f: ProductionFlow) => 
      f.id === productionFlow.id ? updatedFlow : f
    );
    replaceStorage('rajdhani_production_flows', updatedFlows);
    
    setProductionFlow(updatedFlow);
    setShowStepDialog(false);
    setCurrentStepData(null);
  };
  
  const handleAddProductionStep = () => {
    if (!productionFlow) return;
    
    // Find the position to insert machine step (before the first final step - either waste tracking or testing)
    const finalStepTypes = ['wastage_tracking', 'testing_individual'];
    let insertIndex = productionFlow.steps.length;
    
    // Find the first occurrence of any final step
    for (let i = 0; i < productionFlow.steps.length; i++) {
      if (finalStepTypes.includes(productionFlow.steps[i].stepType)) {
        insertIndex = i;
        break;
      }
    }
    
    const newStep: ProductionStep = {
      id: generateUniqueId('STEP'),
      stepNumber: insertIndex + 1,
      name: stepForm.name,
      description: stepForm.description,
      machineId: null,
      machineName: 'Manual Process',
      status: 'pending',
      inspector: '',
      stepType: 'machine_operation'
    };
    
    // Insert the new step at the correct position
    const steps = [...productionFlow.steps];
    steps.splice(insertIndex, 0, newStep);
    
    // Update step numbers for all steps
    steps.forEach((step, index) => {
      step.stepNumber = index + 1;
    });
    
    const updatedFlow = {
      ...productionFlow,
      steps,
      updatedAt: new Date().toISOString()
    };
    
    const flows = getFromStorage('rajdhani_production_flows') || [];
    const updatedFlows = flows.map((f: ProductionFlow) => 
      f.id === productionFlow.id ? updatedFlow : f
    );
    replaceStorage('rajdhani_production_flows', updatedFlows);
    
    setProductionFlow(updatedFlow);
    setStepForm({ name: '', description: '', machineId: '', inspector: '', qualityNotes: '' });
  };
  
  
  const handleAddMachine = () => {
    const newMachine: Machine = {
      id: generateUniqueId('MACHINE'),
      name: newMachineForm.name,
      location: newMachineForm.location,
      description: newMachineForm.description
    };
    
    const updatedMachines = [...machines, newMachine];
    setMachines(updatedMachines);
    saveToStorage('rajdhani_machines', updatedMachines);
    
    setNewMachineForm({ name: '', location: '', description: '' });
    setShowAddMachineDialog(false);
  };
  
  const initializeIndividualProducts = () => {
    if (!productionProduct) return;
    
    // Generate globally unique custom IDs for all products in this batch
    const customIds = [];
    for (let i = 0; i < productionProduct.targetQuantity; i++) {
      customIds.push(generateGloballyUniqueCustomId(productionProduct.productName));
    }
    
    const products: IndividualProductData[] = Array.from(
      { length: productionProduct.targetQuantity },
      (_, index) => ({
        id: generateUniqueId('IND'),
        qrCode: generateUniqueId('QR'),
        customId: customIds[index],
        finalDimensions: productionProduct.size || '',
        finalWeight: '',
        finalThickness: '',
        qualityGrade: 'A' as const,
        status: 'available' as const,
        notes: ''
      })
    );
    
    setIndividualProducts(products);
  };
  
  const handleCompleteProduction = () => {
    // Validate individual products (excluding optional fields like pile height and notes)
    const requiredFields = ['finalWeight', 'finalThickness', 'finalWidth', 'finalHeight'];
    const fieldLabels = {
      'finalWeight': 'Final Weight',
      'finalThickness': 'Final Thickness', 
      'finalWidth': 'Final Width',
      'finalHeight': 'Final Height'
    };
    
    const errors: Array<{index: number, productId: string, missingFields: string[]}> = [];
    
    individualProducts.forEach((product, index) => {
      const missingFields = requiredFields.filter(field => 
        !product[field as keyof IndividualProductData]
      );
      
      if (missingFields.length > 0) {
        errors.push({
          index: index + 1,
          productId: product.id,
          missingFields: missingFields.map(field => fieldLabels[field as keyof typeof fieldLabels])
        });
      }
    });
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationPopup(true);
      return;
    }
    
    // Save individual products
    const existingIndividualProducts = getFromStorage('rajdhani_individual_products') || [];
    
    // Add production steps to each individual product
    const productsWithSteps = individualProducts.map(product => ({
      ...product,
      productId: productionProduct.productId,
      manufacturingDate: new Date().toISOString().split('T')[0],
      materialsUsed: productionProduct.materialsConsumed || [],
      productionSteps: productionFlow?.steps.filter(s => s.status === 'completed').map(step => ({
        stepName: step.name,
        machineUsed: step.machineName,
        completedAt: step.endTime || '',
        inspector: step.inspector,
        qualityNotes: step.qualityNotes
      })) || []
    }));
    
    existingIndividualProducts.push(...productsWithSteps);
    saveToStorage('rajdhani_individual_products', existingIndividualProducts);
    
    // Update main product inventory
    const availableProducts = getFromStorage('rajdhani_products') || [];
    const productIndex = availableProducts.findIndex((p: any) => p.id === productionProduct.productId);
    
    if (productIndex !== -1) {
      const availableCount = individualProducts.filter(p => p.status === "available").length;
      availableProducts[productIndex].quantity += availableCount;
      saveToStorage('rajdhani_products', availableProducts);
    }
    
    // Mark production as completed
    const productionProducts = getFromStorage('rajdhani_production_products') || [];
    const updatedProduction = productionProducts.map((p: any) => 
      p.id === productionProduct.id ? { 
        ...p, 
        status: "completed",
        completedAt: new Date().toISOString()
      } : p
    );
    saveToStorage('rajdhani_production_products', updatedProduction);
    
    // Complete the production flow
    if (productionFlow) {
      const updatedFlow = {
        ...productionFlow,
        status: 'completed' as const,
        updatedAt: new Date().toISOString()
      };
      
      const flows = getFromStorage('rajdhani_production_flows') || [];
      const updatedFlows = flows.map((f: ProductionFlow) => 
        f.id === productionFlow.id ? updatedFlow : f
      );
      replaceStorage('rajdhani_production_flows', updatedFlows);
    }
    
    // Show completion success message (no alert needed - already handled in Complete.tsx)
    navigate('/production');
  };
  
  if (!productionProduct || !productionFlow) {
    return <div className="p-6">Loading...</div>;
  }
  
  const currentStep = getCurrentStep();
  const progressPercentage = getProgressPercentage();
  
  const goToPreviousStep = () => {
    if (productionFlow && productionFlow.currentStepIndex > 0) {
      const updatedFlow = {
        ...productionFlow,
        currentStepIndex: productionFlow.currentStepIndex - 1,
        updatedAt: new Date().toISOString()
      };
      
      const flows = getFromStorage('rajdhani_production_flows') || [];
      const updatedFlows = flows.map((f: ProductionFlow) => 
        f.id === productionFlow.id ? updatedFlow : f
      );
      replaceStorage('rajdhani_production_flows', updatedFlows);
      setProductionFlow(updatedFlow);
    }
  };
  
  const goToNextStep = () => {
    if (productionFlow && productionFlow.currentStepIndex < productionFlow.steps.length - 1) {
      const updatedFlow = {
        ...productionFlow,
        currentStepIndex: productionFlow.currentStepIndex + 1,
        updatedAt: new Date().toISOString()
      };
      
      const flows = getFromStorage('rajdhani_production_flows') || [];
      const updatedFlows = flows.map((f: ProductionFlow) => 
        f.id === productionFlow.id ? updatedFlow : f
      );
      replaceStorage('rajdhani_production_flows', updatedFlows);
      setProductionFlow(updatedFlow);
    }
  };
  
  return (
    <div className="flex-1 space-y-6 p-6">
      <Header 
        title="Production Flow"
        subtitle={`${productionProduct.productName} - Target: ${productionProduct.targetQuantity} pieces`}
      />
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/production')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Production
        </Button>
      </div>

      {/* Unified Production Progress Bar */}
      <ProductionProgressBar
        currentStep="machine_operation"
        steps={[
          {
            id: "material_selection",
            name: "Material Selection",
            status: "completed",
            stepType: "material_selection"
          },
          {
            id: "machine_operation",
            name: "Machine Operations",
            status: "in_progress",
            stepType: "machine_operation"
          },
          {
            id: "wastage_tracking",
            name: "Waste Generation",
            status: productionFlow.steps.some(s => s.stepType === 'wastage_tracking' && s.status === 'completed') ? "completed" : 
                   productionFlow.steps.some(s => s.stepType === 'wastage_tracking' && s.status === 'in_progress') ? "in_progress" : "pending",
            stepType: "wastage_tracking"
          },
          {
            id: "testing_individual",
            name: "Individual Details",
            status: productionFlow.steps.some(s => s.stepType === 'testing_individual' && s.status === 'completed') ? "completed" : 
                   productionFlow.steps.some(s => s.stepType === 'testing_individual' && s.status === 'in_progress') ? "in_progress" : "pending",
            stepType: "testing_individual"
          }
        ]}
        machineSteps={productionFlow.steps.filter(s => s.stepType === 'machine_operation')}
        className="mb-6"
      />
      
      {/* Current Step Card - Simplified for Machine Operations */}
      {currentStep && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    currentStep.status === 'completed' ? 'bg-green-600' :
                    currentStep.status === 'in_progress' ? 'bg-blue-600' :
                    'bg-gray-400'
                  }`}>
                    {currentStep.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : currentStep.status === 'in_progress' ? (
                      <Play className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6" />
                    )}
                  </div>
                  {currentStep.machineName}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{currentStep.description}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {currentStep.stepType === 'machine_operation' ? (
                // Machine Operation - Clean Status Flow
                <div className="space-y-6">
                  {/* Machine Info Card - Enhanced */}
                  <div className={`rounded-xl p-5 border-2 ${
                    currentStep.status === 'completed' ? 'bg-green-50 border-green-200' :
                    currentStep.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Factory className={`w-5 h-5 ${
                            currentStep.status === 'completed' ? 'text-green-600' :
                            currentStep.status === 'in_progress' ? 'text-blue-600' :
                            'text-gray-600'
                          }`} />
                          <span className="font-semibold text-gray-900">Machine Information</span>
                        </div>
                        <div className="pl-7 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">Name:</span> {currentStep.machineName}
                            </p>
                            <Badge className={`px-2 py-1 text-xs ${
                              currentStep.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                              currentStep.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {currentStep.status === 'pending' ? '⏳ PENDING' :
                               currentStep.status === 'in_progress' ? '⚡ PROCESSING' :
                               '✅ COMPLETED'}
                            </Badge>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Inspector:</span> {currentStep.inspector || 'Not assigned'}
                          </p>
                          <p className="text-sm text-gray-600">{currentStep.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className={`w-5 h-5 ${
                            currentStep.status === 'completed' ? 'text-green-600' :
                            currentStep.status === 'in_progress' ? 'text-blue-600' :
                            'text-gray-600'
                          }`} />
                          <span className="font-semibold text-gray-900">Timeline</span>
                        </div>
                        <div className="pl-7 space-y-2">
                          {currentStep.startTime && (
                            <p className="text-sm">
                              <span className="font-medium text-gray-700">
                                {currentStep.status === 'completed' ? 'Completed:' : 'Started:'}
                              </span>{' '}
                              {new Date(currentStep.endTime || currentStep.startTime).toLocaleString()}
                            </p>
                          )}
                          {currentStep.status === 'pending' && (
                            <p className="text-sm text-gray-500">⏳ Waiting to start...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Action Buttons */}
                  <div className="flex justify-center">
                    {currentStep.status === 'pending' && (
                      <div className="text-center space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                          <h4 className="font-medium text-blue-900 mb-2">⏳ Ready to Start</h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Click below to begin the machine operation process.
                          </p>
                        </div>
                        <Button 
                          size="lg"
                          onClick={() => updateMachineStepStatus('in_progress')}
                          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <Play className="w-6 h-6 mr-3" />
                          Start Processing
                        </Button>
                      </div>
                    )}
                    {currentStep.status === 'in_progress' && (
                      <div className="text-center space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                          <h4 className="font-medium text-blue-900 mb-2">⚡ In Progress</h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Machine operation is currently running. Mark as complete when finished.
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                          </div>
                        </div>
                        <Button 
                          size="lg"
                          onClick={() => updateMachineStepStatus('completed')}
                          className="bg-green-600 hover:bg-green-700 px-8 py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <CheckCircle className="w-6 h-6 mr-3" />
                          Mark as Complete
                        </Button>
                      </div>
                    )}
                    {currentStep.status === 'completed' && (
                      <div className="text-center space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                          <h4 className="font-semibold text-green-900 text-lg mb-2">✅ Operation Complete!</h4>
                          <p className="text-sm text-green-700 mb-4">
                            Machine operation has been successfully completed.
                          </p>
                          <div className="flex gap-3">
                            <Button 
                              onClick={() => setShowMachineSelectionPopup(true)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Another Machine
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={skipToWasteGeneration}
                              className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                              size="sm"
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Go to Waste Generation
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Non-machine steps
                <div className="text-center py-8">
                  <div className="text-center">
                    {currentStep.stepType === 'wastage_tracking' ? (
                      <>
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Waste Generation Tracking</h3>
                        <p className="text-gray-600 mb-4">Track and record production wastage</p>
                        <Button 
                          size="lg"
                          onClick={() => handleStartStep(currentStep)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Open Waste Tracking
                        </Button>
                      </>
                    ) : currentStep.stepType === 'testing_individual' ? (
                      <>
                        <Package className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Individual Product Details</h3>
                        <p className="text-gray-600 mb-4">Fill individual product details and complete production</p>
                        <Button 
                          size="lg"
                          onClick={() => handleStartStep(currentStep)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Package className="w-5 h-5 mr-2" />
                          Fill Product Details
                        </Button>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{currentStep.name}</h3>
                        <p className="text-gray-600 mb-4">{currentStep.description}</p>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      
      {/* Step Execution Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Machine Work</DialogTitle>
            <DialogDescription>
              Add inspector details and notes to complete the machine operation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Inspector Name *</Label>
              <Input
                value={stepForm.inspector}
                onChange={(e) => setStepForm({...stepForm, inspector: e.target.value})}
                placeholder="Enter inspector name"
              />
            </div>
            
            <div>
              <Label>Quality Notes (Optional)</Label>
              <Textarea
                value={stepForm.qualityNotes}
                onChange={(e) => setStepForm({...stepForm, qualityNotes: e.target.value})}
                placeholder="Enter quality notes or observations..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStepDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteStep}
              disabled={!stepForm.inspector}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Machine Work
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Machine Dialog */}
      <Dialog open={showAddMachineDialog} onOpenChange={setShowAddMachineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Machine</DialogTitle>
            <DialogDescription>
              Add a new machine to the production system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Machine Name *</Label>
              <Input
                value={newMachineForm.name}
                onChange={(e) => setNewMachineForm({...newMachineForm, name: e.target.value})}
                placeholder="Enter machine name"
              />
            </div>
            
            <div>
              <Label>Location *</Label>
              <Input
                value={newMachineForm.location}
                onChange={(e) => setNewMachineForm({...newMachineForm, location: e.target.value})}
                placeholder="e.g., Factory Floor A"
              />
            </div>
            
            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={newMachineForm.description}
                onChange={(e) => setNewMachineForm({...newMachineForm, description: e.target.value})}
                placeholder="Additional details about the machine"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMachineDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMachine} 
              disabled={!newMachineForm.name || !newMachineForm.location}
            >
              Add Machine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Wastage Tracking Dialog */}
      <Dialog open={showWastageDialog} onOpenChange={setShowWastageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Track Production Wastage</DialogTitle>
            <DialogDescription>
              Record any materials wasted during production
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Waste Items List */}
            {wasteItems.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recorded Waste</h4>
                {wasteItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{item.materialName}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {item.quantity} {item.unit} ({item.wasteType})
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWasteItems(wasteItems.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Waste Item Form */}
            <div>
              <Label>Add Waste Item</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input placeholder="Material name" />
                <Input placeholder="Quantity" type="number" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Waste type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scrap">Scrap</SelectItem>
                    <SelectItem value="defective">Defective</SelectItem>
                    <SelectItem value="excess">Excess</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWastageDialog(false)}>
              Skip Wastage
            </Button>
            <Button 
              onClick={() => {
                setShowWastageDialog(false);
                handleCompleteStep();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Wastage Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Individual Products Dialog */}
      <Dialog open={showIndividualProductsDialog} onOpenChange={setShowIndividualProductsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Individual Product Details</DialogTitle>
            <DialogDescription>
              Fill details for each individual product piece
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-2 text-left text-sm font-medium">Custom ID</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-medium">QR Code</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-medium">Dimensions</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-medium">Weight</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-medium">Thickness</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-medium">Quality</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {individualProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-2 text-sm">{product.customId}</td>
                      <td className="border border-gray-200 p-2 text-xs text-gray-600">{product.qrCode}</td>
                      <td className="border border-gray-200 p-2">
                        <Input
                          value={product.finalDimensions}
                          onChange={(e) => {
                            const updated = [...individualProducts];
                            updated[index].finalDimensions = e.target.value;
                            setIndividualProducts(updated);
                          }}
                        />
                      </td>
                      <td className="border border-gray-200 p-2">
                        <Input
                          value={product.finalWeight}
                          onChange={(e) => {
                            const updated = [...individualProducts];
                            updated[index].finalWeight = e.target.value;
                            setIndividualProducts(updated);
                          }}
                          placeholder="kg"
                        />
                      </td>
                      <td className="border border-gray-200 p-2">
                        <Input
                          value={product.finalThickness}
                          onChange={(e) => {
                            const updated = [...individualProducts];
                            updated[index].finalThickness = e.target.value;
                            setIndividualProducts(updated);
                          }}
                          placeholder="mm"
                        />
                      </td>
                      <td className="border border-gray-200 p-2">
                        <Select
                          value={product.qualityGrade}
                          onValueChange={(value: any) => {
                            const updated = [...individualProducts];
                            updated[index].qualityGrade = value;
                            setIndividualProducts(updated);
                          }}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-200 p-2">
                        <Select
                          value={product.status}
                          onValueChange={(value: any) => {
                            const updated = [...individualProducts];
                            updated[index].status = value;
                            setIndividualProducts(updated);
                          }}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="damaged">Damaged</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIndividualProductsDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteProduction}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Production
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Machine Selection Popup - Improved UI */}
      <Dialog open={showMachineSelectionPopup} onOpenChange={setShowMachineSelectionPopup}>
        <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-600" />
              Add Machine
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Select machine and inspector or skip to waste generation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Inspector Name Input */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Inspector Name *
              </Label>
              <Input
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Enter inspector name"
                className="w-full"
              />
            </div>
            
            {/* Machine Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Cog className="w-4 h-4" />
                Select Machine *
              </Label>
              <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a machine..." />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name} - {machine.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {machines.length === 0 ? (
                <p className="text-sm text-gray-500">No machines available. Add a machine first.</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">{machines.length} machines available</p>
              )}
            </div>
            
            {/* Add New Machine Option */}
            <div className="pt-2 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddMachinePopup(true)}
                className="w-full border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Machine
              </Button>
            </div>
          </div>
          
          <DialogFooter className="space-y-2 pt-4 border-t border-gray-100">
            <Button 
              onClick={handleMachineSelection}
              disabled={!selectedMachineId || !inspectorName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Factory className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={skipToWasteGeneration}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                size="sm"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Skip
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowMachineSelectionPopup(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Machine Popup - Improved UI */}
      <Dialog open={showAddMachinePopup} onOpenChange={setShowAddMachinePopup}>
        <DialogContent className="max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-green-600" />
              Add New Machine
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Add a new machine to your production system for future operations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Machine Name *
              </Label>
              <Input 
                value={newMachineForm.name}
                onChange={(e) => setNewMachineForm({...newMachineForm, name: e.target.value})}
                placeholder="e.g., BR3C-Cutter, NEEDLE PUNCHING"
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Location *
              </Label>
              <Input 
                value={newMachineForm.location}
                onChange={(e) => setNewMachineForm({...newMachineForm, location: e.target.value})}
                placeholder="e.g., Production Floor A, Factory Section B"
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Description (Optional)
              </Label>
              <Textarea 
                value={newMachineForm.description}
                onChange={(e) => setNewMachineForm({...newMachineForm, description: e.target.value})}
                placeholder="Brief description of machine capabilities and usage..."
                rows={3}
                className="w-full resize-none"
              />
            </div>
          </div>
          
          <DialogFooter className="space-y-2 pt-6 border-t border-gray-100">
            <Button 
              onClick={addNewMachine}
              disabled={!newMachineForm.name.trim() || !newMachineForm.location.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              size="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAddMachinePopup(false)}
              className="w-full"
              size="sm"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Error Popup */}
      <Dialog open={showValidationPopup} onOpenChange={setShowValidationPopup}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Incomplete Product Data
            </DialogTitle>
            <DialogDescription>
              Please fill all required fields for the following products before completing production.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {validationErrors.map((error, index) => (
              <div key={error.productId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="text-xs">
                    Product #{error.index}
                  </Badge>
                  <span className="font-mono text-sm text-gray-600">{error.productId}</span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Missing fields:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {error.missingFields.map((field, fieldIndex) => (
                      <li key={fieldIndex} className="text-red-700">{field}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowValidationPopup(false)}
              className="w-full"
            >
              Close and Fix Issues
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}