import { useState, useEffect } from "react";
import API from "../api/axios";
import { useWallet } from "../context/WalletContext";
import { Zap, Smartphone, Shield, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function Electricity() {
  const { refreshWallet } = useWallet();

  const [providers, setProviders] = useState([]);
  const [providerCode, setProviderCode] = useState("");
  const [meterType, setMeterType] = useState("PREPAID");
  const [meterNumber, setMeterNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tokenResult, setTokenResult] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await API.get("/auth/electricity/providers/");
      setProviders(response.data.providers || []);
    } catch {
      setError("Failed to load Electricity DisCos. Please refresh.");
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setTokenResult(null);

    if (!providerCode || !meterType || !meterNumber || !phoneNumber || !amount || !pin) {
      setError("Please fill in all required fields including your 4-digit PIN.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post("/auth/electricity/buy/", {
        provider_code: providerCode,
        meter_type: meterType,
        meter_number: meterNumber,
        phone_number: phoneNumber,
        amount,
        pin,
      });

      setMessage(`${response.data.message} (Ref: ${response.data.reference})`);

      if (response.data.token) {
        setTokenResult({
          token: response.data.token,
          units: response.data.units,
        });
      }

      setPin("");
      setAmount("");
      setMeterNumber("");

      // 🌟 Instantly update header wallet balance
      await refreshWallet();
    } catch (err) {
      setError(err.response?.data?.error || "Electricity payment failed. Verify your meter details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProviders) {
    return <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Loading Electricity DisCos...</div>;
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pay Electricity Bill</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Pay prepaid & postpaid energy bills across all Nigerian DisCos.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Payment Successful!</p>
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

        {tokenResult && (
          <div className="mb-6 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50 p-5 text-center dark:border-blue-400/50 dark:bg-blue-500/10">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
              ⚡ Your Prepaid Electricity Token
            </p>
            <h2 className="my-2 font-mono text-2xl font-extrabold tracking-wider text-blue-700 dark:text-blue-300 sm:text-3xl">
              {tokenResult.token}
            </h2>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Energy Units Generated: <span className="text-slate-900 dark:text-white">{tokenResult.units}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Distribution Company (DisCo)</label>
            <select value={providerCode} onChange={(e) => setProviderCode(e.target.value)} disabled={submitting} className={inputClass}>
              <option value="" disabled>Select DisCo</option>
              {providers.map((p) => (
                <option key={p.id} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Meter Type</label>
            <div className="grid grid-cols-2 gap-2">
              {["PREPAID", "POSTPAID"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMeterType(type)}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                    meterType === type
                      ? "border-emerald-600 bg-slate-900 text-white dark:bg-emerald-600"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  }`}
                >
                  {type === "PREPAID" ? "Prepaid (Token)" : "Postpaid (Bill)"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Meter Number</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Zap size={18} />
              </div>
              <input
                type="text"
                placeholder="Enter meter number"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
              />
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
                disabled={submitting}
                maxLength={11}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Amount (₦)</label>
            <input
              type="number"
              placeholder="Min ₦500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              min="500"
              className={inputClass}
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
                disabled={submitting}
                maxLength={4}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm tracking-widest text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !providerCode || !meterNumber || !phoneNumber || !amount || !pin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Processing Payment..." : "Pay Electricity Bill"}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}