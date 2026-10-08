import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Determine the correct dashboard route for the logged-in user
  const dashboardRoute = isAuthenticated
    ? user?.role === 'Backoffice'
      ? '/backoffice/dashboard'
      : '/operator/dashboard'
    : '/login';

  const dashboardLabel = isAuthenticated ? 'Back to Dashboard' : 'Back to Login';

  function handleGoBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(dashboardRoute);
    }
  }

  return (
    <div className="relative h-screen max-h-screen w-full overflow-hidden bg-white flex flex-col items-center justify-center selection:bg-leaf/20 px-4">
      {/* ── Subtle Microgrid Pattern (Extremely faint, 0.025 opacity) ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(#073F32 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* ── Decorative Edge Glows (Kept far at the edges, center stays pure white) ── */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-emerald-100/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-yellow-100/40 blur-3xl"
        aria-hidden="true"
      />

      {/* ── Main Content Container ─────────────────────── */}
      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center py-2 sm:py-4 text-center">
        {/* 1. 404 Typography */}
        <h1 className="font-space font-extrabold text-6xl sm:text-7xl md:text-8xl tracking-tight leading-none bg-gradient-to-r from-emerald-800 via-emerald-500 to-yellow-400 bg-clip-text text-transparent select-none">
          404
        </h1>

        {/* 2. Animated GIF */}
        <img
          src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
          alt="Page not found illustration"
          className="w-auto max-h-[220px] sm:max-h-[260px] md:max-h-[290px] object-contain select-none pointer-events-none"
          loading="eager"
        />

        {/* 3. Heading */}
        <h2 className="font-space font-bold text-xl sm:text-2xl md:text-3xl text-[#17352D] tracking-tight -mt-2 sm:-mt-4 mb-6 sm:mb-8">
          Page not found
        </h2>

        {/* 5. Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4 sm:px-0">
          {/* Primary: Back to Dashboard */}
          <button
            type="button"
            id="notfound-btn-dashboard"
            onClick={() => navigate(dashboardRoute)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-space font-semibold text-sm text-white bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-900 hover:to-emerald-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:scale-[0.98]"
          >

            {dashboardLabel}
          </button>

          {/* Secondary: Go Back */}
          <button
            type="button"
            id="notfound-btn-goback"
            onClick={handleGoBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-900/10 bg-white px-6 py-3 font-space font-medium text-sm text-emerald-900 transition hover:bg-emerald-50 cursor-pointer active:scale-[0.98]"
          >
            <svg
              className="w-4 h-4 text-emerald-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>
      </main>
    </div>
  );
}
