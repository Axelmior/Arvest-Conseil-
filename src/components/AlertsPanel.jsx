import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Wallet, TrendingUp, TrendingDown,
  Receipt, Users, Star, ArrowRight, CheckCircle2,
  ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react';
import { computeAlerts, computeHealthScore } from '../utils/alertEngine';
import { useData } from '../context/DataContext';
import './AlertsPanel.css';

const ICON_MAP = {
  clock:         Clock,
  wallet:        Wallet,
  trending_up:   TrendingUp,
  trending_down: TrendingDown,
  receipt:       Receipt,
  users:         Users,
  star:          Star,
};

// Navigation vers la page pertinente selon la catégorie de l'alerte
const CATEGORY_ROUTE = {
  treasury:      '/dashboard/treasury',
  billing:       '/dashboard/sales',
  profitability: '/dashboard/analytics',
  activity:      '/dashboard/analytics',
  risk:          '/dashboard/analytics',
};

const THEME = {
  critical: { accent: '#dc2626', bg: '#fff5f5', border: '#fca5a5', text: '#b91c1c', iconBg: '#fee2e2', label: 'Critique' },
  warning:  { accent: '#d97706', bg: '#fffdf0', border: '#fcd34d', text: '#92400e', iconBg: '#fef3c7', label: 'Attention' },
  success:  { accent: '#16a34a', bg: '#f6fef9', border: '#86efac', text: '#14532d', iconBg: '#dcfce7', label: 'Positif' },
};

// ─── Carte alerte cliquable ───────────────────────────────────────────────────
function AlertCard({ alert, compact = false }) {
  const navigate = useNavigate();
  const { type, icon, title, impact, message, action, category } = alert;
  const Icon = ICON_MAP[icon] || TrendingDown;
  const t = THEME[type];
  const route = CATEGORY_ROUTE[category];

  function shortAction(str) {
    if (!str) return '';
    const dot = str.indexOf('.');
    return dot > 0 ? str.slice(0, dot) : str;
  }

  return (
    <div
      className="exec-alert-card"
      style={{ borderColor: t.border, background: t.bg, borderLeftColor: t.accent, cursor: route ? 'pointer' : 'default' }}
      onClick={() => route && navigate(route)}
      role={route ? 'button' : undefined}
      tabIndex={route ? 0 : undefined}
      onKeyDown={(e) => e.key === 'Enter' && route && navigate(route)}
    >
      <div className="exec-alert-header">
        <div className="exec-alert-icon" style={{ background: t.iconBg }}>
          <Icon size={14} color={t.accent} />
        </div>
        <span className="exec-alert-badge" style={{ background: t.iconBg, color: t.text }}>{t.label}</span>
        <span className="exec-alert-title" style={{ color: t.text }}>{title}</span>
        {route && <ExternalLink size={11} color={t.accent} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
      </div>

      <p className="exec-alert-impact">{impact || message}</p>

      {!compact && action && (
        <div className="exec-alert-action" style={{ color: t.accent }}>
          <ArrowRight size={11} strokeWidth={2.5} />
          <span>{shortAction(action)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Barre de santé financière ────────────────────────────────────────────────
function HealthBar({ score, critCount, warnCount }) {
  const level  = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'critical';
  const color  = level === 'good' ? '#16a34a' : level === 'warning' ? '#d97706' : '#dc2626';
  const bg     = level === 'good' ? '#f0fdf4' : level === 'warning' ? '#fffbeb' : '#fef2f2';
  const border = level === 'good' ? '#bbf7d0' : level === 'warning' ? '#fde68a' : '#fecaca';
  const label  = level === 'good' ? 'Bonne santé' : level === 'warning' ? 'À surveiller' : 'Situation critique';

  const detail = [
    critCount > 0 && `${critCount} alerte${critCount > 1 ? 's' : ''} critique${critCount > 1 ? 's' : ''}`,
    warnCount > 0 && `${warnCount} point${warnCount > 1 ? 's' : ''} à surveiller`,
    critCount === 0 && warnCount === 0 && 'Tous les indicateurs sont dans le vert',
  ].filter(Boolean).join(' · ');

  return (
    <div className="exec-health-bar" style={{ background: bg, borderColor: border }}>
      <div className="exec-health-score" style={{ borderColor: color, color }}>{score}</div>
      <div className="exec-health-label">
        <span style={{ fontWeight: 600, color, fontSize: 14 }}>Santé financière — {label}</span>
        <span style={{ fontSize: 12, color: '#737373', marginTop: 1 }}>{detail}</span>
      </div>
      <div className="exec-health-progress">
        <div className="exec-health-progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AlertsPanel() {
  const { sales, expenses, kpis, treasury, futureFlows } = useData();
  const [showSuccess, setShowSuccess] = useState(false);

  const alerts = useMemo(
    () => computeAlerts({ sales, expenses, kpis, treasury, futureFlows }),
    [sales, expenses, kpis, treasury, futureFlows],
  );

  const score      = useMemo(() => computeHealthScore(alerts), [alerts]);
  const criticals  = alerts.filter((a) => a.type === 'critical');
  const warnings   = alerts.filter((a) => a.type === 'warning');
  const successes  = alerts.filter((a) => a.type === 'success');
  const critCount  = criticals.length;
  const warnCount  = warnings.length;

  if (kpis.ca === 0 && kpis.charges === 0) return null;

  const hasProblems = critCount > 0 || warnCount > 0;

  return (
    <div className="exec-alerts-wrap">
      <HealthBar score={score} critCount={critCount} warnCount={warnCount} />

      {!hasProblems && (
        <div className="exec-alerts-ok">
          <CheckCircle2 size={16} color="#16a34a" />
          <span>Aucune alerte détectée — tous vos indicateurs sont dans le vert.</span>
        </div>
      )}

      {/* Alertes critiques — toutes visibles */}
      {criticals.length > 0 && (
        <div className="exec-alerts-section">
          <div className="exec-alerts-section-label" style={{ color: '#dc2626' }}>
            🔴 Alertes critiques ({criticals.length})
          </div>
          <div className="exec-alerts-row">
            {criticals.map((a) => <AlertCard key={a.id} alert={a} />)}
          </div>
        </div>
      )}

      {/* Avertissements — tous visibles */}
      {warnings.length > 0 && (
        <div className="exec-alerts-section">
          <div className="exec-alerts-section-label" style={{ color: '#d97706' }}>
            🟡 Points à surveiller ({warnings.length})
          </div>
          <div className="exec-alerts-row">
            {warnings.map((a) => <AlertCard key={a.id} alert={a} />)}
          </div>
        </div>
      )}

      {/* Positifs — réduits par défaut */}
      {successes.length > 0 && (
        <div className="exec-alerts-section">
          <button
            className="exec-alerts-toggle"
            onClick={() => setShowSuccess((v) => !v)}
          >
            {showSuccess ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>🟢 {successes.length} point{successes.length > 1 ? 's' : ''} positif{successes.length > 1 ? 's' : ''}</span>
          </button>
          {showSuccess && (
            <div className="exec-alerts-row" style={{ marginTop: 8 }}>
              {successes.map((a) => <AlertCard key={a.id} alert={a} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Version contextualisée (pour Analytics) ──────────────────────────────────
// Filtre les alertes par catégorie et les affiche inline dans un onglet
export function ContextualAlerts({ categories, compact = true }) {
  const { sales, expenses, kpis, treasury, futureFlows } = useData();

  const alerts = useMemo(
    () => computeAlerts({ sales, expenses, kpis, treasury, futureFlows })
      .filter((a) => categories.includes(a.category)),
    [sales, expenses, kpis, treasury, futureFlows, categories],
  );

  if (alerts.length === 0) return null;

  return (
    <div className="exec-alerts-inline">
      {alerts.map((a) => (
        <AlertCard key={a.id} alert={a} compact={compact} />
      ))}
    </div>
  );
}

// ─── Liste complète pour l'onglet Alertes d'Analytics ────────────────────────
export function FullAlertsList() {
  const { sales, expenses, kpis, treasury, futureFlows } = useData();

  const alerts = useMemo(
    () => computeAlerts({ sales, expenses, kpis, treasury, futureFlows }),
    [sales, expenses, kpis, treasury, futureFlows],
  );

  const score     = useMemo(() => computeHealthScore(alerts), [alerts]);
  const critCount = alerts.filter((a) => a.type === 'critical').length;
  const warnCount = alerts.filter((a) => a.type === 'warning').length;

  if (alerts.length === 0) {
    return (
      <div className="exec-alerts-ok" style={{ marginTop: 0 }}>
        <CheckCircle2 size={16} color="#16a34a" />
        <span>Aucune alerte — situation financière saine.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <HealthBar score={score} critCount={critCount} warnCount={warnCount} />
      {alerts.map((a) => (
        <FullAlertCard key={a.id} alert={a} />
      ))}
    </div>
  );
}

// Carte détaillée pour l'onglet Alertes : montre cause + impact + action complète
function FullAlertCard({ alert }) {
  const navigate = useNavigate();
  const { type, icon, title, message, cause, impact, action, category } = alert;
  const Icon = ICON_MAP[icon] || TrendingDown;
  const t = THEME[type];
  const route = CATEGORY_ROUTE[category];

  return (
    <div
      className="exec-full-alert-card"
      style={{ borderColor: t.border, background: t.bg, borderLeftColor: t.accent }}
    >
      <div className="exec-alert-header" style={{ marginBottom: 8 }}>
        <div className="exec-alert-icon" style={{ background: t.iconBg }}>
          <Icon size={14} color={t.accent} />
        </div>
        <span className="exec-alert-badge" style={{ background: t.iconBg, color: t.text }}>{t.label}</span>
        <span className="exec-alert-title" style={{ color: t.text, fontSize: 14 }}>{title}</span>
      </div>

      <p style={{ fontSize: 13, color: '#525252', margin: '0 0 8px', lineHeight: 1.5 }}>{message}</p>

      {cause && (
        <div className="exec-full-detail">
          <span className="exec-full-label">Cause</span>
          <span>{cause}</span>
        </div>
      )}
      {impact && (
        <div className="exec-full-detail">
          <span className="exec-full-label">Impact</span>
          <span>{impact}</span>
        </div>
      )}
      {action && (
        <div className="exec-full-action" style={{ borderColor: t.border, color: t.accent }}>
          <ArrowRight size={12} strokeWidth={2.5} style={{ flexShrink: 0 }} />
          <span>{action}</span>
        </div>
      )}

      {route && (
        <button
          className="exec-full-cta"
          style={{ background: t.accent }}
          onClick={() => navigate(route)}
        >
          Aller à la section concernée
        </button>
      )}
    </div>
  );
}
