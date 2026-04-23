import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { parseFile, detectImportType, parseRows } from '../utils/importParser';
import { formatEuro } from '../utils/format';

const TYPE_LABELS = {
  sales:    'Ventes (CA)',
  expenses: 'Charges',
  bank:     'Relevé bancaire (auto)',
};

export default function ImportModal({ defaultType = 'sales', onClose, onImport }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file,     setFile]     = useState(null);
  const [rawRows,  setRawRows]  = useState(null);
  const [type,     setType]     = useState(defaultType);
  const [parsed,   setParsed]   = useState(null); // { sales, expenses }
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const process = useCallback(async (f) => {
    if (!f) return;
    setFile(f);
    setLoading(true);
    setError('');
    try {
      const rows = await parseFile(f);
      if (rows.length < 2) {
        setError('Le fichier semble vide ou ne contient pas de données lisibles.');
        setLoading(false);
        return;
      }
      setRawRows(rows);
      const detected = detectImportType(rows);
      const effectiveType = detected === 'bank' ? 'bank' : type;
      setType(effectiveType);
      setParsed(parseRows(rows, effectiveType));
    } catch {
        setError("Impossible de lire ce fichier. Vérifiez qu'il s'agit d'un fichier Excel ou CSV valide.");
    }
    setLoading(false);
  }, [type]);

  const reparse = useCallback((newType) => {
    setType(newType);
    if (rawRows) setParsed(parseRows(rawRows, newType));
  }, [rawRows]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) process(f);
  }, [process]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) process(f);
  };

  const handleImport = () => {
    if (!parsed) return;
    onImport(parsed, type);
    onClose();
  };

  const previewRows = parsed
    ? (type === 'expenses' ? parsed.expenses : parsed.sales).slice(0, 6)
    : [];

  const totalRows = parsed
    ? (type === 'bank'
        ? parsed.sales.length + parsed.expenses.length
        : type === 'expenses'
          ? parsed.expenses.length
          : parsed.sales.length)
    : 0;

  const isSales = type === 'sales' || type === 'bank';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 600, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-head">
          <h3 className="modal-title">Importer des données</h3>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Drop zone */}
          <div
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#C6A75E' : '#e5e5e5'}`,
              borderRadius: 10,
              padding: '28px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'rgba(198,167,94,0.05)' : '#fafafa',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : file ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <FileSpreadsheet size={22} color="#C6A75E" />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#171717' }}>{file.name}</span>
                <span style={{ fontSize: 12, color: '#a3a3a3' }}>· Cliquez pour changer</span>
              </div>
            ) : (
              <>
                <Upload size={28} color="#a3a3a3" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 500, color: '#525252', marginBottom: 4 }}>
                  Glissez votre fichier ici
                </div>
                <div style={{ fontSize: 12, color: '#a3a3a3' }}>
                  Excel (.xlsx .xls) · CSV — export bancaire ou comptable
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', gap: 8, padding: 12, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8 }}>
              <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>
            </div>
          )}

          {/* Type selector — hidden for bank auto-detect */}
          {rawRows && (
            <div>
              <div className="label" style={{ marginBottom: 8 }}>Type d'import</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['sales', 'expenses', 'bank'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => reparse(t)}
                    style={{
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 6,
                      border: `1px solid ${type === t ? '#1a1a1a' : '#e5e5e5'}`,
                      background: type === t ? '#1a1a1a' : 'white',
                      color: type === t ? 'white' : '#525252',
                      transition: 'all 0.15s',
                    }}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {parsed && totalRows > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid #d1fae5',
              borderRadius: 8,
            }}>
              <CheckCircle2 size={16} color="#059669" />
              <span style={{ fontSize: 13, color: '#065f46', fontWeight: 500 }}>
                {totalRows} ligne{totalRows > 1 ? 's' : ''} prête{totalRows > 1 ? 's' : ''} à importer
                {type === 'bank' && parsed.sales.length > 0 && parsed.expenses.length > 0 &&
                  ` (${parsed.sales.length} encaissement${parsed.sales.length > 1 ? 's' : ''} · ${parsed.expenses.length} décaissement${parsed.expenses.length > 1 ? 's' : ''})`
                }
              </span>
            </div>
          )}

          {parsed && totalRows === 0 && !error && (
            <div style={{
              display: 'flex', gap: 8, padding: '10px 14px',
              background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8,
            }}>
              <AlertCircle size={16} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: '#92400e' }}>
                Aucune ligne valide détectée. Vérifiez que le fichier contient des colonnes montant/date.
              </span>
            </div>
          )}

          {/* Preview table */}
          {previewRows.length > 0 && (
            <div>
              <div className="label" style={{ marginBottom: 8 }}>
                Aperçu {previewRows.length < totalRows ? `(${previewRows.length} sur ${totalRows})` : ''}
              </div>
              <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>{isSales ? 'Client' : 'Fournisseur'}</th>
                      <th style={thStyle}>Catégorie</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>TTC</th>
                      <th style={thStyle}>{isSales ? 'Statut' : 'Type'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={tdStyle}>{row.date}</td>
                        <td style={{ ...tdStyle, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isSales ? (row.client || '—') : (row.supplier || '—')}
                        </td>
                        <td style={tdStyle}>{row.category || '—'}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>
                          {formatEuro(row.ttc)}
                        </td>
                        <td style={tdStyle}>
                          {isSales
                            ? <span className={`badge ${row.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                {row.status === 'paid' ? 'Payé' : 'En attente'}
                              </span>
                            : <span className="badge badge-default">
                                {row.type === 'fixed' ? 'Fixe' : 'Variable'}
                              </span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!parsed || totalRows === 0}
            onClick={handleImport}
          >
            <Upload size={14} />
            Importer {totalRows > 0 ? `${totalRows} ligne${totalRows > 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '8px 12px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#737373',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '8px 12px',
  color: '#525252',
  whiteSpace: 'nowrap',
};
