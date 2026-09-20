"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Cancel01Icon,
  Invoice01Icon,
  SparklesIcon,
  Loading03Icon,
  Calendar03Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ChevronDownIcon,
} from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { motion, AnimatePresence } from "motion/react";
import { CardItem } from "./cards-section";
import { sileo } from "sileo";
import { Dropdown } from "@/components/ui/dropdown";
import api from "@/api/axios";

export interface TransactionItem {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  cardName: string;
  rewardEarned: number;
  category?: string;
  cardId?: string;
  rawDate?: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardItem[];
  onTransactionAdded: (txn: TransactionItem) => void;
}

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

const WEEKDAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function formatDisplayDate(isoString: string): string {
  if (!isoString) return "";
  const parts = isoString.split("-").map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    const [y, m, d] = parts;
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return isoString;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  cards,
  onTransactionAdded,
}: AddTransactionModalProps) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedCard, setSelectedCard] = useState(
    cards[0]?.cardName || "Axis Flipkart",
  );
  const [submitting, setSubmitting] = useState(false);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const todayIso = new Date().toISOString().split("T")[0];
      setDate(todayIso);
      setViewYear(new Date().getFullYear());
      setViewMonth(new Date().getMonth());
      setIsCalendarOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setDate(formatted);
    setIsCalendarOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const todayIso = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!merchant.trim() || isNaN(numAmount) || numAmount <= 0) {
      sileo.error({
        title: "Invalid Input",
        description: "Please enter a valid merchant name and spend amount.",
      });
      return;
    }

    const card = cards.find((c) => c.cardName === selectedCard) ?? cards[0];
    if (!card) {
      sileo.error({ title: "No card selected", description: "Please add a card first." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/cards/transactions", {
        card_id: card.id,
        merchant: merchant.trim(),
        amount: numAmount,
        transaction_date: date,
      });

      const data = res.data;
      const newTxn: TransactionItem = {
        id: data.transaction_id,
        merchant: data.merchant,
        date: data.transaction_date,
        amount: data.amount,
        cardName: card.cardName,
        rewardEarned: data.reward_earned,
        category: data.category ?? "Shopping",
        rawDate: data.raw_date || date,
      };

      onTransactionAdded(newTxn);
      sileo.success({
        title: "Transaction Logged",
        description: `₹${numAmount} at ${merchant.trim()} recorded. Earned +₹${data.reward_earned}!`,
      });
      setMerchant("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      onClose();
    } catch {
      sileo.error({
        title: "Couldn't Save Transaction",
        description: "A server error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-2xl bg-[#141518] border border-white/10 p-6 text-white shadow-2xl relative select-none"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <HugeIcon icon={Cancel01Icon} size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#121c18] border border-teal-800/40 text-teal-300 flex items-center justify-center shrink-0">
                <HugeIcon icon={Invoice01Icon} size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Add Transaction</h3>
                <p className="text-xs text-neutral-400">
                  Record a card spend to calculate cashbacks and points
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Merchant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flipkart, Swiggy, Amazon"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min={1}
                    step="any"
                    className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="relative" ref={calendarRef}>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Date
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="w-full flex items-center justify-between rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm text-white hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <HugeIcon icon={Calendar03Icon} size={15} className="text-amber-400 shrink-0" />
                      <span className="truncate text-xs font-medium">
                        {formatDisplayDate(date)}
                      </span>
                    </div>
                    <HugeIcon
                      icon={ChevronDownIcon}
                      size={14}
                      className={`text-neutral-400 transition-transform duration-150 shrink-0 ${
                        isCalendarOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-[calc(100%+6px)] z-50 w-[260px] rounded-2xl bg-[#1a1c22] border border-white/15 p-2.5 shadow-2xl backdrop-blur-md"
                      >
                        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <HugeIcon icon={ArrowLeft01Icon} size={14} />
                          </button>
                          <span className="text-xs font-semibold text-neutral-200">
                            {MONTH_NAMES[viewMonth]} {viewYear}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <HugeIcon icon={ArrowRight01Icon} size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                          {WEEKDAY_NAMES.map((day) => (
                            <span key={day} className="text-[10px] font-semibold text-neutral-500 py-0.5">
                              {day}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center">
                          {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <span
                              key={`prev-${i}`}
                              className="text-[11px] text-neutral-700 py-1 cursor-default select-none"
                            >
                              {daysInPrevMonth - firstDayIndex + i + 1}
                            </span>
                          ))}

                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const cellIso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                            const isSelected = date === cellIso;
                            const isToday = todayIso === cellIso;

                            return (
                              <button
                                key={`day-${dayNum}`}
                                type="button"
                                onClick={() => handleSelectDate(dayNum)}
                                className={`text-[11px] py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center relative ${
                                  isSelected
                                    ? "bg-amber-400 text-neutral-950 font-bold shadow-xs scale-105"
                                    : isToday
                                    ? "text-amber-400 border border-amber-400/40 hover:bg-amber-400/10"
                                    : "text-neutral-300 hover:bg-white/10"
                                }`}
                              >
                                {dayNum}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Card Used
                </label>
                <Dropdown
                  className="w-full"
                  side="top"
                  triggerClassName="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400/50"
                  menuClassName="bg-[#1e1f23] border border-white/10 text-white"
                  value={selectedCard}
                  onChange={(val) => setSelectedCard(val)}
                  items={
                    cards.length > 0
                      ? cards.map((c) => ({
                          value: c.cardName,
                          label: `${c.cardName} (•••• ${c.cardLast4})`,
                        }))
                      : [{ value: "Axis Flipkart", label: "Axis Flipkart" }]
                  }
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <HugeIcon icon={Loading03Icon} size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <HugeIcon icon={SparklesIcon} size={16} />
                    <span>Add Transaction</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AddTransactionModal;
