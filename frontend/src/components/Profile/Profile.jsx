"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { sileo } from "sileo";
import { motion } from "motion/react";
import {
  UserIcon,
  Mail01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Tick02Icon,
  Logout01Icon,
  ArrowUpRight01Icon,
  LockIcon,
  Calendar03Icon,
  Layers01Icon,
  ExternalLinkIcon,
} from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";

export function Profile() {
  const { user, logout } = useAuth();
  const {
    cards,
    transactions,
    googleStatus,
    fetchGoogleStatus,
    fetchAll,
    initialized,
  } = useDashboard();

  const [copiedField, setCopiedField] = useState(null);

  const displayName = user?.name || user?.username || "Card Member";
  const username = user?.username ? `@${user.username}` : "@member";
  const email = user?.email || "No email linked";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "March 2026";

  const totalSpend = transactions.reduce(
    (acc, txn) => acc + (Number(txn.amount) || 0),
    0,
  );

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!initialized) fetchAll(displayName);
    if (!googleStatus.connected) fetchGoogleStatus();
  }, []);

  const handleCopy = (value, fieldName) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedField(fieldName);
    sileo.success({
      title: `${fieldName} copied`,
      description: value,
    });
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleConnectOrSwitchGoogle = () => {
    window.location.href =
      "http://localhost:8000/auth/google/login?action=connect";
  };

  const handleLogout = async () => {
    try {
      await logout();
      sileo.success({ title: "Logged out successfully" });
    } catch {
      sileo.error({ title: "Failed to log out" });
    }
  };

  return (
    <div className="flex flex-1 h-full min-h-0 min-w-0 overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-4 sm:gap-5 md:gap-6 rounded-tl-none md:rounded-tl-2xl border-l-0 md:border-l border-t-0 md:border-t border-neutral-300/80 bg-[#f8f9fb] p-3.5 sm:p-5 md:p-6 lg:p-7 paper-grain overflow-y-auto min-h-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-2 border-b border-neutral-200/80 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111215]">
              Account & Profile
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-xl">
              Manage your personal credentials, portfolio telemetry, and
              financial data integrations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Row 1 - Left: Membership Card */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative overflow-hidden rounded-2xl bg-[#111215] text-[#f2eee5] border border-neutral-800 shadow-xl p-4 sm:p-6 flex flex-col justify-between h-full group"
            >
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(194,87,26,0.18),transparent_55%)]" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold tracking-tight text-white shadow-inner font-mono text-base shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white leading-tight truncate">
                      {displayName}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-[11px] font-mono text-neutral-300 shrink-0">
                  <HugeIcon
                    icon={LockIcon}
                    size={12}
                    className="text-amber-400"
                  />
                  <span>SECURE</span>
                </div>
              </div>

              <div className="relative z-10 py-3 my-auto flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-6 rounded bg-gradient-to-r from-amber-400 to-amber-200/90 shadow-sm border border-amber-300/30 flex items-center justify-center shrink-0">
                    <div className="w-5 h-3.5 border border-amber-900/30 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                      <div className="bg-amber-950/20 rounded-2xs" />
                      <div className="bg-amber-950/20 rounded-2xs" />
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-neutral-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400/80" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400/80" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400/80" />
                  </div>
                </div>

                <div className="font-mono text-sm tracking-wider text-neutral-300 pt-0.5 truncate">
                  {username}
                </div>
                <div className="text-xs text-neutral-400 font-normal truncate">
                  {email}
                </div>
              </div>

              <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <HugeIcon
                    icon={Calendar03Icon}
                    size={14}
                    className="text-neutral-500"
                  />
                  <span>Joined {memberSince}</span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[11px] text-amber-400/90">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>ACTIVE</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between h-full gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#121c18] border border-teal-800/40 text-teal-300 flex items-center justify-center shrink-0">
                    <HugeIcon icon={Mail01Icon} size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111215] leading-snug">
                      Gmail Statement Ingestion
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Automated scraping of transactions and card statements
                    </p>
                  </div>
                </div>

                {googleStatus.connected ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 w-fit shrink-0">
                    <HugeIcon
                      icon={CheckmarkCircle02Icon}
                      size={14}
                      className="text-emerald-600"
                    />
                    <span>Connected</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 w-fit shrink-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Not Linked</span>
                  </div>
                )}
              </div>

              {googleStatus.connected ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-medium text-neutral-400">
                      Linked Account
                    </span>
                    <span
                      className="font-mono text-neutral-900 font-semibold truncate text-xs pt-0.5"
                      title={googleStatus.email}
                    >
                      {googleStatus.email}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-medium text-neutral-400">
                      Sync Scope
                    </span>
                    <span className="text-neutral-800 font-medium truncate text-xs pt-0.5">
                      Receipts & Invoices
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-medium text-neutral-400">
                      Auto-Parsing
                    </span>
                    <span className="text-emerald-700 font-semibold text-xs pt-0.5">
                      Enabled
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs text-neutral-600">
                  <p className="leading-relaxed">
                    Link your Google account to automatically ingest credit card
                    transactions and statements.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-neutral-100">
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
                >
                  <span>Google Permissions</span>
                  <HugeIcon
                    icon={ExternalLinkIcon}
                    size={14}
                    className="text-neutral-400"
                  />
                </a>

                <button
                  type="button"
                  onClick={handleConnectOrSwitchGoogle}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs w-full sm:w-auto text-center"
                >
                  <span>
                    {googleStatus.connected
                      ? "Switch Connected Google Account"
                      : "Connect Google Account"}
                  </span>
                  <HugeIcon
                    icon={ArrowUpRight01Icon}
                    size={14}
                    className="text-amber-400 shrink-0"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2 - Left: Account Credentials */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between h-full gap-3">
              <h3 className="text-sm font-semibold text-[#111215]">
                Account Credentials
              </h3>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <HugeIcon
                      icon={Mail01Icon}
                      size={16}
                      className="text-neutral-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-neutral-400">
                        Primary Email
                      </div>
                      <div
                        className="text-xs font-semibold text-neutral-800 truncate font-mono"
                        title={email}
                      >
                        {email}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(email, "Email")}
                    className="p-1.5 rounded-lg hover:bg-neutral-200/70 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer shrink-0"
                    title="Copy Email"
                  >
                    {copiedField === "Email" ? (
                      <HugeIcon
                        icon={Tick02Icon}
                        size={14}
                        className="text-emerald-600"
                      />
                    ) : (
                      <HugeIcon icon={Copy01Icon} size={14} />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 gap-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <HugeIcon
                      icon={UserIcon}
                      size={16}
                      className="text-neutral-400 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-neutral-400">
                        Member Handle
                      </div>
                      <div
                        className="text-xs font-semibold text-neutral-800 truncate font-mono"
                        title={username}
                      >
                        {username}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(username, "Username")}
                    className="p-1.5 rounded-lg hover:bg-neutral-200/70 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer shrink-0"
                    title="Copy Username"
                  >
                    {copiedField === "Username" ? (
                      <HugeIcon
                        icon={Tick02Icon}
                        size={14}
                        className="text-emerald-600"
                      />
                    ) : (
                      <HugeIcon icon={Copy01Icon} size={14} />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-neutral-400">
                  Session termination
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <HugeIcon icon={Logout01Icon} size={14} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2 - Right: Portfolio Activity Footprint */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111215]">
                    Portfolio Activity Footprint
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Summary of cards and transactions synchronized across SwipIt
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200/80 flex items-center justify-center text-neutral-700">
                  <HugeIcon icon={Layers01Icon} size={16} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto">
                <div className="p-4 rounded-xl bg-[#faf8f3] border border-neutral-200/70 flex flex-col gap-1 justify-center">
                  <span className="text-[11px] font-medium text-neutral-500">
                    Cards Tracked
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#111215]">
                    {cards.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#faf8f3] border border-neutral-200/70 flex flex-col gap-1 justify-center">
                  <span className="text-[11px] font-medium text-neutral-500">
                    Transactions
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#111215]">
                    {transactions.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#faf8f3] border border-neutral-200/70 flex flex-col gap-1 justify-center">
                  <span className="text-[11px] font-medium text-neutral-500">
                    Tracked Volume
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#111215] truncate">
                    ₹{totalSpend.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                <span>Telemetry Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Sync
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
