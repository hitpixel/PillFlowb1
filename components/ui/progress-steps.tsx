import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

interface Step {
  id: string;
  name: string;
  description: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function ProgressSteps({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: ProgressStepsProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  return (
    <nav className={cn("flex items-center justify-center w-full", className)}>
      <div className="relative w-full max-w-md px-3">
        {/* Background line */}
        <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-muted-foreground/20 -translate-y-1/2" />
        
        {/* Progress line */}
        <div 
          className="absolute top-1/2 left-3 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
          style={{
            width: `calc(${(completedSteps.length / (steps.length - 1)) * 100}% - 1.5rem)`
          }}
        />

        {/* Step indicators container */}
        <div className="flex justify-between items-center w-full">
          {steps.map((step, stepIdx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isClickable = onStepClick && (isCompleted || isCurrent);
            const isExpanded = expandedStep === step.id;

            return (
              <div 
                key={step.id} 
                className="relative z-10 flex justify-center"
              >
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs font-medium transition-all duration-200 bg-background",
                  isCompleted
                    ? "bg-primary text-primary-foreground border-primary"
                    : isCurrent
                    ? "border-primary text-primary bg-background ring-2 ring-primary/20"
                    : "border-muted-foreground/30 text-muted-foreground bg-background",
                  isClickable && "hover:scale-110 cursor-pointer",
                  !isClickable && "cursor-default"
                )}
                onClick={() => isClickable && onStepClick(step.id)}
                onMouseEnter={() => setExpandedStep(step.id)}
                onMouseLeave={() => setExpandedStep(null)}
                disabled={!isClickable}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span>{stepIdx + 1}</span>
                )}
              </button>
              
              {/* Expanded tooltip */}
              {isExpanded && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-lg shadow-lg p-3 min-w-max z-20">
                  <p className="text-sm font-medium text-foreground whitespace-nowrap">
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {step.description}
                  </p>
                  {/* Arrow pointing down */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-border" />
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px border-4 border-transparent border-t-background" />
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </nav>
  );
} 