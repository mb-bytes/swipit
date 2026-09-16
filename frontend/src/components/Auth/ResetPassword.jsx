import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, KeyRound, RefreshCw, Lock } from "lucide-react";
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

export function ResetPassword() {
  const leftHeroContent = (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 lg:p-10 z-10 text-[#111215]">
      <div className="w-full h-2" />

      <div className="pointer-events-auto my-auto flex flex-col items-center justify-center">
        <div className="h-4" />
      </div>

      <div className="max-w-md">
        <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.25em] mb-1">
          Credential Security
        </div>
        <p className="font-heading text-lg sm:text-xl font-medium leading-snug text-[#111215]">
          Establish a new master key for your SwipIt financial hub.
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300/80 bg-white/80 shadow-2xs">
            <Lock className="h-3 w-3 text-amber-500" /> High-Entropy Passwords
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300/80 bg-white/80 shadow-2xs">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> End-to-End Salting
          </span>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          Security tip: Avoid reusing passwords from other financial services.
        </div>
      </div>
    </div>
  );

  return (
    <AuthShell leftContent={leftHeroContent}>
      <ResetPasswordForm />
    </AuthShell>
  );
}

function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const typingImpulse = useAuthTypingImpulse();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePassword = (val) => {
    if (!val) return "New password is required";
    if (val.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Za-z]/.test(val) || !/\d/.test(val)) {
      return "Password must contain at least one letter and one number";
    }
    return "";
  };

  const validateConfirm = (val, pswd) => {
    if (!val) return "Please confirm your new password";
    if (val !== pswd) return "Passwords do not match";
    return "";
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleConfirmBlur = () => {
    setConfirmError(validateConfirm(confirmPassword, password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    pulseParticleSubmitImpulse(typingImpulse);

    const pErr = validatePassword(password);
    const cErr = validateConfirm(confirmPassword, password);

    setPasswordError(pErr);
    setConfirmError(cErr);

    if (pErr || cErr) return;

    if (!token) {
      sileo.error({
        title: "Missing Token",
        description: "Password reset link is missing a valid security token.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/user/password-reset-confirm/${encodeURIComponent(token)}`, {
        new_password: password,
        confirm_new_password: confirmPassword,
      });
      setIsSuccess(true);
      sileo.success({
        title: "Password updated",
        description: "Your password has been changed. You may now sign in.",
      });
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not reset password. The link may have expired.";
      sileo.error({
        title: "Reset failed",
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto my-auto flex flex-col justify-center">
        <div className="flex items-center justify-between mb-5">
          <Link to="/" className="transition-opacity hover:opacity-85">
            <BrandLogo size="sm" />
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-4 text-center items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#111215]">
              Invalid or Missing Link
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm">
              The password reset link is invalid, incomplete, or has expired. Please request a fresh link.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="w-full h-9 text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 cursor-pointer shadow-xs mt-2"
          >
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

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
          <span>Sign In</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {!isSuccess ? (
        <>
          <div className="mb-5">
            <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 uppercase tracking-[0.25em] mb-1">
              <span>Set New Password</span>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#111215]">
              Create new password
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              Choose a strong password to protect your SwipIt account.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="reset-new-password" className="text-xs font-medium text-neutral-700">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="reset-new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  onBlur={handlePasswordBlur}
                  autoComplete="new-password"
                  autoFocus
                  required
                  aria-invalid={!!passwordError}
                  className="h-9 pr-9 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="reset-confirm-password" className="text-xs font-medium text-neutral-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError("");
                  }}
                  onBlur={handleConfirmBlur}
                  autoComplete="new-password"
                  required
                  aria-invalid={!!confirmError}
                  className="h-9 pr-9 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmError && (
                <p className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{confirmError}</span>
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 text-[11px] text-neutral-500 space-y-1">
              <div className="font-semibold text-neutral-700">Password requirements:</div>
              <div className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-emerald-600 font-medium" : "text-neutral-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? "bg-emerald-500" : "bg-neutral-300"}`} />
                Minimum 8 characters in length
              </div>
              <div className={`flex items-center gap-1.5 ${(/[A-Za-z]/.test(password) && /\d/.test(password)) ? "text-emerald-600 font-medium" : "text-neutral-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${(/[A-Za-z]/.test(password) && /\d/.test(password)) ? "bg-emerald-500" : "bg-neutral-300"}`} />
                At least one letter and one number
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition active:scale-[0.99] cursor-pointer shadow-xs mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Resetting Password...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <span>Reset Password</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          </form>
        </>
      ) : (
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-4 text-center items-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#111215]">
              Password Reset Complete
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm">
              Your SwipIt account password has been updated securely. You can now log in with your new credentials.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full h-9 text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 cursor-pointer shadow-xs mt-2"
          >
            Sign in to SwipIt
          </Button>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
