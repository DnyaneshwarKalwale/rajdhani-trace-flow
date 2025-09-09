import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Play, Pause, CheckCircle, Clock, Factory, User, Plus,
  Settings, AlertCircle, ArrowRight, Cog
} from 'lucide-react';
import {
  Machine,
  ProductionFlow,
  ProductionStep,
  getMachines,
  getProductionFlow,
  saveProductionFlow,
  createDefaultProductionFlow,
  updateProductionStep,
  addProductionStep,
  moveToNextStep,
  getProgressPercentage,
  saveMachine,
  getAvailableMachines
} from '@/lib/machines';

interface ProductionFlowProps {
  productionProductId: string;
  onStepComplete?: (step: ProductionStep) => void;
  onFlowComplete?: (flow: ProductionFlow) => void;
}

export const ProductionFlowComponent: React.FC<ProductionFlowProps> = ({
  productionProductId,
  onStepComplete,
  onFlowComplete
}) => {
  const [flow, setFlow] = useState<ProductionFlow | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [currentStepDialog, setCurrentStepDialog] = useState<ProductionStep | null>(null);
  const [inspector, setInspector] = useState('Admin');

  // New step form
  const [newStep, setNewStep] = useState({
    name: '',
    description: '',
    machineId: '',
  });

  // New machine form
  const [newMachine, setNewMachine] = useState({
    name: '',
    type: 'other' as Machine['type'],
    capacity: '',
    description: '',
  });

  // Step execution form
  const [stepExecution, setStepExecution] = useState({
    inspectorName: '',
    qualityNotes: '',
    machineId: '',
  });

  useEffect(() => {
    setMachines(getMachines());
    
    // Load or create production flow
    let existingFlow = getProductionFlow(productionProductId);
    if (!existingFlow) {
      existingFlow = createDefaultProductionFlow(productionProductId);
      saveProductionFlow(existingFlow);
    }
    setFlow(existingFlow);
    setStepExecution({ ...stepExecution, inspectorName: inspector });
  }, [productionProductId, inspector]);

  const handleStartStep = (step: ProductionStep) => {
    if (!flow) return;

    // Handle different step types
    if (step.stepType === 'material_selection') {
      // Material selection should be handled in the production detail page
      onStepComplete?.(step);
      return;
    }
    
    if (step.stepType === 'wastage_tracking') {
      // Wastage tracking should be handled in the production detail page
      onStepComplete?.(step);
      return;
    }
    
    if (step.stepType === 'testing_individual') {
      // Individual product details - navigate to completion page
      if (onFlowComplete) {
        onFlowComplete(flow);
      }
      return;
    }

    // For machine operations, show the dialog
    setCurrentStepDialog(step);
    setStepExecution({
      inspectorName: inspector,
      qualityNotes: '',
      machineId: step.machineId || '',
    });
  };

  const handleCompleteStep = () => {
    if (!flow || !currentStepDialog) return;

    const updates: Partial<ProductionStep> = {
      status: 'completed',
      endTime: new Date().toISOString(),
      inspectorName: stepExecution.inspectorName,
      qualityNotes: stepExecution.qualityNotes,
    };

    if (stepExecution.machineId) {
      const selectedMachine = machines.find(m => m.id === stepExecution.machineId);
      updates.machineId = stepExecution.machineId;
      updates.machineName = selectedMachine?.name || 'Unknown Machine';
    }

    const updatedFlow = updateProductionStep(flow.id, currentStepDialog.id, updates);
    if (updatedFlow) {
      setFlow(updatedFlow);
      onStepComplete?.(currentStepDialog);
      
      // Auto-move to next step if not the last step
      if (flow.currentStepIndex < flow.steps.length - 1) {
        const nextFlow = moveToNextStep(flow.id);
        if (nextFlow) {
          setFlow(nextFlow);
        }
      } else {
        // Flow completed
        onFlowComplete?.(updatedFlow);
      }
    }

    setCurrentStepDialog(null);
  };

  const handleAddStep = () => {
    if (!flow || !newStep.name) return;

    const stepData: Omit<ProductionStep, 'id' | 'stepNumber' | 'createdAt'> = {
      name: newStep.name,
      description: newStep.description,
      machineId: newStep.machineId || null,
      machineName: newStep.machineId 
        ? machines.find(m => m.id === newStep.machineId)?.name || 'Unknown Machine'
        : 'Manual Process',
      status: 'pending',
      isQualityStep: false,
    };

    const updatedFlow = addProductionStep(flow.id, stepData);
    if (updatedFlow) {
      setFlow(updatedFlow);
    }

    setNewStep({ name: '', description: '', machineId: '' });
    setIsAddingStep(false);
  };

  const handleAddMachine = () => {
    if (!newMachine.name) return;

    const machine = saveMachine({
      name: newMachine.name,
      type: newMachine.type,
      status: 'available',
      capacity: newMachine.capacity,
      description: newMachine.description,
    });

    setMachines([...machines, machine]);
    setNewMachine({ name: '', type: 'other', capacity: '', description: '' });
    setIsAddingMachine(false);
  };

  const getStepStatusColor = (status: ProductionStep['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'quality_check': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!flow) {
    return <div>Loading production flow...</div>;
  }

  const progressPercentage = getProgressPercentage(flow);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Production Flow Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-500">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Flow Status */}
            <div className="flex items-center gap-4">
              <Badge className={
                flow.status === 'not_started' ? 'bg-gray-100 text-gray-800' :
                flow.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }>
                {flow.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">
                Step {flow.currentStepIndex + 1} of {flow.steps.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cog className="w-5 h-5" />
              Production Steps
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingMachine(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Machine
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingStep(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Machine Step
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flow.steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < flow.steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200" />
                )}
                
                <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                  index === flow.currentStepIndex 
                    ? 'border-blue-300 bg-blue-50' 
                    : index < flow.currentStepIndex 
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white'
                }`}>
                  {/* Step Number/Status Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    step.status === 'completed' ? 'bg-green-600' :
                    step.status === 'in_progress' ? 'bg-blue-600' :
                    'bg-gray-400'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : step.status === 'in_progress' ? (
                      <Play className="w-6 h-6" />
                    ) : (
                      step.stepNumber
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{step.name}</h3>
                      <Badge className={getStepStatusColor(step.status)}>
                        {step.status.replace('_', ' ')}
                      </Badge>
                      {step.isQualityStep && (
                        <Badge variant="outline" className="text-purple-700 border-purple-200">
                          Quality Check
                        </Badge>
                      )}
                      {step.isFixedStep && (
                        <Badge variant="outline" className="text-blue-700 border-blue-200">
                          Fixed Step
                        </Badge>
                      )}
                      {step.stepType === 'material_selection' && (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          Materials
                        </Badge>
                      )}
                      {step.stepType === 'wastage_tracking' && (
                        <Badge variant="outline" className="text-orange-700 border-orange-200">
                          Wastage
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Factory className="w-4 h-4" />
                        <span>{step.machineName}</span>
                      </div>
                      {step.inspectorName && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{step.inspectorName}</span>
                        </div>
                      )}
                      {step.endTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Completed: {new Date(step.endTime).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {step.qualityNotes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Quality Notes:</strong> {step.qualityNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {step.status === 'pending' && index === flow.currentStepIndex && (
                      <Button 
                        size="sm"
                        onClick={() => handleStartStep(step)}
                        className={`${
                          step.stepType === 'material_selection' ? 'bg-green-600 hover:bg-green-700' :
                          step.stepType === 'wastage_tracking' ? 'bg-orange-600 hover:bg-orange-700' :
                          step.stepType === 'testing_individual' ? 'bg-purple-600 hover:bg-purple-700' :
                          'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {
                          step.stepType === 'material_selection' ? 'Select Materials' :
                          step.stepType === 'wastage_tracking' ? 'Track Wastage' :
                          step.stepType === 'testing_individual' ? 'Individual Products' :
                          'Start Step'
                        }
                      </Button>
                    )}
                    
                    {step.status === 'in_progress' && (
                      <Button 
                        size="sm"
                        onClick={() => handleStartStep(step)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Execution Dialog */}
      <Dialog open={!!currentStepDialog} onOpenChange={() => setCurrentStepDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentStepDialog?.status === 'pending' ? 'Start' : 'Complete'} Step: {currentStepDialog?.name}
            </DialogTitle>
            <DialogDescription>
              {currentStepDialog?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Machine Selection */}
            <div>
              <Label>Select Machine</Label>
              <Select value={stepExecution.machineId} onValueChange={(value) => 
                setStepExecution({...stepExecution, machineId: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Choose machine..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Manual Process</SelectItem>
                  {getAvailableMachines().map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name} - {machine.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Inspector */}
            <div>
              <Label>Inspector Name</Label>
              <Input
                value={stepExecution.inspectorName}
                onChange={(e) => setStepExecution({...stepExecution, inspectorName: e.target.value})}
                placeholder="Enter inspector name"
              />
            </div>

            {/* Quality Notes */}
            <div>
              <Label>Quality Notes (Optional)</Label>
              <Textarea
                value={stepExecution.qualityNotes}
                onChange={(e) => setStepExecution({...stepExecution, qualityNotes: e.target.value})}
                placeholder="Enter quality notes or observations..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrentStepDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteStep} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              {currentStepDialog?.status === 'pending' ? 'Start Step' : 'Complete Step'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={isAddingStep} onOpenChange={setIsAddingStep}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Production Step</DialogTitle>
            <DialogDescription>
              Add a new step to the production flow
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Step Name *</Label>
              <Input
                value={newStep.name}
                onChange={(e) => setNewStep({...newStep, name: e.target.value})}
                placeholder="Enter step name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newStep.description}
                onChange={(e) => setNewStep({...newStep, description: e.target.value})}
                placeholder="Describe what happens in this step"
                rows={3}
              />
            </div>

            <div>
              <Label>Default Machine (Optional)</Label>
              <Select value={newStep.machineId} onValueChange={(value) => 
                setNewStep({...newStep, machineId: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Choose default machine..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Manual Process</SelectItem>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name} - {machine.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingStep(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStep} disabled={!newStep.name}>
              Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Machine Dialog */}
      <Dialog open={isAddingMachine} onOpenChange={setIsAddingMachine}>
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
                value={newMachine.name}
                onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                placeholder="Enter machine name"
              />
            </div>

            <div>
              <Label>Machine Type</Label>
              <Select value={newMachine.type} onValueChange={(value: Machine['type']) => 
                setNewMachine({...newMachine, type: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cutting">Cutting</SelectItem>
                  <SelectItem value="needle-punching">Needle Punching</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Capacity/Specifications</Label>
              <Input
                value={newMachine.capacity}
                onChange={(e) => setNewMachine({...newMachine, capacity: e.target.value})}
                placeholder="e.g., Cutting 3.5 mm sheets"
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={newMachine.description}
                onChange={(e) => setNewMachine({...newMachine, description: e.target.value})}
                placeholder="Additional details about the machine"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingMachine(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMachine} disabled={!newMachine.name}>
              Add Machine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};