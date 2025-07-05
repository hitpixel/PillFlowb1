"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Save, X, Trash2, Copy, User, Calendar, Mail, Phone, MapPin, Package, Share2, Shield, Pill, MessageSquare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TokenAccessManagement } from "@/components/ui/token-access-management";
import { PatientMedications } from "@/components/ui/patient-medications";
import { PatientComments } from "@/components/ui/patient-comments";
import { MedicationLog } from "@/components/ui/medication-log";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as Id<"patients">;
  
  const patientResult = useQuery(api.patients.getPatient, { id: patientId });
  const updatePatient = useMutation(api.patients.updatePatient);
  const deletePatient = useMutation(api.patients.deletePatient);
  
  const [accessDenied, setAccessDenied] = useState(false);

  // Extract patient data and handle errors
  const patient = patientResult?.patient || null;
  const patientError = patientResult?.error || null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    streetAddress: "",
    suburb: "",
    state: "",
    postcode: "",
    preferredPack: "blister" as "blister" | "sachets",
  });

  // Initialize form data when patient is loaded
  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        email: patient.email || "",
        phone: patient.phone || "",
        streetAddress: patient.streetAddress,
        suburb: patient.suburb,
        state: patient.state,
        postcode: patient.postcode,
        preferredPack: patient.preferredPack,
      });
    }
  }, [patient]);

  // Handle access errors gracefully
  useEffect(() => {
    if (patientError && !accessDenied) {
      toast.error(patientError);
      setAccessDenied(true);
      // Redirect back to patients list after showing error
      setTimeout(() => {
        router.push("/patients");
      }, 2000);
    }
  }, [patientError, accessDenied, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        email: patient.email || "",
        phone: patient.phone || "",
        streetAddress: patient.streetAddress,
        suburb: patient.suburb,
        state: patient.state,
        postcode: patient.postcode,
        preferredPack: patient.preferredPack,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.firstName.trim()) {
        toast.error("First name is required");
        return;
      }
      if (!formData.lastName.trim()) {
        toast.error("Last name is required");
        return;
      }
      if (!formData.dateOfBirth) {
        toast.error("Date of birth is required");
        return;
      }
      if (!formData.streetAddress.trim()) {
        toast.error("Street address is required");
        return;
      }
      if (!formData.suburb.trim()) {
        toast.error("Suburb is required");
        return;
      }
      if (!formData.state.trim()) {
        toast.error("State is required");
        return;
      }
      if (!formData.postcode.trim()) {
        toast.error("Postcode is required");
        return;
      }

      // Validate date of birth is not in the future
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      if (birthDate > today) {
        toast.error("Date of birth cannot be in the future");
        return;
      }

      // Validate email format if provided
      if (formData.email.trim() && !formData.email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Validate postcode format (Australian postcodes are 4 digits)
      if (!/^\d{4}$/.test(formData.postcode)) {
        toast.error("Postcode must be 4 digits");
        return;
      }

      const updateData = {
        id: patientId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        streetAddress: formData.streetAddress.trim(),
        suburb: formData.suburb.trim(),
        state: formData.state.trim(),
        postcode: formData.postcode.trim(),
        preferredPack: formData.preferredPack,
      };

      await updatePatient(updateData);
      
      toast.success("Patient updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Failed to update patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePatient({ id: patientId });
      toast.success("Patient deleted successfully");
      router.push("/patients");
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Failed to delete patient. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyShareToken = async () => {
    if (patient) {
      try {
        await navigator.clipboard.writeText(patient.shareToken);
        toast.success("Share token copied to clipboard!");
      } catch {
        toast.error("Failed to copy share token");
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const australianStates = [
    { value: "NSW", label: "New South Wales" },
    { value: "VIC", label: "Victoria" },
    { value: "QLD", label: "Queensland" },
    { value: "WA", label: "Western Australia" },
    { value: "SA", label: "South Australia" },
    { value: "TAS", label: "Tasmania" },
    { value: "NT", label: "Northern Territory" },
    { value: "ACT", label: "Australian Capital Territory" },
  ];

  if (patientResult === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {patientError ? "Access Denied" : "Patient Not Found"}
        </h1>
        <p className="text-muted-foreground mb-4">
          {patientError || "The patient you're looking for doesn't exist or you don't have permission to view it."}
        </p>
        <Link href="/patients">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/patients">
                    Patients
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{patient.firstName} {patient.lastName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="max-w-4xl mx-auto space-y-6 w-full">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/patients">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Patients
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                      <User className="h-8 w-8" />
                      {patient.firstName} {patient.lastName}
                      {patient.isShared && (
                        <Badge variant="outline" className="ml-2">
                          <Share2 className="h-3 w-3 mr-1" />
                          Shared Patient
                        </Badge>
                      )}
                    </h1>
                    <p className="text-muted-foreground">
                      Patient details and medical information
                      {patient.isShared && patient.organizationName && (
                        <span className="block text-sm text-blue-600">
                          From: {patient.organizationName} ({patient.organizationType?.replace('_', ' ')})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              {/* Show edit button for all users (same org has full access, shared users get full access as requested) */}
              <Button onClick={handleEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {/* Only show delete button for users from the patient's owning organization */}
              {!patient.isShared && (
                <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button onClick={handleCancel} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
              </div>
            </div>

            {/* Shared Patient Alert */}
            {patient.isShared && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Share2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900">Shared Patient Access</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      You have been granted access to this patient from {patient.organizationName}. 
                      You can view and edit all patient information.
                    </p>
                    {patient.expiresAt && (
                      <p className="text-sm text-blue-600 mt-1">
                        Access expires: {new Date(patient.expiresAt).toLocaleDateString('en-AU', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Patient Information Tabs */}
            <Tabs defaultValue="patient-info" className="w-full">
              <TabsList className={`grid w-full ${patient.isShared ? 'grid-cols-4' : 'grid-cols-5'}`}>
                <TabsTrigger value="patient-info" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Info
                </TabsTrigger>
                {!patient.isShared && (
                  <TabsTrigger value="token-access" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Token Access
                  </TabsTrigger>
                )}
                <TabsTrigger value="medications" className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Medications
                </TabsTrigger>
                <TabsTrigger value="medication-log" className="flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Medication Log
                </TabsTrigger>
                <TabsTrigger value="communication" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Communication
                </TabsTrigger>
              </TabsList>

              {/* Patient Info Tab */}
              <TabsContent value="patient-info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Patient Information</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          Age {formatAge(patient.dateOfBirth)}
                        </Badge>
                        <Badge variant={patient.preferredPack === "blister" ? "default" : "outline"}>
                          {patient.preferredPack === "blister" ? "Blister Pack" : "Sachets"}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
          {!isEditing ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{patient.firstName} {patient.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date of Birth:</span>
                    <span>{formatDate(patient.dateOfBirth)}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{patient.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Address</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p>{patient.streetAddress}</p>
                    <p>{patient.suburb}, {patient.state} {patient.postcode}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medication Preference */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Medication Preference</h3>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Preferred Pack:</span>
                  <Badge variant={patient.preferredPack === "blister" ? "default" : "outline"}>
                    {patient.preferredPack === "blister" ? "Blister Pack" : "Sachets"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Share Token */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Data Sharing</h3>
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Share Token:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {patient.shareToken}
                  </code>
                  <Button onClick={handleCopyShareToken} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This unique token can be shared with other healthcare organizations to access this patient&apos;s data.
                </p>
              </div>

              <Separator />

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Record Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">
                      {formatDistanceToNow(new Date(patient.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <span className="ml-2">
                      {formatDistanceToNow(new Date(patient.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb *</Label>
                    <Input
                      id="suburb"
                      value={formData.suburb}
                      onChange={(e) => handleInputChange("suburb", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {australianStates.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange("postcode", e.target.value)}
                      pattern="[0-9]{4}"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Medication Preference */}
              <div className="space-y-2">
                <Label htmlFor="preferredPack">Preferred Pack Type *</Label>
                <Select 
                  value={formData.preferredPack} 
                  onValueChange={(value) => handleInputChange("preferredPack", value as "blister" | "sachets")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pack type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blister">Blister Pack</SelectItem>
                    <SelectItem value="sachets">Sachets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Token Access Tab - Only shown for non-shared access */}
              {!patient.isShared && (
                <TabsContent value="token-access" className="space-y-4">
                  <TokenAccessManagement patientId={patientId} />
                </TabsContent>
              )}

              {/* Medications Tab */}
              <TabsContent value="medications" className="space-y-4">
                <PatientMedications patientId={patientId} />
              </TabsContent>

              {/* Medication Log Tab */}
              <TabsContent value="medication-log" className="space-y-4">
                <MedicationLog patientId={patientId} />
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication" className="space-y-4">
                <PatientComments patientId={patientId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 