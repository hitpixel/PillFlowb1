"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Users, 
  Grid, 
  List,
  Building2,
  Download
} from "lucide-react";
import Link from "next/link";
import { PatientCard } from "@/components/ui/patient-card";
import { PatientList } from "@/components/ui/patient-list";
import { ShareTokenModal } from "@/components/ui/share-token-modal";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { usePatientsPDFExport } from "@/components/ui/patients-pdf-export";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const patients = useQuery(api.patients.getPatients, {
    limit: 50,
    offset: 0,
  });
  
  const searchResults = useQuery(
    api.patients.searchPatients,
    isSearching && searchTerm.trim() ? { searchTerm: searchTerm.trim() } : "skip"
  );

  // Get organization to check type
  const organization = useQuery(api.users.getOrganization);

  const isLoading = patients === undefined;
  const displayPatients = isSearching && searchResults ? searchResults : patients;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(value.trim().length > 0);
  };

  // Check if current organization can add patients (only pharmacies)
  const canAddPatients = organization?.type === "pharmacy";

  // PDF Export functionality
  const { handleExport } = usePatientsPDFExport(
    displayPatients || [],
    () => {
      toast.success("Patients list exported successfully");
    }
  );

  const handlePDFExport = async () => {
    if (!displayPatients || displayPatients.length === 0) {
      toast.error("No patients to export");
      return;
    }
    
    try {
      await handleExport();
    } catch (error) {
      toast.error("Failed to export patients list");
    }
  };

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
                  <BreadcrumbPage>Patients</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="max-w-6xl mx-auto space-y-6 w-full">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Patients</h1>
                  <p className="text-muted-foreground">
                    {canAddPatients ? "Manage your organization's patient records" : "View and manage patient records"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePDFExport}
                    disabled={!displayPatients || displayPatients.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  <ShareTokenModal />
                  {canAddPatients && (
                    <Link href="/patients/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Patient
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Organization type notice for non-pharmacy organizations */}
              {!canAddPatients && organization && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> As a {organization.type.replace("_", " ")} organization, 
                      you can view and access patients but cannot create new patient records. 
                      Patient creation is managed by pharmacy organizations.
                    </p>
                  </div>
                </div>
              )}
            </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {patients?.length === 1 ? "patient" : "patients"} in your organization
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                         <div className="text-2xl font-bold">
               {patients?.filter((p) => p.isShared).length || 0}
             </div>
            <p className="text-xs text-muted-foreground">
              patients shared from other organizations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Badge variant="outline">Coming Soon</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              patient interactions this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Patients
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                <Grid className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or share token..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {isSearching && (
            <p className="text-sm text-muted-foreground mt-2">
              {searchResults?.length || 0} patients found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Patient List */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      ) : patients && patients.length > 0 ? (
        viewMode === "cards" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayPatients?.map((patient) => (
              <PatientCard
                key={patient._id}
                patient={patient}
                onCopyShareToken={() => {
                  toast.success("Share token copied to clipboard");
                }}
              />
            ))}
          </div>
        ) : (
          <PatientList
            patients={displayPatients || []}
            onCopyShareToken={() => {
              toast.success("Share token copied to clipboard");
            }}
          />
        )
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isSearching ? "No patients found" : "No patients yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isSearching
                ? "Try adjusting your search terms"
                : canAddPatients
                ? "Get started by adding your first patient"
                : "No patients are currently accessible to your organization"}
            </p>
            {!isSearching && canAddPatients && (
              <Link href="/patients/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 