import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Wallet,
  BarChart3,
  FileSpreadsheet,
  Lock,
  Send,
  X
} from 'lucide-react';
import Logo from '../components/Logo';
import './LandingPage.css';

const PRICING_FEATURES = [
  'Tableau de bord KPI en temps réel',
  'Suivi des ventes et encaissements',
  'Gestion des charges (fixes & variables)',
  'Import Excel, CSV, relevé bancaire',
  'Trésorerie & prévisions 30 jours',
  'Analyses et recommandations',
  'Support dédié par email',
  'Données sécurisées et privées',
];

function RequestModal({ onClose }) {
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [company, setCompany]   = useState('');
  const [sent, setSent]         = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend — just redirect to signup with pre-filled context
    setSent(true);
  };

  if (sent) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(198,167,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={26} color="#C6A75E" />
          </div>
          <h3 className="modal-title" style={{ marginBottom: 12 }}>Demande envoyée !</h3>
          <p style={{ fontSize: 14, color: '#525252', marginBottom: 24, lineHeight: 1.6 }}>
            Créez maintenant votre compte pour finaliser votre inscription. Vous serez notifié dès validation de votre accès.
          </p>
          <Link to="/signup" className="btn btn-primary btn-block" onClick={onClose}>
            Créer mon compte <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-head">
          <h3 className="modal-title">Demander un accès</h3>
          <button type="button" onClick={onClose} className="modal-close"><X size={18} /></button>
        </div>
        <p style={{ fontSize: 14, color: '#525252', marginBottom: 20, lineHeight: 1.6 }}>
          Arvest Pilot est accessible sur invitation uniquement à <strong>49 € / mois</strong>.
          Laissez vos coordonnées et nous vous activerons manuellement.
        </p>
        <div className="modal-body">
          <div>
            <label className="label">Nom complet</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" required />
          </div>
          <div>
            <label className="label">Email professionnel</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@entreprise.com" required />
          </div>
          <div>
            <label className="label">Entreprise</label>
            <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ma société" />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" className="btn btn-gold">
            <Send size={14} /> Envoyer la demande
          </button>
        </div>
      </form>
    </div>
  );
}

const FEATURES = [
  { icon: LayoutDashboard, title: 'Tableau de bord', desc: "Vos KPI essentiels en un coup d'œil : CA, charges, résultat, marge." },
  { icon: TrendingUp, title: 'Suivi des ventes', desc: 'Gérez clients, factures, encaissements. Filtrez, triez, exportez.' },
  { icon: Wallet, title: 'Trésorerie', desc: 'Solde actuel, prévisions 30 jours et alertes intelligentes.' },
  { icon: BarChart3, title: 'Analyses intelligentes', desc: 'Détection automatique des tendances et anomalies.' },
  { icon: Receipt, title: 'Gestion des charges', desc: 'Catégorisez vos dépenses fixes et variables simplement.' },
  { icon: FileSpreadsheet, title: 'Import / Export', desc: 'Excel, CSV, PDF. Intégration sans friction.' }
];

export default function LandingPage() {
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="landing">
      {/* Décorations de fond */}
      <div className="landing-bg-1" aria-hidden="true" />
      <div className="landing-bg-2" aria-hidden="true" />

      {/* Header */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <Logo />
          <nav className="landing-nav">
            <a href="#features">Fonctionnalités</a>
            <a href="#pricing">Tarifs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost">Se connecter</Link>
            <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
              Demander un accès
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            Nouveau · Pilotage financier simplifié
          </div>
          <h1 className="landing-h1">
            Visualisez en quelques secondes
            <br />
            <span className="landing-h1-accent">où vous gagnez</span> et perdez de l'argent.
          </h1>
          <p className="landing-subtitle">
            Arvest Pilot aide les dirigeants à suivre leur chiffre d'affaires, leurs charges et leur
            rentabilité avec un outil simple et clair.
          </p>
          <div className="landing-cta">
            <button className="btn btn-gold btn-lg" onClick={() => setShowRequestModal(true)}>
              Demander un accès
              <ArrowRight size={16} />
            </button>
            <Link to="/login" className="btn btn-secondary btn-lg">Se connecter</Link>
          </div>

          <div className="landing-trust">
            <div className="landing-trust-item">
              <CheckCircle2 size={16} color="#C6A75E" />
              Sans engagement
            </div>
            <div className="landing-trust-item">
              <CheckCircle2 size={16} color="#C6A75E" />
              Données sécurisées
            </div>
            <div className="landing-trust-item">
              <CheckCircle2 size={16} color="#C6A75E" />
              Support dédié
            </div>
          </div>
        </div>
      </section>

      {/* Aperçu dashboard */}
      <section className="landing-container">
        <div className="landing-preview">
          <div className="landing-preview-bar">
            <div className="landing-dots">
              <span style={{ background: '#f87171' }} />
              <span style={{ background: '#fbbf24' }} />
              <span style={{ background: '#34d399' }} />
            </div>
            <div className="landing-preview-url">app.arvestpilot.com</div>
          </div>
          <div className="landing-preview-body">
            <div className="landing-preview-grid">
              {[
                { label: "Chiffre d'affaires", value: '68 400 €', trend: '+12,4%', color: '#10b981' },
                { label: 'Charges', value: '24 700 €', trend: '+3,2%', color: '#f59e0b' },
                { label: 'Résultat net', value: '43 700 €', trend: '+18,7%', color: '#10b981' },
                { label: 'Marge', value: '63,9%', trend: '+2,1pt', color: '#C6A75E' }
              ].map((kpi, i) => (
                <div key={i} className="landing-mini-kpi">
                  <div className="landing-mini-kpi-label">{kpi.label}</div>
                  <div className="landing-mini-kpi-value">{kpi.value}</div>
                  <div className="landing-mini-kpi-trend" style={{ color: kpi.color }}>
                    {kpi.trend}
                  </div>
                </div>
              ))}
            </div>
            <div className="landing-chart-placeholder" />
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="landing-section-head">
            <div className="landing-eyebrow">Fonctionnalités</div>
            <h2 className="landing-h2">Tout votre pilotage financier au même endroit</h2>
            <p className="landing-lead">
              Des indicateurs clairs, des analyses pertinentes, des décisions éclairées.
            </p>
          </div>

          <div className="landing-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="landing-feature">
                <div className="landing-feature-icon">
                  <f.icon size={20} color="#C6A75E" />
                </div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="landing-pricing">
        <div className="landing-container">
          <div className="landing-section-head">
            <div className="landing-eyebrow">Tarifs</div>
            <h2 className="landing-h2">Simple. Transparent. Sans surprise.</h2>
            <p className="landing-lead">Un seul plan, tout inclus. Accès sur invitation uniquement.</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="landing-pricing-card">
              {/* Badge invitation */}
              <div className="landing-pricing-badge">
                <Lock size={11} />
                Accès sur invitation uniquement
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737373', fontWeight: 500 }}>
                  Arvest Pilot Business
                </div>
              </div>

              <div className="landing-pricing-price">
                49 <span className="landing-pricing-unit">€ / mois</span>
              </div>
              <div style={{ fontSize: 13, color: '#737373', marginBottom: 32 }}>
                HT · géré hors site · sans engagement
              </div>

              <ul className="landing-pricing-features">
                {PRICING_FEATURES.map((f, i) => (
                  <li key={i}>
                    <CheckCircle2 size={14} color="#C6A75E" style={{ flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="btn btn-gold btn-block btn-lg"
                style={{ marginTop: 32 }}
                onClick={() => setShowRequestModal(true)}
              >
                <Send size={15} />
                Demander un accès
              </button>

              <p style={{ fontSize: 12, color: '#a3a3a3', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
                Pas de paiement en ligne · Facturation manuelle après activation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="landing-container">
        <div className="landing-cta-block">
          <div className="landing-cta-decoration" aria-hidden="true" />
          <div className="landing-cta-inner">
            <h2 className="landing-cta-title">Prenez enfin le contrôle de vos finances.</h2>
            <p className="landing-cta-desc">
              Rejoignez des centaines de dirigeants qui pilotent sereinement leur activité avec
              Arvest Pilot.
            </p>
            <div className="landing-cta-actions">
              <button className="btn btn-gold btn-lg" onClick={() => setShowRequestModal(true)}>
                Demander un accès
                <ArrowRight size={16} />
              </button>
              <Link to="/login" className="landing-link-light">
                Se connecter <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showRequestModal && <RequestModal onClose={() => setShowRequestModal(false)} />}

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <Logo />
          <div className="landing-footer-text">
            © 2026 Arvest Pilot. Conçu pour les dirigeants exigeants.
          </div>
        </div>
      </footer>
    </div>
  );
}
