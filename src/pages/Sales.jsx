import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Upload,
  Edit2,
  Trash2,
  ChevronDown,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { formatEuro, formatEuroDecimal, formatDate } from '../utils/format';
import { useData } from '../context/DataContext';
import ImportModal from '../components/ImportModal';

function SaleModal({ sale, onClose, onSave }) {
  const [form, setForm] = useState(
    sale || {
      date: new Date().toISOString().slice(0, 10),
      dueDate: '',
      client: '',
      category: 'Conseil',
      description: '',
      ht: 0,
      tva: 0,
      ttc: 0,
      status: 'pending'
    }
  );

  const handleHT = (v) => {
    const ht = parseFloat(v) || 0;
    const tva = Math.round(ht * 0.2 * 100) / 100;
    setForm({ ...form, ht, tva, ttc: ht + tva });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-head">
          <h3 className="modal-title">{sale ? 'Modifier la vente' : 'Nouvelle vente'}</h3>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="grid grid-2-mobile" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Date de facturation</label>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label">
                Date d&apos;échéance
                <span style={{ fontWeight: 400, color: '#a3a3a3', marginLeft: 4 }}>(optionnel)</span>
              </label>
              <input
                type="date"
                className="input"
                value={form.dueDate || ''}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value || undefined })}
              />
            </div>
          </div>
          <div>
            <label className="label">Statut</label>
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
            </select>
          </div>
          <div>
            <label className="label">Client</label>
            <input className="input" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Nom du client" required />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Conseil</option>
              <option>Formation</option>
              <option>Prestation</option>
              <option>Produit</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Objet de la vente" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div>
              <label className="label">Montant HT</label>
              <input type="number" step="0.01" className="input" value={form.ht} onChange={(e) => handleHT(e.target.value)} />
            </div>
            <div>
              <label className="label">TVA</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={form.tva}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tva: parseFloat(e.target.value) || 0,
                    ttc: (parseFloat(form.ht) || 0) + (parseFloat(e.target.value) || 0)
                  })
                }
              />
            </div>
            <div>
              <label className="label">TTC</label>
              <input type="number" className="input" value={form.ttc} readOnly style={{ background: '#fafafa', fontWeight: 600 }} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button type="submit" className="btn btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}

export default function Sales() {
  const { sales, setSales, importAll } = useData();
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    let r = [...sales];
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((x) => x.client.toLowerCase().includes(s) || x.description.toLowerCase().includes(s));
    }
    if (statusFilter !== 'all') r = r.filter((x) => x.status === statusFilter);
    r.sort((a, b) => {
      let va = a[sortBy];
      let vb = b[sortBy];
      if (typeof va === 'string') {
        va = va.toLowerCase();
        vb = vb.toLowerCase();
      }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
    });
    return r;
  }, [sales, search, sortBy, sortDir, statusFilter]);

  const total = filtered.reduce((s, x) => s + x.ttc, 0);
  const paid = filtered.filter((x) => x.status === 'paid').reduce((s, x) => s + x.ttc, 0);
  const pending = filtered.filter((x) => x.status === 'pending').reduce((s, x) => s + x.ttc, 0);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette vente ?')) setSales(sales.filter((s) => s.id !== id));
  };

  const handleSave = (data) => {
    if (editing) {
      setSales(sales.map((s) => (s.id === editing.id ? { ...data, id: editing.id } : s)));
    } else {
      setSales([{ ...data, id: Date.now() }, ...sales]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const openNew = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (sale) => {
    setEditing(sale);
    setShowModal(true);
  };

  const COLS = [
    { k: 'date', l: 'Date' },
    { k: 'client', l: 'Client' },
    { k: 'category', l: 'Catégorie' },
    { k: 'description', l: 'Description' },
    { k: 'ht', l: 'Montant HT', right: true },
    { k: 'tva', l: 'TVA', right: true },
    { k: 'ttc', l: 'Montant TTC', right: true },
    { k: 'status', l: 'Statut' }
  ];

  return (
    <>
      <div className="module-stats">
        <div className="stat-card">
          <div className="stat-label">Total ventes</div>
          <div className="stat-value">{formatEuro(total)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Encaissé</div>
          <div className="stat-value success">{formatEuro(paid)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">En attente</div>
          <div className="stat-value warning">{formatEuro(pending)}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search">
            <Search size={16} className="icon" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client, une facture..." />
          </div>
          <select className="select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
          </select>
          <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
            <Upload size={16} /> Importer
          </button>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={16} /> Ajouter
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {COLS.map((c) => (
                  <th key={c.k} className={c.right ? 'right' : ''}>
                    <button
                      onClick={() => toggleSort(c.k)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'inherit', font: 'inherit' }}
                    >
                      {c.l}
                      {sortBy === c.k && (
                        <ChevronDown size={12} style={{ transform: sortDir === 'asc' ? 'rotate(180deg)' : 'none' }} />
                      )}
                    </button>
                  </th>
                ))}
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale) => (
                <tr key={sale.id}>
                  <td>{formatDate(sale.date)}</td>
                  <td className="strong">{sale.client}</td>
                  <td><span className="badge badge-default">{sale.category}</span></td>
                  <td>{sale.description}</td>
                  <td className="right numeric">{formatEuroDecimal(sale.ht)}</td>
                  <td className="right numeric">{formatEuroDecimal(sale.tva)}</td>
                  <td className="right numeric strong">{formatEuroDecimal(sale.ttc)}</td>
                  <td>
                    {sale.status === 'paid' ? (
                      <span className="badge badge-success"><CheckCircle2 size={12} /> Payé</span>
                    ) : (
                      <span className="badge badge-warning"><Clock size={12} /> En attente</span>
                    )}
                  </td>
                  <td className="right">
                    <div className="row-actions">
                      <button className="row-action" onClick={() => openEdit(sale)} aria-label="Modifier">
                        <Edit2 size={14} />
                      </button>
                      <button className="row-action row-action-danger" onClick={() => handleDelete(sale.id)} aria-label="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={COLS.length + 1} style={{ textAlign: 'center', padding: 48, color: '#a3a3a3' }}>
                    Aucune vente ne correspond à vos filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div>{filtered.length} vente{filtered.length > 1 ? 's' : ''}</div>
          <div>Total : <strong style={{ color: '#171717' }}>{formatEuro(total)}</strong></div>
        </div>
      </div>

      {showModal && <SaleModal sale={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSave={handleSave} />}
      {showImport && (
        <ImportModal
          defaultType="sales"
          onClose={() => setShowImport(false)}
          onImport={(parsed) => { importAll(parsed); setShowImport(false); }}
        />
      )}
    </>
  );
}
