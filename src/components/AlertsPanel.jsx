import { useMemo } from 'react';
import { Clock, Wallet, TrendingUp, TrendingDown, Receipt, Users, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
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

// First sentence only — keeps action text crisp for executive view
function shortText(str) {
  if (!str) return '';
  const dot = str.indexOf('.');
  return dot > 0 ? str.slice(0, dot) : str;
}

const THEME = {
  critical: { accent: '#dc2626', bg: '#fff5f5', border: '#fca5a5', text: '#b91c1c', iconBg: '#fee2e2' },
  warning:  { accent: '#d97706', bg: '#fffdf0', border: '#fcd34d', text: '#92400e', iconBg: '#fef3c7' },
  success:  { accent: '#16a34a', bg: '#f6fef9', border: '#86efac', text: '#14532d', iconBg: '#dcfce7' },
};

// ─── One alert card ───────────────────────────────────────────────────────────
function AlertCard({ alert }) {
  const { type, icon, title, impact, message, action } = alert;
  const Icon = ICON_MAP[icon] || TrendingDown;
  const t = THEME[type];

  return (
    <div className="exec-alert-card" style={{ borderColor: t.border, background: t.bg, borderLeftColor: t.accent }}>
      {/* Header */}
      <div className="exec-alert-header">
        <div className="exec-alert-icon" style={{ background: t.iconBg }}>
          <Icon size={14} color={t.accent} />
        </div>
        <span className="exec-alert-title" style={{ color: t.text }}>{title}</span>
      </div>

      {/* Impact — the "so what" */}
      <p className="exec-alert-impact">{impact || message}</p>

      {/* Action — what to do right now */}
      {action && (
        <div className="exec-alert-action" style={{ color: t.accent }}>
          <ArrowRight size={11} strokeWidth={2.5} />
          <span>{shortText(action)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Health score bar ─────────────────────────────────────────────────────────
function HealthBar({ score, critCount, warnCount }) {
  const level  = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'critical';
  const color  = level === 'good' ? '#16a34a' : level === 'warning' ? '#d97706' : '#dc2626';
  const bg     = level === 'good' ? '#f0fdf4' : level === 'warning' ? '#fffbeb' : '#fef2f2';
  const border = level === 'good' ? '#bbf7d0' : level === 'warning' ? '#fde68a' : '#fecaca';
  const label  = level === 'good' ? 'Bonne santé' : level === 'warning' ? 'À surveiller' : 'Situation critique';

  const detail = [
    critCount > 0 && `${critCount} critique${critCount > 1 ? 's' : ''}`,
    warnCount > 0 && `${warnCount} à surveiller`,
    critCount === 0 && warnCount === 0 && 'Tous les indicateurs sont dans le vert',
  ].filter(Boolean).join(' · ');

  return (
    <div className="exec-health-bar" style={{ background: bg, borderColor: border }}>
      {/* Score dot */}
      <div className="exec-health-score" style={{ borderColor: color, color }}>
        {score}
      </div>

      {/* Label */}
      <div className="exec-health-label">
        <span style={{ fontWeight: 600, color, fontSize: 14 }}>Santé financière — {label}</span>
        <span style={{ fontSize: 12, color: '#737373', marginTop: 1 }}>{detail}</span>
      </div>

      {/* Progress bar */}
      <div className="exec-health-progress">
        <div
          className="exec-health-progress-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AlertsPanel() {
  const { sales, expenses, kpis, treasury, futureFlows } = useData();

  const alerts = useMemo(
    () => computeAlerts({ sales, expenses, kpis, treasury, futureFlows }),
    [sales, expenses, kpis, treasury, futureFlows],
  );

  const score = useMemo(() => computeHealthScore(alerts), [alerts]);

  // One per type — executive view, not a list
  const top = {
    critical: alerts.find(a => a.type === 'critical'),
    warning:  alerts.find(a => a.type === 'warning'),
    success:  alerts.find(a => a.type === 'success'),
  };
  const visible = [top.critical, top.warning, top.success].filter(Boolean);

  const critCount = alerts.filter(a => a.type === 'critical').length;
  const warnCount = alerts.filter(a => a.type === 'warning').length;

  if (kpis.ca === 0 && kpis.charges === 0) return null;

  return (
    <div className="exec-alerts-wrap">
      <HealthBar score={score} critCount={critCount} warnCount={warnCount} />

      {visible.length > 0 ? (
        <div className="exec-alerts-row">
          {visible.map(a => <AlertCard key={a.id} alert={a} />)}
        </div>
      ) : (
        <div className="exec-alerts-ok">
          <CheckCircle2 size={16} color="#16a34a" />
          <span>Tout est sous contrôle — aucun point d'attention détecté.</span>
        </div>
      )}
    </div>
  );
}
