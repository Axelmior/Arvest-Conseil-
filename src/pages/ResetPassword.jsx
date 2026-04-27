import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-icon-wrapper">
      <Lock size={16} className="icon" />
      <input
        type={show ? 'text' : 'password'}
        className="input"
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••'}
        autoComplete={autoComplete}
        style={{ paddingRight: 40 }}
      />
      <button type="button" className="auth-eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Masquer' : 'Afficher'}>
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export default function ResetPassword() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const { resetPassword } = useAuth();

  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [pw1,     setPw1]     = useState('');
  const [pw2,     setPw2]     = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const invalid = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (pw1.length < 8) { setError('8 caractères minimum.'); return; }
    if (pw1 !== pw2)    { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      resetPassword(token, email, pw1);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err.message || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-side-bg-1" aria-hidden="true" />
        <div className="auth-side-bg-2" aria-hidden="true" />
        <div className="auth-side-inner">
          <Logo light />
          <div style={{ marginTop: 48 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.8 }}>
              Choisissez un mot de passe fort d'au moins 8 caractères pour sécuriser votre compte.
            </p>
          </div>
          <div className="auth-side-footer">© 2026 Arvest Pilot</div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo"><Logo /></div>
          <Link to="/login" className="auth-back"><ArrowLeft size={14} />Retour à la connexion</Link>

          {invalid ? (
            <div style={{ textAlign: 'center', paddingTop: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
              <h1 className="auth-title">Lien invalide</h1>
              <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.7, marginBottom: 24 }}>
                Ce lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien.
              </p>
              <Link to="/forgot-password" className="btn btn-primary btn-lg btn-block" style={{ textAlign: 'center', display: 'block' }}>
                Demander un nouveau lien
              </Link>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', paddingTop: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#ecfdf5', margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={28} color="#059669" />
              </div>
              <h1 className="auth-title" style={{ marginBottom: 8 }}>Mot de passe modifié !</h1>
              <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.7 }}>
                Votre mot de passe a été mis à jour. Redirection vers la connexion…
              </p>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Nouveau mot de passe</h1>
              <p className="auth-subtitle">
                Réinitialisation pour <strong style={{ color: '#171717' }}>{email}</strong>
              </p>

              <form onSubmit={handleSubmit} className="auth-form">
                <div>
                  <label className="label">Nouveau mot de passe</label>
                  <PasswordInput
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="label">Confirmer le mot de passe</label>
                  <PasswordInput
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    placeholder="Répéter le mot de passe"
                    autoComplete="new-password"
                  />
                  {pw2 && pw1 !== pw2 && (
                    <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>Les mots de passe ne correspondent pas.</p>
                  )}
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={loading || !pw1 || !pw2 || pw1 !== pw2}
                >
                  {loading ? 'Mise à jour…' : 'Enregistrer le nouveau mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
