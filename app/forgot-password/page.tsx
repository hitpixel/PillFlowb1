"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const requestPasswordReset = useMutation(api.users.requestPasswordReset);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await requestPasswordReset({ email: email.toLowerCase() });
      setIsSubmitted(true);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        setError(error.message);
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Background Image */}
      <div className="relative hidden lg:flex">
        <Image
          src="/PF-login.jpeg"
          alt="PillFlow Healthcare Platform"
          fill
          className="object-cover"
        />
      </div>
      
      {/* Right side - Forgot Password Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Image
              src="/pillflowb.png"
              alt="PillFlow Logo"
              width={120}
              height={32}
              className="rounded-md"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className={cn("flex flex-col gap-6")}>
              {/* Header */}
              <div className="text-center">
                <h1 className="font-bold text-4xl lg:text-5xl xl:text-6xl text-black mb-2">
                  Reset Password
                </h1>
                <p className="text-base lg:text-lg text-black">
                  {isSubmitted 
                    ? "Check your email for reset instructions" 
                    : "Enter your email address and we'll send you a link to reset your password"
                  }
                </p>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-black text-base">
                      Email Address*
                    </Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="text-base border-gray-300 bg-white text-black"
                    />
                  </div>

                  {error && (
                    <div className="text-sm bg-red-50 p-3 rounded-md border border-red-200">
                      <p className="font-medium text-black">Error:</p>
                      <p className="text-black">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full text-white font-bold bg-black hover:bg-gray-800 h-12 text-base"
                    disabled={isLoading || !email.trim()}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <p className="text-green-800 font-medium">✓ Reset link sent!</p>
                    <p className="text-green-700 text-sm mt-1">
                      If an account with that email exists, you&apos;ll receive a password reset link shortly.
                    </p>
                  </div>
                  <p className="text-sm text-black">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail("");
                        setError(null);
                      }}
                      className="underline hover:no-underline text-black font-medium"
                    >
                      try again
                    </button>
                  </p>
                </div>
              )}

              {/* Back to sign in link */}
              <div className="text-center">
                <p className="text-black text-base">
                  Remember your password?{" "}
                  <Link 
                    href="/signin"
                    className="underline hover:no-underline text-black font-medium"
                  >
                    Back to sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 