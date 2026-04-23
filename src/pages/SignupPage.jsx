import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Merci de renseigner email et mot de passe.');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        email: form.email,
        name: form.name || form.email.split('@')[0],
        company: form.company || 'Mon entreprise'
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError("Impossible de créer votre compte. Veuillez réessayer.");
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
            <h2 style={{ fontSize: 24, color: 'white', fontWeight: 600, marginBottom: 16, letterSpacing: '-0.01em' }}>
              Pilotez votre activité avec clarté.
            </h2>
            <p>
              Rejoignez la communauté de dirigeants qui prennent des décisions éclairées grâce à des
              indicateurs précis et une vision en temps réel.
            </p>
            <div className="auth-quote-author" style={{ marginTop: 24 }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Essai gratuit · Sans engagement</div>
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

          <h1 className="auth-title">Créez votre compte</h1>
          <p className="auth-subtitle">Commencez votre essai en moins de 2 minutes.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-row">
              <div>
                <label className="label">Nom complet</label>
                <div className="input-icon-wrapper">
                  <User size={16} className="icon" />
                  <input
                    type="text"
                    className="input"
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder="Jean Dupont"
                    autoComplete="name"
                  />
                </div>
              </div>
              <div>
                <label className="label">Entreprise</label>
                <div className="input-icon-wrapper">
                  <Building2 size={16} className="icon" />
                  <input
                    type="text"
                    className="input"
                    value={form.company}
                    onChange={handleChange('company')}
                    placeholder="Ma société"
                    autoComplete="organization"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Email professionnel</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="icon" />
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={handleChange('email')}
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
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Au moins 6 caractères"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
              {submitting ? 'Création...' : 'Créer mon compte'}
            </button>

            <p className="auth-terms">
              En créant un compte, vous acceptez nos conditions d'utilisation et notre politique de
              confidentialité.
            </p>
          </form>

          <div className="auth-switch">
            Déjà un compte ? <Link to="/login" className="auth-link-strong">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
