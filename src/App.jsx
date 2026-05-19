import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';

// Chemin critique — chargés immédiatement (petits fichiers, toujours nécessaires)
import LandingPage     from './pages/LandingPage';
import LoginPage       from './pages/LoginPage';
import SignupPage      from './pages/SignupPage';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';
import PendingAccess   from './pages/PendingAccess';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard       from './pages/Dashboard';
import NotFound        from './pages/NotFound';

// Lazy — chargés à la demande (réduisent le bundle initial)
const Sales          = lazy(() => import('./pages/Sales'));
const Expenses       = lazy(() => import('./pages/Expenses'));
const Treasury       = lazy(() => import('./pages/Treasury'));
const Analytics      = lazy(() => import('./pages/Analytics'));
const Settings       = lazy(() => import('./pages/Settings'));
const AdminPanel     = lazy(() => import('./pages/AdminPanel'));
const MentionsLegales  = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.MentionsLegales })));
const Confidentialite  = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.Confidentialite })));
const Conditions       = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.Conditions })));
const Contact          = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.Contact })));

function PageLoader() {
  return (
    <div className="loader-page">
      <div className="spinner" />
    </div>
  );
}

function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-page">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    // Send authorized users to dashboard, pending users to /pending
    return <Navigate to={user?.isAuthorized ? '/dashboard' : '/pending'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"           element={<RedirectIfAuthenticated><LoginPage      /></RedirectIfAuthenticated>} />
        <Route path="/signup"          element={<RedirectIfAuthenticated><SignupPage     /></RedirectIfAuthenticated>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword  />} />

        {/* Legal pages */}
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/confidentialite"  element={<Confidentialite />} />
        <Route path="/conditions"       element={<Conditions />} />
        <Route path="/contact"          element={<Contact />} />

        {/* Pending activation */}
        <Route path="/pending" element={<PendingAccess />} />

        {/* Admin panel — protected, admin-only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Dashboard — protected, requires isAuthorized */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index            element={<Dashboard />} />
          <Route path="sales"     element={<Sales />} />
          <Route path="expenses"  element={<Expenses />} />
          <Route path="treasury"  element={<Treasury />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings"  element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
