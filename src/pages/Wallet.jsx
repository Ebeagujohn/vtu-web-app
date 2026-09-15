import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useWallet } from "../context/WalletContext";
import {
  Wallet as WalletIcon,
  Copy,
  Check,
  Building2,
  Shield,
  ArrowUpRight,
  RefreshCw,
  History,
  Zap,
} from "lucide-react";

export default function Wallet() {
  const { refreshWallet } = useWallet();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedAccount, setCopiedAccount] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [demoFunding, setDemoFunding] = useState(false);
  const [demoSuccessMsg, setDemoSuccessMsg] = useState("");

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const response = await API.get("/auth/wallet/");
      setWallet(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to load wallet details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDemoTopUp = async () => {
    setDemoFunding(true);
    setDemoSuccessMsg("");
    setError("");

    try {
      const res = await API.post("/auth/wallet/demo-fund/");
      setDemoSuccessMsg(res.data.message);
      
      // Refetch local wallet data & header balance
      await fetchWalletData(true);
      await refreshWallet();
    } catch (err) {
      setError("Failed to process demo top-up. Please try again.");
    } finally {
      setDemoFunding(false);
    }
  };

  const handleCopy = async (accNumber) => {
    try {
      await navigator.clipboard.writeText(accNumber);
      setCopiedAccount(accNumber);
      setTimeout(() => setCopiedAccount(""), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = accNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedAccount(accNumber);
      setTimeout(() => setCopiedAccount(""), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-700 dark:text-slate-200">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-300 bg-red-50 p-6 text-center dark:border-red-500 dark:bg-red-950">
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={() => fetchWalletData()}
          className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  const balance = parseFloat(wallet?.balance || 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Wallet
          </h1>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            Fund your NOHASub wallet instantly via virtual accounts or test top-up.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* ⚡ INSTANT DEMO TOP-UP BUTTON */}
          <button
            onClick={handleDemoTopUp}
            disabled={demoFunding}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            title="Add ₦10,000 Demo Funds for Testing"
          >
            <Zap size={16} />
            {demoFunding ? "Crediting..." : "+ Add ₦10,000 Demo Funds"}
          </button>

          <Link
            to="/app/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <History size={16} />
            History
          </Link>
          <button
            onClick={() => fetchWalletData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {demoSuccessMsg && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30">
          🎉 {demoSuccessMsg}
        </div>
      )}

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <WalletIcon size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-200">Available Balance</p>
                <p className="text-xs text-slate-300">
                  {wallet?.username ? `@${wallet.username}` : "NOHASub Wallet"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/40">
              Active
            </span>
          </div>

          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            ₦
            {balance.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white">
              <Shield size={14} className="text-emerald-300" />
              Secured ledger wallet
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white">
              <ArrowUpRight size={14} className="text-emerald-300" />
              Instant bank top-up
            </div>
          </div>
        </div>
      </div>

      {/* Funding guide */}
      <div className="rounded-2xl border border-emerald-300 bg-emerald-100 p-4 sm:p-5 dark:border-emerald-400/40 dark:bg-emerald-950">
        <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
          How to fund your wallet
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-medium text-emerald-950 dark:text-emerald-100">
          <li>For testing: Click <strong>"+ Add ₦10,000 Demo Funds"</strong> above.</li>
          <li>For live mode: Copy any virtual account number below and transfer from your bank app.</li>
          <li>Your wallet is credited automatically after settlement.</li>
        </ol>
      </div>

      {/* Virtual accounts */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Virtual Top-up Accounts
          </h3>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {wallet?.accounts?.length || 0} accounts
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {(wallet?.accounts || []).map((acc, idx) => {
            const isCopied = copiedAccount === acc.account_number;
            const isMoniepoint = (acc.bank_name || "").toUpperCase().includes("MONIE");

            return (
              <div
                key={`${acc.account_number}-${idx}`}
                className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isMoniepoint
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200"
                      }`}
                    >
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{acc.bank_name}</p>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        {acc.account_name || "NOHASUB ACCOUNT"}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200">
                    Fee: {acc.fee || "1%"}
                  </span>
                </div>

                <div className="mt-5 rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Account Number
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-slate-900 dark:text-white">
                    {acc.account_number}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(acc.account_number)}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    isCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy Account Number
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}