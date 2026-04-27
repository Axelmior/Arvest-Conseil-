import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, Clock, XCircle, ShieldCheck,
  ArrowLeft, Trash2, RefreshCw, Ban, TrendingUp,
  DollarSign, UserCheck, Activity, BarChart3,
  LogIn, Package, Mail, Send, AlertTriangle, MailCheck,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { sendAccessGrantedEmail, loadEmailLog, loadEmailPrefs } from '../utils/emailService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLastLogin(email) {
  try {
    const devices = JSON.parse(localStorage.getItem(`arvest_devices_${email.toLowerCase()}`) || '[]');
    if (!devices.length) return null;
    return devices.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))[0].lastSeen;
  } catch { return null; }
}

function getUserDataCount(email) {
  try {
    const sales    = JSON.parse(localStorage.getItem(`arvest_sales_${email.toLowerCase()}`)    || '[]');
    const expenses = JSON.parse(localStorage.getItem(`arvest_expenses_${email.toLowerCase()}`) || '[]');
    return sales.length + expenses.length;
  } catch { return 0; }
}

function isThisMonth(iso) {
  if (!iso) return false;
  const d = new Date(iso), now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtFull(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ u }) {
  if (u.isAdmin)      return <span className="badge badge-gold"><ShieldCheck size={11} /> Admin</span>;
  if (u.isAuthorized) return <span className="badge badge-success"><CheckCircle2 size={11} /> Actif</span>;
  if (u.requestedAt)  return <span className="badge badge-warning"><Clock size={11} /> En attente</span>;
  return                     <span className="badge badge-default"><XCircle size={11} /> Inactif</span>;
}

function StatCard({ label, value, icon: Icon, color = '#171717', accent, sub }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
          {label}
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: accent || 'rgba(0,0,0,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function UserAvatar({ u, size = 32 }) {
  const letter = (u.name || u.email)[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: u.isAdmin ? 'rgba(198,167,94,0.15)' : '#f0f0f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700,
      color: u.isAdmin ? '#8B7235' : '#525252',
    }}>
      {letter}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { user, getAllUsers, authorizeUser, blockUser, deleteUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users,    setUsers]    = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [tab,      setTab]      = useState('dashboard');
  const [emailLog, setEmailLog] = useState([]);

  const refresh = () => { setUsers(getAllUsers()); setEmailLog(loadEmailLog()); };
  useEffect(() => { refresh(); }, []);

  const handleActivate = (email) => {
    authorizeUser(email);
    const reg = getAllUsers().find(u => u.email === email.toLowerCase());
    if (reg) sendAccessGrantedEmail(reg).catch(() => {});
    refresh();
  };
  const handleBlock = (email) => { blockUser(email); refresh(); };
  const handleDelete   = (email) => {
    if (window.confirm(`Supprimer le compte "${email}" ? Action irréversible.`)) {
      deleteUser(email); refresh();
    }
  };

  // ── Computed stats ──────────────────────────────────────────────────────────
  const nonAdminUsers  = users.filter(u => !u.isAdmin);
  const activeUsers    = users.filter(u =>  u.isAuthorized ||  u.isAdmin);
  const pendingUsers   = users.filter(u => !u.isAuthorized && !u.isAdmin);
  const newThisMonth   = users.filter(u =>  isThisMonth(u.createdAt));
  const activeNonAdmin = nonAdminUsers.filter(u => u.isAuthorized);
  const pendingRequests = users
    .filter(u => !u.isAuthorized && !u.isAdmin && u.requestedAt)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  const monthlyRevenue  = activeNonAdmin.length * 49;
  const activationRate  = nonAdminUsers.length > 0
    ? Math.round((activeNonAdmin.length / nonAdminUsers.length) * 100) : 0;
  const notActivatedYet = nonAdminUsers.filter(u => !u.isAuthorized && !u.requestedAt).length;

  const recentSignups = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  // ── Filtered users for table ────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.email.includes(q) ||
      (u.name    || '').toLowerCase().includes(q) ||
      (u.company || '').toLowerCase().includes(q);
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'pending' ? (!u.isAuthorized && !u.isAdmin) :
      filter === 'active'  ? ( u.isAuthorized ||  u.isAdmin) : true;
    return matchSearch && matchFilter;
  });

  // ── Tab styles ──────────────────────────────────────────────────────────────
  const tabBtn = (active) => ({
    padding: '7px 14px', borderRadius: 6,
    fontSize: 13, fontWeight: 500,
    border: 'none', cursor: 'pointer',
    background: active ? '#fff' : 'transparent',
    color:      active ? '#171717' : '#a3a3a3',
    transition: 'all 0.15s',
    display: 'flex', alignItems: 'center', gap: 6,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#111', borderBottom: '1px solid #222' }}>
        <div style={{
          maxWidth: 1120, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          minHeight: 58, gap: 12, flexWrap: 'wrap',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo />
            <span style={{
              padding: '3px 9px', borderRadius: 5,
              background: 'rgba(198,167,94,0.2)', color: '#C6A75E',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Super Admin
            </span>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 2,
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 8, padding: '3px',
          }}>
            <button style={tabBtn(tab === 'dashboard')} onClick={() => setTab('dashboard')}>
              Tableau de bord
            </button>
            <button style={tabBtn(tab === 'users')} onClick={() => setTab('users')}>
              Utilisateurs
              {pendingUsers.length > 0 && (
                <span style={{
                  padding: '1px 6px', borderRadius: 10,
                  background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700,
                }}>
                  {pendingUsers.length}
                </span>
              )}
            </button>
            <button style={tabBtn(tab === 'emails')} onClick={() => setTab('emails')}>
              Emails
            </button>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#555' }}>{user?.email}</span>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 6,
                border: '1px solid #333', background: 'transparent',
                color: '#ccc', fontSize: 12, cursor: 'pointer',
              }}
            >
              <ArrowLeft size={13} /> Dashboard
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              style={{
                padding: '5px 11px', borderRadius: 6,
                border: '1px solid #2a2a2a', background: 'transparent',
                color: '#666', fontSize: 12, cursor: 'pointer',
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 24px 64px' }}>

        {/* ════════════════════════════════════════════════════════════════════
            TAB: TABLEAU DE BORD
        ═══════════════════════════════════════════════════════════════════════ */}
        {tab === 'dashboard' && (
          <>
            {/* ── Utilisateurs ── */}
            <p style={{ fontSize: 11, fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>
              Utilisateurs
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard
                label="Total inscrits"
                value={users.length}
                icon={Users}
                color="#171717"
                sub={`dont ${users.filter(u => u.isAdmin).length} admin`}
              />
              <StatCard
                label="Nouveaux ce mois"
                value={newThisMonth.length}
                icon={TrendingUp}
                color="#059669"
                accent="rgba(5,150,105,0.08)"
                sub="30 derniers jours"
              />
              <StatCard
                label="Utilisateurs actifs"
                value={activeUsers.length}
                icon={UserCheck}
                color="#2563eb"
                accent="rgba(37,99,235,0.08)"
                sub={`${activationRate}% taux d'activation`}
              />
              <StatCard
                label="En attente d'accès"
                value={pendingUsers.length}
                icon={Clock}
                color={pendingUsers.length > 0 ? '#b45309' : '#a3a3a3'}
                accent={pendingUsers.length > 0 ? 'rgba(180,83,9,0.08)' : undefined}
                sub={pendingUsers.length > 0 ? 'Action requise' : 'Aucune demande'}
              />
            </div>

            {/* ── Business ── */}
            <p style={{ fontSize: 11, fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10 }}>
              Business
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
              <StatCard
                label="Abonnements actifs"
                value={activeNonAdmin.length}
                icon={Package}
                color="#7c3aed"
                accent="rgba(124,58,237,0.08)"
                sub="Clients payants"
              />
              <StatCard
                label="Revenu mensuel estimé"
                value={`${monthlyRevenue.toLocaleString('fr-FR')} €`}
                icon={DollarSign}
                color="#059669"
                accent="rgba(5,150,105,0.08)"
                sub="49 € × abonnements actifs"
              />
              <StatCard
                label="Essais / demandes"
                value={pendingRequests.length}
                icon={Activity}
                color="#f59e0b"
                accent="rgba(245,158,11,0.08)"
                sub="Ont demandé l'accès"
              />
              <StatCard
                label="Sans demande"
                value={notActivatedYet}
                icon={XCircle}
                color="#737373"
                sub="Inscrits non activés"
              />
            </div>

            {/* ── Activité récente ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>

              {/* Dernières inscriptions */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{
                  padding: '14px 18px', borderBottom: '1px solid #e5e5e5',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#171717' }}>Dernières inscriptions</h3>
                  <button
                    style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setTab('users')}
                  >
                    Voir tout →
                  </button>
                </div>
                {recentSignups.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#a3a3a3', fontSize: 13 }}>
                    Aucun utilisateur inscrit
                  </div>
                ) : recentSignups.map((u) => (
                  <div key={u.email} style={{
                    padding: '11px 18px', borderBottom: '1px solid #f5f5f5',
                    display: 'flex', alignItems: 'center', gap: 11,
                  }}>
                    <UserAvatar u={u} size={30} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.name || u.email.split('@')[0]}
                      </div>
                      <div style={{ fontSize: 11, color: '#a3a3a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.email}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <StatusBadge u={u} />
                      <div style={{ fontSize: 11, color: '#a3a3a3', marginTop: 3 }}>{fmt(u.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* En attente d'activation */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{
                  padding: '14px 18px', borderBottom: '1px solid #e5e5e5',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#171717' }}>
                    En attente d&apos;activation
                  </h3>
                  {pendingRequests.length > 0 && (
                    <span style={{
                      padding: '1px 7px', borderRadius: 10,
                      background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600,
                    }}>
                      {pendingRequests.length}
                    </span>
                  )}
                </div>
                {pendingRequests.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#a3a3a3', fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                      <CheckCircle2 size={20} color="#d1d5db" />
                    </div>
                    Aucune demande en attente
                  </div>
                ) : pendingRequests.map((u) => (
                  <div key={u.email} style={{
                    padding: '11px 18px', borderBottom: '1px solid #f5f5f5',
                    display: 'flex', alignItems: 'center', gap: 11,
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      background: '#fef3c7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#92400e',
                    }}>
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.name || u.email.split('@')[0]}
                      </div>
                      <div style={{ fontSize: 11, color: '#a3a3a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.company} · demande le {fmt(u.requestedAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 10px', fontSize: 12, gap: 4 }}
                        onClick={() => handleActivate(u.email)}
                      >
                        <CheckCircle2 size={12} /> Activer
                      </button>
                      <button
                        className="row-action row-action-danger"
                        onClick={() => handleDelete(u.email)}
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info banner */}
            <div style={{
              marginTop: 20, padding: '14px 18px',
              background: 'rgba(198,167,94,0.05)',
              border: '1px solid rgba(198,167,94,0.2)',
              borderRadius: 10, fontSize: 13, color: '#737373', lineHeight: 1.7,
            }}>
              <strong style={{ color: '#8B7235' }}>Accès sur invitation · 49 € / mois HT</strong>
              <br />
              Activez chaque client manuellement après confirmation du paiement.
              Vous pouvez bloquer ou supprimer un accès à tout moment.
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB: EMAILS
        ═══════════════════════════════════════════════════════════════════════ */}
        {tab === 'emails' && (() => {
          const sentLog    = emailLog.filter(e => e.status === 'sent');
          const errorLog   = emailLog.filter(e => e.status === 'error');
          const byType     = emailLog.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});
          const usersWithAlerts = users.filter(u => !u.isAdmin && loadEmailPrefs(u.email).alertsEnabled).length;

          const TYPE_LABELS = {
            'welcome':        'Bienvenue',
            'access-granted': 'Accès activé',
            'alert':          'Alerte',
            'inactivity':     'Inactivité',
            'password-reset': 'Réinit. MDP',
          };
          const TYPE_ICONS = {
            'welcome':        MailCheck,
            'access-granted': CheckCircle2,
            'alert':          AlertTriangle,
            'inactivity':     Clock,
            'password-reset': Mail,
          };

          return (
            <>
              {/* KPI row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                <StatCard label="Emails envoyés" value={sentLog.length}       icon={Send}          color="#059669" accent="rgba(5,150,105,0.08)"   sub="Total cumulé" />
                <StatCard label="Erreurs d'envoi" value={errorLog.length}     icon={AlertTriangle} color={errorLog.length > 0 ? '#b45309' : '#a3a3a3'} accent={errorLog.length > 0 ? 'rgba(180,83,9,0.08)' : undefined} sub={errorLog.length > 0 ? 'Vérifier config Resend' : 'Aucune erreur'} />
                <StatCard label="Alertes envoyées" value={byType['alert'] || 0} icon={Mail}         color="#7c3aed" accent="rgba(124,58,237,0.08)" sub="Notifications financières" />
                <StatCard label="Abonnés alertes"  value={usersWithAlerts}    icon={Users}         color="#2563eb" accent="rgba(37,99,235,0.08)"   sub="Alertes email activées" />
              </div>

              {/* By type breakdown */}
              <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Répartition par type</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {Object.entries(TYPE_LABELS).map(([type, label]) => {
                    const count = byType[type] || 0;
                    const Icon  = TYPE_ICONS[type] || Mail;
                    return (
                      <div key={type} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 14px', borderRadius: 8,
                        background: '#f5f5f5', border: '1px solid #e5e5e5',
                      }}>
                        <Icon size={13} color="#737373" />
                        <span style={{ fontSize: 13, color: '#525252' }}>{label}</span>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#171717' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent log */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{
                  padding: '14px 18px', borderBottom: '1px solid #e5e5e5',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#171717' }}>Historique récent</h3>
                  <button className="btn btn-secondary btn-sm" onClick={refresh}>
                    <RefreshCw size={13} /> Actualiser
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Destinataire</th>
                        <th>Statut</th>
                        <th>Date d'envoi</th>
                        <th>Erreur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailLog.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#a3a3a3' }}>Aucun email enregistré.</td></tr>
                      ) : emailLog.slice(0, 50).map((e, i) => {
                        const Icon = TYPE_ICONS[e.type] || Mail;
                        return (
                          <tr key={i}>
                            <td>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Icon size={13} color="#737373" />
                                {TYPE_LABELS[e.type] || e.type}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: '#525252' }}>{e.to}</td>
                            <td>
                              {e.status === 'sent'
                                ? <span className="badge badge-success"><CheckCircle2 size={10} /> Envoyé</span>
                                : <span className="badge badge-danger"><XCircle size={10} /> Erreur</span>
                              }
                            </td>
                            <td style={{ fontSize: 12, color: '#737373' }}>{fmtFull(e.sentAt)}</td>
                            <td style={{ fontSize: 11, color: '#ef4444', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {e.error || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '10px 18px', borderTop: '1px solid #e5e5e5', fontSize: 12, color: '#a3a3a3' }}>
                  {emailLog.length} email{emailLog.length > 1 ? 's' : ''} enregistré{emailLog.length > 1 ? 's' : ''} · Limité aux 300 derniers
                </div>
              </div>

              {/* Config info */}
              <div style={{
                marginTop: 16, padding: '14px 18px',
                background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.15)',
                borderRadius: 10, fontSize: 13, color: '#737373', lineHeight: 1.7,
              }}>
                <strong style={{ color: '#2563eb' }}>Configuration Resend</strong>
                <br />
                Ajoutez <code style={{ background: '#f0f4ff', padding: '1px 5px', borderRadius: 3 }}>RESEND_API_KEY</code> dans les variables d'environnement Vercel pour activer l'envoi d'emails. Voir <code>.env.example</code> à la racine du projet.
              </div>
            </>
          );
        })()}

        {/* ════════════════════════════════════════════════════════════════════
            TAB: UTILISATEURS
        ═══════════════════════════════════════════════════════════════════════ */}
        {tab === 'users' && (
          <div className="card" style={{ overflow: 'hidden' }}>

            {/* Toolbar */}
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid #e5e5e5',
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#171717', flex: 1 }}>
                Gestion des utilisateurs
                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: '#a3a3a3' }}>
                  {users.length} inscrit{users.length > 1 ? 's' : ''}
                </span>
              </h2>
              <input
                className="input"
                style={{ width: 200, padding: '6px 11px', fontSize: 13 }}
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="select"
                style={{ width: 'auto', padding: '6px 11px', fontSize: 13 }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="active">Actifs</option>
              </select>
              <button className="btn btn-secondary btn-sm" onClick={refresh}>
                <RefreshCw size={13} /> Actualiser
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Entreprise</th>
                    <th>Inscription</th>
                    <th>Dernière connexion</th>
                    <th>Données</th>
                    <th>Statut</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#a3a3a3' }}>
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : filtered.map((u) => {
                    const lastLogin  = getLastLogin(u.email);
                    const dataCount  = getUserDataCount(u.email);
                    return (
                      <tr key={u.email}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <UserAvatar u={u} size={28} />
                            <span className="strong">{u.name || '—'}</span>
                          </div>
                        </td>
                        <td style={{ color: '#525252', fontSize: 13 }}>{u.email}</td>
                        <td style={{ color: '#525252' }}>{u.company || '—'}</td>
                        <td style={{ fontSize: 12, color: '#737373' }}>{fmt(u.createdAt)}</td>
                        <td style={{ fontSize: 12, color: lastLogin ? '#525252' : '#a3a3a3' }}>
                          {lastLogin ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <LogIn size={11} color="#a3a3a3" />
                              {fmtFull(lastLogin)}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ fontSize: 12, color: dataCount > 0 ? '#525252' : '#a3a3a3' }}>
                          {dataCount > 0 ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <BarChart3 size={11} color="#a3a3a3" />
                              {dataCount} entrée{dataCount > 1 ? 's' : ''}
                            </span>
                          ) : '—'}
                        </td>
                        <td><StatusBadge u={u} /></td>
                        <td className="right">
                          {!u.isAdmin && (
                            <div className="row-actions">
                              {!u.isAuthorized ? (
                                <button
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '4px 10px', fontSize: 12, gap: 4 }}
                                  onClick={() => handleActivate(u.email)}
                                >
                                  <CheckCircle2 size={12} /> Activer
                                </button>
                              ) : (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 10px', fontSize: 12, gap: 4, color: '#b91c1c', borderColor: '#fee2e2' }}
                                  onClick={() => handleBlock(u.email)}
                                >
                                  <Ban size={12} /> Bloquer
                                </button>
                              )}
                              <button
                                className="row-action row-action-danger"
                                style={{ marginLeft: 6 }}
                                onClick={() => handleDelete(u.email)}
                                title="Supprimer le compte"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{
              padding: '11px 18px', borderTop: '1px solid #e5e5e5',
              fontSize: 13, color: '#737373',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}</span>
              {pendingUsers.length > 0 && (
                <span style={{ color: '#b45309', fontWeight: 600 }}>
                  ● {pendingUsers.length} en attente d&apos;activation
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
