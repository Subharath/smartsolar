import layerOne from "../../assets/herolayer_one.png";
import layerTwo from "../../assets/herolayer_two.png";
import { Zap, UserRound, CalendarDays, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email/NIC and password.");
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === "Backoffice") {
        navigate("/backoffice/dashboard");
      } else if (loggedUser.role === "GridOperator") {
        navigate("/operator/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Invalid email/NIC or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-offWhite">
      <div className="absolute  flex justify-between items-center top-0 left-0 z-30 w-full px-6 py-5 sm:px-10 lg:px-28">
        <img
          src="/logo.png"
          alt="Solar Grid"
          className="h-12 w-auto sm:h-14 lg:h-16"
        />

        <button className="group relative hover:cursor-pointer h-12 w-40 overflow-hidden rounded-full border-2 border-yellow-400 bg-yellow-400 font-space">
          <span className="absolute left-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black text-xl text-white transition-transform duration-500 ease-in-out group-hover:translate-x-[88px]">
            →
          </span>

          <span className="absolute left-[58px] top-1/2 -translate-y-1/2 whitespace-nowrap text-black transition-transform duration-500 ease-in-out group-hover:-translate-x-[55px]">
            Contact us
          </span>
        </button>
      </div>
      <img
        src={layerOne}
        alt="Layer One"
        className="absolute inset-0 z-0 w-full h-full object-cover"
      />
      <div className="w-full flex justify-center top-10 absolute font-space">
        <h1 className="absolute z-10 text-[clamp(3.5rem,20vw,13.75rem)] text-white">
          SOLAR <span className="text-yellow-400">GRID</span>
        </h1>
      </div>

      <img
        src={layerTwo}
        alt="Layer Two"
        className="absolute inset-0 z-20 w-full h-full object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 z-30 h-3/4">
        <div className="grid h-full grid-cols-[3fr_2fr]">
          {/* LEFT COLUMN */}
          <div className="relative flex items-end pl-40 pb-20">
            {/* Dark circular glow */}
            <div
              className="pointer-events-none absolute left-[-100px]  top-1/2 h-[1000px] w-[1000px] -translate-y-1/2
              rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_30%,rgba(0,0,0,0.15)_55%,transparent_72%)] "
            />

            {/* Hero content */}
            <div className="relative z-10">
              <h1 className="font-space text-6xl font-medium leading-tight text-white">
                Microgrid <span className="text-yellow-400">Operations</span>
                <br />& Energy{" "}
                <span className="text-yellow-400">Management</span>
              </h1>

              {/* Feature glass card */}
              <div className="mt-8 flex w-fit items-center gap-6 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 shadow-lg shadow-black/10 backdrop-blur-md">
                {/* Node */}
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />

                  <span className="font-space text-xs leading-tight text-white">
                    Node
                    <br />
                    Management
                  </span>
                </div>

                <div className="h-8 w-px bg-white/30" />

                {/* Prosumer */}
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-yellow-500" />

                  <span className="font-space text-xs leading-tight text-white">
                    Prosumer
                    <br />
                    Management
                  </span>
                </div>

                <div className="h-8 w-px bg-white/30" />

                {/* Reservation */}
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-yellow-500" />

                  <span className="font-space text-xs leading-tight text-white">
                    Reservation
                    <br />
                    Management
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex items-end justify-end pr-40 pb-10">          
              {/* Login card */}
              <div
                className={`perspective w-[360px] ${isLogin ? "h-[380px]" : "h-[480px]"}`}
              >
                <div
                  className={`relative h-full w-full transform-style-preserve-3d transition-transform duration-700 ${
                    isLogin ? "" : "rotate-y-180"
                  }`}
                >
                  {/* ================= LOGIN ================= */}
                  <div className="absolute inset-0 backface-hidden rounded-2xl border border-white/20 bg-black/40 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="text-center">
                        <h2 className="font-space text-2xl font-semibold text-white">
                          Welcome Back
                        </h2>

                        <p className="mt-0.5 font-space text-[13px] text-emerald-300">
                          Sign in to access your information
                        </p>
                      </div>

                      <form onSubmit={handleLogin}>
                        {/* Error Alert */}
                        {error && (
                          <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-1.5 font-space text-xs text-red-200 backdrop-blur-sm">
                            {error}
                          </div>
                        )}

                        {/* Email / NIC */}
                        <div className="mt-4">
                          <label className="font-space text-[13px] text-white/80">
                            Email or NIC Number
                          </label>

                          <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. backoffice@test.com"
                            required
                            className="mt-1 h-9 w-full rounded-lg border border-white/20 bg-white/30 px-3 font-space text-xs text-white placeholder-white/40 outline-none backdrop-blur-md focus:border-green-400"
                          />
                        </div>

                        {/* Password */}
                        <div className="mt-3">
                          <label className="font-space text-[13px] text-white/80">
                            Password
                          </label>

                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="mt-1 h-9 w-full rounded-lg border border-white/20 bg-white/30 px-3 font-space text-xs text-white placeholder-white/40 outline-none backdrop-blur-md focus:border-green-400"
                          />
                        </div>

                        {/* Login */}
                        <button
                          type="submit"
                          disabled={loading}
                          className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-700 to-emerald-500 font-space text-[13px] font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:scale-[1.02] hover:from-emerald-600 hover:to-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            <>
                              <KeyRound className="h-3.5 w-3.5" />
                              Login
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    <div>
                      {/* Divider */}
                      <div className="mt-3 mb-2 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/40" />

                        <span className="font-space text-[9px] text-white">
                          OR
                        </span>

                        <div className="h-px flex-1 bg-white/40" />
                      </div>

                      {/* Register */}
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setIsLogin(false);
                        }}
                        className="mx-auto block font-space text-[14px] text-yellow-400 transition-colors hover:text-yellow-300 cursor-pointer"
                      >
                        Register →
                      </button>
                    </div>
                  </div>

                  {/* ================= REGISTER ================= */}
                  <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-2xl border border-white/20 bg-black/40 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    {/* Header */}
                    <div className="text-center">
                      <h2 className="font-space text-2xl font-semibold text-white">
                        Create Account
                      </h2>

                      <p className="mt-0.5 font-space text-[13px] text-emerald-300">
                        Register to access Solar Grid
                      </p>
                    </div>

                    {/* Full Name */}
                    <div className="mt-4">
                      <label className="font-space text-[13px] text-white/80">
                        Full Name
                      </label>

                      <input
                        type="text"
                        className="mt-1 h-8 w-full rounded-lg border border-white/20 bg-white/30 px-3 font-space text-xs text-white outline-none backdrop-blur-md focus:border-green-400"
                      />
                    </div>

                    {/* NIC */}
                    <div className="mt-3">
                      <label className="font-space text-[13px] text-white/80">
                        NIC Number
                      </label>

                      <input
                        type="text"
                        className="mt-1 h-8 w-full rounded-lg border border-white/20 bg-white/30 px-3 font-space text-xs text-white outline-none backdrop-blur-md focus:border-green-400"
                      />
                    </div>

                    {/* Email */}
                    <div className="mt-3">
                      <label className="font-space text-[13px] text-white/80">
                        Email
                      </label>

                      <input
                        type="email"
                        className="mt-1 h-8 w-full rounded-lg border border-white/20 bg-white/30 px-3 font-space text-xs text-white outline-none backdrop-blur-md focus:border-green-400"
                      />
                    </div>

                    {/* Password */}
                    <div className="mt-3">
                      <label className="font-space text-[13px] text-white/80">
                        Password
                      </label>

                      <input
                        type="password"
                        className="mt-1 h-8 w-full rounded-lg border border-white/20 bg-white/30 px-3 font-space text-xs text-white outline-none backdrop-blur-md focus:border-green-400"
                      />
                    </div>

                    {/* Register */}
                    <button
                      type="button"
                      className="mt-5 flex h-8 w-full items-center justify-center rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-700 to-emerald-500 font-space text-[13px] font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:scale-[1.02] hover:from-emerald-600 hover:to-emerald-400"
                    >
                      Register
                    </button>

                    {/* Back */}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="mx-auto mt-4 block font-space text-[13px] text-yellow-400 transition-colors hover:text-yellow-300"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
