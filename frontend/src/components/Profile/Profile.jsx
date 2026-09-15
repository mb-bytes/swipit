"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { sileo } from "sileo";
import { motion } from "motion/react";
import {
  User,
  Mail,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  LogOut,
  Sparkles,
  Zap,
  ArrowUpRight,
  Lock,
  Calendar,
  Layers,
  Bell,
  Sliders,
  ExternalLink,
} from "lucide-react";

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
  const [preferences, setPreferences] = useState({
    autoSync: true,
    recommendationAlerts: true,
    milestoneAlerts: true,
    weeklyReport: false,
  });

  const displayName = user?.name || user?.username || "Card Member";
  const username = user?.username ? `@${user.username}` : "@member";
  const email = user?.email || "No email linked";
  const userId = user?.user_id || user?.id || "usr_swipit_active";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "March 2026";

  const totalSpend = transactions.reduce(
    (acc, txn) => acc + (Number(txn.amount) || 0),
    0
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

  const togglePreference = (key) => {
    setPreferences((prev) => {
      const next = !prev[key];
      sileo.info({
        title: "Preference updated",
        description: next ? "Enabled" : "Disabled",
      });
      return { ...prev, [key]: next };
    });
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
      <div className="flex h-full w-full flex-1 flex-col gap-8 rounded-tl-2xl border-l border-t border-neutral-300/80 bg-[#f8f9fb] p-5 md:p-8 lg:p-10 paper-grain overflow-y-auto min-h-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-neutral-200/80">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111215]">
              Account & Profile
            </h1>
            <p className="mt-1 text-sm text-neutral-500 max-w-xl">
              Manage your personal credentials, portfolio telemetry, and financial data integrations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 Encrypted</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#111215] text-[#f2eee5]">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Optimizer Tier</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative overflow-hidden rounded-3xl bg-[#111215] text-[#f2eee5] border border-neutral-800 shadow-xl p-6 sm:p-7 flex flex-col justify-between min-h-[360px] group"
            >
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(194,87,26,0.18),transparent_55%)]" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold tracking-tight text-white shadow-inner font-mono text-base">
                    {initials}
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-semibold">
                      SwipIt Member
                    </span>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      {displayName}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-[11px] font-mono text-neutral-300">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>SECURE</span>
                </div>
              </div>

              <div className="relative z-10 py-6 my-auto flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-6 rounded bg-gradient-to-r from-amber-400 to-amber-200/90 shadow-sm border border-amber-300/30 flex items-center justify-center">
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

                <div className="font-mono text-sm tracking-wider text-neutral-300 pt-1">
                  {username}
                </div>
                <div className="text-xs text-neutral-400 font-normal truncate">
                  {email}
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Joined {memberSince}</span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[11px] text-amber-400/90">
                  <Zap className="w-3 h-3" />
                  <span>ACTIVE</span>
                </div>
              </div>
            </motion.div>

            <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-[#111215]">
                Account Credentials
              </h3>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-neutral-400">Primary Email</div>
                      <div className="text-xs font-semibold text-neutral-800 truncate font-mono">
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
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <User className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-neutral-400">Member Handle</div>
                      <div className="text-xs font-semibold text-neutral-800 truncate font-mono">
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
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Lock className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-neutral-400">Account ID</div>
                      <div className="text-xs font-semibold text-neutral-800 truncate font-mono">
                        {String(userId).slice(0, 16)}...
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(userId), "User ID")}
                    className="p-1.5 rounded-lg hover:bg-neutral-200/70 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer shrink-0"
                    title="Copy User ID"
                  >
                    {copiedField === "User ID" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Session termination</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-neutral-700" />
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
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Connected</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 w-fit">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Not Linked</span>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-4 text-xs text-neutral-600 flex flex-col gap-2">
                {googleStatus.connected ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-medium">Linked Account</span>
                      <strong className="font-mono text-neutral-900 font-semibold">
                        {googleStatus.email}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-medium">Sync Scope</span>
                      <span className="text-neutral-800">Card Receipts & Invoices</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-medium">Auto-Parsing</span>
                      <span className="text-emerald-700 font-medium">Enabled</span>
                    </div>
                  </>
                ) : (
                  <p className="leading-relaxed text-neutral-600">
                    Link your Gmail to automatically ingest credit card transactions, detect new statements, and populate spend categories without manual data entry.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleConnectOrSwitchGoogle}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowUpRight className="w-4 h-4 text-amber-400" />
                  <span>
                    {googleStatus.connected
                      ? "Switch Connected Gmail Account"
                      : "Connect Gmail Account"}
                  </span>
                </button>

                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <span>Google Permissions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111215]">
                    Portfolio Activity Footprint
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Summary of cards and transactions synchronized across SwipIt
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#faf8f3] border border-neutral-200/70 flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-neutral-500">
                    Cards Tracked
                  </span>
                  <div className="text-xl font-bold font-mono text-[#111215]">
                    {cards.length}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#faf8f3] border border-neutral-200/70 flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-neutral-500">
                    Transactions
                  </span>
                  <div className="text-xl font-bold font-mono text-[#111215]">
                    {transactions.length}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-[#faf8f3] border border-neutral-200/70 flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-neutral-500">
                    Tracked Volume
                  </span>
                  <div className="text-xl font-bold font-mono text-[#111215] truncate">
                    ₹{totalSpend.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {cards.length > 0 && (
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Connected Cards
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cards.map((c) => (
                      <div
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-800"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{c.name || c.bank}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111215]">
                    Notification & Engine Preferences
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Configure transaction telemetry and daily card recommendation signals
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700">
                  <Sliders className="w-4 h-4" />
                </div>
              </div>

              <div className="divide-y divide-neutral-100">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-neutral-800">
                      Daily AI Recommendation Digest
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Calculates the highest-yield card per merchant based on updated reward tables
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreference("recommendationAlerts")}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      preferences.recommendationAlerts ? "bg-[#111215]" : "bg-neutral-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        preferences.recommendationAlerts ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-neutral-800">
                      Automated Statement Sync
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Poll connected email for new e-statements and settlement alerts
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreference("autoSync")}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      preferences.autoSync ? "bg-[#111215]" : "bg-neutral-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        preferences.autoSync ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-neutral-800">
                      Milestone Spend Approaching Alerts
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Alerts when fee waiver or bonus reward milestone is within 15%
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePreference("milestoneAlerts")}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      preferences.milestoneAlerts ? "bg-[#111215]" : "bg-neutral-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        preferences.milestoneAlerts ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
