"use client";

import React from "react";
import { BorderBeam } from "border-beam";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { motion } from "motion/react";

interface AddCardSquareProps {
  onAddManual: () => void;
}

export function AddCardSquare({ onAddManual }: AddCardSquareProps) {
  return (
    <BorderBeam
      size="line"
      colorVariant="colorful"
      theme="dark"
      borderRadius={18}
      className="shrink-0"
    >
      <div className="w-[187px] h-[187px] rounded-2xl bg-[#121316] p-4 flex flex-col items-center justify-center text-center select-none shadow-sm relative">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAddManual}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 transition-all duration-150 flex items-center justify-center gap-1.5 text-xs font-bold shadow-md cursor-pointer"
        >
          <HugeIcon icon={Add01Icon} size={14} strokeWidth={2.5} />
          <span>Add Card</span>
        </motion.button>
      </div>
    </BorderBeam>
  );
}

export default AddCardSquare;
