/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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
}

const initialFormData: MedicationFormData = {
  medicationName: "",
  dosage: "",
  frequency: "",
  instructions: "",
  prescribedBy: "",
  prescribedDate: "",
  startDate: "",
  endDate: "",
};

export function PatientMedications({ patientId }: PatientMedicationsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [formData, setFormData] = useState<MedicationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query for medications
  const medications = useQuery(api.patientManagement.getPatientMedications, {
    patientId: patientId as any,
  });

  // Mutations
  const addMedication = useMutation(api.patientManagement.addPatientMedication);
  const updateMedication = useMutation(api.patientManagement.updatePatientMedication);

  const handleFormChange = (field: keyof MedicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMedication = async () => {
    if (!formData.medicationName || !formData.dosage || !formData.frequency) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await addMedication({
        patientId: patientId as any,
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        instructions: formData.instructions || undefined,
        prescribedBy: formData.prescribedBy || undefined,
        prescribedDate: formData.prescribedDate || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });
      
      toast.success("Medication added successfully");
      setFormData(initialFormData);
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error("Failed to add medication");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMedication = async () => {
    if (!editingMedication || !formData.medicationName || !formData.dosage || !formData.frequency) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateMedication({
        medicationId: editingMedication._id,
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        instructions: formData.instructions || undefined,
        prescribedBy: formData.prescribedBy || undefined,
        prescribedDate: formData.prescribedDate || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      });
      
      toast.success("Medication updated successfully");
      setEditingMedication(null);
      setFormData(initialFormData);
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

  const openEditDialog = (medication: any) => {
    setEditingMedication(medication);
    setFormData({
      medicationName: medication.medicationName,
      dosage: medication.dosage,
      frequency: medication.frequency,
      instructions: medication.instructions || "",
      prescribedBy: medication.prescribedBy || "",
      prescribedDate: medication.prescribedDate || "",
      startDate: medication.startDate || "",
      endDate: medication.endDate || "",
    });
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

  const MedicationForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="medicationName">Medication Name *</Label>
          <Input
            id="medicationName"
            placeholder="Enter medication name"
            value={formData.medicationName}
            onChange={(e) => handleFormChange("medicationName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage *</Label>
          <Input
            id="dosage"
            placeholder="e.g., 500mg, 1 tablet"
            value={formData.dosage}
            onChange={(e) => handleFormChange("dosage", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency *</Label>
          <Input
            id="frequency"
            placeholder="e.g., Twice daily, Every 8 hours"
            value={formData.frequency}
            onChange={(e) => handleFormChange("frequency", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prescribedBy">Prescribed By</Label>
          <Input
            id="prescribedBy"
            placeholder="Doctor's name"
            value={formData.prescribedBy}
            onChange={(e) => handleFormChange("prescribedBy", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          placeholder="Special instructions for taking this medication"
          value={formData.instructions}
          onChange={(e) => handleFormChange("instructions", e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prescribedDate">Prescribed Date</Label>
          <Input
            id="prescribedDate"
            type="date"
            value={formData.prescribedDate}
            onChange={(e) => handleFormChange("prescribedDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleFormChange("startDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleFormChange("endDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );

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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
                                 <DialogDescription>
                   Add a new medication to this patient&apos;s record
                 </DialogDescription>
              </DialogHeader>
              <MedicationForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMedication} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Medication"}
                </Button>
              </DialogFooter>
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
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog 
                      open={editingMedication?._id === medication._id} 
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingMedication(null);
                          setFormData(initialFormData);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(medication)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Medication</DialogTitle>
                          <DialogDescription>
                            Update medication details
                          </DialogDescription>
                        </DialogHeader>
                        <MedicationForm />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setEditingMedication(null);
                            setFormData(initialFormData);
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={handleEditMedication} disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Medication"}
                          </Button>
                        </DialogFooter>
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