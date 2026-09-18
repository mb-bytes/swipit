import React from "react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { getBankLogo } from "@/lib/bank-logos.js";

import { PRIMARY_BANKS, OTHER_BANKS_DROPDOWN } from "@/constants";

export function PreferredBank({
  preferredBank,
  onSelectBank,
  onBack,
  onSkip,
  onConfirm,
}) {
  return (
    <div className="flex-1 w-full rounded-3xl border border-neutral-300/90 bg-[#f2eee5]/85 backdrop-blur-xs shadow-xs flex flex-col justify-between relative min-h-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-300/90 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#eae5d9]/90 text-xs font-mono font-bold text-neutral-600 tracking-wider rounded-t-3xl shrink-0">
        <span>Step [03 / 03]</span>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
        <div className="px-5 py-3.5 sm:px-8 sm:py-5 border-b border-neutral-300/90 bg-white/60 shrink-0">
          <span className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider font-mono block mb-0.5 sm:mb-1">
            Select Preferred Bank
          </span>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-[#111215]">
            [ ANY PREFERRED BANK? ]
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Select from top issuers or choose other banks from the dropdown.
          </p>
        </div>

        <div className="flex items-center justify-between border-b border-neutral-300/80 px-5 sm:px-6 py-1.5 sm:py-2 bg-[#eae5d9]/60 text-xs font-mono font-bold text-neutral-600 tracking-wider uppercase shrink-0">
          <span>Bank Partners</span>
          {preferredBank && (
            <button
              type="button"
              onClick={() => onSelectBank("")}
              className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
            >
              clear selection
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-neutral-300/80 border-b border-neutral-300/80 bg-white/40 shrink-0">
          {PRIMARY_BANKS.map((b) => {
            const isSelected = preferredBank === b.id;
            const logoUrl = getBankLogo(b.short, "");

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBank(isSelected ? "" : b.id)}
                className={`p-3 sm:p-5 flex flex-col items-center justify-between text-center transition-all cursor-pointer min-h-[110px] sm:min-h-[155px] relative group select-none ${
                  isSelected
                    ? "bg-[#c2571a] text-white shadow-inner"
                    : "bg-[#eae5d9]/40 hover:bg-neutral-100/90 text-neutral-800"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase ${
                      isSelected ? "text-amber-100" : "text-amber-800/80"
                    }`}
                  >
                    - {b.code}
                  </span>
                  {isSelected ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-neutral-400 opacity-40 group-hover:opacity-100" />
                  )}
                </div>

                <div className="my-2 sm:my-3 flex items-center justify-center">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={b.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl p-1 bg-white border border-neutral-300/80 shadow-2xs"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-neutral-300/80 flex items-center justify-center font-bold text-xs font-mono shadow-2xs">
                      {b.short.slice(0, 2)}
                    </div>
                  )}
                </div>

                <span
                  className={`font-black text-xs sm:text-sm tracking-tight leading-tight uppercase ${
                    isSelected ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {b.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 sm:px-8 bg-white/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 border-b border-neutral-300/80 relative z-20 shrink-0">
          <span className="text-xs font-mono font-semibold text-neutral-600 shrink-0">
            Or select another bank:
          </span>
          <Dropdown
            items={OTHER_BANKS_DROPDOWN}
            value={
              OTHER_BANKS_DROPDOWN.some((ob) => ob.value === preferredBank)
                ? preferredBank
                : ""
            }
            onChange={(val) => onSelectBank(val)}
            placeholder="Select bank from dropdown..."
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
          <span>Start Analysis</span>
        </Button>
      </div>
    </div>
  );
}

export default PreferredBank;
