import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass, House } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export const NOT_FOUND_DEFAULTS = {
  code: "404",
  title: "Page not found",
  description: "The page you are looking for moved, vanished, or never existed.",
  homeHref: "/",
  homeLabel: "Back home",
  browseHref: "/dashboard",
  browseLabel: "Go to Dashboard",
};

export function NotFoundStage({
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "relative min-h-[100dvh] w-full bg-[#0d0e11] text-[#f2eee5] flex flex-col items-center justify-center p-6 overflow-hidden select-none",
        className
      )}
    >
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-radial from-cyan-500/10 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
        {children}
      </div>
    </div>
  );
}

export function NotFoundActions({
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel = NOT_FOUND_DEFAULTS.homeLabel,
  browseHref = NOT_FOUND_DEFAULTS.browseHref,
  browseLabel = NOT_FOUND_DEFAULTS.browseLabel,
  className,
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3.5 mt-8", className)}>
      <Link
        to={homeHref}
        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#0f1013] font-medium text-sm transition-all duration-200 hover:bg-stone-200 active:scale-95 shadow-lg shadow-black/30"
      >
        <House weight="bold" className="w-4 h-4" />
        <span>{homeLabel}</span>
      </Link>

      <Link
        to={browseHref}
        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#181a1f] border border-white/10 text-stone-200 font-medium text-sm transition-all duration-200 hover:bg-[#22252c] hover:border-white/20 hover:text-white active:scale-95 shadow-md shadow-black/20"
      >
        <Compass weight="bold" className="w-4 h-4 text-stone-400" />
        <span>{browseLabel}</span>
      </Link>
    </div>
  );
}
