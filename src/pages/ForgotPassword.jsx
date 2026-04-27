import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { sendPasswordResetEmail } from '../utils/emailService';
import './AuthPages.css';

export default function ForgotPassword() {
  const { generateResetToken } = useAuth();
  const [email,       setEmail]       = useState('');
  const [status,      setStatus]      = useState('idle'); // idle | loading | sent | error
  const [errorMsg,    setErrorMsg]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setErrorMsg('Merci de renseigner votre adresse email.'); return; }
    setStatus('loading');
    setErrorMsg('');
    try {
      const { token, name } = generateResetToken(email.trim().toLowerCase());
      const resetUrl = `${window.location.origin}/reset-password?token=${token}&email=${encodeURIComponent(email.trim().toLowerCase())}`;
      await sendPasswordResetEmail(email.trim().toLowerCase(), resetUrl, name);
      setStatus('sent');
    } catch (err) {
      setErrorMsg(err.message || 'Une erreur est survenue. Réessayez.');
      setStatus('error');
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-side">
        <div className="auth-side-bg-1" aria-hidden="true" />
        <div className="auth-side-bg-2" aria-hidden="true" />
        <div className="auth-side-inner">
          <Logo light />
          <div style={{ marginTop: 48 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.8 }}>
              Renseignez votre adresse email et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
            </p>
          </div>
          <div className="auth-side-footer">© 2026 Arvest Pilot</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo"><Logo /></div>

          <Link to="/login" className="auth-back"><ArrowLeft size={14} />Retour à la connexion</Link>

          {status === 'sent' ? (
            <div style={{ textAlign: 'center', paddingTop: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#ecfdf5', margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={28} color="#059669" />
              </div>
              <h1 className="auth-title" style={{ marginBottom: 8 }}>Email envoyé !</h1>
              <p style={{ fontSize: 14, color: '#737373', lineHeight: 1.7, marginBottom: 32 }}>
                Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p style={{ fontSize: 13, color: '#a3a3a3' }}>
                Pensez à vérifier vos spams si vous ne recevez pas l'email.
              </p>
              <div style={{ marginTop: 32 }}>
                <Link to="/login" className="btn btn-primary btn-lg btn-block" style={{ textAlign: 'center', display: 'block' }}>
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Mot de passe oublié ?</h1>
              <p className="auth-subtitle">Entrez votre email pour recevoir un lien de réinitialisation.</p>

              <form onSubmit={handleSubmit} className="auth-form">
                <div>
                  <label className="label">Adresse email</label>
                  <div className="input-icon-wrapper">
                    <Mail size={16} className="icon" />
                    <input
                      type="email"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@entreprise.com"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                {(errorMsg || status === 'error') && (
                  <div className="auth-error">{errorMsg || 'Une erreur est survenue.'}</div>
                )}

                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
                </button>
              </form>

              <div className="auth-switch">
                Vous vous souvenez ?{' '}
                <Link to="/login" className="auth-link-strong">Se connecter</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
