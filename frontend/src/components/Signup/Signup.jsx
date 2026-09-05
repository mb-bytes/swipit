import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Check, AlertCircle } from "lucide-react";
import { sileo } from "sileo";
import { CreditCard } from "./credit-card";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  AuthShell,
  useAuthTypingImpulse,
} from "./AuthShell";
import {
  bumpParticleTypingImpulse,
  pulseParticleSubmitImpulse,
} from "./ParticleField";

export function Signup() {
  const [liveCardName, setLiveCardName] = useState("");

  const leftHeroContent = (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 lg:p-10 z-10 text-[#111215]">
      <div className="w-full h-2" />

      <div className="pointer-events-auto my-auto flex flex-col items-center justify-center">
        <div className="transition-transform duration-500 hover:scale-[1.03]">
          <CreditCard
            company="SwipIt"
            cardHolder={liveCardName || "YOUR NAME"}
            cardNumber="••••  ••••  ••••  2026"
            cardExpiration="∞ / ∞"
            cardTier="Member"
            perk="10X REWARDS"
            type="gray-dark"
            width={350}
          />
        </div>
        <div className="mt-4 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-neutral-200/80 shadow-2xs">
          <p className="text-[10px] font-mono text-neutral-600 tracking-widest uppercase">
            Welcome to the club.
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <p className="font-heading text-base sm:text-lg font-medium leading-snug text-[#111215]">
          Every swipe, maximized. Real-time rewards intelligence and instant clarity across your finances.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300/80 bg-white/80 shadow-2xs">
            <Zap className="h-3 w-3 text-sky-500" /> Instant Sync
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300/80 bg-white/80 shadow-2xs">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> Bank Security
          </span>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          By signing up, you agree to our{" "}
          <span className="underline underline-offset-2 text-neutral-700 hover:text-black cursor-pointer transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline underline-offset-2 text-neutral-700 hover:text-black cursor-pointer transition-colors">
            Privacy Policy
          </span>
          .
        </div>
      </div>
    </div>
  );

  return (
    <AuthShell leftContent={leftHeroContent}>
      <SignupForm onNameChange={setLiveCardName} />
    </AuthShell>
  );
}

function SignupForm({ onNameChange }) {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const typingImpulse = useAuthTypingImpulse();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    username: false,
    email: false,
    password: false,
  });

  const handleNameChange = (val) => {
    setName(val);
    onNameChange(val);
  };

  const validateName = (val) => {
    if (!val || !val.trim()) return "Full name is required";
    if (val.trim().length < 2) return "Must be at least 2 characters";
    return null;
  };

  const validateUsername = (val) => {
    if (!val || !val.trim()) return "Username is required";
    if (val.trim().length < 3) return "Must be at least 3 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(val.trim()))
      return "Letters, numbers & underscores only";
    return null;
  };

  const validateEmail = (val) => {
    if (!val || !val.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()))
      return "Enter a valid email address";
    return null;
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required";
    if (val.length < 8) return "Must be at least 8 characters";
    if (!/[A-Za-z]/.test(val) || !/\d/.test(val))
      return "Must include at least 1 letter and 1 number";
    return null;
  };

  const nameError = touched.name ? validateName(name) : null;
  const usernameError = touched.username ? validateUsername(username) : null;
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleGoogleAuth = () => {
    window.location.href = "http://localhost:8000/auth/google/login?action=login";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      name: true,
      username: true,
      email: true,
      password: true,
    });

    const nErr = validateName(name);
    const uErr = validateUsername(username);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    if (nErr || uErr || eErr || pErr) {
      sileo.error({
        title: "Validation Error",
        description: nErr || uErr || eErr || pErr,
      });
      return;
    }

    pulseParticleSubmitImpulse(typingImpulse);
    setIsSubmitting(true);

    try {
      const res = await signup(name.trim(), username.trim(), email.trim(), password);
      if (res && res.success) {
        sileo.success({
          title: "Account created!",
          description: res.message || "Your account has been created successfully.",
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        sileo.error({
          title: "Signup failed",
          description: res?.error || "Account creation failed.",
        });
      }
    } catch {
      sileo.error({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
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
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="transition-opacity hover:opacity-85">
          <BrandLogo size="sm" />
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-white/90 px-3.5 py-1 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-white hover:border-neutral-400 active:scale-95"
        >
          <span>Log In</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 uppercase tracking-[0.25em] mb-1">
          <span>Membership Enrollment</span>
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#111215]">
          Create your account
        </h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Start optimizing your card rewards in seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="signup-name" className="text-xs font-medium text-neutral-700">
              Full Name
            </Label>
            {touched.name && !nameError && name && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                <Check className="h-3 w-3" /> Valid
              </span>
            )}
          </div>
          <Input
            id="signup-name"
            type="text"
            placeholder="Peter Parker"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={() => handleBlur("name")}
            autoComplete="name"
            nativeInput
            required
            aria-invalid={!!nameError}
            className="h-8.5 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
          />
          {nameError && (
            <p className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{nameError}</span>
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="signup-username" className="text-xs font-medium text-neutral-700">
              Username
            </Label>
            {touched.username && !usernameError && username && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                <Check className="h-3 w-3" /> Valid
              </span>
            )}
          </div>
          <Input
            id="signup-username"
            type="text"
            placeholder="peterparker"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => handleBlur("username")}
            autoComplete="username"
            nativeInput
            required
            aria-invalid={!!usernameError}
            className="h-8.5 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
          />
          {usernameError && (
            <p className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{usernameError}</span>
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="signup-email" className="text-xs font-medium text-neutral-700">
              Email Address
            </Label>
            {touched.email && !emailError && email && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                <Check className="h-3 w-3" /> Valid
              </span>
            )}
          </div>
          <Input
            id="signup-email"
            type="email"
            placeholder="peter@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur("email")}
            autoComplete="email"
            nativeInput
            required
            aria-invalid={!!emailError}
            className="h-8.5 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
          />
          {emailError && (
            <p className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="signup-password" className="text-xs font-medium text-neutral-700">
              Password
            </Label>
            {touched.password && !passwordError && password && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-mono">
                <Check className="h-3 w-3" /> Strong
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              autoComplete="new-password"
              nativeInput
              required
              className="h-8.5 pr-9 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
              aria-invalid={!!passwordError}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition p-0.5 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="flex items-center gap-1 text-[11px] text-red-600 mt-0.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{passwordError}</span>
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-1.5 h-9 text-xs sm:text-sm font-semibold bg-[#111215] hover:bg-neutral-800 text-[#f2eee5] shadow-xs active:scale-[0.99] cursor-pointer"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="h-3.5 w-3.5 text-white" />
              <span>Creating account...</span>
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="my-2.5 flex items-center gap-3 text-[10px] font-medium text-neutral-400">
        <span className="h-px flex-1 bg-neutral-300/80" />
        OR CONTINUE WITH
        <span className="h-px flex-1 bg-neutral-300/80" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleAuth}
        className="w-full h-8.5 gap-2 text-xs font-medium border-neutral-300/80 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs active:scale-[0.99] cursor-pointer"
      >
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
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
        <span>Continue with Google</span>
      </Button>
    </div>
  );
}

export const SignupContainer = Signup;
export default Signup;
