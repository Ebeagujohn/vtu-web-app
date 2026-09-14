import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Smartphone,
  Wifi,
  Zap,
  Tv,
  History,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";

const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/wallet", label: "Wallet", icon: Wallet },
  { to: "/app/airtime", label: "Airtime", icon: Smartphone },
  { to: "/app/data", label: "Data", icon: Wifi },
  { to: "/app/electricity", label: "Electricity", icon: Zap },
  { to: "/app/cable", label: "Cable TV", icon: Tv },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/profile", label: "Profile", icon: User },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const username = localStorage.getItem("noha_username") || "User";
  const { theme, toggleTheme } = useTheme();

  // 🌟 Live Wallet data from Global Context (updates instantly after purchases)
  const { balance, profilePicture } = useWallet();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu automatically when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("noha_user_token");
    localStorage.removeItem("noha_username");
    localStorage.removeItem("noha_profile_picture");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold transition ${
      isActive
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-slate-500 dark:text-slate-400"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
          <Link to="/app" className="text-xl font-extrabold tracking-tight">
            <span className="text-slate-900 dark:text-white">NOHA</span>
            <span className="text-emerald-600">Sub</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header
          className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/95"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
                type="button"
                aria-label="Open menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="truncate text-base font-extrabold sm:text-lg lg:hidden">
                <span className="text-slate-900 dark:text-white">NOHA</span>
                <span className="text-emerald-600">Sub</span>
              </div>

              <div className="hidden min-w-0 sm:block">
                <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back</p>
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {username}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              {/* Live Balance Pill (Auto-refreshes via WalletContext) */}
              <div className="max-w-[42vw] truncate rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 sm:max-w-none sm:px-3 sm:text-sm">
                {balance === null
                  ? "₦--"
                  : `₦${parseFloat(balance).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}`}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
                title="Toggle Light/Dark Theme"
                type="button"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Profile Avatar */}
              <Link
                to="/app/profile"
                className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-bold text-white ring-2 ring-slate-200 dark:bg-slate-700 dark:ring-slate-600"
                aria-label="Open profile"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  username.charAt(0).toUpperCase()
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Slide-Down Menu */}
          {mobileOpen && (
            <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
              <nav className="grid grid-cols-2 gap-2">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMobileOpen(false)}
                    className={linkClass}
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </nav>
            </div>
          )}
        </header>

        {/* Dynamic Page Content */}
        <main
          className="min-h-[calc(100vh-3.5rem)] bg-slate-50 px-3 py-4 transition-colors dark:bg-slate-950 sm:px-6 sm:py-6 lg:min-h-[calc(100vh-4rem)] lg:pb-8"
          style={{
            paddingBottom: "calc(6.5rem + env(safe-area-inset-bottom))",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid h-16 grid-cols-5 gap-1 px-1 pt-1">
          <NavLink to="/app" end className={mobileLinkClass}>
            <LayoutDashboard size={20} />
            Home
          </NavLink>
          <NavLink to="/app/wallet" className={mobileLinkClass}>
            <Wallet size={20} />
            Wallet
          </NavLink>
          <NavLink to="/app/airtime" className={mobileLinkClass}>
            <Smartphone size={20} />
            Airtime
          </NavLink>
          <NavLink to="/app/history" className={mobileLinkClass}>
            <History size={20} />
            History
          </NavLink>
          <NavLink to="/app/profile" className={mobileLinkClass}>
            <User size={20} />
            Profile
          </NavLink>
        </div>
      </nav>
    </div>
  );
}