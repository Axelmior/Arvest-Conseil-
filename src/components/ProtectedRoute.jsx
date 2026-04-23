import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — three-level access guard:
 *
 *  1. Not authenticated        → /login  (state preserved for post-login redirect)
 *  2. requireAdmin + not admin → /       (hard block, no info leak about /admin)
 *  3. Not isAuthorized         → /pending
 *  4. All checks pass          → render children
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loader-page">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin guard — redirect to landing page so /admin existence stays private
  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Authorization guard — skip for admin routes (admins are always authorized)
  if (!requireAdmin && !user?.isAuthorized) {
    return <Navigate to="/pending" replace />;
  }

  return children;
}
