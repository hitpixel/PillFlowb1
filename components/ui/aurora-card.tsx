"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraCardProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraCard = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraCardProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col bg-zinc-50 text-slate-950 dark:bg-zinc-900 dark:text-white overflow-hidden border rounded-lg",
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-lg"
        style={
          {
            "--aurora":
              "repeating-linear-gradient(100deg,#2563eb_10%,#8b5cf6_15%,#3b82f6_20%,#6366f1_25%,#1d4ed8_30%)",
            "--dark-gradient":
              "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
            "--white-gradient":
              "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",

            "--blue-300": "#93c5fd",
            "--blue-400": "#60a5fa",
            "--blue-500": "#2563eb",
            "--indigo-300": "#8b5cf6",
            "--violet-200": "#6366f1",
            "--black": "#000",
            "--white": "#fff",
            "--transparent": "transparent",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            `aurora-card-animated pointer-events-none absolute -inset-[5px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-70 blur-[8px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:mix-blend-difference after:content-[""] dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,

            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
          )}
        ></div>
      </div>
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}; 