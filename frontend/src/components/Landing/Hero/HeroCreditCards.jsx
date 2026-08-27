import { useState } from "react";
import { motion } from "framer-motion";
import { WifiHigh, ShieldCheck } from "@phosphor-icons/react";

export function HeroCreditCards() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const cards = [
    {
      id: "axis",
      bank: "AXIS BANK",
      name: "Magnus Privilege",
      number: "•••• •••• •••• 8842",
      multiplier: "5.4x Edge Points",
      colorScheme: "from-[#1a1215] via-[#2d1b22] to-[#120a0e]",
      accentGlow: "rgba(225, 29, 72, 0.4)",
      borderColor: "border-rose-900/40",
      topCategory: "Travel & Dining",
      rotation: -5,
      yOffset: 0,
      badge: "Best for Travel",
    },
    {
      id: "federal",
      bank: "FEDERAL BANK",
      name: "Scapia Co-Branded",
      number: "•••• •••• •••• 3019",
      multiplier: "10% Zero Forex Coins",
      colorScheme: "from-[#081826] via-[#0f2d47] to-[#040e17]",
      accentGlow: "rgba(14, 165, 233, 0.4)",
      borderColor: "border-sky-900/40",
      topCategory: "International & Shopping",
      rotation: 5,
      yOffset: 28,
      badge: "Zero Forex",
    },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none flex flex-col items-center">
      <div className="relative w-full h-[400px] sm:h-[440px] flex items-center justify-center">
        {cards.map((card, idx) => {
          const isHovered = hoveredCard === card.id;
          const isOtherHovered = hoveredCard && hoveredCard !== card.id;

          return (
            <motion.div
              key={card.id}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={{ opacity: 0, y: 40, rotate: card.rotation }}
              animate={{
                opacity: 1,
                y: isHovered ? -16 : card.yOffset,
                rotate: isHovered ? 0 : isOtherHovered ? (card.rotation > 0 ? 10 : -10) : card.rotation,
                scale: isHovered ? 1.04 : isOtherHovered ? 0.96 : 1,
                zIndex: isHovered ? 30 : idx === 0 ? 20 : 10,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 22,
              }}
              className={`absolute w-[310px] sm:w-[350px] h-[195px] sm:h-[215px] rounded-2xl p-5 sm:p-6 text-white shadow-2xl cursor-pointer bg-gradient-to-br ${card.colorScheme} border ${card.borderColor} backdrop-blur-xl overflow-hidden group select-none`}
              style={{
                boxShadow: isHovered
                  ? `0 25px 50px -12px ${card.accentGlow}, 0 0 0 1px rgba(255,255,255,0.15)`
                  : "0 20px 35px -10px rgba(0, 0, 0, 0.35)",
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none holo-gradient mix-blend-overlay" />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
                      {card.bank}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-neutral-100 tracking-tight">
                      {card.name}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-neutral-200">
                    <ShieldCheck weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
                    {card.badge}
                  </span>
                </div>

                <div className="flex items-center gap-3 my-auto">
                  <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-yellow-100 border border-amber-300/50 shadow-inner flex items-center justify-center relative overflow-hidden">
                    <div className="w-full h-[1px] bg-amber-700/40 absolute top-2" />
                    <div className="w-full h-[1px] bg-amber-700/40 absolute bottom-2" />
                    <div className="h-full w-[1px] bg-amber-700/40 absolute left-3" />
                  </div>
                  <WifiHigh weight="bold" className="w-4 h-4 text-neutral-400 rotate-90" />
                  <span className="ml-auto font-mono text-xs sm:text-sm text-neutral-300 tracking-wider">
                    {card.number}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">
                      Active Multiplier
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-amber-400">
                      {card.multiplier}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">
                      Category
                    </span>
                    <span className="text-xs font-medium text-neutral-200">
                      {card.topCategory}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-neutral-300 shadow-xs"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs font-mono font-medium text-neutral-800">
          Live Axis & Federal Gmail Sync
        </span>
        <span className="text-[11px] font-semibold text-[#d9480f] font-mono px-2 py-0.5 bg-orange-100/60 rounded-full border border-orange-200">
          0ms Latency
        </span>
      </motion.div>
    </div>
  );
}

export default HeroCreditCards;
