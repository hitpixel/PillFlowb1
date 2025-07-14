"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useConvexAuth } from "convex/react";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  
  const verifyOTP = useMutation(api.users.verifyOTP);
  const resendOTP = useMutation(api.users.resendOTP);
  const checkOTPVerification = useQuery(api.users.checkOTPVerification);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  // Check if user has already verified OTP
  useEffect(() => {
    if (checkOTPVerification?.isVerified) {
      router.push("/setup");
    }
  }, [checkOTPVerification, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOTPChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;
    
    const newOTP = [...otp];
    newOTP[index] = value.slice(-1); // Only take the last character
    setOtp(newOTP);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all 6 digits are entered
    if (newOTP.every(digit => digit !== "") && value) {
      handleSubmit(newOTP.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (otpCode?: string) => {
    const code = otpCode || otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await verifyOTP({ otp: code });
      router.push("/setup");
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        setError(error.message);
      } else {
        setError("Failed to verify code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);

    try {
      await resendOTP();
      setCountdown(60); // 60 second cooldown
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        setError(error.message);
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  // Show loading while checking auth
  if (authLoading || checkOTPVerification === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-base text-black">Loading...</p>
        </div>
      </div>
    );
  }

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
      
      {/* Right side - OTP Verification Form */}
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
                  Verify Email
                </h1>
                <p className="text-base lg:text-lg text-black">
                  We&apos;ve sent a 6-digit verification code to your email address. Please enter it below to continue.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {checkOTPVerification?.hasActivePendingOTP && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    📧 We&apos;ve sent a verification code to your email. Please check your inbox and enter the 6-digit code below.
                  </p>
                </div>
              )}

              {/* OTP Input */}
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-black"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => handleSubmit()}
                  disabled={isLoading || otp.some(digit => digit === "")}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn&apos;t receive the code?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={isResending || countdown > 0}
                  className="text-black border-black hover:bg-gray-100"
                >
                  {isResending 
                    ? "Sending..." 
                    : countdown > 0 
                    ? `Resend in ${countdown}s`
                    : "Resend Code"
                  }
                </Button>
              </div>

              {/* Help text */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  The verification code will expire in 10 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 