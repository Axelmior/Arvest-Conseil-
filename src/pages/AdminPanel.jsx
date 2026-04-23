import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, Clock, XCircle, ShieldCheck,
  ArrowLeft, Trash2, RefreshCw, Ban
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ u }) {
  if (u.isAdmin) return (
    <span className="badge badge-gold"><ShieldCheck size={11} /> Admin</span>
  );
  if (u.isAuthorized) return (
    <span className="badge badge-success"><CheckCircle2 size={11} /> Actif</span>
  );
  if (u.requestedAt) return (
    <span className="badge badge-warning"><Clock size={11} /> Demande envoyée</span>
  );
  return (
    <span className="badge badge-default"><XCircle size={11} /> En attente</span>
  );
}

function RoleBadge({ role }) {
  if (role === 'admin') return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: 'rgba(198,167,94,0.12)', color: '#8B7235',
    }}>admin</span>
  );
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: '#f5f5f5', color: '#737373',
    }}>user</span>
  );
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { user, getAllUsers, authorizeUser, blockUser, deleteUser, logout } = useAuth();
  const navigate  = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');

  const refresh = () => setUsers(getAllUsers());
  useEffect(() => { refresh(); }, []);

  const handleActivate = (email) => { authorizeUser(email); refresh(); };
  const handleBlock    = (email) => { blockUser(email);     refresh(); };
  const handleDelete   = (email) => {
    if (window.confirm(`Supprimer le compte "${email}" ? Action irréversible.`)) {
      deleteUser(email);
      refresh();
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.email.includes(q) ||
      (u.name    || '').toLowerCase().includes(q) ||
      (u.company || '').toLowerCase().includes(q);
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'pending' ? (!u.isAuthorized && !u.isAdmin) :
      filter === 'active'  ? (u.isAuthorized  || u.isAdmin)  : true;
    return matchSearch && matchFilter;
  });

  const pending = users.filter((u) => !u.isAuthorized && !u.isAdmin).length;
  const active  = users.filter((u) =>  u.isAuthorized ||  u.isAdmin).length;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '24px 24px 56px' }}>

      {/* ── Top bar ── */}
      <div style={{
        maxWidth: 1000, margin: '0 auto 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{
            padding: '3px 10px', borderRadius: 6,
            background: 'rgba(198,167,94,0.12)', color: '#8B7235',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Admin
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#737373' }}>{user?.email}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={13} /> Dashboard
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => { logout(); navigate('/'); }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* ── KPI ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total', value: users.length, icon: Users,         color: '#171717' },
            { label: 'Actifs',     value: active,  icon: CheckCircle2,  color: '#059669' },
            { label: 'En attente', value: pending, icon: Clock,         color: '#b45309' },
          ].map((k, i) => (
            <div key={i} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <k.icon size={14} color={k.color} />
                <span style={{ fontSize: 11, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                  {k.label}
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* ── Panel ── */}
        <div className="card" style={{ overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid #e5e5e5',
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#171717', flex: 1, marginRight: 8 }}>
              Gestion des utilisateurs
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
                  <th>Rôle</th>
                  <th>Entreprise</th>
                  <th>Inscription</th>
                  <th>Demande d&apos;accès</th>
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
                ) : filtered.map((u) => (
                  <tr key={u.email}>
                    <td className="strong">{u.name || '—'}</td>
                    <td style={{ color: '#525252', fontSize: 13 }}>{u.email}</td>
                    <td><RoleBadge role={u.role || 'user'} /></td>
                    <td style={{ color: '#525252' }}>{u.company || '—'}</td>
                    <td style={{ fontSize: 12, color: '#737373' }}>{fmt(u.createdAt)}</td>
                    <td style={{ fontSize: 12, color: u.requestedAt ? '#b45309' : '#a3a3a3' }}>
                      {fmt(u.requestedAt)}
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
                              <CheckCircle2 size={12} /> Activer accès
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 10px', fontSize: 12, gap: 4, color: '#b91c1c', borderColor: '#fee2e2' }}
                              onClick={() => handleBlock(u.email)}
                            >
                              <Ban size={12} /> Bloquer accès
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
                ))}
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
            {pending > 0 && (
              <span style={{ color: '#b45309', fontWeight: 600 }}>
                ● {pending} en attente d&apos;activation
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{
          marginTop: 18, padding: 16,
          background: 'rgba(198,167,94,0.05)',
          border: '1px solid rgba(198,167,94,0.2)',
          borderRadius: 10, fontSize: 13, color: '#737373', lineHeight: 1.7,
        }}>
          <strong style={{ color: '#8B7235' }}>Accès sur invitation · 49 € / mois HT</strong>
          <br />
          Seul votre email ({user?.email}) dispose des droits admin.
          Activez chaque client manuellement après confirmation du paiement.
          Vous pouvez bloquer ou supprimer un accès à tout moment.
        </div>
      </div>
    </div>
  );
}
