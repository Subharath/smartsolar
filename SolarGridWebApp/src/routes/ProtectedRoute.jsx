import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Protects routes that require login.
 * Optionally restricts by role: 'Backoffice' | 'GridOperator'
 */
function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offWhite">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Backoffice') {
      return <Navigate to="/backoffice/dashboard" replace />;
    } else if (user.role === 'GridOperator') {
      return <Navigate to="/operator/dashboard" replace />;
    } else {
      // Prosumer accounts belong to mobile app; send to login with clear state
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-offWhite p-6 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md border border-gray-200">
            <h2 className="text-2xl font-bold text-darkGreen font-space mb-3">Mobile Portal Account</h2>
            <p className="text-gray-600 mb-6 text-sm">
              You are logged in as a <strong>Solar Prosumer ({user.nic})</strong>. Prosumer trading and QR features are exclusively available via the <strong>SolarGrid Mobile App</strong>.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-xl transition cursor-pointer"
            >
              Log in with Operator / Backoffice
            </button>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
