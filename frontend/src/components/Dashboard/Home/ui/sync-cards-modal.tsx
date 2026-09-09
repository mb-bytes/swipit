"use client";

import React, { useState } from "react";
import { X, Mail, CheckCircle2, ArrowRight, Loader2, Sparkles, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "@/api/axios";
import { sileo } from "sileo";

interface SyncCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleConnected: boolean;
  googleEmail: string | null;
  onCardDiscovered: (card: any) => void;
}

export function SyncCardsModal({
  isOpen,
  onClose,
  googleConnected,
  googleEmail,
  onCardDiscovered,
}: SyncCardsModalProps) {
  const [scanning, setScanning] = useState(false);
  const [discoveredCards, setDiscoveredCards] = useState<any[]>([]);
  const [scanned, setScanned] = useState(false);
  const [userLast4, setUserLast4] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);

  const handleConnectGoogle = () => {
    window.location.href = "http://localhost:8000/auth/google/login?action=connect";
  };

  const handleScanCards = async () => {
    setScanning(true);
    setScanned(false);
    setDiscoveredCards([]);
    setUserLast4({});
    try {
      const afterDate = `${new Date().getFullYear()}/01/01`;
      const res = await api.post("/api/gmail/discover-cards", null, {
        params: { after_date: afterDate },
      });
      const cards = res.data.cards || [];
      setDiscoveredCards(cards);
      setScanned(true);
      if (cards.length === 0) {
        sileo.info({
          title: "Scan Completed",
          description: "No new cards detected in recent bank alert emails.",
        });
      }
    } catch {
      sileo.error({
        title: "Scan Failed",
        description: "Could not scan emails. Ensure Gmail permissions are granted.",
      });
      setScanned(true);
    } finally {
      setScanning(false);
    }
  };

  const allLast4Filled = discoveredCards.every((card, i) => {
    if (card.card_last4) return true;
    return (userLast4[i] || "").replace(/\D/g, "").length === 4;
  });

  const handleImport = async () => {
    setImporting(true);
    let importedCount = 0;
    for (let i = 0; i < discoveredCards.length; i++) {
      const card = discoveredCards[i];
      const last4 = card.card_last4 || (userLast4[i] || "").replace(/\D/g, "").slice(-4);
      try {
        const res = await api.post("/api/cards/create-discovered", {
          bank_name: card.bank_name,
          card_name: card.card_name || `${card.bank_name} Credit Card`,
          card_last4: last4,
        });
        onCardDiscovered({
          id: res.data.card_id,
          cardName: res.data.card_name,
          cardLast4: res.data.card_last4,
          bankName: card.bank_name,
          cardHolder: "Primary User",
          theme: "brand-dark",
        });
        importedCount++;
      } catch {
        sileo.error({
          title: "Failed to save card",
          description: `Could not save ${card.bank_name} card.`,
        });
      }
    }
    setImporting(false);
    if (importedCount > 0) {
      sileo.success({
        title: "Cards Imported!",
        description: `${importedCount} card${importedCount > 1 ? "s" : ""} saved to your account.`,
      });
      onClose();
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
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Sync Cards from Gmail</h3>
                <p className="text-xs text-neutral-400">
                  Automatically parse card alerts from Axis, HDFC & Federal Bank
                </p>
              </div>
            </div>

            {!googleConnected ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 text-sm text-neutral-300">
                  <p className="leading-relaxed">
                    Connect your Gmail to automatically discover credit cards linked to your bank alerts and statements.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Connect Gmail Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Connected account:</span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {googleEmail}
                    </span>
                  </div>
                </div>

                {scanned && discoveredCards.length === 0 && (
                  <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 text-center">
                    <p className="text-xs text-neutral-400">
                      No new cards detected in recent messages. You can also add your card manually!
                    </p>
                  </div>
                )}

                {scanned && discoveredCards.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs text-neutral-400 font-medium">
                      {discoveredCards.length} card{discoveredCards.length > 1 ? "s" : ""} found — confirm details to import
                    </p>
                    {discoveredCards.map((card, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-white/[0.04] border border-white/10 p-3.5 flex flex-col gap-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-sm font-semibold text-white">
                            {card.card_name || `${card.bank_name} Credit Card`}
                          </span>
                        </div>
                        {card.card_last4 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400">Last 4 digits:</span>
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
                              •••• {card.card_last4}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-neutral-400">
                              Last 4 digits <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={4}
                              placeholder="e.g. 2693"
                              value={userLast4[i] || ""}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                                setUserLast4((prev) => ({ ...prev, [i]: val }));
                              }}
                              className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400/60 focus:bg-white/10 transition-all"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(!scanned || discoveredCards.length === 0) && (
                  <button
                    type="button"
                    onClick={handleScanCards}
                    disabled={scanning}
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Scanning Bank Messages...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Scan & Import Cards</span>
                      </>
                    )}
                  </button>
                )}

                {scanned && discoveredCards.length > 0 && (
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={importing || !allLast4Filled}
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Cards...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          Import {discoveredCards.length} Card{discoveredCards.length > 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SyncCardsModal;
