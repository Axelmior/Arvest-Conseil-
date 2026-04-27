import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';
import { formatEuro, formatDate } from '../utils/format';
import { sendAlertEmail } from '../utils/emailService';

const NotifContext = createContext(null);

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

  const notifications = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const list = [];

    // ── Factures en retard ──────────────────────────────────────────────────
    sales
      .filter((s) => s.status === 'pending' && s.dueDate && s.dueDate < today)
      .forEach((s) =>
        list.push({
          id:      `overdue_${s.id}`,
          type:    'danger',
          icon:    'clock',
          title:   'Facture en retard',
          message: `${s.client} — ${formatEuro(parseFloat(s.ttc) || 0)} (échue le ${formatDate(s.dueDate)})`,
          date:    today,
        })
      );

    // ── Trésorerie ──────────────────────────────────────────────────────────
    if (treasury.solde < 0) {
      list.push({
        id:      'treasury_negative',
        type:    'danger',
        icon:    'wallet',
        title:   'Trésorerie négative',
        message: `Solde actuel : ${formatEuro(treasury.solde)}. Vérifiez vos flux entrants.`,
        date:    today,
      });
    } else if (kpis.ca > 0 && treasury.solde < kpis.ca * 0.1) {
      list.push({
        id:      'treasury_low',
        type:    'warning',
        icon:    'wallet',
        title:   'Trésorerie faible',
        message: `Votre solde (${formatEuro(treasury.solde)}) représente moins de 10 % de votre CA.`,
        date:    today,
      });
    }

    // ── Encaissements à venir dans les 7 jours ─────────────────────────────
    const horizon7 = new Date();
    horizon7.setDate(horizon7.getDate() + 7);
    const h7str = horizon7.toISOString().slice(0, 10);
    const soon = futureFlows.filter((f) => f.kind === 'sale' && f.effectiveDate <= h7str);
    if (soon.length > 0) {
      const total = soon.reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);
      list.push({
        id:      `upcoming_${h7str}`,
        type:    'info',
        icon:    'trending_up',
        title:   'Encaissements à venir',
        message: `${soon.length} encaissement${soon.length > 1 ? 's' : ''} dans les 7 jours — ${formatEuro(total)}`,
        date:    today,
      });
    }

    // ── Marge faible ────────────────────────────────────────────────────────
    if (kpis.ca > 0 && kpis.margin < 20) {
      list.push({
        id:      `low_margin_${Math.round(kpis.margin)}`,
        type:    'warning',
        icon:    'trending_down',
        title:   'Marge nette faible',
        message: `Marge actuelle : ${kpis.margin.toFixed(1)} %. Analysez vos charges variables.`,
        date:    today,
      });
    }

    // ── Charges en hausse vs mois précédent ─────────────────────────────────
    const now = new Date();
    const curPfx  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prev    = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevPfx = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    const curExp  = expenses.filter((e) => e.date?.startsWith(curPfx)).reduce((s, e) => s + (parseFloat(e.ttc) || 0), 0);
    const prevExp = expenses.filter((e) => e.date?.startsWith(prevPfx)).reduce((s, e) => s + (parseFloat(e.ttc) || 0), 0);
    if (prevExp > 0 && curExp > prevExp * 1.2) {
      const pct = Math.round((curExp / prevExp - 1) * 100);
      list.push({
        id:      `expenses_high_${curPfx}`,
        type:    'warning',
        icon:    'receipt',
        title:   'Charges en hausse',
        message: `Vos charges ce mois sont en hausse de ${pct} % par rapport au mois précédent.`,
        date:    today,
      });
    }

    return list;
  }, [sales, expenses, kpis, treasury, futureFlows]);

  // Trigger alert emails for new danger/warning notifications (after 8s debounce)
  const emailTimerRef = useRef(null);
  useEffect(() => {
    if (!user?.email || !user?.isAuthorized) return;
    const alertable = notifications.filter(n => n.type === 'danger' || n.type === 'warning');
    if (!alertable.length) return;
    clearTimeout(emailTimerRef.current);
    emailTimerRef.current = setTimeout(() => {
      alertable.forEach(n => { sendAlertEmail(user, n).catch(() => {}); });
    }, 8000);
    return () => clearTimeout(emailTimerRef.current);
  }, [notifications, user?.email]);

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
