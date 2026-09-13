"use client";

import React, { useMemo } from "react";
import {
  Gift,
  Sparkles,
  Award,
  Coins,
  CreditCard as CreditCardIcon,
  Store,
  ShoppingBag,
} from "lucide-react";
import { Skeleton } from "boneyard-js/react";
import { useDashboard } from "@/contexts/DashboardContext";
import { NumberPopIn } from "@/components/ui/animate-number";
import { CreditCard } from "@/components/Signup/credit-card";
import { getBankLogo } from "@/lib/bank-logos.js";
import { beautifyMerchantName, beautifyCategory } from "@/lib/merchant-utils";

export function TrackRewards() {
  const { cards, transactions, loading } = useDashboard();

  const stats = useMemo(() => {
    let totalCashback = 0;
    const cardMap = {};
    const merchantMap = {};
    const categoryMap = {};

    transactions.forEach((tx) => {
      const reward = Number(tx.rewardEarned) || 0;
      totalCashback += reward;

      const cKey = tx.cardId || tx.cardName || "unknown-card";
      if (!cardMap[cKey]) {
        cardMap[cKey] = {
          cardId: tx.cardId,
          cardName: tx.cardName || "Credit Card",
          reward: 0,
          spend: 0,
          count: 0,
        };
      }
      cardMap[cKey].reward += reward;
      cardMap[cKey].spend += Number(tx.amount) || 0;
      cardMap[cKey].count += 1;

      const rawMerch = tx.merchant || "Unknown";
      const merch = beautifyMerchantName(rawMerch);
      if (!merchantMap[merch]) {
        merchantMap[merch] = { name: merch, reward: 0, spend: 0, count: 0 };
      }
      merchantMap[merch].reward += reward;
      merchantMap[merch].spend += Number(tx.amount) || 0;
      merchantMap[merch].count += 1;

      const rawCat = tx.category || "Online Shopping";
      const cat = beautifyCategory(rawCat);
      if (!categoryMap[cat]) {
        categoryMap[cat] = { name: cat, reward: 0, spend: 0, count: 0 };
      }
      categoryMap[cat].reward += reward;
      categoryMap[cat].spend += Number(tx.amount) || 0;
      categoryMap[cat].count += 1;
    });

    const sortedCards = Object.values(cardMap).sort((a, b) => b.reward - a.reward);
    const topCardData = sortedCards[0];

    const matchedCard = topCardData
      ? cards.find(
          (c) =>
            c.id === topCardData.cardId ||
            c.cardName?.toLowerCase() === topCardData.cardName?.toLowerCase()
        )
      : cards[0];

    const defaultCard = cards[0] || {
      cardName: "Axis Flipkart",
      cardLast4: "5644",
      bankName: "Axis Bank",
    };

    const highestCard = {
      cardName: matchedCard?.cardName || topCardData?.cardName || defaultCard.cardName,
      cardLast4: matchedCard?.cardLast4 || defaultCard.cardLast4 || "5644",
      bankName: matchedCard?.bankName || defaultCard.bankName || "Axis Bank",
      cardHolder: matchedCard?.cardHolder || "Valued Member",
      reward: topCardData ? Math.round(topCardData.reward * 100) / 100 : 0,
      logo:
        matchedCard?.logo ||
        getBankLogo(
          matchedCard?.bankName || defaultCard.bankName,
          matchedCard?.cardName || defaultCard.cardName
        ),
    };

    const sortedMerchants = Object.values(merchantMap).sort((a, b) => b.reward - a.reward);
    const biggestMerchant = sortedMerchants[0] || {
      name: "Flipkart",
      reward: 500,
    };

    const sortedCategories = Object.values(categoryMap).sort((a, b) => b.reward - a.reward);
    const topCategory = sortedCategories[0] || {
      name: "Online Shopping",
      reward: 4000,
    };

    const pointsCards = cards.filter((c) => {
      const unit = (c.rewardUnit || c.rewardType || "").toLowerCase();
      return unit === "points";
    });

    const hasPointsCard = pointsCards.length > 0;

    let pointsCardName = "";
    let pointsCollected = 0;
    let pointsConvertedInr = 0;

    if (hasPointsCard) {
      const pointsCardStats = pointsCards.map((pCard) => {
        const cardTxns = transactions.filter(
          (t) =>
            (t.cardId && pCard.id && String(t.cardId) === String(pCard.id)) ||
            (t.cardName && pCard.cardName && t.cardName.toLowerCase() === pCard.cardName.toLowerCase())
        );

        let pts = 0;
        let inr = 0;
        const ptVal = Number(pCard.pointValueInr) || 0.25;

        cardTxns.forEach((t) => {
          const tPts = Number(t.pointsEarned) || 0;
          const tInr = Number(t.rewardEarned) || 0;
          if (tPts > 0) {
            pts += tPts;
            inr += tInr || (tPts * ptVal);
          } else if (tInr > 0 && ptVal > 0) {
            pts += Math.round(tInr / ptVal);
            inr += tInr;
          }
        });

        return {
          card: pCard,
          points: pts,
          inr: Math.round(inr * 100) / 100,
        };
      });

      pointsCardStats.sort((a, b) => b.points - a.points);
      const topPointsCard = pointsCardStats[0];

      const totalPointsAllCards = pointsCardStats.reduce((sum, item) => sum + item.points, 0);
      const totalInrAllCards = pointsCardStats.reduce((sum, item) => sum + item.inr, 0);

      pointsCardName = topPointsCard?.card?.cardName || pointsCards[0]?.cardName || "Points Card";
      pointsCollected = totalPointsAllCards;
      pointsConvertedInr = Math.round(totalInrAllCards * 100) / 100;
    }

    const roundedTotal = Math.round(totalCashback * 100) / 100;

    return {
      totalCashback: roundedTotal > 0 ? roundedTotal : 5000,
      highestCard,
      biggestMerchant: {
        name: biggestMerchant.name,
        reward: Math.round(biggestMerchant.reward * 100) / 100,
      },
      topCategory: {
        name: topCategory.name,
        reward: Math.round(topCategory.reward * 100) / 100,
      },
      hasPointsCard,
      pointsCardName,
      pointsCollected,
      pointsConvertedInr,
    };
  }, [transactions, cards]);

  return (
    <div className="flex flex-1 h-full min-h-0 min-w-0 overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-6 rounded-tl-2xl border-l border-t border-neutral-300/80 bg-[#f8f9fb] p-5 md:p-8 pt-6 md:pt-8 paper-grain overflow-y-auto lg:overflow-hidden min-h-0">
        <div className="flex items-center justify-between gap-3 shrink-0 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111215] flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-4.5 h-4.5 text-[#f2eee5]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111215] leading-tight">
                Track Rewards
              </h1>
              <p className="text-xs text-neutral-500">
                The official scoreboard of every single rupee you clawed back from the banks.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rewards Optimized</span>
          </span>
        </div>

        <Skeleton
          name="track-rewards-board"
          loading={loading}
          animate="pulse"
          transition={true}
          fallback={
            <div className="flex-1 rounded-3xl border border-neutral-200/80 bg-white/70 p-6 flex flex-col justify-between animate-pulse min-h-[380px]">
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-40 h-3 bg-neutral-200/80 rounded" />
                <div className="w-36 h-10 bg-neutral-200/80 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-44 rounded-2xl bg-neutral-100/80" />
                <div className="flex flex-col gap-3">
                  <div className="h-20 rounded-2xl bg-neutral-100/80" />
                  <div className="h-20 rounded-2xl bg-neutral-100/80" />
                </div>
              </div>
              <div className="h-12 rounded-2xl bg-neutral-100/80" />
            </div>
          }
        >
          <div className="flex-1 rounded-3xl border border-neutral-300/80 bg-white/80 backdrop-blur-xs shadow-xs p-5 sm:p-6 lg:p-7 flex flex-col justify-between gap-5 transition-all min-h-0">
            <div className="flex flex-col items-center text-center select-none shrink-0">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">
                Total Cashback Collected
              </span>

              <div className="flex items-center justify-center font-black tracking-tight text-neutral-900 font-mono my-0.5 text-4xl sm:text-5xl lg:text-6xl">
                <span className="text-emerald-500 mr-1">+</span>
                <NumberPopIn
                  value={stats.totalCashback.toLocaleString("en-IN")}
                  className="font-mono text-neutral-900"
                />
              </div>

              <p className="text-[11px] sm:text-xs text-neutral-500">
                Direct bank cashback credited to you — proof that playing your cards right pays.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch flex-1 min-h-0">
              <div className="lg:col-span-6 flex flex-col gap-2 h-full justify-between">
                <div className="flex items-center gap-1.5 px-1 text-xs sm:text-sm font-semibold text-neutral-700 select-none shrink-0">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>The undisputed MVP of your wallet</span>
                </div>

                <div className="flex-1 w-full h-full flex items-stretch">
                  <CreditCard
                    company={stats.highestCard.cardName}
                    logo={stats.highestCard.logo}
                    cardNumber={`•••• •••• •••• ${stats.highestCard.cardLast4}`}
                    cardHolder={stats.highestCard.bankName}
                    cardExpiration="••/••"
                    perk={`+₹${stats.highestCard.reward.toLocaleString("en-IN")} EARNED`}
                    type="gray-dark"
                    fullWidth={true}
                    showIcons={true}
                    className="w-full h-full shadow-xl transition-transform duration-200 hover:scale-[1.01]"
                  />
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col justify-center gap-3.5 h-full">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-xs sm:text-sm font-semibold text-neutral-700 select-none">
                    <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>The merchant that gave back the most love</span>
                  </div>

                  <div className="rounded-2xl border border-neutral-200/90 bg-white/95 p-3.5 sm:p-4 flex items-center justify-between shadow-2xs hover:border-neutral-300 transition-all select-none">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 font-bold text-sm shadow-2xs">
                        {stats.biggestMerchant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug">
                          {stats.biggestMerchant.name}
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Your #1 reward multiplier
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-base sm:text-xl font-bold text-emerald-600 tracking-tight">
                      <span>+</span>
                      <NumberPopIn
                        value={stats.biggestMerchant.reward.toLocaleString("en-IN")}
                        className="text-emerald-600 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-xs sm:text-sm font-semibold text-neutral-700 select-none">
                    <ShoppingBag className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Your certified guilty pleasure (that paid off)</span>
                  </div>

                  <div className="rounded-2xl border border-neutral-200/90 bg-white/95 p-3.5 sm:p-4 flex items-center justify-between shadow-2xs hover:border-neutral-300 transition-all select-none">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-2xs">
                        <ShoppingBag className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug">
                          {stats.topCategory.name}
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Where your swipes worked the hardest
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-base sm:text-xl font-bold text-emerald-600 tracking-tight">
                      <span>+</span>
                      <NumberPopIn
                        value={stats.topCategory.reward.toLocaleString("en-IN")}
                        className="text-emerald-600 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {stats.hasPointsCard && (
              <div className="w-full rounded-2xl border border-neutral-200/90 bg-neutral-100/70 p-3 px-4 md:px-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 select-none shadow-2xs shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                      Magic conversion: Points ➔ Cold hard cashback
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-neutral-500">
                      Because imaginary points won't pay the bills — cashback will.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3 py-1 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs flex items-center gap-1.5">
                    <CreditCardIcon className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{stats.pointsCardName}</span>
                  </div>

                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs font-mono font-bold text-emerald-700 shadow-2xs">
                    <span>
                      {stats.pointsCollected.toLocaleString("en-IN")} Points ~ {stats.pointsConvertedInr.toLocaleString("en-IN")} Rs
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Skeleton>
      </div>
    </div>
  );
}

export default TrackRewards;
