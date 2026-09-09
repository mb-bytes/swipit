"use client";

import React, { useState } from "react";
import { X, Receipt, Sparkles, Loader2 } from "lucide-react";
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
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardItem[];
  onTransactionAdded: (txn: TransactionItem) => void;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  cards,
  onTransactionAdded,
}: AddTransactionModalProps) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState(
    cards[0]?.cardName || "Axis Flipkart",
  );
  const [submitting, setSubmitting] = useState(false);

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
      };

      onTransactionAdded(newTxn);
      sileo.success({
        title: "Transaction Logged",
        description: `₹${numAmount} at ${merchant.trim()} recorded. Earned +₹${data.reward_earned}!`,
      });
      setMerchant("");
      setAmount("");
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
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="rounded-xl bg-amber-400 p-2.5 text-neutral-950 font-bold">
                <Receipt className="w-5 h-5" />
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
                  className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Card Used
                </label>
                <Dropdown
                  className="w-full"
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
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
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
