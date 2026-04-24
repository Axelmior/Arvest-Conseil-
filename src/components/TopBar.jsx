import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, CheckCheck, Clock, Wallet, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import './TopBar.css';

const ICON_MAP = {
  clock:         Clock,
  wallet:        Wallet,
  trending_up:   TrendingUp,
  trending_down: TrendingDown,
  receipt:       Receipt,
};

const TYPE_STYLE = {
  danger:  { bg: '#fef2f2', color: '#ef4444' },
  warning: { bg: '#fffbeb', color: '#f59e0b' },
  info:    { bg: '#eff6ff', color: '#3b82f6' },
  success: { bg: '#f0fdf4', color: '#10b981' },
};

function NotifIconBox({ icon, type }) {
  const Icon = ICON_MAP[icon] || Bell;
  const s = TYPE_STYLE[type] || { bg: '#f5f5f5', color: '#525252' };
  return (
    <div style={{ width: 34, height: 34, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={15} color={s.color} />
    </div>
  );
}

export default function TopBar({ title, subtitle, onMenuClick, children }) {
  const { notifications, unreadCount, readIds, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const handleNotifClick = (id) => {
    markRead(id);
  };

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
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            className={`topbar-bell${open ? ' topbar-bell-active' : ''}`}
            aria-label="Notifications"
            onClick={() => setOpen((s) => !s)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="topbar-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {open && (
            <div className="notif-dropdown animate-fade-in">
              <div className="notif-dropdown-head">
                <span className="notif-dropdown-title">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="notif-count-badge">{unreadCount}</span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    <CheckCheck size={13} /> Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={28} color="#d4d4d4" />
                    <span>Aucune alerte active</span>
                    <span style={{ fontSize: 12 }}>Tout est sous contrôle.</span>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isRead = readIds.has(n.id);
                    return (
                      <button
                        key={n.id}
                        className={`notif-item${isRead ? ' notif-item-read' : ''}`}
                        onClick={() => handleNotifClick(n.id)}
                      >
                        <NotifIconBox icon={n.icon} type={n.type} />
                        <div className="notif-item-body">
                          <div className="notif-item-title">{n.title}</div>
                          <div className="notif-item-msg">{n.message}</div>
                        </div>
                        {!isRead && <span className="notif-unread-dot" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
