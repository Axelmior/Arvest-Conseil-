import { Menu, Bell } from 'lucide-react';
import './TopBar.css';

export default function TopBar({ title, subtitle, onMenuClick, children }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu" onClick={onMenuClick} aria-label="Ouvrir le menu">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="topbar-actions">
        {children}
        <button className="topbar-bell" aria-label="Notifications">
          <Bell size={18} />
          <span className="topbar-bell-dot" />
        </button>
      </div>
    </div>
  );
}
