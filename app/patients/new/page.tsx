"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewPatientPage() {
  const router = useRouter();
  const createPatient = useMutation(api.patients.createPatient);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    streetAddress: "",
    suburb: "",
    state: "",
    postcode: "",
    preferredPack: "blister" as "blister" | "sachets",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.firstName.trim()) {
        toast.error("First name is required");
        return;
      }
      if (!formData.lastName.trim()) {
        toast.error("Last name is required");
        return;
      }
      if (!formData.dateOfBirth) {
        toast.error("Date of birth is required");
        return;
      }
      if (!formData.streetAddress.trim()) {
        toast.error("Street address is required");
        return;
      }
      if (!formData.suburb.trim()) {
        toast.error("Suburb is required");
        return;
      }
      if (!formData.state.trim()) {
        toast.error("State is required");
        return;
      }
      if (!formData.postcode.trim()) {
        toast.error("Postcode is required");
        return;
      }

      // Validate date of birth is not in the future
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      if (birthDate > today) {
        toast.error("Date of birth cannot be in the future");
        return;
      }

      // Validate email format if provided
      if (formData.email.trim() && !formData.email.includes("@")) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Validate postcode format (Australian postcodes are 4 digits)
      if (!/^\d{4}$/.test(formData.postcode)) {
        toast.error("Postcode must be 4 digits");
        return;
      }

      const patientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        streetAddress: formData.streetAddress.trim(),
        suburb: formData.suburb.trim(),
        state: formData.state.trim(),
        postcode: formData.postcode.trim(),
        preferredPack: formData.preferredPack,
      };

      const patientId = await createPatient(patientData);
      
      toast.success("Patient created successfully!");
      router.push(`/patients/${patientId}`);
    } catch (error) {
      console.error("Error creating patient:", error);
      toast.error("Failed to create patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const australianStates = [
    { value: "NSW", label: "New South Wales" },
    { value: "VIC", label: "Victoria" },
    { value: "QLD", label: "Queensland" },
    { value: "WA", label: "Western Australia" },
    { value: "SA", label: "South Australia" },
    { value: "TAS", label: "Tasmania" },
    { value: "NT", label: "Northern Territory" },
    { value: "ACT", label: "Australian Capital Territory" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserPlus className="h-8 w-8" />
            Add New Patient
          </h1>
          <p className="text-muted-foreground">
            Create a new patient record for your organization
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="patient@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="0400 000 000"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address</h3>
              
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address *</Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="suburb">Suburb *</Label>
                  <Input
                    id="suburb"
                    value={formData.suburb}
                    onChange={(e) => handleInputChange("suburb", e.target.value)}
                    placeholder="Suburb"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {australianStates.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange("postcode", e.target.value)}
                    placeholder="2000"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Medication Preference */}
            <div className="space-y-2">
              <Label htmlFor="preferredPack">Preferred Pack Type *</Label>
              <Select 
                value={formData.preferredPack} 
                onValueChange={(value) => handleInputChange("preferredPack", value as "blister" | "sachets")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pack type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blister">Blister Pack</SelectItem>
                  <SelectItem value="sachets">Sachets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/patients">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Patient
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 