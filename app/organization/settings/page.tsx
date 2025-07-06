"use client";

import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { 
  ChevronLeft,
  Save,
  CreditCard,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

interface Organization {
  _id: string;
  name: string;
  type: "pharmacy" | "gp_clinic" | "hospital" | "aged_care";
  contactPersonName: string;
  phoneNumber: string;
  email: string;
  website?: string;
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  abn: string;
  accessToken: string;
}

export default function OrganizationSettingsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  
  // Queries
  const organization = useQuery(api.users.getOrganization) as Organization | null;
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const organizationWithSubscription = useQuery(api.polar.getOrganizationWithSubscription);
  const products = useQuery(api.polar.getConfiguredProducts);
  const allProducts = useQuery(api.polar.listAllProducts);
  
  // Mutations
  const updateOrganization = useMutation(api.users.updateOrganization);
  
  // Actions
  const generateCheckoutLink = useAction(api.polar.generateCheckoutLink);
  const generateCustomerPortalUrl = useAction(api.polar.generateCustomerPortalUrl);
  const cancelSubscription = useAction(api.polar.cancelCurrentSubscription);
  const syncProducts = useAction(api.polar.syncProducts);
  const testPolarConnection = useAction(api.polar.testPolarConnection);
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editedOrg, setEditedOrg] = useState<Partial<Organization>>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (organization) {
      setEditedOrg(organization);
    }
  }, [organization]);

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

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need to be an owner or admin to edit organization settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/organization">
                Back to Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateOrganization({
        name: editedOrg.name!,
        type: editedOrg.type!,
        contactPersonName: editedOrg.contactPersonName!,
        phoneNumber: editedOrg.phoneNumber!,
        email: editedOrg.email!,
        website: editedOrg.website,
        streetAddress: editedOrg.streetAddress!,
        suburb: editedOrg.suburb!,
        state: editedOrg.state!,
        postcode: editedOrg.postcode!,
        abn: editedOrg.abn!,
      });
      
      setSuccess("Organization updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to update organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSubscription = async () => {
    try {
      setIsSubmitting(true);
      
      // Get product ID - try configured products first, then all products
      let productId: string | null = null;
      
      if (products?.standard?.id) {
        productId = products.standard.id;
      } else if (allProducts && allProducts.length > 0) {
        // Use the first available product if configured products don't work
        productId = allProducts[0].id;
      }
      
      if (!productId) {
        throw new Error("No products available. Please contact support.");
      }
      
      const checkoutUrl = await generateCheckoutLink({ 
        productIds: [productId],
        origin: window.location.origin,
        successUrl: window.location.origin + '/organization/settings'
      });
      window.open(checkoutUrl.url, '_blank');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to generate checkout link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsSubmitting(true);
      const portalUrl = await generateCustomerPortalUrl();
      window.open(portalUrl.url, '_blank');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to open customer portal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await cancelSubscription({ revokeImmediately: false });
      setSuccess("Subscription canceled successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to cancel subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncProducts = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      console.log("Starting product sync...");
      const result = await syncProducts();
      console.log("Sync result:", result);
      setSuccess("Products synced successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      console.error("Sync error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sync products";
      setError(`Sync failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      console.log("Testing Polar connection...");
      const result = await testPolarConnection();
      console.log("Test result:", result);
      
      if (result.success) {
        setSuccess(`Connection successful! Found ${result.productCount} products.`);
      } else {
        setError(`Connection failed: ${result.error}`);
      }
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
    } catch (error: unknown) {
      console.error("Test error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to test connection";
      setError(`Test failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
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
                <BreadcrumbItem>
                  <BreadcrumbLink href="/organization">Organization</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
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
                    <h1 className="text-2xl font-bold">Organization Settings</h1>
                    <p className="text-muted-foreground">
                      Manage your organization&apos;s information and contact details
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

        {/* Subscription Management - Only for Organization Owners */}
        {userProfile?.role === "owner" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Management
              </CardTitle>
              <CardDescription>
                Manage your organization&apos;s subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizationWithSubscription?.subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                                             <div>
                         <h3 className="font-semibold">Current Plan</h3>
                         <p className="text-sm text-muted-foreground">
                           {organizationWithSubscription.subscription.productKey || 'Standard'}
                         </p>
                       </div>
                      <Badge variant="secondary">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleManageSubscription}
                        disabled={isSubmitting}
                        variant="outline"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </Button>
                      <Button 
                        onClick={handleCancelSubscription}
                        disabled={isSubmitting}
                        variant="destructive"
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                                         <div>
                       <h3 className="font-semibold">No Active Subscription</h3>
                       <p className="text-sm text-muted-foreground">
                         Subscribe to the Standard plan to access premium features for your organization
                       </p>
                     </div>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={handleStartSubscription}
                        disabled={isSubmitting || (!products?.standard && (!allProducts || allProducts.length === 0))}
                        className="w-full"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Start Subscription
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {!products?.standard && (
                          <Button 
                            onClick={handleSyncProducts}
                            disabled={isSubmitting}
                            variant="outline"
                            size="sm"
                          >
                            Sync Products
                          </Button>
                        )}
                        <Button 
                          onClick={handleTestConnection}
                          disabled={isSubmitting}
                          variant="outline"
                          size="sm"
                        >
                          Test Connection
                        </Button>
                      </div>
                    </div>
                    
                                         {/* Pricing info */}
                     {products?.standard ? (
                       <div className="text-sm text-muted-foreground">
                         Standard - ${(products.standard.prices[0]?.priceAmount || 0) / 100}/month
                       </div>
                     ) : allProducts && allProducts.length > 0 ? (
                       <div className="text-sm text-muted-foreground">
                         {allProducts[0].name} - ${(allProducts[0].prices[0]?.priceAmount || 0) / 100}/month
                       </div>
                     ) : (
                       <div className="text-sm text-muted-foreground">
                         Loading product information...
                       </div>
                     )}
                     
                     {/* Temporary debug info to help diagnose the issue */}
                     <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                       <div><strong>Debug Info:</strong></div>
                       <div>Products loaded: {products ? 'Yes' : 'No'}</div>
                       <div>Standard product: {products?.standard ? 'Found' : 'Not found'}</div>
                       <div>All products count: {allProducts ? allProducts.length : 'Loading'}</div>
                       {allProducts && allProducts.length > 0 && (
                         <div>First product: {allProducts[0].name} (ID: {allProducts[0].id})</div>
                       )}
                       <div>Expected ID: 5e14210e-3208-4167-8cd6-d83825c60484</div>
                     </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>
              Update your organization&apos;s basic information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateOrganization} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={editedOrg.name || ""}
                    onChange={(e) => setEditedOrg({...editedOrg, name: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select 
                    value={editedOrg.type} 
                    onValueChange={(value: "pharmacy" | "gp_clinic" | "hospital" | "aged_care") => setEditedOrg({...editedOrg, type: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="gp_clinic">GP Clinic</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="aged_care">Aged Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={editedOrg.contactPersonName || ""}
                    onChange={(e) => setEditedOrg({...editedOrg, contactPersonName: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={editedOrg.phoneNumber || ""}
                    onChange={(e) => setEditedOrg({...editedOrg, phoneNumber: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedOrg.email || ""}
                    onChange={(e) => setEditedOrg({...editedOrg, email: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={editedOrg.website || ""}
                    onChange={(e) => setEditedOrg({...editedOrg, website: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={editedOrg.streetAddress || ""}
                  onChange={(e) => setEditedOrg({...editedOrg, streetAddress: e.target.value})}
                  required
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="suburb">Suburb *</Label>
                  <Input
                    id="suburb"
                    value={editedOrg.suburb || ""}
                    onChange={(e) => setEditedOrg({...editedOrg, suburb: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select 
                    value={editedOrg.state} 
                    onValueChange={(value) => setEditedOrg({...editedOrg, state: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NSW">NSW</SelectItem>
                      <SelectItem value="VIC">VIC</SelectItem>
                      <SelectItem value="QLD">QLD</SelectItem>
                      <SelectItem value="WA">WA</SelectItem>
                      <SelectItem value="SA">SA</SelectItem>
                      <SelectItem value="TAS">TAS</SelectItem>
                      <SelectItem value="ACT">ACT</SelectItem>
                      <SelectItem value="NT">NT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={editedOrg.postcode || ""}
                    onChange={(e) => setEditedOrg({...editedOrg, postcode: e.target.value})}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abn">ABN *</Label>
                <Input
                  id="abn"
                  value={editedOrg.abn || ""}
                  onChange={(e) => setEditedOrg({...editedOrg, abn: e.target.value})}
                  required
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/organization">
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 