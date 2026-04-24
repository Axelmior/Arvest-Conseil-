import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import SignupPage     from './pages/SignupPage';
import PendingAccess  from './pages/PendingAccess';
import AdminPanel     from './pages/AdminPanel';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard      from './pages/Dashboard';
import Sales          from './pages/Sales';
import Expenses       from './pages/Expenses';
import Treasury       from './pages/Treasury';
import Analytics      from './pages/Analytics';
import Settings       from './pages/Settings';
import NotFound       from './pages/NotFound';
import { MentionsLegales, Confidentialite, Conditions, Contact } from './pages/LegalPages';

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
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"  element={<RedirectIfAuthenticated><LoginPage  /></RedirectIfAuthenticated>} />
      <Route path="/signup" element={<RedirectIfAuthenticated><SignupPage /></RedirectIfAuthenticated>} />

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
        <Route index      element={<Dashboard />} />
        <Route path="sales"     element={<Sales />} />
        <Route path="expenses"  element={<Expenses />} />
        <Route path="treasury"  element={<Treasury />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings"  element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
