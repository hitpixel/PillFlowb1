"use client";

import { GalleryVerticalEnd, Shield, Users, Activity, CheckCircle } from "lucide-react";
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
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 relative hidden lg:flex flex-col justify-center p-10 text-white">
        <div className="relative z-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm flex size-12 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">PillFlow</h1>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">
              Streamlining Healthcare Medication Management
            </h2>
            
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              PillFlow is Australia&apos;s leading healthcare platform designed specifically for 
              medical professionals, pharmacists, and healthcare organizations. We empower 
              healthcare teams to deliver safer, more efficient patient care through 
              intelligent medication management.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure & Compliant</h3>
                  <p className="text-sm text-blue-100">HIPAA compliant with enterprise-grade security</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-sm text-blue-100">Connect doctors, pharmacists, and care teams</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Activity className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Monitoring</h3>
                  <p className="text-sm text-blue-100">Track medication adherence and patient outcomes</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="size-5" />
                Trusted by Healthcare Professionals
              </h3>
              <p className="text-sm text-blue-100">
                &quot;PillFlow has transformed how we manage patient medications. The platform&apos;s 
                intuitive design and powerful features have improved our workflow efficiency by 40%.&quot;
              </p>
              <p className="text-xs text-blue-200 mt-2 font-medium">
                — Dr. Sarah Chen, Director of Pharmacy, Melbourne Health
              </p>
            </div>
          </div>
        </div>
        
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/placeholder.svg"
            alt="Healthcare professionals using PillFlow"
            fill
            className="object-cover"
          />
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-700/90"></div>
      </div>
    </div>
  );
}
