import layerOne from "../../assets/herolayer_one.png";
import layerTwo from "../../assets/herolayer_two.png";
import { Zap, UserRound, CalendarDays, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

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
      } else if (loggedUser.role === "Prosumer") {
        setError("Prosumers access via the native Android mobile application. This portal is for Backoffice & Grid Operators.");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Invalid email/NIC or password.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError("");
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-offWhite">
      {/* Top Header */}
      <div className="absolute flex justify-between items-center top-0 left-0 z-30 w-full px-6 py-5 sm:px-10 lg:px-28">
        <img
          src="/logo.png"
          alt="Solar Grid"
          className="h-12 w-auto sm:h-14 lg:h-16"
        />

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-xs text-white/90 font-space">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Central Web API Active</span>
        </div>
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
        <div className="grid h-full grid-cols-1 lg:grid-cols-[3fr_2fr]">
          {/* LEFT COLUMN: Hero info */}
          <div className="relative hidden lg:flex items-end pl-24 xl:pl-40 pb-16">
            <div
              className="pointer-events-none absolute left-[-100px] top-1/2 h-[1000px] w-[1000px] -translate-y-1/2
              rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_30%,rgba(0,0,0,0.15)_55%,transparent_72%)]"
            />

            <div className="relative z-10">
              <h1 className="font-space text-5xl xl:text-6xl font-medium leading-tight text-white">
                Microgrid <span className="text-yellow-400">Operations</span>
                <br />& Energy <span className="text-yellow-400">Management</span>
              </h1>

              {/* Feature glass badges */}
              <div className="mt-8 flex w-fit items-center gap-6 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 shadow-lg shadow-black/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="font-space text-xs leading-tight text-white">
                    Node<br />Management
                  </span>
                </div>
                <div className="h-8 w-px bg-white/30" />
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-yellow-500" />
                  <span className="font-space text-xs leading-tight text-white">
                    Prosumer<br />Management
                  </span>
                </div>
                <div className="h-8 w-px bg-white/30" />
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-yellow-500" />
                  <span className="font-space text-xs leading-tight text-white">
                    Reservation<br />Management
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Single clean login card */}
          <div className="flex items-center lg:items-end justify-center lg:justify-end px-6 lg:pr-24 xl:pr-40 pb-12">
            <div className="w-full max-w-[380px] rounded-2xl border border-white/20 bg-black/60 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
              {/* Header */}
              <div className="text-center">
                <h2 className="font-space text-2xl font-semibold text-white">
                  Portal Login
                </h2>
                <p className="mt-1 font-space text-[13px] text-emerald-300">
                  Backoffice Administration & Grid Operators
                </p>
              </div>

              <form onSubmit={handleLogin} className="mt-5">
                {/* Error Alert */}
                {error && (
                  <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-2 font-space text-xs text-red-200 backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {/* Email / NIC */}
                <div>
                  <label className="font-space text-[13px] text-white/80">
                    Email or NIC Number
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@smartsolar.lk"
                    required
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/20 bg-white/10 px-3 font-space text-xs text-white placeholder-white/40 outline-none backdrop-blur-md focus:border-green-400 focus:bg-white/20 transition"
                  />
                </div>

                {/* Password */}
                <div className="mt-3.5">
                  <label className="font-space text-[13px] text-white/80">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="mt-1.5 h-10 w-full rounded-lg border border-white/20 bg-white/10 px-3 font-space text-xs text-white placeholder-white/40 outline-none backdrop-blur-md focus:border-green-400 focus:bg-white/20 transition"
                  />
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-emerald-400/50 bg-gradient-to-r from-emerald-600 to-emerald-500 font-space text-[13px] font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:scale-[1.01] hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating with Web API...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Credentials */}
              <div className="mt-6 pt-4 border-t border-white/15">
                <p className="text-[11px] font-space text-white/60 text-center mb-2">
                  Quick Demo Access (Click to autofill):
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin@smartsolar.lk", "Admin@123")}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] font-space text-emerald-300 transition text-center cursor-pointer"
                  >
                    👑 Backoffice Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("operator@smartsolar.lk", "Operator@123")}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] font-space text-yellow-300 transition text-center cursor-pointer"
                  >
                    ⚡ Grid Operator
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
