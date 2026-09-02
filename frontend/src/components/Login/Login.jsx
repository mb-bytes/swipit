import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { sileo } from "sileo";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";
import { Loader } from "@/components/motion/loader";
import { InlineValidation } from "@/components/Signup/inline-validation";
import { useAuth } from "@/contexts/AuthContext";
import OrbNest from "@/components/Auth/OrbNest";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUsername = (val) => {
    if (!val || !val.trim()) return "Username or email is required";
    return null;
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usernameErr = validateUsername(username);
    const passwordErr = validatePassword(password);

    if (usernameErr || passwordErr) {
      sileo.error({ title: "Validation Error", description: usernameErr || passwordErr });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login({ username: username.trim(), password });
      if (res && res.success) {
        sileo.success({ title: "Welcome back!", description: "Unlocking your dashboard..." });
        const destination = location.state?.from?.pathname || "/dashboard";
        setTimeout(() => navigate(destination, { replace: true }), 1200);
      } else {
        sileo.error({ title: "Login failed", description: res?.error || "Invalid username or password." });
      }
    } catch {
      sileo.error({ title: "Authorization error", description: "Unable to authorize. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen max-h-screen w-full bg-[#f2eee5] text-[#111215] selection:bg-[#111215] selection:text-[#f2eee5] overflow-hidden paper-grain">
      <div className="relative flex h-full w-full flex-col justify-between px-6 py-8 sm:px-10 lg:w-1/2 overflow-y-auto z-10">
        <div className="w-full max-w-md mx-auto flex items-center justify-between">
          <Link to="/" className="inline-block transition-opacity hover:opacity-80">
            <BrandLogo size="sm" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-[#faf8f3]/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-white hover:border-neutral-400 active:scale-95"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-[28px] font-bold tracking-tight text-[#111215] leading-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Sign in to continue to your account
            </p>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-[#18191e] to-[#0e0f12]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <form onSubmit={handleSubmit} noValidate className="relative z-10 p-7 space-y-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold tracking-tight text-white/90">SwipIt</span>
                <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Secure Sign‑In</span>
              </div>

              <div className="space-y-1.5">
                <InlineValidation
                  label="Username"
                  type="text"
                  value={username}
                  onChange={setUsername}
                  validate={validateUsername}
                  placeholder="Username or email"
                  autoComplete="username"
                  variant="dark"
                  required
                />
                <InlineValidation
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  validate={validatePassword}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  variant="dark"
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-500 hover:text-neutral-200 transition p-0.5 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              <div className="flex justify-end -mt-2">
                <button type="button" className="text-[11px] text-neutral-500 hover:text-neutral-300 transition cursor-pointer">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#f2eee5] py-2.5 text-sm font-semibold text-[#111215] transition hover:bg-white active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span>Signing in</span>
                    <Loader variant="dots" size={14} speed={1} className="text-[#111215]" />
                  </span>
                ) : "Sign In"}
              </button>
            </form>
          </div>

          <div className="w-full mt-5 flex items-center gap-3 text-[11px] font-medium text-neutral-400">
            <span className="h-px flex-1 bg-neutral-300/70" />
            OR CONTINUE WITH
            <span className="h-px flex-1 bg-neutral-300/70" />
          </div>

          <button
            type="button"
            className="mt-3 w-full flex items-center justify-center gap-2.5 rounded-xl border border-neutral-300/80 bg-[#faf8f3]/90 hover:bg-white py-2.5 text-sm font-medium text-neutral-800 shadow-2xs transition hover:border-neutral-400 active:scale-[0.99] cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-xs text-neutral-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-[#111215] hover:underline underline-offset-2">
              Create your account
            </Link>
          </p>
        </div>

        <div className="w-full max-w-md mx-auto text-center text-[11px] text-neutral-400 hidden lg:block">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
        <div className="w-full max-w-md mx-auto text-center text-[11px] text-neutral-500 block lg:hidden pb-2">
          By signing in, you agree to our{" "}
          <span className="underline underline-offset-2">Terms of Service</span>{" "}
          and{" "}
          <span className="underline underline-offset-2">Privacy Policy</span>.
        </div>
      </div>

      <div className="relative hidden bg-[#111215] lg:flex lg:h-full lg:w-1/2 lg:flex-col lg:justify-between lg:px-12 lg:py-10 overflow-hidden border-l border-neutral-800/60 shadow-[-20px_0_60px_rgba(0,0,0,0.18)]">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/20 via-black/8 to-transparent z-10" />

        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-80 w-80 rounded-full bg-amber-500/8 blur-3xl" />

        <div className="relative z-10 flex items-center">
          <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-white/8 text-neutral-400 border border-white/10">
            MEMBER
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center py-8">
          <div className="mb-8 opacity-90">
            <OrbNest
              width={280}
              height={280}
              speed={30}
              density={240}
              dotSize={130}
              dotColor="#c8bfa8"
              accentColor="#f2eee5"
            />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white leading-tight max-w-xs">
            Your finances,<br />intelligently tracked.
          </h2>
          <p className="mt-3 text-sm text-neutral-400 max-w-xs leading-relaxed">
            SwipIt reads your bank statements and gives you clarity on where your money actually goes.
          </p>

          <div className="mt-8 flex flex-col gap-3 w-full max-w-xs text-left">
            {[
              { icon: BarChart3, label: "Instant spending insights", sub: "Categorized automatically" },
              { icon: Zap,       label: "Real-time sync",           sub: "Always up to date" },
              { icon: ShieldCheck, label: "Bank-grade security",    sub: "End-to-end encrypted" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/4 border border-white/6">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-neutral-300" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white/90 leading-none">{label}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center text-xs text-neutral-500">
          Trusted by members across 12+ banks.
        </div>
      </div>
    </div>
  );
}

export const LoginContainer = Login;
export default Login;
