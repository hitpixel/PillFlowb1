"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
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

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  
  // Get user profile and setup status
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const setupStatus = useQuery(api.users.getSetupStatus);
  
  // Mutation to send welcome email
  const sendWelcomeEmail = useMutation(api.users.sendWelcomeEmailOnDashboard);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && setupStatus?.needsSetup) {
      router.push("/setup");
    }
  }, [isAuthenticated, isLoading, setupStatus, router]);

  useEffect(() => {
    // Send welcome email on first dashboard visit
    if (isAuthenticated && userProfile && !userProfile.welcomeEmailSent) {
      sendWelcomeEmail()
        .then((result) => {
          if (result?.success) {
            console.log("Welcome email sent successfully");
          }
        })
        .catch((error) => {
          console.error("Failed to send welcome email:", error);
        });
    }
  }, [isAuthenticated, userProfile, sendWelcomeEmail]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
        </div>
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
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Welcome Message */}
          {userProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to PillFlow, {userProfile.firstName}!</CardTitle>
                <CardDescription>
                  Your healthcare medication management dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {userProfile.welcomeEmailSent ? 
                    "Check your email for your welcome message and getting started guide." :
                    "We're preparing your welcome email with getting started information."
                  }
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Dashboard Content */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Quick action items will appear here
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recent activity will appear here
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Important alerts and messages</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notifications will appear here
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Main Dashboard</CardTitle>
              <CardDescription>Your medication management workspace</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              <p className="text-sm text-muted-foreground">
                Main dashboard content will appear here
              </p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
