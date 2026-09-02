import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation } from "motion/react";
import { NOT_FOUND_DEFAULTS, NotFoundActions, NotFoundStage } from "./shared";
import { cn } from "@/lib/utils";

const GLYPHS = "0123456789!@#$%^&*<>[]{}?/\\|~";

export function NotFoundGlitch({
  code = NOT_FOUND_DEFAULTS.code,
  title = NOT_FOUND_DEFAULTS.title,
  description = NOT_FOUND_DEFAULTS.description,
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel = NOT_FOUND_DEFAULTS.homeLabel,
  browseHref = NOT_FOUND_DEFAULTS.browseHref,
  browseLabel = NOT_FOUND_DEFAULTS.browseLabel,
  className,
}) {
  const [displayText, setDisplayText] = useState(code);
  const [isGlitching, setIsGlitching] = useState(false);
  const intervalRef = useRef(null);

  const triggerScramble = useCallback(() => {
    let iteration = 0;
    const maxIterations = 14;
    clearInterval(intervalRef.current);
    setIsGlitching(true);

    intervalRef.current = setInterval(() => {
      setDisplayText(() =>
        code
          .split("")
          .map((char, index) => {
            if (index < iteration / 4) {
              return code[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );

      if (iteration >= maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(code);
        setIsGlitching(false);
      }

      iteration += 1;
    }, 45);
  }, [code]);

  useEffect(() => {
    triggerScramble();
    return () => clearInterval(intervalRef.current);
  }, [triggerScramble]);

  return (
    <NotFoundStage className={className}>
      {/* Glitch Digit Container */}
      <div
        className="relative group cursor-pointer my-2 select-none"
        onMouseEnter={() => {
          triggerScramble();
        }}
      >
        {/* Layer 1: Cyan / Blue Chromatic Shift */}
        <motion.span
          aria-hidden="true"
          animate={
            isGlitching
              ? {
                  x: [-6, 6, -3, 4, 0],
                  y: [2, -3, 3, -1, 0],
                  opacity: [0.9, 1, 0.8, 1],
                }
              : { x: -4, y: 0, opacity: 0.85 }
          }
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-8xl sm:text-9xl md:text-[11.5rem] font-black tracking-tight text-[#00f0ff] pointer-events-none select-none filter blur-[0.3px]"
          style={{ mixBlendMode: "screen" }}
        >
          {displayText}
        </motion.span>

        {/* Layer 2: Red / Rose Chromatic Shift */}
        <motion.span
          aria-hidden="true"
          animate={
            isGlitching
              ? {
                  x: [6, -5, 4, -3, 0],
                  y: [-3, 2, -2, 3, 0],
                  opacity: [0.9, 1, 0.8, 1],
                }
              : { x: 4, y: 0, opacity: 0.85 }
          }
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center text-8xl sm:text-9xl md:text-[11.5rem] font-black tracking-tight text-[#ff0055] pointer-events-none select-none filter blur-[0.3px]"
          style={{ mixBlendMode: "screen" }}
        >
          {displayText}
        </motion.span>

        {/* Main Base Text */}
        <motion.h1
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-8xl sm:text-9xl md:text-[11.5rem] font-black tracking-tight text-white leading-none z-10 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
        >
          {displayText}
        </motion.h1>

        {/* Subtle slice lines during glitch */}
        {isGlitching && (
          <>
            <div className="absolute top-[35%] inset-x-0 h-1 bg-white/20 backdrop-invert pointer-events-none" />
            <div className="absolute top-[65%] inset-x-0 h-0.5 bg-[#00f0ff]/40 pointer-events-none" />
          </>
        )}
      </div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-4"
      >
        {title}
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-sm sm:text-base text-stone-400 max-w-md mt-2.5 leading-relaxed font-normal"
      >
        {description}
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <NotFoundActions
          homeHref={homeHref}
          homeLabel={homeLabel}
          browseHref={browseHref}
          browseLabel={browseLabel}
        />
      </motion.div>
    </NotFoundStage>
  );
}

export default NotFoundGlitch;
