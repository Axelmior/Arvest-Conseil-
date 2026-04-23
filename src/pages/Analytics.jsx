import { Sparkles } from 'lucide-react';

export default function Analytics() {
  return (
    <div
      className="card"
      style={{
        padding: 48,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 12,
        minHeight: 320
      }}
    >
      <Sparkles size={32} color="#C6A75E" />
      <div style={{ fontSize: 16, fontWeight: 600, color: '#171717' }}>
        Pas encore de données à analyser
      </div>
      <p style={{ fontSize: 13, color: '#737373', maxWidth: 360, lineHeight: 1.6 }}>
        Ajoutez des ventes et des charges pour que vos analyses, alertes et recommandations apparaissent ici.
      </p>
    </div>
  );
}
