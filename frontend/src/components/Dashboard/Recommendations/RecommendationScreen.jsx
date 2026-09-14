import React from "react";
import { Building2, ExternalLink, Flame, Info, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBankLogo } from "@/lib/bank-logos";

export function RecommendationScreen({
  loading,
  recommendationsData,
  preferredBank,
  isCached,
  onReset,
}) {
  const handleApplyClick = (card) => {
    const query = encodeURIComponent(`${card.bank} ${card.card_name} apply online India`);
    window.open(`https://www.google.com/search?q=${query}`, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex-1 w-full rounded-3xl border border-neutral-300/90 bg-[#f2eee5]/85 backdrop-blur-xs shadow-xs p-10 sm:p-14 flex flex-col items-center justify-center text-center min-h-0">
        <div className="w-12 h-12 rounded-2xl bg-[#111215] flex items-center justify-center shadow-md mb-4 animate-pulse">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-xl font-black tracking-tight text-[#111215] mb-2 uppercase">
          Crunching Card Mathematics...
        </h3>
        <p className="text-xs text-neutral-600 max-w-sm leading-relaxed mb-6 font-mono">
          Cross-referencing your 4-month transaction categories with issuer reward formulas and milestone waivers.
        </p>
        <div className="w-48 h-1.5 bg-neutral-300 rounded-full overflow-hidden">
          <div className="h-full bg-[#c2571a] rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (!recommendationsData) {
    return null;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-5 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider block">
            [ OPTIMAL PICKS ]
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111215]">
            Here are the cards which would be your biggest givers
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Calculated from your transaction history and preference profile.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={onReset}
          className="h-10 px-4 rounded-xl border-neutral-300 text-xs font-mono font-bold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
          <span>Start Over</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendationsData?.recommendations?.map((card, idx) => {
          const logoUrl = getBankLogo(card.bank, card.card_name);
          const isBankMatch =
            preferredBank &&
            card.bank?.toLowerCase().includes(preferredBank.toLowerCase());

          return (
            <div
              key={idx}
              className="rounded-3xl border border-neutral-300/90 bg-white/90 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:border-neutral-400 hover:shadow-xs transition-all relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block font-mono">
                      {card.bank}
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 leading-snug mt-0.5">
                      {card.card_name}
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/90 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={card.bank}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-neutral-500" />
                    )}
                  </div>
                </div>

                {isBankMatch && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg mb-3">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Matches your preferred bank</span>
                  </div>
                )}

                {card.top_perk && (
                  <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-700 mb-4 flex items-start gap-2.5">
                    <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{card.top_perk}</span>
                  </div>
                )}

                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2 font-mono">
                    Value Analysis
                  </span>
                  <ul className="space-y-2 text-xs text-neutral-600">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                      <span>{card.why}</span>
                    </li>
                    {card.best_for_categories && (
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>
                          Best for:{" "}
                          <strong className="font-semibold text-neutral-900">
                            {card.best_for_categories.map((c) => c.replace("_", " ")).join(", ")}
                          </strong>
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Annual Fee</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {card.annual_fee === 0 ? "Lifetime Free" : `₹${card.annual_fee?.toLocaleString("en-IN")}`}
                  </span>
                </div>

                {card.estimated_monthly_reward_inr > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Est. Monthly Reward</span>
                    <span className="font-mono font-bold text-emerald-600">
                      +₹{card.estimated_monthly_reward_inr?.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <Button
                  onClick={() => handleApplyClick(card)}
                  className="w-full h-10 bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 rounded-xl font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-neutral-400 shrink-0" />
          <span>
            Quarterly cashback if more than 4 months of transaction are available for each recommended card.
          </span>
        </div>

        {isCached && (
          <span className="font-mono text-[11px] text-neutral-400">
            Evaluated for today (refreshes daily)
          </span>
        )}
      </div>
    </div>
  );
}
