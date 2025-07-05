/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download,
  Calendar,
  User,
  Building2,
  FileImage,
  X
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PatientScriptsProps {
  patientId: string;
}

export function PatientScripts({ patientId }: PatientScriptsProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query for scripts
  const scripts = useQuery(api.patientManagement.getPatientScripts, {
    patientId: patientId as any,
  });

  // Mutations
  const generateUploadUrl = useMutation(api.patientManagement.generateScriptUploadUrl);
  const saveScript = useMutation(api.patientManagement.savePatientScript);
  const deleteScript = useMutation(api.patientManagement.deletePatientScript);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF and PNG files are allowed");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: Get upload URL from Convex
      const uploadUrl = await generateUploadUrl({
        patientId: patientId as any,
      });

      // Step 2: Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file to storage");
      }

      const { storageId } = await result.json();

      // Step 3: Save file metadata to database
      await saveScript({
        patientId: patientId as any,
        storageId: storageId,
        originalFileName: selectedFile.name,
        fileType: selectedFile.type as "application/pdf" | "image/png",
        fileSize: selectedFile.size,
        description: description.trim() || undefined,
      });

      toast.success("Script uploaded successfully");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setDescription("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error("Failed to upload script");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (scriptId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await deleteScript({ scriptId: scriptId as any });
      toast.success("Script deleted successfully");
    } catch (error) {
      toast.error("Failed to delete script");
      console.error(error);
    }
  };

  const handleDownload = async (downloadUrl: string) => {
    try {
      // Open file in new tab for viewing/downloading
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast.error("Failed to open file");
      console.error(error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else if (fileType === 'image/png') {
      return <FileImage className="h-5 w-5 text-blue-600" />;
    }
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  const getFileTypeBadge = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <Badge className="bg-red-100 text-red-800">PDF</Badge>;
    } else if (fileType === 'image/png') {
      return <Badge className="bg-blue-100 text-blue-800">PNG</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Scripts & Documents</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {scripts?.length || 0} Files
          </Badge>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Script
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Script</DialogTitle>
                <DialogDescription>
                  Upload PDF or PNG files for this patient. Maximum file size is 10MB.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">File (PDF or PNG only)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.png"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                  />
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      {getFileIcon(selectedFile.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the script..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Scripts List */}
      {scripts?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No scripts uploaded</p>
            <p className="text-sm text-muted-foreground">Upload PDF or PNG files for this patient</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scripts?.map((script: any) => (
            <Card key={script._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getFileIcon(script.fileType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold truncate">
                          {script.originalFileName}
                        </h4>
                        {getFileTypeBadge(script.fileType)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{formatFileSize(script.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(script.uploadedAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {script.uploadedByUser?.firstName} {script.uploadedByUser?.lastName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {script.uploadedByOrg?.name}
                        </Badge>
                      </div>

                      {script.description && (
                        <div className="bg-muted/50 rounded p-3 mb-3">
                          <p className="text-sm">{script.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(script.downloadUrl)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(script._id, script.originalFileName)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
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