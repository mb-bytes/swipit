import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { sileo } from "sileo";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";
import { PaypassIcon } from "@/components/Signup/icons";
import { Loader } from "@/components/motion/loader";
import { InlineValidation } from "@/components/Signup/inline-validation";
import { useAuth } from "@/contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // 3D Card Tilt Physics
  const cardRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateXSpring = useSpring(useTransform(mouseY, [0, 1], [7, -7]), { stiffness: 220, damping: 25 });
  const rotateYSpring = useSpring(useTransform(mouseX, [0, 1], [-7, 7]), { stiffness: 220, damping: 25 });
  const glareX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

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
      sileo.error({
        title: "Validation Error",
        description: usernameErr || passwordErr,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({ username: username.trim(), password });
      if (res && res.success) {
        sileo.success({
          title: "Welcome back!",
          description: "Unlocking your dashboard...",
        });
        setTimeout(() => {
          navigate("/");
        }, 1200);
      } else {
        sileo.error({
          title: "Login failed",
          description: res?.error || "Invalid username or password.",
        });
      }
    } catch (err) {
      sileo.error({
        title: "Authorization error",
        description: "Unable to authorize. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#f2eee5] text-[#111215] selection:bg-[#111215] selection:text-[#f2eee5] overflow-x-hidden flex flex-col justify-between paper-grain py-6 px-4 sm:px-6 md:px-8">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between z-20">
        <Link to="/" className="inline-block transition-opacity hover:opacity-85">
          <BrandLogo size="sm" />
        </Link>
        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-[#faf8f3]/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs transition hover:bg-white hover:border-neutral-400 active:scale-95"
        >
          <span>Create Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Login Card Section */}
      <main className="w-full max-w-lg mx-auto my-auto py-6 z-10 flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111215]">
            Swipe into your account
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-600">
            Authenticate your card credentials to continue
          </p>
        </div>

        {/* THE TACTILE CREDIT CARD LOGIN FORM */}
        <div
          className="w-full max-w-[440px] perspective-[1000px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            ref={cardRef}
            style={{
              rotateX: rotateXSpring,
              rotateY: rotateYSpring,
              transformStyle: "preserve-3d",
            }}
            className="relative w-full rounded-2xl bg-gradient-to-br from-[#1c1d22] via-[#141518] to-[#0d0e10] p-6 sm:p-7 text-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] border border-white/15 overflow-hidden transition-shadow duration-300"
          >
            {/* Dynamic Specular Sheen */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 320px at ${glareX} ${glareY}, rgba(255,255,255,0.4), transparent 70%)`,
              }}
            />

            {/* Ambient Corner Lighting */}
            <div className="pointer-events-none absolute -right-16 -top-16 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl" />

            <form onSubmit={handleSubmit} noValidate className="relative z-10 space-y-4">
              {/* Card Top: Brand + Pass Badge + Contactless */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-tight font-sans text-white">
                    Swip<span className="text-amber-400">It</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-bold border border-white/10">
                    PASS
                  </span>
                </div>

                <PaypassIcon
                  className={`w-4 h-4 transition-colors duration-300 ${isFocused ? "text-amber-400" : "text-white/40"
                    }`}
                />
              </div>

              {/* Card Micro-Details: Gold EMV Chip & Tier */}
              <div className="flex items-center justify-between pt-0.5">
                {/* Brushed Gold EMV Chip */}
                <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-amber-100 to-amber-400 border border-amber-500/50 shadow-inner relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div className="border-r border-b border-amber-600/40" />
                    <div className="border-b border-amber-600/40" />
                    <div className="border-r border-amber-600/40" />
                    <div />
                  </div>
                  <div className="w-3.5 h-3.5 rounded-full border border-amber-600/50 relative z-10" />
                </div>

                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold opacity-70">
                  BLACK EDITION
                </span>
              </div>

              {/* Inset Credential Inputs */}
              <div className="space-y-1 pt-1">
                <InlineValidation
                  label="Username"
                  type="text"
                  value={username}
                  onChange={setUsername}
                  validate={validateUsername}
                  placeholder="Username or email"
                  autoComplete="username"
                  variant="dark"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
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
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-white transition p-0.5 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
              </div>

              {/* Authenticate & Swipe Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 py-2.5 text-sm font-bold text-neutral-950 shadow-md shadow-amber-500/15 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2 text-neutral-950 font-bold">
                    <span>Authenticating</span>
                    <Loader variant="dots" size={14} speed={1} className="text-neutral-950" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In</span>
                  </span>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Secondary Options */}
        <div className="w-full max-w-[440px] mt-5 space-y-3">
          <div className="flex items-center gap-3 text-[11px] font-medium text-neutral-400">
            <span className="h-px flex-1 bg-neutral-300/80"></span>
            OR CONTINUE WITH
            <span className="h-px flex-1 bg-neutral-300/80"></span>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-300/80 bg-[#faf8f3]/90 hover:bg-white py-2 text-sm font-medium text-neutral-800 shadow-2xs transition hover:border-neutral-400 active:scale-[0.99] cursor-pointer"
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
            Sign in with Google
          </button>

          <div className="pt-2 text-center text-xs text-neutral-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#111215] hover:underline underline-offset-2"
            >
              Create your account
            </Link>
          </div>
        </div>
      </main>

      {/* Discreet Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center text-[11px] text-neutral-400 py-2 z-10">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </footer>
    </div>
  );
}

export const LoginContainer = Login;
export default Login;
