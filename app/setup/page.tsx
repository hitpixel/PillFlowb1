"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressSteps } from "@/components/ui/progress-steps";

type SetupStep = "profile" | "choice" | "create" | "contact" | "join";

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
  const acceptInvitation = useMutation(api.users.acceptInvitation);
  
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>("profile");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrgData, setCreatedOrgData] = useState<{name: string} | null>(null);
  const [joinedOrgData, setJoinedOrgData] = useState<{name: string} | null>(null);
  const [orgFormData, setOrgFormData] = useState<{
    name: string;
    type: "pharmacy" | "gp_clinic" | "hospital" | "aged_care";
    phoneNumber: string;
    email: string;
    website?: string;
    streetAddress: string;
    suburb: string;
    state: string;
    postcode: string;
    abn: string;
  } | null>(null);
  const [samePersonForBilling, setSamePersonForBilling] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/signin");
        return;
      }
      
      if (setupStatus && !setupStatus.needsSetup) {
        router.push("/");
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
    { id: "choice", name: "Setup", description: "Choose organisation path" },
    { id: "create", name: "Organisation", description: "Create your organisation" },
    { id: "contact", name: "Contact", description: "Add contact person details" },
    { id: "join", name: "Join", description: "Join existing organisation" },
  ];

  const getCompletedSteps = () => {
    if (currentStep === "profile") return [];
    if (currentStep === "choice") return ["profile"];
    if (currentStep === "create") return ["profile", "choice"];
    if (currentStep === "contact") return ["profile", "choice", "create"];
    if (currentStep === "join") return ["profile", "choice"];
    return ["profile", "choice", "create", "contact"];
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
      // Store organisation data and move to contact step
      setOrgFormData({
        name: formData.get("name") as string,
        type: formData.get("type") as "pharmacy" | "gp_clinic" | "hospital" | "aged_care",
        phoneNumber: formData.get("phoneNumber") as string,
        email: formData.get("email") as string,
        website: formData.get("website") as string || undefined,
        streetAddress: formData.get("streetAddress") as string,
        suburb: formData.get("suburb") as string,
        state: formData.get("state") as string,
        postcode: formData.get("postcode") as string,
        abn: formData.get("abn") as string,
      });
      
      setCurrentStep("contact");
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactPerson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      if (!orgFormData) {
        throw new Error("Organisation data is missing");
      }

      // Store contact data
      const contactData = {
        contactPersonName: formData.get("contactPersonName") as string,
        contactPhoneNumber: formData.get("contactPhoneNumber") as string,
        contactEmail: formData.get("contactEmail") as string,
        billingPersonName: samePersonForBilling ? formData.get("contactPersonName") as string : formData.get("billingPersonName") as string,
        billingPhoneNumber: samePersonForBilling ? formData.get("contactPhoneNumber") as string : formData.get("billingPhoneNumber") as string,
        billingEmail: samePersonForBilling ? formData.get("contactEmail") as string : formData.get("billingEmail") as string,
      };

      // Now create the organisation with all data
      await createOrganization({
        name: orgFormData.name,
        type: orgFormData.type,
        phoneNumber: orgFormData.phoneNumber,
        email: orgFormData.email,
        website: orgFormData.website,
        streetAddress: orgFormData.streetAddress,
        suburb: orgFormData.suburb,
        state: orgFormData.state,
        postcode: orgFormData.postcode,
        abn: orgFormData.abn,
        ...contactData,
      });
      
      setCreatedOrgData({
        name: orgFormData.name,
      });
      
      // Show success for a moment then redirect
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const inviteToken = formData.get("inviteToken") as string;
      
      if (!inviteToken?.trim()) {
        throw new Error("Please enter a valid invitation token");
      }
      
      await acceptInvitation({
        inviteToken: inviteToken.trim(),
      });
      
              // Get organisation name for success message
        setJoinedOrgData({
          name: "Organisation", // We'll show a generic success message
      });
      
      // Show success for a moment then redirect
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

      // Success screen for joined organisation
  if (joinedOrgData) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left side - Background Image */}
        <div className="relative hidden lg:flex">
          <Image
            src="/PF-login.jpeg"
            alt="PillFlow Healthcare Platform"
            fill
            className="object-cover"
          />
        </div>
        
        {/* Right side - Success Form */}
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src="/pillflowb.png"
                alt="PillFlow Logo"
                width={120}
                height={32}
                className="rounded-md"
              />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h2 className="text-[32px] leading-[32px] font-bold mb-2 text-black">Welcome!</h2>
                <p className="text-base leading-6 text-black">You have successfully joined the organisation</p>
              </div>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Successfully joined organisation!</strong>
                    </p>
                    <p className="text-sm text-green-700">
                      You now have access to your organisation&apos;s dashboard and can collaborate with your team.
                    </p>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Redirecting to main page in a few seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

      // Success screen for created organisation
  if (createdOrgData) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left side - Background Image */}
        <div className="relative hidden lg:flex">
          <Image
            src="/PF-login.jpeg"
            alt="PillFlow Healthcare Platform"
            fill
            className="object-cover"
          />
        </div>
        
        {/* Right side - Success Form */}
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src="/pillflowb.png"
                alt="PillFlow Logo"
                width={120}
                height={32}
                className="rounded-md"
              />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h2 className="text-[32px] leading-[32px] font-bold mb-2 text-black">Success!</h2>
                <p className="text-base leading-6 text-black">Your organisation has been successfully created</p>
              </div>
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="font-medium text-black">{createdOrgData.name}</p>
                  <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Organisation created successfully!</strong>
                    </p>
                    <p className="text-sm text-green-700">
                      You can now invite team members from your organisation dashboard.
                    </p>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Redirecting to main page in a few seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
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
      {/* Left side - Background Image */}
      <div className="relative hidden lg:flex">
        <Image
          src="/PF-login.jpeg"
          alt="PillFlow Healthcare Platform"
          fill
          className="object-cover"
        />
      </div>
      
      {/* Right side - Setup Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Image
              src="/pillflowb.png"
              alt="PillFlow Logo"
              width={120}
              height={32}
              className="rounded-md"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h1 className="text-[48px] leading-[48px] font-bold text-black">
                {currentStep === "profile" && "Complete Your Setup"}
                {currentStep === "choice" && "Setup Organisation"}
                {currentStep === "create" && "Create Organisation"}
                {currentStep === "contact" && "Contact Person"}
                {currentStep === "join" && "Join Organisation"}
              </h1>
            </div>
            
            <ProgressIndicator 
              steps={getSteps()} 
              currentStep={currentStep} 
              completedSteps={getCompletedSteps()} 
            />
            
            {/* Divider */}
            <div className="w-full h-px bg-gray-200 mb-6"></div>

            {/* Step 1: Complete Profile */}
            {currentStep === "profile" && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-[32px] leading-[32px] font-bold mb-2 text-black">Complete Your Profile</h2>
                  <p className="text-base leading-6 text-black">Add your professional details to get started</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-base leading-6">First Name</Label>
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
                    <Label htmlFor="lastName" className="text-base leading-6">Last Name</Label>
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
                  <Label htmlFor="email" className="text-base leading-6">Email</Label>
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
                  <Label htmlFor="phoneNumber" className="text-base leading-6">Phone Number *</Label>
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
                  <Label htmlFor="aphraRegistrationNumber" className="text-base leading-6">APHRA Registration *</Label>
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
                  <Label htmlFor="healthcareProfessionalType" className="text-base leading-6">Professional Type *</Label>
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
                  className="w-full h-9 font-bold"
                >
                  {isSubmitting ? "Updating..." : "Continue"}
                </Button>
              </form>
            )}

            {/* Step 2: Choice between create or join organisation */}
            {currentStep === "choice" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-[32px] leading-[32px] font-bold mb-2 text-black">Organisation Setup</h2>
                  <p className="text-base leading-6 text-black">Choose how you want to get started with PillFlow</p>
                </div>
                <div className="space-y-6">
                  {/* Create Organisation Option */}
                  <div 
                    className="flex items-center p-6 border border-gray-200 rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-white"
                    onClick={() => setCurrentStep("create")}
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mr-6 flex-shrink-0">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg leading-6 font-semibold text-black mb-2">Create Organisation</h3>
                      <p className="text-base text-gray-600 leading-6">
                        Set up a new healthcare organisation and invite your team members.
                      </p>
                    </div>
                  </div>

                  {/* Join Organisation Option */}
                  <div 
                    className="flex items-center p-6 border border-gray-200 rounded-xl hover:border-primary/50 transition-colors cursor-pointer bg-white"
                    onClick={() => setCurrentStep("join")}
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mr-6 flex-shrink-0">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg leading-6 font-semibold text-black mb-2">Join Organisation</h3>
                      <p className="text-base text-gray-600 leading-6">
                        Join an existing organisation using an invitation token.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Don&apos;t have an invitation token?</strong>
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Ask your organisation administrator to send you an email invitation with a secure token to join their organisation.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Create Organisation */}
            {currentStep === "create" && (
              <form onSubmit={handleCreateOrganization} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-[32px] leading-[32px] font-bold mb-2 text-black">Create Organisation</h2>
                  <p className="text-base leading-6 text-black">Provide details about your healthcare organisation</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base leading-6">Organisation Name *</Label>
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
                  <Label htmlFor="type" className="text-base leading-6">Organisation Type *</Label>
                  <Select name="type" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select organisation type" />
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
                    <Label htmlFor="phoneNumber" className="text-base leading-6">Organisation Phone *</Label>
                    <Input 
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+61 X XXXX XXXX"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base leading-6">Organisation Email *</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contact@organisation.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-base leading-6">Website</Label>
                  <Input 
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://organisation.com"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="streetAddress" className="text-base leading-6">Street Address *</Label>
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
                    <Label htmlFor="suburb" className="text-base leading-6">Suburb *</Label>
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
                      <Label htmlFor="state" className="text-base leading-6">State *</Label>
                      <Select name="state" required>
                        <SelectTrigger className="w-full">
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
                    <Label htmlFor="postcode" className="text-base leading-6">Postcode *</Label>
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
                  <Label htmlFor="abn" className="text-base leading-6">ABN *</Label>
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
                    className="flex-1 font-bold"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 font-bold"
                  >
                    {isSubmitting ? "Saving..." : "Continue"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: Contact Person Details */}
            {currentStep === "contact" && (
              <form onSubmit={handleContactPerson} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-[32px] leading-[32px] font-bold mb-2 text-black">Contact Person</h2>
                  <p className="text-base leading-6 text-black">Add primary contact person details for your organisation</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black">Primary Contact Person</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonName" className="text-base leading-6">Contact Person Name *</Label>
                    <Input 
                      id="contactPersonName"
                      name="contactPersonName"
                      type="text"
                      placeholder="Full name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhoneNumber" className="text-base leading-6">Phone Number *</Label>
                      <Input 
                        id="contactPhoneNumber"
                        name="contactPhoneNumber"
                        type="tel"
                        placeholder="+61 4XX XXX XXX"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-base leading-6">Email Address *</Label>
                      <Input 
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        placeholder="person@organisation.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="samePersonForBilling"
                      checked={samePersonForBilling}
                      onCheckedChange={(checked) => setSamePersonForBilling(checked === true)}
                    />
                    <Label htmlFor="samePersonForBilling" className="text-base leading-6">
                      Same person for billing contact
                    </Label>
                  </div>

                  {!samePersonForBilling && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-black">Billing Contact Person</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="billingPersonName" className="text-base leading-6">Billing Contact Name *</Label>
                        <Input 
                          id="billingPersonName"
                          name="billingPersonName"
                          type="text"
                          placeholder="Full name"
                          required={!samePersonForBilling}
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingPhoneNumber" className="text-base leading-6">Phone Number *</Label>
                          <Input 
                            id="billingPhoneNumber"
                            name="billingPhoneNumber"
                            type="tel"
                            placeholder="+61 4XX XXX XXX"
                            required={!samePersonForBilling}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billingEmail" className="text-base leading-6">Email Address *</Label>
                          <Input 
                            id="billingEmail"
                            name="billingEmail"
                            type="email"
                            placeholder="billing@organisation.com"
                            required={!samePersonForBilling}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  )}
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
                    onClick={() => setCurrentStep("create")}
                    disabled={isSubmitting}
                    className="flex-1 font-bold"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 font-bold"
                  >
                    {isSubmitting ? "Creating Organisation..." : "Create Organisation"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Join Organisation */}
            {currentStep === "join" && (
              <form onSubmit={handleJoinOrganization} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-[32px] leading-[32px] font-bold mb-2 text-black">Join Organisation</h2>
                  <p className="text-base leading-6 text-black">Enter your invitation token to join an existing organisation</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inviteToken" className="text-base leading-6">Invitation Token *</Label>
                  <Input 
                    id="inviteToken"
                    name="inviteToken"
                    type="text"
                    placeholder="e.g., ABCD-1234-EFGH-5678"
                    required
                    disabled={isSubmitting}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the invitation token from your organisation administrator
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>🔐 How invitation tokens work:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Tokens are sent via email by your organisation administrator</li>
                    <li>• They expire after 7 days for security</li>
                    <li>• Each token can only be used once</li>
                    <li>• Format: XXXX-XXXX-XXXX-XXXX</li>
                  </ul>
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
                    className="flex-1 font-bold"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Joining...
                      </>
                    ) : (
                                              "Join Organisation"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 