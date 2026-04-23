import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/sales', label: 'Ventes', icon: TrendingUp },
  { to: '/dashboard/expenses', label: 'Charges', icon: Receipt },
  { to: '/dashboard/treasury', label: 'Trésorerie', icon: Wallet },
  { to: '/dashboard/analytics', label: 'Analyses', icon: BarChart3 },
  { to: '/dashboard/settings', label: 'Paramètres', icon: Settings }
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : 'U';

  const content = (
    <>
      <div className="sidebar-header">
        <Logo />
        <button className="sidebar-close" onClick={onClose} aria-label="Fermer le menu">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
            }
          >
            <item.icon size={16} strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name">{user?.name}</div>
              <div className="user-company">{user?.company}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="sidebar sidebar-desktop">{content}</aside>
      {mobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={onClose}>
          <aside className="sidebar sidebar-mobile" onClick={(e) => e.stopPropagation()}>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
