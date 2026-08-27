"use client";

import { motion, useSpring } from "framer-motion";
import { useSmoothScroll } from "./smooth-scroll-context";
import { cn } from "@/lib/utils";

export function ScrollProgress({
  variant = "bar",
  position = "top",
  height = 3,
  size = 36,
  thickness = 3,
  fixed = true,
  spring = true,
  progress,
  className,
  ...props
}) {
  const { progress: pageProgress } = useSmoothScroll();
  const currentProgress = progress !== undefined ? progress : pageProgress;

  const smoothProgress = useSpring(currentProgress, {
    stiffness: spring ? 180 : 1000,
    damping: spring ? 30 : 0,
    restDelta: 0.001,
  });

  if (variant === "circle") {
    const center = size / 2;
    const radius = center - thickness;
    const circumference = 2 * Math.PI * radius;

    return (
      <div
        className={cn(
          fixed ? "fixed z-50" : "relative",
          "flex items-center justify-center",
          className
        )}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-neutral-300 dark:text-neutral-700 opacity-30"
            fill="none"
          />
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className="text-[#e8590c]"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDashoffset: spring
                ? smoothProgress
                : `${circumference * (1 - (currentProgress || 0))}`,
            }}
          />
        </svg>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        fixed ? "fixed inset-x-0 z-50" : "absolute inset-x-0",
        position === "top" ? "top-0" : "bottom-0",
        "origin-left bg-[#e8590c]",
        className
      )}
      style={{
        height,
        scaleX: spring ? smoothProgress : currentProgress,
      }}
      {...props}
    />
  );
}
