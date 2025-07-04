"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Building2, GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressSteps } from "@/components/ui/progress-steps";

type SetupStep = "profile" | "choice" | "create";

function ProgressIndicator({ steps, currentStep, completedSteps }: { 
  steps: { id: string; name: string; description: string }[];
  currentStep: string;
  completedSteps: string[];
}) {
  return (
    <div className="mb-6">
      <ProgressSteps steps={steps} currentStep={currentStep} completedSteps={completedSteps} />
    </div>
  );
}

export default function SetupPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const setupStatus = useQuery(api.users.getSetupStatus);
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const updateUserProfile = useMutation(api.users.updateUserProfile);
  const createOrganization = useMutation(api.users.createOrganization);
  
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>("profile");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrgData, setCreatedOrgData] = useState<{name: string} | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/signin");
        return;
      }
      
      if (setupStatus && !setupStatus.needsSetup) {
        router.push("/dashboard");
        return;
      }

      // Determine which step to show based on setup status
      if (setupStatus && setupStatus.needsProfileCompletion) {
        setCurrentStep("profile");
      } else if (setupStatus && setupStatus.hasProfile && !setupStatus.hasOrganization) {
        setCurrentStep("choice");
      }
    }
  }, [isAuthenticated, isLoading, setupStatus, router]);

  const getSteps = () => [
    { id: "profile", name: "Profile", description: "Complete your professional details" },
    { id: "choice", name: "Setup", description: "Choose organization path" },
    { id: "create", name: "Organization", description: "Create your organization" },
  ];

  const getCompletedSteps = () => {
    if (currentStep === "profile") return [];
    if (currentStep === "choice") return ["profile"];
    if (currentStep === "create") return ["profile", "choice"];
    return ["profile", "choice", "create"];
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await updateUserProfile({
        phoneNumber: formData.get("phoneNumber") as string,
        aphraRegistrationNumber: formData.get("aphraRegistrationNumber") as string,
        healthcareProfessionalType: formData.get("healthcareProfessionalType") as "pharmacist" | "general_practitioner" | "nurse" | "administration" | "aged_care_worker" | "specialist" | "other",
      });
      setCurrentStep("choice");
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await createOrganization({
        name: formData.get("name") as string,
        type: formData.get("type") as "pharmacy" | "gp_clinic" | "hospital" | "aged_care",
        contactPersonName: formData.get("contactPersonName") as string,
        phoneNumber: formData.get("phoneNumber") as string,
        email: formData.get("email") as string,
        website: formData.get("website") as string || undefined,
        streetAddress: formData.get("streetAddress") as string,
        suburb: formData.get("suburb") as string,
        state: formData.get("state") as string,
        postcode: formData.get("postcode") as string,
        abn: formData.get("abn") as string,
      });
      
      setCreatedOrgData({
        name: formData.get("name") as string,
      });
      
      // Show success for a moment then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen for created organization
  if (createdOrgData) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-8">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              PillFlow
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <Card>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl text-green-600">🎉 Success!</CardTitle>
                  <CardDescription>
                    Your organization has been successfully created
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="font-medium">{createdOrgData.name}</p>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                      <p className="text-sm text-green-800 mb-2">
                        <strong>Organization created successfully!</strong>
                      </p>
                      <p className="text-sm text-green-700">
                        You can now invite team members from your organization dashboard.
                      </p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Redirecting to dashboard in a few seconds...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 relative hidden lg:block"></div>
      </div>
    );
  }

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

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Setup Form */}
      <div className="flex flex-col gap-2 p-4 md:p-6">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            PillFlow
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-2">
          <div className="w-full max-w-lg">
            <div className="text-center mb-4">
              <h1 className="text-xl font-bold">Complete Your Setup</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {currentStep === "profile" && "Complete your professional profile"}
                {currentStep === "choice" && "Set up your organization"}
                {currentStep === "create" && "Create your organization"}
              </p>
            </div>
            
            <ProgressIndicator 
              steps={getSteps()} 
              currentStep={currentStep} 
              completedSteps={getCompletedSteps()} 
            />

            {/* Step 1: Complete Profile */}
            {currentStep === "profile" && (
              <Card>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">Complete Your Profile</CardTitle>
                  <CardDescription className="text-sm">
                    Add your professional details to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-sm">First Name</Label>
                        <Input 
                          id="firstName"
                          name="firstName"
                          type="text"
                          value={userProfile?.firstName || ""}
                          disabled
                          className="bg-muted h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                        <Input 
                          id="lastName"
                          name="lastName"
                          type="text"
                          value={userProfile?.lastName || ""}
                          disabled
                          className="bg-muted h-9"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={userProfile?.email || ""}
                        disabled
                        className="bg-muted h-9"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="phoneNumber" className="text-sm">Phone Number *</Label>
                      <Input 
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="+61 4XX XXX XXX"
                        required
                        disabled={isSubmitting}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="aphraRegistrationNumber" className="text-sm">APHRA Registration *</Label>
                      <Input 
                        id="aphraRegistrationNumber"
                        name="aphraRegistrationNumber"
                        type="text"
                        placeholder="e.g., DEN0001234567"
                        required
                        disabled={isSubmitting}
                        className="h-9"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="healthcareProfessionalType" className="text-sm">Professional Type *</Label>
                      <Select name="healthcareProfessionalType" required>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Select your profession" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pharmacist">Pharmacist</SelectItem>
                          <SelectItem value="general_practitioner">General Practitioner</SelectItem>
                          <SelectItem value="nurse">Nurse</SelectItem>
                          <SelectItem value="administration">Administration</SelectItem>
                          <SelectItem value="aged_care_worker">Aged Care Worker</SelectItem>
                          <SelectItem value="specialist">Specialist</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
                        <p className="font-medium">Error:</p>
                        <p>{error}</p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-9"
                    >
                      {isSubmitting ? "Updating..." : "Continue"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Choice (simplified to only create organization) */}
            {currentStep === "choice" && (
              <Card>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">Create Your Organization</CardTitle>
                  <CardDescription className="text-sm">
                    Set up your healthcare organization to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Create Organization</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set up a new healthcare organization and invite your team members.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep("create")}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Looking to join an existing organization?</strong>
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Ask your organization administrator to send you an email invitation. 
                      You&apos;ll receive a secure link to join their organization.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Create Organization */}
            {currentStep === "create" && (
              <Card>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">Create Organization</CardTitle>
                  <CardDescription className="text-sm">
                    Provide details about your healthcare organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOrganization} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Organization Name *</Label>
                      <Input 
                        id="name"
                        name="name"
                        type="text"
                        placeholder="e.g., Central City Pharmacy"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Organization Type *</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pharmacy">Pharmacy</SelectItem>
                          <SelectItem value="gp_clinic">GP Clinic</SelectItem>
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="aged_care">Aged Care Facility</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactPersonName">Contact Person *</Label>
                        <Input 
                          id="contactPersonName"
                          name="contactPersonName"
                          type="text"
                          placeholder="Primary contact name"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input 
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          placeholder="+61 X XXXX XXXX"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          placeholder="contact@organization.com"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input 
                          id="website"
                          name="website"
                          type="url"
                          placeholder="https://organization.com"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="streetAddress">Street Address *</Label>
                      <Input 
                        id="streetAddress"
                        name="streetAddress"
                        type="text"
                        placeholder="123 Main Street"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="suburb">Suburb *</Label>
                        <Input 
                          id="suburb"
                          name="suburb"
                          type="text"
                          placeholder="Sydney"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Select name="state" required>
                          <SelectTrigger>
                            <SelectValue placeholder="State" />
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
                          name="postcode"
                          type="text"
                          placeholder="2000"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="abn">ABN *</Label>
                      <Input 
                        id="abn"
                        name="abn"
                        type="text"
                        placeholder="XX XXX XXX XXX"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                        <p className="font-medium">Error:</p>
                        <p>{error}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep("choice")}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? "Creating..." : "Create Organization"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side - Branding */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 relative hidden lg:block">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative flex flex-col justify-center h-full px-8 py-12 text-white">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-6">
              Healthcare Management Made Simple
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of healthcare professionals using PillFlow to streamline their medication management processes.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <span>Secure organization management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <span>Email-based team invitations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Building2 className="w-5 h-5" />
                </div>
                <span>Professional compliance tracking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 