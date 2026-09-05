import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { sileo } from "sileo";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";
import { Loader } from "@/components/motion/loader";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const error = searchParams.get("error");
    const token = searchParams.get("token");

    if (error) {
      sileo.error({
        title: "Authentication Failed",
        description: error,
      });
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      loginWithToken(token).then((res) => {
        if (res && res.success) {
          sileo.success({
            title: "Welcome to SwipIt!",
            description: "Successfully signed in with Google",
          });
          navigate("/dashboard", { replace: true });
        } else {
          sileo.error({
            title: "Session Error",
            description: res?.error || "Could not initialize session.",
          });
          navigate("/login", { replace: true });
        }
      });
      return;
    }

    navigate("/login", { replace: true });
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#f2eee5] text-[#111215] paper-grain selection:bg-[#111215] selection:text-[#f2eee5]">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-[#111215] text-white shadow-2xl border border-white/10 max-w-sm w-full mx-4 text-center">
        <BrandLogo size="sm" />
        <div className="flex flex-col items-center gap-3">
          <Loader variant="dots" size={20} speed={1} className="text-white" />
          <p className="text-sm font-medium text-neutral-300">
            Completing authentication...
          </p>
          <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
            Securing connection
          </span>
        </div>
      </div>
    </div>
  );
}
