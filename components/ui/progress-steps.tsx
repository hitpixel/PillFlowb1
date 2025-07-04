import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
  return (
    <nav className={cn("flex items-center justify-center", className)}>
      <ol className="flex items-center space-x-2 sm:space-x-4">
        {steps.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <li key={step.id} className="flex items-center">
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors",
                  isCompleted
                    ? "bg-primary text-primary-foreground border-primary"
                    : isCurrent
                    ? "border-primary text-primary bg-background"
                    : "border-muted-foreground/20 text-muted-foreground bg-background",
                  isClickable && "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                  !isClickable && "cursor-default"
                )}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{stepIdx + 1}</span>
                )}
              </button>
              
              <div className="ml-2 min-w-0 hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {stepIdx < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 ml-4 hidden sm:block",
                    isCompleted
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 