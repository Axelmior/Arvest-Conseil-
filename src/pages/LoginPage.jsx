import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('demo@arvestpilot.com');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Merci de renseigner email et mot de passe.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email });
      navigate(destination, { replace: true });
    } catch (err) {
      setError('Impossible de se connecter. Veuillez réessayer.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-side-bg-1" aria-hidden="true" />
        <div className="auth-side-bg-2" aria-hidden="true" />
        <div className="auth-side-inner">
          <Logo light />
          <div className="auth-quote">
            <svg className="auth-quote-mark" viewBox="0 0 24 24" fill="#C6A75E">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p>
              Depuis que j'utilise Arvest Pilot, je prends mes décisions en 5 minutes au lieu de 2
              heures. Un outil qui a vraiment transformé mon pilotage.
            </p>
            <div className="auth-quote-author">
              <div className="auth-quote-name">Sophie Laurent</div>
              <div className="auth-quote-role">Dirigeante, Atelier Laurent &amp; Associés</div>
            </div>
          </div>
          <div className="auth-side-footer">© 2026 Arvest Pilot</div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <Logo />
          </div>

          <Link to="/" className="auth-back">
            <ArrowLeft size={14} />
            Retour à l'accueil
          </Link>

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
              <div className="auth-label-row">
                <label className="label">Mot de passe</label>
                <a href="#" className="auth-link">Oublié ?</a>
              </div>
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
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <label className="auth-checkbox">
              <input type="checkbox" />
              Rester connecté pendant 30 jours
            </label>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              {submitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-switch">
            Pas encore de compte ? <Link to="/signup" className="auth-link-strong">Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
