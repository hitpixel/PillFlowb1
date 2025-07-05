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

export function PatientMedications({ patientId }: PatientMedicationsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query for medications and current user
  const medications = useQuery(api.patientManagement.getPatientMedications, {
    patientId: patientId as any,
  });
  const currentUser = useQuery(api.users.getCurrentUserProfile);

  // Mutations
  const addMedication = useMutation(api.patientManagement.addPatientMedication);
  const updateMedication = useMutation(api.patientManagement.updatePatientMedication);
  const requestMedicationChange = useMutation(api.patientManagement.requestMedicationChange);
  const approveMedicationRequest = useMutation(api.patientManagement.approveMedicationRequest);
  const rejectMedicationRequest = useMutation(api.patientManagement.rejectMedicationRequest);

  const handleAddMedication = async (data: MedicationFormData) => {
    try {
      setIsSubmitting(true);
      await addMedication({
        patientId: patientId as any,
        medicationName: data.medicationName,
        dosage: data.dosage,
        // Timing fields instead of frequency
        morningDose: data.morningDose || undefined,
        afternoonDose: data.afternoonDose || undefined,
        eveningDose: data.eveningDose || undefined,
        nightDose: data.nightDose || undefined,
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
        // Timing fields instead of frequency
        morningDose: data.morningDose || undefined,
        afternoonDose: data.afternoonDose || undefined,
        eveningDose: data.eveningDose || undefined,
        nightDose: data.nightDose || undefined,
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

  const handleRequestChange = async (data: MedicationFormData, requestType: "update" | "remove") => {
    if (!editingMedication) return;

    try {
      setIsSubmitting(true);
      
      const requestedChanges = requestType === "update" ? {
        medicationName: data.medicationName,
        dosage: data.dosage,
        morningDose: data.morningDose || undefined,
        afternoonDose: data.afternoonDose || undefined,
        eveningDose: data.eveningDose || undefined,
        nightDose: data.nightDose || undefined,
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
      } : undefined;

      await requestMedicationChange({
        medicationId: editingMedication._id,
        requestType,
        requestedChanges,
        requestNotes: data.requestNotes,
      });
      
      const actionText = requestType === "remove" ? "removal" : "change";
      toast.success(`Medication ${actionText} request submitted successfully`);
      setEditingMedication(null);
    } catch (error) {
      toast.error("Failed to submit request");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveMedicationRequest({ requestId: requestId as any });
      toast.success("Request approved successfully");
    } catch (error) {
      toast.error("Failed to approve request");
      console.error(error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectMedicationRequest({ requestId: requestId as any });
      toast.success("Request rejected");
    } catch (error) {
      toast.error("Failed to reject request");
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

  // Check if current user has shared access to a medication
  const isSharedAccess = (medication: any) => {
    if (!currentUser || !medication.organizationId) return false;
    // User has shared access if their organization is different from medication's organization
    return currentUser.organizationId !== medication.organizationId;
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
      // Timing fields instead of frequency
      morningDose: medication.morningDose || "",
      afternoonDose: medication.afternoonDose || "",
      eveningDose: medication.eveningDose || "",
      nightDose: medication.nightDose || "",
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
          {currentUser && (
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
          )}
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
          {medications
            ?.sort((a: any, b: any) => {
              // Sort active medications first, then inactive/removed ones at the bottom
              if (isMedicationActive(a) && !isMedicationActive(b)) return -1;
              if (!isMedicationActive(a) && isMedicationActive(b)) return 1;
              // Within each group, sort by creation date (newest first)
              return b.addedAt - a.addedAt;
            })
            ?.map((medication: any) => {
            let cardClassName = "";
            if (!isMedicationActive(medication)) {
              cardClassName = "opacity-60 border-gray-200";
            } else if (medication.hasPendingRequest) {
              if (medication.pendingRequest?.requestType === "remove") {
                cardClassName = "border-red-200 bg-red-50 opacity-75";
              } else {
                cardClassName = "border-yellow-200 bg-yellow-50";
              }
            }
            
            return (
              <Card key={medication._id} className={cardClassName}>
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
                          {medication.isActive === false ? "Removed" : "Stopped"}
                        </Badge>
                      )}
                      {medication.hasPendingRequest && (
                        <Badge className={medication.pendingRequest?.requestType === "remove" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
                          <Clock className="h-3 w-3 mr-1" />
                          {medication.pendingRequest?.requestType === "remove" ? "Removal Pending" : "Changes Pending"}
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
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMedication(medication);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {editingMedication?._id === medication._id && (
                        <Dialog 
                          open={true}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingMedication(null);
                            }
                          }}
                        >
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
                              onRequestChange={handleRequestChange}
                              onCancel={() => setEditingMedication(null)}
                              isLoading={isSubmitting}
                              isEdit={true}
                              isSharedAccess={isSharedAccess(medication)}
                              canRequestRemoval={true}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </>
                    {medication.hasPendingRequest && medication.pendingRequest && !isSharedAccess(medication) && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleApproveRequest(medication.pendingRequest.requestId)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRejectRequest(medication.pendingRequest.requestId)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {isMedicationActive(medication) && !medication.hasPendingRequest && (
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
                    <p className="text-muted-foreground mb-1">Dosage & Schedule</p>
                    <p className="font-medium">{medication.dosage}</p>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      {medication.morningDose && <p>Morning: {medication.morningDose}</p>}
                      {medication.afternoonDose && <p>Afternoon: {medication.afternoonDose}</p>}
                      {medication.eveningDose && <p>Evening: {medication.eveningDose}</p>}
                      {medication.nightDose && <p>Night: {medication.nightDose}</p>}
                      {!medication.morningDose && !medication.afternoonDose && !medication.eveningDose && !medication.nightDose && (
                        <p className="text-muted-foreground">No schedule specified</p>
                      )}
                    </div>
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

                {/* Pending Request Information */}
                {medication.hasPendingRequest && medication.pendingRequest && (
                  <>
                    <Separator className="my-4" />
                    <div className={`border rounded-lg p-3 ${medication.pendingRequest.requestType === "remove" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
                      <p className={`text-sm font-medium mb-2 flex items-center gap-2 ${medication.pendingRequest.requestType === "remove" ? "text-red-900" : "text-yellow-900"}`}>
                        <Clock className="h-4 w-4" />
                        Pending {medication.pendingRequest.requestType === "remove" ? "Removal" : "Change"} Request
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className={`font-medium ${medication.pendingRequest.requestType === "remove" ? "text-red-600" : "text-yellow-600"}`}>Requested By</p>
                          <p className={medication.pendingRequest.requestType === "remove" ? "text-red-800" : "text-yellow-800"}>
                            {medication.pendingRequest.requestedBy ? 
                              `${medication.pendingRequest.requestedBy.firstName} ${medication.pendingRequest.requestedBy.lastName}` : 
                              'Unknown User'
                            }
                          </p>
                          <p className={medication.pendingRequest.requestType === "remove" ? "text-red-700" : "text-yellow-700"}>
                            {medication.pendingRequest.requestedByOrg?.name} ({medication.pendingRequest.requestedByOrg?.type})
                          </p>
                        </div>
                        <div>
                          <p className={`font-medium ${medication.pendingRequest.requestType === "remove" ? "text-red-600" : "text-yellow-600"}`}>Requested</p>
                          <p className={medication.pendingRequest.requestType === "remove" ? "text-red-800" : "text-yellow-800"}>
                            {formatDistanceToNow(new Date(medication.pendingRequest.requestedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {medication.pendingRequest.requestNotes && (
                        <div className="mt-2">
                          <p className={`text-xs font-medium ${medication.pendingRequest.requestType === "remove" ? "text-red-600" : "text-yellow-600"}`}>Notes:</p>
                          <p className={`text-xs ${medication.pendingRequest.requestType === "remove" ? "text-red-800" : "text-yellow-800"}`}>
                            {medication.pendingRequest.requestNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

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
            );
          })}
        </div>
      )}
    </div>
  );
} 