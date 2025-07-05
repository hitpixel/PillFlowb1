"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";

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

interface PatientListProps {
  patients: Patient[];
  onCopyShareToken?: (token: string) => void;
}

export function PatientList({ patients, onCopyShareToken }: PatientListProps) {
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

  const handleCopyShareToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      if (onCopyShareToken) {
        onCopyShareToken(token);
      }
    } catch (error) {
      console.error("Failed to copy share token:", error);
    }
  };

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No patients found</p>
          <p className="text-sm text-muted-foreground">Start by adding your first patient</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients ({patients.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Patient</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">Pack Preference</th>
                <th className="text-left p-4 font-medium">Share Token</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr
                  key={patient._id}
                  className={`border-b hover:bg-muted/25 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  {/* Patient Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Age {formatAge(patient.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="p-4">
                    <div className="space-y-1">
                      {patient.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{patient.email}</span>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      {!patient.email && !patient.phone && (
                        <span className="text-sm text-muted-foreground">No contact info</span>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{patient.suburb}, {patient.state}</span>
                    </div>
                  </td>

                  {/* Pack Preference */}
                  <td className="p-4">
                    <Badge variant={patient.preferredPack === "blister" ? "default" : "outline"}>
                      {patient.preferredPack === "blister" ? "Blister" : "Sachets"}
                    </Badge>
                  </td>

                  {/* Share Token */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        {patient.shareToken}
                      </code>
                      <Button
                        onClick={() => handleCopyShareToken(patient.shareToken)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <Link href={`/patients/${patient._id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 