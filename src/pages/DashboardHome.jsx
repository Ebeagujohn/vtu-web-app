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
} from "lucide-react";

const actions = [
  { to: "/app/wallet", title: "Fund Wallet", desc: "Top up via virtual account", icon: Wallet, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" },
  { to: "/app/airtime", title: "Buy Airtime", desc: "MTN, Airtel, Glo, 9mobile", icon: Smartphone, color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" },
  { to: "/app/data", title: "Buy Data", desc: "Affordable data bundles", icon: Wifi, color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" },
  { to: "/app/electricity", title: "Pay Electricity", desc: "Prepaid token & postpaid", icon: Zap, color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" },
  { to: "/app/cable", title: "TV Subscription", desc: "DStv, GOtv, Startimes", icon: Tv, color: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300" },
  { to: "/app/history", title: "History", desc: "Receipts & ledger audit", icon: History, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  { to: "/app/profile", title: "Profile", desc: "Account & PIN settings", icon: User, color: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" },
];

export default function DashboardHome() {
  const username = localStorage.getItem("noha_username") || "User";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Hello, {username} 👋
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          What would you like to do on NOHASub today?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map(({ to, title, desc, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-slate-300 transition group-hover:text-emerald-600 dark:text-slate-600 dark:group-hover:text-emerald-400"
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}