
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full">
      {/* Desktop/Tablet View */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step.number <= currentStep
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {step.number < currentStep ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  step.number <= currentStep ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 max-w-24">
                  {step.description}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step.number < currentStep ? 'bg-blue-600' : 'bg-slate-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-slate-900">
            Langkah {currentStep} dari {steps.length}
          </div>
          <div className="text-xs text-slate-500">
            {Math.round((currentStep / steps.length) * 100)}%
          </div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white">
              <span className="text-sm font-semibold">{currentStep}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">
                {steps[currentStep - 1]?.title}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {steps[currentStep - 1]?.description}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
