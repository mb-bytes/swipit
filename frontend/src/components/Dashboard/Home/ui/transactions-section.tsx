"use client";

import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, Plus, Inbox, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { CardItem } from "./cards-section";
import { AddTransactionModal, TransactionItem } from "./add-transaction-modal";
import api from "@/api/axios";
import { sileo } from "sileo";

interface TransactionsSectionProps {
  transactions: TransactionItem[];
  onAddTransaction: (txn: TransactionItem) => void;
  onRefreshTransactions?: () => void | Promise<void>;
  cards: CardItem[];
  googleConnected: boolean;
}

export function TransactionsSection({
  transactions,
  onAddTransaction,
  onRefreshTransactions,
  cards,
  googleConnected,
}: TransactionsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const pollTaskStatus = (taskId: string) => {
    let attempts = 0;
    const maxAttempts = 60; 

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const res = await api.get(`/api/gmail/task/${taskId}`);
        const status = res.data?.status;

        if (status === "SUCCESS") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsSyncing(false);
          await onRefreshTransactions?.();
          sileo.success({
            title: "Transactions Synced",
            description: "Your latest transactions have been synced successfully.",
          });
        } else if (status === "FAILURE") {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsSyncing(false);
          sileo.error({
            title: "Sync Failed",
            description: res.data?.error || "Failed to sync transactions from Gmail.",
          });
        } else if (attempts >= maxAttempts) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsSyncing(false);
          await onRefreshTransactions?.();
        }
      } catch {
        if (attempts >= maxAttempts) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsSyncing(false);
        }
      }
    }, 2000);
  };

  const handleSyncGmail = async () => {
    if (!googleConnected) {
      sileo.info({
        title: "Gmail Not Connected",
        description: "Connect your Gmail account to sync bank alerts automatically.",
      });
      window.location.href = "http://localhost:8000/auth/google/login?action=connect";
      return;
    }

    setIsSyncing(true);
    try {
      const afterDate = `${new Date().getFullYear()}/01/01`;
      const res = await api.post("/api/gmail/ingest", null, {
        params: { after_date: afterDate },
      });
      const taskId = res.data?.task_id;
      if (taskId) {
        pollTaskStatus(taskId);
      } else {
        setTimeout(() => setIsSyncing(false), 2000);
      }
    } catch {
      setIsSyncing(false);
      sileo.error({
        title: "Sync Error",
        description: "Could not initiate Gmail sync. Please try again.",
      });
    }
  };

  return (
    <section className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#111215]">
            Recent Transactions
          </h2>
          {isSyncing && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium bg-amber-100/90 border border-amber-300/80 px-2.5 py-0.5 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing transactions...
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-neutral-600">
          <button
            type="button"
            onClick={handleSyncGmail}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-neutral-700 ${
                isSyncing ? "animate-spin text-amber-600" : ""
              }`}
            />
            <span>{isSyncing ? "Syncing transactions..." : "Sync Transaction from gmail"}</span>
          </button>

          <span className="text-neutral-400 font-mono text-xs">or</span>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition-all shadow-2xs font-semibold cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manually</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-neutral-300/80 bg-white/60 p-8 flex flex-col items-center justify-center text-center shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-200 flex items-center justify-center text-neutral-600 mb-2">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-neutral-800">
              No Transactions Yet
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Connect your Gmail to parse bank statements or click "Add Manually" above.
            </p>
          </div>
        ) : (
          transactions.map((tx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-neutral-300/80 bg-white/80 hover:bg-white hover:border-neutral-400/80 transition-all duration-150 p-4 md:px-6 md:py-4 shadow-2xs flex items-center justify-between gap-4 select-none"
            >
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm md:text-base font-bold text-[#111215] truncate">
                  {tx.merchant}
                </span>
                <span className="text-xs text-neutral-500 mt-0.5">
                  {tx.date}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center text-center px-2">
                <span className="text-sm md:text-base font-mono font-bold text-neutral-900 tracking-tight">
                  - Rs {(tx.amount ?? 0).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-neutral-600 font-medium mt-0.5">
                  {tx.cardName}
                </span>
              </div>

              <div className="flex flex-col items-end justify-center text-right min-w-[90px]">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Reward Earned
                </span>
                <span className="inline-flex items-center gap-1 text-sm md:text-base font-mono font-bold text-emerald-700 mt-0.5">
                  + Rs {(tx.rewardEarned ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cards={cards}
        onTransactionAdded={onAddTransaction}
      />
    </section>
  );
}

export default TransactionsSection;
