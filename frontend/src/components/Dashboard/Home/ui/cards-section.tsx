"use client";

import React, { useState } from "react";
import { Skeleton } from "boneyard-js/react";
import { CreditCardIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { AddCardSquare } from "./add-card-square";
import { CreditCard } from "@/components/Signup/credit-card";
import { AddCardModal } from "./add-card-modal";
import { getBankLogo } from "@/lib/bank-logos.js";

export interface CardItem {
  id: string;
  cardName: string;
  cardLast4: string;
  bankName: string;
  cardHolder: string;
  theme?: any;
  cardExpiration?: string;
  logo?: string;
}

interface CardsSectionProps {
  cards: CardItem[];
  loading?: boolean;
  onAddCard: (card: CardItem) => void;
  onDeleteCard?: (cardId: string) => void;
  userName?: string;
}

export function CardsSection({
  cards = [],
  loading = false,
  onAddCard,
  onDeleteCard,
  userName = "Card Holder",
}: CardsSectionProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);

  return (
    <section className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#121c18] border border-teal-800/40 text-teal-300 flex items-center justify-center shrink-0">
            <HugeIcon icon={CreditCardIcon} size={20} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#111215]">
              Your cards
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {loading ? (
                <span className="inline-block w-40 h-3 bg-neutral-200/80 rounded animate-pulse align-middle" />
              ) : (
                `${cards.length} card${cards.length === 1 ? "" : "s"} tracked for cashback & rewards`
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 overflow-x-auto pt-3 pb-5 px-2 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
        <AddCardSquare onAddManual={() => setAddModalOpen(true)} />

        <Skeleton
          name="dashboard-cards"
          loading={loading}
          animate="pulse"
          transition={true}
          className="shrink-0"
          fallback={
            <div className="flex items-center gap-5 shrink-0">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-[316px] h-[190px] rounded-2xl bg-neutral-200/80 border border-neutral-300/60 p-5 flex flex-col justify-between shrink-0 animate-pulse"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-7 rounded-lg bg-neutral-300/80" />
                    <div className="w-14 h-4 rounded-md bg-neutral-300/80" />
                  </div>
                  <div className="w-44 h-5 rounded-md bg-neutral-300/80" />
                  <div className="flex justify-between items-end">
                    <div className="w-24 h-4 rounded-md bg-neutral-300/80" />
                    <div className="w-12 h-4 rounded-md bg-neutral-300/80" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          {(!cards || cards.length === 0) ? (
            <div className="shrink-0 flex flex-col justify-center items-center px-6 py-6 rounded-2xl border border-dashed border-neutral-300/80 bg-white/50 backdrop-blur-xs text-center min-w-[300px] h-[190px]">
              <p className="text-sm font-semibold text-neutral-800">
                No cards found
              </p>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-[220px] leading-relaxed">
                Add a card to start tracking your rewards and transactions.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              {cards.map((card, idx) => {
                const formattedNumber = `•••• •••• •••• ${card.cardLast4 || "1234"}`;
                const cardType = card.theme || "gray-light";
                const logo = card.logo || getBankLogo(card.bankName, card.cardName);

                return (
                  <div
                    key={card.id || idx}
                    className="relative shrink-0 group transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl rounded-2xl"
                  >
                    <CreditCard
                      company={card.cardName || card.bankName || "Bank Name"}
                      logo={logo}
                      cardNumber={formattedNumber}
                      cardHolder={card.cardHolder || userName}
                      cardExpiration={card.cardExpiration || "12/28"}
                      type={cardType}
                      width={316}
                    />
                    <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        type="button"
                        title="Delete card"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCard?.(card.id);
                        }}
                        className="w-8 h-8 rounded-xl bg-black/85 hover:bg-black border border-neutral-800/80 shadow-md text-[#868593] hover:text-red-400 hover:border-red-900/50 active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      >
                        <HugeIcon icon={Delete02Icon} size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Skeleton>
      </div>

      <AddCardModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCardAdded={onAddCard}
        defaultCardHolder={userName}
      />
    </section>
  );
}

export default CardsSection;
