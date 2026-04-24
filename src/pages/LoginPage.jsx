import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const SIDE_FEATURES = [
  { title: 'Trésorerie en temps réel', desc: 'Solde actuel, prévisions 60 jours, alertes intelligentes.' },
  { title: 'CA, charges et rentabilité', desc: 'Tous vos KPI centralisés dans un seul tableau de bord.' },
  { title: 'Cockpit dirigeant', desc: 'Prenez de meilleures décisions, plus vite.' },
];

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const destination = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Merci de renseigner email et mot de passe.'); return; }
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Impossible de se connecter. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
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
          <div className="auth-side-features">
            <div className="auth-side-features-title">Tout votre pilotage financier, au même endroit.</div>
            {SIDE_FEATURES.map((f, i) => (
              <div key={i} className="auth-side-feature">
                <CheckCircle2 size={16} color="#C6A75E" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div className="auth-side-feature-title">{f.title}</div>
                  <div className="auth-side-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="auth-side-footer">© 2026 Arvest Pilot</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo"><Logo /></div>

          <Link to="/" className="auth-back"><ArrowLeft size={14} />Retour à l&apos;accueil</Link>

          <h1 className="auth-title">Bon retour parmi nous</h1>
          <p className="auth-subtitle">Connectez-vous pour accéder à votre tableau de bord.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="label">Email professionnel</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="icon" />
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  style={{ paddingRight: 40 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-eye"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-switch">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="auth-link-strong">Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
