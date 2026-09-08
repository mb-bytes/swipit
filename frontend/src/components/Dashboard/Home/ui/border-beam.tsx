"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  borderWidth?: number;
  borderRadius?: string;
}

export function BorderBeam({
  children,
  className,
  duration = 4.5,
  borderWidth = 1.5,
  borderRadius = "1rem",
}: BorderBeamProps) {
  const beamGradient =
    "conic-gradient(from 0deg, transparent 0deg, transparent 200deg, rgba(121, 40, 202, 0.7) 240deg, #ec4899 285deg, #f59e0b 325deg, #fef08a 352deg, transparent 360deg)";

  return (
    <div className={cn("relative shrink-0 group select-none", className)}>

      <div
        className="relative overflow-hidden shadow-2xl"
        style={{
          padding: `${borderWidth}px`,
          borderRadius,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration, ease: "linear" }}
          className="absolute -inset-[150%] origin-center pointer-events-none"
          style={{ background: beamGradient }}
        />

        <div
          className="relative z-10 w-full h-full bg-[#131418] overflow-hidden"
          style={{
            borderRadius: `calc(${borderRadius} - ${borderWidth}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default BorderBeam;
