import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeScreen({ onStart }) {
  return (
    <div className="flex-1 w-full rounded-3xl border border-neutral-300/90 bg-[#f2eee5]/85 backdrop-blur-xs shadow-xs overflow-hidden flex flex-col justify-between min-h-0">
      <div className="flex items-center justify-between border-b border-neutral-300/90 px-6 sm:px-8 py-3.5 bg-[#eae5d9]/90 text-xs font-mono font-bold text-neutral-600 tracking-wider">
        <span>[ OPTIMIZER ]</span>
        <span>[ 00 / 03 ]</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-14 lg:p-20 bg-white/70">
        <span className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider font-mono block mb-3">
          Personalized Recommendations For You
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] mb-4">
          [ TUNE YOUR WALLET ]
        </h2>

        <p className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 max-w-xl leading-relaxed">
          This section gives you the cards your wallet needs the most.
        </p>

        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mb-10 leading-relaxed">
          The cards recommended will be based on your spends for the last 4 months, and a few quick questions covering your preferred category, merchant, and bank choices.
        </p>

        <Button
          onClick={onStart}
          className="h-12 px-10 bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 rounded-xl font-bold text-sm tracking-wider uppercase shadow-md flex items-center gap-2.5 cursor-pointer group"
        >
          <span>Lets GO</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-amber-400" />
        </Button>
      </div>
    </div>
  );
}
