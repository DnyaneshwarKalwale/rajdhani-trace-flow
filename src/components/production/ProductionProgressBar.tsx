import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Factory, Trash2, FileSpreadsheet } from 'lucide-react';

interface ProductionStep {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  stepType: 'material_selection' | 'machine_operation' | 'wastage_tracking' | 'testing_individual';
  machineName?: string;
}

interface ProductionProgressBarProps {
  currentStep: string;
  steps: ProductionStep[];
  machineSteps?: ProductionStep[];
  className?: string;
  onStepClick?: (stepType: string) => void;
}

const stepIcons = {
  material_selection: Package,
  machine_operation: Factory,
  wastage_tracking: Trash2,
  testing_individual: FileSpreadsheet
};

const stepColors = {
  material_selection: 'blue',
  machine_operation: 'green',
  wastage_tracking: 'orange',
  testing_individual: 'purple'
};

export default function ProductionProgressBar({ 
  currentStep, 
  steps, 
  machineSteps = [],
  className = "",
  onStepClick
}: ProductionProgressBarProps) {
  const getStepStatus = (stepType: string) => {
    const step = steps.find(s => s.stepType === stepType);
    return step?.status || 'pending';
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.stepType === currentStep);
  };

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const mainSteps = [
    { type: 'material_selection', name: 'Material Selection', icon: Package },
    { type: 'machine_operation', name: 'Machine Operations', icon: Factory },
    { type: 'wastage_tracking', name: 'Waste Generation', icon: Trash2 },
    { type: 'testing_individual', name: 'Individual Details', icon: FileSpreadsheet }
  ];

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main Progress Steps */}
          <div className="flex items-center justify-between relative">
            {mainSteps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(step.type);
              const isCurrent = step.type === currentStep;
              const isCompleted = status === 'completed';
              const isInProgress = status === 'in_progress';
              
              return (
                <div 
                  key={step.type} 
                  className={`flex flex-col items-center relative z-10 ${
                    onStepClick && (isCompleted || isCurrent || isInProgress) ? 'cursor-pointer hover:opacity-80' : ''
                  }`}
                  onClick={() => {
                    if (onStepClick && (isCompleted || isCurrent || isInProgress)) {
                      onStepClick(step.type);
                    }
                  }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-green-600 text-white' :
                    isCurrent || isInProgress ? 'bg-blue-600 text-white' :
                    'bg-gray-300 text-gray-600'
                  } ${onStepClick && (isCompleted || isCurrent || isInProgress) ? 'hover:scale-110' : ''}`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center max-w-24 truncate font-medium">
                    {step.name}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs mt-1 ${
                      isCompleted ? 'border-green-200 text-green-700' :
                      isCurrent || isInProgress ? 'border-blue-200 text-blue-700' :
                      'border-gray-200 text-gray-500'
                    } ${onStepClick && (isCompleted || isCurrent || isInProgress) ? 'hover:bg-opacity-10' : ''}`}
                  >
                    {isCompleted ? 'Done' : isCurrent || isInProgress ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              );
            })}
            
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
          
          {/* Machine Sub-steps (only show if current step is machine_operation) */}
          {currentStep === 'machine_operation' && machineSteps.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Factory className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Machine Operations</span>
                <Badge variant="outline" className="text-xs">
                  {machineSteps.filter(s => s.status === 'completed').length} / {machineSteps.length} completed
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {machineSteps.map((step, index) => {
                  const isCompleted = step.status === 'completed';
                  const isInProgress = step.status === 'in_progress';
                  const isPending = step.status === 'pending';
                  
                  return (
                    <div key={step.id} className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isCompleted ? 'bg-green-600 text-white' :
                        isInProgress ? 'bg-blue-600 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-xs truncate max-w-20 ${
                        isCompleted ? 'text-green-700' :
                        isInProgress ? 'text-blue-700' :
                        'text-gray-500'
                      }`}>
                        {step.machineName || step.name}
                      </span>
                      {index < machineSteps.length - 1 && (
                        <div className={`w-4 h-0.5 ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Progress Summary */}
          <div className="text-center pt-2">
            <span className="text-sm text-gray-600">
              Overall Progress: {getProgressPercentage()}% Complete
            </span>
            <div className="text-xs text-gray-400 mt-1">
              Current: {mainSteps.find(s => s.type === currentStep)?.name}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
