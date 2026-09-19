"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/api/axios";
import { sileo } from "sileo";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { TextReveal } from "./ui/text-reveal";
import { CardsSection } from "./ui/cards-section";
import { TransactionsSection } from "./ui/transactions-section";
import { UnmatchedBanner } from "./ui/unmatched-banner";
import { UnmatchedDrawer } from "./ui/unmatched-drawer";
import { CheckmarkCircle02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { AnimatePresence } from "motion/react";

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    cards,
    transactions,
    unmatchedItems,
    loading,
    initialized,
    fetchAll,
    addTransaction,
    deleteTransaction,
    addCard,
    deleteCard,
    assignUnmatched,
    dismissUnmatched,
    dismissAllUnmatched,
    googleStatus,
    fetchGoogleStatus,
  } = useDashboard();

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayName = user?.name || user?.username || "Friend";

  useEffect(() => {
    if (!initialized) fetchAll(displayName);
  }, []);

  useEffect(() => {
    if (searchParams.get("google_connected") === "true") {
      sileo.success({
        title: "Gmail Connected!",
        description:
          "Your Gmail account has been successfully linked for transaction sync.",
      });
      searchParams.delete("google_connected");
      setSearchParams(searchParams, { replace: true });
      fetchGoogleStatus();
    }
  }, [searchParams, setSearchParams]);

  const handleConnectOrSwitchGoogle = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    window.location.href = `${baseUrl}/auth/google/login?action=connect`;
  };

  const handleAddCard = (newCard) => {
    addCard(newCard);
  };

  const handleDeleteCard = (cardId) => {
    let toastId = "";
    toastId = sileo.action({
      title: "Delete Card?",
      description: (
        <div className="flex flex-col gap-3.5 pt-1">
          <p className="text-[14px] font-normal text-neutral-300 leading-relaxed text-center">
            Deleting this card will permanently delete all its associated transactions.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <span
              role="button"
              tabIndex={0}
              data-sileo-button="true"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (toastId) sileo.dismiss(toastId);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (toastId) sileo.dismiss(toastId);
                }
              }}
              className="sileo-action-btn-cancel active:scale-95"
            >
              Cancel
            </span>
            <span
              role="button"
              tabIndex={0}
              data-sileo-button="true"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (toastId) sileo.dismiss(toastId);
                sileo.promise(
                  api.delete(`/api/cards/${cardId}`).then(() => {
                    deleteCard(cardId);
                  }),
                  {
                    loading: { title: "Deleting Card" },
                    success: { title: "Card deleted successfully" },
                    error: { title: "Failed to delete card" },
                  },
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (toastId) sileo.dismiss(toastId);
                  sileo.promise(
                    api.delete(`/api/cards/${cardId}`).then(() => {
                      deleteCard(cardId);
                    }),
                    {
                      loading: { title: "Deleting Card" },
                      success: { title: "Card deleted successfully" },
                      error: { title: "Failed to delete card" },
                    },
                  );
                }
              }}
              className="sileo-action-btn-danger active:scale-95"
            >
              Delete Card
            </span>
          </div>
        </div>
      ),
    });
  };

  const handleAddTransaction = (newTxn) => {
    addTransaction(newTxn);
  };

  const handleUpdateTransaction = () => {
    fetchAll(displayName);
  };

  const handleDeleteTransaction = async (transactionId) => {
    deleteTransaction(transactionId);
    try {
      await api.delete(`/api/cards/transactions/${transactionId}`);
      sileo.success({ title: "Transaction deleted" });
    } catch {
      await fetchAll(displayName);
      sileo.error({
        title: "Couldn't delete transaction",
        description: "A server error has occurred",
      });
    }
  };

  const handleTransactionAssigned = (unmatchedId, txn) => {
    assignUnmatched(unmatchedId, {
      id: txn.id,
      cardId: txn.cardId,
      merchant: txn.merchant,
      date: txn.date,
      amount: txn.amount,
      cardName: txn.cardName,
      rewardEarned: txn.rewardEarned,
      category: txn.category,
    });
  };

  const handleTransactionDismissed = (unmatchedId) => {
    dismissUnmatched(unmatchedId);
  };

  const handleDeleteAllUnmatched = () => {
    const count = unmatchedItems.length;
    let toastId = "";
    toastId = sileo.action({
      title: "Delete unmatched transactions?",
      description: (
        <div className="flex flex-col gap-3.5 pt-1">
          <p className="text-[14px] font-normal text-neutral-300 leading-relaxed text-center">
            Permanently delete all {count} unmatched transaction{count !== 1 ? "s" : ""}?
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <span
              role="button"
              tabIndex={0}
              data-sileo-button="true"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (toastId) sileo.dismiss(toastId);
              }}
              className="sileo-action-btn-cancel active:scale-95"
            >
              Cancel
            </span>
            <span
              role="button"
              tabIndex={0}
              data-sileo-button="true"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (toastId) sileo.dismiss(toastId);
                sileo.promise(
                  api.delete("/api/unmatched/all").then(() => {
                    dismissAllUnmatched();
                    setDrawerOpen(false);
                  }),
                  {
                    loading: { title: "Deleting transactions..." },
                    success: { title: "All unmatched transactions deleted" },
                    error: { title: "Failed to delete unmatched transactions" },
                  },
                );
              }}
              className="sileo-action-btn-danger active:scale-95"
            >
              Delete All
            </span>
          </div>
        </div>
      ),
    });
  };

  const showBanner = unmatchedItems.length > 0 && !bannerDismissed;

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-4 sm:gap-6 rounded-tl-none md:rounded-tl-2xl border-l-0 md:border-l border-t-0 md:border-t border-neutral-300/80 bg-[#f8f9fb] p-3.5 sm:p-5 md:p-8 paper-grain overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111215]">
              <TextReveal
                text={`Hello, ${displayName}`}
                className="!text-[#111215] font-bold"
                stagger={0.06}
              />
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end text-xs max-w-full">
            {googleStatus.loading ? (
              <div className="flex flex-col items-start md:items-end gap-1 py-1">
                <div className="w-48 h-3.5 bg-neutral-200/80 rounded animate-pulse" />
                <div className="w-28 h-2.5 bg-neutral-200/60 rounded animate-pulse" />
              </div>
            ) : googleStatus.connected ? (
              <>
                <div className="flex items-center gap-1.5 text-neutral-800 font-medium max-w-full flex-wrap">
                  <HugeIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600 shrink-0" />
                  <span className="break-all">
                    Account connected to{" "}
                    <strong className="font-mono text-neutral-950 font-semibold break-all">
                      {googleStatus.email}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleConnectOrSwitchGoogle}
                  className="text-neutral-500 hover:text-neutral-900 underline underline-offset-2 transition-colors cursor-pointer mt-0.5 text-[11px]"
                >
                  Want to change connected account?
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectOrSwitchGoogle}
                className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-neutral-950 font-medium transition-colors cursor-pointer group"
              >
                <span>Connect your Gmail account</span>
                <HugeIcon icon={ArrowRight01Icon} size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

        <hr className="border-neutral-300/80" />

        <AnimatePresence>
          {showBanner && (
            <UnmatchedBanner
              count={unmatchedItems.length}
              onReview={() => setDrawerOpen(true)}
              onDismiss={() => setBannerDismissed(true)}
              onDeleteAll={handleDeleteAllUnmatched}
            />
          )}
        </AnimatePresence>

        <CardsSection
          cards={cards}
          loading={loading}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          userName={displayName}
        />

        <hr className="border-neutral-300/80" />

        <TransactionsSection
          transactions={transactions.slice(0, 5)}
          loading={loading}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onRefreshTransactions={() => fetchAll(displayName)}
          cards={cards}
          googleConnected={googleStatus.connected}
        />
      </div>

      <UnmatchedDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={unmatchedItems}
        cards={cards}
        onAssigned={handleTransactionAssigned}
        onDismissed={handleTransactionDismissed}
        onDismissAll={dismissAllUnmatched}
      />
    </div>
  );
}

export default Home;
