"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export function ScrollReveal({
  children,
  y = 20,
  blur = 6,
  duration = 0.6,
  delay = 0,
  once = true,
  amount = 0.2,
  root,
  className,
  ...props
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    root: root || undefined,
    once,
    amount,
  });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y,
        filter: `blur(${blur}px)`,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }
          : {
              opacity: 0,
              y,
              filter: `blur(${blur}px)`,
            }
      }
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
