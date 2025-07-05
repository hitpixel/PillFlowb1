"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, Plus, TrendingUp, AlertTriangle, Pill, Shield, CheckCircle, XCircle } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const setupStatus = useQuery(api.users.getSetupStatus);
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const organization = useQuery(api.users.getOrganization);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/signin");
        return;
      }
      
      // Check if user needs to complete setup
      if (setupStatus && setupStatus.needsSetup) {
        router.push("/setup");
        return;
      }
    }
  }, [isAuthenticated, isLoading, setupStatus, router]);

  if (isLoading || !setupStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || setupStatus.needsSetup) {
    return null; // Will redirect in useEffect
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
                  <BreadcrumbLink href="/">
                    PillFlow
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back{userProfile ? `, ${userProfile.firstName}` : ""}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Here&apos;s an overview of your healthcare management dashboard
            </p>
          </div>

          {/* Feature Access Indicator */}
          {organization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {organization.type === "pharmacy" ? "Pharmacy" : 
                   organization.type === "gp_clinic" ? "GP Clinic" :
                   organization.type === "hospital" ? "Hospital" : 
                   "Aged Care"} Dashboard Features
                </CardTitle>
                <CardDescription>
                  Your organization type determines which features are available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Patient Management - Different access levels */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                    organization.type === "pharmacy" 
                      ? "bg-green-50 border-green-200" 
                      : "bg-blue-50 border-blue-200"
                  }`}>
                    <CheckCircle className={`h-4 w-4 ${
                      organization.type === "pharmacy" ? "text-green-600" : "text-blue-600"
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        organization.type === "pharmacy" ? "text-green-800" : "text-blue-800"
                      }`}>
                        Patient Management
                      </p>
                      <p className={`text-xs ${
                        organization.type === "pharmacy" ? "text-green-600" : "text-blue-600"
                      }`}>
                        {organization.type === "pharmacy" ? "Full access" : "View & access only"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Compliance Tracking</p>
                      <p className="text-xs text-green-600">Full access</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Team Management</p>
                      <p className="text-xs text-green-600">Full access</p>
                    </div>
                  </div>

                  {/* Medication Features - Only for Pharmacies */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                    organization.type === "pharmacy" 
                      ? "bg-green-50 border-green-200" 
                      : "bg-gray-50 border-gray-200"
                  }`}>
                    {organization.type === "pharmacy" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        organization.type === "pharmacy" ? "text-green-800" : "text-gray-500"
                      }`}>
                        <Pill className="h-3 w-3 inline mr-1" />
                        Medication Management
                      </p>
                      <p className={`text-xs ${
                        organization.type === "pharmacy" ? "text-green-600" : "text-gray-400"
                      }`}>
                        {organization.type === "pharmacy" ? "Full access" : "Not available"}
                      </p>
                    </div>
                  </div>

                  {/* Webster Pack Checking - Only for Pharmacies */}
                  {organization.type === "pharmacy" && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">
                          <Shield className="h-3 w-3 inline mr-1" />
                          Webster Pack Checking
                        </p>
                        <p className="text-xs text-green-600">
                          Quality control & verification
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {organization.type !== "pharmacy" && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Note:</strong> As a {organization.type.replace("_", " ")} organization, you have access to view and manage patients 
                      but cannot create new patient records. Patient creation and medication management features are designed specifically for pharmacy operations. 
                      You can access all other PillFlow features including patient care, compliance tracking, and team collaboration tools.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  No patients yet
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  No active medications
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  No data available
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  No active alerts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to get you started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {organization?.type === "pharmacy" && (
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Patient
                  </Button>
                )}
                {organization?.type === "pharmacy" && (
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Check Webster Pack
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Record Medication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Organization Status */}
            {setupStatus.hasOrganization && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Organization Setup Complete</CardTitle>
                  <CardDescription>
                    Your organization is ready and active
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You&apos;ve successfully completed your organization setup! You can now start managing 
                    patients, medications, and team members through your PillFlow dashboard.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Get Started
                    </Button>
                    <Button variant="outline" size="sm">
                      View Organization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bottom content area */}
          <div className="bg-muted/50 min-h-[200px] flex-1 rounded-xl md:min-h-min p-6">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">Ready to begin?</h3>
              <p className="text-sm">
                Your dashboard is set up and ready. Start managing your healthcare data efficiently with PillFlow.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
