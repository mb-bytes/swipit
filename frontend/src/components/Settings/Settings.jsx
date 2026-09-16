"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import api from "@/api/axios";
import { sileo } from "sileo";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Copy,
  Check,
  Edit3,
  X,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Unlink,
  ArrowUpRight,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

export function Settings() {
  const { user, updateUser, deleteAccount } = useAuth();
  const { googleStatus, fetchGoogleStatus } = useDashboard();
  const navigate = useNavigate();

  const [copiedField, setCopiedField] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [isSavingName, setIsSavingName] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = user?.name || user?.username || "Card Member";
  const username = user?.username ? `@${user.username}` : "@member";
  const rawUsername = user?.username || "";
  const email = user?.email || "No email linked";
  const userId = user?.user_id || user?.id || "usr_swipit_active";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "March 2026";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      sileo.error({ title: "Name cannot be empty" });
      return;
    }
    setIsSavingName(true);
    try {
      const res = await api.patch("/api/user/me", { name: trimmed });
      updateUser({ name: res.data.name });
      setIsEditingName(false);
      sileo.success({
        title: "Name updated",
        description: `Display name changed to ${res.data.name}`,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || "Failed to update your name";
      sileo.error({ title: "Update failed", description: errorMsg });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      sileo.error({ title: "Current password required" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      sileo.error({ title: "Password too short", description: "Must be at least 8 characters" });
      return;
    }
    if (!/[A-Za-z]/.test(passwordForm.newPassword) || !/\d/.test(passwordForm.newPassword)) {
      sileo.error({ title: "Weak password", description: "Must contain at least one letter and one number" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      sileo.error({ title: "Passwords mismatch", description: "New passwords do not match" });
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.post("/api/user/change-password", {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_new_password: passwordForm.confirmPassword,
      });
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      sileo.success({ title: "Password changed successfully" });
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to change password";
      sileo.error({ title: "Error changing password", description: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeGmail = async () => {
    setIsRevoking(true);
    try {
      const res = await api.post("/auth/google/disconnect");
      if (res.data?.success) {
        await fetchGoogleStatus();
        setShowRevokeModal(false);
        sileo.success({
          title: "Gmail Access Revoked",
          description: "Automated transaction ingestion has been disconnected",
        });
      } else {
        sileo.error({
          title: "Revocation note",
          description: res.data?.message || "No connected account found",
        });
        setShowRevokeModal(false);
      }
    } catch {
      sileo.error({
        title: "Revocation failed",
        description: "Could not revoke Google account access",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      deleteConfirmationText !== rawUsername &&
      deleteConfirmationText.toLowerCase() !== "delete"
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      sileo.success({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently removed",
      });
      navigate("/login");
    } catch {
      sileo.error({
        title: "Delete failed",
        description: "Could not delete account. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  const isDeleteConfirmed =
    deleteConfirmationText === rawUsername ||
    deleteConfirmationText.toLowerCase() === "delete";

  return (
    <div className="flex flex-1 h-full min-h-0 min-w-0 overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-6 rounded-tl-2xl border-l border-t border-neutral-300/80 bg-[#f8f9fb] p-5 md:p-8 lg:p-10 paper-grain overflow-y-auto min-h-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-neutral-200/80 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111215]">
              Account Settings
            </h1>
            <p className="mt-1 text-sm text-neutral-500 max-w-xl">
              Personal identity, connected data integrations, and account lifecycle controls.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          <div className="lg:col-span-6 flex flex-col h-full">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col justify-between h-full gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#111215] text-[#f2eee5] font-mono font-bold text-base flex items-center justify-center shadow-xs">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#111215]">
                      Personal Identity
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Your profile details and SwipIt account credentials
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span>SwipIt Member</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500">
                      Display Name
                    </span>
                    {!isEditingName && (
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(user?.name || "");
                          setIsEditingName(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Edit Name</span>
                      </button>
                    )}
                  </div>

                  {isEditingName ? (
                    <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your name"
                        className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-900 bg-white border border-neutral-300 focus:outline-hidden focus:border-neutral-900 shadow-2xs font-sans"
                        autoFocus
                        disabled={isSavingName}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSavingName}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isSavingName ? "Saving..." : "Save"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingName(false)}
                          disabled={isSavingName}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-200/70 text-neutral-700 hover:bg-neutral-300 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-sm font-bold text-neutral-900">
                      {displayName}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-neutral-500">
                          Primary Email
                        </div>
                        <div className="text-xs font-semibold text-neutral-900 truncate font-mono pt-0.5">
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

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <User className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-neutral-500">
                          Member Handle
                        </div>
                        <div className="text-xs font-semibold text-neutral-900 truncate font-mono pt-0.5">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Lock className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-neutral-500">
                          Account Password
                        </div>
                        <div className="text-xs font-semibold text-neutral-800 font-mono pt-0.5 tracking-widest">
                          ••••••••••••
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        setShowPasswordModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      <KeyRound className="w-3 h-3 text-amber-400" />
                      <span>Change</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-neutral-500">
                          Member Since
                        </div>
                        <div className="text-xs font-semibold text-neutral-900 truncate pt-0.5">
                          {memberSince}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                <span>Account Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active & Verified
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between gap-6 h-full">
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#111215]">
                      Gmail Read Access & Statements
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Automated parsing permissions for statements and receipts
                    </p>
                  </div>
                </div>

                {googleStatus.connected ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 w-fit shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium text-neutral-400">
                        Connected Account
                      </span>
                      <strong className="font-mono text-neutral-900 font-semibold truncate pt-0.5" title={googleStatus.email}>
                        {googleStatus.email}
                      </strong>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium text-neutral-400">
                        Read Scope
                      </span>
                      <span className="text-neutral-800 font-medium truncate pt-0.5">
                        Receipts & Invoices
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-medium text-neutral-400">
                        Telemetry Status
                      </span>
                      <span className="text-emerald-700 font-semibold pt-0.5">
                        Active Ingestion
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
                    >
                      <span>Google Permissions</span>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setShowRevokeModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/80 transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      <Unlink className="w-3.5 h-3.5 text-red-600" />
                      <span>Revoke Access</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200/70">
                  <p className="text-xs text-neutral-600 leading-relaxed max-w-sm">
                    Link your Gmail to enable automatic credit card statement ingestion and instant transaction alerts.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        "http://localhost:8000/auth/google/login?action=connect";
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <ArrowUpRight className="w-4 h-4 text-amber-400" />
                    <span>Connect Gmail</span>
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-red-200/80 bg-white p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200/80 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-red-950">
                      Danger Zone
                    </h2>
                    <p className="text-xs text-red-600/80">
                      Permanent and irreversible account actions
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200/60 font-mono text-[11px] font-semibold">
                  IRREVERSIBLE
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/40 border border-red-200/60">
                <div className="flex flex-col gap-1 max-w-sm">
                  <div className="text-xs font-bold text-red-900">
                    Delete Account & Purge Telemetry
                  </div>
                  <div className="text-[11px] text-red-700/80 leading-relaxed">
                    Permanently delete your profile, cards, transactions, and integrations. This cannot be recovered.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmationText("");
                    setShowDeleteModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5 text-neutral-800" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      Change Password
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Update credentials for this account
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-3.5 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="Enter current password"
                      required
                      className="w-full pl-3 pr-10 py-2 rounded-xl text-xs font-medium text-neutral-900 bg-neutral-50 border border-neutral-300 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="At least 8 chars, letters & numbers"
                      required
                      minLength={8}
                      className="w-full pl-3 pr-10 py-2 rounded-xl text-xs font-medium text-neutral-900 bg-neutral-50 border border-neutral-300 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="Re-enter new password"
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-neutral-900 bg-neutral-50 border border-neutral-300 focus:outline-hidden focus:border-neutral-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    disabled={isChangingPassword}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#111215] text-[#f2eee5] hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isChangingPassword ? "Updating..." : "Update Password"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRevokeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Revoke Gmail Read Access?
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Disconnect statement and transaction ingestion
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs text-neutral-600 leading-relaxed flex flex-col gap-2">
                <p>
                  Disconnecting Gmail will prevent SwipIt from automatically parsing new credit card statements and transaction alerts.
                </p>
                <p className="text-neutral-500 font-medium">
                  Your existing cards and saved transactions will remain in your portfolio. You can reconnect at any time.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevokeModal(false)}
                  disabled={isRevoking}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Keep Connected
                </button>
                <button
                  type="button"
                  onClick={handleRevokeGmail}
                  disabled={isRevoking}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span>{isRevoking ? "Revoking..." : "Revoke Access"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-red-200 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Delete Account Permanently?
                  </h3>
                  <p className="text-xs text-red-600 font-medium">
                    This action is permanent and cannot be undone
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200/60 text-xs text-red-950 flex flex-col gap-2 leading-relaxed">
                <p className="font-semibold text-red-900">
                  The following data will be erased immediately:
                </p>
                <ul className="list-disc list-inside text-red-800/90 text-[11px] flex flex-col gap-1">
                  <li>All credit card reward portfolios and tracked cards</li>
                  <li>All recorded transactions and reward milestone points</li>
                  <li>Google OAuth tokens and statement ingestion telemetry</li>
                  <li>User login credentials and account profile</li>
                </ul>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-semibold text-neutral-700">
                  To confirm, type <span className="font-mono text-neutral-950 bg-neutral-100 px-1.5 py-0.5 rounded-md font-bold">{rawUsername || "DELETE"}</span> below:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={`Type ${rawUsername || "DELETE"}`}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-neutral-900 bg-neutral-50 border border-neutral-300 focus:outline-hidden focus:border-red-600 focus:bg-white transition-colors"
                  autoFocus
                  disabled={isDeleting}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={!isDeleteConfirmed || isDeleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? "Deleting..." : "Permanently Delete"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;
