import React from "react";
import { ArrowLeft01Icon, Building02Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { getBankLogo } from "@/lib/bank-logos";

import { PRIMARY_BANKS, OTHER_BANK_OPTIONS } from "@/constants";

export function PreferredBank({
  preferredBank,
  onSelectBank,
  onBack,
  onSkip,
  onConfirm,
}) {
  return (
    <div className="flex-1 w-full rounded-3xl border border-neutral-300/90 bg-[#f2eee5]/85 backdrop-blur-xs shadow-xs flex flex-col justify-between relative min-h-0">
      <div className="flex items-center justify-between border-b border-neutral-300/90 px-6 py-3.5 bg-[#eae5d9]/90 text-xs font-mono font-bold text-neutral-600 tracking-wider rounded-t-3xl">
        <span>Step [03 / 03]</span>
      </div>

      <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-neutral-300/90 bg-white/60">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono block mb-1">
          Select Preferred Bank
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111215]">
          [ ANY PREFERRED BANK? ]
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Select from top issuers or choose other banks from the dropdown.
        </p>
      </div>

      <div className="flex items-center justify-between border-b border-neutral-300/80 px-6 py-2 bg-[#eae5d9]/60 text-xs font-mono font-bold text-neutral-600 tracking-wider uppercase">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-neutral-300/80 border-b border-neutral-300/80 bg-white/40">
        {PRIMARY_BANKS.map((b) => {
          const isSelected = preferredBank === b.id;
          const logoUrl = getBankLogo(b.short, "");

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelectBank(isSelected ? "" : b.id)}
              className={`p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all cursor-pointer min-h-[140px] sm:min-h-[155px] relative group select-none ${
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
                  <span className="w-2 h-2 rounded-full border border-neutral-400 opacity-30 group-hover:opacity-100" />
                )}
              </div>

              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-2.5 flex items-center justify-center transition-all shadow-xs my-2 border ${
                  isSelected
                    ? "bg-white border-white scale-105"
                    : "bg-white border-neutral-300/90 group-hover:border-neutral-500 group-hover:scale-102"
                }`}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={b.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <HugeIcon icon={Building02Icon} size={28} className="text-neutral-600" />
                )}
              </div>

              <div className="w-full">
                <h4 className="font-black text-xs sm:text-sm tracking-tight leading-tight uppercase">
                  {b.name}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-6 py-3.5 sm:px-8 bg-white/80 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-neutral-300/80 relative z-20">
        <span className="text-xs font-mono font-semibold text-neutral-600 shrink-0">
          Others dropdown:
        </span>
        <Dropdown
          items={OTHER_BANK_OPTIONS}
          value={
            OTHER_BANK_OPTIONS.some((o) => o.value === preferredBank)
              ? preferredBank
              : ""
          }
          onChange={(val) => onSelectBank(val)}
          placeholder="Others dropdown"
          className="w-full sm:w-72"
          triggerClassName="h-9 bg-neutral-900 border-neutral-700 text-white rounded-xl text-xs"
          side="top"
        />
      </div>

      <div className="px-6 py-4 sm:px-8 sm:py-5 bg-[#eae5d9]/90 flex items-center justify-between gap-3 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-10 px-4 text-xs font-mono font-bold text-neutral-700 hover:text-neutral-950 bg-white/80 border-neutral-300 uppercase cursor-pointer flex items-center gap-1.5 rounded-xl shadow-xs"
          >
            <HugeIcon icon={ArrowLeft01Icon} size={14} />
            <span>Back</span>
          </Button>

          <Button
            variant="ghost"
            onClick={onSkip}
            className="h-10 px-4 text-xs font-mono font-bold text-neutral-600 hover:text-neutral-950 uppercase cursor-pointer"
          >
            Skip
          </Button>
        </div>

        <Button
          onClick={onConfirm}
          className="h-11 px-7 bg-[#c2571a] hover:bg-[#a94813] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start Analysis</span>
        </Button>
      </div>
    </div>
  );
}
