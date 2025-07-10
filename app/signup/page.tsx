"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SignUpForm } from "@/components/signup-form";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Background Image */}
      <div className="relative hidden lg:flex">
        {/* Background Image */}
        <Image
          src="/PF-login.jpeg"
          alt="PillFlow Healthcare Platform"
          fill
          className="object-cover"
        />
      </div>
      
      {/* Right side - Sign Up Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            PillFlow
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
} 