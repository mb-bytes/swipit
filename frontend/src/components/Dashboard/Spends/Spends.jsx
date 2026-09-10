"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Receipt,
  Loader2,
  Calendar,
  Filter,
  ChevronDown,
  X,
  CreditCard,
  Inbox,
  Check,
  RotateCcw,
  Sparkles,
  BarChart3,
} from "lucide-react";
import api from "@/api/axios";
import { sileo } from "sileo";
import { useDashboard } from "@/contexts/DashboardContext";
import DeleteButton from "@/components/ui/delete-button";
import { getBankLogo } from "@/lib/bank-logos.js";
import { MonoRoundedLineChart } from "@/components/charts/MonoRoundedLineChart";
import { MonoRoundedDonutChart } from "@/components/charts/MonoRoundedDonutChart";
import { MonoRoundedFunnelChart } from "@/components/charts/MonoRoundedFunnelChart";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const QUARTERS = [
  { id: 1, label: "Q1", name: "Q1 (Jan - Mar)", months: [0, 1, 2] },
  { id: 2, label: "Q2", name: "Q2 (Apr - Jun)", months: [3, 4, 5] },
  { id: 3, label: "Q3", name: "Q3 (Jul - Sep)", months: [6, 7, 8] },
  { id: 4, label: "Q4", name: "Q4 (Oct - Dec)", months: [9, 10, 11] },
];

function parseDateComponents(tx) {
  if (tx._parsed) return tx._parsed;
  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let day = 1;

  if (
    tx.rawDate &&
    typeof tx.rawDate === "string" &&
    tx.rawDate.includes("-")
  ) {
    const parts = tx.rawDate.split("T")[0].split("-");
    if (parts.length >= 3) {
      year = parseInt(parts[0], 10) || year;
      month = (parseInt(parts[1], 10) || 1) - 1;
      day = parseInt(parts[2], 10) || 1;
    }
  } else if (tx.date && typeof tx.date === "string") {
    const parts = tx.date.trim().split(/\s+/);
    if (parts.length >= 3) {
      day = parseInt(parts[0], 10) || 1;
      const mIdx = SHORT_MONTHS.indexOf(parts[1]);
      if (mIdx !== -1) month = mIdx;
      year = parseInt(parts[2], 10) || year;
    }
  } else {
    const d = new Date();
    year = d.getFullYear();
    month = d.getMonth();
    day = d.getDate();
  }

  const quarter = Math.floor(month / 3) + 1;
  const res = { year, month, quarter, day };
  tx._parsed = res;
  return res;
}

export function Spends() {
  const {
    cards,
    transactions,
    loading,
    initialized,
    deleteTransaction,
    fetchAll,
  } = useDashboard();

  useEffect(() => {
    if (!initialized) {
      fetchAll();
    }
  }, [initialized, fetchAll]);

  const initialDate = useMemo(() => {
    if (transactions && transactions.length > 0) {
      const p = parseDateComponents(transactions[0]);
      return { year: p.year, month: p.month, quarter: p.quarter };
    }
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      quarter: Math.floor(now.getMonth() / 3) + 1,
    };
  }, [transactions]);

  const [selectedYear, setSelectedYear] = useState(initialDate.year);
  const [periodMode, setPeriodMode] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(initialDate.month);
  const [selectedQuarter, setSelectedQuarter] = useState(initialDate.quarter);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const p = parseDateComponents(transactions[0]);
      setSelectedYear(p.year);
      setSelectedMonth(p.month);
      setSelectedQuarter(p.quarter);
    }
  }, [transactions]);

  const [excludedCardIds, setExcludedCardIds] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(50);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [excludeDropdownOpen, setExcludeDropdownOpen] = useState(false);

  const periodRef = useRef(null);
  const excludeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (periodRef.current && !periodRef.current.contains(e.target)) {
        setPeriodDropdownOpen(false);
      }
      if (excludeRef.current && !excludeRef.current.contains(e.target)) {
        setExcludeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    transactions.forEach((tx) => {
      const p = parseDateComponents(tx);
      years.add(p.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const toggleExcludeCard = (cardId) => {
    setExcludedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
    setVisibleCount(50);
  };

  const clearExcludedCards = () => {
    setExcludedCardIds(new Set());
    setVisibleCount(50);
  };

  const {
    filteredTxns,
    lineData,
    donutData,
    funnelData,
    totalSpendPeriod,
    periodLabel,
  } = useMemo(() => {
    const list = [];
    let totalSpend = 0;

    const timeBuckets = {};
    const categoryTotals = {};
    const merchantTotals = {};

    transactions.forEach((tx) => {
      if (excludedCardIds.has(tx.cardId)) return;

      const p = parseDateComponents(tx);
      const yearMatch = p.year === selectedYear;

      let periodMatch = false;
      if (periodMode === "month") {
        periodMatch = yearMatch && p.month === selectedMonth;
      } else {
        periodMatch = yearMatch && p.quarter === selectedQuarter;
      }

      if (!periodMatch) return;

      list.push(tx);
      const amt = Number(tx.amount) || 0;
      totalSpend += amt;

      if (periodMode === "month") {
        const key = `${p.day} ${SHORT_MONTHS[p.month]}`;
        timeBuckets[key] = (timeBuckets[key] || 0) + amt;
      } else {
        const key = SHORT_MONTHS[p.month];
        timeBuckets[key] = (timeBuckets[key] || 0) + amt;
      }

      const cat = tx.category || "General";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

      const merch = tx.merchant || "Unknown";
      if (!merchantTotals[merch]) {
        merchantTotals[merch] = { volume: 0, count: 0 };
      }
      merchantTotals[merch].volume += amt;
      merchantTotals[merch].count += 1;
    });

    let line = [];
    if (periodMode === "month") {
      line = Object.entries(timeBuckets).map(([label, value]) => ({
        label,
        value: Math.round(value),
      }));
      if (line.length === 0) {
        line = [{ label: `${MONTH_NAMES[selectedMonth]} 1`, value: 0 }];
      }
    } else {
      const qMonths = QUARTERS.find((q) => q.id === selectedQuarter)
        ?.months || [0, 1, 2];
      line = qMonths.map((mIdx) => {
        const label = SHORT_MONTHS[mIdx];
        return {
          label,
          value: Math.round(timeBuckets[label] || 0),
        };
      });
    }

    const sortedCats = Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    let donut = [];
    if (sortedCats.length > 0 && totalSpend > 0) {
      const top3 = sortedCats.slice(0, 3);
      const remainder = sortedCats.slice(3);
      const remainderAmt = remainder.reduce((sum, c) => sum + c.amount, 0);

      donut = top3.map((c) => ({
        name: c.name,
        amount: Math.round(c.amount),
        value: Math.round((c.amount / totalSpend) * 100),
      }));

      if (remainderAmt > 0) {
        donut.push({
          name: "Other",
          amount: Math.round(remainderAmt),
          value: Math.round((remainderAmt / totalSpend) * 100),
        });
      }
    }

    const sortedMerchants = Object.entries(merchantTotals)
      .map(([stage, info]) => ({
        stage,
        volume: Math.round(info.volume),
        count: info.count,
      }))
      .sort((a, b) => b.volume - a.volume);

    const funnel = sortedMerchants.slice(0, 5);

    const label =
      periodMode === "month"
        ? `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
        : `Q${selectedQuarter} ${selectedYear} (${QUARTERS.find((q) => q.id === selectedQuarter)?.name.split(" ")[1] || ""})`;

    return {
      filteredTxns: list,
      lineData: line,
      donutData: donut,
      funnelData: funnel,
      totalSpendPeriod: totalSpend,
      periodLabel: label,
    };
  }, [
    transactions,
    selectedYear,
    periodMode,
    selectedMonth,
    selectedQuarter,
    excludedCardIds,
  ]);

  const displayedTxns = useMemo(() => {
    return filteredTxns.slice(0, visibleCount);
  }, [filteredTxns, visibleCount]);

  const handleDelete = async (txId) => {
    deleteTransaction(txId);
    try {
      await api.delete(`/api/cards/transactions/${txId}`);
      sileo.success({ title: "Transaction deleted" });
    } catch {
      await fetchAll();
      sileo.error({
        title: "Couldn't delete",
        description: "A server error occurred.",
      });
    }
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-6 rounded-tl-2xl border-l border-t border-neutral-300/80 bg-[#f8f9fb] p-5 md:p-8 paper-grain overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111215] flex items-center justify-center shrink-0 shadow-sm">
              <Receipt className="w-5 h-5 text-[#f2eee5]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111215]">
                Analyze your spends
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Dynamic insights and analytics across your registered cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-white/90 border border-neutral-200/90 px-3 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
              <span>
                ₹{totalSpendPeriod.toLocaleString("en-IN")} spent in{" "}
                {periodLabel}
              </span>
            </span>
          </div>
        </div>

        {filteredTxns.length < 5 ? (
          <div className="rounded-3xl border border-neutral-300/80 bg-white/70 p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-2xs backdrop-blur-xs min-h-[280px]">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 mb-3 shadow-2xs">
              <BarChart3 className="w-6 h-6 text-neutral-700" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Not enough transactions yet
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md leading-relaxed">
              At least 5 transactions in {periodLabel} are required to generate
              spend trends, category distribution, and top merchant analytics.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                <span>{filteredTxns.length} / 5 transactions found</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-7 flex flex-col h-full">
              <MonoRoundedLineChart
                data={lineData}
                theme="light"
                title="Spend Dynamics"
                subtitle={`Spends for ${periodLabel}`}
                badgeText="Spline Dynamics"
                className="h-full flex-1"
              />
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between gap-5 h-full">
              <MonoRoundedDonutChart
                data={donutData}
                theme="light"
                title="Top Categories"
                subtitle="Top 3 categories"
                className="flex-1"
              />
              <MonoRoundedFunnelChart
                data={funnelData}
                theme="light"
                title="Top 5 Merchants"
                subtitle="by spends"
                className="flex-1"
              />
            </div>
          </div>
        )}

        <hr className="border-neutral-300/80 my-1" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#111215]">
              Transactions for {periodLabel}
            </h2>

            <div className="relative inline-block" ref={excludeRef}>
              <button
                type="button"
                onClick={() => setExcludeDropdownOpen(!excludeDropdownOpen)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  excludedCardIds.size > 0
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : "bg-white/90 text-neutral-700 border-neutral-200 hover:bg-neutral-100/80"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>
                  {excludedCardIds.size === 0
                    ? "Exclude a card?"
                    : `${excludedCardIds.size} Card${excludedCardIds.size > 1 ? "s" : ""} Excluded`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {excludeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-neutral-200 p-3 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                    <span className="text-xs font-semibold text-neutral-800">
                      Exclude Cards from View
                    </span>
                    {excludedCardIds.size > 0 && (
                      <button
                        type="button"
                        onClick={clearExcludedCards}
                        className="text-[11px] text-neutral-500 hover:text-black font-medium transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {cards.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-2 text-center">
                      No cards found
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
                      {cards.map((card) => {
                        const isExcluded = excludedCardIds.has(card.id);
                        return (
                          <label
                            key={card.id}
                            onClick={() => toggleExcludeCard(card.id)}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                              isExcluded
                                ? "bg-neutral-100 text-neutral-900 font-semibold"
                                : "hover:bg-neutral-50 text-neutral-700"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <CreditCard className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                              <span className="truncate">{card.cardName}</span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                ••{card.cardLast4}
                              </span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                isExcluded
                                  ? "bg-neutral-900 border-neutral-900 text-white"
                                  : "border-neutral-300 bg-white"
                              }`}
                            >
                              {isExcluded && (
                                <Check className="w-3 h-3 stroke-[3]" />
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="relative" ref={periodRef}>
            <button
              type="button"
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-neutral-300/80 hover:border-neutral-400 text-neutral-900 text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-600" />
              <span>Change period ({periodLabel})</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-neutral-200 p-4 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Select Year
                  </span>
                  <div className="flex items-center gap-1">
                    {availableYears.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => {
                          setSelectedYear(yr);
                          setVisibleCount(50);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                          selectedYear === yr
                            ? "bg-neutral-900 text-white font-bold shadow-xs"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center p-1 bg-neutral-100 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPeriodMode("month");
                      setVisibleCount(50);
                    }}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      periodMode === "month"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Months
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPeriodMode("quarter");
                      setVisibleCount(50);
                    }}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      periodMode === "quarter"
                        ? "bg-white text-neutral-900 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    Quarters (Q1-Q4)
                  </button>
                </div>

                {periodMode === "month" && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {SHORT_MONTHS.map((mName, idx) => (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(idx);
                          setPeriodDropdownOpen(false);
                          setVisibleCount(50);
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                          selectedMonth === idx
                            ? "bg-neutral-900 text-white font-bold shadow-xs"
                            : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {mName}
                      </button>
                    ))}
                  </div>
                )}

                {periodMode === "quarter" && (
                  <div className="flex flex-col gap-1.5">
                    {QUARTERS.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setSelectedQuarter(q.id);
                          setPeriodDropdownOpen(false);
                          setVisibleCount(50);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          selectedQuarter === q.id
                            ? "bg-neutral-900 text-white font-bold shadow-xs"
                            : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        <span className="font-semibold">{q.label}</span>
                        <span className="text-neutral-400 font-normal">
                          {q.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-neutral-500 py-16">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading transactions…</span>
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="rounded-2xl border border-neutral-300/80 bg-white/60 p-12 flex flex-col items-center justify-center text-center shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-neutral-200 flex items-center justify-center text-neutral-600 mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-800">
              No Transactions Found
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              No transactions match {periodLabel}{" "}
              {excludedCardIds.size > 0
                ? "with the current card exclusions."
                : "."}
            </p>
            {excludedCardIds.size > 0 && (
              <button
                type="button"
                onClick={clearExcludedCards}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-black font-semibold underline underline-offset-2 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset card exclusions</span>
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200/90 bg-white/85 backdrop-blur-xs shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[540px]">
                <thead>
                  <tr className="border-b border-neutral-200/70 bg-neutral-50/60 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider select-none">
                    <th className="py-3 px-4 sm:px-6">Merchant</th>
                    <th className="py-3 px-4">Card</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Spent</th>
                    <th className="py-3 px-4 text-right">Reward</th>
                    <th className="py-3 px-4 sm:px-6 w-12 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100/90 text-sm">
                  {displayedTxns.map((tx) => {
                    const matchedCard = cards?.find(
                      (c) =>
                        c.id === tx.cardId ||
                        c.cardName?.toLowerCase() ===
                          tx.cardName?.toLowerCase(),
                    );
                    const cardName =
                      tx.cardName || matchedCard?.cardName || "Credit Card";
                    const bankName = matchedCard?.bankName || "";
                    const bankLogo =
                      matchedCard?.logo || getBankLogo(bankName, cardName);

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-neutral-50/80 transition-colors group"
                      >
                        <td className="py-3.5 px-4 sm:px-6 font-medium text-neutral-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{tx.merchant}</span>
                            {tx.category && (
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded-full">
                                {tx.category}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="relative group/tooltip inline-flex items-center">
                            {bankLogo ? (
                              <img
                                src={bankLogo}
                                alt={cardName}
                                className="w-6 h-6 object-contain rounded-md p-0.5 bg-white border border-neutral-200/90 shadow-2xs cursor-pointer"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-neutral-100 border border-neutral-200/90 flex items-center justify-center text-neutral-500 shadow-2xs cursor-pointer">
                                <CreditCard className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center z-50 whitespace-nowrap">
                              <div className="rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl border border-neutral-800">
                                {cardName}
                              </div>
                              <div className="w-2 h-2 -mt-1 rotate-45 bg-neutral-900 border-r border-b border-neutral-800" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-neutral-500 whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-neutral-900 whitespace-nowrap">
                          - Rs {(tx.amount ?? 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60">
                            + Rs{" "}
                            {(tx.rewardEarned ?? 0).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                          <DeleteButton
                            className="scale-75 origin-right shadow-xs"
                            onConfirm={() => handleDelete(tx.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-neutral-200/70 px-4 py-3 sm:px-6 bg-neutral-50/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 select-none">
              <span>
                Showing {displayedTxns.length} of {filteredTxns.length}{" "}
                transactions
              </span>
              {filteredTxns.length > visibleCount && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 50)}
                  className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>
                    Load more ({filteredTxns.length - visibleCount} remaining)
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Spends;
