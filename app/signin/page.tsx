"use client";

import Link from "next/link";
import Image from "next/image";
import { SignInForm } from "@/components/signin-form";

export default function SignInPage() {
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
      
      {/* Right side - Sign In Form */}
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
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}
