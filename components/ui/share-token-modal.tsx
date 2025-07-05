"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface ShareTokenModalProps {
  triggerButton?: React.ReactNode;
  onTokenSubmit?: (token: string) => void;
}

export function ShareTokenModal({ triggerButton, onTokenSubmit }: ShareTokenModalProps) {
  const [shareToken, setShareToken] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareToken.trim()) return;

    setIsSearching(true);
    
    if (onTokenSubmit) {
      onTokenSubmit(shareToken.trim());
    } else {
      // Navigate to shared patient view
      router.push(`/patients/shared/${encodeURIComponent(shareToken.trim())}`);
    }
    
    setIsSearching(false);
    setOpen(false);
    setShareToken("");
  };

  const defaultTrigger = (
    <Button variant="outline">
      <Share2 className="h-4 w-4 mr-2" />
      Access Shared Patient
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Access Shared Patient
          </DialogTitle>
          <DialogDescription>
            Enter a share token to access patient data from another organization
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shareToken">Share Token</Label>
            <Input
              id="shareToken"
              placeholder="PAT-XXXX-XXXX-XXXX"
              value={shareToken}
              onChange={(e) => setShareToken(e.target.value)}
              disabled={isSearching}
            />
            <p className="text-sm text-muted-foreground">
              Share tokens look like: PAT-ABCD-1234-EFGH
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!shareToken.trim() || isSearching}>
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Access Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 