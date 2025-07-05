"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Plus, 
  Edit, 
  Square, 
  Trash2,
  Calendar,
  Building2,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MedicationLogProps {
  patientId: string;
}

interface MedicationLogEntry {
  _id: Id<"medicationLogs">;
  actionType: "added" | "updated" | "stopped" | "deleted" | "change_requested" | "change_approved" | "change_rejected" | "removal_requested" | "removal_approved" | "removal_rejected" | "request_canceled";
  medicationName: string;
  performedAt: number;
  currentDosage?: string;
  currentMorningDose?: string;
  currentAfternoonDose?: string;
  currentEveningDose?: string;
  currentNightDose?: string;
  currentInstructions?: string;
  changes?: string;
  requestNotes?: string;
  status?: "completed" | "pending" | "approved" | "rejected" | "canceled";
  performedByUser: {
    firstName: string;
    lastName: string;
  } | null;
  performedByOrg: {
    name: string;
    type: string;
  } | null;
}

export function MedicationLog({ patientId }: MedicationLogProps) {
  const logs = useQuery(api.patientManagement.getPatientMedicationLogs, {
    patientId: patientId as Id<"patients">,
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'added': return <Plus className="h-4 w-4" />;
      case 'updated': return <Edit className="h-4 w-4" />;
      case 'stopped': return <Square className="h-4 w-4" />;
      case 'deleted': return <Trash2 className="h-4 w-4" />;
      case 'change_requested': return <Edit className="h-4 w-4" />;
      case 'change_approved': return <Edit className="h-4 w-4" />;
      case 'change_rejected': return <Edit className="h-4 w-4" />;
      case 'removal_requested': return <Trash2 className="h-4 w-4" />;
      case 'removal_approved': return <Trash2 className="h-4 w-4" />;
      case 'removal_rejected': return <Trash2 className="h-4 w-4" />;
      case 'request_canceled': return <Square className="h-4 w-4" />;
      default: return <Pill className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'added': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'stopped': return 'bg-orange-100 text-orange-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      case 'change_requested': return 'bg-yellow-100 text-yellow-800';
      case 'change_approved': return 'bg-green-100 text-green-800';
      case 'change_rejected': return 'bg-red-100 text-red-800';
      case 'removal_requested': return 'bg-yellow-100 text-yellow-800';
      case 'removal_approved': return 'bg-green-100 text-green-800';
      case 'removal_rejected': return 'bg-red-100 text-red-800';
      case 'request_canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = (actionType: string) => {
    switch (actionType) {
      case 'added': return 'Added';
      case 'updated': return 'Updated';
      case 'stopped': return 'Stopped';
      case 'deleted': return 'Deleted';
      case 'change_requested': return 'Change Requested';
      case 'change_approved': return 'Change Approved';
      case 'change_rejected': return 'Change Rejected';
      case 'removal_requested': return 'Removal Requested';
      case 'removal_approved': return 'Removal Approved';
      case 'removal_rejected': return 'Removal Rejected';
      case 'request_canceled': return 'Request Canceled';
      default: return 'Changed';
    }
  };

  const renderDosageSchedule = (log: MedicationLogEntry) => {
    const hasDoses = log.currentMorningDose || log.currentAfternoonDose || log.currentEveningDose || log.currentNightDose;
    if (!hasDoses) return null;

    return (
      <div className="mt-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">Dosing Schedule:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {log.currentMorningDose && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Morning:</span>
              <span>{log.currentMorningDose}</span>
            </div>
          )}
          {log.currentAfternoonDose && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Afternoon:</span>
              <span>{log.currentAfternoonDose}</span>
            </div>
          )}
          {log.currentEveningDose && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Evening:</span>
              <span>{log.currentEveningDose}</span>
            </div>
          )}
          {log.currentNightDose && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Night:</span>
              <span>{log.currentNightDose}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!logs) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading medication logs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Medication Log</h3>
        </div>
        <Badge variant="outline">
          {logs.length} {logs.length === 1 ? 'Entry' : 'Entries'}
        </Badge>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pill className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No medication changes found</p>
            <p className="text-sm text-muted-foreground">Medication changes will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log: MedicationLogEntry) => (
            <Card key={log._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`p-2 rounded-full ${getActionColor(log.actionType)}`}>
                      {getActionIcon(log.actionType)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getActionColor(log.actionType)}>
                        {getActionText(log.actionType)}
                      </Badge>
                      <h4 className="font-semibold text-sm">{log.medicationName}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <User className="h-3 w-3" />
                          <span>
                            {log.performedByUser ? 
                              `${log.performedByUser.firstName} ${log.performedByUser.lastName}` : 
                              'Unknown User'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <Building2 className="h-3 w-3" />
                          <span>
                            {log.performedByOrg ? 
                              `${log.performedByOrg.name} (${log.performedByOrg.type})` : 
                              'Unknown Organization'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(log.performedAt)} ({formatDistanceToNow(new Date(log.performedAt), { addSuffix: true })})
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        {log.currentDosage && (
                          <div className="mb-1">
                            <span className="font-medium">Dosage:</span> {log.currentDosage}
                          </div>
                        )}
                        {log.currentInstructions && (
                          <div className="mb-1">
                            <span className="font-medium">Instructions:</span> {log.currentInstructions}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {renderDosageSchedule(log)}
                    
                    {log.changes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                        <p className="font-medium text-muted-foreground mb-1">Changes:</p>
                        <p className="text-muted-foreground">{log.changes}</p>
                      </div>
                    )}
                    
                    {log.requestNotes && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                        <p className="font-medium text-blue-700 mb-1">Request Notes:</p>
                        <p className="text-blue-800">{log.requestNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 