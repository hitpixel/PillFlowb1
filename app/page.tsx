"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { Activity, Users, Plus, TrendingUp, AlertTriangle, Pill, Shield, CheckCircle, XCircle, ChevronDown, ChevronRight, BarChart3 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { AuroraCard } from "@/components/ui/aurora-card";
import { motion } from "motion/react";



export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const setupStatus = useQuery(api.users.getSetupStatus);
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const organization = useQuery(api.users.getOrganization);
  const patientStats = useQuery(api.patients.getPatientStats);
  const medicationStats = useQuery(api.patients.getMedicationStats);
  const websterStats = useQuery(api.websterPacks.getWebsterCheckStats);
  const router = useRouter();
  const [featuresOpen, setFeaturesOpen] = useState(false);

  // Prepare chart data based on real data
  const patientGrowthData = patientStats?.monthlyData || [];
  const medicationData = medicationStats?.monthlyData || [];
  
  // Generate compliance data (placeholder for now, can be enhanced with real compliance tracking)
  const complianceData = patientStats?.monthlyData?.map((item, index) => ({
    month: item.month,
    rate: patientStats.totalPatients > 0 ? Math.min(85 + (index * 2), 95) : 0, // Simulate improving compliance over time
  })) || [];
  
  // Generate alert/check data based on Webster stats and organization type
  const alertData = patientStats?.monthlyData?.map((item, index) => ({
    month: item.month,
    alerts: organization?.type === "pharmacy" ? 
      (websterStats?.totalChecks || 0) > 0 ? Math.max(0, 5 - index) : 0 : // Simulate decreasing alerts over time for pharmacy
      patientStats.totalPatients > 0 ? Math.max(0, 3 - index) : 0, // Simulate general alerts for other org types
  })) || [];

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
        
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold leading-tight" style={{color: '#000000'}}>
              Welcome back{userProfile ? `, ${userProfile.firstName}` : ""} 👋
            </h1>
            <p className="text-lg mt-2" style={{color: '#000000'}}>
              Here&apos;s your healthcare management overview
            </p>
          </div>

          {/* Feature Access Indicator */}
          {organization && (
            <Collapsible open={featuresOpen} onOpenChange={setFeaturesOpen}>
              <Card>
                <CardHeader>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2 -m-2 transition-colors">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle style={{color: '#000000'}}>
                          {organization.type === "pharmacy" ? "Pharmacy" : 
                           organization.type === "gp_clinic" ? "GP Clinic" :
                           organization.type === "hospital" ? "Hospital" : 
                           "Aged Care"} Dashboard Features
                        </CardTitle>
                      </div>
                      {featuresOpen ? (
                        <ChevronDown className="h-4 w-4" style={{color: '#000000'}} />
                      ) : (
                        <ChevronRight className="h-4 w-4" style={{color: '#000000'}} />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CardDescription style={{color: '#000000'}}>
                    Your organization type determines which features are available
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
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
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Quick Stats */}
          <div className="grid auto-rows-min gap-6 md:grid-cols-4">
            <Card className="border hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold" style={{color: '#000000'}}>Total Patients</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold" style={{color: '#000000'}}>
                  {patientStats?.totalPatients ?? 0}
                </div>
                <div className="h-[60px] w-full relative overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={patientGrowthData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <Area 
                        type="monotone" 
                        dataKey="cumulativePatients" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm" style={{color: '#000000'}}>
                  {patientStats?.patientsThisMonth ? `+${patientStats.patientsThisMonth} this month` : "No new patients this month"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold" style={{color: '#000000'}}>Active Medications</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold" style={{color: '#000000'}}>
                  {medicationStats?.totalMedications ?? 0}
                </div>
                <div className="h-[60px] w-full relative overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={medicationData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeMedications" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm" style={{color: '#000000'}}>
                  {medicationStats?.medicationsThisMonth ? `+${medicationStats.medicationsThisMonth} this month` : "No new medications this month"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold" style={{color: '#000000'}}>Compliance Rate</CardTitle>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold" style={{color: '#000000'}}>--</div>
                <div className="h-[60px] w-full relative overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={complianceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm" style={{color: '#000000'}}>
                  No data available
                </p>
              </CardContent>
            </Card>
            
            <Card className="border hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold" style={{color: '#000000'}}>
                  {organization?.type === "pharmacy" ? "Pack Checks" : "Alerts"}
                </CardTitle>
                <div className="p-2 bg-red-50 rounded-lg">
                  {organization?.type === "pharmacy" ? (
                    <Shield className="h-5 w-5 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold" style={{color: '#000000'}}>
                  {organization?.type === "pharmacy" ? (websterStats?.totalChecks ?? 0) : 0}
                </div>
                <div className="h-[60px] w-full relative overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={alertData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <Area 
                        type="monotone" 
                        dataKey="alerts" 
                        stroke="#EF4444" 
                        fill="#EF4444" 
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm" style={{color: '#000000'}}>
                  {organization?.type === "pharmacy" 
                    ? (websterStats?.todayChecks ? `${websterStats.todayChecks} today` : "No checks today")
                    : "No active alerts"
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card className="border">
              <CardHeader>
                <CardTitle style={{color: '#000000'}}>Quick Actions</CardTitle>
                <CardDescription style={{color: '#000000'}}>
                  Common tasks to get you started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {organization?.type === "pharmacy" && (
                  <Button variant="outline" className="w-full justify-start h-12 text-left">
                    <Plus className="mr-2 h-5 w-5" />
                    <span style={{color: '#000000'}}>Add New Patient</span>
                  </Button>
                )}
                {organization?.type === "pharmacy" && (
                  <Button variant="outline" className="w-full justify-start h-12 text-left">
                    <Shield className="mr-2 h-5 w-5" />
                    <span style={{color: '#000000'}}>Check Webster Pack</span>
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start h-12 text-left">
                  <Activity className="mr-2 h-5 w-5" />
                  <span style={{color: '#000000'}}>Record Medication</span>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 text-left">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  <span style={{color: '#000000'}}>View Reports</span>
                </Button>
              </CardContent>
            </Card>

            {/* Organization Status */}
            {setupStatus.hasOrganization && (
              <Card className="border">
                <CardHeader>
                  <CardTitle style={{color: '#000000'}}>Organisation Setup Complete</CardTitle>
                  <CardDescription style={{color: '#000000'}}>
                    Your organisation is ready and active
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm" style={{color: '#000000'}}>
                    You&apos;ve successfully completed your organisation setup! You can now start managing 
                    patients, medications, and team members through your PillFlow dashboard.
                  </p>
                  <div className="flex gap-3">
                    <Button size="sm" className="h-10">
                      <Plus className="mr-2 h-4 w-4" />
                      Get Started
                    </Button>
                    <Button variant="outline" size="sm" className="h-10">
                      <span style={{color: '#000000'}}>View Organisation</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Support Card with Aurora Background */}
            <AuroraCard className="hover:shadow-lg transition-all duration-200">
              <motion.div
                initial={{ opacity: 0.0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.6,
                  ease: "easeInOut",
                }}
                className="p-6 h-full flex flex-col"
              >
                <div className="space-y-2 flex-1 pb-8">
                  <h3 className="text-lg font-semibold" style={{color: '#000000'}}>
                    We&apos;re here to support you.
                  </h3>
                  <p className="text-sm text-muted-foreground" style={{color: '#000000'}}>
                    Have a question, need technical assistance, or want to provide feedback? Our team is just a message away.
                  </p>
                </div>
                <div className="space-y-3 flex-none">
                  <Button variant="outline" className="w-full h-12 bg-white/80 backdrop-blur-sm hover:bg-white/90 font-semibold">
                    <span style={{color: '#000000'}}>Contact Support</span>
                  </Button>
                  <Button variant="outline" className="w-full h-12 bg-white/80 backdrop-blur-sm hover:bg-white/90 font-semibold">
                    <span style={{color: '#000000'}}>Book a Call</span>
                  </Button>
                </div>
              </motion.div>
            </AuroraCard>
          </div>

          {/* Bottom content area */}
          <div className="bg-gray-50 min-h-[200px] flex-1 rounded-xl md:min-h-min p-8 border">
            <div className="text-center">
              <div className="mb-4">
                <BarChart3 className="h-16 w-16 mx-auto text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{color: '#000000'}}>Ready to begin?</h3>
              <p className="text-base" style={{color: '#000000'}}>
                Your dashboard is set up and ready. Start managing your healthcare data efficiently with PillFlow.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
