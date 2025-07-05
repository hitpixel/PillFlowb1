"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, Pill } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { searchMedicationsFlexible, type MedicationSuggestion } from "@/lib/fda-api";
import { useDebounce } from "@/hooks/use-debounce";

interface MedicationAutocompleteProps {
  value?: MedicationSuggestion | null;
  onSelect: (medication: MedicationSuggestion | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MedicationAutocomplete({
  value,
  onSelect,
  placeholder = "Search for a medication...",
  disabled = false,
  className,
}: MedicationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [medications, setMedications] = useState<MedicationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search medications when debounced query changes
  useEffect(() => {
    const searchMedications = async () => {
      if (debouncedSearchQuery.length < 2) {
        setMedications([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchMedicationsFlexible(debouncedSearchQuery, 10);
        setMedications(results);
      } catch (error) {
        console.error('Error searching medications:', error);
        setMedications([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchMedications();
  }, [debouncedSearchQuery]);

  const handleSelect = useCallback((medication: MedicationSuggestion) => {
    onSelect(medication);
    setOpen(false);
    setSearchQuery("");
  }, [onSelect]);

  const handleClear = useCallback(() => {
    onSelect(null);
    setSearchQuery("");
  }, [onSelect]);

  const displayValue = value?.name || "";

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 text-left">
              <Pill className="h-4 w-4 text-muted-foreground" />
              <span className={cn(
                "truncate",
                !displayValue && "text-muted-foreground"
              )}>
                {displayValue || placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type to search medications..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Searching FDA database...</span>
                </div>
              )}
              
              {!isLoading && searchQuery.length >= 2 && medications.length === 0 && (
                <CommandEmpty>
                  No medications found in FDA database.
                </CommandEmpty>
              )}

              {!isLoading && searchQuery.length < 2 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search
                </div>
              )}

              {!isLoading && medications.length > 0 && (
                <CommandGroup heading="FDA Medications">
                  {medications.map((medication) => (
                    <CommandItem
                      key={medication.ndc}
                      value={medication.ndc}
                      onSelect={() => handleSelect(medication)}
                      className="flex flex-col items-start gap-1 p-3"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            value?.ndc === medication.ndc ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {medication.name}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {medication.genericName && medication.brandName && (
                              <div>
                                <span className="font-medium">Generic:</span> {medication.genericName}
                              </div>
                            )}
                            {medication.strength && (
                              <div>
                                <span className="font-medium">Strength:</span> {medication.strength}
                              </div>
                            )}
                            {medication.dosageForm && (
                              <div>
                                <span className="font-medium">Form:</span> {medication.dosageForm}
                              </div>
                            )}
                            {medication.manufacturer && (
                              <div>
                                <span className="font-medium">Manufacturer:</span> {medication.manufacturer}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">NDC:</span> {medication.ndc}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Clear button when value is selected */}
      {value && (
        <div className="mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-xs"
          >
            Clear selection
          </Button>
        </div>
      )}
    </div>
  );
} 