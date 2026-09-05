import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/api/axios";
import { sileo } from "sileo";
import { Mail, RefreshCw, CheckCircle2, AlertCircle, ArrowRight, Unlink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [googleStatus, setGoogleStatus] = useState({
    loading: true,
    connected: false,
    email: null,
  });
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchGoogleStatus = async () => {
    try {
      const res = await api.get("/auth/google/status");
      setGoogleStatus({
        loading: false,
        connected: res.data.connected,
        email: res.data.email,
      });
    } catch {
      setGoogleStatus({ loading: false, connected: false, email: null });
    }
  };

  useEffect(() => {
    fetchGoogleStatus();
  }, []);

  useEffect(() => {
    if (searchParams.get("google_connected") === "true") {
      sileo.success({
        title: "Gmail Connected!",
        description: "Your Gmail account has been successfully linked for transaction sync.",
      });
      searchParams.delete("google_connected");
      setSearchParams(searchParams, { replace: true });
      fetchGoogleStatus();
    }
  }, [searchParams, setSearchParams]);

  const handleConnectOrSwitchGoogle = () => {
    window.location.href = "http://localhost:8000/auth/google/login?action=connect";
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await api.post("/auth/google/disconnect");
      if (res.data.success) {
        sileo.success({
          title: "Disconnected",
          description: "Gmail account unlinked successfully.",
        });
        setGoogleStatus({ loading: false, connected: false, email: null });
      }
    } catch {
      sileo.error({
        title: "Error",
        description: "Failed to disconnect Gmail account.",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex h-full w-full flex-1 flex-col gap-6 rounded-tl-2xl border-l border-t border-neutral-300/80 bg-[#f2eee5] p-4 md:p-10 paper-grain overflow-y-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111215]">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-neutral-600">
            Manage your card rewards, spend alerts, and synced transaction accounts.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-300/90 bg-white/80 p-5 shadow-xs backdrop-blur-xs transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-[#111215] p-2.5 text-[#f2eee5] shadow-xs shrink-0 mt-0.5">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[#111215]">
                    Gmail Transaction Sync
                  </h2>
                  {!googleStatus.loading && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        googleStatus.connected
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300/70"
                          : "bg-neutral-100 text-neutral-600 border border-neutral-300/70"
                      }`}
                    >
                      {googleStatus.connected ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Connected
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-neutral-500" />
                          Not Connected
                        </>
                      )}
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-neutral-600 mt-1 max-w-xl">
                  {googleStatus.connected ? (
                    <span>
                      Syncing bank transaction alerts from{" "}
                      <strong className="font-semibold text-neutral-900 font-mono">
                        {googleStatus.email}
                      </strong>
                      . You can switch to a different Google account at any time.
                    </span>
                  ) : (
                    "Connect your Gmail to automatically detect card transactions, statement updates, and maximize rewards."
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              {googleStatus.connected ? (
                <>
                  <button
                    type="button"
                    onClick={handleConnectOrSwitchGoogle}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#111215] px-3.5 py-2 text-xs font-semibold text-[#f2eee5] shadow-xs transition hover:bg-neutral-800 active:scale-98 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Switch Account</span>
                  </button>
                  <button
                    type="button"
                    disabled={disconnecting}
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white/90 px-3 py-2 text-xs font-medium text-neutral-700 shadow-2xs transition hover:bg-neutral-100 hover:text-red-600 active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <Unlink className="h-3.5 w-3.5" />
                    <span>Disconnect</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectOrSwitchGoogle}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111215] px-4 py-2 text-xs font-semibold text-[#f2eee5] shadow-xs transition hover:bg-neutral-800 active:scale-98 cursor-pointer"
                >
                  <span>Connect Gmail</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Tracked Cards", value: "Active" },
            { label: "Auto-Parsed Alerts", value: "Ready" },
            { label: "Axis Bank Alerts", value: "Supported" },
            { label: "Federal Bank Alerts", value: "Supported" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-300/80 bg-white/70 p-4 shadow-2xs"
            >
              <span className="text-xs font-medium text-neutral-500">{item.label}</span>
              <p className="mt-1 text-lg font-bold text-neutral-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-1 min-h-[260px] gap-4">
          <div className="flex-1 rounded-2xl border border-neutral-300/80 bg-white/60 p-6 shadow-2xs flex flex-col justify-center items-center text-center">
            <p className="text-sm font-medium text-neutral-700">Recent Activity</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Your parsed card transactions and reward recommendations will appear here automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
