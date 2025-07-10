/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  FileText, 
  Settings,
  Building2,
  Lock,
  Globe,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface PatientCommentsProps {
  patientId: string;
}

interface CommentFormData {
  content: string;
  commentType: "note" | "chat" | "system";
  isPrivate: boolean;
}

const initialFormData: CommentFormData = {
  content: "",
  commentType: "chat",
  isPrivate: false,
};

export function PatientComments({ patientId }: PatientCommentsProps) {
  const [formData, setFormData] = useState<CommentFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query for comments and current user
  const comments = useQuery(api.patientManagement.getPatientComments, {
    patientId: patientId as any,
  });
  const currentUser = useQuery(api.users.getCurrentUserProfile);

  // Mutation
  const addComment = useMutation(api.patientManagement.addPatientComment);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setIsSubmitting(true);
      await addComment({
        patientId: patientId as any,
        content: formData.content.trim(),
        commentType: formData.commentType,
        isPrivate: formData.isPrivate,
        replyToId: replyingTo?._id,
      });

      setFormData(initialFormData);
      setReplyingTo(null);
      toast.success("Comment added successfully");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment: any) => {
    setReplyingTo(comment);
    setFormData(prev => ({ ...prev, commentType: "chat" }));
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case "note":
        return <FileText className="h-4 w-4" />;
      case "chat":
        return <MessageSquare className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case "note":
        return "bg-blue-100 text-blue-800";
      case "chat":
        return "bg-green-100 text-green-800";
      case "system":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  // Group comments by date
  const groupedComments = comments?.reduce((groups: any, comment: any) => {
    const date = new Date(comment.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(comment);
    return groups;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Communication</h3>
        </div>
        <Badge variant="outline">
          {comments?.length || 0} Messages
        </Badge>
      </div>

      {/* Comments Display */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Patient Communication Log</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start a conversation about this patient</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedComments).map(([date, dayComments]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center gap-4 my-4">
                    <Separator className="flex-1" />
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {new Date(date).toLocaleDateString('en-AU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>

                  {/* Comments for this date */}
                  <div className="space-y-3">
                    {(dayComments as any[]).map((comment: any) => {
                      const isCurrentUser = currentUser && comment.authorId === currentUser._id;
                      
                      return (
                        <div key={comment._id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getUserInitials(comment.author?.firstName, comment.author?.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex-1 space-y-1 ${isCurrentUser ? 'items-end' : ''}`}>
                            <div className={`flex items-center gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                              <span className="font-medium text-sm">
                                {isCurrentUser ? 'You' : `${comment.author?.firstName} ${comment.author?.lastName}`}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                <Building2 className="h-3 w-3 mr-1" />
                                {comment.authorOrg?.name}
                              </Badge>
                              <Badge className={`text-xs ${getCommentTypeColor(comment.commentType)}`}>
                                {getCommentIcon(comment.commentType)}
                                <span className="ml-1 capitalize">{comment.commentType}</span>
                              </Badge>
                              {comment.isPrivate && (
                                <Badge variant="secondary" className="text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(comment.createdAt)}
                              </span>
                            </div>

                            <div className={`rounded-lg p-3 max-w-[70%] ${isCurrentUser ? 'ml-auto' : ''} ${
                              isCurrentUser ? 'bg-blue-500 text-white' : 'bg-muted/50'
                            }`}>
                              <p className="text-sm">{comment.content}</p>
                            </div>

                            <div className={`flex items-center gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => handleReply(comment)}
                              >
                                Reply
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Reply Indicator */}
      {replyingTo && (
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Replying to {replyingTo.author?.firstName} {replyingTo.author?.lastName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {replyingTo.content}
            </p>
          </CardContent>
        </Card>
      )}

      {/* New Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                placeholder="Type your message here..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="commentType" className="text-sm">Type:</Label>
                <Select
                  value={formData.commentType}
                  onValueChange={(value: "note" | "chat" | "system") => 
                    setFormData(prev => ({ ...prev, commentType: value }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        Chat
                      </div>
                    </SelectItem>
                    <SelectItem value="note">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        Note
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked: boolean) => 
                    setFormData(prev => ({ ...prev, isPrivate: checked }))
                  }
                />
                <Label htmlFor="isPrivate" className="text-sm flex items-center gap-1">
                  {formData.isPrivate ? (
                    <>
                      <Lock className="h-3 w-3" />
                      Private to organisation
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" />
                      Shared with all
                    </>
                  )}
                </Label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formData.isPrivate 
                                  ? "This message will only be visible to your organisation"
                : "This message will be shared with all organisations that have access to this patient"
                }
              </p>
              <Button type="submit" disabled={isSubmitting || !formData.content.trim()}>
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {replyingTo ? "Reply" : "Send"}
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