import React from "react";
import ArrowRevealButton from "@/components/ui/arrow-button";

export function WelcomeScreen({ onStart }) {
  return (
    <div className="flex-1 w-full rounded-3xl border border-neutral-300/90 bg-[#f2eee5]/85 backdrop-blur-xs shadow-xs overflow-hidden flex flex-col justify-between min-h-0">
      <div className="flex items-center justify-between border-b border-neutral-300/90 px-6 sm:px-8 py-3.5 bg-[#eae5d9]/90 text-xs font-mono font-bold text-neutral-600 tracking-wider">
        <span> Step [00 / 03] </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-10 lg:p-12 bg-white/70 overflow-y-auto">
        <span className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider font-mono block mb-2 sm:mb-3">
          Personalized Recommendations For You
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111215] mb-3 sm:mb-4">
          TUNE YOUR WALLET
        </h2>

        <p className="text-base sm:text-lg font-semibold text-neutral-800 mb-2 sm:mb-3 max-w-xl leading-relaxed">
          This section gives you the cards your wallet needs the most.
        </p>

        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mb-8 leading-relaxed">
          The cards recommended will be based on your spends for the last 4
          months, and a few quick questions covering your preferred category,
          merchant, and bank choices.
        </p>

        <ArrowRevealButton
          onClick={onStart}
          label="LET'S GO"
          fill="#111215"
          textColor="#f2eee5"
          icon={{
            side: "left",
            background: "#c2571a",
            color: "#ffffff",
            type: "icon",
            icon: "arrow",
            size: 16,
            badgeSize: 34,
          }}
          gap={14}
          padding="7px 22px 7px 7px"
          rounded={100}
        />
      </div>
    </div>
  );
}
