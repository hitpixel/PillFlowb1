"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  PackageOpen, 
  Search, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Package,
  User,
  Calendar,
  Truck,
  MapPin
} from "lucide-react";
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
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

interface SelectedPatient {
  _id: Id<"patients">;
  name: string;
  shareToken: string;
  preferredPack: string;
  address?: string;
  phone?: string;
}

export default function ScanOutPage() {
  // Queries
  const organization = useQuery(api.users.getOrganization);
  const recentScanOuts = useQuery(api.websterPacks.getRecentWebsterScanOuts, { limit: 10 });
  const scanOutStats = useQuery(api.websterPacks.getWebsterScanOutStats);
  
  // Mutations
  const createScanOut = useMutation(api.websterPacks.createWebsterPackScanOut);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Patient & Pack Details
    websterPackId: "",
    packType: "blister" as "blister" | "sachets",
    numberOfPacks: 1,
    memberInitials: "",
    
    // Step 2: Delivery Details
    deliveryMethod: "pickup" as "pickup" | "delivery" | "courier",
    deliveryAddress: "",
    deliveryNotes: "",
    
    // Step 3: Final Confirmation
    scanOutStatus: "dispatched" as "dispatched" | "collected" | "failed",
    notes: "",
    recipientName: "",
    recipientSignature: "",
  });
  
  // Form state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Patient search
  const patientSearchResults = useQuery(
    api.websterPacks.searchPatientsForWebsterCheck,
    searchTerm.trim() ? { searchTerm: searchTerm.trim(), limit: 10 } : "skip"
  );

  // Check if Webster pack has been checked
  const websterPackCheck = useQuery(
    api.websterPacks.getWebsterPackCheckStatus,
    formData.websterPackId.trim() ? { websterPackId: formData.websterPackId.trim() } : "skip"
  );

  // Check if user has access (pharmacy organizations only)
  const hasAccess = organization?.type === "pharmacy";

  const handlePatientSelect = (patient: SelectedPatient) => {
    setSelectedPatient(patient);
    setSearchTerm("");
    // Set default pack type based on patient preference
    setFormData(prev => ({
      ...prev,
      packType: patient.preferredPack as "blister" | "sachets",
      deliveryAddress: patient.address || "",
      recipientName: patient.name
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    
    if (!formData.websterPackId.trim()) {
      toast.error("Webster Pack ID is required");
      return;
    }

    if (!formData.memberInitials.trim()) {
      toast.error("Member Initials are required");
      return;
    }

    if (formData.numberOfPacks < 1) {
      toast.error("Number of packs must be at least 1");
      return;
    }

    // Check if Webster pack has been checked
    if (websterPackCheck && !websterPackCheck.canScanOut) {
      toast.error(websterPackCheck.message);
      return;
    }

    if (!websterPackCheck) {
      toast.error("Please enter a valid Webster Pack ID to check its status");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        patientId: selectedPatient._id,
        websterPackId: formData.websterPackId.trim(),
        packType: formData.packType,
        numberOfPacks: formData.numberOfPacks,
        memberInitials: formData.memberInitials.trim(),
        deliveryMethod: formData.deliveryMethod,
        deliveryAddress: formData.deliveryAddress.trim() || undefined,
        deliveryNotes: formData.deliveryNotes.trim() || undefined,
        scanOutStatus: formData.scanOutStatus,
        notes: formData.notes.trim() || undefined,
        recipientName: formData.recipientName.trim() || undefined,
        recipientSignature: formData.recipientSignature.trim() || undefined,
      };

      await createScanOut(submitData);
      
      toast.success("Webster pack scan out recorded successfully!");
      
      // Reset form
      setSelectedPatient(null);
      setCurrentStep(1);
      setFormData({
        websterPackId: "",
        packType: "blister",
        numberOfPacks: 1,
        memberInitials: "",
        deliveryMethod: "pickup",
        deliveryAddress: "",
        deliveryNotes: "",
        scanOutStatus: "dispatched",
        notes: "",
        recipientName: "",
        recipientSignature: "",
      });
      
    } catch (error) {
      console.error("Error creating Webster pack scan out:", error);
      toast.error("Failed to record scan out. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "dispatched": return "text-blue-600 bg-blue-50 border-blue-200";
      case "collected": return "text-green-600 bg-green-50 border-green-200";
      case "failed": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "dispatched": return <Truck className="h-4 w-4" />;
      case "collected": return <CheckCircle2 className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!hasAccess) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-6 text-center">
            <PackageOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Restricted
            </h1>
            <p className="text-muted-foreground mb-4">
              Webster pack scan out is only available to pharmacy organisations.
            </p>
            <p className="text-sm text-muted-foreground">
              Your organisation type: {organization?.type?.replace("_", " ") || "Unknown"}
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/webster-packs">
                    Webster Packs
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Scan Out</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="max-w-7xl mx-auto space-y-6 w-full">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <PackageOpen className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Scan Out</h1>
                  <p className="text-muted-foreground">
                    Dispatch and track Webster packs to patients
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            {scanOutStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Scan Outs</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{scanOutStats.totalScanOuts}</div>
                    <p className="text-xs text-muted-foreground">
                      {scanOutStats.todayScanOuts} today
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dispatched</CardTitle>
                    <Truck className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{scanOutStats.dispatchedCount}</div>
                    <p className="text-xs text-muted-foreground">
                      pending collection
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collected</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{scanOutStats.collectedCount}</div>
                    <p className="text-xs text-muted-foreground">
                      successfully delivered
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{scanOutStats.weekScanOuts}</div>
                    <p className="text-xs text-muted-foreground">
                      packs dispatched
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Multi-Step Webster Pack Scan Out Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>Pack Scan Out</span>
                      <Badge variant="outline">Step {currentStep} of 3</Badge>
                    </CardTitle>
                    <CardDescription>
                      {currentStep === 1 && "Search for a patient and enter pack details"}
                      {currentStep === 2 && "Configure delivery method and address"}
                      {currentStep === 3 && "Final confirmation and dispatch"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Steps */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentStep >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            1
                          </div>
                          <span className="font-medium">Patient & Pack</span>
                        </div>
                        <div className={`flex-1 h-0.5 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentStep >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            2
                          </div>
                          <span className="font-medium">Delivery Details</span>
                        </div>
                        <div className={`flex-1 h-0.5 mx-4 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentStep >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            3
                          </div>
                          <span className="font-medium">Dispatch</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Patient & Pack Details */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        {/* Patient Search */}
                        <div className="space-y-2">
                          <Label htmlFor="patient-search">Search Patient</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="patient-search"
                              placeholder="Search by name or share token..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          
                          {/* Patient Search Results */}
                          {patientSearchResults && patientSearchResults.length > 0 && searchTerm && (
                            <div className="border rounded-md bg-white shadow-sm max-h-60 overflow-y-auto">
                              {patientSearchResults.map((patient) => (
                                <button
                                  key={patient._id}
                                  type="button"
                                  onClick={() => handlePatientSelect(patient)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b last:border-b-0 focus:outline-none focus:bg-gray-50"
                                >
                                  <div className="font-medium">{patient.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {patient.shareToken} • Prefers {patient.preferredPack}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Selected Patient */}
                          {selectedPatient && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{selectedPatient.name}</span>
                              <Badge variant="outline">{selectedPatient.shareToken}</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPatient(null)}
                              >
                                Change
                              </Button>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Pack Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="webster-pack-id">Webster Pack ID *</Label>
                            <Input
                              id="webster-pack-id"
                              value={formData.websterPackId}
                              onChange={(e) => setFormData({...formData, websterPackId: e.target.value})}
                              placeholder="Enter pack barcode/ID"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="pack-type">Pack Type</Label>
                            <Select 
                              value={formData.packType} 
                              onValueChange={(value) => setFormData({...formData, packType: value as "blister" | "sachets"})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blister">Blister Pack</SelectItem>
                                <SelectItem value="sachets">Sachets</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="number-of-packs">Number of Packs *</Label>
                            <Select 
                              value={formData.numberOfPacks.toString()} 
                              onValueChange={(value) => setFormData({...formData, numberOfPacks: parseInt(value)})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Pack</SelectItem>
                                <SelectItem value="2">2 Packs</SelectItem>
                                <SelectItem value="3">3 Packs</SelectItem>
                                <SelectItem value="4">4 Packs</SelectItem>
                                <SelectItem value="5">5 Packs</SelectItem>
                                <SelectItem value="6">6 Packs</SelectItem>
                                <SelectItem value="7">7 Packs</SelectItem>
                                <SelectItem value="8">8 Packs</SelectItem>
                                <SelectItem value="9">9 Packs</SelectItem>
                                <SelectItem value="10">10 Packs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="member-initials">Member Initials *</Label>
                            <Input
                              id="member-initials"
                              value={formData.memberInitials}
                              onChange={(e) => setFormData({...formData, memberInitials: e.target.value.toUpperCase()})}
                              placeholder="Enter your initials"
                              maxLength={5}
                              required
                            />
                          </div>
                        </div>

                        {/* Webster Pack Check Status */}
                        {formData.websterPackId.trim() && (
                          <div className="space-y-2">
                            <Label>Webster Pack Check Status</Label>
                            {websterPackCheck ? (
                              <div className={`p-3 rounded-lg border ${
                                websterPackCheck.canScanOut 
                                  ? "bg-green-50 border-green-200" 
                                  : "bg-red-50 border-red-200"
                              }`}>
                                <div className="flex items-center gap-2">
                                  {websterPackCheck.canScanOut ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  )}
                                  <span className={`font-medium ${
                                    websterPackCheck.canScanOut ? "text-green-800" : "text-red-800"
                                  }`}>
                                    {websterPackCheck.message}
                                  </span>
                                </div>
                                {websterPackCheck.checkDetails && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    <p>Status: <span className="font-medium">{websterPackCheck.checkDetails.checkStatus}</span></p>
                                    <p>Patient: <span className="font-medium">{websterPackCheck.checkDetails.patientName}</span></p>
                                    <p>Checked: <span className="font-medium">{new Date(websterPackCheck.checkDetails.checkedAt).toLocaleString()}</span></p>
                                    {websterPackCheck.checkDetails.notes && (
                                      <p>Notes: <span className="font-medium">{websterPackCheck.checkDetails.notes}</span></p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-gray-500" />
                                  <span className="text-gray-600">
                                    {formData.websterPackId.trim() ? "Checking pack status..." : "Enter Webster Pack ID to check status"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Next Button */}
                        <div className="flex justify-end pt-4">
                          <Button 
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            disabled={
                              !selectedPatient || 
                              !formData.websterPackId.trim() || 
                              !formData.memberInitials.trim() ||
                              formData.numberOfPacks < 1 ||
                              !websterPackCheck ||
                              !websterPackCheck.canScanOut
                            }
                            className="min-w-32"
                          >
                            Next Step
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Delivery Details */}
                    {currentStep === 2 && selectedPatient && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-medium text-blue-900 mb-2">Delivery Configuration</h3>
                          <p className="text-sm text-blue-700">
                            Configure how the Webster pack will be delivered to{" "}
                            <strong>{selectedPatient.name}</strong>
                          </p>
                        </div>

                        {/* Delivery Method */}
                        <div className="space-y-2">
                          <Label htmlFor="delivery-method">Delivery Method</Label>
                          <Select 
                            value={formData.deliveryMethod} 
                            onValueChange={(value) => setFormData({...formData, deliveryMethod: value as "pickup" | "delivery" | "courier"})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pickup">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  In-store Pickup
                                </div>
                              </SelectItem>
                              <SelectItem value="delivery">
                                <div className="flex items-center gap-2">
                                  <Truck className="h-4 w-4" />
                                  Home Delivery
                                </div>
                              </SelectItem>
                              <SelectItem value="courier">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Courier Service
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Delivery Address (if not pickup) */}
                        {formData.deliveryMethod !== "pickup" && (
                          <div className="space-y-2">
                            <Label htmlFor="delivery-address">Delivery Address</Label>
                            <Textarea
                              id="delivery-address"
                              value={formData.deliveryAddress}
                              onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                              placeholder="Enter delivery address..."
                              rows={3}
                            />
                          </div>
                        )}

                        {/* Recipient Name */}
                        <div className="space-y-2">
                          <Label htmlFor="recipient-name">Recipient Name</Label>
                          <Input
                            id="recipient-name"
                            value={formData.recipientName}
                            onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                            placeholder="Who will receive the pack?"
                          />
                        </div>

                        {/* Delivery Notes */}
                        <div className="space-y-2">
                          <Label htmlFor="delivery-notes">Delivery Notes</Label>
                          <Textarea
                            id="delivery-notes"
                            value={formData.deliveryNotes}
                            onChange={(e) => setFormData({...formData, deliveryNotes: e.target.value})}
                            placeholder="Special instructions for delivery..."
                            rows={2}
                          />
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                            className="min-w-32"
                          >
                            Back
                          </Button>
                          <Button 
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="min-w-32"
                          >
                            Next Step
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Final Confirmation */}
                    {currentStep === 3 && selectedPatient && (
                      <div className="space-y-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-medium text-green-900 mb-2">Dispatch Confirmation</h3>
                          <p className="text-sm text-green-700">
                            Ready to dispatch Webster pack <strong>{formData.websterPackId}</strong> to{" "}
                            <strong>{selectedPatient.name}</strong>
                          </p>
                        </div>

                        {/* Dispatch Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Dispatch Summary</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Patient</div>
                              <div className="text-gray-600">{selectedPatient.name}</div>
                            </div>
                            <div>
                              <div className="font-medium">Pack ID</div>
                              <div className="text-gray-600">{formData.websterPackId}</div>
                            </div>
                            <div>
                              <div className="font-medium">Pack Type</div>
                              <div className="text-gray-600 capitalize">{formData.packType}</div>
                            </div>
                            <div>
                              <div className="font-medium">Number of Packs</div>
                              <div className="text-gray-600">{formData.numberOfPacks}</div>
                            </div>
                            <div>
                              <div className="font-medium">Member Initials</div>
                              <div className="text-gray-600">{formData.memberInitials}</div>
                            </div>
                            <div>
                              <div className="font-medium">Delivery Method</div>
                              <div className="text-gray-600 capitalize">{formData.deliveryMethod.replace("_", " ")}</div>
                            </div>
                            {formData.deliveryMethod !== "pickup" && formData.deliveryAddress && (
                              <div className="col-span-2">
                                <div className="font-medium">Delivery Address</div>
                                <div className="text-gray-600">{formData.deliveryAddress}</div>
                              </div>
                            )}
                            {formData.recipientName && (
                              <div className="col-span-2">
                                <div className="font-medium">Recipient</div>
                                <div className="text-gray-600">{formData.recipientName}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Scan Out Status */}
                        <div className="space-y-2">
                          <Label htmlFor="scan-out-status">Scan Out Status</Label>
                          <Select 
                            value={formData.scanOutStatus} 
                            onValueChange={(value) => setFormData({...formData, scanOutStatus: value as "dispatched" | "collected" | "failed"})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dispatched">
                                <div className="flex items-center gap-2">
                                  <Truck className="h-4 w-4 text-blue-600" />
                                  Dispatched
                                </div>
                              </SelectItem>
                              <SelectItem value="collected">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  Collected
                                </div>
                              </SelectItem>
                              <SelectItem value="failed">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4 text-red-600" />
                                  Failed
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Additional notes about the scan out..."
                            rows={3}
                          />
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(2)}
                            className="min-w-32"
                          >
                            Back
                          </Button>
                          <Button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="min-w-32"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Complete Scan Out
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Scan Outs */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Scan Outs
                    </CardTitle>
                    <CardDescription>
                      Latest Webster pack dispatch activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentScanOuts && recentScanOuts.length > 0 ? (
                      <div className="space-y-4">
                        {recentScanOuts.map((scanOut) => (
                          <div key={scanOut._id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{scanOut.patientName}</span>
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(scanOut.scanOutStatus)}
                              >
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(scanOut.scanOutStatus)}
                                  {scanOut.scanOutStatus.replace("_", " ")}
                                </div>
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Pack: {scanOut.websterPackId} • {scanOut.packType} • {scanOut.numberOfPacks || 1} pack{(scanOut.numberOfPacks || 1) > 1 ? 's' : ''}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {scanOut.deliveryMethod.replace("_", " ")} • {scanOut.recipientName} {scanOut.memberInitials && `• By: ${scanOut.memberInitials}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Scanned out by {scanOut.scannerName} • {formatDistanceToNow(new Date(scanOut.scannedOutAt))} ago
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <PackageOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent scan outs</p>
                        <p className="text-xs">Dispatched packs will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 