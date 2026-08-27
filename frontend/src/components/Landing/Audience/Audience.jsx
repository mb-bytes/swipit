import {
  CreditCard,
  EnvelopeSimple,
  Sparkle,
  Calculator,
  TrendUp,
  ChartBar,
  ShieldCheck,
  Cards,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export function Audience() {
  const features = [
    {
      title: "Multi-Card Optimization",
      description:
        "Evaluates reward rules, multipliers, and exclusions across your cards to determine the highest return for every transaction.",
      icon: <CreditCard weight="bold" className="w-6 h-6 text-[#d9480f]" />,
    },
    {
      title: "Transaction Email Sync",
      description:
        "Connects read-only Gmail to automatically parse transaction alert emails into structured spend data in real time.",
      icon: <EnvelopeSimple weight="bold" className="w-6 h-6 text-blue-700" />,
    },
    {
      title: "AI Merchant Classification",
      description:
        "Normalizes raw POS terminal strings and categorizes merchants across 50+ spend categories with AI fallback.",
      icon: <Sparkle weight="bold" className="w-6 h-6 text-amber-600" />,
    },
    {
      title: "Reward Calculation Engine",
      description:
        "Applies merchant rates, category multipliers, and point-to-INR conversions to compute exact rewards earned.",
      icon: <Calculator weight="bold" className="w-6 h-6 text-emerald-700" />,
    },
    {
      title: "Personalized Card Advisor",
      description:
        "Analyzes your 90-day spending history and top categories to recommend cards with the highest annual net benefit.",
      icon: <TrendUp weight="bold" className="w-6 h-6 text-purple-700" />,
    },
    {
      title: "Monthly Spend Tracker",
      description:
        "Aggregates monthly spend totals, top merchants, and category distributions across billing cycles.",
      icon: <ChartBar weight="bold" className="w-6 h-6 text-sky-600" />,
    },
    {
      title: "Zero Credential Storage",
      description:
        "Operates via restricted read-only OAuth tokens. No banking passwords or account logins are ever requested or stored.",
      icon: <ShieldCheck weight="bold" className="w-6 h-6 text-emerald-800" />,
    },
    {
      title: "Multi-Card Portfolio",
      description:
        "Track cards across multiple banking partners in a single unified ledger with custom reward configurations.",
      icon: <Cards weight="bold" className="w-6 h-6 text-neutral-900" />,
    },
  ];

  return (
    <section
      id="persona"
      className="relative py-20 sm:py-28 bg-[#ebe6dc] border-t border-neutral-300/80 paper-grain overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-neutral-300 gap-4">
          <div>
            <ScrollReveal y={15}>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#0d0e11]">
                Engineered for Cardholders.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1} y={15}>
              <p className="mt-2 text-neutral-600 text-sm sm:text-base max-w-xl">
                Real-time transaction parsing, automated categorization, and intelligent reward optimization.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.15} y={15}>
            <span className="font-mono text-xs font-semibold text-[#525763] tracking-[0.14em] uppercase">
              PLATFORM CAPABILITIES
            </span>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({ title, description, icon, index }) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-neutral-300/80",
        (index === 0 || index === 4) && "lg:border-l border-neutral-300/80",
        index < 4 && "lg:border-b border-neutral-300/80"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-8 sm:px-10 text-neutral-700">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-8 sm:px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-400 group-hover/feature:bg-[#d9480f] transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-900">
          {title}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-neutral-600 max-w-xs relative z-10 px-8 sm:px-10 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default Audience;
