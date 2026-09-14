import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { User, Mail, Phone, Lock, Shield, AlertCircle, ArrowRight, ShieldCheck, Zap } from "lucide-react";

function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await API.post("/auth/register/", {
        username, email, password, full_name: fullName, phone_number: phoneNumber, transaction_pin: transactionPin,
      });
      localStorage.setItem("noha_user_token", response.data.token);
      localStorage.setItem("noha_username", response.data.username);
      navigate("/app");
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(Object.values(error.response.data).flat().join(" "));
      } else {
        setErrorMessage("Network error: Server connection timed out.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white transition-colors dark:bg-slate-950">
      {/* LEFT PANEL */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 dark:bg-slate-900 lg:flex border-r border-slate-800">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-600/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
        <div className="relative z-10">
          <Link to="/" className="text-3xl font-extrabold tracking-tight text-white">NOHA<span className="text-emerald-500">Sub</span></Link>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Join the future of payments.</h1>
          <p className="mt-6 text-lg text-slate-300">Create your free account today and experience lightning-fast transactions with zero hidden fees.</p>
          <div className="mt-10 flex gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <ShieldCheck size={16} className="text-emerald-400" /> Secure Wallet
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <Zap size={16} className="text-emerald-400" /> 24/7 Availability
            </div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-slate-400">© {new Date().getFullYear()} NOHASub Technologies.</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full flex-col overflow-y-auto px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="my-auto mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-6 text-3xl font-extrabold tracking-tight lg:hidden">
              <span className="text-slate-900 dark:text-white">NOHA</span><span className="text-emerald-600">Sub</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create account</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Get started absolutely free.</p>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"><User size={18} /></div>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"><User size={18} /></div>
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"><Mail size={18} /></div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"><Phone size={18} /></div>
                  <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="08012345678" maxLength={11} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">4-Digit PIN</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"><Shield size={18} /></div>
                  <input type="password" maxLength="4" required value={transactionPin} onChange={(e) => setTransactionPin(e.target.value)} placeholder="••••" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm tracking-widest text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400"><Lock size={18} /></div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-70 dark:bg-emerald-600 dark:hover:bg-emerald-500">
              {isLoading ? "Creating Account..." : "Create Account"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 lg:text-left">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-emerald-600 hover:underline dark:text-emerald-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;