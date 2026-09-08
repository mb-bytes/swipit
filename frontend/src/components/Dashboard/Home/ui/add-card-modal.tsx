"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "@/api/axios";
import { sileo } from "sileo";
import { Dropdown } from "@/components/ui/dropdown";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded: (card: any) => void;
  defaultCardHolder?: string;
}

const DEFAULT_POPULAR_CARDS = [
  { bank: "Axis Bank", name: "Axis Bank Flipkart Credit Card", network: "Visa" },
  { bank: "HDFC Bank", name: "HDFC Millennia Credit Card", network: "Mastercard" },
  { bank: "HDFC Bank", name: "HDFC Regalia Gold", network: "Visa" },
  { bank: "ICICI Bank", name: "Amazon Pay ICICI Card", network: "Visa" },
  { bank: "SBI Card", name: "SBI Cashback Card", network: "Visa" },
  { bank: "Federal Bank", name: "Federal Scapia Card", network: "Visa" },
];

export function AddCardModal({
  isOpen,
  onClose,
  onCardAdded,
  defaultCardHolder = "Card Holder",
}: AddCardModalProps) {
  const [catalogue, setCatalogue] = useState<Record<string, any[]> | null>(null);
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [last4, setLast4] = useState<string>("");
  const [cardHolder, setCardHolder] = useState<string>(defaultCardHolder);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCatalogue();
      setCardHolder(defaultCardHolder || "Card Holder");
    }
  }, [isOpen, defaultCardHolder]);

  const fetchCatalogue = async () => {
    setLoadingCatalogue(true);
    try {
      const res = await api.get("/api/cards/catalogue");
      if (res.data && Object.keys(res.data).length > 0) {
        setCatalogue(res.data);
        const firstBank = Object.keys(res.data)[0];
        setSelectedBank(firstBank);
        if (res.data[firstBank]?.length > 0) {
          setSelectedProductId(res.data[firstBank][0].product_id);
          setCardName(res.data[firstBank][0].product_name);
        }
      }
    } catch {
      setSelectedBank(DEFAULT_POPULAR_CARDS[0].bank);
      setCardName(DEFAULT_POPULAR_CARDS[0].name);
    } finally {
      setLoadingCatalogue(false);
    }
  };

  const handleBankChange = (bank: string) => {
    setSelectedBank(bank);
    if (catalogue && catalogue[bank]?.length > 0) {
      setSelectedProductId(catalogue[bank][0].product_id);
      setCardName(catalogue[bank][0].product_name);
    } else {
      const firstForBank = DEFAULT_POPULAR_CARDS.find((c) => c.bank === bank);
      if (firstForBank) {
        setCardName(firstForBank.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLast4 = last4.replace(/\D/g, "").slice(-4);
    if (cleanLast4.length !== 4) {
      sileo.error({
        title: "Invalid Card Number",
        description: "Please enter the 4 digits for your card.",
      });
      return;
    }

    setSubmitting(true);
    try {
      let createdCard: any = null;
      if (selectedProductId) {
        try {
          const res = await api.post("/api/cards/create", {
            product_id: selectedProductId,
            card_last4: cleanLast4,
          });
          createdCard = {
            id: res.data.card_id,
            cardName: res.data.card_name || cardName,
            cardLast4: res.data.card_last4 || cleanLast4,
            bankName: selectedBank || "Bank",
            cardHolder: cardHolder || defaultCardHolder,
            theme: "gray-light",
          };
        } catch {}
      }

      if (!createdCard) {
        createdCard = {
          id: `card-${Date.now()}`,
          cardName: cardName || `${selectedBank} Card`,
          cardLast4: cleanLast4,
          bankName: selectedBank || "Bank",
          cardHolder: cardHolder || defaultCardHolder,
          theme: "gray-light",
        };
      }

      sileo.success({
        title: "Card Added!",
        description: `${createdCard.cardName} ending in ${cleanLast4} has been registered.`,
      });

      onCardAdded(createdCard);
      onClose();
      setLast4("");
    } catch {
      sileo.error({
        title: "Failed to add card",
        description: "Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const banksList = catalogue
    ? Object.keys(catalogue)
    : Array.from(new Set(DEFAULT_POPULAR_CARDS.map((c) => c.bank)));

  const currentBankProducts = catalogue
    ? catalogue[selectedBank] || []
    : DEFAULT_POPULAR_CARDS.filter((c) => c.bank === selectedBank);

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
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Add Credit Card</h3>
                <p className="text-xs text-neutral-400">
                  Select your card to auto-track perks and cashbacks
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Issuing Bank
                </label>
                <Dropdown
                  className="w-full"
                  triggerClassName="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400/50"
                  menuClassName="bg-[#1e1f23] border border-white/10 text-white"
                  value={selectedBank}
                  onChange={(bank) => handleBankChange(bank)}
                  items={banksList.map((bank) => ({
                    value: bank,
                    label: bank,
                  }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Card Variant
                </label>
                {loadingCatalogue ? (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading card catalogue...</span>
                  </div>
                ) : (
                  <Dropdown
                    className="w-full"
                    triggerClassName="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm text-white focus:ring-2 focus:ring-amber-400/50"
                    menuClassName="bg-[#1e1f23] border border-white/10 text-white"
                    value={selectedProductId || cardName}
                    onChange={(val) => {
                      if (catalogue && catalogue[selectedBank]) {
                        const found = catalogue[selectedBank].find(
                          (p: any) => p.product_id === val,
                        );
                        if (found) {
                          setSelectedProductId(found.product_id);
                          setCardName(found.product_name);
                          return;
                        }
                      }
                      setCardName(val);
                    }}
                    items={currentBankProducts.map((p: any) => ({
                      value: p.product_id || p.name,
                      label: p.product_name || p.name,
                    }))}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Last 4 Digits
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={last4}
                    onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                    placeholder="1234"
                    required
                    className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm font-mono tracking-widest text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-center"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Your Name"
                    required
                    className="w-full rounded-xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding Card...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save Card</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AddCardModal;
