// xlsx chargé dynamiquement — réduit le bundle initial
let _XLSX = null;
async function loadXLSX() {
  if (_XLSX) return _XLSX;
  _XLSX = await import('xlsx');
  return _XLSX;
}

// ─── Header synonym maps ──────────────────────────────────────────────────────
const HEADER_MAP = {
  date:        ['date', 'date op', 'date operation', 'date_operation', 'dateop', 'date valeur', 'date comptable'],
  client:      ['client', 'nom client', 'customer', 'acheteur', 'nom'],
  supplier:    ['fournisseur', 'supplier', 'prestataire', 'vendeur', 'beneficiaire', 'bénéficiaire'],
  description: ['libellé', 'libelle', 'description', 'objet', 'label', 'motif', 'designation', 'désignation', 'intitule', 'intitulé'],
  ht:          ['montant ht', 'ht', 'prix ht', 'net ht', 'amount ht', 'base ht'],
  tva:         ['tva', 'montant tva', 'tax', 'taxe'],
  ttc:         ['montant ttc', 'ttc', 'montant', 'amount', 'prix ttc', 'total ttc', 'total', 'prix'],
  category:    ['catégorie', 'categorie', 'category', 'nature', 'poste'],
  status:      ['statut', 'status', 'état', 'etat', 'paiement', 'règlement', 'reglement'],
  type:        ['type', 'type charge'],
  credit:      ['crédit', 'credit', 'encaissement', 'montant credit', 'montant crédit', 'avoir'],
  debit:       ['débit', 'debit', 'decaissement', 'décaissement', 'montant debit', 'montant débit'],
  dueDate:     ['echeance', 'date echeance', 'date limite', 'due date', 'due_date', 'date paiement', 'date de paiement', 'date reglement', 'date de reglement'],
};

function norm(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

function findCol(headers, synonyms) {
  const normed = headers.map(norm);
  for (const syn of synonyms) {
    const n = norm(syn);
    const idx = normed.findIndex((h) => h === n || h.includes(n) || n.includes(h));
    if (idx !== -1) return idx;
  }
  return -1;
}

function buildColMap(headers) {
  const map = {};
  for (const [field, syns] of Object.entries(HEADER_MAP)) {
    map[field] = findCol(headers, syns);
  }
  return map;
}

// ─── Value parsers ────────────────────────────────────────────────────────────
function parseAmt(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : Math.abs(n); // always positive
}

function parseDate(v) {
  if (!v) return today();
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const fr = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (fr) return `${fr[3]}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`;
  // Excel serial date (number)
  if (typeof v === 'number' && v > 40000 && v < 100000) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return d.toISOString().slice(0, 10);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? today() : d.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function inferStatus(raw) {
  const s = norm(raw ?? '');
  return s.includes('pay') || s.includes('regl') || s.includes('encaiss') ? 'paid' : 'pending';
}

function inferType(raw) {
  const s = norm(raw ?? '');
  return s.includes('fix') ? 'fixed' : 'variable';
}

function fillAmounts(ht, tva, ttc) {
  if (ttc > 0 && ht === 0) {
    ht  = Math.round(ttc / 1.2 * 100) / 100;
    tva = tva || Math.round(ttc - ht);
  } else if (ht > 0 && ttc === 0) {
    tva = tva || Math.round(ht * 0.2 * 100) / 100;
    ttc = Math.round((ht + tva) * 100) / 100;
  }
  return { ht, tva, ttc };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Read a File object and return raw 2-D array (first row = headers) */
export async function parseFile(file) {
  const XLSX = await loadXLSX();
  const ext  = (file.name || '').split('.').pop().toLowerCase();

  // CSV: read as UTF-8 text then let SheetJS parse it
  if (ext === 'csv') {
    const text = await file.text();
    const wb   = XLSX.read(text, { type: 'string' });
    const ws   = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    return rows.filter((r) => r.some((c) => c !== ''));
  }

  // Excel (.xls / .xlsx): binary read
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'binary', cellDates: false });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        resolve(rows.filter((r) => r.some((c) => c !== '')));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

/** Auto-detect whether file looks like a bank export, sales list, or expense list */
export function detectImportType(rawRows) {
  if (!rawRows || rawRows.length < 2) return 'sales';
  const headers = rawRows[0].map(String);
  const cm = buildColMap(headers);
  if (cm.credit !== -1 || cm.debit !== -1) return 'bank';
  if (cm.supplier !== -1 && cm.client === -1) return 'expenses';
  return 'sales';
}

/**
 * Convert raw 2-D array into typed records ready for the DataContext.
 * importType: 'sales' | 'expenses' | 'bank'
 * Returns { sales: [], expenses: [] }
 */
export function parseRows(rawRows, importType) {
  if (!rawRows || rawRows.length < 2) return { sales: [], expenses: [] };

  const headers = rawRows[0].map(String);
  const cm = buildColMap(headers);
  const get = (row, col) => (col !== -1 ? row[col] : '');

  const outSales = [];
  const outExpenses = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.every((c) => c === '' || c === null)) continue;

    const date    = parseDate(get(row, cm.date));
    const rawDue  = get(row, cm.dueDate);
    const dueDate = rawDue ? parseDate(rawDue) : '';
    const desc = String(get(row, cm.description)).trim();
    const cat  = String(get(row, cm.category) || '').trim();

    if (importType === 'bank') {
      const credit = parseAmt(get(row, cm.credit));
      const debit  = parseAmt(get(row, cm.debit));
      const label  = desc || String(get(row, cm.supplier) || get(row, cm.client) || '').trim();

      if (credit > 0) {
        const { ht, tva, ttc } = fillAmounts(0, 0, credit);
        outSales.push({
          date, client: label, description: label,
          category: cat || 'Encaissement', ht, tva, ttc, status: 'paid',
          ...(dueDate ? { dueDate } : {}),
        });
      }
      if (debit > 0) {
        const { ht, tva, ttc } = fillAmounts(0, 0, debit);
        outExpenses.push({
          date, supplier: label, description: label,
          category: cat || 'Virement', ht, tva, ttc, type: 'variable',
          ...(dueDate ? { dueDate } : {}),
        });
      }
    } else if (importType === 'sales') {
      const { ht, tva, ttc } = fillAmounts(
        parseAmt(get(row, cm.ht)),
        parseAmt(get(row, cm.tva)),
        parseAmt(get(row, cm.ttc))
      );
      if (ttc === 0 && ht === 0) continue;
      outSales.push({
        date,
        client:      String(get(row, cm.client) || desc || '').trim(),
        description: desc,
        category:    cat || 'Prestation',
        ht, tva, ttc,
        status: inferStatus(get(row, cm.status)),
        ...(dueDate ? { dueDate } : {}),
      });
    } else {
      // expenses
      const { ht, tva, ttc } = fillAmounts(
        parseAmt(get(row, cm.ht)),
        parseAmt(get(row, cm.tva)),
        parseAmt(get(row, cm.ttc))
      );
      if (ttc === 0 && ht === 0) continue;
      outExpenses.push({
        date,
        supplier:    String(get(row, cm.supplier) || desc || '').trim(),
        description: desc,
        category:    cat || 'Autre',
        ht, tva, ttc,
        type: inferType(get(row, cm.type)),
        ...(dueDate ? { dueDate } : {}),
      });
    }
  }

  return { sales: outSales, expenses: outExpenses };
}

/** Preview: return first N data rows as simple objects for the UI table */
export function previewRows(rawRows, importType, n = 5) {
  const { sales, expenses } = parseRows(rawRows, importType);
  const rows = importType === 'expenses' ? expenses : sales;
  return rows.slice(0, n);
}
