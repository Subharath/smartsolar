import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import Login from "../pages/auth/Login";
import BackofficeDashboard from "../pages/dashboard/BackofficeDashboard";
import OperatorDashboard from "../pages/dashboard/OperatorDashboard";
import UsersPage from "../pages/users/UsersPage";
import ProsumersPage from "../pages/prosumers/ProsumersPage";
import NodesPage from "../pages/nodes/NodesPage";
import ReservationsPage from "../pages/bookings/ReservationsPage";
import OperatorBookingsPage from "../pages/bookings/OperatorBookingsPage";
import OperatorNodesPage from "../pages/nodes/OperatorNodesPage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import NotFoundPage from "../pages/NotFoundPage";


function HomeRedirect() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offWhite">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={
        user.role === "Backoffice"
          ? "/backoffice/dashboard"
          : "/operator/dashboard"
      }
      replace
    />
  );
}

function AppRoutes() {
  return (
    <>
     
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeRedirect />} />

        {/* Backoffice routes */}
        <Route element={<ProtectedRoute allowedRoles={["Backoffice"]} />}>
          <Route element={<AppLayout />}>
            <Route
              path="/backoffice/dashboard"
              element={<BackofficeDashboard />}
            />
            <Route path="/backoffice/users" element={<UsersPage />} />
            <Route path="/backoffice/prosumers" element={<ProsumersPage />} />
            <Route path="/backoffice/nodes" element={<NodesPage />} />
            <Route
              path="/backoffice/reservations"
              element={<ReservationsPage />}
            />
          </Route>
        </Route>

        {/* Grid Operator routes */}
        <Route element={<ProtectedRoute allowedRoles={["GridOperator"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/operator/dashboard" element={<OperatorDashboard />} />
            <Route
              path="/operator/bookings"
              element={<OperatorBookingsPage />}
            />
            <Route path="/operator/nodes" element={<OperatorNodesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default AppRoutes;
