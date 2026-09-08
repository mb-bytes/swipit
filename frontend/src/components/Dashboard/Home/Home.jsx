"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/api/axios";
import { sileo } from "sileo";
import { useAuth } from "@/contexts/AuthContext";
import { TextReveal } from "./ui/text-reveal";
import { CardsSection } from "./ui/cards-section";
import { TransactionsSection } from "./ui/transactions-section";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [googleStatus, setGoogleStatus] = useState({
    loading: true,
    connected: false,
    email: null,
  });
  const [error, setError] = useState("");

  const displayName = user?.name || user?.username || "Friend";

  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);

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

  const fetchCardsAndTransactions = async () => {
    try {
      const cardsRes = await api.get("/api/cards/my-cards");
      if (cardsRes.data && Array.isArray(cardsRes.data)) {
        setCards(
          cardsRes.data.map((c) => ({
            id: c.card_id,
            cardName: c.card_name || c.product_name || "Card",
            cardLast4: c.card_last4 || "1234",
            bankName: c.bank_name || "Bank",
            cardHolder: displayName.toUpperCase(),
            cardExpiration: "xx/xx",
            theme: "gray-light",
          })),
        );
      } else {
        setCards([]);
      }
    } catch (e) {
      setError("Error while fetching your cards, please try again");
    }

    try {
      const txRes = await api.get("/api/cards/transactions");
      if (txRes.data && Array.isArray(txRes.data)) {
        setTransactions(
          txRes.data.map((t) => ({
            id: t.transaction_id,
            cardId: t.card_id,
            merchant: t.merchant,
            date: t.transaction_date,
            amount: parseFloat(t.amount) || 0,
            cardName: t.card_name || "Credit Card",
            rewardEarned: parseFloat(t.reward_earned) || 0,
            category: t.category,
          })),
        );
      } else {
        setTransactions([]);
      }
    } catch {
      setError("Error while fetching your transactions, please try again");
    }
  };

  useEffect(() => {
    fetchGoogleStatus();
    fetchCardsAndTransactions();
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
    setCards((prev) => [newCard, ...prev]);
  };

  const handleDeleteCard = async (cardId) => {
    const cardToDelete = cards.find((c) => c.id === cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setTransactions((prev) =>
      prev.filter(
        (t) => t.cardId !== cardId && t.cardName !== cardToDelete?.cardName,
      ),
    );

    try {
      await api.delete(`/api/cards/${cardId}`);
      await fetchCardsAndTransactions();
      sileo.success({ title: "Card deleted" });
    } catch (e) {
      await fetchCardsAndTransactions();
      sileo.error({
        title: "Couldn't delete card",
        description: "A server error has occurred",
      });
    }
  };

  const handleAddTransaction = (newTxn) => {
    setTransactions((prev) => [newTxn, ...prev]);
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-6 rounded-tl-2xl border-l border-t border-neutral-300/80 bg-[#f2eee5] p-5 md:p-8 paper-grain overflow-y-auto">
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

        <CardsSection
          cards={cards}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          googleConnected={googleStatus.connected}
          googleEmail={googleStatus.email}
          userName={displayName}
        />

        <hr className="border-neutral-300/80" />

        <TransactionsSection
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
          onRefreshTransactions={fetchCardsAndTransactions}
          cards={cards}
          googleConnected={googleStatus.connected}
        />
      </div>
    </div>
  );
}

export default Home;
