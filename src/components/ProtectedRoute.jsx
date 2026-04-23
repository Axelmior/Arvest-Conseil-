import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Garde de route : redirige vers /login si non authentifié.
 * Préserve la destination demandée pour rediriger après connexion.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Pendant la restauration de la session, on affiche un loader
  // pour éviter tout flash d'écran blanc ou redirection prématurée.
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

  return children;
}
