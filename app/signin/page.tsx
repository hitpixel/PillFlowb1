"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ConvexLoginForm } from "@/components/convex-login-form";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Login Form */}
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
            <ConvexLoginForm />
          </div>
        </div>
      </div>
      
      {/* Right side - Branding and Image */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 relative hidden lg:flex flex-col justify-center items-center p-10 text-white">
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm flex size-12 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">PillFlow</h1>
            </div>
            
            <h2 className="text-2xl font-semibold mb-6">
              Healthcare Medication Management
            </h2>
            
            <p className="text-lg text-blue-100 mb-8 leading-relaxed max-w-md">
              Streamlining medication management for healthcare professionals across Australia.
            </p>
          </div>
          
          {/* PF-login Image */}
          <div className="relative w-80 h-64 mx-auto mb-6 rounded-lg overflow-hidden shadow-2xl">
            <Image
              src="/PF-login.jpeg"
              alt="PillFlow Healthcare Platform"
              fill
              className="object-cover"
            />
          </div>
          
          <p className="text-sm text-blue-200 italic">
            "Transforming healthcare workflows with intelligent solutions"
          </p>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90"></div>
      </div>
    </div>
  );
}
