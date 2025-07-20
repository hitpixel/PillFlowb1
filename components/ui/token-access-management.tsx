/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  UserCheck, 
  Clock, 
  Eye, 
  MessageSquare, 
  Pill,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  User,
  Mail
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TokenAccessManagementProps {
  patientId: string;
}

interface UserSearchResult {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  organizationType: string;
}

export function TokenAccessManagement({ patientId }: TokenAccessManagementProps) {
  const [isGranting, setIsGranting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [grantFormData, setGrantFormData] = useState({
    permissions: ["view"],
    expiresInDays: 7,
    neverExpires: false,
  });

  // Query for access grants
  const accessGrants = useQuery(api.patientManagement.getPatientAccessGrants, {
    patientId: patientId as Id<"patients">,
  });

  // Query for user search
  const userSearchResults = useQuery(
    api.users.searchUsers,
    searchQuery.trim() ? { searchTerm: searchQuery } : "skip"
  );

  // Mutations
  const revokeAccess = useMutation(api.patientManagement.revokeTokenAccess);
  const approveAccess = useMutation(api.patientManagement.approveTokenAccess);
  const denyAccess = useMutation(api.patientManagement.denyTokenAccess);
  const grantAccess = useMutation(api.patientManagement.grantTokenAccess);

  const handleGrantAccess = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to grant access");
      return;
    }

    if (grantFormData.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    try {
      setIsGranting(true);
      
      await grantAccess({
        patientId: patientId as Id<"patients">,
        grantedToUserId: selectedUser._id as Id<"userProfiles">,
        permissions: grantFormData.permissions as ("view" | "comment" | "view_medications")[],
        expiresInDays: grantFormData.neverExpires ? undefined : grantFormData.expiresInDays,
      });
      
      toast.success(`Access granted to ${selectedUser.firstName} ${selectedUser.lastName}`);
      
      // Reset form
      setSelectedUser(null);
      setSearchQuery("");
      setGrantFormData({
        permissions: ["view"],
        expiresInDays: 7,
        neverExpires: false,
      });
      
    } catch (error) {
      toast.error("Failed to grant access");
      console.error(error);
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevokeAccess = async (accessGrantId: string) => {
    try {
      await revokeAccess({
        accessGrantId: accessGrantId as Id<"tokenAccessGrants">,
      });
      toast.success("Access revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke access");
      console.error(error);
    }
  };

  const handleApproveAccess = async (accessGrantId: string) => {
    try {
      await approveAccess({
        accessGrantId: accessGrantId as Id<"tokenAccessGrants">,
        permissions: ["view", "comment", "view_medications"], // Default permissions
        expiresInDays: 7, // Default 7 days
      });
      toast.success("Access approved successfully");
    } catch (error) {
      toast.error("Failed to approve access");
      console.error(error);
    }
  };

  const handleDenyAccess = async (accessGrantId: string) => {
    try {
      await denyAccess({
        accessGrantId: accessGrantId as Id<"tokenAccessGrants">,
      });
      toast.success("Access denied");
    } catch (error) {
      toast.error("Failed to deny access");
      console.error(error);
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setGrantFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "view":
        return <Eye className="h-3 w-3" />;
      case "comment":
        return <MessageSquare className="h-3 w-3" />;
      case "view_medications":
        return <Pill className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case "view":
        return "View Patient";
      case "comment":
        return "Add Comments";
      case "view_medications":
        return "View Medications";
      default:
        return permission;
    }
  };

  const isExpired = (expiresAt?: number) => {
    return expiresAt && expiresAt < Date.now();
  };

  const getExpiryStatus = (expiresAt?: number) => {
    if (!expiresAt) return "Never expires";
    if (isExpired(expiresAt)) return "Expired";
    return `Expires ${formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Denied
          </Badge>
        );
      case "revoked":
        return (
          <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-800">
            <Trash2 className="h-3 w-3 mr-1" />
            Revoked
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUserDisplayName = (user: UserSearchResult) => {
    return `${user.firstName} ${user.lastName}`;
  };

  const getUserInitials = (user: UserSearchResult) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Token Access Management</h3>
        </div>
        <Badge variant="outline">
          {accessGrants?.filter((g: any) => g.status === "approved" && g.isActive).length || 0} Active Grants
        </Badge>
      </div>

      {/* Grant New Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Grant New Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Search User</Label>
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isSearchOpen}
                  className="w-full justify-between"
                >
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserDisplayName(selectedUser)}`} />
                        <AvatarFallback>{getUserInitials(selectedUser)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="text-sm font-medium">{getUserDisplayName(selectedUser)}</div>
                        <div className="text-xs text-muted-foreground">{selectedUser.email}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Search users by name or email...</span>
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {userSearchResults?.map((user: UserSearchResult) => (
                        <CommandItem
                          key={user._id}
                          value={`${user.firstName} ${user.lastName} ${user.email}`}
                          onSelect={() => {
                            setSelectedUser(user);
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserDisplayName(user)}`} />
                              <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{getUserDisplayName(user)}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                              <div className="text-xs text-muted-foreground">{user.organizationName} • {user.organizationType}</div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedUser && (
            <>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["view", "comment", "view_medications"].map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Switch
                        id={permission}
                        checked={grantFormData.permissions.includes(permission)}
                        onCheckedChange={() => handlePermissionToggle(permission)}
                      />
                      <Label htmlFor={permission} className="flex items-center gap-1 text-sm">
                        {getPermissionIcon(permission)}
                        {getPermissionLabel(permission)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Access Duration</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="neverExpires"
                    checked={grantFormData.neverExpires}
                    onCheckedChange={(checked: boolean) => setGrantFormData(prev => ({ ...prev, neverExpires: checked }))}
                  />
                  <Label htmlFor="neverExpires" className="text-sm">
                    Never expires
                  </Label>
                </div>
                
                {!grantFormData.neverExpires && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={grantFormData.expiresInDays}
                      onChange={(e) => setGrantFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleGrantAccess}
                disabled={isGranting || !selectedUser || grantFormData.permissions.length === 0}
                className="w-full"
              >
                {isGranting ? "Granting Access..." : `Grant Access to ${getUserDisplayName(selectedUser)}`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pending Access Requests */}
      {accessGrants?.some((grant: any) => grant.status === "pending") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Pending Access Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accessGrants
                ?.filter((grant: any) => grant.status === "pending")
                .map((grant: any) => (
                  <div key={grant._id} className="border rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">
                            {grant.grantedToUser?.firstName} {grant.grantedToUser?.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({grant.grantedToUser?.email})
                          </span>
                        </div>
                        <Badge variant="outline">
                          {grant.grantedToOrg?.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(grant.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveAccess(grant._id)}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDenyAccess(grant._id)}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Requested {formatDistanceToNow(new Date(grant.requestedAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Access Grants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Current Access Grants
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accessGrants?.filter((grant: any) => grant.status !== "pending").length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No access grants found</p>
              <p className="text-sm text-muted-foreground">
                Grant access to other users to share this patient's data
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {accessGrants
                ?.filter((grant: any) => grant.status !== "pending")
                .map((grant: any) => (
                  <div key={grant._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {grant.grantedToUser?.firstName} {grant.grantedToUser?.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({grant.grantedToUser?.email})
                          </span>
                        </div>
                        <Badge variant="outline">
                          {grant.grantedToOrg?.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(grant.status)}
                        {isExpired(grant.expiresAt) ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        ) : grant.status === "approved" ? (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : null}
                        {(grant.status === "approved" && grant.isActive) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeAccess(grant._id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {grant.permissions.map((permission: string) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {getPermissionIcon(permission)}
                              <span className="ml-1">{getPermissionLabel(permission)}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Access Details</p>
                        <div className="space-y-1">
                          <p className="text-xs">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {getExpiryStatus(grant.expiresAt)}
                          </p>
                          {grant.grantedAt && (
                            <p className="text-xs">
                              Granted {formatDistanceToNow(new Date(grant.grantedAt), { addSuffix: true })}
                            </p>
                          )}
                          {grant.status === "denied" && grant.deniedAt && (
                            <p className="text-xs text-red-600">
                              Denied {formatDistanceToNow(new Date(grant.deniedAt), { addSuffix: true })}
                            </p>
                          )}
                          {grant.status === "revoked" && grant.revokedAt && (
                            <p className="text-xs text-gray-600">
                              Revoked {formatDistanceToNow(new Date(grant.revokedAt), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Default Expiry:</strong> New access grants expire after 7 days by default. 
          Users with expired access will automatically lose access to patient data.
        </AlertDescription>
      </Alert>
    </div>
  );
}