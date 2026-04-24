import { useState, useMemo } from 'react';
import {
  Users, ShoppingBag, Building2, Wallet, Bell, Sparkles,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Clock, ArrowUpRight, ArrowDownRight, Zap, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Line,
} from 'recharts';
import { useData } from '../context/DataContext';
import { formatEuro, formatDate } from '../utils/format';

// ── tiny helpers ──────────────────────────────────────────────────────────────

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function Stat({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="stat-card">
      {Icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(198,167,94,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 12,
        }}>
          <Icon size={16} color="#C6A75E" />
        </div>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : undefined}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Trend({ pct }) {
  if (pct === 0 || pct == null) return <span style={{ fontSize: 12, color: '#a3a3a3' }}>—</span>;
  const up = pct > 0;
  return (
    <span style={{
      fontSize: 12, fontWeight: 500,
      color: up ? '#059669' : '#dc2626',
      display: 'inline-flex', alignItems: 'center', gap: 2,
    }}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(pct)}%
    </span>
  );
}

function AlertCard({ type, icon: Icon, title, body }) {
  const palette = {
    danger:  { bg: '#fef2f2', border: '#fee2e2', icon: '#dc2626', title: '#b91c1c' },
    warning: { bg: '#fffbeb', border: '#fef3c7', icon: '#d97706', title: '#b45309' },
    success: { bg: '#f0fdf4', border: '#dcfce7', icon: '#059669', title: '#047857' },
    info:    { bg: '#f0f9ff', border: '#e0f2fe', icon: '#0284c7', title: '#0369a1' },
  };
  const c = palette[type] || palette.info;
  return (
    <div style={{
      padding: 16, borderRadius: 12,
      background: c.bg, border: `1px solid ${c.border}`,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <div style={{
        flexShrink: 0, width: 36, height: 36, borderRadius: 8,
        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {Icon && <Icon size={18} color={c.icon} />}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: c.title, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#525252', lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'clients',   label: 'Clients',      icon: Users },
  { id: 'suppliers', label: 'Fournisseurs',  icon: ShoppingBag },
  { id: 'company',   label: 'Entreprise',    icon: Building2 },
  { id: 'treasury',  label: 'Trésorerie',    icon: Wallet },
  { id: 'alerts',    label: 'Alertes',       icon: Bell },
];

const TOOLTIP_STYLE = { background: 'white', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 12 };

export default function Analytics() {
  const { sales, expenses, treasury, futureFlows } = useData();
  const [tab, setTab] = useState('clients');

  // ── Client analytics ──────────────────────────────────────────────────────
  const clientStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const s30 = dateOffset(-30);
    const s60 = dateOffset(-60);
    const s90 = dateOffset(-90);

    const map = {};
    sales.forEach((s) => {
      const name = s.client || 'Inconnu';
      if (!map[name]) map[name] = {
        name, ca: 0, ht: 0, count: 0, paid: 0,
        pending: 0, lateAmount: 0, late: 0,
        caLast30: 0, caPrev30: 0, dates: [],
      };
      const ttc = parseFloat(s.ttc) || 0;
      const m = map[name];
      m.ca += ttc;
      m.ht += parseFloat(s.ht) || 0;
      m.count++;
      m.dates.push(s.date);
      if (s.status === 'paid') {
        m.paid += ttc;
      } else {
        m.pending += ttc;
        const due = s.dueDate || s.date;
        if (due < today) { m.late++; m.lateAmount += ttc; }
      }
      if (s.date >= s30) m.caLast30 += ttc;
      else if (s.date >= s60) m.caPrev30 += ttc;
    });

    return Object.values(map).map((c) => {
      const lastDate = [...c.dates].sort().at(-1) || '';
      const trend = c.caPrev30 > 0
        ? Math.round((c.caLast30 - c.caPrev30) / c.caPrev30 * 100)
        : c.caLast30 > 0 ? 100 : 0;
      return {
        ...c,
        avgBasket: c.count > 0 ? Math.round(c.ca / c.count) : 0,
        lastDate,
        isNew: c.dates.length > 0 && c.dates.every((d) => d >= s30),
        isInactive: lastDate < s90,
        trend,
      };
    }).sort((a, b) => b.ca - a.ca);
  }, [sales]);

  const totalCA       = useMemo(() => clientStats.reduce((s, c) => s + c.ca, 0), [clientStats]);
  const totalPending  = useMemo(() => clientStats.reduce((s, c) => s + c.pending, 0), [clientStats]);
  const totalLate     = useMemo(() => clientStats.reduce((s, c) => s + c.late, 0), [clientStats]);
  const totalLateAmt  = useMemo(() => clientStats.reduce((s, c) => s + c.lateAmount, 0), [clientStats]);
  const avgBasket     = useMemo(() => sales.length > 0 ? Math.round(totalCA / sales.length) : 0, [totalCA, sales]);

  // ── Supplier analytics ────────────────────────────────────────────────────
  const supplierStats = useMemo(() => {
    const today  = new Date().toISOString().slice(0, 10);
    const next30 = dateOffset(30);
    const ago30  = dateOffset(-30);
    const ago60  = dateOffset(-60);

    const map = {};
    expenses.forEach((e) => {
      const name = e.supplier || 'Inconnu';
      if (!map[name]) map[name] = {
        name, total: 0, count: 0, fixed: 0, variable: 0,
        last30: 0, prev30: 0, upcoming30: 0, dates: [], categories: {},
      };
      const ttc = parseFloat(e.ttc) || 0;
      const m = map[name];
      m.total += ttc;
      m.count++;
      m.dates.push(e.date);
      if (e.type === 'fixed') m.fixed += ttc; else m.variable += ttc;
      if (e.date >= ago30) m.last30 += ttc;
      else if (e.date >= ago60) m.prev30 += ttc;
      const due = e.dueDate || e.date;
      if (due >= today && due <= next30) m.upcoming30 += ttc;
      const cat = e.category || 'Autre';
      m.categories[cat] = (m.categories[cat] || 0) + ttc;
    });

    return Object.values(map).map((s) => ({
      ...s,
      lastDate: [...s.dates].sort().at(-1) || '',
      trend: s.prev30 > 0 ? Math.round((s.last30 - s.prev30) / s.prev30 * 100) : 0,
      topCat: Object.entries(s.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || '—',
    })).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const totalExpenses = useMemo(() => expenses.reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0), [expenses]);
  const totalFixed    = useMemo(() => expenses.filter((e) => e.type === 'fixed').reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0), [expenses]);
  const totalVariable = useMemo(() => expenses.filter((e) => e.type === 'variable').reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0), [expenses]);
  const upcoming30    = useMemo(() => supplierStats.reduce((s, x) => s + x.upcoming30, 0), [supplierStats]);

  // ── Company analytics ─────────────────────────────────────────────────────
  const companyStats = useMemo(() => {
    const now = new Date();
    const totalNet     = totalCA - totalExpenses;
    const globalMargin = totalCA > 0 ? Math.round(totalNet / totalCA * 1000) / 10 : 0;

    const varRate         = totalCA > 0 ? totalVariable / totalCA : 0;
    const grossMarginRate = 1 - varRate;
    const breakEven       = grossMarginRate > 0 ? Math.round(totalFixed / grossMarginRate) : 0;

    // Compute monthly breakdown directly from sales/expenses (not MONTHLY_DATA from DataContext)
    const monthlyWithMargin = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label  = d.toLocaleString('fr-FR', { month: 'short' });
      const month  = label.charAt(0).toUpperCase() + label.slice(1);
      const ca = sales
        .filter((s) => s.date?.startsWith(prefix))
        .reduce((sum, s) => sum + (parseFloat(s.ttc) || 0), 0);
      const charges = expenses
        .filter((e) => e.date?.startsWith(prefix))
        .reduce((sum, e) => sum + (parseFloat(e.ttc) || 0), 0);
      const marge = ca > 0 ? Math.round((ca - charges) / ca * 1000) / 10 : 0;
      return { month, prefix, ca, charges, marge };
    });

    const cur  = monthlyWithMargin.at(-1);
    const prev = monthlyWithMargin.at(-2);
    const growthMoM = prev?.ca > 0 ? Math.round((cur.ca - prev.ca) / prev.ca * 100) : cur?.ca > 0 ? 100 : 0;

    const q1 = monthlyWithMargin.slice(-3).reduce((s, m) => s + m.ca, 0);
    const q0 = monthlyWithMargin.slice(-6, -3).reduce((s, m) => s + m.ca, 0);
    const growthQoQ = q0 > 0 ? Math.round((q1 - q0) / q0 * 100) : q1 > 0 ? 100 : 0;

    const withCa     = monthlyWithMargin.filter((m) => m.ca > 0);
    const bestMonth  = withCa.length > 0 ? withCa.reduce((a, b) => b.ca > a.ca ? b : a) : null;
    const worstMonth = withCa.length > 1 ? withCa.reduce((a, b) => b.ca < a.ca ? b : a) : null;

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth  = now.getDate();
    const projectedCA = dayOfMonth > 0 && cur?.ca > 0 ? Math.round(cur.ca / dayOfMonth * daysInMonth) : 0;
    const projectedNet = projectedCA - (cur?.charges || 0);

    return {
      totalNet, globalMargin, breakEven,
      growthMoM, growthQoQ,
      bestMonth, worstMonth,
      projectedCA, projectedNet,
      monthlyWithMargin, currentMonth: cur,
    };
  }, [sales, expenses, totalCA, totalExpenses, totalFixed, totalVariable]);

  // ── Treasury analytics ────────────────────────────────────────────────────
  const treasuryStats = useMemo(() => {
    const { solde, encaissements, decaissements } = treasury;
    const now  = new Date();
    const d3m  = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().slice(0, 10);
    const last3 = expenses.filter((e) => e.date >= d3m).reduce((s, e) => s + (parseFloat(e.ttc) || 0), 0);
    const avgDay = last3 / 90;
    const daysRemaining = avgDay > 0 ? Math.round(solde / avgDay) : null;

    const max7  = dateOffset(7);
    const max30 = dateOffset(30);

    let proj7 = solde, proj30 = solde;
    let incoming30 = 0, outgoing30 = 0;
    futureFlows.forEach((f) => {
      const amt = f.kind === 'sale' ? (parseFloat(f.ttc) || 0) : -(parseFloat(f.ttc) || 0);
      if (f.effectiveDate <= max7)  proj7  += amt;
      if (f.effectiveDate <= max30) proj30 += amt;
      if (f.effectiveDate <= max30) {
        if (f.kind === 'sale')    incoming30 += parseFloat(f.ttc) || 0;
        else                      outgoing30 += parseFloat(f.ttc) || 0;
      }
    });

    return {
      solde, encaissements, decaissements,
      daysRemaining,
      proj7:  Math.round(proj7),
      proj30: Math.round(proj30),
      incoming30, outgoing30,
      isCritical: daysRemaining !== null && daysRemaining < 30,
      isWarning:  daysRemaining !== null && daysRemaining < 60,
    };
  }, [treasury, futureFlows, expenses]);

  // ── Alerts ────────────────────────────────────────────────────────────────
  const alerts = useMemo(() => {
    const list = [];
    const { daysRemaining, isCritical, isWarning } = treasuryStats;

    if (isCritical) {
      list.push({ type: 'danger', icon: AlertTriangle, title: 'Trésorerie critique', body: `Seulement ${daysRemaining} jours de trésorerie restants au rythme actuel. Agissez immédiatement.` });
    } else if (isWarning) {
      list.push({ type: 'warning', icon: AlertTriangle, title: 'Tension de trésorerie', body: `${daysRemaining} jours de trésorerie restants. Anticipez vos encaissements.` });
    }

    const lateClients = clientStats.filter((c) => c.late > 0);
    if (lateClients.length > 0) {
      const amt = lateClients.reduce((s, c) => s + c.lateAmount, 0);
      list.push({ type: 'warning', icon: Clock, title: `${lateClients.length} client${lateClients.length > 1 ? 's' : ''} en retard de paiement`, body: `${formatEuro(amt)} sur des factures dont l'échéance est dépassée.` });
    }

    const topShare = clientStats[0] && totalCA > 0 ? clientStats[0].ca / totalCA * 100 : 0;
    if (clientStats.length > 1 && topShare > 50) {
      list.push({ type: 'warning', icon: Users, title: 'Forte dépendance client', body: `${clientStats[0].name} représente ${Math.round(topShare)}% de votre CA. Diversifiez votre portefeuille.` });
    }

    if (companyStats.globalMargin < 20 && totalCA > 0) {
      list.push({ type: 'danger', icon: TrendingDown, title: 'Marge nette faible', body: `Votre marge nette est de ${companyStats.globalMargin}%. Identifiez les charges à optimiser.` });
    }

    if (companyStats.growthMoM > 15 && companyStats.currentMonth?.ca > 0) {
      list.push({ type: 'success', icon: TrendingUp, title: 'Forte croissance ce mois', body: `CA en hausse de +${companyStats.growthMoM}% vs le mois précédent.` });
    }

    const md = companyStats.monthlyWithMargin;
    if (md.at(-2)?.charges > 0 && md.at(-1)?.charges > md.at(-2).charges * 1.2) {
      const pct = Math.round((md.at(-1).charges / md.at(-2).charges - 1) * 100);
      list.push({ type: 'warning', icon: TrendingUp, title: 'Charges en forte hausse', body: `Vos charges ont augmenté de ${pct}% ce mois-ci par rapport au précédent.` });
    }

    if (companyStats.breakEven > 0 && totalCA > 0 && totalCA < companyStats.breakEven) {
      list.push({ type: 'warning', icon: Target, title: 'Seuil de rentabilité non atteint', body: `Il vous manque ${formatEuro(companyStats.breakEven - totalCA)} pour atteindre votre point mort (${formatEuro(companyStats.breakEven)}).` });
    }

    if (list.length === 0) {
      list.push({ type: 'success', icon: CheckCircle2, title: 'Situation saine', body: 'Aucune alerte détectée. Votre activité financière est dans les clous.' });
    }
    return list;
  }, [clientStats, companyStats, treasuryStats, totalCA]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (sales.length === 0 && expenses.length === 0) {
    return (
      <div className="card" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12, minHeight: 320 }}>
        <Sparkles size={32} color="#C6A75E" />
        <div style={{ fontSize: 16, fontWeight: 600, color: '#171717' }}>Pas encore de données à analyser</div>
        <p style={{ fontSize: 13, color: '#737373', maxWidth: 360, lineHeight: 1.6 }}>
          Ajoutez des ventes et des charges pour que vos analyses, alertes et recommandations apparaissent ici.
        </p>
      </div>
    );
  }

  const alertCount = alerts.filter((a) => a.type !== 'success').length;

  return (
    <>
      {/* ── Tab nav ── */}
      <div className="card" style={{ padding: '0 8px', marginBottom: 24, overflowX: 'auto' }}>
        <div style={{ display: 'flex' }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 20px', fontSize: 14, fontWeight: 500,
                  whiteSpace: 'nowrap', position: 'relative',
                  color: active ? '#171717' : '#737373',
                  transition: 'color 0.2s ease',
                }}
              >
                <Icon size={15} />
                {label}
                {id === 'alerts' && alertCount > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 9999, background: '#ef4444', color: 'white', minWidth: 20, textAlign: 'center' }}>
                    {alertCount}
                  </span>
                )}
                {active && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#C6A75E', borderRadius: '2px 2px 0 0' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          CLIENTS
      ════════════════════════════════════════════════ */}
      {tab === 'clients' && (
        <>
          <div className="module-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <Stat label="Clients actifs" value={clientStats.length} icon={Users} />
            <Stat label="Panier moyen" value={formatEuro(avgBasket)} icon={Zap} />
            <Stat
              label="À encaisser"
              value={formatEuro(totalPending)}
              color={totalPending > 0 ? '#b45309' : undefined}
              icon={Clock}
              sub={`${sales.filter((s) => s.status === 'pending').length} facture(s) en attente`}
            />
            <Stat
              label="Factures en retard"
              value={totalLate > 0 ? `${totalLate} — ${formatEuro(totalLateAmt)}` : '0'}
              color={totalLate > 0 ? '#dc2626' : '#059669'}
              icon={AlertTriangle}
            />
          </div>

          {clientStats.length > 0 && (
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div className="section-head">
                <div>
                  <div className="section-title">Top {Math.min(clientStats.length, 10)} clients — CA TTC</div>
                  <div className="section-subtitle">Chiffre d&apos;affaires cumulé par client</div>
                </div>
              </div>
              <div style={{ height: Math.min(clientStats.slice(0, 10).length * 46 + 20, 420) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clientStats.slice(0, 10).map((c) => ({
                      name: c.name.length > 20 ? c.name.slice(0, 20) + '…' : c.name,
                      ca: Math.round(c.ca),
                    }))}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={12} axisLine={false} tickLine={false} width={140} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatEuro(v), 'CA TTC']} />
                    <Bar dataKey="ca" fill="#C6A75E" radius={[0, 4, 4, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th className="right">CA Total</th>
                    <th className="right">Factures</th>
                    <th className="right">Panier moy.</th>
                    <th className="right">À encaisser</th>
                    <th className="right">Tendance</th>
                    <th>Statut</th>
                    <th>Dernière vente</th>
                  </tr>
                </thead>
                <tbody>
                  {clientStats.map((c) => (
                    <tr key={c.name}>
                      <td className="strong">{c.name}</td>
                      <td className="right numeric">{formatEuro(c.ca)}</td>
                      <td className="right numeric">{c.count}</td>
                      <td className="right numeric">{formatEuro(c.avgBasket)}</td>
                      <td className="right numeric">
                        {c.pending > 0 ? (
                          <span style={{ color: '#b45309' }}>
                            {formatEuro(c.pending)}
                            {c.late > 0 && (
                              <span className="badge badge-danger" style={{ marginLeft: 6 }}>
                                {c.late} retard
                              </span>
                            )}
                          </span>
                        ) : (
                          <span style={{ color: '#a3a3a3' }}>—</span>
                        )}
                      </td>
                      <td className="right"><Trend pct={c.trend} /></td>
                      <td>
                        {c.isNew
                          ? <span className="badge badge-success">Nouveau</span>
                          : c.isInactive
                          ? <span className="badge badge-default">Inactif</span>
                          : <span className="badge badge-gold">Actif</span>}
                      </td>
                      <td>{c.lastDate ? formatDate(c.lastDate) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <div>{clientStats.length} client{clientStats.length > 1 ? 's' : ''}</div>
              <div>CA total : <strong style={{ color: '#171717' }}>{formatEuro(totalCA)}</strong></div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          FOURNISSEURS
      ════════════════════════════════════════════════ */}
      {tab === 'suppliers' && (
        <>
          <div className="module-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <Stat label="Fournisseurs" value={supplierStats.length} icon={ShoppingBag} />
            <Stat label="Charges totales" value={formatEuro(totalExpenses)} icon={Building2} />
            <Stat label="À payer (30 j)" value={formatEuro(upcoming30)} color={upcoming30 > 0 ? '#b45309' : undefined} icon={Clock} />
            <Stat
              label="Part charges fixes"
              value={totalExpenses > 0 ? `${Math.round(totalFixed / totalExpenses * 100)} %` : '—'}
              icon={Zap}
              sub={`${formatEuro(totalFixed)} fixes · ${formatEuro(totalVariable)} variables`}
            />
          </div>

          {supplierStats.length > 0 && (
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div className="section-head">
                <div>
                  <div className="section-title">Top {Math.min(supplierStats.length, 8)} fournisseurs</div>
                  <div className="section-subtitle">Dépenses TTC cumulées</div>
                </div>
              </div>
              <div style={{ height: Math.min(supplierStats.slice(0, 8).length * 46 + 20, 380) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={supplierStats.slice(0, 8).map((s) => ({
                      name: s.name.length > 20 ? s.name.slice(0, 20) + '…' : s.name,
                      total: Math.round(s.total),
                    }))}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={12} axisLine={false} tickLine={false} width={140} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatEuro(v), 'Charges TTC']} />
                    <Bar dataKey="total" fill="#1a1a1a" radius={[0, 4, 4, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fournisseur</th>
                    <th className="right">Total</th>
                    <th className="right">Factures</th>
                    <th>Catégorie</th>
                    <th className="right">Part fixe</th>
                    <th className="right">À payer (30 j)</th>
                    <th className="right">Tendance</th>
                    <th>Dernière charge</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierStats.map((s) => (
                    <tr key={s.name}>
                      <td className="strong">{s.name}</td>
                      <td className="right numeric">{formatEuro(s.total)}</td>
                      <td className="right numeric">{s.count}</td>
                      <td><span className="badge badge-default">{s.topCat}</span></td>
                      <td className="right numeric">
                        {s.fixed > 0 ? <span className="badge badge-gold">{formatEuro(s.fixed)}</span> : <span style={{ color: '#a3a3a3' }}>—</span>}
                      </td>
                      <td className="right numeric" style={{ color: s.upcoming30 > 0 ? '#b45309' : '#a3a3a3' }}>
                        {s.upcoming30 > 0 ? formatEuro(s.upcoming30) : '—'}
                      </td>
                      <td className="right"><Trend pct={s.trend} /></td>
                      <td>{s.lastDate ? formatDate(s.lastDate) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <div>{supplierStats.length} fournisseur{supplierStats.length > 1 ? 's' : ''}</div>
              <div>Total charges : <strong style={{ color: '#171717' }}>{formatEuro(totalExpenses)}</strong></div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          ENTREPRISE
      ════════════════════════════════════════════════ */}
      {tab === 'company' && (
        <>
          <div className="module-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <Stat
              label="Croissance mois"
              value={companyStats.growthMoM > 0 ? `+${companyStats.growthMoM} %` : `${companyStats.growthMoM} %`}
              color={companyStats.growthMoM > 0 ? '#059669' : companyStats.growthMoM < 0 ? '#dc2626' : undefined}
              icon={TrendingUp}
              sub="vs mois précédent"
            />
            <Stat
              label="Croissance trimestre"
              value={companyStats.growthQoQ > 0 ? `+${companyStats.growthQoQ} %` : `${companyStats.growthQoQ} %`}
              color={companyStats.growthQoQ > 0 ? '#059669' : companyStats.growthQoQ < 0 ? '#dc2626' : undefined}
              icon={Zap}
              sub="T actuel vs T-1"
            />
            <Stat
              label="Marge nette"
              value={`${companyStats.globalMargin} %`}
              color={companyStats.globalMargin >= 30 ? '#059669' : companyStats.globalMargin >= 10 ? '#b45309' : '#dc2626'}
              icon={Target}
              sub={`Résultat net : ${formatEuro(companyStats.totalNet)}`}
            />
            <Stat
              label="Seuil de rentabilité"
              value={companyStats.breakEven > 0 ? formatEuro(companyStats.breakEven) : '—'}
              icon={ArrowUpRight}
              color={totalCA >= companyStats.breakEven && companyStats.breakEven > 0 ? '#059669' : '#b45309'}
              sub={
                companyStats.breakEven > 0
                  ? totalCA >= companyStats.breakEven
                    ? 'Point mort atteint ✓'
                    : `Manque ${formatEuro(companyStats.breakEven - totalCA)}`
                  : undefined
              }
            />
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <div className="section-head">
              <div>
                <div className="section-title">Performance mensuelle — 7 mois</div>
                <div className="section-subtitle">CA, charges et marge nette (%)</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {companyStats.bestMonth && (
                  <span className="badge badge-success">Meilleur : {companyStats.bestMonth.month}</span>
                )}
                {companyStats.worstMonth && companyStats.worstMonth.month !== companyStats.bestMonth?.month && (
                  <span className="badge badge-warning">Plus faible : {companyStats.worstMonth.month}</span>
                )}
              </div>
            </div>
            <div className="chart-legend" style={{ marginBottom: 16 }}>
              <span className="legend-dot"><span style={{ background: '#C6A75E' }} />CA</span>
              <span className="legend-dot"><span style={{ background: '#d4d4d4' }} />Charges</span>
              <span className="legend-dot"><span style={{ background: '#1a1a1a' }} />Marge %</span>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={companyStats.monthlyWithMargin} margin={{ top: 5, right: 40, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v, name) => name === 'marge' ? [`${v} %`, 'Marge'] : [formatEuro(v), name === 'ca' ? 'CA' : 'Charges']}
                  />
                  <Bar yAxisId="left" dataKey="ca" fill="#C6A75E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar yAxisId="left" dataKey="charges" fill="#d4d4d4" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Line yAxisId="right" type="monotone" dataKey="marge" stroke="#1a1a1a" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="section-title">Détail mensuel</div>
              {companyStats.projectedCA > 0 && (
                <span style={{ fontSize: 13, color: '#737373' }}>
                  CA projeté ce mois : <strong style={{ color: '#171717' }}>{formatEuro(companyStats.projectedCA)}</strong>
                  {companyStats.projectedNet > 0 && (
                    <span style={{ color: '#059669', marginLeft: 8 }}>→ résultat est. {formatEuro(companyStats.projectedNet)}</span>
                  )}
                </span>
              )}
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th className="right">CA TTC</th>
                    <th className="right">Charges TTC</th>
                    <th className="right">Résultat net</th>
                    <th className="right">Marge</th>
                  </tr>
                </thead>
                <tbody>
                  {[...companyStats.monthlyWithMargin].reverse().map((m) => {
                    const net = m.ca - m.charges;
                    const isEmpty = m.ca === 0 && m.charges === 0;
                    return (
                      <tr key={m.month}>
                        <td className="strong">{m.month}</td>
                        <td className="right numeric" style={{ color: m.ca > 0 ? '#171717' : '#a3a3a3', fontWeight: m.ca > 0 ? 500 : 400 }}>
                          {formatEuro(m.ca)}
                        </td>
                        <td className="right numeric" style={{ color: m.charges > 0 ? '#171717' : '#a3a3a3', fontWeight: m.charges > 0 ? 500 : 400 }}>
                          {formatEuro(m.charges)}
                        </td>
                        <td className="right numeric" style={{ fontWeight: 600, color: isEmpty ? '#a3a3a3' : net > 0 ? '#059669' : net < 0 ? '#dc2626' : '#a3a3a3' }}>
                          {isEmpty ? '—' : formatEuro(net)}
                        </td>
                        <td className="right">
                          {m.marge > 0 ? (
                            <span style={{ fontSize: 13, fontWeight: 500, color: m.marge >= 30 ? '#059669' : m.marge >= 10 ? '#b45309' : '#dc2626' }}>
                              {m.marge} %
                            </span>
                          ) : <span style={{ color: '#a3a3a3' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          TRÉSORERIE
      ════════════════════════════════════════════════ */}
      {tab === 'treasury' && (
        <>
          <div className="module-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <Stat
              label="Solde actuel"
              value={formatEuro(treasuryStats.solde)}
              color={treasuryStats.solde < 0 ? '#dc2626' : undefined}
              icon={Wallet}
            />
            <Stat
              label="Projection J+7"
              value={formatEuro(treasuryStats.proj7)}
              color={treasuryStats.proj7 < 0 ? '#dc2626' : undefined}
              icon={Zap}
              sub="Avec flux prévus"
            />
            <Stat
              label="Projection J+30"
              value={formatEuro(treasuryStats.proj30)}
              color={treasuryStats.proj30 < 0 ? '#dc2626' : undefined}
              icon={ArrowUpRight}
              sub={`+${formatEuro(treasuryStats.incoming30)} / −${formatEuro(treasuryStats.outgoing30)}`}
            />
            <Stat
              label="Jours de trésorerie"
              value={
                treasuryStats.daysRemaining === null ? '—'
                : treasuryStats.daysRemaining <= 0 ? 'Déficit'
                : `${treasuryStats.daysRemaining} j`
              }
              color={
                treasuryStats.isCritical ? '#dc2626'
                : treasuryStats.isWarning ? '#b45309'
                : treasuryStats.daysRemaining !== null ? '#059669'
                : undefined
              }
              icon={Clock}
              sub="Au rythme actuel"
            />
          </div>

          {treasuryStats.daysRemaining !== null && (
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div className="section-head">
                <div>
                  <div className="section-title">Santé de trésorerie</div>
                  <div className="section-subtitle">
                    {treasuryStats.daysRemaining <= 0
                      ? 'Solde en déficit — agissez immédiatement'
                      : `${treasuryStats.daysRemaining} jours estimés au rythme actuel des dépenses`}
                  </div>
                </div>
                <span className={`badge ${treasuryStats.isCritical ? 'badge-danger' : treasuryStats.isWarning ? 'badge-warning' : 'badge-success'}`}>
                  {treasuryStats.isCritical ? 'Critique' : treasuryStats.isWarning ? 'Vigilance' : 'Saine'}
                </span>
              </div>
              <div style={{ background: '#f5f5f5', borderRadius: 9999, height: 12, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 9999,
                  background: treasuryStats.isCritical ? '#ef4444' : treasuryStats.isWarning ? '#f59e0b' : '#10b981',
                  width: `${Math.max(0, Math.min(treasuryStats.daysRemaining / 180 * 100, 100))}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#a3a3a3', marginTop: 6 }}>
                <span>0 j</span>
                <span>30 j — critique</span>
                <span>60 j — vigilance</span>
                <span>180 j — serein</span>
              </div>
            </div>
          )}

          {futureFlows.length > 0 ? (
            <div className="card">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
                <div className="section-title">Flux à venir — 60 jours</div>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Échéance</th>
                      <th>Type</th>
                      <th>Tiers</th>
                      <th>Catégorie</th>
                      <th className="right">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {futureFlows.map((f, i) => (
                      <tr key={i}>
                        <td>{formatDate(f.effectiveDate)}</td>
                        <td>
                          {f.kind === 'sale'
                            ? <span className="badge badge-success">Encaissement</span>
                            : <span className="badge badge-warning">Décaissement</span>}
                        </td>
                        <td className="strong">{f.client || f.supplier || f.description || '—'}</td>
                        <td>{f.category ? <span className="badge badge-default">{f.category}</span> : '—'}</td>
                        <td className="right numeric" style={{ fontWeight: 600, color: f.kind === 'sale' ? '#047857' : '#b91c1c' }}>
                          {f.kind === 'sale' ? '+' : '−'}{formatEuro(parseFloat(f.ttc) || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <div>{futureFlows.length} flux prévus</div>
                <div>
                  <span style={{ color: '#047857', marginRight: 16 }}>
                    +{formatEuro(futureFlows.filter((f) => f.kind === 'sale').reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0))}
                  </span>
                  <span style={{ color: '#b91c1c' }}>
                    −{formatEuro(futureFlows.filter((f) => f.kind === 'expense').reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#a3a3a3' }}>
                Ajoutez des dates d&apos;échéance à vos ventes et charges pour voir les flux prévus.
              </p>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════
          ALERTES
      ════════════════════════════════════════════════ */}
      {tab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alertCount === 0 && (
            <div style={{ fontSize: 13, color: '#737373', marginBottom: 4 }}>
              Toutes les métriques sont dans les seuils normaux.
            </div>
          )}
          {alerts.map((a, i) => <AlertCard key={i} {...a} />)}
        </div>
      )}
    </>
  );
}
