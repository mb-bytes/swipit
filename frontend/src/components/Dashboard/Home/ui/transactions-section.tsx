"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RefreshCwIcon,
  Add01Icon,
  InboxIcon,
  Loading03Icon,
  ChevronRightIcon,
  CreditCardIcon,
  Invoice01Icon,
  Edit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "boneyard-js/react";
import { CardItem } from "./cards-section";
import { AddTransactionModal, TransactionItem } from "./add-transaction-modal";
import { getBankLogo } from "@/lib/bank-logos.js";
import { beautifyMerchantName, beautifyCategory } from "@/lib/merchant-utils";
import api from "@/api/axios";
import { sileo } from "sileo";

interface TransactionsSectionProps {
  transactions: TransactionItem[];
  loading?: boolean;
  onAddTransaction: (txn: TransactionItem) => void;
  onDeleteTransaction?: (transactionId: string) => void | Promise<void>;
  onRefreshTransactions?: () => void | Promise<void>;
  cards: CardItem[];
  googleConnected: boolean;
  showViewAll?: boolean;
}

export function TransactionsSection({
  transactions,
  loading = false,
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#121c18] border border-teal-800/40 text-teal-300 flex items-center justify-center shrink-0">
            <HugeIcon icon={Invoice01Icon} size={20} />
          </div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#111215]">
              Recent Transactions
            </h2>
            {isSyncing && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-medium bg-amber-100/90 border border-amber-300/80 px-2.5 py-0.5 rounded-full">
                <HugeIcon icon={Loading03Icon} size={12} className="animate-spin" />
                Syncing transactions...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-neutral-600">
          <button
            id="sync-gmail-btn"
            type="button"
            onClick={startSyncLast5Days}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-neutral-300/90 hover:bg-neutral-100 hover:text-neutral-900 transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HugeIcon
              icon={RefreshCwIcon}
              size={14}
              className={`text-neutral-700 ${
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
            <HugeIcon icon={Add01Icon} size={14} />
            <span>Add Manually</span>
          </button>
        </div>
      </div>

      <div className="w-full">
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
                    {[1, 2, 3, 4, 5].map((i) => (
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
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200/90 bg-white/70 backdrop-blur-xs p-8 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 mb-2">
                <HugeIcon icon={InboxIcon} size={20} />
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
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-neutral-900 text-white text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap z-30 shadow-md">
                                {cardName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap text-xs">
                            {tx.date}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-neutral-900 whitespace-nowrap">
                            ₹{tx.amount?.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-emerald-600 whitespace-nowrap">
                            +₹{tx.rewardEarned?.toLocaleString("en-IN") || 0}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                title="Edit transaction"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("Edit transaction clicked", tx.id);
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
                    <HugeIcon icon={ChevronRightIcon} size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          )}
        </Skeleton>
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
