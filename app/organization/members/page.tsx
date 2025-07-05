"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { 
  Users, 
  UserPlus,
  Trash2,
  Copy,
  Shield,
  Crown,
  Eye,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Invitation {
  _id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  inviteToken: string;
  createdAt: number;
  expiresAt: number;
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

export default function OrganizationMembersPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  
  // Queries
  const organization = useQuery(api.users.getOrganization);
  const members = useQuery(api.users.getOrganizationMembers) as Member[];
  const invitations = useQuery(api.users.getPendingInvitations) as Invitation[];
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  
  // Mutations
  const createInvitation = useMutation(api.users.createMemberInvitation);
  const updateMemberRole = useMutation(api.users.updateMemberRole);
  const removeMember = useMutation(api.users.removeMember);
  const cancelInvitation = useMutation(api.users.cancelInvitation);
  const sendDirectInvitationEmail = useMutation(api.emails.sendInvitationEmailDirect);
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Invitation state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [createdInvite, setCreatedInvite] = useState<{token: string; email: string} | null>(null);
  const [isEmailSending, setIsEmailSending] = useState(false);

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

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      setError("Please enter an email address");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createInvitation({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      
      setCreatedInvite({
        token: result.inviteToken,
        email: inviteEmail.trim(),
      });
      
      setInviteEmail("");
      setInviteRole("member");
      setSuccess(`Invitation created for ${inviteEmail}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: "admin" | "member" | "viewer") => {
    try {
      await updateMemberRole({ memberId: memberId as Id<"userProfiles">, role: newRole });
      setSuccess("Member role updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to update member role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }
    
    try {
      await removeMember({ memberId: memberId as Id<"userProfiles"> });
      setSuccess("Member removed successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }
    
    try {
      await cancelInvitation({ invitationId: invitationId as Id<"memberInvitations"> });
      setSuccess("Invitation canceled successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to cancel invitation");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleSendDirectEmail = async () => {
    if (!createdInvite) {
      setError("Please create an invitation first");
      return;
    }

    if (!organization || !userProfile) {
      setError("Organization or user profile not found");
      return;
    }
    
    setIsEmailSending(true);
    setError(null);
    
    try {
      console.log("🚀 Sending direct invitation email...");
      const result = await sendDirectInvitationEmail({
        inviteEmail: createdInvite.email,
        organizationName: organization.name,
        inviterName: `${userProfile.firstName} ${userProfile.lastName}`,
        inviteToken: createdInvite.token,
      });
      
      if (result.success) {
        setSuccess(`✅ Email sent successfully to ${createdInvite.email}! Email ID: ${result.emailId}`);
        console.log("✅ Direct email sent successfully:", result);
      } else {
        setError(`❌ Failed to send email: ${result.error}`);
        console.error("❌ Direct email failed:", result);
      }
      
      setTimeout(() => setSuccess(null), 7000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send email";
      setError(`❌ Email sending failed: ${errorMessage}`);
      console.error("❌ Direct email error:", error);
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleQuickSendEmail = async () => {
    if (!inviteEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!organization || !userProfile) {
      setError("Organization or user profile not found");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("🚀 Quick send: Creating invitation and sending email...");
      
      // First create the invitation
      const inviteResult = await createInvitation({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      
      // Then send the email directly
      const emailResult = await sendDirectInvitationEmail({
        inviteEmail: inviteEmail.trim(),
        organizationName: organization.name,
        inviterName: `${userProfile.firstName} ${userProfile.lastName}`,
        inviteToken: inviteResult.inviteToken,
      });
      
      if (emailResult.success) {
        setSuccess(`✅ Invitation created and email sent to ${inviteEmail}! Email ID: ${emailResult.emailId}`);
        setInviteEmail("");
        setInviteRole("member");
        console.log("✅ Quick send successful:", emailResult);
      } else {
        // Even if email fails, we still created the invitation
        setCreatedInvite({
          token: inviteResult.inviteToken,
          email: inviteEmail.trim(),
        });
        setError(`⚠️ Invitation created but email failed: ${emailResult.error}`);
        setInviteEmail("");
        setInviteRole("member");
        console.error("❌ Quick send email failed:", emailResult);
      }
      
      setTimeout(() => setSuccess(null), 7000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create invitation or send email";
      setError(`❌ Quick send failed: ${errorMessage}`);
      console.error("❌ Quick send error:", error);
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
                  <BreadcrumbPage>Team Members</BreadcrumbPage>
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
                    <h1 className="text-2xl font-bold">Team Members</h1>
                    <p className="text-muted-foreground">
                      Manage your organization&apos;s team members and their roles
                    </p>
                  </div>
                </div>
                <Badge className={getRoleBadgeColor(userProfile?.role || "member")}>
                  <div className="flex items-center gap-1">
                    {getRoleIcon(userProfile?.role || "member")}
                    <span className="capitalize">{userProfile?.role || "member"}</span>
                  </div>
                </Badge>
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

        {/* Current Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({members?.length || 0})</CardTitle>
            <CardDescription>
              Current members of your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members?.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-medium text-primary">
                        {member.firstName[0]}{member.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      {member.healthcareProfessionalType && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.healthcareProfessionalType.replace('_', ' ')}
                          {member.aphraRegistrationNumber && ` • ${member.aphraRegistrationNumber}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(member.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </Badge>
                    
                    {canEdit && member.role !== "owner" && member._id !== userProfile?._id && (
                      <div className="flex gap-1">
                        <Select
                          value={member.role}
                          onValueChange={(value: "admin" | "member" | "viewer") => handleUpdateRole(member._id, value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  🔐 Secure Invitation System
                </p>
                <p className="text-sm text-blue-700">
                  All team members must be invited via email for security. 
                  Use the invite form below to send secure invitation links to new team members.
                </p>
              </div>
              
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter email address"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Select value={inviteRole} onValueChange={(value: "admin" | "member" | "viewer") => setInviteRole(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer - View only access</SelectItem>
                    <SelectItem value="member">Member - Standard access</SelectItem>
                    <SelectItem value="admin">Admin - Full management access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Button onClick={handleInviteMember} disabled={isSubmitting} variant="outline">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Invitation
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleQuickSendEmail} 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Quick Send Email
                    </>
                  )}
                </Button>
              </div>
              
              {createdInvite && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800 mb-2">Invitation Created!</p>
                  <p className="text-sm text-green-700 mb-3">
                    Choose how to share this invitation with {createdInvite.email}:
                  </p>
                  
                  <div className="space-y-3">
                    {/* Token copy option */}
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-2">Option 1: Copy Token</p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={createdInvite.token}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(createdInvite.token)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Send this token to the user manually. They can enter it at the signup page.
                      </p>
                    </div>
                    
                    {/* Email sending option */}
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-2">Option 2: Send Email</p>
                      <Button
                        onClick={handleSendDirectEmail}
                        disabled={isEmailSending}
                        className="w-full"
                      >
                        {isEmailSending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending Email...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Send Email to {createdInvite.email}
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-600 mt-1">
                        Send the invitation directly to the user&apos;s email address using our improved email system.
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-green-600 mt-3">
                    This invitation expires in 7 days
                  </p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Three ways to invite users:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li><strong>• Quick Send Email:</strong> Creates invitation and sends email immediately</li>
                  <li><strong>• Create Invitation:</strong> Generate token first, then choose copy or email</li>
                  <li><strong>• Manual sharing:</strong> Copy token and share via SMS, phone, or in-person</li>
                </ul>
                <p className="text-sm text-blue-700 mt-2">
                  The user can create a new account using the invitation token if they don&apos;t have one.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Invitations */}
        {canEdit && invitations && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
              <CardDescription>
                Invitations waiting to be accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div key={invitation._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Role: <span className="capitalize">{invitation.role}</span> • 
                        Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Pending</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(invitation.inviteToken)}
                        title="Copy invitation token"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Cancel invitation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 