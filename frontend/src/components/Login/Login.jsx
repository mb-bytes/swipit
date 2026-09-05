import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ShieldCheck, Zap, BarChart3, AlertCircle } from "lucide-react";
import { sileo } from "sileo";
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

export function Login() {
  const leftHeroContent = (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 lg:p-10 z-10 text-[#111215]">
      <div className="w-full h-2" />

      <div className="pointer-events-auto my-auto flex flex-col items-center justify-center">
        <div className="h-4" />
      </div>

      <div className="max-w-md">
        <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.25em] mb-1">
          Card Intelligence
        </div>
        <p className="font-heading text-lg sm:text-xl font-medium leading-snug text-[#111215]">
          Your finances, intelligently tracked. Every swipe categorized with precision.
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono text-neutral-600">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300/80 bg-white/80 shadow-2xs">
            <BarChart3 className="h-3 w-3 text-amber-500" /> Instant Insights
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300/80 bg-white/80 shadow-2xs">
            <Zap className="h-3 w-3 text-sky-500" /> Real-time Sync
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-neutral-300/80 bg-white/80 shadow-2xs">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> Bank Security
          </span>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          By signing in, you agree to our{" "}
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
      <LoginForm />
    </AuthShell>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const typingImpulse = useAuthTypingImpulse();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      sileo.error({
        title: "Google Sign-In",
        description: errorParam,
      });
    }
  }, [location.search]);

  const handleGoogleAuth = () => {
    window.location.href = "http://localhost:8000/auth/google/login?action=login";
  };

  const validateUsername = (val) => {
    if (!val || !val.trim()) return "Username or email is required";
    return null;
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required";
    return null;
  };

  const usernameError = touched.username ? validateUsername(username) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ username: true, password: true });
    const uErr = validateUsername(username);
    const pErr = validatePassword(password);

    if (uErr || pErr) {
      sileo.error({
        title: "Validation Error",
        description: uErr || pErr,
      });
      return;
    }

    pulseParticleSubmitImpulse(typingImpulse);
    setIsSubmitting(true);

    try {
      const res = await login({ username: username.trim(), password });
      if (res && res.success) {
        sileo.success({ title: "Welcome back!" });
        const destination = location.state?.from?.pathname || "/dashboard";
        setTimeout(() => navigate(destination, { replace: true }), 1000);
      } else {
        sileo.error({
          title: "Login failed",
          description: res?.error || "Invalid username or password.",
        });
      }
    } catch {
      sileo.error({
        title: "Authorization error",
        description: "Unable to authorize. Please try again.",
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
          to="/signup"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-white/90 px-3.5 py-1 text-xs font-semibold text-neutral-700 shadow-2xs transition hover:bg-white hover:border-neutral-400 active:scale-95"
        >
          <span>Create Account</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 uppercase tracking-[0.25em] mb-1">
          <span>Secure Sign-In</span>
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-[#111215]">
          Welcome back
        </h1>
        <p className="mt-0.5 text-xs text-neutral-500">
          Sign in to continue to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="login-username" className="text-xs font-medium text-neutral-700">
            Username or Email
          </Label>
          <Input
            id="login-username"
            type="text"
            placeholder="Username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => handleBlur("username")}
            autoComplete="username"
            nativeInput
            required
            aria-invalid={!!usernameError}
            className="h-9 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
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
            <Label htmlFor="login-password" className="text-xs font-medium text-neutral-700">
              Password
            </Label>
            <button
              type="button"
              className="text-[11px] text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              autoComplete="current-password"
              nativeInput
              required
              className="h-9 pr-9 border-neutral-300/80 bg-white text-xs shadow-2xs focus-visible:border-neutral-900"
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
          className="w-full mt-2 h-9 text-xs sm:text-sm font-semibold bg-[#111215] hover:bg-neutral-800 text-[#f2eee5] shadow-xs active:scale-[0.99] cursor-pointer"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="h-3.5 w-3.5 text-white" />
              <span>Signing in...</span>
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="my-3.5 flex items-center gap-3 text-[10px] font-medium text-neutral-400">
        <span className="h-px flex-1 bg-neutral-300/80" />
        OR CONTINUE WITH
        <span className="h-px flex-1 bg-neutral-300/80" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleAuth}
        className="w-full h-9 gap-2 text-xs font-medium border-neutral-300/80 bg-white hover:bg-neutral-50 text-neutral-700 shadow-2xs active:scale-[0.99] cursor-pointer"
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
        <span>Sign in with Google</span>
      </Button>

      <p className="mt-5 text-center text-xs text-neutral-500">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#111215] hover:underline underline-offset-2"
        >
          Create your account
        </Link>
      </p>
    </div>
  );
}

export const LoginContainer = Login;
export default Login;
