"use client";

import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, Plus, Inbox, Loader2, ChevronRight, CreditCard as CardIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { CardItem } from "./cards-section";
import { AddTransactionModal, TransactionItem } from "./add-transaction-modal";
import DeleteButton from "@/components/ui/delete-button";
import { getBankLogo } from "@/lib/bank-logos.js";
import { beautifyMerchantName } from "@/lib/merchant-utils";
import api from "@/api/axios";
import { sileo } from "sileo";

interface TransactionsSectionProps {
  transactions: TransactionItem[];
  onAddTransaction: (txn: TransactionItem) => void;
  onDeleteTransaction?: (transactionId: string) => void | Promise<void>;
  onRefreshTransactions?: () => void | Promise<void>;
  cards: CardItem[];
  googleConnected: boolean;
  showViewAll?: boolean;
}

export function TransactionsSection({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onRefreshTransactions,
  cards,
  googleConnected,
  showViewAll = true,
}: TransactionsSectionProps) {
  const navigate = useNavigate();
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
            description: "Last 5 days of transactions have been synced successfully.",
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

  const startSyncLast5Days = async () => {
    if (cards.length === 0) {
      sileo.info({
        title: "No Cards Found",
        description: "Add at least one card before syncing transactions.",
      });
      return;
    }

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
      const res = await api.post("/api/gmail/sync-last-5-days");
      const taskId = res.data?.task_id;
      if (taskId) {
        pollTaskStatus(taskId);
      } else {
        setTimeout(() => setIsSyncing(false), 2000);
      }
    } catch (err: any) {
      setIsSyncing(false);
      const detail = err?.response?.data?.detail;
      sileo.error({
        title: "Sync Error",
        description: detail || "Could not initiate Gmail sync. Please try again.",
      });
    }
  };

  const handleOpenAddModal = () => {
    if (cards.length === 0) {
      sileo.info({
        title: "No Cards Found",
        description: "Add at least one card before adding transactions.",
      });
      return;
    }
    setModalOpen(true);
  };

  const handleDelete = async (txId: string) => {
    if (onDeleteTransaction) {
      await onDeleteTransaction(txId);
    } else {
      try {
        await api.delete(`/api/cards/transactions/${txId}`);
        await onRefreshTransactions?.();
        sileo.success({ title: "Transaction deleted" });
      } catch {
        sileo.error({
          title: "Couldn't delete transaction",
          description: "A server error has occurred",
        });
      }
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
            id="sync-gmail-btn"
            type="button"
            onClick={startSyncLast5Days}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-neutral-300/90 hover:bg-neutral-100 hover:text-neutral-900 transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-neutral-700 ${
                isSyncing ? "animate-spin text-amber-600" : ""
              }`}
            />
            <span>
              {isSyncing ? "Syncing last 5 days…" : "Sync last 5 days"}
            </span>
          </button>

          <span className="text-neutral-400 font-mono text-xs">or</span>

          <button
            id="add-transaction-manual-btn"
            type="button"
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111215] text-[#f8f9fb] hover:bg-neutral-800 transition-all shadow-2xs font-semibold cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Manually</span>
          </button>
        </div>
      </div>

      <div className="w-full">
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200/90 bg-white/70 backdrop-blur-xs p-8 flex flex-col items-center justify-center text-center shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 mb-2">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-neutral-800">
              No Transactions Yet
            </p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Add a card first, then sync from Gmail or add transactions manually.
            </p>
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
                  {transactions.map((tx) => {
                    const matchedCard = cards?.find(
                      (c) =>
                        c.id === tx.cardId ||
                        c.cardName?.toLowerCase() === tx.cardName?.toLowerCase()
                    );
                    const cardName = tx.cardName || matchedCard?.cardName || "Credit Card";
                    const bankName = matchedCard?.bankName || "";
                    const bankLogo = matchedCard?.logo || getBankLogo(bankName, cardName);

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-neutral-50/80 transition-colors group"
                      >
                        <td className="py-3.5 px-4 sm:px-6 font-medium text-neutral-900 whitespace-nowrap">
                          {beautifyMerchantName(tx.merchant)}
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
                                <CardIcon className="w-3.5 h-3.5" />
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
                            + Rs {(tx.rewardEarned ?? 0).toLocaleString("en-IN")}
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

            {showViewAll && (
              <div className="border-t border-neutral-200/70 px-4 py-2.5 sm:px-6 bg-neutral-50/40 flex items-center justify-between text-xs text-neutral-500 select-none">
                <span>Showing {transactions.length} recent transactions</span>
                <button
                  id="view-all-spends-btn"
                  type="button"
                  onClick={() => navigate("/spends")}
                  className="inline-flex items-center gap-1 font-semibold text-neutral-800 hover:text-black transition-colors cursor-pointer group"
                >
                  View all spends
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
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
