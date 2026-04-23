import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Award,
  Receipt,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { formatEuro } from '../utils/format';

const ALERTS = [
  {
    type: 'success',
    color: '#10b981',
    bg: '#ecfdf5',
    iconColor: '#059669',
    icon: CheckCircle2,
    title: 'Très bonne rentabilité ce mois-ci',
    desc: 'Votre marge de 63,9 % dépasse votre moyenne annuelle de 8 points. Continuez ainsi.'
  },
  {
    type: 'warning',
    color: '#f59e0b',
    bg: '#fffbeb',
    iconColor: '#b45309',
    icon: AlertTriangle,
    title: 'Attention : charges en hausse',
    desc: 'Vos charges marketing ont augmenté de 42 % par rapport au mois précédent.'
  },
  {
    type: 'info',
    color: '#C6A75E',
    bg: 'rgba(198, 167, 94, 0.15)',
    iconColor: '#C6A75E',
    icon: Info,
    title: '2 factures en attente de paiement',
    desc: 'Total de 3 120 € à recouvrer. Pensez à relancer vos clients.'
  }
];

const RECOS = [
  { title: 'Relancez vos impayés', desc: '2 factures sont en attente depuis plus de 7 jours. Un rappel amical pourrait débloquer 3 120 €.' },
  { title: 'Optimisez vos charges marketing', desc: 'Vos dépenses Google Ads ont bondi sans impact visible sur le CA. Analysez le ROI avant de poursuivre.' },
  { title: 'Développez vos meilleurs clients', desc: 'Studio Lumière génère 23% de votre CA. Proposez-leur un contrat annuel pour sécuriser ce revenu.' },
  { title: 'Trésorerie saine', desc: "Votre prévision à 30 jours est positive. C'est un bon moment pour investir ou épargner." }
];

export default function Analytics() {
  return (
    <>
      {/* Alertes */}
      <div className="module-stats" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {ALERTS.map((alert, i) => (
            <div key={i} className="card" style={{ padding: 20, borderLeft: `4px solid ${alert.color}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: alert.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <alert.icon size={18} color={alert.iconColor} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#171717', marginBottom: 4 }}>{alert.title}</div>
                  <p style={{ fontSize: 13, color: '#525252', lineHeight: 1.6 }}>{alert.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicateurs intelligents */}
      <div className="dash-row dash-row-1-1">
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Award size={16} color="#C6A75E" />
            <span style={{ fontSize: 11, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Client le plus rentable
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#171717', marginBottom: 12 }}>Studio Lumière</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 12, color: '#737373' }}>CA généré</div>
              <div style={{ fontWeight: 600, color: '#171717' }}>{formatEuro(15400)}</div>
            </div>
            <div style={{ width: 1, height: 32, background: '#e5e5e5' }} />
            <div>
              <div style={{ fontSize: 12, color: '#737373' }}>Marge moyenne</div>
              <div style={{ fontWeight: 600, color: '#059669' }}>72%</div>
            </div>
            <div style={{ width: 1, height: 32, background: '#e5e5e5' }} />
            <div>
              <div style={{ fontSize: 12, color: '#737373' }}>Fréquence</div>
              <div style={{ fontWeight: 600, color: '#171717' }}>2,3 / mois</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Receipt size={16} color="#737373" />
            <span style={{ fontSize: 11, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Charge la plus importante
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#171717', marginBottom: 12 }}>Loyer bureau</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 12, color: '#737373' }}>Montant mensuel</div>
              <div style={{ fontWeight: 600, color: '#171717' }}>{formatEuro(1200)}</div>
            </div>
            <div style={{ width: 1, height: 32, background: '#e5e5e5' }} />
            <div>
              <div style={{ fontSize: 12, color: '#737373' }}>% des charges</div>
              <div style={{ fontWeight: 600, color: '#171717' }}>29%</div>
            </div>
            <div style={{ width: 1, height: 32, background: '#e5e5e5' }} />
            <div>
              <div style={{ fontSize: 12, color: '#737373' }}>Type</div>
              <span className="badge badge-gold">Fixe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparaison */}
      <div className="dash-row dash-row-1-1">
        <div className="card" style={{ padding: 24 }}>
          <h3 className="section-title" style={{ marginBottom: 16 }}>Évolution CA vs mois précédent</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#525252' }}>Mars 2026</span>
                <span style={{ fontWeight: 600, color: '#171717' }}>{formatEuro(10200)}</span>
              </div>
              <div style={{ height: 8, background: '#f5f5f5', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#a3a3a3', borderRadius: 9999, width: '82%' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#171717' }}>Avril 2026</span>
                <span style={{ fontWeight: 600, color: '#171717' }}>{formatEuro(12400)}</span>
              </div>
              <div style={{ height: 8, background: '#f5f5f5', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#C6A75E', borderRadius: 9999, width: '100%' }} />
              </div>
            </div>
            <div style={{ paddingTop: 12, borderTop: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#525252' }}>Évolution</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#059669' }}>
                <ArrowUpRight size={16} /> +21,6% (+{formatEuro(2200)})
              </span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 className="section-title" style={{ marginBottom: 16 }}>Marge mensuelle moyenne</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 600, color: '#171717', letterSpacing: '-0.02em' }}>
              61,4<span style={{ fontSize: 22, color: '#a3a3a3' }}>%</span>
            </div>
            <span className="badge badge-success">+2,5 pt</span>
          </div>
          <p style={{ fontSize: 13, color: '#525252', marginBottom: 16 }}>Sur les 6 derniers mois</p>
          <div style={{ height: 100 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { m: 'Nov', v: 58 },
                { m: 'Déc', v: 62 },
                { m: 'Jan', v: 59 },
                { m: 'Fév', v: 60 },
                { m: 'Mar', v: 63 },
                { m: 'Avr', v: 64 }
              ]}>
                <XAxis dataKey="m" fontSize={10} axisLine={false} tickLine={false} stroke="#a3a3a3" />
                <Bar dataKey="v" fill="#C6A75E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div
        className="card"
        style={{ padding: 24, background: 'linear-gradient(135deg, #fafaf9 0%, #ffffff 100%)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkles size={16} color="#C6A75E" />
          <h3 className="section-title">Recommandations personnalisées</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {RECOS.map((r, i) => (
            <div key={i} style={{ padding: 16, background: 'white', borderRadius: 8, border: '1px solid #e5e5e5' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#171717', marginBottom: 4 }}>{r.title}</div>
              <p style={{ fontSize: 12, color: '#525252', lineHeight: 1.6 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
