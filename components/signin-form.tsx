"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

interface SignInFormProps {
  className?: string;
}

export function SignInForm({ className }: SignInFormProps) {
  const { signIn } = useAuthActions();
  const acceptInvitation = useMutation(api.users.acceptInvitation);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = searchParams.get('invite');
    if (token) {
      setInviteToken(token);
    }
  }, [searchParams]);

  const getErrorMessage = (error: unknown): string => {
    if (error === null || error === undefined) {
      return "Sign-in failed. Please check your credentials and try again.";
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    // Handle TypeError cases like "Cannot read properties of null"
    if (error instanceof TypeError) {
      if (error.message.includes('Cannot read properties of null') || error.message.includes('Cannot read property')) {
        return "Sign-in failed. Please check your email and password, then try again.";
      }
      return error.message;
    }
    
    if (error && typeof error === 'object') {
      // Handle case where error might be a Response object
      if ('status' in error && typeof error.status === 'number') {
        switch (error.status) {
          case 401:
            return "Incorrect email or password. Please check your credentials and try again.";
          case 404:
            return "No account found with this email address. Please check your email or sign up for a new account.";
          case 429:
            return "Too many failed sign-in attempts. Please wait a few minutes before trying again.";
          case 400:
            return "Invalid request. Please check your email and password format.";
          case 500:
            return "Server error. Please try again in a few moments.";
          default:
            return `Sign-in failed (Error ${error.status}). Please try again.`;
        }
      }
      
      if ('message' in error && typeof error.message === 'string') {
        const message = error.message.toLowerCase();
        
        // Handle specific authentication errors
        if (message.includes('invalid credentials') || message.includes('invalid email or password') || message.includes('wrong password') || message.includes('authentication failed') || message.includes('login failed')) {
          return "Incorrect email or password. Please check your credentials and try again.";
        }
        
        if (message.includes('user not found') || message.includes('account not found') || message.includes('no user found') || message.includes('user does not exist') || message.includes('email not registered')) {
          return "No account found with this email address. Please check your email or sign up for a new account.";
        }
        
        if (message.includes('account disabled') || message.includes('account locked') || message.includes('account suspended') || message.includes('account blocked') || message.includes('access denied')) {
          return "This account has been disabled. Please contact support for assistance.";
        }
        
        if (message.includes('too many attempts') || message.includes('rate limit') || message.includes('temporarily locked') || message.includes('too many failed') || message.includes('blocked')) {
          return "Too many failed sign-in attempts. Please wait a few minutes before trying again.";
        }
        
        if (message.includes('email not verified') || message.includes('verify email') || message.includes('email verification') || message.includes('unverified')) {
          return "Please verify your email address before signing in. Check your inbox for a verification link.";
        }
        
        if (message.includes('invalid format') || message.includes('invalid email') || message.includes('malformed email') || message.includes('email format')) {
          return "Please enter a valid email address.";
        }
        
        if (message.includes('password required') || message.includes('missing password') || message.includes('password empty')) {
          return "Password is required. Please enter your password.";
        }
        
        if (message.includes('network') || message.includes('connection') || message.includes('timeout') || message.includes('offline') || message.includes('fetch')) {
          return "Connection error. Please check your internet connection and try again.";
        }
        
        if (message.includes('server error') || message.includes('internal error') || message.includes('server unavailable') || message.includes('service unavailable') || message.includes('gateway')) {
          return "Server error. Please try again in a few moments.";
        }
        
        return error.message as string;
      }
      
      // Handle case where error might have a statusText property
      if ('statusText' in error && typeof error.statusText === 'string') {
        return error.statusText as string;
      }
      
      // Handle case where error might have a response property
      if ('response' in error && error.response && typeof error.response === 'object') {
        const response = error.response as any;
        if (response.status === 401) {
          return "Incorrect email or password. Please check your credentials and try again.";
        }
      }
    }
    
    return "Sign-in failed. Please check your email and password, then try again.";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!acceptTerms) {
      setError("You must accept the terms and conditions to sign in.");
      setIsLoading(false);
      return;
    }
    
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", "signIn");
    
    try {
      await signIn("password", formData);
      
      if (inviteToken) {
        try {
          await acceptInvitation({ inviteToken });
          // Safe router redirect with null check
          if (router && typeof router.push === 'function') {
            router.push("/");
          } else {
            window.location.href = "/";
          }
          return;
        } catch (inviteError) {
          console.error("Failed to accept invitation:", inviteError);
        }
      }
      
      // Safe router redirect with null check
      if (router && typeof router.push === 'function') {
        router.push("/");
      } else {
        window.location.href = "/";
      }
    } catch (error: unknown) {
      console.error("Sign-in error:", error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Header - 56px height */}
      <div className="text-center" style={{ height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 className="font-bold" style={{ fontSize: '56px', lineHeight: '56px', color: '#000000' }}>
          Sign in
        </h1>
      </div>

      {inviteToken && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm" style={{ color: '#000000' }}>
                      <strong>✉️ Organisation Invitation Active</strong><br />
          You&apos;ll automatically join the organisation after signing in.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" style={{ color: '#000000', fontSize: '16px', lineHeight: '24px' }}>
            Email*
          </Label>
          <Input 
            id="email"
            name="email"
            type="email"
            placeholder="john.doe@example.com"
            required
            disabled={isLoading}
            style={{ 
              fontSize: '16px', 
              lineHeight: '24px', 
              color: '#000000',
              backgroundColor: 'white'
            }}
            className="border-gray-300"
          />
        </div>
        
        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" style={{ color: '#000000', fontSize: '16px', lineHeight: '24px' }}>
            Password*
          </Label>
          <div className="relative">
            <Input 
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              style={{ 
                fontSize: '16px', 
                lineHeight: '24px', 
                color: '#000000',
                backgroundColor: 'white',
                paddingRight: '40px'
              }}
              className="border-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" style={{ color: '#000000' }} />
              ) : (
                <Eye className="h-4 w-4" style={{ color: '#000000' }} />
              )}
            </button>
          </div>
          {/* Forgot Password Link */}
          <div className="text-right">
            <a 
              href="/forgot-password"
              className="text-sm underline hover:no-underline"
              style={{ color: '#000000' }}
            >
              Forgot your password?
            </a>
          </div>
        </div>
         
        {/* Terms and conditions */}
         <div className="flex items-start space-x-2">
           <Checkbox 
             id="terms"
             checked={acceptTerms}
             onCheckedChange={(checked) => setAcceptTerms(checked === true)}
             disabled={isLoading}
             className="mt-1"
           />
           <label 
             htmlFor="terms" 
             className="flex flex-wrap items-center gap-1 text-xs leading-4 select-none font-normal text-black"
           >
             By signing in, I have read and I understand and agree to the PillFlow&nbsp;
             <a href="#" className="underline hover:no-underline break-words" onClick={(e) => e.preventDefault()}>Terms of Use</a>
             &nbsp;and&nbsp;
             <a href="#" className="underline hover:no-underline break-words" onClick={(e) => e.preventDefault()}>Data Privacy Notice</a>.
           </label>
         </div>
        
        {error && (
          <div className="text-sm bg-red-50 p-3 rounded-md border border-red-200">
            <p className="font-medium" style={{ color: '#000000' }}>Error:</p>
            <p style={{ color: '#000000' }}>{error}</p>
          </div>
        )}
        
                 {/* Sign in button */}
         <Button 
           type="submit" 
           className="w-full text-white font-bold"
           style={{ 
             backgroundColor: '#000000',
             fontSize: '16px',
             lineHeight: '24px',
             height: '48px'
           }}
           disabled={isLoading}
         >
           {isLoading ? "Loading..." : "Sign in"}
         </Button>
             </form>

      {/* Don't have account link */}
      <div className="text-center">
        <p style={{ color: '#000000', fontSize: '16px', lineHeight: '24px' }}>
          Don&apos;t have an account?{" "}
          <a 
            href="/signup"
            className="underline hover:no-underline"
            style={{ color: '#000000' }}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
} 