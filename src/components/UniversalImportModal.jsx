import { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Upload, FileText, FileSpreadsheet, ImageIcon,
  CheckCircle2, AlertTriangle, AlertCircle,
  ChevronDown, ChevronUp, History, ArrowLeft,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { detectFileType, processDocument, parseExtractedText, checkDuplicate } from '../utils/documentParser';
import { parseFile, detectImportType, parseRows } from '../utils/importParser';
import { formatEuro, formatDate } from '../utils/format';

// ─── Constants ────────────────────────────────────────────────────────────────
const EXPENSE_CATS = [
  'Logiciels', 'Loyer', 'Charges sociales', 'Marketing',
  'Déplacements', 'Énergie', 'Assurances', 'Fournitures', 'Honoraires', 'Autres',
];
const SALE_CATS = ['Conseil', 'Formation', 'Prestation', 'Produit'];

const CONFIDENCE_LEVELS = [
  { min: 70, label: 'Élevée',  color: '#059669', bg: '#ecfdf5', border: '#d1fae5', icon: CheckCircle2 },
  { min: 40, label: 'Moyenne', color: '#b45309', bg: '#fffbeb', border: '#fef3c7', icon: AlertTriangle },
  { min: 0,  label: 'Faible',  color: '#dc2626', bg: '#fef2f2', border: '#fee2e2', icon: AlertCircle  },
];

const TH = {
  padding: '8px 12px', textAlign: 'left', fontWeight: 600,
  color: '#737373', fontSize: 11, textTransform: 'uppercase',
  letterSpacing: '0.06em', whiteSpace: 'nowrap',
};
const TD = { padding: '8px 12px', color: '#525252', whiteSpace: 'nowrap' };

// ─── Sub-components ───────────────────────────────────────────────────────────
function FileTypeIcon({ type, size = 20 }) {
  const color = '#C6A75E';
  if (type === 'pdf')              return <FileText        size={size} color={color} />;
  if (type === 'excel' || type === 'csv') return <FileSpreadsheet size={size} color={color} />;
  if (type === 'image')            return <ImageIcon       size={size} color={color} />;
  return <Upload size={size} color={color} />;
}

function ProgressBar({ value }) {
  return (
    <div style={{ background: '#e5e5e5', borderRadius: 99, height: 6, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        background: 'linear-gradient(90deg, #C6A75E, #B8963F)',
        borderRadius: 99,
        width: `${value}%`,
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
// defaultType: 'sale' | 'expense' | 'unknown'
export default function UniversalImportModal({ defaultType = 'unknown', onClose }) {
  const inputRef      = useRef(null);
  const previewUrlRef = useRef(null); // tracks ObjectURL so we can revoke it

  // ── Step machine: idle | processing | review | preview | success ──────────
  const [step,          setStep]          = useState('idle');
  const [file,          setFile]          = useState(null);
  const [fileType,      setFileType]      = useState(null);
  const [dragging,      setDragging]      = useState(false);
  const [progress,      setProgress]      = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error,         setError]         = useState('');

  // ── Text path (PDF / image) ───────────────────────────────────────────────
  const [rawText,      setRawText]      = useState('');
  const [form,         setForm]         = useState(null);
  const [showRaw,      setShowRaw]      = useState(false);
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // ── Tabular path (Excel / CSV) ────────────────────────────────────────────
  const [rawRows,    setRawRows]    = useState(null);
  const [importType, setImportType] = useState(defaultType === 'expense' ? 'expenses' : 'sales');
  const [parsedData, setParsedData] = useState(null);

  // ── History ───────────────────────────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);

  const {
    sales, expenses,
    setSales, setExpenses,
    importAll,
    importHistory,
    addImportRecord,
  } = useData();

  // Revoke image preview URL on unmount
  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  // ── Core file processor ───────────────────────────────────────────────────
  const processFile = useCallback(async (f) => {
    if (!f) return;

    const ft = detectFileType(f);
    if (ft === 'unknown') {
      setError('Format non supporté. Fichiers acceptés : PDF, XLS, XLSX, CSV, JPG, PNG, WEBP.');
      return;
    }

    // Cleanup previous image preview
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setFile(f);
    setFileType(ft);
    setStep('processing');
    setProgress(0);
    setProgressLabel('Initialisation…');
    setError('');
    setRawText('');
    setForm(null);
    setShowRaw(false);
    setRawRows(null);
    setParsedData(null);

    // Instant image preview (no async needed)
    if (ft === 'image') {
      const url = URL.createObjectURL(f);
      previewUrlRef.current = url;
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }

    try {
      // ── TEXT path: PDF or image ─────────────────────────────────────────
      if (ft === 'pdf' || ft === 'image') {
        const text = await processDocument(f, (p, label) => {
          setProgress(p);
          if (label) setProgressLabel(label);
        });
        setRawText(text);

        const extracted = parseExtractedText(text, defaultType);
        setForm({ ...extracted });
        setHasDuplicate(checkDuplicate(extracted, sales, expenses));
        setStep('review');

      // ── TABULAR path: Excel or CSV ──────────────────────────────────────
      } else {
        setProgressLabel('Lecture du fichier…');
        setProgress(15);

        const rows = await parseFile(f);
        setProgress(70);

        if (rows.length < 2) {
          throw new Error(
            'Fichier vide ou sans données lisibles. ' +
            'Vérifiez qu\'il contient au moins une ligne d\'en-tête et une ligne de données.'
          );
        }

        setRawRows(rows);

        const detected = detectImportType(rows);
        // Priority: explicit defaultType > auto-detected type
        const it =
          detected === 'bank'          ? 'bank'     :
          defaultType === 'expense'    ? 'expenses' :
          defaultType === 'sale'       ? 'sales'    :
          detected;

        setImportType(it);
        setParsedData(parseRows(rows, it));
        setProgress(100);
        setProgressLabel('Terminé');
        setStep('preview');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du traitement. Vérifiez le fichier et réessayez.');
      setStep('idle');
    }
  }, [defaultType, sales, expenses]);

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = ''; // allow re-selecting same file
  };

  // ── Amount helpers (text path) ────────────────────────────────────────────
  const handleHT = (val) => {
    const ht  = parseFloat(val) || 0;
    const tva = Math.round(ht * 0.2 * 100) / 100;
    setForm((f) => ({ ...f, ht, tva, ttc: Math.round((ht + tva) * 100) / 100 }));
  };

  const handleTVA = (val) => {
    const tva = parseFloat(val) || 0;
    setForm((f) => ({ ...f, tva, ttc: Math.round(((parseFloat(f.ht) || 0) + tva) * 100) / 100 }));
  };

  const handleTTC = (val) => {
    const ttc = parseFloat(val) || 0;
    const ht  = Math.round(ttc / 1.2 * 100) / 100;
    setForm((f) => ({ ...f, ttc, ht, tva: Math.round((ttc - ht) * 100) / 100 }));
  };

  // ── Save (text path: single record) ──────────────────────────────────────
  const handleSaveDocument = () => {
    if (!form) return;
    const record = {
      id:          Date.now(),
      date:        form.date,
      description: form.description || '',
      category:    form.category || (form.type === 'expense' ? 'Autres' : 'Prestation'),
      ht:          parseFloat(form.ht)  || 0,
      tva:         parseFloat(form.tva) || 0,
      ttc:         parseFloat(form.ttc) || 0,
    };

    if (form.type === 'expense') {
      setExpenses((prev) => [{ ...record, supplier: form.party || '', type: 'variable' }, ...prev]);
    } else {
      setSales((prev) => [{ ...record, client: form.party || '', status: 'paid' }, ...prev]);
    }

    addImportRecord({
      date:       new Date().toISOString(),
      filename:   file?.name ?? 'document',
      docType:    form.type,
      amount:     record.ttc,
      confidence: form.confidence ?? 0,
    });

    setStep('success');
  };

  // ── Import (tabular path: multiple rows) ──────────────────────────────────
  const handleImportRows = () => {
    if (!parsedData) return;
    const total = parsedData.sales.length + parsedData.expenses.length;
    if (total === 0) return;

    importAll(parsedData);

    addImportRecord({
      date:     new Date().toISOString(),
      filename: file?.name ?? 'fichier',
      docType:  importType === 'expenses' ? 'expense' : importType === 'bank' ? 'bank' : 'sale',
      amount:   [...parsedData.sales, ...parsedData.expenses].reduce((s, r) => s + (r.ttc || 0), 0),
      rowCount: total,
    });

    setStep('success');
  };

  // ── Reparse on import type change ─────────────────────────────────────────
  const handleChangeImportType = (it) => {
    setImportType(it);
    if (rawRows) setParsedData(parseRows(rawRows, it));
  };

  // ── Reset to idle ─────────────────────────────────────────────────────────
  const reset = () => {
    setStep('idle');
    setFile(null);
    setFileType(null);
    setForm(null);
    setRawText('');
    setRawRows(null);
    setParsedData(null);
    setError('');
    setProgress(0);
    setImagePreview(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const cats   = form?.type === 'expense' ? EXPENSE_CATS : SALE_CATS;
  const cl     = form ? (CONFIDENCE_LEVELS.find((l) => (form.confidence ?? 0) >= l.min) ?? CONFIDENCE_LEVELS[2]) : null;
  const ClIcon = cl?.icon;

  const isSales        = importType === 'sales' || importType === 'bank';
  const previewRowList = parsedData
    ? (importType === 'expenses' ? parsedData.expenses : parsedData.sales).slice(0, 6)
    : [];
  const totalRows = parsedData
    ? importType === 'bank'
        ? parsedData.sales.length + parsedData.expenses.length
        : importType === 'expenses'
          ? parsedData.expenses.length
          : parsedData.sales.length
    : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 580, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {(step === 'review' || step === 'preview') && (
              <button type="button" className="modal-close" onClick={reset} title="Retour">
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h3 className="modal-title">Import de fichier</h3>
              <div style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>
                PDF · Excel · CSV · JPG · PNG · WEBP
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* ══════════════════════════════════════════════
            IDLE — drop zone
        ══════════════════════════════════════════════ */}
        {step === 'idle' && (
          <div className="modal-body">
            <div
              className={`smart-drop${dragging ? ' smart-drop--active' : ''}`}
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.xls,.xlsx,.csv"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
              <div className="smart-drop-icon">
                <Upload size={28} color="#C6A75E" />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#171717', marginBottom: 4 }}>
                Glissez un fichier ici
              </div>
              <div style={{ fontSize: 13, color: '#737373' }}>
                Facture · Relevé · Photo · Export comptable
              </div>
              <div className="smart-drop-formats">
                <span>PDF</span>
                <span>XLSX</span>
                <span>CSV</span>
                <span>JPG</span>
                <span>PNG</span>
                <span>WEBP</span>
              </div>
              <div style={{ marginTop: 14 }}>
                <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                  <Upload size={14} /> Parcourir
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', gap: 8, padding: 12,
                background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8,
              }}>
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>
              </div>
            )}

            {/* Import history */}
            {importHistory?.length > 0 && (
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 12 }}>
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                    fontSize: 13, fontWeight: 500, color: '#525252',
                    marginBottom: showHistory ? 10 : 0,
                  }}
                  onClick={() => setShowHistory((v) => !v)}
                >
                  <History size={14} />
                  Historique ({importHistory.length})
                  {showHistory
                    ? <ChevronUp   size={14} style={{ marginLeft: 'auto' }} />
                    : <ChevronDown size={14} style={{ marginLeft: 'auto' }} />}
                </button>

                {showHistory && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {importHistory.slice(0, 8).map((h) => (
                      <div key={h.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px',
                        background: '#fafafa', border: '1px solid #e5e5e5',
                        borderRadius: 8, fontSize: 13,
                      }}>
                        <FileTypeIcon type={h.docType === 'bank' ? 'excel' : 'pdf'} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 500, color: '#171717',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {h.filename}
                          </div>
                          <div style={{ fontSize: 11, color: '#737373' }}>
                            {formatDate(h.date.slice(0, 10))}
                            {h.rowCount ? ` · ${h.rowCount} ligne${h.rowCount > 1 ? 's' : ''}` : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 600, color: '#171717' }}>{formatEuro(h.amount)}</div>
                          <span
                            className={`badge ${h.docType === 'expense' ? 'badge-warning' : 'badge-success'}`}
                            style={{ fontSize: 10 }}
                          >
                            {h.docType === 'expense' ? 'Charge' : h.docType === 'bank' ? 'Bancaire' : 'Vente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            PROCESSING
        ══════════════════════════════════════════════ */}
        {step === 'processing' && (
          <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center' }}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Aperçu"
                style={{
                  maxHeight: 160, maxWidth: '100%', objectFit: 'contain',
                  borderRadius: 8, border: '1px solid #e5e5e5',
                }}
              />
            ) : (
              <div style={{
                width: 64, height: 64,
                background: 'rgba(198,167,94,0.08)',
                border: '1px solid rgba(198,167,94,0.2)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '8px auto',
              }}>
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            )}

            {file && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <FileTypeIcon type={fileType} />
                <span style={{
                  fontSize: 14, fontWeight: 500, color: '#171717',
                  maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {file.name}
                </span>
              </div>
            )}

            <div style={{ width: '100%', maxWidth: 360 }}>
              <ProgressBar value={progress} />
              <div style={{ fontSize: 13, color: '#737373', marginTop: 8 }}>
                {progressLabel || 'Traitement en cours…'}
              </div>
            </div>

            {(fileType === 'pdf' || fileType === 'image') && (
              <div style={{
                fontSize: 12, color: '#a3a3a3',
                background: '#fafafa', border: '1px solid #e5e5e5',
                borderRadius: 8, padding: '8px 14px', lineHeight: 1.6,
              }}>
                L'OCR peut prendre 15–30 secondes lors du premier usage.
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            REVIEW — single document (PDF / image)
        ══════════════════════════════════════════════ */}
        {step === 'review' && form && (
          <div className="modal-body">

            {/* Image thumbnail */}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Document"
                style={{
                  maxHeight: 120, maxWidth: '100%', objectFit: 'contain',
                  borderRadius: 8, border: '1px solid #e5e5e5', alignSelf: 'flex-start',
                }}
              />
            )}

            {/* Confidence badge */}
            {cl && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                background: cl.bg, border: `1px solid ${cl.border}`, borderRadius: 8,
              }}>
                <ClIcon size={16} color={cl.color} style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: cl.color }}>
                    Confiance {cl.label} — {form.confidence}%
                  </span>
                  {form.confidence < 40 && (
                    <div style={{ fontSize: 12, color: cl.color, marginTop: 2 }}>
                      Veuillez vérifier et compléter les données ci-dessous.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Duplicate warning */}
            {hasDuplicate && (
              <div style={{
                display: 'flex', gap: 8, padding: '10px 14px',
                background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8,
              }}>
                <AlertTriangle size={16} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: '#92400e' }}>
                  Un enregistrement similaire (même date, même montant) existe déjà. Vérifiez qu'il ne s'agit pas d'un doublon.
                </span>
              </div>
            )}

            {/* Type toggle */}
            <div>
              <label className="label">Type d'écriture</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { v: 'sale',    l: 'Vente / Encaissement' },
                  { v: 'expense', l: 'Charge / Dépense'     },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    style={{
                      flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 500,
                      borderRadius: 8,
                      border: `1px solid ${form.type === v ? '#1a1a1a' : '#e5e5e5'}`,
                      background: form.type === v ? '#1a1a1a' : 'white',
                      color: form.type === v ? 'white' : '#525252',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => setForm((f) => ({
                      ...f,
                      type: v,
                      category: v === 'expense' ? EXPENSE_CATS[0] : SALE_CATS[0],
                    }))}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Party */}
            <div className="grid grid-2-mobile" style={{ gap: 12 }}>
              <div>
                <label className="label">Date</label>
                <input
                  type="date" className="input"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">
                  {form.type === 'expense' ? 'Fournisseur' : 'Client'}
                </label>
                <input
                  className="input"
                  value={form.party || ''}
                  onChange={(e) => setForm((f) => ({ ...f, party: e.target.value }))}
                  placeholder={form.type === 'expense' ? 'Nom du fournisseur' : 'Nom du client'}
                />
              </div>
            </div>

            {/* Description + Category */}
            <div className="grid grid-2-mobile" style={{ gap: 12 }}>
              <div>
                <label className="label">Description</label>
                <input
                  className="input"
                  value={form.description || ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Objet de la facture"
                />
              </div>
              <div>
                <label className="label">Catégorie</label>
                <select
                  className="select"
                  value={form.category || ''}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {cats.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Amounts */}
            <div className="amounts-grid">
              <div>
                <label className="label">Montant HT</label>
                <input
                  type="number" step="0.01" min="0" className="input"
                  value={form.ht}
                  onChange={(e) => handleHT(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="label">TVA (20 %)</label>
                <input
                  type="number" step="0.01" min="0" className="input"
                  value={form.tva}
                  onChange={(e) => handleTVA(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="label">Total TTC</label>
                <input
                  type="number" step="0.01" min="0" className="input"
                  style={{ fontWeight: 700 }}
                  value={form.ttc}
                  onChange={(e) => handleTTC(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Raw extracted text (collapsible) */}
            {rawText && (
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 10 }}>
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: '#737373', fontWeight: 500,
                  }}
                  onClick={() => setShowRaw((v) => !v)}
                >
                  {showRaw ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  Texte extrait ({rawText.trim().length} caractères)
                </button>
                {showRaw && (
                  <textarea
                    readOnly
                    value={rawText}
                    style={{
                      width: '100%', marginTop: 8,
                      fontSize: 11, fontFamily: 'monospace',
                      color: '#525252', background: '#f9f9f9',
                      border: '1px solid #e5e5e5', borderRadius: 6,
                      padding: 10, height: 120, resize: 'vertical',
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            PREVIEW — tabular data (Excel / CSV)
        ══════════════════════════════════════════════ */}
        {step === 'preview' && parsedData && (
          <div className="modal-body">

            {/* Import type selector */}
            <div>
              <label className="label" style={{ marginBottom: 8 }}>Type d'import</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { v: 'sales',    l: 'Ventes (CA)'      },
                  { v: 'expenses', l: 'Charges'           },
                  { v: 'bank',     l: 'Relevé bancaire'   },
                ].map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    style={{
                      padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 6,
                      border: `1px solid ${importType === v ? '#1a1a1a' : '#e5e5e5'}`,
                      background: importType === v ? '#1a1a1a' : 'white',
                      color: importType === v ? 'white' : '#525252',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => handleChangeImportType(v)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Row count summary */}
            {totalRows > 0 ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                background: 'rgba(16,185,129,0.06)', border: '1px solid #d1fae5', borderRadius: 8,
              }}>
                <CheckCircle2 size={16} color="#059669" />
                <span style={{ fontSize: 13, color: '#065f46', fontWeight: 500 }}>
                  {totalRows} ligne{totalRows > 1 ? 's' : ''} prête{totalRows > 1 ? 's' : ''} à importer
                  {importType === 'bank' && parsedData.sales.length > 0 && parsedData.expenses.length > 0
                    ? ` (${parsedData.sales.length} encaissement${parsedData.sales.length > 1 ? 's' : ''} · ${parsedData.expenses.length} décaissement${parsedData.expenses.length > 1 ? 's' : ''})`
                    : ''}
                </span>
              </div>
            ) : (
              <div style={{
                display: 'flex', gap: 8, padding: '10px 14px',
                background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8,
              }}>
                <AlertTriangle size={16} color="#b45309" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#92400e' }}>
                  Aucune ligne valide détectée. Vérifiez que le fichier contient des colonnes montant/date.
                </span>
              </div>
            )}

            {/* Preview table */}
            {previewRowList.length > 0 && (
              <div>
                <div className="label" style={{ marginBottom: 8 }}>
                  Aperçu{previewRowList.length < totalRows ? ` (${previewRowList.length} sur ${totalRows})` : ''}
                </div>
                <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
                        <th style={TH}>Date</th>
                        <th style={TH}>{isSales ? 'Client' : 'Fournisseur'}</th>
                        <th style={TH}>Description</th>
                        <th style={{ ...TH, textAlign: 'right' }}>TTC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRowList.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={TD}>{row.date}</td>
                          <td style={{ ...TD, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {isSales ? (row.client || '—') : (row.supplier || '—')}
                          </td>
                          <td style={{ ...TD, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.description || '—'}
                          </td>
                          <td style={{ ...TD, textAlign: 'right', fontWeight: 500 }}>
                            {formatEuro(row.ttc)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SUCCESS
        ══════════════════════════════════════════════ */}
        {step === 'success' && (
          <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 8 }}>
            <div style={{
              width: 60, height: 60,
              background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={28} color="#059669" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#171717', marginBottom: 8 }}>
              Importé avec succès !
            </h3>

            {/* Single document success */}
            {form && (
              <p style={{ fontSize: 14, color: '#525252', lineHeight: 1.6, marginBottom: 20 }}>
                <strong>{formatEuro(form.ttc)}</strong> enregistré comme{' '}
                <strong>{form.type === 'expense' ? 'charge' : 'vente'}</strong>
                {form.party ? ` (${form.party})` : ''}.
                <br />Le tableau de bord est mis à jour.
              </p>
            )}

            {/* Tabular success */}
            {parsedData && !form && (
              <p style={{ fontSize: 14, color: '#525252', lineHeight: 1.6, marginBottom: 20 }}>
                <strong>{totalRows} ligne{totalRows > 1 ? 's' : ''}</strong> importée{totalRows > 1 ? 's' : ''} avec succès.
                <br />Le tableau de bord est mis à jour.
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={reset}>
                Importer un autre fichier
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        {(step === 'idle' || step === 'review' || step === 'preview') && (
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>

            {step === 'review' && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={!form || (parseFloat(form.ttc) || 0) <= 0}
                onClick={handleSaveDocument}
              >
                <CheckCircle2 size={15} />
                Enregistrer
              </button>
            )}

            {step === 'preview' && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={totalRows === 0}
                onClick={handleImportRows}
              >
                <Upload size={15} />
                Importer {totalRows > 0 ? `${totalRows} ligne${totalRows > 1 ? 's' : ''}` : ''}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
