"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export function Parallax({
  children,
  speed = 0.3,
  axis = "y",
  container,
  spring = true,
  className,
  ...props
}) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    container: container?.current ? container : undefined,
    offset: ["start end", "end start"],
  });

  const distance = speed * 150;
  const rawOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [-distance, distance]
  );

  const smoothOffset = useSpring(rawOffset, {
    stiffness: spring ? 120 : 1000,
    damping: spring ? 25 : 0,
  });

  const transformStyle =
    axis === "x"
      ? { x: spring ? smoothOffset : rawOffset }
      : { y: spring ? smoothOffset : rawOffset };

  return (
    <motion.div
      ref={ref}
      style={transformStyle}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
