import React from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";

import { TOP_MERCHANTS, OTHER_MERCHANT_OPTIONS } from "@/constants";

export function PreferredMerchant({
  preferredMerchant,
  onSelectMerchant,
  onBack,
  onSkip,
  onConfirm,
}) {
  return (
    <div className="flex-1 w-full rounded-3xl border border-neutral-300/90 bg-[#f2eee5]/85 backdrop-blur-xs shadow-xs flex flex-col justify-between relative min-h-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-300/90 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#eae5d9]/90 text-xs font-mono font-bold text-neutral-600 tracking-wider rounded-t-3xl shrink-0">
        <span>Step [02 / 03]</span>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
        <div className="px-5 py-3.5 sm:px-8 sm:py-5 border-b border-neutral-300/90 bg-white/60 shrink-0">
          <span className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider font-mono block mb-0.5 sm:mb-1">
            Select Top Merchants
          </span>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-[#111215]">
            ANY PREFERRED MERCHANT?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Got a merchant you are basically funding at this point?
          </p>
        </div>

        <div className="flex items-center justify-between border-b border-neutral-300/80 px-5 sm:px-6 py-1.5 sm:py-2 bg-[#eae5d9]/60 text-xs font-mono font-bold text-neutral-600 tracking-wider uppercase shrink-0">
          <span>Merchants</span>
          {preferredMerchant && (
            <button
              type="button"
              onClick={() => onSelectMerchant("")}
              className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
            >
              clear selection
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0 divide-x divide-neutral-300/80 border-b border-neutral-300/80 bg-white/40 shrink-0">
          {TOP_MERCHANTS.map((m, idx) => {
            const isSelected = preferredMerchant === m.id;
            const isTopRow = idx < 3;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMerchant(isSelected ? "" : m.id)}
                className={`p-3 sm:p-5 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[85px] sm:min-h-[110px] relative group select-none ${
                  !isTopRow ? "sm:border-t sm:border-neutral-300/80" : ""
                } ${
                  isSelected ? m.selectedBg : `${m.unselectedBg} text-[#111215]`
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase ${
                      isSelected ? m.selectedCodeColor : m.codeColor
                    }`}
                  >
                    - {m.code}
                  </span>
                  {isSelected ? (
                    <span
                      className={`w-2.5 h-2.5 rounded-full shadow-xs ${m.selectedDot}`}
                    />
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full border ${m.dotBorder} opacity-40 group-hover:opacity-100`}
                    />
                  )}
                </div>

                <div className="mt-1.5 sm:mt-2">
                  <h4 className="font-black text-xs sm:text-sm tracking-tight leading-tight uppercase">
                    {m.label || m.name}
                  </h4>
                  <span
                    className={`text-[10px] sm:text-[11px] block mt-0.5 font-mono ${
                      isSelected ? "text-white/80" : "text-neutral-500"
                    }`}
                  >
                    {m.hint}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 sm:px-8 bg-white/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 border-b border-neutral-300/80 relative z-20 shrink-0">
          <span className="text-xs font-mono font-semibold text-neutral-600 shrink-0">
            Or select another merchant:
          </span>
          <Dropdown
            items={OTHER_MERCHANT_OPTIONS}
            value={
              OTHER_MERCHANT_OPTIONS.some((o) => o.value === preferredMerchant)
                ? preferredMerchant
                : ""
            }
            onChange={(val) => onSelectMerchant(val)}
            placeholder="Select merchant from dropdown..."
            className="w-full sm:w-72"
            triggerClassName="h-9 bg-neutral-900 border-neutral-700 text-white rounded-xl text-xs"
            side="top"
          />
        </div>
      </div>

      <div className="px-3.5 py-2.5 sm:px-8 sm:py-4 bg-[#eae5d9]/90 flex items-center justify-between gap-2 sm:gap-3 rounded-b-3xl shrink-0 z-30">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-9 sm:h-10 px-2.5 sm:px-4 text-[11px] sm:text-xs font-mono font-bold text-neutral-700 hover:text-neutral-950 bg-white/80 border-neutral-300 uppercase cursor-pointer flex items-center gap-1 sm:gap-1.5 rounded-xl shadow-xs"
          >
            <HugeIcon icon={ArrowLeft01Icon} size={14} />
            <span>Back</span>
          </Button>

          <Button
            variant="ghost"
            onClick={onSkip}
            className="h-9 sm:h-10 px-2 sm:px-4 text-[11px] sm:text-xs font-mono font-bold text-neutral-600 hover:text-neutral-950 uppercase cursor-pointer"
          >
            Skip
          </Button>
        </div>

        <Button
          onClick={onConfirm}
          className="h-9.5 sm:h-11 px-3.5 sm:px-7 bg-[#c2571a] hover:bg-[#a94813] text-white rounded-xl font-bold sm:font-black text-[11px] sm:text-xs uppercase tracking-normal sm:tracking-wider shadow-md flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <span>Confirm Selection</span>
          <HugeIcon icon={ArrowRight01Icon} size={14} className="shrink-0" />
        </Button>
      </div>
    </div>
  );
}

export default PreferredMerchant;
