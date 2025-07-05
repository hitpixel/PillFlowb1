"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Users, Calendar, Package, Grid, List } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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
import { ShareTokenModal } from "@/components/ui/share-token-modal";
import { PatientCard } from "@/components/ui/patient-card";
import { PatientList } from "@/components/ui/patient-list";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  
  // Get all patients or search results
  const allPatients = useQuery(api.patients.getPatients, {});
  const searchResults = useQuery(
    api.patients.searchPatients,
    searchTerm.trim().length > 0 ? { searchTerm: searchTerm.trim() } : "skip"
  );
  
  // Get patient statistics
  const patientStats = useQuery(api.patients.getPatientStats, {});
  
  const patients = searchTerm.trim().length > 0 ? searchResults : allPatients;
  const isLoading = patients === undefined;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsSearching(value.trim().length > 0);
  };



  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
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
                    Manage your organization&apos;s patient records
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ShareTokenModal />
                  <Link href="/patients/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Patient
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

      {/* Statistics Cards */}
      {patientStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientStats.totalPatients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientStats.patientsThisMonth}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blister Packs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientStats.packingPreferences.blister}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sachets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientStats.packingPreferences.sachets}</div>
            </CardContent>
          </Card>
        </div>
      )}

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
            {patients.map((patient) => (
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
            patients={patients}
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
                : "Get started by adding your first patient"}
            </p>
            {!isSearching && (
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