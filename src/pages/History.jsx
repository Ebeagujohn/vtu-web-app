import { useEffect, useState } from "react";
import API from "../api/axios";
import ReceiptModal from "../components/ReceiptModal";
import {
  History as HistoryIcon,
  RefreshCw,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  Filter,
  Search,
} from "lucide-react";

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  
  // Filters State
  const [filter, setFilter] = useState("ALL"); // ALL | CREDIT | DEBIT
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const response = await API.get("/auth/transactions/history/");
      setTransactions(response.data.transactions || []);
    } catch (err) {
      const backendError =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        `HTTP ${err.response?.status || ""}: ${err.message}`;
      setError(`Failed to load history: ${backendError}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and Search Algorithm
  const filtered = transactions.filter((tx) => {
    // Type Filter
    if (filter !== "ALL" && tx.transaction_type !== filter) {
      return false;
    }

    // Search Query Filter
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const refMatch = (tx.reference || "").toLowerCase().includes(query);
    const descMatch = (tx.description || "").toLowerCase().includes(query);
    const amountMatch = (tx.amount || "").toString().includes(query);
    
    const meta = tx.meta_data || {};
    const phoneMatch = (meta.phone_number || "").toLowerCase().includes(query);
    const meterMatch = (meta.meter_number || "").toLowerCase().includes(query);

    return refMatch || descMatch || amountMatch || phoneMatch || meterMatch;
  });

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading transaction ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            <HistoryIcon size={22} className="text-emerald-600 dark:text-emerald-400" />
            Transaction History
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Full audit trail of wallet funding and utility purchases.
          </p>
        </div>

        <button
          onClick={() => fetchHistory(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Controls: Search Bar & Type Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by reference, phone, meter, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400"
          />
        </div>

        {/* Type Filter Chips */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Filter size={14} />
          </span>
          {[
            { key: "ALL", label: "All" },
            { key: "CREDIT", label: "Credits" },
            { key: "DEBIT", label: "Debits" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                filter === item.key
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Could not load ledger</p>
            <p className="mt-1 text-xs text-red-600/90 dark:text-red-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Receipt size={22} />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">No transactions found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchQuery ? "Try searching for a different keyword or reference." : "Your wallet credits and service purchases will appear here."}
          </p>
        </div>
      )}

      {/* Transaction Cards List */}
      <div className="space-y-3">
        {filtered.map((tx) => {
          const isCredit = tx.transaction_type === "CREDIT";
          const amount = parseFloat(tx.amount || 0);
          const meta = tx.meta_data || {};

          return (
            <div
              key={tx.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${
                      isCredit
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                    }`}
                  >
                    {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          isCredit
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                        }`}
                      >
                        {tx.service_type || tx.transaction_type}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          tx.status === "SUCCESSFUL"
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            : tx.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
                        }`}
                      >
                        {tx.status || "SUCCESSFUL"}
                      </span>
                    </div>

                    <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                      {tx.description}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {tx.date || "N/A"} • Ref:{" "}
                      <span className="font-mono text-slate-700 dark:text-slate-300">{tx.reference}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-base font-extrabold sm:text-lg ${
                      isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isCredit ? "+" : "-"}₦
                    {amount.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    Bal: ₦
                    {parseFloat(tx.balance_after || 0).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Useful Metadata Badges */}
              {(meta.phone_number || meta.iuc_number || meta.meter_number || meta.meter_token) && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  {meta.phone_number && (
                    <span className="rounded-lg bg-slate-50 px-2 py-1 dark:bg-slate-800">📱 {meta.phone_number}</span>
                  )}
                  {meta.iuc_number && (
                    <span className="rounded-lg bg-slate-50 px-2 py-1 dark:bg-slate-800">📺 {meta.iuc_number}</span>
                  )}
                  {meta.meter_number && (
                    <span className="rounded-lg bg-slate-50 px-2 py-1 dark:bg-slate-800">⚡ Meter {meta.meter_number}</span>
                  )}
                  {meta.meter_token && (
                    <span className="rounded-lg bg-blue-50 px-2 py-1 font-mono text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      Token {meta.meter_token}
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => setSelectedTx(tx)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800/80 dark:hover:text-emerald-400"
              >
                <Receipt size={16} />
                View & Share Receipt
              </button>
            </div>
          );
        })}
      </div>

      {selectedTx && (
        <ReceiptModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}