"use client";

import React, { useState } from "react";
import { X, Mail, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react";
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

  const handleConnectGoogle = () => {
    window.location.href = "http://localhost:8000/auth/google/login?action=connect";
  };

  const handleScanCards = async () => {
    setScanning(true);
    setScanned(false);
    try {
      const afterDate = `${new Date().getFullYear()}/01/01`;
      const res = await api.post("/api/gmail/discover-cards", null, {
        params: { after_date: afterDate },
      });
      const cards = res.data.cards || [];
      setDiscoveredCards(cards);
      setScanned(true);

      if (cards.length > 0) {
        sileo.success({
          title: "Cards Discovered!",
          description: `Found ${cards.length} card(s) from your Gmail bank alerts.`,
        });
        cards.forEach((c: any) => {
          onCardDiscovered({
            id: `card-${c.card_last4 || Date.now()}`,
            cardName: `${c.bank_name || "Bank"} Credit Card`,
            cardLast4: c.card_last4 || "1234",
            bankName: c.bank_name || "Bank",
            cardHolder: "Primary User",
            theme: "brand-dark",
          });
        });
      } else {
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
      setDiscoveredCards([]);
    } finally {
      setScanning(false);
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
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SyncCardsModal;
