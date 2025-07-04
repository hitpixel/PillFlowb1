"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { GalleryVerticalEnd, Building2, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SetupStep = "profile" | "choice" | "create" | "join";

interface ProgressStepProps {
  steps: { id: string; title: string; completed: boolean; current: boolean }[];
}

function ProgressIndicator({ steps }: ProgressStepProps) {
  return (
    <div className="flex items-center justify-center mb-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={cn(
            "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors text-xs",
            step.completed ? "bg-green-500 border-green-500 text-white" :
            step.current ? "border-primary bg-primary text-primary-foreground" :
            "border-muted-foreground text-muted-foreground"
          )}>
            {step.completed ? (
              <CheckCircle className="w-2.5 h-2.5" />
            ) : (
              <span className="font-medium text-xs">{index + 1}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "h-0.5 w-6 mx-1.5 transition-colors",
              step.completed ? "bg-green-500" : "bg-muted"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SetupPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const setupStatus = useQuery(api.users.getSetupStatus);
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const updateUserProfile = useMutation(api.users.updateUserProfile);
  const createOrganization = useMutation(api.users.createOrganization);
  const joinOrganization = useMutation(api.users.joinOrganization);
  
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>("profile");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchToken, setSearchToken] = useState<string>("");
  const [createdOrgData, setCreatedOrgData] = useState<{name: string; accessToken: string} | null>(null);

  // Query for organization search - only when we have a search token
  const findOrganization = useQuery(
    api.users.findOrganizationByToken, 
    searchToken.trim() ? { accessToken: searchToken.trim() } : "skip"
  );

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

  if (!isAuthenticated || !setupStatus.needsSetup) {
    return null;
  }

  const getSteps = () => {
    const steps = [
      { id: "profile", title: "Profile Details", completed: !setupStatus.needsProfileCompletion, current: currentStep === "profile" },
      { id: "choice", title: "Choose Option", completed: currentStep === "create" || currentStep === "join", current: currentStep === "choice" },
      { id: "setup", title: "Setup Organization", completed: false, current: currentStep === "create" || currentStep === "join" },
    ];
    return steps;
  };

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      const message = error.message.toLowerCase();
      
      // Profile-specific errors
      if (message.includes('phone')) {
        return "Please enter a valid phone number (e.g., +61 4XX XXX XXX).";
      }
      
      if (message.includes('aphra') || message.includes('registration')) {
        return "Please enter a valid APHRA registration number.";
      }
      
      if (message.includes('professional type') || message.includes('healthcare')) {
        return "Please select your healthcare professional type.";
      }
      
      // Organization-specific errors
      if (message.includes('organization name')) {
        return "Please enter a valid organization name.";
      }
      
      if (message.includes('abn')) {
        return "Please enter a valid ABN (Australian Business Number).";
      }
      
      if (message.includes('address')) {
        return "Please enter a complete address.";
      }
      
      if (message.includes('postcode')) {
        return "Please enter a valid postcode.";
      }
      
      if (message.includes('already belongs') || message.includes('already exists')) {
        return "You already belong to an organization. Contact support if you need to change organizations.";
      }
      
      if (message.includes('access token') || message.includes('invalid token')) {
        return "Invalid access token. Please check the token and try again.";
      }
      
      if (message.includes('not found') && message.includes('organization')) {
        return "Organization not found. Please check the access token and try again.";
      }
      
      return error.message as string;
    }
    
    return "An unexpected error occurred. Please try again.";
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
      const result = await createOrganization({
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
        accessToken: result.accessToken,
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

  const handleJoinOrganization = async () => {
    if (!searchToken.trim()) {
      setError("Please enter an access token");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await joinOrganization({ accessToken: searchToken.trim() });
      router.push("/dashboard");
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
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              PillFlow
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-green-600">Organization Created!</CardTitle>
                  <CardDescription>
                    Your organization has been successfully created
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="font-medium">{createdOrgData.name}</p>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm text-muted-foreground mb-2">Access Token for team members:</p>
                      <p className="font-mono text-lg font-bold tracking-wider">{createdOrgData.accessToken}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Share this token with team members so they can join your organization
                    </p>
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
                {currentStep === "choice" && "Choose how you want to get started"}
                {(currentStep === "create" || currentStep === "join") && "Setup your organization"}
              </p>
            </div>
            
            <ProgressIndicator steps={getSteps()} />

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

            {/* Step 2: Choice */}
            {currentStep === "choice" && (
              <Card>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">Choose Your Path</CardTitle>
                  <CardDescription className="text-sm">
                    How would you like to get started?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/50"
                    onClick={() => setCurrentStep("create")}
                  >
                    <Building2 className="w-6 h-6 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm">Create Organization</div>
                      <div className="text-xs text-muted-foreground">
                        Set up a new healthcare organization
                      </div>
                    </div>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/50"
                    onClick={() => setCurrentStep("join")}
                  >
                    <Users className="w-6 h-6 text-primary" />
                    <div className="text-center">
                      <div className="font-semibold text-sm">Join Organization</div>
                      <div className="text-xs text-muted-foreground">
                        Join an existing healthcare organization
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Create Organization */}
            {currentStep === "create" && (
              <Card>
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg">Create Organization</CardTitle>
                  <CardDescription className="text-sm">
                    Set up your healthcare organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOrganization} className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="name" className="text-sm">Organization Name *</Label>
                        <Input 
                          id="name"
                          name="name"
                          type="text"
                          placeholder="City General Hospital"
                          required
                          disabled={isSubmitting}
                          className="h-9"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor="type" className="text-sm">Type *</Label>
                        <Select name="type" required>
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="Select type" />
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

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="contactPersonName" className="text-sm">Contact Person *</Label>
                        <Input 
                          id="contactPersonName"
                          name="contactPersonName"
                          type="text"
                          placeholder="John Smith"
                          required
                          disabled={isSubmitting}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="phoneNumber" className="text-sm">Phone *</Label>
                        <Input 
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          placeholder="+61 2 XXXX XXXX"
                          required
                          disabled={isSubmitting}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-sm">Email *</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          placeholder="contact@org.com"
                          required
                          disabled={isSubmitting}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="website" className="text-sm">Website</Label>
                        <Input 
                          id="website"
                          name="website"
                          type="url"
                          placeholder="www.org.com"
                          disabled={isSubmitting}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="streetAddress" className="text-sm">Street Address *</Label>
                      <Input 
                        id="streetAddress"
                        name="streetAddress"
                        type="text"
                        placeholder="123 Health Street"
                        required
                        disabled={isSubmitting}
                        className="h-9"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-1 col-span-2">
                        <Label htmlFor="suburb" className="text-sm">Suburb *</Label>
                        <Input 
                          id="suburb"
                          name="suburb"
                          type="text"
                          placeholder="Sydney"
                          required
                          disabled={isSubmitting}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="state" className="text-sm">State *</Label>
                        <Select name="state" required>
                          <SelectTrigger className="w-full h-9">
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
                      <div className="space-y-1">
                        <Label htmlFor="postcode" className="text-sm">Postcode *</Label>
                        <Input 
                          id="postcode"
                          name="postcode"
                          type="text"
                          placeholder="2000"
                          required
                          disabled={isSubmitting}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="abn" className="text-sm">ABN *</Label>
                      <Input 
                        id="abn"
                        name="abn"
                        type="text"
                        placeholder="12 345 678 901"
                        required
                        disabled={isSubmitting}
                        className="h-9"
                      />
                    </div>
                    
                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
                        <p className="font-medium">Error:</p>
                        <p>{error}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep("choice")}
                        disabled={isSubmitting}
                        className="flex-1 h-9"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 h-9"
                      >
                        {isSubmitting ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Join Organization */}
            {currentStep === "join" && (
              <Card>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">Join Organization</CardTitle>
                  <CardDescription className="text-sm">
                    Enter the access token provided by your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="accessToken" className="text-sm">Access Token</Label>
                    <Input 
                      id="accessToken"
                      type="text"
                      placeholder="XXX-XXX-XXX-XXX"
                      value={searchToken}
                      onChange={(e) => setSearchToken(e.target.value.toUpperCase())}
                      disabled={isSubmitting}
                      className="h-9"
                    />
                  </div>
                  
                  {searchToken && findOrganization && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                      <p className="text-sm font-medium text-green-800">
                        Organization Found:
                      </p>
                      <p className="text-sm text-green-700">
                        {findOrganization.name} ({findOrganization.type.replace('_', ' ').toUpperCase()})
                      </p>
                      <p className="text-xs text-green-600">
                        Contact: {findOrganization.contactPersonName}
                      </p>
                    </div>
                  )}
                  
                  {searchToken && !findOrganization && findOrganization !== undefined && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                      <p className="text-sm text-red-700">
                        No organization found with this access token
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
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
                      className="flex-1 h-9"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleJoinOrganization}
                      disabled={isSubmitting || !findOrganization}
                      className="flex-1 h-9"
                    >
                      {isSubmitting ? "Joining..." : "Join Organization"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side - Branding (same as signin page) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 relative hidden lg:flex flex-col justify-center p-8 text-white">
        <div className="relative z-10">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm flex size-10 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">PillFlow</h1>
            </div>
            
            <h2 className="text-xl font-semibold mb-3">
              {currentStep === "profile" && "Complete Your Professional Profile"}
              {currentStep === "choice" && "Almost There!"}
              {(currentStep === "create" || currentStep === "join") && "Organization Setup"}
            </h2>
            
            <p className="text-base text-blue-100 mb-6 leading-relaxed">
              {currentStep === "profile" && "Add your professional details including APHRA registration and healthcare type to ensure proper access and compliance."}
              {currentStep === "choice" && "Complete your organization setup to unlock the full power of PillFlow. Whether you're creating a new organization or joining an existing one, we'll have you up and running in no time."}
              {(currentStep === "create" || currentStep === "join") && "Secure access tokens ensure only authorized personnel can join your healthcare organization."}
            </p>
            
            <div className="mt-6 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <CheckCircle className="size-4" />
                {currentStep === "profile" && "Professional Compliance"}
                {currentStep !== "profile" && "Secure Access Tokens"}
              </h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                {currentStep === "profile" && "APHRA registration ensures compliance with Australian healthcare standards and enables proper professional verification."}
                {currentStep !== "profile" && "Each organization gets a unique, secure access token for team members to join. Keep your token safe and share it only with trusted team members."}
              </p>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90"></div>
      </div>
    </div>
  );
} 