"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import api from "@/api/axios";
import { sileo } from "sileo";
import { Dropdown } from "@/components/ui/dropdown";

export interface UnmatchedItem {
  id: string;
  bank_name: string;
  merchant: string;
  amount: number;
  currency: string;
  transaction_date: string;
  transaction_time: string | null;
  raw_email_id: string;
}

export interface CardItem {
  id: string;
  cardName: string;
  cardLast4: string;
}

interface UnmatchedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: UnmatchedItem[];
  cards: CardItem[];
  onAssigned: (unmatchedId: string, txn: { id: string; merchant: string; amount: number; date: string; cardName: string; rewardEarned: number; category: string | null; cardId: string }) => void;
  onDismissed: (unmatchedId: string) => void;
  onDismissAll?: () => void;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function UnmatchedDrawer({ isOpen, onClose, items, cards, onAssigned, onDismissed, onDismissAll }: UnmatchedDrawerProps) {
  const [selectedCards, setSelectedCards] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleAssign = async (item: UnmatchedItem) => {
    const cardName = selectedCards[item.id] ?? cards[0]?.cardName;
    const card = cards.find((c) => c.cardName === cardName);
    if (!card) {
      sileo.error({ title: "Select a card", description: "Choose which card this transaction belongs to." });
      return;
    }

    setLoadingId(item.id);
    try {
      const res = await api.post(`/api/unmatched/${item.id}/assign`, { card_id: card.id });
      const data = res.data;
      onAssigned(item.id, {
        id: data.transaction_id,
        merchant: data.merchant,
        amount: data.amount,
        date: data.transaction_date,
        cardName: data.card_name,
        rewardEarned: data.reward_earned,
        category: data.category ?? null,
        cardId: data.card_id,
      });
      sileo.success({ title: "Transaction assigned", description: `${item.merchant} added to ${card.cardName}.` });
    } catch {
      sileo.error({ title: "Failed to assign", description: "A server error occurred." });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDismiss = async (item: UnmatchedItem) => {
    setLoadingId(item.id);
    try {
      await api.delete(`/api/unmatched/${item.id}`);
      onDismissed(item.id);
      sileo.success({ title: "Dismissed" });
    } catch {
      sileo.error({ title: "Failed to dismiss" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDismissAll = () => {
    const count = items.length;
    sileo.action({
      title: "Delete unmatched transactions?",
      description: `Permanently delete all ${count} unmatched transaction${count !== 1 ? "s" : ""}?`,
      button: {
        title: "Delete All",
        onClick: () => {
          sileo.promise(
            api.delete("/api/unmatched/all").then(() => {
              onDismissAll?.();
              onClose();
            }),
            {
              loading: { title: "Deleting transactions..." },
              success: { title: "All unmatched transactions deleted" },
              error: { title: "Failed to delete unmatched transactions" },
            }
          );
        },
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#141518] border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-400 p-2 text-neutral-950">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white">Unmatched Transactions</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{items.length} transaction{items.length !== 1 ? "s" : ""} need a card assigned</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    type="button"
                    disabled={isDeletingAll}
                    onClick={handleDismissAll}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingAll ? "Deleting..." : "Delete All"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-neutral-400 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  <p className="text-sm font-semibold text-white">All caught up!</p>
                  <p className="text-xs text-neutral-400">No unmatched transactions remaining.</p>
                </div>
              ) : (
                items.map((item) => {
                  const isBusy = loadingId === item.id;
                  const cardOptions = cards.map((c) => ({
                    value: c.cardName,
                    label: `${c.cardName} (\u2022\u2022\u2022\u2022 ${c.cardLast4})`
                  }));
                  const formattedDate = formatDate(item.transaction_date);

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{item.merchant}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {formattedDate} &bull; {item.bank_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-mono font-bold text-white">
                            {item.currency !== "INR" ? `${item.currency} ` : "\u20B9"}
                            {item.amount.toLocaleString("en-IN")}
                          </span>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDismiss(item)}
                            className="text-neutral-500 hover:text-red-400 rounded-md p-1 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <Dropdown
                          className="flex-1"
                          triggerClassName="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-400/50"
                          menuClassName="bg-[#1e1f23] border border-white/10 text-white text-sm"
                          value={selectedCards[item.id] ?? cards[0]?.cardName ?? ""}
                          onChange={(val) => setSelectedCards((prev) => ({ ...prev, [item.id]: val }))}
                          items={cardOptions}
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isBusy || cards.length === 0}
                        onClick={() => handleAssign(item)}
                        className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Assigning...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Assign to card</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default UnmatchedDrawer;