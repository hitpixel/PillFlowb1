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
      <DialogContent className="sm:max-w-lg w-full max-w-[90vw]">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Share2 className="h-6 w-6" />
            Access Shared Patient
          </DialogTitle>
          <DialogDescription className="text-base mt-3">
            Enter a share token to access patient data from another organization
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="shareToken" className="text-sm font-medium">
              Share Token
            </Label>
            <Input
              id="shareToken"
              placeholder="PAT-XXXX-XXXX-XXXX"
              value={shareToken}
              onChange={(e) => setShareToken(e.target.value)}
              disabled={isSearching}
              className="h-11 text-base"
            />
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-sm text-muted-foreground">
                <strong>Format:</strong> Share tokens look like: PAT-ABCD-1234-EFGH
              </p>
            </div>
          </div>
          <DialogFooter className="gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="h-10 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!shareToken.trim() || isSearching}
              className="h-10 px-6"
            >
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