import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { sileo } from "sileo";
import { CreditCard } from "./credit-card";
import { Loader } from "../motion/loader";
import { InlineValidation } from "./inline-validation";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";
import { useAuth } from "../../contexts/AuthContext";

export function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();

  const validateName = (val) => {
    if (!val || !val.trim()) return "Full name is required";
    if (val.trim().length < 2) return "Must be at least 2 characters";
    return null;
  };

  const validateUsername = (val) => {
    if (!val || !val.trim()) return "Username is required";
    if (val.trim().length < 3) return "Must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(val.trim())) return "Letters, numbers & underscores only";
    return null;
  };

  const validateEmail = (val) => {
    if (!val || !val.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "Enter a valid email address";
    return null;
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required";
    if (val.length < 8) return "Must be at least 8 characters";
    if (!/[A-Za-z]/.test(val) || !/\d/.test(val)) return "Must include at least 1 letter and 1 number";
    return null;
  };

  const isFormValid =
    !validateName(name) &&
    !validateUsername(username) &&
    !validateEmail(email) &&
    !validatePassword(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateName(name);
    const usernameErr = validateUsername(username);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (nameErr || usernameErr || emailErr || passwordErr) {
      sileo.error({
        title: "Validation Error",
        description: nameErr || usernameErr || emailErr || passwordErr,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signup(name, username, email, password);
      if (res.success) {
        sileo.success({
          title: "Account created!",
          description: res.message || "Your account has been created successfully.",
        });
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      } else {
        sileo.error({
          title: "Account creation failed",
          description: res.error,
        });
      }
    } catch (err) {
      sileo.error({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen max-h-screen w-full bg-[#f2eee5] text-[#111215] selection:bg-[#111215] selection:text-[#f2eee5] overflow-hidden paper-grain">
      {/* Left Column: Paper Texture Form */}
      <div className="relative flex h-full w-full flex-col justify-between px-6 py-8 sm:px-10 lg:w-1/2 overflow-y-auto z-10">
        {/* Brand Header */}
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-block transition-opacity hover:opacity-85">
            <BrandLogo size="sm" />
          </Link>
        </div>

        {/* Center Form */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111215]">
              Create your account
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-600">
              Start optimizing your card rewards in seconds.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <InlineValidation
                label="Full Name"
                type="text"
                value={name}
                onChange={setName}
                validate={validateName}
                placeholder="Peter Parker"
                required
              />
            </div>

            <div>
              <InlineValidation
                label="Username"
                type="text"
                value={username}
                onChange={setUsername}
                validate={validateUsername}
                placeholder="peterparker"
                required
              />
            </div>

            <div>
              <InlineValidation
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                validate={validateEmail}
                placeholder="peter@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <InlineValidation
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                validate={validatePassword}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 hover:text-neutral-700 focus:outline-none cursor-pointer p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2.5 flex items-center justify-center gap-2 rounded-xl bg-[#111215] py-2.5 text-sm font-medium text-[#f2eee5] shadow-sm transition hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span>Creating account</span>
                  <Loader variant="dots" size={16} speed={1} className="text-white" />
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[11px] font-medium text-neutral-400">
            <span className="h-px flex-1 bg-neutral-300/80"></span>
            OR
            <span className="h-px flex-1 bg-neutral-300/80"></span>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-300/80 bg-[#faf8f3]/90 hover:bg-white py-2 text-sm font-medium text-neutral-700 shadow-2xs transition hover:border-neutral-400 active:scale-[0.99] cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="mt-5 text-center text-xs text-neutral-600">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-[#111215] hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Mobile-only terms note */}
        <div className="w-full max-w-md mx-auto text-center text-[11px] text-neutral-500 block lg:hidden pb-2">
          By signing up, you agree to our{" "}
          <span className="underline underline-offset-2">Terms of Service</span> and{" "}
          <span className="underline underline-offset-2">Privacy Policy</span>.
        </div>
      </div>

      {/* Right Column: Dark Showcase with Seamless Blend */}
      <div className="relative hidden bg-[#111215] lg:flex lg:h-full lg:w-1/2 lg:flex-col lg:justify-between lg:px-10 lg:py-8 overflow-hidden border-l border-neutral-800/80 shadow-[-20px_0_50px_rgba(0,0,0,0.15)]">
        {/* Seamless Blending Gradient from left paper edge into dark */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-linear-to-r from-black/25 via-black/10 to-transparent z-10" />

        {/* Ambient Radial Lighting Glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

        {/* Top Spacer for perfect centering */}
        <div className="w-full h-8" />

        {/* Credit Card with interactive preview */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="transition-transform duration-500 hover:scale-105">
            <CreditCard
              company="SwipIt"
              cardHolder={name || "YOUR NAME"}
              cardNumber="••••  ••••  ••••  2026"
              cardExpiration="∞ / ∞"
              cardTier="Member"
              perk="10X REWARDS"
              type="gray-light"
              width={380}
            />
          </div>
          <p className="mt-6 text-xs font-mono text-neutral-400/80 tracking-wide uppercase">
            Welcome to the club.
          </p>
        </div>

        {/* Terms of Service & Privacy Policy */}
        <div className="relative z-10 w-full max-w-sm mx-auto text-center text-xs text-neutral-500">
          By signing up, you agree to our{" "}
          <span className="text-neutral-400 hover:text-neutral-200 underline underline-offset-2 cursor-pointer transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-neutral-400 hover:text-neutral-200 underline underline-offset-2 cursor-pointer transition-colors">
            Privacy Policy
          </span>
          .
        </div>
      </div>
    </div>
  );
}

export const SignupContainer = Signup;
export default Signup;
