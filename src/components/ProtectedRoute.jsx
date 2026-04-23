import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAdmin && !user?.isAuthorized) {
    return <Navigate to="/pending" replace />;
  }

  return children;
}
