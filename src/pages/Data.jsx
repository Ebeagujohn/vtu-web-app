import { useState, useEffect } from "react";
import API from "../api/axios";
import { useWallet } from "../context/WalletContext";
import { Smartphone, Shield, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function Data() {
  const { refreshWallet } = useWallet();

  const [catalog, setCatalog] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDataPlans();
  }, []);

  const fetchDataPlans = async () => {
    try {
      const response = await API.get("/auth/data/plans/");
      setCatalog(response.data.catalog || []);
    } catch {
      setError("Failed to load data bundle catalog. Please refresh.");
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleNetworkChange = (e) => {
    const networkCode = e.target.value;
    setSelectedNetwork(networkCode);
    setSelectedPlanId("");
    const networkObj = catalog.find(
      (item) => item.network.toLowerCase() === networkCode.toLowerCase()
    );
    setAvailablePlans(networkObj ? networkObj.plans : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedPlanId || !phoneNumber || !pin) {
      setError("Please complete all fields, including your 4-digit PIN.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post("/auth/data/buy/", {
        plan_id: selectedPlanId,
        phone_number: phoneNumber,
        pin,
      });

      setMessage(`${response.data.message} (Ref: ${response.data.reference})`);
      setPin("");
      setSelectedPlanId("");

      // 🌟 Instantly update header wallet balance
      await refreshWallet();
    } catch (err) {
      setError(err.response?.data?.error || "Data purchase failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPlans) {
    return <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">Loading data catalog...</div>;
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Buy Data Bundles</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Fast and affordable internet data for all networks.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Data Sent Successfully!</p>
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Network Provider</label>
            <select value={selectedNetwork} onChange={handleNetworkChange} disabled={submitting} className={inputClass}>
              <option value="" disabled>Select Network</option>
              {catalog.map((item) => (
                <option key={item.provider_id} value={item.network.toLowerCase()}>
                  {item.network}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Data Bundle Plan</label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              disabled={submitting || !selectedNetwork}
              className={`${inputClass} disabled:bg-slate-50 dark:disabled:bg-slate-900`}
            >
              <option value="" disabled>
                {selectedNetwork ? "Select Data Plan" : "Select a Network first"}
              </option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — ₦{parseFloat(plan.price).toLocaleString("en-NG")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Recipient Phone Number</label>
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
            disabled={submitting || !selectedPlanId || !phoneNumber || !pin}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Processing Bundle..." : "Confirm & Buy Data"}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}