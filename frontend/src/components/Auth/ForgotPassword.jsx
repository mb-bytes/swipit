import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail01Icon,
  UserIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ShieldCheckIcon,
  KeyRoundIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";
import { sileo } from "sileo";
import api from "@/api/axios";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthShell,
  useAuthTypingImpulse,
} from "@/components/Login/AuthShell";
import {
  bumpParticleTypingImpulse,
  pulseParticleSubmitImpulse,
} from "@/components/Login/ParticleField";

function extractError(error, fallback = "Unable to process request.") {
  const detail = error?.response?.data?.detail || error?.response?.data?.message;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => (typeof d === "string" ? d : d.msg || JSON.stringify(d))).join(", ");
  }
  if (typeof detail === "object") {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  return String(detail);
}

export function ForgotPassword() {
  const leftHeroContent = (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 lg:p-10 z-10 text-[#111215]">
      <div className="w-full h-2" />

      <div className="pointer-events-auto my-auto flex flex-col items-center justify-center">
        <div className="h-4" />
      </div>

      <div className="max-w-md">
        <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.25em] mb-1">
          Account Recovery
        </div>
        <p className="font-heading text-lg sm:text-xl font-medium leading-snug text-[#111215]">
          Regain secure access to your portfolio, statements, and card intelligence.
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300/80 bg-white/80 shadow-2xs">
            <HugeIcon icon={KeyRoundIcon} size={12} className="text-amber-500" /> Instant Reset Link
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300/80 bg-white/80 shadow-2xs">
            <HugeIcon icon={ShieldCheckIcon} size={12} className="text-emerald-500" /> Encrypted Tokens
          </span>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          Need assistance? Contact our team at{" "}
          <span className="underline underline-offset-2 text-neutral-700 hover:text-black cursor-pointer transition-colors">
            support@swipit.com
          </span>
          .
        </div>
      </div>
    </div>
  );

  return (
    <AuthShell leftContent={leftHeroContent}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const typingImpulse = useAuthTypingImpulse();

  const [mode, setMode] = useState("email");
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultData, setResultData] = useState({
    identifier: "",
    maskedEmail: "",
    username: "",
  });

  const validateInput = (val, currentMode) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return currentMode === "email"
        ? "Please enter your email address"
        : "Please enter your username";
    }
    if (currentMode === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return "Please enter a valid email address";
      }
    } else {
      if (trimmed.length < 3) {
        return "Username must be at least 3 characters";
      }
    }
    return "";
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      setInputError(validateInput(inputValue, mode));
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setInputError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    pulseParticleSubmitImpulse(typingImpulse);

    const err = validateInput(inputValue, mode);
    if (err) {
      setInputError(err);
      return;
    }

    setIsSubmitting(true);
    setInputError("");

    try {
      const checkRes = await api.get(`/api/user/check-account?identifier=${encodeURIComponent(inputValue.trim())}`);
      if (!checkRes.data?.exists) {
        const errorMsg = mode === "email"
          ? "No SwipIt account found with this email address."
          : "No SwipIt account found with this username.";
        setInputError(errorMsg);
        sileo.error({
          title: "Account Not Found",
          description: errorMsg,
        });
        setIsSubmitting(false);
        return;
      }

      const res = await api.post("/api/user/password-reset-request", {
        identifier: inputValue.trim(),
        email: mode === "email" ? inputValue.trim() : undefined,
        username: mode === "username" ? inputValue.trim() : undefined,
      });

      const masked = res.data?.masked_email || checkRes.data?.masked_email || inputValue.trim();
      const uName = res.data?.username || checkRes.data?.username || "";

      setResultData({
        identifier: inputValue.trim(),
        maskedEmail: masked,
        username: uName,
      });
      setIsSubmitted(true);
      sileo.success({
        title: "Instructions Sent",
        description: `Password reset link dispatched to ${masked}.`,
      });
    } catch (error) {
      const msg = extractError(error, "Unable to send reset instructions. Please try again.");
      setInputError(msg);
      sileo.error({
        title: "Request Failed",
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto my-auto flex flex-col justify-center"
      onKeyDown={(e) => bumpParticleTypingImpulse(typingImpulse, e)}
    >
      <div className="flex items-center justify-between mb-5">
        <Link to="/" className="transition-opacity hover:opacity-85">
          <BrandLogo size="sm" />
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-white/90 px-3.5 py-1 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-white hover:border-neutral-400 active:scale-95"
        >
          <HugeIcon icon={ArrowLeft01Icon} size={12} />
          <span>Back to Sign In</span>
        </Link>
      </div>

      {!isSubmitted ? (
        <>
          <div className="mb-5">
            <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 uppercase tracking-[0.25em] mb-1">
              <span>Password Recovery</span>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#111215]">
              Forgot your password?
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              Locate your account using your registered email or member username.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-neutral-200/60 border border-neutral-300/70 mb-4">
            <button
              type="button"
              onClick={() => handleModeChange("email")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === "email"
                  ? "bg-white text-neutral-900 shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <HugeIcon icon={Mail01Icon} size={14} />
              <span>By Email</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("username")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === "username"
                  ? "bg-white text-neutral-900 shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <HugeIcon icon={UserIcon} size={14} />
              <span>By Username</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="recovery-input" className="text-xs font-medium text-neutral-700">
                {mode === "email" ? "Email Address" : "Member Username"}
              </Label>
              <div className="relative">
                <Input
                  id="recovery-input"
                  type={mode === "email" ? "email" : "text"}
                  placeholder={mode === "email" ? "name@example.com" : "e.g. john_doe"}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (inputError) setInputError("");
                  }}
                  onBlur={handleBlur}
                  autoComplete={mode === "email" ? "email" : "username"}
                  autoFocus
                  required
                  aria-invalid={!!inputError}
                  className="h-9 pl-8 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
                />
                {mode === "email" ? (
                  <HugeIcon icon={Mail01Icon} size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                ) : (
                  <HugeIcon icon={UserIcon} size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                )}
              </div>
              {inputError && (
                <div className="flex items-start gap-1.5 text-[11px] text-red-600 mt-1">
                  <HugeIcon icon={AlertCircleIcon} size={14} className="shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span>{inputError}</span>
                    {inputError.includes("No SwipIt account found") && (
                      <span className="text-neutral-500 mt-0.5">
                        Don’t have an account?{" "}
                        <Link to="/signup" className="font-semibold text-neutral-800 underline underline-offset-2 hover:text-black">
                          Sign up here
                        </Link>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition active:scale-[0.99] cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <HugeIcon icon={Loading03Icon} size={14} className="animate-spin" />
                  <span>Verifying & Sending Link...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <span>Send Reset Instructions</span>
                  <HugeIcon icon={ArrowRight01Icon} size={14} />
                </span>
              )}
            </Button>
          </form>
        </>
      ) : (
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-4 text-center items-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 ring-4 ring-emerald-500/10 flex items-center justify-center shadow-2xs">
            <HugeIcon icon={CheckmarkCircle02Icon} size={24} />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#111215]">
              Check your inbox
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm">
              We sent password reset instructions to{" "}
              <span className="font-semibold text-neutral-900 font-mono">
                {resultData.maskedEmail}
              </span>
              {resultData.username && (
                <span className="block mt-0.5 text-[11px] text-neutral-400">
                  (associated with account @{resultData.username})
                </span>
              )}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-start text-xs text-neutral-600 flex flex-col gap-1.5 w-full leading-relaxed">
            <p className="font-semibold text-neutral-900 text-[11px]">
              Next steps:
            </p>
            <ul className="list-disc list-inside text-neutral-500 text-[11px] flex flex-col gap-0.5">
              <li>Click the link in the email to establish a new password.</li>
              <li>The recovery link will expire shortly for security.</li>
              <li>Don't see it? Check your spam or promotions folder.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setInputValue("");
                setInputError("");
              }}
              className="w-full sm:w-1/2 h-9 text-xs font-semibold text-neutral-700 border-neutral-300 hover:bg-neutral-50 cursor-pointer"
            >
              Try Another Account
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full sm:w-1/2 h-9 text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 cursor-pointer"
            >
              Return to Sign In
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-neutral-500">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-medium text-neutral-900 underline underline-offset-2 hover:text-black transition"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
