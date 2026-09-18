"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Invoice01Icon,
  Calendar03Icon,
  FilterIcon,
  ChevronDownIcon,
  CreditCardIcon,
  InboxIcon,
  Tick02Icon,
  RotateLeft01Icon,
  SparklesIcon,
  BarChartIcon,
  RefreshCwIcon,
  Edit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import api from "@/api/axios";
import { sileo } from "sileo";
import { Skeleton } from "boneyard-js/react";
import { useDashboard } from "@/contexts/DashboardContext";
import { getBankLogo } from "@/lib/bank-logos.js";
import { beautifyMerchantName, beautifyCategory } from "@/lib/merchant-utils";
import { MonoRoundedLineChart } from "@/components/charts/MonoRoundedLineChart";
import { MonoRoundedDonutChart } from "@/components/charts/MonoRoundedDonutChart";
import { MonoRoundedFunnelChart } from "@/components/charts/MonoRoundedFunnelChart";
import { EditTransactionModal } from "@/components/Dashboard/Home/ui/edit-transaction-modal";

import {
  MONTH_NAMES,
  SHORT_MONTHS,
  QUARTERS,
  SYNC_PERIOD_OPTIONS,
} from "@/constants";

function parseDateComponents(tx) {
  if (tx._parsed) return tx._parsed;
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = 1;

  const raw = tx.rawDate || tx.raw_date || tx.date || tx.transaction_date;
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    year = raw.getFullYear();
    month = raw.getMonth();
    day = raw.getDate();
  } else if (typeof raw === "string") {
    if (raw.includes("-")) {
      const parts = raw.split("T")[0].split("-");
      if (parts.length >= 3) {
        year = parseInt(parts[0], 10) || year;
        month = (parseInt(parts[1], 10) || 1) - 1;
        day = parseInt(parts[2], 10) || 1;
      }
    } else if (raw.includes("/")) {
      const parts = raw.split("/");
      if (parts.length >= 3) {
        year = parseInt(parts[0], 10) || year;
        month = (parseInt(parts[1], 10) || 1) - 1;
        day = parseInt(parts[2], 10) || 1;
      }
    } else {
      const parts = raw.trim().split(/\s+/);
      if (parts.length >= 3) {
        day = parseInt(parts[0], 10) || 1;
        const mIdx = SHORT_MONTHS.indexOf(parts[1]);
        if (mIdx !== -1) month = mIdx;
        year = parseInt(parts[2], 10) || year;
      }
    }
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
    googleStatus,
    isSyncing,
    startSync,
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

  const hasInitializedDateRef = useRef(false);

  useEffect(() => {
    if (
      !hasInitializedDateRef.current &&
      transactions &&
      transactions.length > 0
    ) {
      hasInitializedDateRef.current = true;
      const p = parseDateComponents(transactions[0]);
      setSelectedYear(p.year);
      setSelectedMonth(p.month);
      setSelectedQuarter(p.quarter);
    }
  }, [transactions]);

  const [editingTransaction, setEditingTransaction] = useState(null);

  const [excludedCardIds, setExcludedCardIds] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(50);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [excludeDropdownOpen, setExcludeDropdownOpen] = useState(false);
  const [syncPeriodOpen, setSyncPeriodOpen] = useState(false);
  const [selectedSyncPeriod, setSelectedSyncPeriod] = useState("last-30-days");

  const periodRef = useRef(null);
  const excludeRef = useRef(null);
  const syncDropdownRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentQuarter = Math.floor(currentMonth / 3) + 1;

  useEffect(() => {
    function handleClickOutside(e) {
      if (periodRef.current && !periodRef.current.contains(e.target)) {
        setPeriodDropdownOpen(false);
      }
      if (excludeRef.current && !excludeRef.current.contains(e.target)) {
        setExcludeDropdownOpen(false);
      }
      if (
        syncDropdownRef.current &&
        !syncDropdownRef.current.contains(e.target)
      ) {
        setSyncPeriodOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set();
    years.add(currentYear);
    transactions.forEach((tx) => {
      const p = parseDateComponents(tx);
      years.add(p.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentYear]);

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

  const analyticsData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const list = [];
    let totalSpend = 0;

    const timeBuckets = {};
    const dateOrderMap = {};
    const categoryTotals = {};
    const merchantTotals = {};

    transactions.forEach((tx) => {
      if (excludedCardIds.has(tx.cardId)) return;

      const p = parseDateComponents(tx);
      const txDate = new Date(p.year, p.month, p.day);
      if (txDate < thirtyDaysAgo || txDate > now) return;

      list.push(tx);
      const amt = Number(tx.amount) || 0;
      totalSpend += amt;

      const key = `${p.day} ${SHORT_MONTHS[p.month]}`;
      timeBuckets[key] = (timeBuckets[key] || 0) + amt;
      dateOrderMap[key] = txDate.getTime();

      const rawCat = tx.category || "General";
      const cat = beautifyCategory(rawCat);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

      const rawMerch = tx.merchant || "Unknown";
      const merch = beautifyMerchantName(rawMerch);
      if (!merchantTotals[merch]) {
        merchantTotals[merch] = { volume: 0, count: 0 };
      }
      merchantTotals[merch].volume += amt;
      merchantTotals[merch].count += 1;
    });

    let line = Object.entries(timeBuckets)
      .map(([label, value]) => ({
        label,
        value: Math.round(value),
        time: dateOrderMap[label] || 0,
      }))
      .sort((a, b) => a.time - b.time)
      .map(({ label, value }) => ({ label, value }));

    if (line.length === 0) {
      line = [{ label: "Today", value: 0 }];
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

    return {
      filteredTxns: list,
      lineData: line,
      donutData: donut,
      funnelData: funnel,
      totalSpend,
    };
  }, [transactions, excludedCardIds]);

  const { filteredTxns, totalSpendPeriod, totalCashbackPeriod, periodLabel } =
    useMemo(() => {
      const list = [];
      let totalSpend = 0;
      let totalCashback = 0;

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
        const reward = Number(tx.rewardEarned) || 0;
        totalCashback += reward;
      });

      const qObj = QUARTERS.find((q) => q.id === selectedQuarter);
      const qMonths = qObj ? qObj.name.replace(/^Q\d\s*/, "") : "";
      const label =
        periodMode === "month"
          ? `${MONTH_NAMES[selectedMonth]} ${selectedYear}`
          : `Q${selectedQuarter} ${selectedYear} ${qMonths}`;

      return {
        filteredTxns: list,
        totalSpendPeriod: totalSpend,
        totalCashbackPeriod: totalCashback,
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

  const formattedCashback = useMemo(() => {
    return (Math.round(totalCashbackPeriod * 100) / 100).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
    );
  }, [totalCashbackPeriod]);

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
    <div className="flex flex-1 h-full min-h-0 min-w-0 overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-4 sm:gap-6 rounded-tl-none md:rounded-tl-2xl border-l-0 md:border-l border-t-0 md:border-t border-neutral-300/80 bg-[#f8f9fb] p-3.5 sm:p-5 md:p-8 paper-grain overflow-y-auto min-h-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#121c18] border border-teal-800/40 text-teal-300 flex items-center justify-center shrink-0">
              <HugeIcon icon={Invoice01Icon} size={20} />
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

          <div className="flex items-center flex-wrap gap-2">
            <div ref={syncDropdownRef} className="relative">
              <button
                id="sync-spends-btn"
                type="button"
                onClick={() => !isSyncing && setSyncPeriodOpen((prev) => !prev)}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-neutral-300/90 hover:bg-neutral-100 hover:text-neutral-900 transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium text-neutral-700"
              >
                <HugeIcon
                  icon={RefreshCwIcon}
                  size={14}
                  className={`text-neutral-700 ${
                    isSyncing ? "animate-spin text-amber-600" : ""
                  }`}
                />
                <span>
                  {isSyncing
                    ? "Syncing…"
                    : `Sync from Gmail — ${SYNC_PERIOD_OPTIONS.find((o) => o.value === selectedSyncPeriod)?.label ?? "Last 30 Days"}`}
                </span>
                {!isSyncing && (
                  <HugeIcon
                    icon={ChevronDownIcon}
                    size={12}
                    className={`text-neutral-500 transition-transform duration-150 ${
                      syncPeriodOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {syncPeriodOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                    <HugeIcon icon={Calendar03Icon} size={12} />
                    Select sync period
                  </div>
                  {SYNC_PERIOD_OPTIONS.map((opt) => {
                    const isQuarterDisabled =
                      opt.quarterNumber !== null &&
                      opt.quarterNumber > currentQuarter;
                    return (
                      <button
                        key={opt.value}
                        id={`sync-spends-period-${opt.value}`}
                        type="button"
                        disabled={isQuarterDisabled}
                        onClick={() => {
                          if (isQuarterDisabled) return;
                          setSelectedSyncPeriod(opt.value);
                          setSyncPeriodOpen(false);
                          startSync(opt.value);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                          isQuarterDisabled
                            ? "opacity-40 cursor-not-allowed bg-neutral-50 text-neutral-400"
                            : selectedSyncPeriod === opt.value
                              ? "bg-neutral-100 text-neutral-950 cursor-pointer"
                              : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950 cursor-pointer"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isQuarterDisabled && (
                          <span className="text-[10px] font-normal text-neutral-400">
                            Unavailable
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <span className="inline-flex items-center text-xs font-semibold text-neutral-700 bg-white/90 border border-neutral-200/90 px-3 py-1.5 rounded-full shadow-2xs">
              <span>
                {loading ? (
                  <span className="inline-block w-24 h-3 bg-neutral-200/80 rounded animate-pulse align-middle" />
                ) : (
                  `₹${analyticsData.totalSpend.toLocaleString("en-IN")} spent (Last 30 days)`
                )}
              </span>
            </span>
          </div>
        </div>

        <Skeleton
          name="spends-charts"
          loading={loading}
          animate="pulse"
          transition={true}
          fallback={
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[300px]">
              <div className="lg:col-span-7 rounded-3xl border border-neutral-200/80 bg-white/70 p-6 flex flex-col gap-4 animate-pulse min-h-[300px]">
                <div className="flex justify-between items-center">
                  <div className="w-32 h-5 bg-neutral-200/80 rounded-md" />
                  <div className="w-20 h-4 bg-neutral-200/80 rounded-md" />
                </div>
                <div className="flex-1 w-full bg-neutral-100/80 rounded-2xl min-h-[220px]" />
              </div>
              <div className="lg:col-span-5 flex flex-col justify-between gap-5">
                <div className="rounded-3xl border border-neutral-200/80 bg-white/70 p-5 flex flex-col gap-3 animate-pulse h-[145px]">
                  <div className="w-28 h-4 bg-neutral-200/80 rounded-md" />
                  <div className="flex-1 w-full bg-neutral-100/80 rounded-xl" />
                </div>
                <div className="rounded-3xl border border-neutral-200/80 bg-white/70 p-5 flex flex-col gap-3 animate-pulse h-[145px]">
                  <div className="w-28 h-4 bg-neutral-200/80 rounded-md" />
                  <div className="flex-1 w-full bg-neutral-100/80 rounded-xl" />
                </div>
              </div>
            </div>
          }
        >
          {analyticsData.filteredTxns.length < 5 ? (
            <div className="rounded-3xl border border-neutral-300/80 bg-white/70 p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-2xs backdrop-blur-xs min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 mb-3 shadow-2xs">
                <HugeIcon
                  icon={BarChartIcon}
                  size={24}
                  className="text-neutral-700"
                />
              </div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Not enough transactions yet
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-md leading-relaxed">
                At least 5 transactions in the last 30 days are required to
                generate spend trends, category distribution, and top merchant
                analytics.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                  <span>
                    {analyticsData.filteredTxns.length} / 5 transactions found
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-7 flex flex-col h-full">
                <MonoRoundedLineChart
                  data={analyticsData.lineData}
                  theme="light"
                  title="Spend Dynamics"
                  subtitle="Last 30 Days"
                  badgeText="Last 30 Days"
                  className="h-full flex-1"
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-5 h-full">
                <MonoRoundedDonutChart
                  data={analyticsData.donutData}
                  theme="light"
                  title="Top Categories"
                  subtitle="Last 30 days"
                  className="flex-1"
                />
                <MonoRoundedFunnelChart
                  data={analyticsData.funnelData}
                  theme="light"
                  title="Top 5 Merchants"
                  subtitle="Last 30 days"
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </Skeleton>

        <hr className="border-neutral-300/80 my-1" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#111215]">
                Transactions for {periodLabel}
              </h2>

              {loading ? (
                <div className="w-36 h-6 rounded-full bg-neutral-200/80 animate-pulse" />
              ) : (
                <span
                  id="period-cashback-badge"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs transition-all ${
                    totalCashbackPeriod > 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                      : "bg-neutral-100/90 text-neutral-600 border border-neutral-200/90"
                  }`}
                >
                  <HugeIcon
                    icon={SparklesIcon}
                    size={14}
                    className={`shrink-0 ${
                      totalCashbackPeriod > 0
                        ? "text-emerald-600"
                        : "text-neutral-400"
                    }`}
                  />
                  <span>
                    {totalCashbackPeriod > 0 ? `+ ₹${formattedCashback}` : "₹0"}{" "}
                    cashback collected
                  </span>
                </span>
              )}
            </div>

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
                <HugeIcon icon={FilterIcon} size={14} />
                <span>
                  {excludedCardIds.size === 0
                    ? "Exclude a card?"
                    : `${excludedCardIds.size} Card${excludedCardIds.size > 1 ? "s" : ""} Excluded`}
                </span>
                <HugeIcon
                  icon={ChevronDownIcon}
                  size={14}
                  className="opacity-70"
                />
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

                  {loading ? (
                    <div className="flex flex-col gap-1.5 py-1">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-xl bg-neutral-50 animate-pulse"
                        >
                          <div className="w-3.5 h-3.5 rounded bg-neutral-200/80 shrink-0" />
                          <div className="w-24 h-3 rounded bg-neutral-200/80" />
                          <div className="w-8 h-2.5 rounded bg-neutral-200/80 ml-auto" />
                        </div>
                      ))}
                    </div>
                  ) : cards.length === 0 ? (
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
                              <HugeIcon
                                icon={CreditCardIcon}
                                size={14}
                                className="text-neutral-500 shrink-0"
                              />
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
                                <HugeIcon
                                  icon={Tick02Icon}
                                  size={12}
                                  strokeWidth={2.5}
                                />
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
              <HugeIcon
                icon={Calendar03Icon}
                size={14}
                className="text-neutral-600"
              />
              <span>Change period ({periodLabel})</span>
              <HugeIcon
                icon={ChevronDownIcon}
                size={14}
                className="text-neutral-500"
              />
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
                    {QUARTERS.map((q) => {
                      const isQDisabled =
                        selectedYear === currentYear && q.id > currentQuarter;
                      const qCashback = transactions.reduce((sum, tx) => {
                        if (excludedCardIds.has(tx.cardId)) return sum;
                        const p = parseDateComponents(tx);
                        if (p.year === selectedYear && p.quarter === q.id) {
                          return sum + (Number(tx.rewardEarned) || 0);
                        }
                        return sum;
                      }, 0);
                      const formattedQCashback = (
                        Math.round(qCashback * 100) / 100
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      });

                      return (
                        <button
                          key={q.id}
                          type="button"
                          disabled={isQDisabled}
                          onClick={() => {
                            if (isQDisabled) return;
                            setSelectedQuarter(q.id);
                            setPeriodDropdownOpen(false);
                            setVisibleCount(50);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                            isQDisabled
                              ? "opacity-40 cursor-not-allowed bg-neutral-50 text-neutral-400"
                              : selectedQuarter === q.id
                                ? "bg-neutral-900 text-white font-bold shadow-xs cursor-pointer"
                                : "bg-neutral-50 hover:bg-neutral-100 text-neutral-700 cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{q.label}</span>
                            <span
                              className={`font-normal ${
                                selectedQuarter === q.id
                                  ? "text-neutral-300"
                                  : "text-neutral-400"
                              }`}
                            >
                              {q.name} {isQDisabled ? "(Unavailable)" : ""}
                            </span>
                          </div>
                          {!isQDisabled && qCashback > 0 && (
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                selectedQuarter === q.id
                                  ? "bg-white/20 text-emerald-300"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              }`}
                            >
                              +₹{formattedQCashback}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 flex flex-col gap-4 pb-16 min-h-[300px]">
          <Skeleton
            name="dashboard-transactions"
            loading={loading}
            animate="pulse"
            transition={true}
            fallback={
              <div className="rounded-2xl border border-neutral-200/90 bg-white/85 shadow-xs overflow-hidden">
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
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-neutral-200/80 shrink-0" />
                              <div className="w-28 h-4 bg-neutral-200/80 rounded-md" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="w-20 h-4 bg-neutral-200/80 rounded-md" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="w-16 h-3.5 bg-neutral-200/80 rounded-md" />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="w-14 h-4 bg-neutral-200/80 rounded-md ml-auto" />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="w-12 h-4 bg-neutral-200/80 rounded-md ml-auto" />
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 w-12"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          >
            {filteredTxns.length === 0 ? (
              <div className="rounded-2xl border border-neutral-300/80 bg-white/60 p-12 flex flex-col items-center justify-center text-center shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 mb-3">
                  <HugeIcon icon={InboxIcon} size={24} />
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
                    <HugeIcon icon={RotateLeft01Icon} size={12} />
                    <span>Reset card exclusions</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-200/90 bg-white/85 backdrop-blur-xs shadow-xs overflow-hidden w-full shrink-0">
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
                                <span>{beautifyMerchantName(tx.merchant)}</span>
                                {tx.category && (
                                  <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded-full">
                                    {beautifyCategory(tx.category)}
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
                                    <HugeIcon icon={CreditCardIcon} size={14} />
                                  </div>
                                )}
                                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-neutral-900 text-white text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap z-30 shadow-md">
                                  {cardName}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap text-xs">
                              {tx.date}
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium text-neutral-900 whitespace-nowrap">
                              - Rs {(tx.amount ?? 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60">
                                + Rs{" "}
                                {(tx.rewardEarned ?? 0).toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  title="Edit transaction"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTransaction(tx.id);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-black/85 hover:bg-black border border-neutral-800/80 shadow-xs text-[#868593] hover:text-white active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0"
                                >
                                  <HugeIcon icon={Edit02Icon} size={14} />
                                </button>
                                <button
                                  type="button"
                                  title="Delete transaction"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(tx.id);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-black/85 hover:bg-black border border-neutral-800/80 shadow-xs text-[#868593] hover:text-red-400 hover:border-red-900/50 active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0"
                                >
                                  <HugeIcon icon={Delete02Icon} size={14} />
                                </button>
                              </div>
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
                        Load more ({filteredTxns.length - visibleCount}{" "}
                        remaining)
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </Skeleton>
        </div>
      </div>

      <EditTransactionModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        transaction={
          transactions?.find((t) => t.id === editingTransaction) || null
        }
        transactionId={editingTransaction}
        cards={cards}
        onTransactionUpdated={async () => {
          await fetchAll();
        }}
      />
    </div>
  );
}

export default Spends;
