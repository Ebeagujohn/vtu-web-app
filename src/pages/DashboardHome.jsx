import { Link } from "react-router-dom";
import {
  Wallet,
  Smartphone,
  Wifi,
  Zap,
  Tv,
  History,
  User,
  ArrowRight,
  Gift,
  Sparkles,
} from "lucide-react";

const actions = [
  { to: "/app/wallet", title: "Fund Wallet", desc: "Top up via virtual account", icon: Wallet, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200" },
  { to: "/app/airtime", title: "Buy Airtime", desc: "MTN, Airtel, Glo, 9mobile", icon: Smartphone, color: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200" },
  { to: "/app/data", title: "Buy Data", desc: "Affordable data bundles", icon: Wifi, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200" },
  { to: "/app/electricity", title: "Pay Electricity", desc: "Prepaid token & postpaid", icon: Zap, color: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" },
  { to: "/app/cable", title: "TV Subscription", desc: "DStv, GOtv, Startimes", icon: Tv, color: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-200" },
  { to: "/app/history", title: "History", desc: "Receipts & ledger audit", icon: History, color: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100" },
  { to: "/app/profile", title: "Profile", desc: "Account & PIN settings", icon: User, color: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200" },
];

export default function DashboardHome() {
  const username = localStorage.getItem("noha_username") || "User";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* 🌟 PROMOTIONAL ADVERT BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100 backdrop-blur-md">
              <Gift size={14} className="text-amber-300" /> Welcome Bonus Active
            </div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              🎁 ₦10,000.00 Free Testing Money
            </h2>
            <p className="max-w-xl text-sm text-emerald-100/90 sm:text-base">
              Your account has been credited with <strong>₦10,000 demo funds</strong>. Use it to test Airtime, Data, Electricity tokens, and Cable renewals instantly!
            </p>
          </div>

          <Link
            to="/app/airtime"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-800 shadow-md transition hover:bg-emerald-50 hover:scale-105"
          >
            <Sparkles size={18} className="text-amber-500" />
            Test Airtime Now
          </Link>
        </div>
      </div>

      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Hello, {username} 👋
        </h1>
        <p className="mt-1 text-base font-medium text-slate-700 dark:text-slate-300">
          What would you like to do on NOHASub today?
        </p>
      </div>

      {/* Quick Services Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map(({ to, title, desc, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-slate-500 transition group-hover:text-emerald-600 dark:text-slate-400 dark:group-hover:text-emerald-300"
              />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}