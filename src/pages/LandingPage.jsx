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
  X,
  Shield,
  Zap,
  Users,
  MessageCircle,
} from 'lucide-react';
import Logo from '../components/Logo';
import './LandingPage.css';

const PRICING_FEATURES = [
  'Tableau de bord KPI en temps réel',
  'Suivi des ventes et encaissements',
  'Gestion des charges (fixes & variables)',
  'Import Excel, CSV, relevé bancaire',
  'Trésorerie & prévisions 60 jours',
  'Analyses et recommandations',
  'Support dédié par email (< 24 h)',
  'Données sécurisées et privées',
];

const FEATURES = [
  { icon: LayoutDashboard, title: 'Tableau de bord', desc: "KPI essentiels en un coup d'œil : CA, charges, résultat, marge." },
  { icon: TrendingUp, title: 'Suivi des ventes', desc: 'Gérez clients, factures, encaissements. Filtrez, triez, exportez.' },
  { icon: Wallet, title: 'Trésorerie', desc: 'Solde actuel, prévisions 60 jours et alertes intelligentes.' },
  { icon: BarChart3, title: 'Analyses intelligentes', desc: 'Détection automatique des tendances et anomalies.' },
  { icon: Receipt, title: 'Gestion des charges', desc: 'Catégorisez vos dépenses fixes et variables simplement.' },
  { icon: FileSpreadsheet, title: 'Import / Export', desc: 'Excel, CSV, PDF. Intégration sans friction.' },
];

const WHY_ITEMS = [
  {
    icon: Zap,
    title: 'Temps réel',
    desc: 'Vos données mises à jour instantanément. Prenez des décisions sur des chiffres actuels, pas ceux du mois dernier.',
  },
  {
    icon: BarChart3,
    title: 'Vision 360°',
    desc: 'CA, charges, marge, trésorerie — tout est connecté dans un seul tableau de bord cohérent.',
  },
  {
    icon: Shield,
    title: 'Données sécurisées',
    desc: 'Vos données restent privées. Aucune revente, aucun partage avec des tiers.',
  },
  {
    icon: TrendingUp,
    title: 'Anticipez les risques',
    desc: 'Prévision à 60 jours, alertes sur les anomalies, détection des charges excessives.',
  },
  {
    icon: Users,
    title: 'Conçu pour les dirigeants',
    desc: 'Un cockpit de pilotage pensé pour les dirigeants de TPE/PME. Pas de jargon, juste les chiffres qui comptent.',
  },
];

const BADGES = [
  { icon: Lock, label: 'Accès privé', desc: 'Sur invitation uniquement' },
  { icon: Shield, label: 'Logiciel premium', desc: 'Interface conçue pour les exigeants' },
  { icon: MessageCircle, label: 'Support humain', desc: 'Réponse sous 24 h par email' },
];

function RequestModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
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

export default function LandingPage() {
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="landing">
      <div className="landing-bg-1" aria-hidden="true" />
      <div className="landing-bg-2" aria-hidden="true" />

      {/* Header */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <Logo />
          <nav className="landing-nav">
            <a href="#features">Fonctionnalités</a>
            <a href="#why">Pourquoi Arvest</a>
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
            Accès privé · Tableau de bord dirigeant
          </div>
          <h1 className="landing-h1">
            Pilotez votre entreprise
            <br />
            <span className="landing-h1-accent">en temps réel.</span>
          </h1>
          <p className="landing-subtitle">
            Arvest Pilot centralise trésorerie, rentabilité, ventes et charges
            dans un tableau de bord conçu pour les dirigeants.
          </p>
          <div className="landing-cta">
            <button className="btn btn-gold btn-lg" onClick={() => setShowRequestModal(true)}>
              Demander un accès
              <ArrowRight size={16} />
            </button>
            <Link to="/login" className="btn btn-outline-dark btn-lg">Se connecter</Link>
          </div>

          <div className="landing-trust">
            <div className="landing-trust-item">
              <CheckCircle2 size={15} color="#C6A75E" />
              Sans engagement
            </div>
            <div className="landing-trust-item">
              <CheckCircle2 size={15} color="#C6A75E" />
              Données sécurisées
            </div>
            <div className="landing-trust-item">
              <CheckCircle2 size={15} color="#C6A75E" />
              Support humain dédié
            </div>
            <div className="landing-trust-item">
              <CheckCircle2 size={15} color="#C6A75E" />
              Accès privé
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="landing-container">
        <div className="landing-preview">
          <div className="landing-preview-bar">
            <div className="landing-dots">
              <span style={{ background: '#f87171' }} />
              <span style={{ background: '#fbbf24' }} />
              <span style={{ background: '#34d399' }} />
            </div>
            <div className="landing-preview-url">app.arvest-pilot.com · Dashboard</div>
          </div>
          <div className="landing-preview-body">
            {/* Sidebar mock */}
            <div className="lp-sidebar">
              <div className="lp-sidebar-logo">AP</div>
              {['Dashboard', 'Ventes', 'Charges', 'Trésorerie', 'Analyses'].map((item, i) => (
                <div key={i} className={`lp-sidebar-item${i === 0 ? ' active' : ''}`}>{item}</div>
              ))}
            </div>
            {/* Main content */}
            <div className="landing-preview-main">
              <div className="landing-preview-grid">
                {[
                  { label: "Chiffre d'affaires", value: '68 400 €', trend: '+12,4 %', up: true },
                  { label: 'Résultat net', value: '43 700 €', trend: '+18,7 %', up: true },
                  { label: 'Charges', value: '24 700 €', trend: '+3,2 %', up: false },
                  { label: 'Marge nette', value: '63,9 %', trend: '+2,1 pt', up: true },
                ].map((kpi, i) => (
                  <div key={i} className="landing-mini-kpi">
                    <div className="landing-mini-kpi-label">{kpi.label}</div>
                    <div className="landing-mini-kpi-value">{kpi.value}</div>
                    <div className="landing-mini-kpi-trend" style={{ color: kpi.up ? '#10b981' : '#f59e0b' }}>
                      {kpi.trend}
                    </div>
                  </div>
                ))}
              </div>
              <div className="landing-chart-placeholder" />
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi Arvest Pilot */}
      <section id="why" className="landing-why">
        <div className="landing-container">
          <div className="landing-section-head">
            <div className="landing-eyebrow">Pourquoi Arvest Pilot ?</div>
            <h2 className="landing-h2">Un outil pensé pour les dirigeants,<br />pas pour les spécialistes.</h2>
          </div>
          <div className="landing-why-grid">
            {WHY_ITEMS.map((item, i) => (
              <div key={i} className="landing-why-item">
                <div className="landing-why-icon">
                  <item.icon size={18} color="#C6A75E" />
                </div>
                <div>
                  <div className="landing-why-title">{item.title}</div>
                  <div className="landing-why-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="landing-section-head">
            <div className="landing-eyebrow">Fonctionnalités</div>
            <h2 className="landing-h2">Tout votre pilotage financier au même endroit</h2>
            <p className="landing-lead">Des indicateurs clairs, des analyses pertinentes, des décisions éclairées.</p>
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

      {/* Premium badges */}
      <section className="landing-badges-section">
        <div className="landing-container">
          <div className="landing-badges-grid">
            {BADGES.map((b, i) => (
              <div key={i} className="landing-badge-card">
                <div className="landing-badge-card-icon">
                  <b.icon size={20} color="#C6A75E" />
                </div>
                <div className="landing-badge-card-label">{b.label}</div>
                <div className="landing-badge-card-desc">{b.desc}</div>
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
                HT · sans engagement · accès personnel
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
                Demander mon accès
              </button>

              <p style={{ fontSize: 12, color: '#a3a3a3', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
                Pas de paiement en ligne · Activation manuelle sous 24 h
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-container">
        <div className="landing-cta-block">
          <div className="landing-cta-decoration" aria-hidden="true" />
          <div className="landing-cta-inner">
            <h2 className="landing-cta-title">Prenez enfin le contrôle<br />de votre entreprise.</h2>
            <p className="landing-cta-desc">
              Arrêtez de piloter à l&apos;aveugle. Rejoignez les dirigeants qui savent exactement où va leur argent.
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
        <div className="landing-container">
          <div className="landing-footer-top">
            <Logo />
            <nav className="landing-footer-links">
              <Link to="/mentions-legales">Mentions légales</Link>
              <Link to="/confidentialite">Confidentialité</Link>
              <Link to="/conditions">CGU</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
          <div className="landing-footer-bottom">
            <div className="landing-footer-text">© 2026 Arvest Pilot · Conçu pour les dirigeants exigeants.</div>
            <div className="landing-footer-text">Solution de pilotage financier pour TPE / PME — France</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
