"use client";

import React from "react";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, X } from "lucide-react";

interface UnmatchedBannerProps {
  count: number;
  onReview: () => void;
  onDismiss: () => void;
  onDeleteAll?: () => void;
}

export function UnmatchedBanner({ count, onReview, onDismiss, onDeleteAll }: UnmatchedBannerProps) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-amber-900 shadow-xs"
    >
      <div className="shrink-0 rounded-lg bg-amber-400/30 p-1.5">
        <AlertTriangle className="w-4 h-4 text-amber-700" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">
          {count} transaction{count !== 1 ? "s" : ""} couldn&apos;t be matched to a card
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          These were parsed from your bank emails but need a card assigned.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onDeleteAll && (
          <button
            type="button"
            onClick={onDeleteAll}
            className="inline-flex items-center rounded-xl border border-red-300/80 bg-white/80 hover:bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-all active:scale-98 cursor-pointer"
          >
            Delete all
          </button>
        )}

        <button
          type="button"
          onClick={onReview}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-3 py-1.5 text-xs font-bold text-neutral-950 transition-all active:scale-98 cursor-pointer"
        >
          <span>Review & assign</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="text-amber-600 hover:text-amber-900 rounded-md p-1 hover:bg-amber-100 transition-colors cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default UnmatchedBanner;
