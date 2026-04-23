import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './KPICard.css';

export default function KPICard({ label, value, trend, trendValue, icon: Icon, accent = false }) {
  const positive = trend === 'up';

  return (
    <div className={accent ? 'kpi-card kpi-card-accent' : 'kpi-card'}>
      {accent && <div className="kpi-decoration" />}
      <div className="kpi-top">
        <div className={accent ? 'kpi-icon kpi-icon-gold' : 'kpi-icon'}>
          {Icon && <Icon size={18} strokeWidth={2} />}
        </div>
        {trendValue && (
          <div className={positive ? 'kpi-trend kpi-trend-up' : 'kpi-trend kpi-trend-down'}>
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}
