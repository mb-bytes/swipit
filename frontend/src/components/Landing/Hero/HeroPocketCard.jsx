"use client";

import { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { WifiHigh } from "@phosphor-icons/react";

const CHAMPAGNE_FINISH = {
  id: "champagne",
  name: "Champagne Gold",
  colorScheme: "from-[#282117] via-[#3a3021] to-[#1c160e]",
  border: "border-amber-300/40",
  textColor: "text-amber-50",
  chipColor: "from-yellow-100 via-amber-300 to-amber-500",
  chipLine: "bg-amber-900/45",
  accent: "rgba(251, 191, 36, 0.35)",
  swipColor: "text-amber-100",
  itBg: "bg-amber-300 text-neutral-950",
  dotColor: "bg-amber-300",
};

export function HeroPocketCard() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 22 };
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-9, 9]), springConfig);
  const glareX = useTransform(mouseX, [-1, 1], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-1, 1], ["0%", "100%"]);

  const handlePointerMove = (e) => {
    if (reduceMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center select-none">
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={handlePointerLeave}
        className="relative w-full aspect-[4/3.5] max-w-[540px] flex items-center justify-center cursor-pointer"
        style={{ perspective: 1200 }}
      >
        <motion.div
          style={{
            rotateX: reduceMotion ? 0 : rotateX,
            rotateY: reduceMotion ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <div
            className="absolute -bottom-2 w-[84%] h-16 bg-neutral-900/12 rounded-full blur-2xl pointer-events-none transition-all duration-500"
            style={{
              transform: isHovered ? "scale(1.08) translateY(8px)" : "scale(1)",
              opacity: isHovered ? 0.22 : 0.14,
            }}
          />

          <div
            className="relative w-[390px] sm:w-[450px] md:w-[475px] lg:w-[490px] h-[370px] sm:h-[410px] lg:h-[430px] flex flex-col justify-end"
            style={{
              transform: "translateZ(0px)",
            }}
          >
            <div className="absolute inset-x-0 bottom-0 top-10 rounded-2xl bg-gradient-to-b from-[#eee8dc] via-[#e5ded1] to-[#d7cfc0] border border-[#cfc6b5] shadow-[0_24px_50px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none opacity-45 mix-blend-multiply"
                style={{
                  backgroundImage: `radial-gradient(#a39989 0.85px, transparent 0.85px)`,
                  backgroundSize: "6px 6px",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 4px)`,
                }}
              />
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#af9f86]/70 via-[#cdc1ac]/30 to-transparent pointer-events-none" />
            </div>

            <motion.div
              animate={{
                y: isHovered ? -66 : 66,
                rotateZ: isHovered ? 0 : -2.5,
                scale: isHovered ? 1.03 : 0.98,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 24,
              }}
              className={`absolute left-1/2 -translate-x-1/2 w-[355px] sm:w-[415px] md:w-[440px] lg:w-[455px] h-[225px] sm:h-[255px] lg:h-[270px] rounded-2xl p-6 sm:p-8 text-white shadow-2xl bg-gradient-to-br ${CHAMPAGNE_FINISH.colorScheme} border ${CHAMPAGNE_FINISH.border} overflow-hidden z-10`}
              style={{
                top: 8,
                transformStyle: "preserve-3d",
                boxShadow: isHovered
                  ? `0 40px 80px -15px ${CHAMPAGNE_FINISH.accent}, 0 0 0 1px rgba(255,255,255,0.22)`
                  : "0 16px 32px -8px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div
                className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)`,
                }}
              />

              <motion.div
                className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-35"
                style={{
                  background: useTransform(
                    [glareX, glareY],
                    ([gx, gy]) =>
                      `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.75) 0%, transparent 60%)`
                  ),
                }}
              />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-9 rounded-[7px] bg-gradient-to-tr ${CHAMPAGNE_FINISH.chipColor} border border-amber-200/50 shadow-inner flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className={`w-full h-[1px] ${CHAMPAGNE_FINISH.chipLine} absolute top-2.5`} />
                    <div className={`w-full h-[1px] ${CHAMPAGNE_FINISH.chipLine} absolute bottom-2.5`} />
                    <div className={`h-full w-[1px] ${CHAMPAGNE_FINISH.chipLine} absolute left-3.5`} />
                    <div className={`h-full w-[1px] ${CHAMPAGNE_FINISH.chipLine} absolute right-3.5`} />
                    <div className="w-3.5 h-3 rounded-[3px] border border-amber-900/35" />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <WifiHigh weight="bold" className="w-5 h-5 text-white/70 rotate-90" />
                    <span className="text-[11px] font-mono tracking-widest uppercase text-white/60 font-medium">
                      Infinite
                    </span>
                  </div>
                </div>

                <div className="my-auto flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${CHAMPAGNE_FINISH.swipColor} font-sans`}>
                      Swip
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-mono font-bold px-2 py-0.5 rounded-[5px] tracking-wide ${CHAMPAGNE_FINISH.itBg}`}
                    >
                      IT
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/70">
                  <span className="tracking-widest font-semibold">•••• 8842</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase text-white/80">
                    <span className={`w-1.5 h-1.5 rounded-full ${CHAMPAGNE_FINISH.dotColor}`} />
                    Smart Sync
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="relative z-20 w-full h-[180px] sm:h-[200px] lg:h-[215px] filter drop-shadow-[0_-10px_24px_rgba(0,0,0,0.12)]">
              <svg
                className="w-full h-full block"
                viewBox="0 0 500 220"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="flapLinenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5f0e6" />
                    <stop offset="30%" stopColor="#ece5d8" />
                    <stop offset="100%" stopColor="#ddd4c4" />
                  </linearGradient>

                  <filter id="threadShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="1.4" stdDeviation="0.8" floodColor="#3d070c" floodOpacity="0.4" />
                  </filter>
                </defs>

                <path
                  d="M 0 32 L 130 32 L 250 68 L 370 32 L 500 32 L 500 206 Q 500 220 486 220 L 14 220 Q 0 220 0 206 Z"
                  fill="url(#flapLinenGrad)"
                  stroke="#c5b9a4"
                  strokeWidth="1.2"
                />

                <path
                  d="M 14 44 L 132 44 L 250 80 L 368 44 L 486 44"
                  fill="none"
                  stroke="#981522"
                  strokeWidth="3.2"
                  strokeDasharray="9 6"
                  strokeLinecap="round"
                  filter="url(#threadShadow)"
                />

                <path
                  d="M 14 56 L 14 204 Q 14 208 18 208 L 482 208 Q 486 208 486 204 L 486 56"
                  fill="none"
                  stroke="#981522"
                  strokeWidth="3.2"
                  strokeDasharray="9 6"
                  strokeLinecap="round"
                  filter="url(#threadShadow)"
                />
              </svg>

              <div
                className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply"
                style={{
                  backgroundImage: `radial-gradient(#877b6c 0.9px, transparent 0.9px)`,
                  backgroundSize: "6px 6px",
                  clipPath: "polygon(0% 15%, 26% 15%, 50% 31%, 74% 15%, 100% 15%, 100% 100%, 0% 100%)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default HeroPocketCard;
