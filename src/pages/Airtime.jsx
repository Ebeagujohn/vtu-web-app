import { useState } from "react";
import API from "../api/axios";
import { useWallet } from "../context/WalletContext";
import { Smartphone, Shield, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

const NETWORKS = [
  { id: "mtn", name: "MTN" },
  { id: "airtel", name: "Airtel" },
  { id: "glo", name: "Glo" },
  { id: "9mobile", name: "9mobile" },
];

export default function Airtime() {
  const { refreshWallet } = useWallet();

  const [network, setNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!network || !phoneNumber || !amount || !pin) {
      setError("Please complete all fields, including your 4-digit PIN.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/airtime/buy/", {
        network,
        phone_number: phoneNumber,
        amount,
        pin,
      });

      setMessage(`${response.data.message} (Ref: ${response.data.reference})`);
      setAmount("");
      setPin("");

      // 🌟 Instantly update header wallet balance
      await refreshWallet();
    } catch (err) {
      setError(err.response?.data?.error || "Airtime purchase failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Buy Airtime</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Recharge any mobile line instantly across all Nigerian networks.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Transaction Successful!</p>
              <p className="mt-0.5 text-xs opacity-90">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Network
            </label>
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((net) => {
                const isSelected = network === net.id;
                return (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setNetwork(net.id)}
                    className={`rounded-xl border p-3 text-xs font-bold transition ${
                      isSelected
                        ? "border-emerald-600 bg-slate-900 text-white dark:bg-emerald-600"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {net.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Smartphone size={18} />
              </div>
              <input
                type="tel"
                placeholder="08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                maxLength={11}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Amount (₦)</label>
            <input
              type="number"
              placeholder="Min ₦50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              min="50"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">4-Digit Transaction PIN</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Shield size={18} />
              </div>
              <input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={loading}
                maxLength={4}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm tracking-widest text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !network || !phoneNumber || !amount || !pin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Processing Recharge..." : "Confirm & Recharge"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}