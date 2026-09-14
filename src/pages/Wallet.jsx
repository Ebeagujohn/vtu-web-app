import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import {
  Wallet as WalletIcon,
  Copy,
  Check,
  Building2,
  Shield,
  ArrowUpRight,
  RefreshCw,
  History,
} from "lucide-react";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedAccount, setCopiedAccount] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-6 text-center dark:border-red-500/20 dark:bg-red-500/10">
        <p className="text-sm font-medium text-red-600 dark:text-red-300">{error}</p>
        <button
          onClick={() => fetchWalletData()}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const balance = parseFloat(wallet?.balance || 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Wallet
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Fund your NOHASub wallet instantly via dedicated virtual accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <History size={16} />
            History
          </Link>
          <button
            onClick={() => fetchWalletData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <WalletIcon size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-300">Available Balance</p>
                <p className="text-xs text-slate-400">
                  {wallet?.username ? `@${wallet.username}` : "NOHASub Wallet"}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              Active
            </span>
          </div>

          <h2 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            ₦
            {balance.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h2>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200 backdrop-blur">
              <Shield size={14} className="text-emerald-300" />
              Secured ledger wallet
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200 backdrop-blur">
              <ArrowUpRight size={14} className="text-emerald-300" />
              Instant bank top-up
            </div>
          </div>
        </div>
      </div>

      {/* Funding instructions */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
        <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
          How to fund your wallet
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-emerald-800/90 dark:text-emerald-200/90">
          <li>Copy any virtual account number below.</li>
          <li>Transfer from your bank app (same name as shown).</li>
          <li>Your wallet is credited automatically after settlement.</li>
        </ol>
        <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          Gateway fee: <span className="font-bold">1%</span> per successful bank transfer funding.
        </p>
      </div>

      {/* Virtual accounts */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Virtual Top-up Accounts
          </h3>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isMoniepoint
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                          : "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300"
                      }`}
                    >
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{acc.bank_name}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {acc.account_name || "NOHASUB ACCOUNT"}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Fee: {acc.fee || "1%"}
                  </span>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/80">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                      : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Funding tips</h4>
        <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>• Always transfer to the exact account name shown above.</li>
          <li>• Keep your transfer receipt until wallet balance updates.</li>
          <li>• After funding, use Airtime, Data, Cable, or Electricity from your dashboard.</li>
        </ul>
      </div>
    </div>
  );
}