"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Sidebar,
  DesktopSidebar,
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
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import { List, X } from "@phosphor-icons/react";
import { IconSwap } from "@/components/Landing/Navbar/IconSwap";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/Landing/Navbar/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { sileo } from "sileo";

export function SidebarDemo({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (mobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    sileo
      .promise(logout(), {
        loading: {
          title: "Signing out...",
        },
        success: { title: "Logged out successfully" },
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

  const displayName = user?.name || user?.username || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex w-full h-screen flex-1 flex-col overflow-hidden bg-[#eae5d9] md:flex-row paper-grain text-[#111215]",
      )}
    >
      {/* Mobile Top Header & Animated Drawer */}
      <div className="flex md:hidden flex-col w-full shrink-0 z-40">
        <header className="h-14 px-4 flex items-center justify-between bg-[#eae5d9]/95 backdrop-blur-md border-b border-neutral-300/80 w-full">
          <div
            className="cursor-pointer flex items-center select-none"
            onClick={() => {
              setMobileOpen(false);
              navigate("/dashboard");
            }}
          >
            <BrandLogo size="sm" />
          </div>

          <div className="flex items-center gap-2">
            <IconSwap
              isOpen={mobileOpen}
              onToggle={() => setMobileOpen((prev) => !prev)}
              iconA={<List weight="bold" className="w-5 h-5 text-neutral-900" />}
              iconB={<X weight="bold" className="w-5 h-5 text-neutral-900" />}
              className="p-2 rounded-xl bg-white/70 hover:bg-white border border-neutral-300/80 text-neutral-900 cursor-pointer shadow-2xs transition-colors"
            />
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 top-14 bg-black/40 backdrop-blur-xs z-50 md:hidden"
                onClick={() => setMobileOpen(false)}
              />

              {/* Mobile Drawer Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-3 right-3 top-16 z-50 max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden rounded-2xl bg-[#f5f0e6] p-4 shadow-2xl border border-[#ded5c4]/90 backdrop-blur-xl flex flex-col gap-3.5 md:hidden text-[#111215] box-border"
              >
                {/* Navigation Links */}
                <div className="flex flex-col gap-1.5 w-full min-w-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-2">
                    Navigation
                  </span>
                  {links.map((link, idx) => {
                    const isActive = location.pathname === link.href;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          if (link.href) navigate(link.href);
                        }}
                        className={cn(
                          "flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left min-h-[44px] min-w-0",
                          isActive
                            ? "bg-[#111215] text-[#f2eee5] shadow-xs"
                            : "text-neutral-800 hover:bg-neutral-200/70",
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0",
                            isActive ? "text-[#f2eee5]" : "text-neutral-600",
                          )}
                        >
                          {link.icon}
                        </span>
                        <span className="flex-1 truncate min-w-0">{link.label}</span>
                        {link.badge && (
                          <span
                            className={cn(
                              "text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold shrink-0",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-[#d9480f]/10 text-[#d9480f] border border-[#d9480f]/20",
                            )}
                          >
                            {link.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[#ded5c4]" />

                {/* User Account Section */}
                <div className="flex flex-col gap-2.5 w-full min-w-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 px-2">
                    Account
                  </span>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-neutral-300/70 w-full min-w-0 overflow-hidden">
                    <div className="h-9 w-9 shrink-0 rounded-full font-mono text-xs font-bold flex items-center justify-center bg-[#111215] text-[#f2eee5] shadow-2xs overflow-hidden">
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
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="text-sm font-bold text-neutral-900 truncate">
                        {displayName}
                      </div>
                      <div className="text-xs text-neutral-500 truncate font-mono">
                        {user?.email || (user?.username ? `@${user.username}` : "Member")}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 w-full min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/profile");
                      }}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-neutral-800 border border-neutral-300/80 transition-colors shadow-2xs min-h-[44px] cursor-pointer min-w-0"
                    >
                      <IconUser className="w-4 h-4 text-neutral-600 shrink-0" />
                      <span className="truncate">Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/settings");
                      }}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-neutral-800 border border-neutral-300/80 transition-colors shadow-2xs min-h-[44px] cursor-pointer min-w-0"
                    >
                      <IconSettings className="w-4 h-4 text-neutral-600 shrink-0" />
                      <span className="truncate">Settings</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer min-h-[44px] mt-1 min-w-0"
                  >
                    <IconArrowLeft className="w-4 h-4 shrink-0" />
                    <span>Log out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Collapsible Sidebar */}
      <Sidebar open={open} setOpen={setOpen}>
        <DesktopSidebar className="justify-between gap-10">
          <div className="flex flex-1 flex-col">
            {/* Top Brand Logo & Toggle Button */}
            <div
              className={cn(
                "flex items-center min-h-[40px] px-0.5",
                open ? "justify-between" : "justify-center w-full",
              )}
            >
              {open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: 0.08 }}
                  className="cursor-pointer overflow-hidden flex items-center"
                  onClick={() => navigate("/dashboard")}
                >
                  <BrandLogo size="sm" />
                </motion.div>
              )}

              <div className="relative group/toggle shrink-0">
                <button
                  type="button"
                  onClick={() => setOpen((prev) => !prev)}
                  className="p-2 rounded-xl text-neutral-600 hover:text-neutral-950 hover:bg-neutral-300/60 transition-colors cursor-pointer flex items-center justify-center"
                  title={open ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {open ? (
                    <IconLayoutSidebarLeftCollapse className="w-5 h-5" />
                  ) : (
                    <IconLayoutSidebarLeftExpand className="w-5 h-5" />
                  )}
                </button>
                {!open && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-150 hidden md:flex items-center z-50 whitespace-nowrap">
                    <div className="rounded-lg bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl border border-neutral-800">
                      Expand sidebar
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={{
                    ...link,
                    onClick: () => {
                      if (link.href) navigate(link.href);
                    },
                  }}
                  active={location.pathname === link.href}
                />
              ))}
            </div>
          </div>
          <div className="relative">
            <UserProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        </DesktopSidebar>
      </Sidebar>

      <main className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}


function UserProfileDropdown({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
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

  const currentUser = user || authUser;
  const displayName =
    currentUser?.name ||
    currentUser?.username ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "Card Member");

  const userInitials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div ref={menuRef} className="relative w-full group">
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute rounded-2xl bg-[#1e1f23] border border-white/[0.08] shadow-2xl p-1.5 flex flex-col gap-0.5 text-neutral-300 z-50 select-none",
              sidebarOpen
                ? "bottom-full mb-2.5 left-0 w-56"
                : "left-full bottom-0 ml-3.5 w-52",
            )}
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/profile");
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group/item text-left"
            >
              <IconUser className="w-4 h-4 text-neutral-400 group-hover/item:text-white transition-colors shrink-0" />
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/settings");
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group/item text-left"
            >
              <IconSettings className="w-4 h-4 text-neutral-400 group-hover/item:text-white transition-colors shrink-0" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer group/item text-left"
            >
              <IconArrowLeft className="w-4 h-4 text-neutral-400 group-hover/item:text-white transition-colors shrink-0" />
              <span>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className={cn(
          "flex items-center w-full rounded-xl transition-all duration-150 cursor-pointer text-left",
          sidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center py-2.5 px-0",
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
          {currentUser?.picture || currentUser?.avatar ? (
            <img
              src={currentUser.picture || currentUser.avatar}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            userInitials
          )}
        </div>

        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.08 }}
            className="flex flex-col min-w-0 flex-1 overflow-hidden"
          >
            <span
              className={cn(
                "text-sm font-semibold tracking-tight whitespace-nowrap truncate transition-colors",
                menuOpen ? "text-[#f2eee5]" : "text-neutral-900",
              )}
            >
              {displayName}
            </span>
            <span
              className={cn(
                "text-[11px] font-mono whitespace-nowrap truncate transition-colors",
                menuOpen ? "text-neutral-400" : "text-neutral-500",
              )}
            >
              {currentUser?.email || (currentUser?.username ? `@${currentUser.username}` : "Member")}
            </span>
          </motion.div>
        )}

        {sidebarOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.08 }}
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

      {!sidebarOpen && !menuOpen && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden md:flex items-center z-50 whitespace-nowrap">
          <div className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl border border-neutral-800 flex flex-col gap-0.5">
            <span className="font-semibold text-white">{displayName}</span>
            {currentUser?.email && (
              <span className="text-[10px] text-neutral-400 font-mono">{currentUser.email}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const Logo = ({ onClick }) => {
  return (
    <div className="py-1 cursor-pointer" onClick={onClick}>
      <BrandLogo size="sm" />
    </div>
  );
};

export const LogoIcon = ({ onClick }) => {
  return (
    <div className="py-1 cursor-pointer" onClick={onClick}>
      <BrandLogo size="sm" iconOnly={true} />
    </div>
  );
};
