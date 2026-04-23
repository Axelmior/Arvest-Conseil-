import { Wallet, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import { formatEuro } from '../utils/format';

export default function Treasury() {
  const solde = 0;
  const encaissements = 0;
  const decaissements = 0;
  const previsionJ30 = 0;

  const forecastData = [];
  const upcoming = [];
  const outgoing = [];

  return (
    <>
      <div className="dash-kpis">
        <div
          className="kpi-card"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 128,
            height: 128,
            borderRadius: '50%',
            background: '#C6A75E',
            opacity: 0.1,
            marginRight: -40,
            marginTop: -40
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(198, 167, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
            <div style={{ fontSize: 12, color: '#a3a3a3' }}>Compte principal · BNP Paribas</div>
          </div>
        </div>

        <KPICard label="Encaissements du mois" value={formatEuro(encaissements)} trend="up" trendValue="+8,2%" icon={ArrowUpRight} />
        <KPICard label="Décaissements du mois" value={formatEuro(decaissements)} trend="down" trendValue="-2,1%" icon={ArrowDownRight} />
        <KPICard label="Prévision à 30 jours" value={formatEuro(previsionJ30)} trend="up" trendValue="+22,4%" icon={Zap} accent />
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="section-head">
          <div>
            <div className="section-title">Évolution et prévision de trésorerie</div>
            <div className="section-subtitle">Projection basée sur vos encaissements et décaissements prévus</div>
          </div>
          <span className="badge badge-gold">Prévision</span>
        </div>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTreasury" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C6A75E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#C6A75E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" stroke="#a3a3a3" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#a3a3a3" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => formatEuro(v)}
              />
              <Area type="monotone" dataKey="solde" stroke="#C6A75E" strokeWidth={3} fill="url(#gradTreasury)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dash-row dash-row-1-1">
        <div className="card" style={{ padding: 24 }}>
          <h3 className="section-title" style={{ marginBottom: 16 }}>Encaissements à venir</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.length === 0 ? (
              <p style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', padding: '24px 0' }}>
                Aucun encaissement prévu
              </p>
            ) : upcoming.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: 8,
                  background: 'rgba(236, 253, 245, 0.5)',
                  border: '1px solid #d1fae5'
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#171717' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#737373' }}>{item.date}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#047857' }}>+{formatEuro(item.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 className="section-title" style={{ marginBottom: 16 }}>Décaissements prévus</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {outgoing.length === 0 ? (
              <p style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', padding: '24px 0' }}>
                Aucun décaissement prévu
              </p>
            ) : outgoing.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  borderRadius: 8,
                  background: '#fafafa',
                  border: '1px solid #e5e5e5'
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#171717' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#737373' }}>{item.date}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#525252' }}>−{formatEuro(item.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
