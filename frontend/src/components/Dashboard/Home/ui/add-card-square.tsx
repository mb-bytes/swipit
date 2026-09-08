"use client";

import React from "react";
import { BorderBeam } from "./border-beam";
import { RefreshCw, Plus } from "lucide-react";
import { motion } from "motion/react";

interface AddCardSquareProps {
  onSyncCards: () => void;
  onAddManual: () => void;
  isSyncing?: boolean;
}

export function AddCardSquare({
  onSyncCards,
  onAddManual,
  isSyncing = false,
}: AddCardSquareProps) {
  return (
    <BorderBeam
      borderWidth={1.5}
      duration={4}
      borderRadius="1rem"
      className="shrink-0"
    >
      <div className="w-[187px] h-[187px] bg-[#121316] p-4 flex flex-col items-center justify-center text-center select-none">
        <div className="flex flex-col items-center justify-center w-full gap-2.5">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSyncCards}
            disabled={isSyncing}
            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/[0.08] hover:border-white/20 transition-all duration-150 flex items-center justify-center gap-2 text-xs font-medium shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-300 ${
                isSyncing ? "animate-spin" : ""
              }`}
            />
            <span>{isSyncing ? "Syncing..." : "Sync Cards"}</span>
          </motion.button>

          <span className="text-[11px] font-mono text-neutral-500 lowercase">
            or
          </span>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddManual}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 transition-all duration-150 flex items-center justify-center gap-1.5 text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Manually</span>
          </motion.button>
        </div>
      </div>
    </BorderBeam>
  );
}

export default AddCardSquare;
