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
  PackageCheck, 
  Search, 
  Save, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  Package,
  User,
  Calendar,
  BarChart3
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
}

export default function WebsterPacksPage() {
  // Queries
  const organization = useQuery(api.users.getOrganization);
  const recentChecks = useQuery(api.websterPacks.getRecentWebsterChecks, { limit: 10 });
  const stats = useQuery(api.websterPacks.getWebsterCheckStats);
  
  // Mutations
  const createCheck = useMutation(api.websterPacks.createWebsterPackCheck);
  
  // Form state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [formData, setFormData] = useState({
    websterPackId: "",
    packType: "blister" as "blister" | "sachets",
    checkStatus: "passed" as "passed" | "failed" | "requires_review",
    notes: "",
    medicationCount: "",
    packWeight: "",
    batchNumber: "",
    expiryDate: "",
  });
  const [issues, setIssues] = useState<string[]>([]);
  const [newIssue, setNewIssue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Patient search
  const patientSearchResults = useQuery(
    api.websterPacks.searchPatientsForWebsterCheck,
    searchTerm.trim() ? { searchTerm: searchTerm.trim(), limit: 10 } : "skip"
  );

  // Check if user has access (pharmacy organizations only)
  const hasAccess = organization?.type === "pharmacy";

  const handlePatientSelect = (patient: SelectedPatient) => {
    setSelectedPatient(patient);
    setSearchTerm("");
    // Set default pack type based on patient preference
    setFormData(prev => ({
      ...prev,
      packType: patient.preferredPack as "blister" | "sachets"
    }));
  };

  const handleAddIssue = () => {
    if (newIssue.trim() && !issues.includes(newIssue.trim())) {
      setIssues([...issues, newIssue.trim()]);
      setNewIssue("");
    }
  };

  const handleRemoveIssue = (index: number) => {
    setIssues(issues.filter((_, i) => i !== index));
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

    setIsSubmitting(true);
    
    try {
      const submitData = {
        patientId: selectedPatient._id,
        websterPackId: formData.websterPackId.trim(),
        packType: formData.packType,
        checkStatus: formData.checkStatus,
        notes: formData.notes.trim() || undefined,
        issues: issues.length > 0 ? issues : undefined,
        medicationCount: formData.medicationCount ? parseInt(formData.medicationCount) : undefined,
        packWeight: formData.packWeight ? parseFloat(formData.packWeight) : undefined,
        batchNumber: formData.batchNumber.trim() || undefined,
        expiryDate: formData.expiryDate || undefined,
      };

      await createCheck(submitData);
      
      toast.success("Webster pack check recorded successfully!");
      
      // Reset form
      setSelectedPatient(null);
      setFormData({
        websterPackId: "",
        packType: "blister",
        checkStatus: "passed",
        notes: "",
        medicationCount: "",
        packWeight: "",
        batchNumber: "",
        expiryDate: "",
      });
      setIssues([]);
      
    } catch (error) {
      console.error("Error creating Webster pack check:", error);
      toast.error("Failed to record pack check. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": return "text-green-600 bg-green-50 border-green-200";
      case "failed": return "text-red-600 bg-red-50 border-red-200";
      case "requires_review": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed": return <CheckCircle2 className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      case "requires_review": return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!hasAccess) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-6 text-center">
            <PackageCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Restricted
            </h1>
            <p className="text-muted-foreground mb-4">
              Webster pack checking is only available to pharmacy organizations.
            </p>
            <p className="text-sm text-muted-foreground">
              Your organization type: {organization?.type?.replace("_", " ") || "Unknown"}
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Webster Pack Checking</BreadcrumbPage>
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
                  <PackageCheck className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Webster Pack Checking</h1>
                  <p className="text-muted-foreground">
                    Quality control and verification for Webster packs
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalChecks}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.todayChecks} today
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.passRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.passedChecks} passed
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Failed Checks</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.failedChecks}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.reviewChecks} need review
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Week</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.weekChecks}</div>
                    <p className="text-xs text-muted-foreground">
                      checks completed
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Webster Pack Check Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Record Pack Check</CardTitle>
                    <CardDescription>
                      Search for a patient and record Webster pack verification details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                      </div>

                      {/* Check Status */}
                      <div className="space-y-2">
                        <Label htmlFor="check-status">Check Status</Label>
                        <Select 
                          value={formData.checkStatus} 
                          onValueChange={(value) => setFormData({...formData, checkStatus: value as "passed" | "failed" | "requires_review"})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passed">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Passed
                              </div>
                            </SelectItem>
                            <SelectItem value="requires_review">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                Requires Review
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

                      {/* Issues */}
                      {(formData.checkStatus === "failed" || formData.checkStatus === "requires_review") && (
                        <div className="space-y-2">
                          <Label>Issues Identified</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newIssue}
                              onChange={(e) => setNewIssue(e.target.value)}
                              placeholder="Describe an issue..."
                              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddIssue())}
                            />
                            <Button type="button" onClick={handleAddIssue} variant="outline">
                              Add
                            </Button>
                          </div>
                          {issues.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {issues.map((issue, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {issue}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveIssue(index)}
                                    className="ml-1 text-xs hover:text-red-600"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Additional Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="medication-count">Medication Count</Label>
                          <Input
                            id="medication-count"
                            type="number"
                            value={formData.medicationCount}
                            onChange={(e) => setFormData({...formData, medicationCount: e.target.value})}
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="pack-weight">Pack Weight (g)</Label>
                          <Input
                            id="pack-weight"
                            type="number"
                            step="0.1"
                            value={formData.packWeight}
                            onChange={(e) => setFormData({...formData, packWeight: e.target.value})}
                            placeholder="0.0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="batch-number">Batch Number</Label>
                          <Input
                            id="batch-number"
                            value={formData.batchNumber}
                            onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                            placeholder="Batch #"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="expiry-date">Earliest Expiry</Label>
                          <Input
                            id="expiry-date"
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          placeholder="Additional notes about the pack check..."
                          rows={3}
                        />
                      </div>

                      {/* Submit Button */}
                      <Button type="submit" disabled={isSubmitting || !selectedPatient} className="w-full">
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Recording Check...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Record Pack Check
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Checks */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Checks
                    </CardTitle>
                    <CardDescription>
                      Latest Webster pack verification activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentChecks && recentChecks.length > 0 ? (
                      <div className="space-y-4">
                        {recentChecks.map((check) => (
                          <div key={check._id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{check.patientName}</span>
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(check.checkStatus)}
                              >
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(check.checkStatus)}
                                  {check.checkStatus.replace("_", " ")}
                                </div>
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Pack: {check.websterPackId} • {check.packType}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Checked by {check.checkerName} • {formatDistanceToNow(new Date(check.checkedAt))} ago
                            </div>
                            {check.issues && check.issues.length > 0 && (
                              <div className="text-xs text-red-600">
                                Issues: {check.issues.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent checks</p>
                        <p className="text-xs">Completed checks will appear here</p>
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