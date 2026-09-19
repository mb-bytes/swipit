import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  EnvelopeSimple,
  ShieldCheck,
  TrendUp,
  Sparkle,
  Plus,
  AirplaneTilt,
  CheckCircle,
  FolderSimple,
  LockKey,
  ForkKnife,
  ArrowsLeftRight,
  Receipt,
  CalendarCheck,
  Check,
  ChartBar,
} from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { BankRequestModal } from "./BankRequestModal";

function SkeletonOne() {
  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[240px] flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-b from-neutral-50/90 to-neutral-100/60 rounded-2xl border border-neutral-200/70 overflow-hidden select-none">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600">
            AI Card Match
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shrink-0">
          <Sparkle weight="fill" className="w-2.5 h-2.5 text-amber-500" />
          24h Cache
        </span>
      </div>

      <div className="my-2 p-3 sm:p-3.5 rounded-xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wide block truncate">
              Axis Bank · Travel & Dining
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight truncate">
              Axis Atlas Credit Card
            </h4>
          </div>
          <span className="inline-flex items-center text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
            5.0x Multiplier
          </span>
        </div>

        <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-between text-[11px] gap-2">
          <span className="text-neutral-500 truncate">Est. Return on ₹4,200 spend</span>
          <span className="font-mono font-bold text-neutral-900 shrink-0">₹420 value</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-neutral-500 pt-1.5 border-t border-neutral-200/60 gap-1">
        <span className="truncate">Focus: Dining & Flights</span>
        <span className="text-emerald-600 font-bold shrink-0">Top Recommender Match</span>
      </div>
    </div>
  );
}

function SkeletonTwo() {
  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[240px] flex items-center justify-center p-4 bg-gradient-to-b from-neutral-50/90 to-neutral-100/60 rounded-2xl border border-neutral-200/70 overflow-hidden select-none">
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-16 border-y border-dashed border-neutral-300/80 pointer-events-none" />

      <div className="relative z-10 flex items-center gap-3 sm:gap-5">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="relative w-22 h-18 sm:w-26 sm:h-20 bg-amber-400 rounded-xl shadow-md flex items-center justify-center border border-amber-500/40 shrink-0"
        >
          <div className="absolute -top-2.5 left-2 w-8 h-4 bg-amber-500 rounded-t-md" />
          <div className="w-16 h-12 sm:w-18 sm:h-13 bg-white/95 rounded-lg border border-neutral-200 shadow-inner flex flex-col p-1.5 justify-between">
            <div className="flex items-center gap-1">
              <Receipt weight="bold" className="w-2.5 h-2.5 text-neutral-400" />
              <span className="text-[7px] font-mono text-neutral-400">TXN ALERT</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-neutral-800 font-bold">
              <span>₹3,850</span>
              <span className="text-emerald-600">+5x</span>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse delay-100" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse delay-200" />
        </div>

        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.3 }}
          className="w-24 h-20 sm:w-28 sm:h-22 bg-white rounded-2xl border border-neutral-300 shadow-md p-3 flex flex-col justify-between shrink-0"
        >
          <div className="flex items-center justify-between gap-1.5">
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shrink-0">
              <LockKey weight="bold" className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              AES-256
            </span>
          </div>
          <div className="space-y-1 my-0.5">
            <div className="w-full h-1.5 bg-neutral-200/80 rounded-full" />
            <div className="w-2/3 h-1.5 bg-neutral-200/60 rounded-full" />
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono text-neutral-500 font-medium truncate">
            No Passwords
          </span>
        </motion.div>
      </div>
    </div>
  );
}

function SkeletonThree() {
  return (
    <div className="relative w-full h-full min-h-[300px] sm:min-h-[360px] flex flex-col justify-between p-4 sm:p-5 bg-[#0e1015] text-neutral-200 rounded-2xl border border-neutral-800 shadow-inner overflow-hidden select-none font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <ChartBar weight="bold" className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-neutral-200">Spend Tracker</span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded shrink-0">
          MONTHLY AGGREGATE
        </span>
      </div>

      <div className="my-auto space-y-3 py-2">
        <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">Period 2026-08</span>
            <span className="text-emerald-400 font-bold">+₹4,280 Earned</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">₹1,18,400</span>
            <span className="text-[11px] sm:text-xs text-neutral-400">Total Month Spend</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 w-[82%] rounded-full transition-all duration-500" />
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-[11px] gap-2">
            <span className="text-neutral-300 truncate">Dining & Food</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-neutral-400">₹34,200</span>
              <span className="text-emerald-400 font-bold">+5x Tier</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-[11px] gap-2">
            <span className="text-neutral-300 truncate">Airlines & Travel</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-neutral-400">₹48,000</span>
              <span className="text-emerald-400 font-bold">+10% Scapia</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-[11px] gap-2">
            <span className="text-neutral-300 truncate">Groceries & Supermarket</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-neutral-400">₹18,500</span>
              <span className="text-amber-400 font-bold">+2x Base</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400">
        <div className="flex items-center gap-1.5 text-neutral-300">
          <CalendarCheck weight="bold" className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>120-Day Lookback Active</span>
        </div>
        <span className="text-neutral-500 shrink-0">Auto Synced</span>
      </div>
    </div>
  );
}

function SkeletonFour() {
  const categoryBenchmarks = [
    {
      category: "Dining & Food Delivery",
      multiplier: "5.0x Return",
      detail: "Automated category classification routes food orders & dining to highest multiplier cards.",
      icon: <ForkKnife weight="bold" className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-800" />,
    },
    {
      category: "Spend Exclusions & Rules",
      multiplier: "Category Filtered",
      detail: "Filters out excluded categories like rent, wallet loads, and government fees from milestone totals.",
      icon: <TrendUp weight="bold" className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-800" />,
    },
    {
      category: "Travel & Zero Forex",
      multiplier: "0% Forex Tier",
      detail: "Detects international spend categories to prioritize zero-markup and high-forex-return cards.",
      icon: <AirplaneTilt weight="bold" className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-800" />,
    },
  ];

  return (
    <div className="relative w-full h-full min-h-[190px] sm:min-h-[210px] grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 p-3.5 sm:p-5 bg-gradient-to-b from-neutral-50/90 to-neutral-100/60 rounded-2xl border border-neutral-200/70 overflow-hidden select-none">
      {categoryBenchmarks.map((c, i) => (
        <div
          key={i}
          className="p-3.5 sm:p-4 rounded-xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
              <div className="p-1.5 rounded-lg bg-neutral-100/80 border border-neutral-200/60 text-neutral-800 shrink-0">
                {c.icon}
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200/80 max-w-full truncate">
                {c.multiplier}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 mb-1.5 tracking-tight">
              {c.category}
            </h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {c.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Features() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section
      id="features"
      className="relative py-20 sm:py-28 bg-[#f2ede3] border-t border-[#ded5c4]/90 paper-grain overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 pb-6 border-b border-[#ded5c4] gap-4">
          <div>
            <ScrollReveal y={15}>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#0d0e11]">
                Everything for Your Cards.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1} y={15}>
              <p className="mt-2.5 text-neutral-600 text-sm sm:text-base max-w-xl">
                Smart card intelligence, automated transaction sync, and category spend tracking.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.15} y={15}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fcfaf6] border border-[#ded5c4] text-xs font-mono font-semibold text-neutral-800 hover:border-neutral-400 hover:bg-[#eae3d5] transition-all cursor-pointer shadow-2xs"
            >
              <Plus weight="bold" className="w-3.5 h-3.5 text-[#d9480f]" />
              <span>Request a Bank</span>
            </button>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          <div className="lg:col-span-4 flex flex-col justify-between bg-[#fcfaf6] rounded-3xl p-6 sm:p-7 border border-[#ded5c4]/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="mb-5 flex-1 flex items-center justify-center">
              <SkeletonOne />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-950 tracking-tight">
                AI Card Recommendations
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Evaluates your active card portfolio against specific categories and merchants to recommend the highest-yielding card with clear reward logic.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between bg-[#fcfaf6] rounded-3xl p-6 sm:p-7 border border-[#ded5c4]/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="mb-5 flex-1 flex items-center justify-center">
              <SkeletonTwo />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-950 tracking-tight">
                Automated Transaction Sync
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Extract spend alerts securely from bank transaction emails via read-only tokenization with zero credentials stored.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 lg:row-span-2 flex flex-col justify-between bg-[#fcfaf6] rounded-3xl p-6 sm:p-7 border border-[#ded5c4]/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="mb-5 flex-1 flex items-center justify-center">
              <SkeletonThree />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-950 tracking-tight">
                Monthly Spend & Reward Tracker
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Aggregates monthly spend totals, tracks category distributions, and calculates net rewards earned across billing cycles.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between bg-[#fcfaf6] rounded-3xl p-6 sm:p-8 border border-[#ded5c4]/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="mb-6 flex-1 flex items-center justify-center">
              <SkeletonFour />
            </div>
            <div className="pt-1">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-950 tracking-tight">
                Intelligent Category Filtration
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Normalizes messy checkout strings into clean categories and applies category-specific reward rules, isolating excluded spends like rent and wallet loads.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BankRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}

export default Features;
