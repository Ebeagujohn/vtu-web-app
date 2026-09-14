import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, Zap } from "lucide-react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await API.post("/auth/login/", { username, password });
      localStorage.setItem("noha_user_token", response.data.token);
      localStorage.setItem("noha_username", response.data.username);
      navigate("/app");
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Invalid username or password credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white transition-colors dark:bg-slate-950">
      {/* LEFT PANEL */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 dark:bg-slate-900 lg:flex border-r border-slate-800">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-600/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"></div>

        <div className="relative z-10">
          <Link to="/" className="text-3xl font-extrabold tracking-tight text-white">
            NOHA<span className="text-emerald-500">Sub</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
            Manage your digital life seamlessly.
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Secure, fast, and automated utility payments. Log in to access your wallet and dashboard.
          </p>
          <div className="mt-10 flex gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <ShieldCheck size={16} className="text-emerald-400" /> Bank-grade Security
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <Zap size={16} className="text-emerald-400" /> Instant Settlement
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          © {new Date().getFullYear()} NOHASub Technologies.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <div className="mb-6 text-3xl font-extrabold tracking-tight lg:hidden">
              <span className="text-slate-900 dark:text-white">NOHA</span><span className="text-emerald-600">Sub</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-400 dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-70 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 lg:text-left">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline dark:text-emerald-400">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;