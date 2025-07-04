"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ConvexLoginFormProps {
  className?: string;
}

export function ConvexLoginForm({
  className,
}: ConvexLoginFormProps) {
  const { signIn } = useAuthActions();
  const createUserProfile = useMutation(api.users.createUserProfile);
  const router = useRouter();
  
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      const message = error.message.toLowerCase();
      
      // Handle common authentication errors
      if (message.includes('invalid credentials') || message.includes('invalid email or password')) {
        return "Invalid email or password. Please check your credentials and try again.";
      }
      
      if (message.includes('email already exists') || message.includes('account already exists')) {
        return "An account with this email already exists. Please try signing in instead.";
      }
      
      if (message.includes('password')) {
        if (message.includes('too short')) {
          return "Password must be at least 8 characters long.";
        }
        if (message.includes('too weak')) {
          return "Password is too weak. Please use a stronger password with letters, numbers, and symbols.";
        }
        return "Invalid password. Please check and try again.";
      }
      
      if (message.includes('email')) {
        if (message.includes('invalid format') || message.includes('invalid email')) {
          return "Please enter a valid email address.";
        }
        return "There's an issue with the email address. Please check and try again.";
      }
      
      if (message.includes('network') || message.includes('connection')) {
        return "Connection error. Please check your internet connection and try again.";
      }
      
      if (message.includes('rate limit') || message.includes('too many requests')) {
        return "Too many attempts. Please wait a few minutes before trying again.";
      }
      
      return error.message as string;
    }
    
    // Fallback error messages
    if (flow === 'signUp') {
      return "Failed to create account. Please check your information and try again.";
    } else {
      return "Failed to sign in. Please check your credentials and try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);
    
    try {
      await signIn("password", formData);
      
      if (flow === "signUp") {
        // Store signup data in localStorage temporarily for setup page
        localStorage.setItem("signupData", JSON.stringify({
          firstName: formData.get("name") as string,
          lastName: formData.get("lastName") as string,
          email: formData.get("email") as string,
        }));
        // Redirect to setup - profile creation will happen there
        router.push("/setup");
      } else {
        // Sign in - redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {flow === "signIn" ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {flow === "signIn" 
              ? "Enter your email and password to sign in to your account" 
              : "Enter your details to create a new account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {flow === "signUp" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">First Name</Label>
                    <Input 
                      id="firstName"
                      name="name"
                      type="text"
                      placeholder="John"
                      required
                      disabled={isLoading}
                      minLength={2}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      disabled={isLoading}
                      minLength={2}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                name="password"
                type="password"
                placeholder={flow === "signIn" ? "Enter your password" : "Create a password (min 8 characters)"}
                required
                disabled={isLoading}
                minLength={flow === "signUp" ? 8 : undefined}
              />
              {flow === "signUp" && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : (flow === "signIn" ? "Sign In" : "Create Account")}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            {flow === "signIn" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setFlow("signUp");
                    setError(null);
                  }}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setFlow("signIn");
                    setError(null);
                  }}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 