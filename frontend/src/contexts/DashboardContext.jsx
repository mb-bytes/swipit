import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "@/api/axios";

const DashboardContext = createContext(null);

export const useDashboard = () => useContext(DashboardContext);

export function DashboardProvider({ children }) {
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [unmatchedItems, setUnmatchedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchAll = useCallback(async (displayName = "User") => {
    setLoading(true);
    try {
      const [cardsRes, txRes, unmatchedRes] = await Promise.all([
        api.get("/api/cards/my-cards"),
        api.get("/api/cards/transactions"),
        api.get("/api/unmatched"),
      ]);

      setCards(
        (cardsRes.data || []).map((c) => ({
          id: c.card_id,
          cardName: c.card_name || c.product_name || "Card",
          cardLast4: c.card_last4 || "1234",
          bankName: c.bank_name || "Bank",
          cardExpiration: "xx/xx",
          theme: "gray-light",
        }))
      );

      setTransactions(
        (txRes.data || []).map((t) => ({
          id: t.transaction_id,
          cardId: t.card_id,
          merchant: t.merchant,
          date: t.transaction_date,
          rawDate: t.raw_date || t.transaction_date,
          amount: parseFloat(t.amount) || 0,
          cardName: t.card_name || "Credit Card",
          rewardEarned: parseFloat(t.reward_earned) || 0,
          category: t.category,
        }))
      );

      setUnmatchedItems(unmatchedRes.data || []);
      setInitialized(true);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      fetchAll();
    }
  }, [initialized, fetchAll]);

  const addTransaction = (tx) => setTransactions((prev) => [tx, ...prev]);

  const deleteTransaction = (id) =>
    setTransactions((prev) => prev.filter((t) => t.id !== id));

  const addCard = (card) => setCards((prev) => [card, ...prev]);

  const deleteCard = (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setTransactions((prev) => prev.filter((t) => t.cardId !== cardId));
  };

  const assignUnmatched = (unmatchedId, tx) => {
    setUnmatchedItems((prev) => prev.filter((u) => u.id !== unmatchedId));
    setTransactions((prev) => [tx, ...prev.filter((t) => t.id !== tx.id)]);
  };

  const dismissUnmatched = (unmatchedId) =>
    setUnmatchedItems((prev) => prev.filter((u) => u.id !== unmatchedId));

  const dismissAllUnmatched = () => setUnmatchedItems([]);

  return (
    <DashboardContext.Provider
      value={{
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
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
