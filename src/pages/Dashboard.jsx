import { TrendingUp, Receipt, Target, Award } from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import KPICard from '../components/KPICard';
import { formatEuro } from '../utils/format';
import { useData } from '../context/DataContext';

export default function Dashboard() {
  const { kpis, treasury, MONTHLY_DATA, CASH_EVOLUTION, CATEGORY_DATA, TOP_CLIENTS } = useData();

  const categoryTotal = CATEGORY_DATA.reduce((s, c) => s + c.value, 0);

  return (
    <>
      {/* KPIs */}
      <div className="dash-kpis">
        <KPICard label="Chiffre d'affaires" value={formatEuro(kpis.ca)} trend="up" trendValue="+12,4%" icon={TrendingUp} accent />
        <KPICard label="Charges totales" value={formatEuro(kpis.charges)} trend="up" trendValue="+3,2%" icon={Receipt} />
        <KPICard label="Résultat net" value={formatEuro(kpis.net)} trend="up" trendValue="+18,7%" icon={Target} accent />
        <KPICard label="Marge" value={`${kpis.margin}%`} trend="up" trendValue="+2,1pt" icon={Award} />
      </div>

      {/* Graphiques */}
      <div className="dash-row dash-row-2-1">
        <div className="card" style={{ padding: 24 }}>
          <div className="section-head">
            <div>
              <div className="section-title">Évolution du chiffre d'affaires</div>
              <div className="section-subtitle">7 derniers mois</div>
            </div>
            <div className="chart-legend">
              <div className="legend-dot"><span style={{ background: '#C6A75E' }} /> CA</div>
              <div className="legend-dot"><span style={{ background: '#a3a3a3' }} /> Charges</div>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C6A75E" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#C6A75E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCharges" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#737373" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#737373" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => formatEuro(v)}
                />
                <Area type="monotone" dataKey="ca" stroke="#C6A75E" strokeWidth={2.5} fill="url(#gradCA)" />
                <Area type="monotone" dataKey="charges" stroke="#737373" strokeWidth={2} fill="url(#gradCharges)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <div className="section-title">Charges par catégorie</div>
            <div className="section-subtitle">Mois en cours</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CATEGORY_DATA.map((cat, i) => {
              const pct = categoryTotal > 0 ? (cat.value / categoryTotal) * 100 : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: '#525252' }}>{cat.name}</span>
                    <span style={{ fontWeight: 500, color: '#171717' }}>{formatEuro(cat.value)}</span>
                  </div>
                  <div style={{ height: 6, background: '#f5f5f5', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: cat.color, borderRadius: 9999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top clients + trésorerie */}
      <div className="dash-row dash-row-1-1">
        <div className="card" style={{ padding: 24 }}>
          <div className="section-head">
            <div>
              <div className="section-title">Top clients</div>
              <div className="section-subtitle">Par chiffre d'affaires</div>
            </div>
            <span className="badge badge-gold">Top 5</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TOP_CLIENTS.map((client, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#525252',
                    flexShrink: 0
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.name}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#171717', marginLeft: 8 }}>
                      {formatEuro(client.value)}
                    </span>
                  </div>
                  <div style={{ height: 4, background: '#f5f5f5', borderRadius: 9999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${client.percentage}%`,
                        height: '100%',
                        background: i === 0 ? '#C6A75E' : '#525252',
                        borderRadius: 9999
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="section-head">
            <div>
              <div className="section-title">Évolution de la trésorerie</div>
              <div className="section-subtitle">30 derniers jours</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#737373' }}>Solde actuel</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#171717' }}>{formatEuro(treasury.solde)}</div>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CASH_EVOLUTION} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#a3a3a3" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => formatEuro(v)}
                />
                <Line
                  type="monotone"
                  dataKey="solde"
                  stroke="#1a1a1a"
                  strokeWidth={2.5}
                  dot={{ fill: '#C6A75E', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
