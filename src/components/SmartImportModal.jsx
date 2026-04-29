import { useState, useRef, useCallback } from 'react';
import {
  X, ScanLine, FileText, ImageIcon, Upload, CheckCircle2,
  AlertTriangle, AlertCircle, ChevronDown, ChevronUp, History, ArrowLeft
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { processDocument, parseExtractedText, checkDuplicate } from '../utils/documentParser';
import { formatEuro, formatDate } from '../utils/format';

// ─── Catégories ───────────────────────────────────────────────────────────────
const EXPENSE_CATS = [
  'Logiciels', 'Loyer', 'Charges sociales', 'Marketing',
  'Déplacements', 'Énergie', 'Assurances', 'Fournitures', 'Honoraires', 'Autres',
];
const SALE_CATS = ['Conseil', 'Formation', 'Prestation', 'Produit'];

// ─── Badge de confiance ───────────────────────────────────────────────────────
const CONFIDENCE_LEVELS = [
  { min: 70, label: 'Élevée',  color: '#059669', bg: '#ecfdf5', border: '#d1fae5', icon: CheckCircle2 },
  { min: 40, label: 'Moyenne', color: '#b45309', bg: '#fffbeb', border: '#fef3c7', icon: AlertTriangle },
  { min: 0,  label: 'Faible',  color: '#dc2626', bg: '#fef2f2', border: '#fee2e2', icon: AlertCircle },
];

function confidenceLevel(score) {
  return CONFIDENCE_LEVELS.find((l) => score >= l.min) || CONFIDENCE_LEVELS[2];
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────
function FileIcon({ name }) {
  const ext = (name || '').split('.').pop().toLowerCase();
  return ext === 'pdf'
    ? <FileText size={20} color="#C6A75E" />
    : <ImageIcon size={20} color="#C6A75E" />;
}

function ProgressBar({ value }) {
  return (
    <div style={{ background: '#e5e5e5', borderRadius: 99, height: 6, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #C6A75E, #B8963F)',
          borderRadius: 99,
          width: `${value}%`,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function SmartImportModal({ defaultType = 'unknown', onClose }) {
  const inputRef = useRef(null);

  const [step,          setStep]          = useState('idle');       // idle | processing | review | success
  const [file,          setFile]          = useState(null);
  const [dragging,      setDragging]      = useState(false);
  const [progress,      setProgress]      = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [rawText,       setRawText]       = useState('');
  const [form,          setForm]          = useState(null);
  const [showRaw,       setShowRaw]       = useState(false);
  const [error,         setError]         = useState('');
  const [hasDuplicate,  setHasDuplicate]  = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);

  const { sales, expenses, setSales, setExpenses, importHistory, addImportRecord } = useData();

  // ── Traitement du fichier ──────────────────────────────────────────────────
  const processFile = useCallback(async (f) => {
    if (!f) return;
    setFile(f);
    setStep('processing');
    setProgress(0);
    setProgressLabel('Initialisation…');
    setError('');
    setShowRaw(false);

    try {
      const text = await processDocument(f, (p, label) => {
        setProgress(p);
        if (label) setProgressLabel(label);
      });

      setRawText(text);
      const extracted = parseExtractedText(text, defaultType);
      setForm({ ...extracted });
      setHasDuplicate(checkDuplicate(extracted, sales, expenses));
      setStep('review');
    } catch (err) {
      setError(err.message || 'Erreur lors du traitement. Vérifiez le fichier et réessayez.');
      setStep('idle');
    }
  }, [defaultType, sales, expenses]);

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = '';
  };

  // ── Mise à jour des montants (calcul HT/TVA/TTC) ──────────────────────────
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
    const tva = Math.round((ttc - ht) * 100) / 100;
    setForm((f) => ({ ...f, ttc, ht, tva }));
  };

  // ── Enregistrement ────────────────────────────────────────────────────────
  const handleSave = () => {
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
      filename:   file?.name || 'document',
      docType:    form.type,
      amount:     record.ttc,
      confidence: form.confidence || 0,
    });

    setStep('success');
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setStep('idle');
    setFile(null);
    setForm(null);
    setRawText('');
    setError('');
    setProgress(0);
  };

  const cats = form?.type === 'expense' ? EXPENSE_CATS : SALE_CATS;
  const cl   = form ? confidenceLevel(form.confidence || 0) : null;
  const ClIcon = cl?.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 560, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête ── */}
        <div className="modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 'review' && (
              <button type="button" className="modal-close" onClick={reset} style={{ marginRight: 4 }}>
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h3 className="modal-title">Import intelligent</h3>
              <div style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>
                PDF · JPG · PNG · WEBP
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════
            ÉTAPE 1 — DROP ZONE (idle)
        ══════════════════════════════════════════════════ */}
        {step === 'idle' && (
          <div className="modal-body">
            {/* Zone de dépôt */}
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
                accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tif,.tiff"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
              <div className="smart-drop-icon">
                <ScanLine size={28} color="#C6A75E" />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#171717', marginBottom: 4 }}>
                Glissez un fichier ici
              </div>
              <div style={{ fontSize: 13, color: '#737373' }}>
                Facture PDF · Photo de ticket · Reçu JPG/PNG
              </div>
              <div className="smart-drop-formats">
                <span>PDF</span>
                <span>JPG</span>
                <span>PNG</span>
                <span>WEBP</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                  <Upload size={14} /> Parcourir
                </span>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{
                display: 'flex', gap: 8, padding: 12,
                background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 8,
              }}>
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>
              </div>
            )}

            {/* Historique des imports */}
            {importHistory && importHistory.length > 0 && (
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 12 }}>
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                    fontSize: 13, fontWeight: 500, color: '#525252', marginBottom: showHistory ? 10 : 0,
                  }}
                  onClick={() => setShowHistory((v) => !v)}
                >
                  <History size={14} />
                  Historique ({importHistory.length})
                  {showHistory ? <ChevronUp size={14} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={14} style={{ marginLeft: 'auto' }} />}
                </button>

                {showHistory && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {importHistory.slice(0, 8).map((h) => (
                      <div key={h.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', background: '#fafafa',
                        border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13,
                      }}>
                        <FileIcon name={h.filename} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 500, color: '#171717',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {h.filename}
                          </div>
                          <div style={{ fontSize: 11, color: '#737373' }}>
                            {formatDate(h.date.slice(0, 10))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 600, color: '#171717' }}>
                            {formatEuro(h.amount)}
                          </div>
                          <span className={`badge ${h.docType === 'expense' ? 'badge-warning' : 'badge-success'}`}
                            style={{ fontSize: 10 }}>
                            {h.docType === 'expense' ? 'Charge' : 'Vente'}
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

        {/* ══════════════════════════════════════════════════
            ÉTAPE 2 — TRAITEMENT EN COURS (processing)
        ══════════════════════════════════════════════════ */}
        {step === 'processing' && (
          <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center' }}>
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

            {file && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <FileIcon name={file.name} />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#171717', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

            <div style={{
              fontSize: 12, color: '#a3a3a3',
              background: '#fafafa', border: '1px solid #e5e5e5',
              borderRadius: 8, padding: '8px 14px', lineHeight: 1.6,
            }}>
              L'OCR peut prendre 15-30 secondes lors du premier usage
              (téléchargement du moteur de reconnaissance).
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            ÉTAPE 3 — RÉVISION DES DONNÉES (review)
        ══════════════════════════════════════════════════ */}
        {step === 'review' && form && (
          <div className="modal-body">

            {/* Badge de confiance */}
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

            {/* Avertissement doublon */}
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

            {/* ── Type (Vente / Charge) ── */}
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
                      borderRadius: 8, border: `1px solid ${form.type === v ? '#1a1a1a' : '#e5e5e5'}`,
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

            {/* ── Grille date + partie ── */}
            <div className="grid grid-2-mobile" style={{ gap: 12 }}>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
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

            {/* ── Description + Catégorie ── */}
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

            {/* ── Montants ── */}
            <div className="amounts-grid">
              <div>
                <label className="label">Montant HT</label>
                <input
                  type="number" step="0.01" min="0"
                  className="input"
                  value={form.ht}
                  onChange={(e) => handleHT(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="label">TVA (20 %)</label>
                <input
                  type="number" step="0.01" min="0"
                  className="input"
                  value={form.tva}
                  onChange={(e) => handleTVA(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="label">Total TTC</label>
                <input
                  type="number" step="0.01" min="0"
                  className="input"
                  style={{ fontWeight: 700 }}
                  value={form.ttc}
                  onChange={(e) => handleTTC(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* ── Texte brut extrait (collapsible) ── */}
            {rawText && (
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 10 }}>
                <button
                  type="button"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                    color: '#737373', fontWeight: 500,
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
                      width: '100%', marginTop: 8, fontSize: 11, fontFamily: 'monospace',
                      color: '#525252', background: '#f9f9f9', border: '1px solid #e5e5e5',
                      borderRadius: 6, padding: 10, height: 120, resize: 'vertical',
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            ÉTAPE 4 — SUCCÈS (success)
        ══════════════════════════════════════════════════ */}
        {step === 'success' && (
          <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 8 }}>
            <div style={{
              width: 60, height: 60,
              background: '#ecfdf5', border: '1px solid #d1fae5',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={28} color="#059669" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#171717', marginBottom: 8 }}>
              Importé avec succès !
            </h3>
            {form && (
              <p style={{ fontSize: 14, color: '#525252', lineHeight: 1.6, marginBottom: 20 }}>
                <strong>{formatEuro(form.ttc)}</strong> enregistré comme{' '}
                <strong>{form.type === 'expense' ? 'charge' : 'vente'}</strong>
                {form.party ? ` (${form.party})` : ''}.
                <br />Le tableau de bord est mis à jour.
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={reset}>
                Importer un autre document
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ── Pied de page ──────────────────────────────────────── */}
        {(step === 'idle' || step === 'review') && (
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            {step === 'review' && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={!form || (parseFloat(form.ttc) || 0) <= 0}
                onClick={handleSave}
              >
                <CheckCircle2 size={15} />
                Enregistrer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
