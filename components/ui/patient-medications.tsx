/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Pill, 
  Plus, 
  Edit, 
  Calendar,
  User,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle,
  FlaskConical,
  Layers
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { MedicationForm } from "@/components/medication-form";

interface PatientMedicationsProps {
  patientId: string;
}

interface MedicationFormData {
  medicationName: string;
  dosage: string;
  frequency: string;
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
}

export function PatientMedications({ patientId }: PatientMedicationsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query for medications
  const medications = useQuery(api.patientManagement.getPatientMedications, {
    patientId: patientId as any,
  });

  // Mutations
  const addMedication = useMutation(api.patientManagement.addPatientMedication);
  const updateMedication = useMutation(api.patientManagement.updatePatientMedication);

  const handleAddMedication = async (data: MedicationFormData) => {
    try {
      setIsSubmitting(true);
      await addMedication({
        patientId: patientId as any,
        medicationName: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
        instructions: data.instructions || undefined,
        prescribedBy: data.prescribedBy || undefined,
        prescribedDate: data.prescribedDate || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        // FDA NDC fields
        fdaNdc: data.fdaNdc || undefined,
        genericName: data.genericName || undefined,
        brandName: data.brandName || undefined,
        dosageForm: data.dosageForm || undefined,
        route: data.route || undefined,
        manufacturer: data.manufacturer || undefined,
        activeIngredient: data.activeIngredient || undefined,
        strength: data.strength || undefined,
      });
      
      toast.success("Medication added successfully");
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error("Failed to add medication");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMedication = async (data: MedicationFormData) => {
    if (!editingMedication) return;

    try {
      setIsSubmitting(true);
      await updateMedication({
        medicationId: editingMedication._id,
        medicationName: data.medicationName,
        dosage: data.dosage,
        frequency: data.frequency,
        instructions: data.instructions || undefined,
        prescribedBy: data.prescribedBy || undefined,
        prescribedDate: data.prescribedDate || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        // FDA NDC fields
        fdaNdc: data.fdaNdc || undefined,
        genericName: data.genericName || undefined,
        brandName: data.brandName || undefined,
        dosageForm: data.dosageForm || undefined,
        route: data.route || undefined,
        manufacturer: data.manufacturer || undefined,
        activeIngredient: data.activeIngredient || undefined,
        strength: data.strength || undefined,
      });
      
      toast.success("Medication updated successfully");
      setEditingMedication(null);
    } catch (error) {
      toast.error("Failed to update medication");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopMedication = async (medicationId: string) => {
    try {
      await updateMedication({
        medicationId: medicationId as any,
        isActive: false,
      });
      toast.success("Medication stopped");
    } catch (error) {
      toast.error("Failed to stop medication");
      console.error(error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isMedicationActive = (medication: any) => {
    if (!medication.isActive) return false;
    if (medication.endDate) {
      const endDate = new Date(medication.endDate);
      return endDate >= new Date();
    }
    return true;
  };

  const getEditInitialData = (medication: any): Partial<MedicationFormData> => {
    return {
      medicationName: medication.medicationName,
      dosage: medication.dosage,
      frequency: medication.frequency,
      instructions: medication.instructions || "",
      prescribedBy: medication.prescribedBy || "",
      prescribedDate: medication.prescribedDate || "",
      startDate: medication.startDate || "",
      endDate: medication.endDate || "",
      fdaNdc: medication.fdaNdc || "",
      genericName: medication.genericName || "",
      brandName: medication.brandName || "",
      dosageForm: medication.dosageForm || "",
      route: medication.route || "",
      manufacturer: medication.manufacturer || "",
      activeIngredient: medication.activeIngredient || "",
      strength: medication.strength || "",
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Medications</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {medications?.filter(m => isMedicationActive(m)).length || 0} Active
          </Badge>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
                <DialogDescription>
                  Add a new medication using FDA database search or manual entry
                </DialogDescription>
              </DialogHeader>
              <MedicationForm
                onSubmit={handleAddMedication}
                onCancel={() => setIsAddDialogOpen(false)}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Medications List */}
      {medications?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Pill className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No medications found</p>
            <p className="text-sm text-muted-foreground">Add medications to track patient&apos;s treatment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {medications?.map((medication: any) => (
            <Card key={medication._id} className={!isMedicationActive(medication) ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      <h4 className="text-lg font-semibold">{medication.medicationName}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMedicationActive(medication) ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Stopped
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <Building2 className="h-3 w-3 mr-1" />
                        {medication.organization?.name}
                      </Badge>
                      {medication.fdaNdc && (
                        <Badge variant="outline" className="text-blue-600">
                          <FlaskConical className="h-3 w-3 mr-1" />
                          FDA Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog 
                      open={editingMedication?._id === medication._id} 
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingMedication(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingMedication(medication)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Medication</DialogTitle>
                          <DialogDescription>
                            Update medication details
                          </DialogDescription>
                        </DialogHeader>
                        <MedicationForm
                          initialData={getEditInitialData(medication)}
                          onSubmit={handleEditMedication}
                          onCancel={() => setEditingMedication(null)}
                          isLoading={isSubmitting}
                          isEdit={true}
                        />
                      </DialogContent>
                    </Dialog>
                    {isMedicationActive(medication) && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleStopMedication(medication._id)}
                      >
                        Stop
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Dosage & Frequency</p>
                    <p className="font-medium">{medication.dosage}</p>
                    <p className="text-muted-foreground">{medication.frequency}</p>
                    {medication.route && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <Layers className="h-3 w-3 inline mr-1" />
                        {medication.route}
                      </p>
                    )}
                  </div>

                  {medication.prescribedBy && (
                    <div>
                      <p className="text-muted-foreground mb-1">Prescribed By</p>
                      <p className="font-medium">{medication.prescribedBy}</p>
                      {medication.prescribedDate && (
                        <p className="text-muted-foreground">{formatDate(medication.prescribedDate)}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-muted-foreground mb-1">Duration</p>
                    <div className="space-y-1">
                      {medication.startDate && (
                        <p className="text-xs">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          From: {formatDate(medication.startDate)}
                        </p>
                      )}
                      {medication.endDate && (
                        <p className="text-xs">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Until: {formatDate(medication.endDate)}
                        </p>
                      )}
                      {!medication.startDate && !medication.endDate && (
                        <p className="text-xs text-muted-foreground">No duration specified</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* FDA Information */}
                {(medication.fdaNdc || medication.genericName || medication.brandName || medication.manufacturer) && (
                  <>
                    <Separator className="my-4" />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <FlaskConical className="h-4 w-4" />
                        FDA Database Information
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        {medication.fdaNdc && (
                          <div>
                            <p className="text-blue-600 font-medium">NDC Code</p>
                            <p className="text-blue-800">{medication.fdaNdc}</p>
                          </div>
                        )}
                        {medication.genericName && (
                          <div>
                            <p className="text-blue-600 font-medium">Generic Name</p>
                            <p className="text-blue-800">{medication.genericName}</p>
                          </div>
                        )}
                        {medication.brandName && (
                          <div>
                            <p className="text-blue-600 font-medium">Brand Name</p>
                            <p className="text-blue-800">{medication.brandName}</p>
                          </div>
                        )}
                        {medication.manufacturer && (
                          <div>
                            <p className="text-blue-600 font-medium">Manufacturer</p>
                            <p className="text-blue-800">{medication.manufacturer}</p>
                          </div>
                        )}
                        {medication.activeIngredient && (
                          <div>
                            <p className="text-blue-600 font-medium">Active Ingredient</p>
                            <p className="text-blue-800">{medication.activeIngredient}</p>
                          </div>
                        )}
                        {medication.dosageForm && (
                          <div>
                            <p className="text-blue-600 font-medium">Dosage Form</p>
                            <p className="text-blue-800">{medication.dosageForm}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {medication.instructions && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-muted-foreground mb-2 text-sm">Instructions</p>
                      <p className="text-sm bg-muted/50 p-3 rounded-md">{medication.instructions}</p>
                    </div>
                  </>
                )}

                <Separator className="my-4" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Added by {medication.addedByUser?.firstName} {medication.addedByUser?.lastName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(medication.addedAt), { addSuffix: true })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 