"use client";
import React from "react";
import { motion } from "motion/react";
import { LampContainer } from "@/components/ui/lamp";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <LampContainer>
      <motion.div
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 flex flex-col items-center text-center space-y-6"
      >
        <h1 className="bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          Looks like this page went dark.
        </h1>
        
        <p className="bg-gradient-to-br from-slate-400 to-slate-600 bg-clip-text text-lg text-transparent md:text-xl max-w-2xl">
          Don&apos;t worry — we&apos;ll guide you back to the light.
        </p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            duration: 0.6,
            ease: "easeInOut",
          }}
          className="pt-4"
        >
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 font-semibold px-8 py-3 text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
            >
              <Home className="mr-2 h-5 w-5" />
              Take me home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </LampContainer>
  );
} 