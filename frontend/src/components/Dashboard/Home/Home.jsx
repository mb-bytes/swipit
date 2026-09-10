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
import { CheckCircle2, ArrowRight } from "lucide-react";
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
  } = useDashboard();

  const [googleStatus, setGoogleStatus] = useState({
    loading: true,
    connected: false,
    email: null,
  });
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayName = user?.name || user?.username || "Friend";

  const fetchGoogleStatus = async () => {
    try {
      const res = await api.get("/auth/google/status");
      setGoogleStatus({
        loading: false,
        connected: res.data.connected,
        email: res.data.email,
      });
    } catch {
      setGoogleStatus({ loading: false, connected: false, email: null });
    }
  };

  useEffect(() => {
    fetchGoogleStatus();
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
    window.location.href =
      "http://localhost:8000/auth/google/login?action=connect";
  };

  const handleAddCard = (newCard) => {
    addCard(newCard);
  };

  const handleDeleteCard = async (cardId) => {
    deleteCard(cardId);
    try {
      await api.delete(`/api/cards/${cardId}`);
      sileo.success({ title: "Card deleted" });
    } catch {
      await fetchAll(displayName);
      sileo.error({
        title: "Couldn't delete card",
        description: "A server error has occurred",
      });
    }
  };

  const handleAddTransaction = (newTxn) => {
    addTransaction(newTxn);
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
    sileo.action({
      title: "Delete unmatched transactions?",
      description: `Permanently delete all ${count} unmatched transaction${count !== 1 ? "s" : ""}?`,
      button: {
        title: "Delete All",
        onClick: () => {
          sileo.promise(
            api.delete("/api/unmatched/all").then(() => {
              dismissAllUnmatched();
              setDrawerOpen(false);
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

  const showBanner = unmatchedItems.length > 0 && !bannerDismissed;

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-6 rounded-tl-2xl border-l border-t border-neutral-300/80 bg-[#f8f9fb] p-5 md:p-8 paper-grain overflow-y-auto">
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

          <div className="flex flex-col items-start md:items-end text-xs">
            {googleStatus.connected ? (
              <>
                <div className="flex items-center gap-1.5 text-neutral-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Account connected to{" "}
                    <strong className="font-mono text-neutral-950 font-semibold">
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
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          userName={displayName}
        />

        <hr className="border-neutral-300/80" />

        <TransactionsSection
          transactions={transactions.slice(0, 5)}
          onAddTransaction={handleAddTransaction}
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

