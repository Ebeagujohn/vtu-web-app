import { useWallet } from "../context/WalletContext";
import { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import {
  User,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
  KeyRound,
} from "lucide-react";

export default function Profile() {
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinSaving, setPinSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const { refreshWallet } = useWallet();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [passError, setPassError] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");
  const [upgradeSaving, setUpgradeSaving] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [upgradePin, setUpgradePin] = useState("");

const handleResellerUpgrade = async (e) => {
  e.preventDefault();
  setUpgradeSaving(true);
  setUpgradeError("");
  setUpgradeMessage("");

  try {
    const res = await API.post("/auth/profile/upgrade/", {
      pin: upgradePin,
    });

    setUpgradeMessage(res.data.message || "Upgrade successful.");
    setUpgradePin("");

    // Update local tier immediately
    setForm((prev) => ({
      ...prev,
      user_tier: res.data.new_tier || "RESELLER",
    }));
    await refreshWallet();
  } catch (err) {
    setUpgradeError(err.response?.data?.error || "Upgrade failed. Please try again.");
  } finally {
    setUpgradeSaving(false);
  }
};  
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone_number: "",
    user_tier: "",
    profile_picture: null,
  });

  const [pinForm, setPinForm] = useState({
    old_pin: "",
    new_pin: "",
    confirm_pin: "",
  });

  const [passForm, setPassForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile/");
      setForm({
        username: res.data.username || "",
        email: res.data.email || "",
        full_name: res.data.full_name || "",
        phone_number: res.data.phone_number || "",
        user_tier: res.data.user_tier || "REGULAR",
        profile_picture: res.data.profile_picture || null,
      });

      if (res.data.username) {
        localStorage.setItem("noha_username", res.data.username);
      }
      if (res.data.profile_picture) {
        localStorage.setItem("noha_profile_picture", res.data.profile_picture);
      } else {
        localStorage.removeItem("noha_profile_picture");
      }
    } catch {
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await API.patch("/auth/profile/", {
        username: form.username,
        full_name: form.full_name,
        phone_number: form.phone_number,
        email: form.email,
      });

      setMessage(res.data.message || "Profile updated successfully.");
      setForm((prev) => ({
        ...prev,
        ...res.data,
        profile_picture: res.data.profile_picture || prev.profile_picture,
      }));

      if (res.data.username) {
        localStorage.setItem("noha_username", res.data.username);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();
    setPinSaving(true);
    setPinError("");
    setPinMessage("");

    try {
      const res = await API.post("/auth/profile/change-pin/", pinForm);
      setPinMessage(res.data.message || "PIN updated successfully.");
      setPinForm({ old_pin: "", new_pin: "", confirm_pin: "" });
    } catch (err) {
      setPinError(err.response?.data?.error || "Failed to change PIN.");
    } finally {
      setPinSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassSaving(true);
    setPassError("");
    setPassMessage("");

    try {
      const res = await API.post("/auth/profile/change-password/", passForm);
      setPassMessage(res.data.message || "Password changed successfully.");
      setPassForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPassError(err.response?.data?.error || "Failed to change password.");
    } finally {
      setPassSaving(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    setPhotoMessage("");
    setPhotoUploading(true);

    try {
      const body = new FormData();
      body.append("profile_picture", file);

      const res = await API.post("/auth/profile/picture/", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = res.data.profile_picture || null;
      setForm((prev) => ({ ...prev, profile_picture: url }));
      if (url) localStorage.setItem("noha_profile_picture", url);
      setPhotoMessage(res.data.message || "Profile picture updated.");
    } catch (err) {
      setPhotoError(err.response?.data?.error || "Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoError("");
    setPhotoMessage("");
    setPhotoUploading(true);

    try {
      const res = await API.delete("/auth/profile/picture/");
      setForm((prev) => ({ ...prev, profile_picture: null }));
      localStorage.removeItem("noha_profile_picture");
      setPhotoMessage(res.data.message || "Profile picture removed.");
    } catch (err) {
      setPhotoError(err.response?.data?.error || "Failed to remove photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Loading profile...
      </div>
    );
  }

  const initial = (form.username || "U").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Profile</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your personal details, photo, transaction PIN, and login password.
        </p>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            {form.profile_picture ? (
              <img
                src={form.profile_picture}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white/20"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-3xl font-bold ring-4 ring-white/20 backdrop-blur-md">
                {initial}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-2 text-white shadow-lg ring-4 ring-slate-900 hover:bg-emerald-600 disabled:opacity-60"
              title="Upload photo"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{form.full_name || form.username}</h2>
            <p className="text-indigo-200">@{form.username}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
              <Shield size={14} /> Tier: {form.user_tier}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-60"
              >
                {photoUploading ? "Uploading..." : "Upload Photo"}
              </button>

              {form.profile_picture && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={photoUploading}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30 disabled:opacity-60"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>
        </div>
      </div>

      {(photoMessage || photoError) && (
        <div className={`flex items-start gap-3 rounded-2xl p-4 text-sm ${photoMessage ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300"}`}>
          {photoMessage ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="font-medium">{photoMessage || photoError}</p>
        </div>
      )}

      {/* Identity Form */}
      <form onSubmit={handleProfileSave} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
          <User size={20} className="text-indigo-600 dark:text-indigo-400" /> Personal Information
        </div>

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="font-medium">{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
            <input
              type="tel"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-indigo-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Profile Details"}
        </button>
      </form>
      {/* Reseller Upgrade Card */}
<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
  <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
    <div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        Reseller Upgrade
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Unlock cheaper bulk pricing on Data, Cable and utility services.
      </p>
    </div>

    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        form.user_tier === "RESELLER"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {form.user_tier || "REGULAR"}
    </span>
  </div>

  {form.user_tier === "RESELLER" ? (
    <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
      ✅ Your account is already on Reseller tier. You now get discounted service pricing automatically.
    </div>
  ) : (
    <form onSubmit={handleResellerUpgrade} className="space-y-4">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
        <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
          One-time upgrade fee: ₦1,000.00
        </p>
        <ul className="mt-2 space-y-1 text-sm text-indigo-900/90 dark:text-indigo-100/90">
          <li>• Instant activation after successful payment</li>
          <li>• Access reseller pricing on eligible plans</li>
          <li>• Fee is deducted from your NOHASub wallet</li>
        </ul>
      </div>

      {upgradeMessage && (
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p className="font-medium">{upgradeMessage}</p>
        </div>
      )}

      {upgradeError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="font-medium">{upgradeError}</p>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Confirm with 4-Digit Transaction PIN
        </label>
        <input
          type="password"
          maxLength={4}
          value={upgradePin}
          onChange={(e) => setUpgradePin(e.target.value)}
          placeholder="••••"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm tracking-widest text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-indigo-400"
        />
      </div>

      <button
        type="submit"
        disabled={upgradeSaving || upgradePin.length !== 4}
        className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {upgradeSaving ? "Upgrading..." : "Upgrade to Reseller (₦1,000)"}
      </button>
    </form> )}
    </div>

      {/* Transaction PIN Form */}
      <form onSubmit={handlePinChange} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
          <Shield size={20} className="text-emerald-600 dark:text-emerald-400" /> Transaction PIN
        </div>

        {pinMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="font-medium">{pinMessage}</p>
          </div>
        )}
        {pinError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <p className="font-medium">{pinError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Current PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pinForm.old_pin}
              onChange={(e) => setPinForm({ ...pinForm, old_pin: e.target.value })}
              placeholder="••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 tracking-widest outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">New PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pinForm.new_pin}
              onChange={(e) => setPinForm({ ...pinForm, new_pin: e.target.value })}
              placeholder="••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 tracking-widest outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pinForm.confirm_pin}
              onChange={(e) => setPinForm({ ...pinForm, confirm_pin: e.target.value })}
              placeholder="••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 tracking-widest outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-emerald-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pinSaving}
          className="mt-6 flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {pinSaving ? "Updating PIN..." : "Update Transaction PIN"}
        </button>
      </form>

      {/* Login Password Form */}
      <form onSubmit={handlePasswordChange} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-bold text-slate-800 dark:border-slate-800 dark:text-white">
          <KeyRound size={20} className="text-blue-600 dark:text-blue-400" /> Login Password
        </div>

        {passMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="font-medium">{passMessage}</p>
          </div>
        )}
        {passError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <p className="font-medium">{passError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
            <input
              type="password"
              value={passForm.old_password}
              onChange={(e) => setPassForm({ ...passForm, old_password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</label>
            <input
              type="password"
              value={passForm.new_password}
              onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
            <input
              type="password"
              value={passForm.confirm_password}
              onChange={(e) => setPassForm({ ...passForm, confirm_password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 dark:focus:border-blue-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={passSaving}
          className="mt-6 flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {passSaving ? "Updating Password..." : "Change Login Password"}
        </button>
      </form>
    </div>
  );
}