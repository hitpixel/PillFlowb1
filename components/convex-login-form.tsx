"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConvexLoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set("flow", flow);
    
    try {
      await signIn("password", formData);
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {flow === "signIn" ? "Login to your account" : "Create an account"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {flow === "signIn" 
            ? "Enter your email below to login to your account"
            : "Enter your email below to create your account"
          }
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com" 
            required 
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {flow === "signIn" && (
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            )}
          </div>
          <Input 
            id="password" 
            name="password"
            type="password" 
            required 
            disabled={isLoading}
          />
        </div>
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-3">
            <p className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </p>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading 
            ? "Loading..." 
            : flow === "signIn" 
              ? "Sign in" 
              : "Create account"
          }
        </Button>
      </div>
      <div className="text-center text-sm">
        {flow === "signIn" 
          ? "Don't have an account? " 
          : "Already have an account? "
        }
        <button
          type="button"
          className="underline underline-offset-4 hover:no-underline"
          onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          disabled={isLoading}
        >
          {flow === "signIn" ? "Sign up" : "Sign in"}
        </button>
      </div>
    </form>
  );
} 