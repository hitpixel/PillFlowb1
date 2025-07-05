"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MedicationAutocomplete } from "@/components/ui/medication-autocomplete";
import { Info, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { type MedicationSuggestion } from "@/lib/fda-api";

interface MedicationFormData {
  medicationName: string;
  dosage: string;
  // Timing fields instead of frequency
  morningDose: string;
  afternoonDose: string;
  eveningDose: string;
  nightDose: string;
  instructions: string;
  prescribedBy: string;
  prescribedDate: string;
  startDate: string;
  endDate: string;
  // FDA NDC fields
  fdaNdc?: string;
  genericName?: string;
  brandName?: string;
  dosageForm?: string;
  route?: string;
  manufacturer?: string;
  activeIngredient?: string;
  strength?: string;
  // Request notes for shared users
  requestNotes?: string;
}

interface MedicationFormProps {
  initialData?: Partial<MedicationFormData>;
  onSubmit: (data: MedicationFormData) => Promise<void>;
  onRequestChange?: (data: MedicationFormData, requestType: "update" | "remove") => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
  isSharedAccess?: boolean;
  canRequestRemoval?: boolean;
}

export function MedicationForm({
  initialData,
  onSubmit,
  onRequestChange,
  onCancel,
  isLoading = false,
  isEdit = false,
  isSharedAccess = false,
  canRequestRemoval = false,
}: MedicationFormProps) {
  const [formData, setFormData] = useState<MedicationFormData>({
    medicationName: initialData?.medicationName || "",
    dosage: initialData?.dosage || "",
    // Timing fields instead of frequency
    morningDose: initialData?.morningDose || "",
    afternoonDose: initialData?.afternoonDose || "",
    eveningDose: initialData?.eveningDose || "",
    nightDose: initialData?.nightDose || "",
    instructions: initialData?.instructions || "",
    prescribedBy: initialData?.prescribedBy || "",
    prescribedDate: initialData?.prescribedDate || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    fdaNdc: initialData?.fdaNdc || "",
    genericName: initialData?.genericName || "",
    brandName: initialData?.brandName || "",
    dosageForm: initialData?.dosageForm || "",
    route: initialData?.route || "",
    manufacturer: initialData?.manufacturer || "",
    activeIngredient: initialData?.activeIngredient || "",
    strength: initialData?.strength || "",
    requestNotes: initialData?.requestNotes || "",
  });

  const [selectedFDAMedication, setSelectedFDAMedication] = useState<MedicationSuggestion | null>(null);

  const handleFDAMedicationSelect = (medication: MedicationSuggestion | null) => {
    setSelectedFDAMedication(medication);
    
    if (medication) {
      setFormData(prev => ({
        ...prev,
        medicationName: medication.brandName || medication.genericName || medication.name,
        fdaNdc: medication.ndc,
        genericName: medication.genericName,
        brandName: medication.brandName,
        dosageForm: medication.dosageForm,
        route: medication.route,
        manufacturer: medication.manufacturer,
        activeIngredient: medication.activeIngredient,
        strength: medication.strength,
        // Auto-populate dosage with strength if available
        dosage: medication.strength || prev.dosage,
      }));
      
      toast.success("Medication details populated from FDA database");
    }
  };

  const handleInputChange = (field: keyof MedicationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medicationName || !formData.dosage) {
      toast.error("Please fill in medication name and dosage");
      return;
    }

    // Check if at least one timing dose is provided
    if (!formData.morningDose && !formData.afternoonDose && !formData.eveningDose && !formData.nightDose) {
      toast.error("Please specify at least one timing dose");
      return;
    }

    try {
      if (isSharedAccess && isEdit) {
        // Shared users request changes instead of directly updating
        if (!onRequestChange) {
          toast.error("Request change handler not provided");
          return;
        }
        await onRequestChange(formData, "update");
        toast.success("Change request submitted for approval");
      } else {
        // Regular users or new medications
        await onSubmit(formData);
        toast.success(isEdit ? "Medication updated successfully" : "Medication added successfully");
      }
    } catch (error) {
      console.error("Error saving medication:", error);
      toast.error("Failed to save medication");
    }
  };

  const handleRequestRemoval = async () => {
    if (!onRequestChange) {
      toast.error("Request change handler not provided");
      return;
    }

    try {
      await onRequestChange(formData, "remove");
      toast.success("Removal request submitted for approval");
    } catch (error) {
      console.error("Error requesting removal:", error);
      toast.error("Failed to request removal");
    }
  };

  const clearFDAData = () => {
    setSelectedFDAMedication(null);
    setFormData(prev => ({
      ...prev,
      fdaNdc: "",
      genericName: "",
      brandName: "",
      dosageForm: "",
      route: "",
      manufacturer: "",
      activeIngredient: "",
      strength: "",
    }));
    toast.info("FDA data cleared");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {isEdit ? "Edit Medication" : "Add New Medication"}
        </CardTitle>
        <CardDescription>
          {isEdit ? "Update medication details" : "Add medication details using FDA database or manual entry"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* FDA Medication Search */}
          <div className="space-y-2">
            <Label htmlFor="fda-search">Search FDA Medication Database</Label>
            <MedicationAutocomplete
              value={selectedFDAMedication}
              onSelect={handleFDAMedicationSelect}
              placeholder="Search for medications in FDA database..."
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Search by medication name to auto-populate details from FDA database
            </p>
          </div>

          {/* FDA Data Display */}
          {selectedFDAMedication && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">FDA Database Information</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={clearFDAData}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>NDC:</strong> {selectedFDAMedication.ndc}</div>
                {selectedFDAMedication.genericName && (
                  <div><strong>Generic:</strong> {selectedFDAMedication.genericName}</div>
                )}
                {selectedFDAMedication.brandName && (
                  <div><strong>Brand:</strong> {selectedFDAMedication.brandName}</div>
                )}
                {selectedFDAMedication.manufacturer && (
                  <div><strong>Manufacturer:</strong> {selectedFDAMedication.manufacturer}</div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Basic Medication Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicationName">Medication Name *</Label>
                <Input
                  id="medicationName"
                  value={formData.medicationName}
                  onChange={(e) => handleInputChange("medicationName", e.target.value)}
                  placeholder="Enter medication name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange("dosage", e.target.value)}
                  placeholder="e.g., 10mg, 2 tablets"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="route">Route</Label>
                <Input
                  id="route"
                  value={formData.route || ""}
                  onChange={(e) => handleInputChange("route", e.target.value)}
                  placeholder="e.g., Oral, Topical"
                />
              </div>
            </div>

            {/* Timing Dosage Fields */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold">Dosing Schedule</h4>
              <p className="text-sm text-muted-foreground">
                Specify doses for different times of day. Leave blank for times when medication is not taken.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="morningDose">Morning Dose</Label>
                  <Input
                    id="morningDose"
                    value={formData.morningDose}
                    onChange={(e) => handleInputChange("morningDose", e.target.value)}
                    placeholder="e.g., 1 tablet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="afternoonDose">Afternoon Dose</Label>
                  <Input
                    id="afternoonDose"
                    value={formData.afternoonDose}
                    onChange={(e) => handleInputChange("afternoonDose", e.target.value)}
                    placeholder="e.g., 1 tablet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eveningDose">Evening Dose</Label>
                  <Input
                    id="eveningDose"
                    value={formData.eveningDose}
                    onChange={(e) => handleInputChange("eveningDose", e.target.value)}
                    placeholder="e.g., 1 tablet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nightDose">Night Dose</Label>
                  <Input
                    id="nightDose"
                    value={formData.nightDose}
                    onChange={(e) => handleInputChange("nightDose", e.target.value)}
                    placeholder="e.g., 1 tablet"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange("instructions", e.target.value)}
                placeholder="Special instructions for taking this medication..."
                rows={3}
              />
            </div>

            {/* Request Notes for Shared Users */}
            {isSharedAccess && (
              <div className="space-y-2">
                <Label htmlFor="requestNotes">Request Notes</Label>
                <Textarea
                  id="requestNotes"
                  value={formData.requestNotes || ""}
                  onChange={(e) => handleInputChange("requestNotes", e.target.value)}
                  placeholder={isEdit ? "Please explain why you are requesting this change..." : "Please explain why you are requesting this medication addition..."}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  These notes will help the medication owner understand your {isEdit ? "change" : "addition"} request
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Prescription Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Prescription Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prescribedBy">Prescribed By</Label>
                <Input
                  id="prescribedBy"
                  value={formData.prescribedBy}
                  onChange={(e) => handleInputChange("prescribedBy", e.target.value)}
                  placeholder="Doctor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescribedDate">Prescribed Date</Label>
                <Input
                  id="prescribedDate"
                  type="date"
                  value={formData.prescribedDate}
                  onChange={(e) => handleInputChange("prescribedDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* FDA Details (Read-only display) */}
          {(formData.fdaNdc || formData.genericName || formData.brandName) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">FDA Database Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.fdaNdc && (
                    <div className="space-y-2">
                      <Label>NDC Code</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{formData.fdaNdc}</Badge>
                      </div>
                    </div>
                  )}
                  {formData.genericName && (
                    <div className="space-y-2">
                      <Label>Generic Name</Label>
                      <p className="text-sm text-muted-foreground">{formData.genericName}</p>
                    </div>
                  )}
                  {formData.brandName && (
                    <div className="space-y-2">
                      <Label>Brand Name</Label>
                      <p className="text-sm text-muted-foreground">{formData.brandName}</p>
                    </div>
                  )}
                  {formData.manufacturer && (
                    <div className="space-y-2">
                      <Label>Manufacturer</Label>
                      <p className="text-sm text-muted-foreground">{formData.manufacturer}</p>
                    </div>
                  )}
                  {formData.activeIngredient && (
                    <div className="space-y-2">
                      <Label>Active Ingredient</Label>
                      <p className="text-sm text-muted-foreground">{formData.activeIngredient}</p>
                    </div>
                  )}
                  {formData.dosageForm && (
                    <div className="space-y-2">
                      <Label>Dosage Form</Label>
                      <p className="text-sm text-muted-foreground">{formData.dosageForm}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex gap-2 pt-4">
            {isSharedAccess && isEdit ? (
              // Shared user actions - request changes
              <>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Requesting..." : "Request Changes"}
                </Button>
                {canRequestRemoval && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleRequestRemoval}
                    disabled={isLoading}
                  >
                    Request Removal
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              // Regular user actions - direct update/add
              <>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : (isEdit ? "Update Medication" : (isSharedAccess ? "Request Addition" : "Add Medication"))}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 