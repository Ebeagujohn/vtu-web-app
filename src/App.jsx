import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Airtime from "./pages/Airtime";
import Data from "./pages/Data";
import Electricity from "./pages/Electricity";
import Cable from "./pages/Cable";
import Wallet from "./pages/Wallet";
import History from "./pages/History";
import Profile from "./pages/Profile";
import DashboardHome from "./pages/DashboardHome";
import DashboardLayout from "./components/DashboardLayout";
import { 
  Smartphone, Wifi, Zap, Tv, 
  ShieldCheck, Clock, CreditCard, 
  ChevronDown, ArrowRight, Star, CheckCircle2 
} from "lucide-react";
import { useState } from "react";


// Safe Auth Check
const isAuthenticated = () => {
  return !!localStorage.getItem("noha_user_token");
};

// Route Protection Guards
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/app" replace />;
  }
  return children;
}

// 🌟 PREMIUM PUBLIC LANDING PAGE
function PublicLanding() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How fast are wallet deposits processed?",
      a: "Wallet deposits via our virtual accounts (Moniepoint/Wema) are fully automated and reflect in your balance within seconds of a successful bank transfer.",
    },
    {
      q: "Are there hidden charges on utility payments?",
      a: "No! We charge zero convenience fees on Airtime and Data. Wallet funding incurs a standard 1% gateway fee. What you see is exactly what you pay.",
    },
    {
      q: "Can I become a reseller and get cheaper rates?",
      a: "Yes! You can upgrade your account to the Reseller Tier from your profile page to unlock discounted wholesale pricing on Data and Cable packages.",
    },
    {
      q: "What happens if a transaction fails?",
      a: "If a network provider fails to deliver your value after a wallet deduction, our system automatically flags it for a rapid refund back to your NOHASub wallet.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            NOHA<span className="text-emerald-600">Sub</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/login"
              className="hidden px-4 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 sm:block"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-20 dark:bg-slate-900 lg:pt-24 lg:pb-28">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-emerald-100/50 to-transparent dark:from-emerald-900/20"></div>
        <div className="mx-auto max-w-7xl px-4 relative z-10 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Instant & Automated VTU
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Pay your bills.<br />
                <span className="text-emerald-600">Zero delays.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
                Join thousands of Nigerians using NOHASub to buy cheap data, recharge airtime, and pay electricity bills instantly from one secure wallet.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>

            {/* Hero Visual (Mockup Card) */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500 to-blue-500 opacity-20 blur-2xl"></div>
              <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Live Wallet</p>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">₦24,500.00</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Active</div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { icon: Smartphone, label: "Airtime", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400" },
                    { icon: Wifi, label: "Data", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400" },
                    { icon: Zap, label: "Electricity", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400" },
                    { icon: Tv, label: "Cable TV", color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                      <div className={`rounded-full p-3 ${item.color}`}>
                        <item.icon size={24} />
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</p>
                    </div>
                  ))}
                </div>
                <Link to="/register" className="mt-6 block w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                  Fund Wallet Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT WE DO (Services) */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-emerald-600 font-bold tracking-wide uppercase text-sm mb-2">What We Do</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Everything you need, in one powerful wallet.
            </h3>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Airtime Top-Up", desc: "Instant recharge for MTN, Airtel, Glo, and 9mobile with zero hidden fees.", icon: Smartphone },
              { title: "Data Bundles", desc: "Stay connected with affordable, fast, and automated internet data plans.", icon: Wifi },
              { title: "Electricity Bills", desc: "Generate prepaid meter tokens instantly across all Nigerian DisCos.", icon: Zap },
              { title: "TV Subscriptions", desc: "Never miss a show. Renew DStv, GOtv, and Startimes in seconds.", icon: Tv },
            ].map((service, idx) => (
              <div key={idx} className="group relative rounded-3xl border border-slate-200 bg-white p-8 transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 hover:-translate-y-1">
                <div className="mb-6 inline-flex rounded-2xl bg-emerald-50 p-4 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 transition group-hover:scale-110">
                  <service.icon size={28} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{service.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHO WE ARE (Trust Signals) */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-emerald-600 font-bold tracking-wide uppercase text-sm mb-2">Who We Are</h2>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl mb-6">
                Built for speed, engineered for trust.
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
                NOHASub is a premium technology platform dedicated to making everyday utility payments effortless for Nigerians. We combine bank-grade security with a seamless user experience.
              </p>
              <ul className="space-y-5">
                {[
                  { title: "Automated Wallet Funding", desc: "Get a dedicated account number. Transfer money, and your wallet is credited instantly.", icon: CreditCard },
                  { title: "Bank-Grade Security", desc: "All transactions are secured with military-grade encryption and 4-digit PIN authorizations.", icon: ShieldCheck },
                  { title: "24/7 Service Uptime", desc: "Our automated servers route your payments across multiple gateways to ensure delivery.", icon: Clock },
                ].map((feature, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{feature.title}</h4>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-100 to-teal-100 opacity-50 blur-2xl dark:from-emerald-900/30 dark:to-teal-900/30"></div>
              <div className="relative rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
                <div className="mb-6 flex gap-1 text-amber-400">
                  <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
                </div>
                <blockquote className="text-xl font-medium leading-relaxed sm:text-2xl">
                  "NOHASub completely changed how I run my business. The wallet funding is instant, and my electricity tokens arrive in seconds. Highly recommended!"
                </blockquote>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 font-bold text-white text-lg">AJ</div>
                  <div>
                    <p className="font-bold">Adebayo J.</p>
                    <p className="text-sm text-slate-400">Verified Reseller</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform duration-200 ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-emerald-600 px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/50 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-700/50 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to simplify your payments?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
                Join NOHASub today. Set up your wallet in 60 seconds and start enjoying seamless transactions immediately.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="rounded-2xl bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50 hover:scale-105"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            NOHA<span className="text-emerald-600">Sub</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} NOHASub Technologies. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link to="/register" className="hover:text-emerald-600">Sign Up</Link>
            <Link to="/login" className="hover:text-emerald-600">Log In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES (Incognito / Logged Out) */}
      <Route path="/" element={<PublicOnlyRoute><PublicLanding /></PublicOnlyRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

      {/* 2. PROTECTED DASHBOARD APP SHELL (Logged In) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="airtime" element={<Airtime />} />
        <Route path="data" element={<Data />} />
        <Route path="electricity" element={<Electricity />} />
        <Route path="cable" element={<Cable />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Legacy Fallback Redirects */}
      <Route path="/wallet" element={<Navigate to="/app/wallet" replace />} />
      <Route path="/airtime" element={<Navigate to="/app/airtime" replace />} />
      <Route path="/data" element={<Navigate to="/app/data" replace />} />
      <Route path="/electricity" element={<Navigate to="/app/electricity" replace />} />
      <Route path="/cable" element={<Navigate to="/app/cable" replace />} />
      <Route path="/history" element={<Navigate to="/app/history" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />

      {/* Catch-all Wildcard Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}