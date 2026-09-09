"use client";

import React from "react";
import { BorderBeam } from "./border-beam";
import { Plus } from "lucide-react";
import { motion } from "motion/react";

interface AddCardSquareProps {
  onAddManual: () => void;
}

export function AddCardSquare({ onAddManual }: AddCardSquareProps) {
  return (
    <BorderBeam
      borderWidth={1.5}
      duration={4}
      borderRadius="1rem"
      className="shrink-0"
    >
      <div className="w-[187px] h-[187px] bg-[#121316] p-4 flex flex-col items-center justify-center text-center select-none">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAddManual}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 transition-all duration-150 flex items-center justify-center gap-1.5 text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Card</span>
        </motion.button>
      </div>
    </BorderBeam>
  );
}

export default AddCardSquare;
