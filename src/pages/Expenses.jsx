import { useState, useMemo } from 'react';
import { Search, Plus, Upload, Edit2, Trash2, ChevronDown, X } from 'lucide-react';
import { MOCK_EXPENSES } from '../data/mockData';
import { formatEuro, formatEuroDecimal, formatDate } from '../utils/format';

function ExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState(
    expense || {
      date: new Date().toISOString().slice(0, 10),
      supplier: '',
      category: 'Logiciels',
      description: '',
      ht: 0,
      tva: 0,
      ttc: 0,
      type: 'variable'
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
          <h3 className="modal-title">{expense ? 'Modifier la charge' : 'Nouvelle charge'}</h3>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="fixed">Fixe</option>
                <option value="variable">Variable</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Fournisseur</label>
            <input className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} required />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Logiciels</option>
              <option>Loyer</option>
              <option>Charges sociales</option>
              <option>Marketing</option>
              <option>Déplacements</option>
              <option>Énergie</option>
              <option>Assurances</option>
              <option>Fournitures</option>
              <option>Honoraires</option>
              <option>Autres</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div>
              <label className="label">HT</label>
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

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    let r = [...expenses];
    if (search) {
      const s = search.toLowerCase();
      r = r.filter((x) => x.supplier.toLowerCase().includes(s) || x.description.toLowerCase().includes(s));
    }
    if (typeFilter !== 'all') r = r.filter((x) => x.type === typeFilter);
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
  }, [expenses, search, sortBy, sortDir, typeFilter]);

  const total = filtered.reduce((s, x) => s + x.ttc, 0);
  const fixed = filtered.filter((x) => x.type === 'fixed').reduce((s, x) => s + x.ttc, 0);
  const variable = filtered.filter((x) => x.type === 'variable').reduce((s, x) => s + x.ttc, 0);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette charge ?')) setExpenses(expenses.filter((s) => s.id !== id));
  };

  const handleSave = (data) => {
    if (editing) setExpenses(expenses.map((s) => (s.id === editing.id ? { ...data, id: editing.id } : s)));
    else setExpenses([{ ...data, id: Date.now() }, ...expenses]);
    setShowModal(false);
    setEditing(null);
  };

  const COLS = [
    { k: 'date', l: 'Date' },
    { k: 'supplier', l: 'Fournisseur' },
    { k: 'category', l: 'Catégorie' },
    { k: 'description', l: 'Description' },
    { k: 'ht', l: 'HT', right: true },
    { k: 'tva', l: 'TVA', right: true },
    { k: 'ttc', l: 'TTC', right: true },
    { k: 'type', l: 'Type' }
  ];

  return (
    <>
      <div className="module-stats">
        <div className="stat-card">
          <div className="stat-label">Total charges</div>
          <div className="stat-value">{formatEuro(total)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Charges fixes</div>
          <div className="stat-value">{formatEuro(fixed)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Charges variables</div>
          <div className="stat-value">{formatEuro(variable)}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search">
            <Search size={16} className="icon" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un fournisseur..." />
          </div>
          <select className="select" style={{ width: 'auto' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Tous types</option>
            <option value="fixed">Fixes</option>
            <option value="variable">Variables</option>
          </select>
          <button className="btn btn-secondary">
            <Upload size={16} /> Importer
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
          >
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
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.date)}</td>
                  <td className="strong">{e.supplier}</td>
                  <td><span className="badge badge-default">{e.category}</span></td>
                  <td>{e.description}</td>
                  <td className="right numeric">{formatEuroDecimal(e.ht)}</td>
                  <td className="right numeric">{formatEuroDecimal(e.tva)}</td>
                  <td className="right numeric strong">{formatEuroDecimal(e.ttc)}</td>
                  <td>
                    {e.type === 'fixed' ? <span className="badge badge-gold">Fixe</span> : <span className="badge badge-default">Variable</span>}
                  </td>
                  <td className="right">
                    <div className="row-actions">
                      <button className="row-action" onClick={() => { setEditing(e); setShowModal(true); }} aria-label="Modifier">
                        <Edit2 size={14} />
                      </button>
                      <button className="row-action row-action-danger" onClick={() => handleDelete(e.id)} aria-label="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={COLS.length + 1} style={{ textAlign: 'center', padding: 48, color: '#a3a3a3' }}>
                    Aucune charge ne correspond à vos filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div>{filtered.length} charge{filtered.length > 1 ? 's' : ''}</div>
          <div>Total : <strong style={{ color: '#171717' }}>{formatEuro(total)}</strong></div>
        </div>
      </div>

      {showModal && <ExpenseModal expense={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSave={handleSave} />}
    </>
  );
}
