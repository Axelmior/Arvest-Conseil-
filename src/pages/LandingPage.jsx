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
  FileSpreadsheet
} from 'lucide-react';
import Logo from '../components/Logo';
import './LandingPage.css';

const FEATURES = [
  { icon: LayoutDashboard, title: 'Tableau de bord', desc: "Vos KPI essentiels en un coup d'œil : CA, charges, résultat, marge." },
  { icon: TrendingUp, title: 'Suivi des ventes', desc: 'Gérez clients, factures, encaissements. Filtrez, triez, exportez.' },
  { icon: Wallet, title: 'Trésorerie', desc: 'Solde actuel, prévisions 30 jours et alertes intelligentes.' },
  { icon: BarChart3, title: 'Analyses intelligentes', desc: 'Détection automatique des tendances et anomalies.' },
  { icon: Receipt, title: 'Gestion des charges', desc: 'Catégorisez vos dépenses fixes et variables simplement.' },
  { icon: FileSpreadsheet, title: 'Import / Export', desc: 'Excel, CSV, PDF. Intégration sans friction.' }
];

export default function LandingPage() {
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
            <a href="#about">À propos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost">Se connecter</Link>
            <Link to="/signup" className="btn btn-primary">Demander une démo</Link>
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
            <Link to="/signup" className="btn btn-gold btn-lg">
              Demander une démo
              <ArrowRight size={16} />
            </Link>
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
              <Link to="/signup" className="btn btn-gold btn-lg">
                Demander une démo
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="landing-link-light">
                Se connecter <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

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
