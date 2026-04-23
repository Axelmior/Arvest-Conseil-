import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle2, Clock, XCircle, ShieldCheck,
  ArrowLeft, Trash2, RefreshCw
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

function StatusBadge({ user }) {
  if (user.isAdmin) {
    return (
      <span className="badge badge-gold" style={{ gap: 4 }}>
        <ShieldCheck size={11} /> Admin
      </span>
    );
  }
  if (user.isAuthorized) {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={11} /> Actif
      </span>
    );
  }
  if (user.requestedAt) {
    return (
      <span className="badge badge-warning">
        <Clock size={11} /> Demande envoyée
      </span>
    );
  }
  return (
    <span className="badge badge-default">
      <XCircle size={11} /> En attente
    </span>
  );
}

function formatTs(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminPanel() {
  const { user, getAllUsers, authorizeUser, revokeUser, deleteUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers]   = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'active'
  const [search, setSearch] = useState('');

  const refresh = () => setUsers(getAllUsers());

  useEffect(() => { refresh(); }, []);

  const handleAuthorize = (email) => {
    authorizeUser(email);
    refresh();
  };

  const handleRevoke = (email) => {
    revokeUser(email);
    refresh();
  };

  const handleDelete = (email) => {
    if (window.confirm(`Supprimer le compte de ${email} ? Cette action est irréversible.`)) {
      deleteUser(email);
      refresh();
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.email.includes(search.toLowerCase()) ||
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.company || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'pending' && !u.isAuthorized && !u.isAdmin) ||
      (filter === 'active' && (u.isAuthorized || u.isAdmin));
    return matchSearch && matchFilter;
  });

  const pending = users.filter((u) => !u.isAuthorized && !u.isAdmin).length;
  const active  = users.filter((u) => u.isAuthorized || u.isAdmin).length;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '24px 24px 48px' }}>
      {/* Top bar */}
      <div style={{
        maxWidth: 960, margin: '0 auto 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Logo />
          <span style={{
            padding: '2px 10px', borderRadius: 6,
            background: 'rgba(198,167,94,0.12)', color: '#8B7235',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Admin
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={13} /> Dashboard
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { logout(); navigate('/'); }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total utilisateurs', value: users.length, icon: Users, color: '#171717' },
            { label: 'Comptes actifs',     value: active,       icon: CheckCircle2, color: '#059669' },
            { label: 'En attente',         value: pending,      icon: Clock, color: '#b45309' },
          ].map((kpi, i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <kpi.icon size={16} color={kpi.color} />
                <span style={{ fontSize: 11, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
                  {kpi.label}
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Panel */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#171717', flex: 1 }}>
              Gestion des utilisateurs
            </h2>
            <input
              className="input"
              style={{ width: 220, padding: '7px 12px', fontSize: 13 }}
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="select"
              style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="active">Actifs</option>
            </select>
            <button className="btn btn-secondary btn-sm" onClick={refresh}>
              <RefreshCw size={13} /> Rafraîchir
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
                  <th>Demande</th>
                  <th>Statut</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#a3a3a3' }}>
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : filtered.map((u) => (
                  <tr key={u.email}>
                    <td className="strong">{u.name || '—'}</td>
                    <td style={{ color: '#525252' }}>{u.email}</td>
                    <td>{u.company || '—'}</td>
                    <td style={{ fontSize: 12, color: '#737373' }}>{formatTs(u.createdAt)}</td>
                    <td style={{ fontSize: 12, color: u.requestedAt ? '#b45309' : '#a3a3a3' }}>
                      {u.requestedAt ? formatTs(u.requestedAt) : '—'}
                    </td>
                    <td><StatusBadge user={u} /></td>
                    <td className="right">
                      {!u.isAdmin && (
                        <div className="row-actions">
                          {!u.isAuthorized ? (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 12px', fontSize: 12 }}
                              onClick={() => handleAuthorize(u.email)}
                            >
                              <CheckCircle2 size={12} /> Activer
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 12px', fontSize: 12 }}
                              onClick={() => handleRevoke(u.email)}
                            >
                              <XCircle size={12} /> Révoquer
                            </button>
                          )}
                          <button
                            className="row-action row-action-danger"
                            style={{ marginLeft: 4 }}
                            onClick={() => handleDelete(u.email)}
                            aria-label="Supprimer"
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

          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #e5e5e5',
            fontSize: 13, color: '#737373',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}</span>
            {pending > 0 && (
              <span style={{ color: '#b45309', fontWeight: 500 }}>
                {pending} demande{pending > 1 ? 's' : ''} en attente d&apos;activation
              </span>
            )}
          </div>
        </div>

        {/* Info box */}
        <div style={{
          marginTop: 20, padding: 16,
          background: 'rgba(198,167,94,0.06)',
          border: '1px solid rgba(198,167,94,0.25)',
          borderRadius: 10, fontSize: 13, color: '#737373', lineHeight: 1.6,
        }}>
          <strong style={{ color: '#8B7235' }}>Accès sur invitation · 49 € / mois</strong>
          <br />
          Activez manuellement chaque utilisateur après confirmation du règlement.
          L&apos;accès peut être révoqué à tout moment.
        </div>
      </div>
    </div>
  );
}
