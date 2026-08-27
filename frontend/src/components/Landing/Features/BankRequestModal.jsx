import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bank,
  Check,
  Sparkle,
} from "@phosphor-icons/react";

export function BankRequestModal({ isOpen, onClose }) {
  const [bankName, setBankName] = useState("");
  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const topRequested = [
    { name: "HDFC Bank", cards: "Infinia / Regalia Gold" },
    { name: "ICICI Bank", cards: "Emeralde / Sapphiro" },
    { name: "SBI Card", cards: "Cashback / Aurum" },
    { name: "American Express", cards: "Platinum Travel / MRCC" },
    { name: "HSBC India", cards: "Premier / Live+" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bankName.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setBankName("");
      setCardName("");
      setEmail("");
      onClose();
    }, 2200);
  };

  const handleVote = (name) => {
    setBankName(name);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-lg bg-[#faf8f4] rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer"
            >
              <X weight="bold" className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 text-[#d9480f] flex items-center justify-center">
                <Bank weight="bold" className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold tracking-wider text-[#d9480f] uppercase">
                  BANK COVERAGE
                </span>
                <h3 className="text-xl font-bold text-neutral-950">
                  Request Bank Alert Parser
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 mb-6">
              Axis Bank and Federal Bank are fully live. Select or enter your bank to request the next Gmail alert parser.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <Check weight="bold" className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-neutral-900">
                  Bank Request Submitted
                </h4>
                <p className="text-xs text-neutral-600 mt-1">
                  We have added <span className="font-semibold text-neutral-900">{bankName || "your bank"}</span> to our development pipeline.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                    Quick Select Bank:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {topRequested.map((b) => (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => handleVote(b.name)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all duration-150 cursor-pointer ${
                          bankName === b.name
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-neutral-700">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, ICICI Bank, IndusInd..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#d9480f]/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-neutral-700">
                      Card Variant (Optional)
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Infinia Metal"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#d9480f]/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-neutral-700">
                      Email for Notification (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#d9480f]/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkle weight="bold" className="w-4 h-4 text-amber-400" />
                  <span>Submit Bank Request</span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default BankRequestModal;
