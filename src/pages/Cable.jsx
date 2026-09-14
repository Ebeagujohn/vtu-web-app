import { useState, useEffect } from "react";
import API from "../api/axios";
import { useWallet } from "../context/WalletContext";
import { CreditCard, Smartphone, Shield, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function Cable() {
  const { refreshWallet } = useWallet();

  const [catalog, setCatalog] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [iucNumber, setIucNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCableCatalog();
  }, []);

  const fetchCableCatalog = async () => {
    try {
      const response = await API.get("/auth/cable/plans/");
      setCatalog(response.data.catalog || []);
    } catch {
      setError("Failed to load TV packages. Please refresh.");
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleProviderChange = (e) => {
    const providerCode = e.target.value;
    setSelectedProvider(providerCode);
    setSelectedPlanId("");
    const providerObj = catalog.find(
      (item) => item.code.toLowerCase() === providerCode.toLowerCase()
    );
    setAvailablePlans(providerObj ? providerObj.plans : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedPlanId || !iucNumber || !phoneNumber || !pin) {
      setError("Please fill in all required fields, including your 4-digit PIN.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post("/auth/cable/buy/", {
        plan_id: selectedPlanId,
        iuc_number: iucNumber,
        phone_number: phoneNumber,
        pin,
      });

      setMessage(`${response.data.message} (Ref: ${response.data.reference})`);
      setPin("");
      setSelectedPlanId("");
      setIucNumber("");

      // 🌟 Instantly update header wallet balance
      await refreshWallet();
    } catch (err) {
      setError(err.response?.data?.error || "Cable TV subscription failed. Verify your IUC number.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPlans) {
    return <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Loading TV packages...</div>;
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">TV Subscription</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Renew DStv, GOtv, and Startimes packages instantly.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Subscription Activated!</p>
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">TV Provider</label>
            <select value={selectedProvider} onChange={handleProviderChange} disabled={submitting} className={inputClass}>
              <option value="" disabled>Select Provider</option>
              {catalog.map((item) => (
                <option key={item.provider_id} value={item.code}>
                  {item.provider_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Smartcard / IUC Number</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <CreditCard size={18} />
              </div>
              <input
                type="text"
                placeholder="Enter Smartcard or IUC number"
                value={iucNumber}
                onChange={(e) => setIucNumber(e.target.value)}
                disabled={submitting}
                maxLength={12}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Subscription Package</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              disabled={submitting || !selectedProvider}
              className={`${inputClass} disabled:bg-slate-50 dark:disabled:bg-slate-900`}
            >
              <option value="" disabled>
                {selectedProvider ? "Select Package" : "Select a provider first"}
              </option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — ₦{parseFloat(plan.price).toLocaleString("en-NG")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Customer Phone Number</label>
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
            disabled={submitting || !selectedPlanId || !iucNumber || !phoneNumber || !pin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Activating Package..." : "Confirm & Subscribe"}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}