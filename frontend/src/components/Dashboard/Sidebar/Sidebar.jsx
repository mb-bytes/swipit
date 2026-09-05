"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "./sidebar-component";
import {
  IconArrowLeft,
  IconCreditCard,
  IconReceipt,
  IconGift,
  IconSparkles,
  IconSettings,
  IconUser,
  IconSelector,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { sileo } from "sileo";

export function SidebarDemo({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    sileo
      .promise(logout(), {
        loading: {
          title: "Signing out...",
          description: "Clearing your session",
        },
        success: { title: "Signed out" },
        error: { title: "Sign out failed", description: "Please try again" },
      })
      .then(() => {
        navigate("/login");
      })
      .catch(() => {
        navigate("/login");
      });
  };

  const links = [
    {
      label: "Cards",
      href: "/dashboard",
      icon: <IconCreditCard className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Spends",
      href: "/spends",
      icon: <IconReceipt className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Track Rewards",
      href: "/card-rewards",
      icon: <IconGift className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Get Recommendations",
      href: "/recommendations",
      icon: <IconSparkles className="h-5 w-5 shrink-0" />,
    },
  ];

  return (
    <div
      className={cn(
        "flex w-full h-screen flex-1 flex-col overflow-hidden bg-[#eae5d9] md:flex-row paper-grain text-[#111215]",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="relative">
            <UserProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}

function UserProfileDropdown({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { open: sidebarOpen } = useSidebar();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!sidebarOpen) {
      setMenuOpen(false);
    }
  }, [sidebarOpen]);

  const displayName = user?.name || user?.username || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={menuRef} className="relative w-full">
      <AnimatePresence>
        {sidebarOpen && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full mb-2.5 left-0 w-56 rounded-2xl bg-[#1e1f23] border border-white/[0.08] shadow-2xl p-1.5 flex flex-col gap-0.5 text-neutral-300 z-50 select-none"
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/profile");
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group text-left"
            >
              <IconUser className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors shrink-0" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/settings");
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group text-left"
            >
              <IconSettings className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors shrink-0" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group text-left"
            >
              <IconArrowLeft className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors shrink-0" />
              <span>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className={cn(
          "flex items-center w-full gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer text-left group",
          menuOpen
            ? "bg-[#111215] text-[#f2eee5] shadow-xs"
            : "text-neutral-700 hover:bg-neutral-300/50 hover:text-neutral-900",
        )}
      >
        <div
          className={cn(
            "h-7 w-7 shrink-0 rounded-full font-mono text-xs font-bold flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105 overflow-hidden",
            menuOpen
              ? "bg-amber-400 text-neutral-950"
              : "bg-[#111215] text-[#f2eee5]",
          )}
        >
          {user?.picture || user?.avatar ? (
            <img
              src={user.picture || user.avatar}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            userInitials
          )}
        </div>

        <motion.span
          animate={{
            display: sidebarOpen ? "inline-block" : "none",
            opacity: sidebarOpen ? 1 : 0,
          }}
          className={cn(
            "text-sm tracking-tight whitespace-pre inline-block !p-0 !m-0 transition-colors truncate flex-1",
            menuOpen
              ? "text-[#f2eee5] font-semibold"
              : "text-neutral-800 font-medium",
          )}
        >
          {displayName}
        </motion.span>

        {sidebarOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "shrink-0 transition-colors",
              menuOpen
                ? "text-neutral-400"
                : "text-neutral-400 group-hover:text-neutral-600",
            )}
          >
            <IconSelector className="w-4 h-4" />
          </motion.span>
        )}
      </button>
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="py-1">
      <BrandLogo size="sm" />
    </div>
  );
};

export const LogoIcon = () => {
  return (
    <div className="py-1">
      <BrandLogo size="sm" iconOnly={true} />
    </div>
  );
};
