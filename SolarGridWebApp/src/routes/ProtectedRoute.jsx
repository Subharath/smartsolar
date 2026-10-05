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
    // Send unauthorized users to their own dashboard
    const redirect =
      user.role === 'Backoffice' ? '/backoffice/dashboard' : '/operator/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
