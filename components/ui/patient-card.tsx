"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, Calendar, Mail, Phone, MapPin, Package, Share2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
  preferredPack: "blister" | "sachets";
  shareToken: string;
  createdAt: number;
  updatedAt: number;
}

interface PatientCardProps {
  patient: Patient;
  onCopyShareToken?: (token: string) => void;
}

export function PatientCard({ patient, onCopyShareToken }: PatientCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleCopyShareToken = async () => {
    try {
      await navigator.clipboard.writeText(patient.shareToken);
      if (onCopyShareToken) {
        onCopyShareToken(patient.shareToken);
      }
    } catch (error) {
      console.error("Failed to copy share token:", error);
    }
  };

  return (
    <Card className="w-full">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">
                  {patient.firstName} {patient.lastName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Age {formatAge(patient.dateOfBirth)} • {patient.suburb}, {patient.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={patient.preferredPack === "blister" ? "default" : "outline"}>
                {patient.preferredPack === "blister" ? "Blister" : "Sachets"}
              </Badge>
              <Link href={`/patients/${patient._id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>Born: {formatDate(patient.dateOfBirth)}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{patient.streetAddress}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medication Preference */}
              <div>
                <h4 className="text-sm font-medium mb-2">Medication Preference</h4>
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">Preferred Pack: </span>
                  <Badge variant={patient.preferredPack === "blister" ? "default" : "outline"} className="text-xs">
                    {patient.preferredPack === "blister" ? "Blister Pack" : "Sachets"}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Share Token */}
              <div>
                <h4 className="text-sm font-medium mb-2">Data Sharing</h4>
                <div className="flex items-center gap-2">
                  <Share2 className="h-3 w-3 text-muted-foreground" />
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                    {patient.shareToken}
                  </code>
                  <Button onClick={handleCopyShareToken} size="sm" variant="outline" className="h-6 px-2">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Record Information */}
              <div className="text-xs text-muted-foreground">
                <p>Created: {formatDistanceToNow(new Date(patient.createdAt), { addSuffix: true })}</p>
                <p>Updated: {formatDistanceToNow(new Date(patient.updatedAt), { addSuffix: true })}</p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
} 