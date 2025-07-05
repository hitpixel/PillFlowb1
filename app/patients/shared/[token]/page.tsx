"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, User, Calendar, Mail, Phone, MapPin, Package, Share2, Building2, Info } from "lucide-react";
import Link from "next/link";
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

export default function SharedPatientPage() {
  const params = useParams();
  const router = useRouter();
  const shareToken = decodeURIComponent(params.token as string);
  
  const patient = useQuery(api.patients.getPatientByShareToken, { shareToken });
  const logAccess = useMutation(api.patients.logShareTokenAccess);
  
  const [accessLogged, setAccessLogged] = useState(false);

  // Log the access when patient data is loaded
  useEffect(() => {
    if (patient && !accessLogged) {
             logAccess({
         patientId: patient._id,
         shareToken: shareToken,
         accessType: patient.accessType as "same_organization" | "cross_organization",
       }).then(() => {
        setAccessLogged(true);
      }).catch((error) => {
        console.error("Failed to log access:", error);
      });
    }
  }, [patient, accessLogged, logAccess, shareToken]);

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

  if (patient === undefined) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/patients">Patients</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Shared Patient</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (patient === null) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/patients">Patients</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Shared Patient</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="max-w-4xl mx-auto space-y-6 w-full">
              <Alert className="border-red-200 bg-red-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Patient Not Found</strong>
                  <br />
                  The share token you entered is invalid or the patient data is not available.
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Link href="/patients">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Patients
                  </Button>
                </Link>
              </div>
            </div>
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
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/patients">Patients</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Shared Patient</BreadcrumbPage>
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
                    </h1>
                    <p className="text-muted-foreground">
                      Shared patient from {patient.organizationName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Share2 className="h-3 w-3 mr-1" />
                    Shared Access
                  </Badge>
                  <Badge variant="outline">
                    {patient.accessType === "same_organization" ? "Same Organization" : "Cross Organization"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Organization Info */}
            <Alert className="border-blue-200 bg-blue-50">
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Patient Organization:</strong> {patient.organizationName} ({patient.organizationType})
                <br />
                <strong>Access Type:</strong> {patient.accessType === "same_organization" ? "Same Organization" : "Cross Organization Access via Share Token"}
              </AlertDescription>
            </Alert>

            {/* Patient Information */}
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
                <CardDescription>
                  Patient details shared via token: {shareToken}
                </CardDescription>
              </CardHeader>
              <CardContent>
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

                  {/* Sharing Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Sharing Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Share Token:</span>
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {shareToken}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Patient Organization:</span>
                        <span>{patient.organizationName} ({patient.organizationType})</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      You are viewing this patient&apos;s data {patient.accessType === "same_organization" ? "from the same organization" : "via shared access token from another organization"}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 