import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, LogOut, CheckCircle2, Mail } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function PendingAccess() {
  const { user, logout, refreshAuth, requestAccess } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [requested, setRequested] = useState(Boolean(user?.requestedAt));
  const [checked, setChecked]     = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleRefresh = async () => {
    setChecking(true);
    setChecked(false);
    refreshAuth();
    await new Promise((r) => setTimeout(r, 800));
    setChecking(false);
    setChecked(true);
    // If now authorized, ProtectedRoute will redirect automatically on next render
    // Force a re-check by navigating to dashboard
    setTimeout(() => navigate('/dashboard', { replace: true }), 300);
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
      {/* Fond décoratif */}
      <div style={{
        position: 'absolute', top: -160, right: -160,
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, #C6A75E 0%, transparent 70%)',
        opacity: 0.05, pointerEvents: 'none',
      }} />

      <div style={{ marginBottom: 48 }}>
        <Logo />
      </div>

      <div style={{
        width: '100%', maxWidth: 480,
        background: 'white',
        border: '1px solid rgba(229,229,229,0.8)',
        borderRadius: 16,
        padding: 40,
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
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

        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#171717', marginBottom: 12, letterSpacing: '-0.01em' }}>
          Accès en attente d&apos;activation
        </h1>

        <p style={{ fontSize: 15, color: '#525252', lineHeight: 1.6, marginBottom: 8 }}>
          Votre compte doit être activé par un administrateur.
        </p>
        <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.6, marginBottom: 32 }}>
          Vous recevrez un accès dès validation de votre demande.
          Cela prend généralement moins de 24 heures.
        </p>

        {/* Compte connecté */}
        <div style={{
          padding: '12px 16px',
          background: '#fafafa',
          border: '1px solid #e5e5e5',
          borderRadius: 10,
          marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #C6A75E, #B8963F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0,
          }}>
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Utilisateur'}
            </div>
            <div style={{ fontSize: 12, color: '#737373', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Bouton demander accès */}
        {!requested ? (
          <button
            className="btn btn-gold btn-block"
            style={{ marginBottom: 12 }}
            onClick={handleRequest}
          >
            <Mail size={15} />
            Envoyer une demande d&apos;accès
          </button>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px', background: 'rgba(16,185,129,0.06)',
            border: '1px solid #d1fae5', borderRadius: 10, marginBottom: 12,
            justifyContent: 'center',
          }}>
            <CheckCircle2 size={16} color="#059669" />
            <span style={{ fontSize: 13, color: '#065f46', fontWeight: 500 }}>
              Demande envoyée — en attente de validation
            </span>
          </div>
        )}

        {/* Vérifier statut */}
        <button
          className="btn btn-secondary btn-block"
          style={{ marginBottom: 12 }}
          onClick={handleRefresh}
          disabled={checking}
        >
          <RefreshCw size={14} style={{ animation: checking ? 'spin 0.8s linear infinite' : 'none' }} />
          {checking ? 'Vérification…' : checked ? 'Statut vérifié' : 'Vérifier mon statut'}
        </button>

        {checked && (
          <p style={{ fontSize: 13, color: '#737373', marginBottom: 12 }}>
            Votre compte n&apos;est pas encore activé. Revenez dans quelques instants.
          </p>
        )}

        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: '#737373', padding: '8px 0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#171717'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#737373'}
        >
          <LogOut size={13} />
          Se déconnecter
        </button>
      </div>

      <p style={{ marginTop: 32, fontSize: 13, color: '#a3a3a3' }}>
        © 2026 Arvest Pilot · Accès sur invitation uniquement
      </p>
    </div>
  );
}
