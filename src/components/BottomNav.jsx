import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Receipt, Wallet, BarChart3 } from 'lucide-react';
import './BottomNav.css';

const NAV = [
  { to: '/dashboard', label: 'Accueil', icon: LayoutDashboard, end: true },
  { to: '/dashboard/sales', label: 'Ventes', icon: TrendingUp },
  { to: '/dashboard/expenses', label: 'Charges', icon: Receipt },
  { to: '/dashboard/treasury', label: 'Tréso', icon: Wallet },
  { to: '/dashboard/analytics', label: 'Analyses', icon: BarChart3 },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            isActive ? 'bottom-nav-item bottom-nav-item-active' : 'bottom-nav-item'
          }
        >
          <div className="bottom-nav-icon-wrap">
            <item.icon size={20} strokeWidth={2} />
          </div>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
