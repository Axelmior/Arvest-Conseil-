import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, LogOut, CheckCircle2, Mail } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function PendingAccess() {
  const { user, isAuthenticated, logout, refreshAuth, requestAccess } = useAuth();
  const navigate = useNavigate();

  const [checking,  setChecking]  = useState(false);
  const [requested, setRequested] = useState(Boolean(user?.requestedAt));
  const [stillWaiting, setStillWaiting] = useState(false);

  // Guard: not logged in → login page
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Guard: already authorized → dashboard
  if (user?.isAuthorized) return <Navigate to="/dashboard" replace />;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleRefresh = async () => {
    setChecking(true);
    setStillWaiting(false);

    const fresh = refreshAuth(); // returns updated user synchronously
    await new Promise((r) => setTimeout(r, 700)); // brief visual feedback

    setChecking(false);

    if (fresh?.isAuthorized) {
      // Activated — go to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      setStillWaiting(true);
    }
  };

  const handleRequest = () => {
    requestAccess();
    setRequested(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
    }}>
      {/* Décor */}
      <div style={{
        position: 'absolute', top: -160, right: -160,
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, #C6A75E 0%, transparent 70%)',
        opacity: 0.05, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -120, left: -120,
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, #1a1a1a 0%, transparent 70%)',
        opacity: 0.03, pointerEvents: 'none',
      }} />

      <div style={{ marginBottom: 40 }}>
        <Logo />
      </div>

      <div style={{
        width: '100%', maxWidth: 460,
        background: 'white',
        border: '1px solid rgba(229,229,229,0.8)',
        borderRadius: 16,
        padding: '40px 36px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(198,167,94,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Clock size={28} color="#C6A75E" />
        </div>

        <h1 style={{
          fontSize: 21, fontWeight: 600, color: '#171717',
          marginBottom: 12, letterSpacing: '-0.01em',
        }}>
          Accès en attente d&apos;activation
        </h1>

        <p style={{ fontSize: 15, color: '#525252', lineHeight: 1.65, marginBottom: 6 }}>
          Votre compte doit être activé par un administrateur.
        </p>
        <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.65, marginBottom: 28 }}>
          Votre demande sera traitée sous 24 heures. Vous pouvez vérifier votre statut à tout moment ci-dessous.
        </p>

        {/* User card */}
        <div style={{
          padding: '12px 14px',
          background: '#fafafa',
          border: '1px solid #e5e5e5',
          borderRadius: 10,
          marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
          textAlign: 'left',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #C6A75E, #B8963F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: 'white',
          }}>
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Utilisateur'}
            </div>
            <div style={{ fontSize: 12, color: '#737373', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <span style={{
            marginLeft: 'auto', flexShrink: 0,
            padding: '2px 8px', borderRadius: 4,
            background: '#fef3c7', color: '#b45309',
            fontSize: 11, fontWeight: 600,
          }}>
            {user?.role || 'user'}
          </span>
        </div>

        {/* Demander accès */}
        {!requested ? (
          <button
            className="btn btn-gold btn-block"
            style={{ marginBottom: 10 }}
            onClick={handleRequest}
          >
            <Mail size={14} />
            Envoyer une demande d&apos;accès
          </button>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '11px 14px', marginBottom: 10,
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid #d1fae5', borderRadius: 10,
          }}>
            <CheckCircle2 size={15} color="#059669" />
            <span style={{ fontSize: 13, color: '#065f46', fontWeight: 500 }}>
              Demande envoyée — en attente de validation
            </span>
          </div>
        )}

        {/* Vérifier statut */}
        <button
          className="btn btn-secondary btn-block"
          style={{ marginBottom: stillWaiting ? 10 : 20 }}
          onClick={handleRefresh}
          disabled={checking}
        >
          <RefreshCw
            size={13}
            style={{ animation: checking ? 'spin 0.8s linear infinite' : 'none' }}
          />
          {checking ? 'Vérification en cours…' : 'Vérifier mon statut'}
        </button>

        {stillWaiting && (
          <p style={{ fontSize: 13, color: '#737373', marginBottom: 16 }}>
            Pas encore activé. Revenez dans quelques instants.
          </p>
        )}

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: '#a3a3a3', padding: '6px 0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#525252')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#a3a3a3')}
        >
          <LogOut size={13} />
          Se déconnecter
        </button>
      </div>

      <p style={{ marginTop: 28, fontSize: 12, color: '#a3a3a3' }}>
        © 2026 Arvest Pilot · Accès sur invitation uniquement · 49 € / mois
      </p>
    </div>
  );
}
