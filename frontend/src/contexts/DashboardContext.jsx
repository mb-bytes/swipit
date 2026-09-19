import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import api from "@/api/axios";
import { sileo } from "sileo";

const DashboardContext = createContext(null);

export const useDashboard = () => useContext(DashboardContext);

export function DashboardProvider({ children }) {
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [unmatchedItems, setUnmatchedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const pollIntervalRef = useRef(null);

  const [googleStatus, setGoogleStatus] = useState({
    loading: true,
    connected: false,
    email: null,
  });

  const fetchGoogleStatus = useCallback(async () => {
    try {
      const res = await api.get("/auth/google/status");
      setGoogleStatus({
        loading: false,
        connected: Boolean(res.data?.connected),
        email: res.data?.email || null,
      });
    } catch {
      setGoogleStatus({ loading: false, connected: false, email: null });
    }
  }, []);

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
          rewardType: c.reward_type || c.reward_unit || null,
          rewardUnit: c.reward_unit || c.reward_type || null,
          pointValueInr:
            c.point_value_inr != null ? Number(c.point_value_inr) : null,
        })),
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
          pointsEarned: parseFloat(t.points_earned) || 0,
          rewardUnit: t.reward_unit || null,
          pointValueInr:
            t.point_value_inr != null ? Number(t.point_value_inr) : null,
          category: t.category,
        })),
      );

      setUnmatchedItems(unmatchedRes.data || []);
      setInitialized(true);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoogleStatus();
    if (!initialized) {
      fetchAll();
    }
  }, [initialized, fetchAll, fetchGoogleStatus]);

  const pollTaskStatus = useCallback(
    (
      taskId,
      successMessage = "Your transactions have been synced successfully.",
    ) => {
      let attempts = 0;
      const maxAttempts = 60;

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      try {
        sessionStorage.setItem(
          "swipit_sync_task",
          JSON.stringify({
            taskId,
            successMessage,
            startedAt: Date.now(),
          }),
        );
      } catch {}

      pollIntervalRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const res = await api.get(`/api/gmail/task/${taskId}`);
          const status = res.data?.status;

          if (status === "SUCCESS") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            try {
              sessionStorage.removeItem("swipit_sync_task");
            } catch {}
            setIsSyncing(false);
            await fetchAll();
            sileo.success({
              title: "Transactions Synced",
              description: successMessage,
            });
          } else if (status === "FAILURE") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            try {
              sessionStorage.removeItem("swipit_sync_task");
            } catch {}
            setIsSyncing(false);
            sileo.error({
              title: "Sync Failed",
              description:
                res.data?.error || "Failed to sync transactions from Gmail.",
            });
          } else if (attempts >= maxAttempts) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            try {
              sessionStorage.removeItem("swipit_sync_task");
            } catch {}
            setIsSyncing(false);
            await fetchAll();
          }
        } catch {
          if (attempts >= maxAttempts) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            try {
              sessionStorage.removeItem("swipit_sync_task");
            } catch {}
            setIsSyncing(false);
          }
        }
      }, 2000);
    },
    [fetchAll],
  );

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("swipit_sync_task");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed?.taskId &&
          Date.now() - (parsed.startedAt || 0) < 5 * 60 * 1000
        ) {
          setIsSyncing(true);
          pollTaskStatus(parsed.taskId, parsed.successMessage);
        } else {
          sessionStorage.removeItem("swipit_sync_task");
        }
      }
    } catch {}

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollTaskStatus]);

  const startSync = useCallback(
    async (period = "last-30-days") => {
      if (cards.length === 0) {
        sileo.info({
          title: "No Cards Found",
          description: "Add at least one card before syncing transactions.",
        });
        return;
      }

      if (!googleStatus.connected) {
        sileo.info({
          title: "Gmail Not Connected",
          description:
            "Connect your Gmail account to sync bank alerts automatically.",
        });
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        window.location.href =
          `${baseUrl}/auth/google/login?action=connect`;
        return;
      }

      setIsSyncing(true);
      try {
        let afterDate = "";
        const currentYear = new Date().getFullYear();
        if (period === "last-30-days") {
          const d = new Date();
          d.setDate(d.getDate() - 30);
          afterDate = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
        } else {
          const startMonths = { Q1: "01", Q2: "04", Q3: "07", Q4: "10" };
          afterDate = `${currentYear}/${startMonths[period] || "01"}/01`;
        }

        const res = await api.post("/api/gmail/ingest", null, {
          params: { after_date: afterDate },
        });
        const taskId = res.data?.task_id;
        if (taskId) {
          pollTaskStatus(taskId, "Your transactions have been synced successfully.");
        } else {
          setTimeout(() => setIsSyncing(false), 2000);
        }
      } catch (err) {
        setIsSyncing(false);
        try {
          sessionStorage.removeItem("swipit_sync_task");
        } catch {}
        const detail = err?.response?.data?.detail;
        sileo.error({
          title: "Sync Error",
          description:
            detail || "Could not initiate Gmail sync. Please try again.",
        });
      }
    },
    [cards.length, googleStatus.connected, pollTaskStatus],
  );

  const startSyncLast5Days = useCallback(async () => {
    if (cards.length === 0) {
      sileo.info({
        title: "No Cards Found",
        description: "Add at least one card before syncing transactions.",
      });
      return;
    }

    if (!googleStatus.connected) {
      sileo.info({
        title: "Gmail Not Connected",
        description:
          "Connect your Gmail account to sync bank alerts automatically.",
      });
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      window.location.href =
        `${baseUrl}/auth/google/login?action=connect`;
      return;
    }

    setIsSyncing(true);
    try {
      const res = await api.post("/api/gmail/sync-last-5-days");
      const taskId = res.data?.task_id;
      if (taskId) {
        pollTaskStatus(
          taskId,
          "Last 5 days of transactions have been synced successfully.",
        );
      } else {
        setTimeout(() => setIsSyncing(false), 2000);
      }
    } catch (err) {
      setIsSyncing(false);
      try {
        sessionStorage.removeItem("swipit_sync_task");
      } catch {}
      const detail = err?.response?.data?.detail;
      sileo.error({
        title: "Sync Error",
        description:
          detail || "Could not initiate Gmail sync. Please try again.",
      });
    }
  }, [cards.length, googleStatus.connected, pollTaskStatus]);

  const addTransaction = (tx) => setTransactions((prev) => [tx, ...prev]);

  const updateTransaction = async (transactionId, updatedData) => {
    try {
      const res = await api.put(
        `/api/cards/transactions/${transactionId}`,
        updatedData,
      );
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === transactionId ? { ...tx, ...res.data } : tx,
        ),
      );
      return res.data;
    } catch (error) {
      throw new Error("Unable to update transaction");
    }
  };

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
        updateTransaction,
        deleteTransaction,
        addCard,
        deleteCard,
        assignUnmatched,
        dismissUnmatched,
        dismissAllUnmatched,
        googleStatus,
        fetchGoogleStatus,
        isSyncing,
        startSync,
        startSyncLast5Days,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
