import { useState } from "react";
import { motion } from "framer-motion";
import {
  PaperPlaneTilt,
  Check,
  GithubLogoIcon,
  LinkedinLogoIcon,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import {
  AlertCircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import api from "@/api/axios";
import { sileo } from "sileo";

const validateName = (val) => {
  if (!val || !val.trim()) return "Full name is required";
  if (val.trim().length < 2) return "Must be at least 2 characters";
  return null;
};

const validateEmail = (val) => {
  if (!val || !val.trim()) return "Email address is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
    return "Enter a valid email address";
  return null;
};

const validateMessage = (val) => {
  if (!val || !val.trim()) return "Message is required";
  if (val.trim().length < 10) return "Must be at least 10 characters";
  return null;
};

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const nameError = touched.name ? validateName(formData.name) : null;
  const emailError = touched.email ? validateEmail(formData.email) : null;
  const messageError = touched.message ? validateMessage(formData.message) : null;

  const isFormValid =
    !validateName(formData.name) &&
    !validateEmail(formData.email) &&
    !validateMessage(formData.message);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ name: true, email: true, message: true });

    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/user/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        content: formData.message.trim(),
      });
      sileo.success({ title: "Message sent successfully" });
      setFormData({ name: "", email: "", message: "" });
      setTouched({ name: false, email: false, message: false });
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      const rawDetail = err.response?.data?.detail;
      const errorMsg =
        typeof rawDetail === "string"
          ? rawDetail
          : Array.isArray(rawDetail) && rawDetail[0]?.msg
          ? rawDetail[0].msg
          : "An error occurred while sending your message. Please try again later.";

      sileo.error({
        title: "Error occurred",
        description: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 bg-[#f2ede3] border-t border-[#ded5c4]/90 paper-grain overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#ded5c4] gap-4">
          <div>
            <ScrollReveal y={15}>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.04em] text-[#0d0e11]">
                Developer Channel
              </h2>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.1} y={15}>
            <span className="font-mono text-xs font-semibold text-[#525763] tracking-[0.14em] uppercase">
              Contact the developer
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
                Have requests for specific bank Gmail alerts, algorithm rule
                suggestions, or custom reward integrations? Dispatch a message
                directly to the engineering team.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3} y={20}>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-neutral-800">
                  <div className="w-9 h-9 rounded-xl bg-[#fcfaf6] border border-[#ded5c4] flex items-center justify-center text-neutral-900 shadow-xs">
                    <EnvelopeSimple weight="bold" className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block font-bold">
                      Direct Email
                    </span>
                    <a
                      href="mailto:atique.sh2@gmail.com"
                      className="font-medium hover:text-[#d9480f] transition-colors"
                    >
                      atique.sh2@gmail.com
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ded5c4]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 block mb-3">
                    Connected Networks:
                  </span>
                  <div className="flex items-center gap-2.5">
                    <a
                      href="https://github.com/mb-bytes"
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-[#fcfaf6] border border-[#ded5c4] hover:border-neutral-500 flex items-center justify-center text-neutral-800 hover:text-black transition-all shadow-xs"
                      aria-label="GitHub"
                    >
                      <GithubLogoIcon weight="bold" className="w-4 h-4" />
                    </a>
                    <a
                      href="https://linkedin.com/in/atique-shaikh"
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-[#fcfaf6] border border-[#ded5c4] hover:border-neutral-500 flex items-center justify-center text-neutral-800 hover:text-black transition-all shadow-xs"
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
                      Your query has been queued for review. We will reach out
                      shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="contact-name"
                            className="text-xs font-medium text-neutral-700"
                          >
                            Your Name
                          </Label>
                          {touched.name && !nameError && formData.name && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                              <HugeIcon icon={Tick02Icon} size={12} /> Valid
                            </span>
                          )}
                        </div>
                        <Input
                          id="contact-name"
                          type="text"
                          placeholder="Tony Stark"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          onBlur={() => handleBlur("name")}
                          nativeInput
                          required
                          aria-invalid={!!nameError}
                          className="h-8.5 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
                        />
                        {nameError && (
                          <p className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
                            <HugeIcon icon={AlertCircleIcon} size={12} className="shrink-0" />
                            <span>{nameError}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="contact-email"
                            className="text-xs font-medium text-neutral-700"
                          >
                            Email Address
                          </Label>
                          {touched.email && !emailError && formData.email && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                              <HugeIcon icon={Tick02Icon} size={12} /> Valid
                            </span>
                          )}
                        </div>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="tonystark@example.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          onBlur={() => handleBlur("email")}
                          nativeInput
                          required
                          aria-invalid={!!emailError}
                          className="h-8.5 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
                        />
                        {emailError && (
                          <p className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
                            <HugeIcon icon={AlertCircleIcon} size={12} className="shrink-0" />
                            <span>{emailError}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="contact-message"
                          className="text-xs font-medium text-neutral-700"
                        >
                          Message Content
                        </Label>
                        {touched.message && !messageError && formData.message && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                            <HugeIcon icon={Tick02Icon} size={12} /> Valid
                          </span>
                        )}
                      </div>
                      <span className="relative inline-flex w-full rounded-lg border border-neutral-300/80 bg-white shadow-2xs transition-shadow has-focus-visible:border-neutral-900 has-focus-visible:ring-[3px] has-aria-invalid:border-destructive/36">
                        <textarea
                          id="contact-message"
                          required
                          rows={4}
                          value={formData.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          onBlur={() => handleBlur("message")}
                          aria-invalid={!!messageError}
                          placeholder="Provide details about your query or desired feature..."
                          className="w-full px-3 py-2 text-xs text-neutral-900 bg-transparent rounded-[inherit] outline-none resize-none placeholder:text-neutral-400"
                        />
                      </span>
                      {messageError && (
                        <p className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
                          <HugeIcon icon={AlertCircleIcon} size={12} className="shrink-0" />
                          <span>{messageError}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !isFormValid}
                      className="w-full py-3 px-6 rounded-xl bg-[#0d0e12] hover:bg-neutral-800 text-white font-semibold text-sm font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <PaperPlaneTilt
                            weight="bold"
                            className="w-4 h-4 text-amber-400"
                          />
                          <span>Send</span>
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
