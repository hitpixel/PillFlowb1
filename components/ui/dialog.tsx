"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

const Dialog: React.FC<DialogProps> = ({ 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange, 
  children 
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const onOpenChange = controlledOnOpenChange || setUncontrolledOpen;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ 
  asChild, 
  children, 
  className,
  ...props 
}) => {
  const { onOpenChange } = React.useContext(DialogContext);
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: () => onOpenChange(true),
    });
  }

  return (
    <Button
      className={className}
      onClick={() => onOpenChange(true)}
      {...props}
    >
      {children}
    </Button>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  const { open, onOpenChange } = React.useContext(DialogContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Content */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg border",
          className
        )}
        {...props}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ 
  className, 
  children, 
  ...props 
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-2", className)}
    {...props}
  >
    {children}
  </div>
);

const DialogTitle: React.FC<DialogTitleProps> = ({ 
  className, 
  children, 
  ...props 
}) => (
  <h2
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h2>
);

const DialogDescription: React.FC<DialogDescriptionProps> = ({ 
  className, 
  children, 
  ...props 
}) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </p>
);

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  ...props 
}) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-2", className)}
    {...props}
  />
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}; 