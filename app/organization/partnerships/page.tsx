"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { 
  Link as LinkIcon, 
  Copy,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

export default function OrganizationPartnershipsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  
  // Queries
  const organization = useQuery(api.users.getOrganization);
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  
  // Mutations
  const createPartnership = useMutation(api.users.createPartnership);
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Partnership state
  const [partnershipType, setPartnershipType] = useState<"data_sharing" | "referral_network" | "merger">("data_sharing");
  const [partnershipNotes, setPartnershipNotes] = useState("");
  const [createdPartnership, setCreatedPartnership] = useState<{token: string; type: string} | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No Organization Found</CardTitle>
            <CardDescription>
              You need to be part of an organization to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/setup")}
              className="w-full"
            >
              Join or Create Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = userProfile?.role === "owner" || userProfile?.role === "admin";

  const handleCreatePartnership = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createPartnership({
        partnershipType,
        notes: partnershipNotes || undefined,
      });
      
      setCreatedPartnership({
        token: result.partnershipToken,
        type: partnershipType,
      });
      
      setPartnershipNotes("");
      setSuccess("Partnership invitation created!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create partnership");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(null), 2000);
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
                <BreadcrumbItem>
                  <BreadcrumbLink href="/organization">Organization</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Partnerships</BreadcrumbPage>
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
                  <Button asChild variant="outline" size="sm">
                    <Link href="/organization">
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold">Partnerships</h1>
                    <p className="text-muted-foreground">
                      Create and manage partnerships with other organizations
                    </p>
                  </div>
                </div>
              </div>
            </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Create Partnership */}
        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle>Create Partnership</CardTitle>
              <CardDescription>
                Create a partnership invitation for another organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="partnershipType">Partnership Type</Label>
                <Select value={partnershipType} onValueChange={(value: "data_sharing" | "referral_network" | "merger") => setPartnershipType(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_sharing">Data Sharing</SelectItem>
                    <SelectItem value="referral_network">Referral Network</SelectItem>
                    <SelectItem value="merger">Merger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this partnership..."
                  value={partnershipNotes}
                  onChange={(e) => setPartnershipNotes(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
              
              <Button onClick={handleCreatePartnership} disabled={isSubmitting}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Create Partnership Token
              </Button>
              
              {createdPartnership && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800">Partnership Token Created!</p>
                  <p className="text-sm text-blue-700 mb-2">
                    Share this token with the partner organization:
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={createdPartnership.token}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdPartnership.token)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Partnership Type: {createdPartnership.type.replace('_', ' ')} • Expires in 30 days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Partnership Information */}
        <Card>
          <CardHeader>
            <CardTitle>Partnership Information</CardTitle>
            <CardDescription>
              Learn about different partnership types and their benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-blue-800">Data Sharing</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Securely share patient data and medication records between organizations for better care coordination.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-green-800">Referral Network</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Create a network for patient referrals and specialist consultations between healthcare providers.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-purple-800">Merger</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Combine organizations for shared resources, unified patient records, and streamlined operations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Partnerships (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Active Partnerships</CardTitle>
            <CardDescription>
              Your current organization partnerships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <LinkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No active partnerships yet. Create a partnership invitation to get started.
              </p>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 