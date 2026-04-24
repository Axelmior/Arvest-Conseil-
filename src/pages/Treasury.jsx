import { useMemo } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import KPICard from '../components/KPICard';
import { formatEuro, formatDate } from '../utils/format';
import { useData } from '../context/DataContext';

export default function Treasury() {
  const { treasury, futureFlows } = useData();
  const { solde, encaissements, decaissements, previsionJ30 } = treasury;

  // 60-day forecast chart: project running balance from today
  const forecastData = useMemo(() => {
    const today = new Date();
    const sorted = [...futureFlows].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
    let flowIdx = 0;
    let running = solde;
    const points = [];

    for (let i = 0; i <= 60; i += 5) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

      while (flowIdx < sorted.length && sorted[flowIdx].effectiveDate <= dateStr) {
        const f = sorted[flowIdx];
        running += f.kind === 'sale'
          ? (parseFloat(f.ttc) || 0)
          : -(parseFloat(f.ttc) || 0);
        flowIdx++;
      }

      points.push({
        label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        solde: Math.round(running),
      });
    }
    return points;
  }, [solde, futureFlows]);

  const incoming = futureFlows.filter((f) => f.kind === 'sale');
  const outgoing = futureFlows.filter((f) => f.kind === 'expense');

  const incomingTotal = incoming.reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);
  const outgoingTotal = outgoing.reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);

  return (
    <>
      <div className="dash-kpis">
        {/* Solde actuel */}
        <div
          className="kpi-card"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 128, height: 128, borderRadius: '50%',
            background: '#C6A75E', opacity: 0.1,
            marginRight: -40, marginTop: -40,
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(198,167,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Wallet size={16} color="#C6A75E" />
              </div>
              <span style={{ fontSize: 11, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Solde actuel
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 4, letterSpacing: '-0.02em' }}>
              {formatEuro(solde)}
            </div>
            <div style={{ fontSize: 12, color: '#a3a3a3' }}>Trésorerie nette (encaissé − décaissé)</div>
          </div>
        </div>

        <KPICard label="Encaissements réalisés" value={formatEuro(encaissements)} trend="up" trendValue="" icon={ArrowUpRight} />
        <KPICard label="Décaissements réalisés" value={formatEuro(decaissements)} trend="down" trendValue="" icon={ArrowDownRight} />
        <KPICard label="Prévision à 60 jours" value={formatEuro(Math.round(solde + incomingTotal - outgoingTotal))} trend="up" trendValue="" icon={Zap} accent />
      </div>

      {/* 60-day forecast chart */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="section-head">
          <div>
            <div className="section-title">Prévision de trésorerie — 60 jours</div>
            <div className="section-subtitle">
              Projection basée sur vos échéances à venir ({futureFlows.length} flux identifiés)
            </div>
          </div>
          <span className="badge badge-gold">Prévision</span>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTreasury" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C6A75E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#C6A75E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [formatEuro(v), 'Solde']}
              />
              <ReferenceLine y={0} stroke="#e5e5e5" strokeDasharray="4 2" />
              <Area type="monotone" dataKey="solde" stroke="#C6A75E" strokeWidth={2.5} fill="url(#gradTreasury)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {futureFlows.length === 0 && (
          <p style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', marginTop: 8 }}>
            Ajoutez des dates d&apos;échéance à vos ventes et charges pour voir la projection.
          </p>
        )}
      </div>

      {/* Upcoming flows */}
      <div className="dash-row dash-row-1-1">
        {/* Encaissements à venir */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Encaissements à venir</h3>
            {incoming.length > 0 && (
              <span style={{ fontSize: 13, fontWeight: 600, color: '#047857' }}>+{formatEuro(incomingTotal)}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {incoming.length === 0 ? (
              <p style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', padding: '24px 0' }}>
                Aucun encaissement prévu dans les 60 jours
              </p>
            ) : incoming.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 12, borderRadius: 8,
                  background: 'rgba(236,253,245,0.5)', border: '1px solid #d1fae5',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#171717' }}>
                    {item.client || item.description || '—'}
                  </div>
                  <div style={{ fontSize: 12, color: '#059669' }}>
                    Échéance : {formatDate(item.effectiveDate)}
                    {item.category && <span style={{ marginLeft: 8, color: '#737373' }}>{item.category}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#047857', flexShrink: 0, marginLeft: 12 }}>
                  +{formatEuro(parseFloat(item.ttc) || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Décaissements prévus */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Décaissements prévus</h3>
            {outgoing.length > 0 && (
              <span style={{ fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>−{formatEuro(outgoingTotal)}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {outgoing.length === 0 ? (
              <p style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', padding: '24px 0' }}>
                Aucun décaissement prévu dans les 60 jours
              </p>
            ) : outgoing.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 12, borderRadius: 8,
                  background: '#fafafa', border: '1px solid #e5e5e5',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#171717' }}>
                    {item.supplier || item.description || '—'}
                  </div>
                  <div style={{ fontSize: 12, color: '#b45309' }}>
                    Échéance : {formatDate(item.effectiveDate)}
                    {item.category && <span style={{ marginLeft: 8, color: '#737373' }}>{item.category}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#b91c1c', flexShrink: 0, marginLeft: 12 }}>
                  −{formatEuro(parseFloat(item.ttc) || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
