"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthActions } from "@convex-dev/auth/react";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  // Check if passwords match whenever they change
  useEffect(() => {
    if (confirmPassword === "") {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(newPassword === confirmPassword);
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!passwordsMatch) {
      setError("Passwords do not match. Please make sure both password fields are identical.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (!email) {
      setError("Email is required. Please go back to forgot password and request a new code.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("code", code);
      formData.append("newPassword", newPassword);
      formData.append("flow", "reset-verification");
      
      await signIn("password", formData);
      setIsCompleted(true);
      
      // Redirect to signin after 2 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        setError(error.message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { signIn } = useAuthActions();

  if (!email) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden lg:flex">
          <Image
            src="/PF-login.jpeg"
            alt="PillFlow Healthcare Platform"
            fill
            className="object-cover"
          />
        </div>
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
            <div className="w-full max-w-md text-center space-y-4">
              <h1 className="font-bold text-4xl text-black">Invalid Request</h1>
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <p className="text-red-800 font-medium">✗ Email not provided</p>
                <p className="text-red-700 text-sm mt-1">
                  Please go back to forgot password and request a new reset code.
                </p>
              </div>
              <Link href="/forgot-password">
                <Button className="w-full bg-black hover:bg-gray-800 text-white">
                  Request New Reset Code
                </Button>
              </Link>
            </div>
          </div>
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
      
      {/* Right side - Reset Password Form */}
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
                  Set New Password
                </h1>
                <p className="text-base lg:text-lg text-black">
                  {isCompleted 
                    ? "Password successfully reset!" 
                    : `Enter the reset code sent to ${email} and create a new password`
                  }
                </p>
              </div>

              {!isCompleted ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Reset Code */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="code" className="text-black text-base">
                      Reset Code*
                    </Label>
                    <Input 
                      id="code"
                      type="text"
                      placeholder="Enter 8-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      maxLength={8}
                      disabled={isLoading}
                      className="text-base border-gray-300 bg-white text-black"
                    />
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="newPassword" className="text-black text-base">
                      New Password*
                    </Label>
                    <div className="relative">
                      <Input 
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password (min 8 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        disabled={isLoading}
                        className="text-base border-gray-300 bg-white text-black pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword" className="text-black text-base">
                      Confirm New Password*
                    </Label>
                    <div className="relative">
                      <Input 
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className={cn(
                          "text-base border-gray-300 bg-white text-black pr-10",
                          !passwordsMatch && confirmPassword !== "" && "border-red-500"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {!passwordsMatch && confirmPassword !== "" && (
                      <p className="text-sm text-red-600">Passwords do not match</p>
                    )}
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
                    disabled={isLoading || !code.trim() || !newPassword.trim() || !passwordsMatch || newPassword.length < 8}
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <p className="text-green-800 font-medium">✓ Password reset completed!</p>
                    <p className="text-green-700 text-sm mt-1">
                      Your password has been successfully reset. Redirecting to sign in...
                    </p>
                  </div>
                  <Link href="/signin">
                    <Button className="w-full bg-black hover:bg-gray-800 text-white">
                      Continue to Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {/* Back to sign in link */}
              {!isCompleted && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}