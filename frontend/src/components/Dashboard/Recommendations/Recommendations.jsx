import React, { useState, useEffect } from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import api from "@/api/axios";
import { sileo } from "sileo";
import openaiLogo from "@/assets/openai.svg";
import { WelcomeScreen } from "./WelcomeScreen";
import { PreferredCategory } from "./PreferredCategory";
import { PreferredMerchant } from "./PreferredMerchant";
import { PreferredBank } from "./PreferredBank";
import { RecommendationScreen } from "./RecommendationScreen";

export function Recommendations() {
  const [step, setStep] = useState(0);
  const [initialChecking, setInitialChecking] = useState(true);
  const [preferredCategory, setPreferredCategory] = useState("");
  const [preferredMerchant, setPreferredMerchant] = useState("");
  const [preferredBank, setPreferredBank] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkExisting() {
      try {
        const res = await api.get("/api/recommendations/", {
          params: { only_cached: true },
        });
        if (isMounted && res.data && res.data.recommendations?.length > 0) {
          setRecommendationsData(res.data);
          setIsCached(Boolean(res.data.cached));
          if (res.data.preferences) {
            setPreferredCategory(res.data.preferences.preferred_category || "");
            setPreferredMerchant(res.data.preferences.preferred_merchant || "");
            setPreferredBank(res.data.preferences.preferred_bank || "");
          }
          setStep(5);
        }
      } catch {}
      finally {
        if (isMounted) {
          setInitialChecking(false);
        }
      }
    }
    checkExisting();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerate = async (skipPrefs = false) => {
    setLoading(true);
    setStep(4);
    try {
      const params = {};
      if (!skipPrefs) {
        if (preferredCategory) params.preferred_category = preferredCategory;
        if (preferredMerchant) params.preferred_merchant = preferredMerchant;
        if (preferredBank) params.preferred_bank = preferredBank;
      }

      const res = await api.get("/api/recommendations/", { params });
      setRecommendationsData(res.data);
      setIsCached(Boolean(res.data?.cached));
      setStep(5);
    } catch (err) {
      sileo.error({
        title: "Could not generate recommendations",
        description: "Please check your connection and try again.",
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const resetPreferences = async () => {
    setPreferredCategory("");
    setPreferredMerchant("");
    setPreferredBank("");
    setRecommendationsData(null);
    setIsCached(false);
    setStep(0);
    try {
      await api.post("/api/recommendations/invalidate-cache");
    } catch {}
  };

  return (
    <div className="flex flex-1 h-full min-h-0 min-w-0 overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-3 sm:gap-5 rounded-tl-none md:rounded-tl-2xl border-l-0 md:border-l border-t-0 md:border-t border-neutral-300/80 bg-[#f8f9fb] p-3 sm:p-5 md:p-6 paper-grain overflow-y-auto min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#121c18] border border-teal-800/40 text-teal-300 flex items-center justify-center shrink-0">
              <HugeIcon icon={SparklesIcon} size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111215] leading-tight">
                Get Recommendations
              </h1>
              <p className="text-xs text-neutral-500">
                Personalized card intelligence calibrated to maximize rewards on
                your everyday swipes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 shrink-0 select-none">
              <span>Based on OpenAI API</span>
              <img
                src={openaiLogo}
                alt="OpenAI"
                className="w-4 h-4 opacity-80"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col w-full min-h-0">
          {initialChecking ? (
            <div className="flex-1 w-full rounded-3xl border border-neutral-300/90 bg-[#f2eee5]/85 backdrop-blur-xs shadow-xs overflow-hidden flex flex-col justify-between min-h-0 animate-pulse">
              <div className="flex items-center justify-between border-b border-neutral-300/90 px-6 sm:px-8 py-3.5 bg-[#eae5d9]/90">
                <div className="h-3.5 w-24 bg-neutral-300/80 rounded-md" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-14 bg-white/70 gap-4">
                <div className="h-3 w-40 bg-neutral-200 rounded-md" />
                <div className="h-9 w-64 sm:w-80 bg-neutral-200 rounded-xl" />
                <div className="h-3.5 w-56 sm:w-72 bg-neutral-200 rounded-md" />
                <div className="h-11 w-36 bg-neutral-300/90 rounded-full mt-3" />
              </div>
            </div>
          ) : (
            <>
              {step === 0 && <WelcomeScreen onStart={() => setStep(1)} />}

              {step === 1 && (
                <PreferredCategory
                  preferredCategory={preferredCategory}
                  onSelectCategory={setPreferredCategory}
                  onBack={() => setStep(0)}
                  onSkip={() => {
                    setPreferredCategory("");
                    setStep(2);
                  }}
                  onConfirm={() => setStep(2)}
                />
              )}

              {step === 2 && (
                <PreferredMerchant
                  preferredMerchant={preferredMerchant}
                  onSelectMerchant={setPreferredMerchant}
                  onBack={() => setStep(1)}
                  onSkip={() => {
                    setPreferredMerchant("");
                    setStep(3);
                  }}
                  onConfirm={() => setStep(3)}
                />
              )}

              {step === 3 && (
                <PreferredBank
                  preferredBank={preferredBank}
                  onSelectBank={setPreferredBank}
                  onBack={() => setStep(2)}
                  onSkip={() => {
                    setPreferredBank("");
                    handleGenerate(true);
                  }}
                  onConfirm={() => handleGenerate(false)}
                />
              )}

              {(step === 4 || step === 5) && (
                <RecommendationScreen
                  loading={loading || step === 4}
                  recommendationsData={recommendationsData}
                  preferredBank={preferredBank}
                  isCached={isCached}
                  onReset={resetPreferences}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
