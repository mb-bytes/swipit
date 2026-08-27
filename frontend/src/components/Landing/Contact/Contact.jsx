import { useState } from "react";
import { motion } from "framer-motion";
import {
  PaperPlaneTilt,
  Check,
  GithubLogoIcon,
  XLogoIcon,
  LinkedinLogoIcon,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "bank_request",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        topic: "bank_request",
        message: "",
      });
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1200);
  };

  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 bg-[#f2eee5] border-t border-neutral-300/80 paper-grain overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-neutral-300 gap-4">
          <div>
            <ScrollReveal y={15}>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#0d0e11]">
                Developer Channel
              </h2>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.1} y={15}>
            <span className="font-mono text-xs font-semibold text-[#525763] tracking-[0.14em] uppercase">
              MODULE 03 // DISPATCH & FEEDBACK
            </span>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <ScrollReveal delay={0.1} y={20}>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
                Direct Communication.
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.2} y={20}>
              <p className="mt-4 text-base text-neutral-700 leading-relaxed max-w-md">
                Have requests for specific bank Gmail alerts, algorithm rule suggestions, or custom reward integrations? Dispatch a message directly to the engineering team.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3} y={20}>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-neutral-800">
                  <div className="w-9 h-9 rounded-xl bg-white border border-neutral-300 flex items-center justify-center text-neutral-900 shadow-xs">
                    <EnvelopeSimple weight="bold" className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block font-bold">
                      Direct Email
                    </span>
                    <a
                      href="mailto:developer@swipit.app"
                      className="font-medium hover:text-[#d9480f] transition-colors"
                    >
                      developer@swipit.app
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-300">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-3">
                    Connected Networks:
                  </span>
                  <div className="flex items-center gap-2.5">
                    <a
                      href="https://x.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:border-neutral-500 flex items-center justify-center text-neutral-800 hover:text-black transition-all shadow-xs"
                      aria-label="X Twitter"
                    >
                      <XLogoIcon weight="bold" className="w-4 h-4" />
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:border-neutral-500 flex items-center justify-center text-neutral-800 hover:text-black transition-all shadow-xs"
                      aria-label="GitHub"
                    >
                      <GithubLogoIcon weight="bold" className="w-4 h-4" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:border-neutral-500 flex items-center justify-center text-neutral-800 hover:text-black transition-all shadow-xs"
                      aria-label="LinkedIn"
                    >
                      <LinkedinLogoIcon weight="bold" className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-7">
            <ScrollReveal delay={0.2} y={20}>
              <div className="paper-card rounded-2xl p-6 sm:p-9 relative">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center flex flex-col items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <Check weight="bold" className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900">
                      Message Transmitted
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1 max-w-sm">
                      Your query has been queued for review. We will reach out shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Siddharth Rao"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#d9480f]/40 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="siddharth@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#d9480f]/40 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                        Topic
                      </label>
                      <select
                        value={formData.topic}
                        onChange={(e) =>
                          setFormData({ ...formData, topic: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#d9480f]/40 transition-all"
                      >
                        <option value="bank_request">Request Bank Alert Parser</option>
                        <option value="feature">Suggest an AI Feature</option>
                        <option value="bug">Report Parsing Issue</option>
                        <option value="collab">Partnership Inquiry</option>
                        <option value="other">General Feedback</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                        Message Content
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Provide details about your query or desired feature..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#d9480f]/40 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-6 rounded-xl bg-[#0d0e12] hover:bg-neutral-800 text-white font-semibold text-sm font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <PaperPlaneTilt weight="bold" className="w-4 h-4 text-amber-400" />
                          <span>Dispatch Query</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
