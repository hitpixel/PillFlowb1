"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PackageCheck, 
  PackageOpen, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  User,
  Truck,
  Calendar,
  FileText,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

interface PatientWebsterPacksProps {
  patientId: Id<"patients">;
}

type FilterType = "all" | "checks" | "scanouts";

export function PatientWebsterPacks({ patientId }: PatientWebsterPacksProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  
  // Get Webster pack checks for this patient
  const websterChecks = useQuery(api.websterPacks.getPatientWebsterChecks, { 
    patientId, 
    limit: 50 
  });

  // Get Webster pack scan outs for this patient
  const websterScanOuts = useQuery(api.websterPacks.getPatientWebsterScanOuts, { 
    patientId, 
    limit: 50 
  });

  // Get organization to check if it's a pharmacy
  const organization = useQuery(api.users.getOrganization);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed": return "text-green-600 bg-green-50 border-green-200";
      case "failed": return "text-red-600 bg-red-50 border-red-200";
      case "requires_review": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "dispatched": return "text-blue-600 bg-blue-50 border-blue-200";
      case "collected": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed": return <CheckCircle2 className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      case "requires_review": return <AlertTriangle className="h-4 w-4" />;
      case "dispatched": return <Truck className="h-4 w-4" />;
      case "collected": return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user has access (pharmacy organizations only)
  const hasAccess = organization?.type === "pharmacy";

  if (!hasAccess) {
    return (
      <div className="p-6 text-center">
        <PackageCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Access Restricted
        </h3>
        <p className="text-muted-foreground">
          Webster pack information is only available to pharmacy organisations.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Your organisation type: {organization?.type?.replace("_", " ") || "Unknown"}
        </p>
      </div>
    );
  }

  if (websterChecks === undefined || websterScanOuts === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Combine and sort all activities by timestamp
  const allActivities = [
    ...(websterChecks || []).map(check => ({
      ...check,
      type: 'check' as const,
      timestamp: check.checkedAt,
      actorName: check.checkerName,
      actorOrganization: check.checkerOrganization,
      status: check.checkStatus,
    })),
    ...(websterScanOuts || []).map(scanOut => ({
      ...scanOut,
      type: 'scanout' as const,
      timestamp: scanOut.scannedOutAt,
      actorName: scanOut.scannerName,
      actorOrganization: scanOut.scannerOrganization,
      status: scanOut.scanOutStatus,
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Filter the data based on selected filter
  const filteredData = allActivities.filter(item => {
    if (filter === "all") return true;
    if (filter === "checks") return item.type === "check";
    if (filter === "scanouts") return item.type === "scanout";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Webster Pack Activity</h3>
          <p className="text-sm text-muted-foreground">
            Track pack checking and scan-out history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity</SelectItem>
              <SelectItem value="checks">Checks Only</SelectItem>
              <SelectItem value="scanouts">Scan Outs Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

             {/* Summary Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-2">
               <PackageCheck className="h-5 w-5 text-blue-600" />
               <div>
                 <p className="text-sm font-medium">Total Activities</p>
                 <p className="text-2xl font-bold">{filteredData.length}</p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-2">
               <PackageCheck className="h-5 w-5 text-purple-600" />
               <div>
                 <p className="text-sm font-medium">Checks</p>
                 <p className="text-2xl font-bold">
                   {filteredData.filter(item => item.type === "check").length}
                 </p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-2">
               <PackageOpen className="h-5 w-5 text-blue-600" />
               <div>
                 <p className="text-sm font-medium">Scan Outs</p>
                 <p className="text-2xl font-bold">
                   {filteredData.filter(item => item.type === "scanout").length}
                 </p>
               </div>
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center gap-2">
               <CheckCircle2 className="h-5 w-5 text-green-600" />
               <div>
                 <p className="text-sm font-medium">Successful</p>
                 <p className="text-2xl font-bold">
                   {filteredData.filter(item => 
                     item.status === "passed" || 
                     item.status === "dispatched" || 
                     item.status === "collected"
                   ).length}
                 </p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <PackageCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Webster Pack Activity
              </h3>
              <p className="text-muted-foreground">
                No Webster pack checks have been recorded for this patient yet.
              </p>
            </CardContent>
          </Card>
                 ) : (
           filteredData.map((item) => (
             <Card key={item._id} className="hover:shadow-sm transition-shadow">
               <CardContent className="p-4">
                 <div className="flex items-start justify-between">
                   <div className="flex items-start gap-3">
                     <div className="mt-1">
                       {item.type === "check" ? (
                         <PackageCheck className="h-5 w-5 text-blue-600" />
                       ) : (
                         <PackageOpen className="h-5 w-5 text-purple-600" />
                       )}
                     </div>
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-2">
                         <span className="font-medium">Webster Pack: {item.websterPackId}</span>
                         <Badge variant="outline" className="capitalize">
                           {item.packType}
                         </Badge>
                         <Badge variant="secondary" className="capitalize">
                           {item.type === "check" ? "Quality Check" : "Scan Out"}
                         </Badge>
                       </div>
                       
                       <div className="space-y-1 text-sm text-muted-foreground">
                         <div className="flex items-center gap-2">
                           <User className="h-4 w-4" />
                           <span>
                             {item.type === "check" ? "Checked by: " : "Scanned by: "}
                             {item.actorName}
                           </span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Calendar className="h-4 w-4" />
                           <span>{formatDate(item.timestamp)}</span>
                           <span className="text-xs">
                             ({formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })})
                           </span>
                         </div>
                         {item.notes && (
                           <div className="flex items-start gap-2">
                             <FileText className="h-4 w-4 mt-0.5" />
                             <span className="text-sm">{item.notes}</span>
                           </div>
                         )}
                         {item.type === "check" && "issues" in item && item.issues && item.issues.length > 0 && (
                           <div className="flex items-start gap-2">
                             <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
                             <div className="text-sm">
                               <span className="font-medium">Issues: </span>
                               {item.issues.join(", ")}
                             </div>
                           </div>
                         )}
                         {item.type === "scanout" && "deliveryMethod" in item && (
                           <div className="flex items-center gap-2">
                             <Truck className="h-4 w-4" />
                             <span className="capitalize">
                               {item.deliveryMethod}: {item.deliveryMethod === "pickup" ? "In-store pickup" : 
                                item.deliveryMethod === "delivery" ? "Home delivery" : "Courier service"}
                             </span>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                   
                   <div className="flex flex-col items-end gap-2">
                     <Badge className={`${getStatusColor(item.status)} border`}>
                       <span className="flex items-center gap-1">
                         {getStatusIcon(item.status)}
                         {item.status.replace("_", " ")}
                       </span>
                     </Badge>
                     <span className="text-xs text-muted-foreground">
                       {item.actorOrganization}
                     </span>
                   </div>
                 </div>
               </CardContent>
             </Card>
           ))
         )}
      </div>
    </div>
  );
} 