import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';
import { computeAlerts } from '../utils/alertEngine';
import { sendAlertEmail } from '../utils/emailService';

const NotifContext = createContext(null);

const TYPE_MAP = { critical: 'danger', warning: 'warning', success: 'info' };

function readKey(email) { return `arvest_notif_read_${email}`; }

function loadRead(email) {
  try { return new Set(JSON.parse(localStorage.getItem(readKey(email)) || '[]')); }
  catch { return new Set(); }
}

function persistRead(email, set) {
  try { localStorage.setItem(readKey(email), JSON.stringify([...set])); }
  catch {}
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { sales, expenses, kpis, treasury, futureFlows } = useData();
  const [readIds, setReadIds] = useState(() => loadRead(user?.email));

  // Source unique d'alertes — partagée avec AlertsPanel et Analytics
  const rawAlerts = useMemo(
    () => computeAlerts({ sales, expenses, kpis, treasury, futureFlows }),
    [sales, expenses, kpis, treasury, futureFlows],
  );

  // Conversion vers le format attendu par TopBar / NotifDropdown
  const notifications = useMemo(
    () => rawAlerts.map((a) => ({
      id:      a.id,
      type:    TYPE_MAP[a.type] || 'info',
      icon:    a.icon,
      title:   a.title,
      message: a.message,
      date:    a.date,
    })),
    [rawAlerts],
  );

  // Envoi des emails d'alerte après 8 s de stabilité (debounce)
  const emailTimerRef = useRef(null);
  useEffect(() => {
    if (!user?.email || !user?.isAuthorized) return;
    const alertable = notifications.filter((n) => n.type === 'danger' || n.type === 'warning');
    if (!alertable.length) return;
    clearTimeout(emailTimerRef.current);
    emailTimerRef.current = setTimeout(() => {
      alertable.forEach((n) => { sendAlertEmail(user, n).catch(() => {}); });
    }, 8000);
    return () => clearTimeout(emailTimerRef.current);
  }, [notifications, user?.email, user?.isAuthorized]);

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (user?.email) persistRead(user.email, next);
      return next;
    });
  }, [user?.email]);

  const markAllRead = useCallback(() => {
    const all = new Set(notifications.map((n) => n.id));
    if (user?.email) persistRead(user.email, all);
    setReadIds(all);
  }, [notifications, user?.email]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, readIds, markRead, markAllRead }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
}
