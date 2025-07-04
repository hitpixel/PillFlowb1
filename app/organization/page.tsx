"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { 
  Building2, 
  Users, 
  Link as LinkIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Shield,
  Crown,
  Eye,
  Settings,
  UserPlus,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  aphraRegistrationNumber?: string;
  healthcareProfessionalType?: string;
  role: "owner" | "admin" | "member" | "viewer";
  createdAt: number;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "owner": return <Crown className="w-4 h-4" />;
    case "admin": return <Shield className="w-4 h-4" />;
    case "member": return <Users className="w-4 h-4" />;
    case "viewer": return <Eye className="w-4 h-4" />;
    default: return <Users className="w-4 h-4" />;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "owner": return "bg-purple-100 text-purple-800";
    case "admin": return "bg-blue-100 text-blue-800";
    case "member": return "bg-green-100 text-green-800";
    case "viewer": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function OrganizationOverviewPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  
  // Queries
  const organization = useQuery(api.users.getOrganization) as Organization | null;
  const members = useQuery(api.users.getOrganizationMembers) as Member[];
  const invitations = useQuery(api.users.getPendingInvitations);
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  
  // State
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  
  // Mutations
  const inviteUser = useMutation(api.users.inviteUserToOrganization);
  const sendTestEmail = useMutation(api.emails.sendTestEmail);

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



  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      setInviteError("Please enter a valid email address");
      return;
    }
    
    setIsInviting(true);
    setInviteError(null);
    
    try {
      await inviteUser({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      
      setSuccess(`Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
      setInviteRole("member");
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send invitation";
      setInviteError(errorMessage);
    } finally {
      setIsInviting(false);
    }
  };

  const handleTestEmail = async () => {
    if (!inviteEmail.trim()) {
      setInviteError("Please enter an email address to test");
      return;
    }
    
    setIsInviting(true);
    setInviteError(null);
    
    try {
      const result = await sendTestEmail({
        testEmail: inviteEmail.trim(),
      });
      
      if (result.success) {
        setSuccess(`Test email sent to ${inviteEmail}! Check your inbox.`);
      } else {
        setInviteError(`Test email failed: ${result.error}`);
      }
      setTimeout(() => setSuccess(null), 5000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send test email";
      setInviteError(errorMessage);
    } finally {
      setIsInviting(false);
    }
  };

  const canEdit = userProfile?.role === "owner" || userProfile?.role === "admin";

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
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Organization</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="max-w-6xl mx-auto space-y-6 w-full">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{organization.name}</h1>
                    <p className="text-muted-foreground capitalize">
                      {organization.type.replace('_', ' ')} • {organization.suburb}, {organization.state}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getRoleBadgeColor(userProfile?.role || "member")}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(userProfile?.role || "member")}
                      <span className="capitalize">{userProfile?.role || "member"}</span>
                    </div>
                  </Badge>
                  {canEdit && (
                    <Button asChild variant="outline">
                      <Link href="/organization/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members?.length || 0}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Active members
                </p>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/organization/members">
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invitations?.length || 0}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Waiting to join
                </p>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/organization/members">
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partnerships</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Active partnerships
                </p>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/organization/partnerships">
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organization Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>
                Basic details about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{organization.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {organization.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{organization.phoneNumber}</p>
                  <p className="text-sm text-muted-foreground">Phone</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{organization.email}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>
              
              {organization.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{organization.website}</p>
                    <p className="text-sm text-muted-foreground">Website</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">
                    {organization.streetAddress}<br />
                    {organization.suburb}, {organization.state} {organization.postcode}
                  </p>
                  <p className="text-sm text-muted-foreground">Address</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Invite new members to join your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  🔐 Secure Invitation System
                </p>
                <p className="text-sm text-blue-700">
                  All team members must be invited via email for security. 
                  Use the invite form below to send secure invitation links to new team members.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Invite New Member */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle>Invite New Member</CardTitle>
                <CardDescription>
                  Send an invitation to add a new team member to your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Email Address *</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        disabled={isInviting}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="inviteRole">Role *</Label>
                      <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as "admin" | "member" | "viewer")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer - View only access</SelectItem>
                          <SelectItem value="member">Member - Standard access</SelectItem>
                          <SelectItem value="admin">Admin - Full management access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {inviteError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                      <p className="font-medium">Error:</p>
                      <p>{inviteError}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isInviting} className="flex-1 md:flex-none">
                      {isInviting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending Invitation...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={isInviting}
                      onClick={handleTestEmail}
                      className="px-4"
                    >
                      Test Email
                    </Button>
                  </div>
                </form>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The invited user will receive an email with instructions to join your organization. 
                    They can also create a new account using the invitation link if they don&apos;t have one.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common organization management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/organization/members">
                  <Users className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="font-medium">Manage Team</div>
                    <div className="text-sm text-muted-foreground">Add or remove members</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/organization/partnerships">
                  <LinkIcon className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="font-medium">Partnerships</div>
                    <div className="text-sm text-muted-foreground">Connect with other organizations</div>
                  </div>
                </Link>
              </Button>
              
              {canEdit && (
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Link href="/organization/settings">
                    <Settings className="w-6 h-6 text-primary" />
                    <div className="text-center">
                      <div className="font-medium">Settings</div>
                      <div className="text-sm text-muted-foreground">Update organization details</div>
                    </div>
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 