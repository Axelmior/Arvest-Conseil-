// ─── Détection du type de fichier (MIME + extension) ─────────────────────────
export function detectFileType(file) {
  const ext  = (file.name  || '').split('.').pop().toLowerCase();
  const mime = (file.type  || '').toLowerCase();
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (['jpg','jpeg','png','webp','bmp','tif','tiff','gif'].includes(ext) || mime.startsWith('image/')) return 'image';
  if (['xls','xlsx'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel') || mime === 'application/vnd.ms-excel') return 'excel';
  if (ext === 'csv' || mime === 'text/csv' || mime === 'application/csv') return 'csv';
  return 'unknown';
}

// ─── PDF.js chargé dynamiquement (réduit le bundle initial) ──────────────────
let _pdfjsLib = null;
async function loadPdfjs() {
  if (_pdfjsLib) return _pdfjsLib;
  _pdfjsLib = await import('pdfjs-dist');
  _pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${_pdfjsLib.version}/build/pdf.worker.min.mjs`;
  return _pdfjsLib;
}

// ─── Mois français ────────────────────────────────────────────────────────────
const FR_MONTHS = {
  janvier: '01', février: '02', fevrier: '02', mars: '03', avril: '04',
  mai: '05', juin: '06', juillet: '07', août: '08', aout: '08',
  septembre: '09', octobre: '10', novembre: '11', décembre: '12', decembre: '12',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Parsing des montants (formats FR/EN/DE) ──────────────────────────────────
function parseAmt(raw) {
  if (raw === null || raw === undefined || raw === '') return 0;
  let s = String(raw).trim().replace(/[€$£]|EUR|USD|eur/g, '').trim();
  if (!s) return 0;

  const dots = (s.match(/\./g) || []).length;
  const commas = (s.match(/,/g) || []).length;

  if (dots > 0 && commas > 0) {
    // Mixed: le dernier séparateur est le décimal
    if (s.lastIndexOf('.') > s.lastIndexOf(',')) {
      s = s.replace(/,/g, '');           // 1,200.50 → 1200.50
    } else {
      s = s.replace(/\./g, '').replace(',', '.'); // 1.200,50 → 1200.50
    }
  } else if (commas === 1) {
    s = s.replace(',', '.');             // 1200,50 → 1200.50
  } else if (dots === 1) {
    const afterDot = s.split('.')[1] || '';
    if (afterDot.length === 3) s = s.replace('.', ''); // 1.200 → 1200
    // sinon: 1.50 reste → 1.50
  } else if (commas > 1) {
    s = s.replace(/,/g, '');             // 1,200,300 → US
  } else if (dots > 1) {
    s = s.replace(/\./g, '');            // 1.200.300 → EU
  }

  s = s.replace(/\s/g, '').replace(/[^\d.]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.abs(n);
}

// ─── Parsing des dates ────────────────────────────────────────────────────────
function parseDate(raw) {
  if (!raw) return today();
  const s = String(raw).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  const m1 = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2, '0')}-${m1[1].padStart(2, '0')}`;

  const m2 = s.match(/(\d{1,2})(?:er|ème|e)?\s+([a-zéèêùàâîôûçœ]+)\s+(\d{4})/i);
  if (m2) {
    const month = FR_MONTHS[m2[2].toLowerCase()];
    if (month) return `${m2[3]}-${month}-${m2[1].padStart(2, '0')}`;
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? today() : d.toISOString().slice(0, 10);
}

// ─── Extraction du montant TTC principal ──────────────────────────────────────
function findTTC(text) {
  const LABELED = [
    /(?:net\s+[àa]\s+payer|total\s+ttc|montant\s+ttc|montant\s+total|total\s+d[uû]|[àa]\s+r[eé]gler|[àa]\s+payer|net\s+total|total\s+g[eé]n[eé]ral)\s*[:\=]?\s*([\d\s,.]+)\s*(?:€|EUR)?/i,
    /(?:total|montant)\s*(?:ht\s*\+\s*tva)?\s*[:\=]\s*([\d\s,.]+)\s*(?:€|EUR)/i,
  ];
  for (const re of LABELED) {
    const m = text.match(re);
    if (m) { const v = parseAmt(m[1]); if (v > 0) return v; }
  }
  // Fallback: le plus grand montant suivi d'€
  const all = [];
  const re = /([\d]{1,3}(?:[\s\.']\d{3})*(?:[,\.]\d{1,2})?)\s*(?:€|EUR)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const v = parseAmt(m[1]);
    if (v > 0.5 && v < 10_000_000) all.push(v);
  }
  return all.length ? Math.max(...all) : 0;
}

function findHT(text) {
  const m = text.match(
    /(?:(?:total|sous[- ]total|montant)\s+)?(?:ht|hors[- ]taxe|base\s+tva|net\s+ht)\s*[:\=]?\s*([\d\s,.]+)\s*(?:€|EUR)?/i
  );
  if (m) { const v = parseAmt(m[1]); if (v > 0) return v; }
  return 0;
}

function findTVA(text) {
  const m = text.match(
    /(?:montant\s+)?(?:tva|t\.v\.a\.?)\s*(?:\d{1,2}\s*%\s*)?[:\=]?\s*([\d\s,.]+)\s*(?:€|EUR)?/i
  );
  if (m) { const v = parseAmt(m[1]); if (v > 0.5 && v < 1_000_000) return v; }
  return 0;
}

// ─── Extraction de la date ────────────────────────────────────────────────────
function findDate(text) {
  const LABELED = [
    /(?:date\s+(?:de\s+)?(?:facture|facturation|[eé]mission|document))\s*[:\=]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /(?:date\s+(?:de\s+)?(?:facture|facturation|[eé]mission|document))\s*[:\=]?\s*(\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2})/i,
    /(?:le|du|en\s+date\s+du)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /(?:le|du|en\s+date\s+du)\s+(\d{1,2}(?:er|ème)?\s+[a-zéèêùàâîôûçœ]+\s+\d{4})/i,
    /(?:date)\s*[:\=]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /(\d{4}-\d{2}-\d{2})/,
  ];
  for (const re of LABELED) {
    const m = text.match(re);
    if (m) {
      const d = parseDate(m[1]);
      if (d && d !== today()) return d;
    }
  }
  // Toutes les dates DD/MM/YYYY dans le texte
  const raw = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}/g) || [];
  for (const r of raw) {
    const d = parseDate(r);
    if (d !== today()) return d;
  }
  return today();
}

// ─── Extraction du nom de la partie (fournisseur/client) ─────────────────────
function trimParty(s) {
  return s.trim().replace(/\s+/g, ' ').slice(0, 60);
}

function findParty(text, docType) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Patterns labellisés
  const SUPPLIER_RE = /(?:[eé]mis\s+par|fournisseur|vendeur|de\s*:|prestataire|soci[eé]t[eé]\s*:)\s*(.+)/i;
  const CLIENT_RE   = /(?:client|factur[eé]\s+[àa]|[àa]\s+l.attention|destinataire|pour\s*:)\s*(.+)/i;
  const targetRe = docType === 'expense' ? SUPPLIER_RE : CLIENT_RE;

  for (const line of lines) {
    const m = line.match(targetRe);
    if (m && m[1].trim().length > 2) return trimParty(m[1]);
  }

  // Nom de société (SARL, SAS, SA, EURL, etc.)
  const compRe = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ][A-Za-zÀ-ÿ\s\-&'\.]{1,30})\s+(?:SARL|SAS|SA|EURL|SASU|SNC|SCI|SCOP|GIE)\b/;
  const cm = text.match(compRe);
  if (cm) return trimParty(cm[0]);

  // Ligne en MAJUSCULES (raison sociale)
  for (const line of lines) {
    if (/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ\s\-&'\.]{4,60}$/.test(line) && line.length >= 4) {
      if (!/FACTURE|INVOICE|DEVIS|DATE|TOTAL|TVA|IBAN/i.test(line)) {
        return trimParty(line);
      }
    }
  }

  // Premières lignes non-numériques
  for (const line of lines.slice(0, 6)) {
    if (line.length >= 3 && line.length <= 60 && !/^\d/.test(line) &&
        !/facture|invoice|devis|date|total|tva/i.test(line)) {
      return trimParty(line);
    }
  }

  return '';
}

// ─── Extraction de la description ────────────────────────────────────────────
function findDescription(text) {
  const PATS = [
    /(?:objet|d[eé]signation|prestation|libell[eé]|description|nature)\s*[:\-]\s*(.+)/i,
    /(?:r[eé]f(?:[eé]rence)?|n[°o]?\s*facture)\s*[:\-]?\s*(.+)/i,
  ];
  for (const re of PATS) {
    const m = text.match(re);
    if (m && m[1].trim().length > 2) return m[1].trim().replace(/\s+/g, ' ').slice(0, 100);
  }
  return '';
}

// ─── Détection du type de document ───────────────────────────────────────────
function detectDocType(text) {
  const t = text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');

  const expScore =
    ((t.match(/\b(achat|fournisseur|vendeur|prestataire|charge)\b/g) || []).length) +
    ((t.match(/\b(ticket|recu|note de frais)\b/g) || []).length * 2);

  const saleScore =
    ((t.match(/\b(vente|client|acheteur|devis|bon de commande)\b/g) || []).length) +
    ((t.match(/\b(encaissement)\b/g) || []).length * 2);

  if (expScore > saleScore) return 'expense';
  if (saleScore > expScore) return 'sale';
  return 'unknown';
}

// ─── Catégorie automatique ────────────────────────────────────────────────────
const EXPENSE_CATS = [
  { kw: ['loyer', 'bail', 'local', 'bureau'], cat: 'Loyer' },
  { kw: ['assurance'], cat: 'Assurances' },
  { kw: ['energie', 'electricite', 'gaz', 'eau'], cat: 'Énergie' },
  { kw: ['logiciel', 'abonnement', 'saas', 'software', 'licence'], cat: 'Logiciels' },
  { kw: ['transport', 'deplacement', 'carburant', 'train', 'avion', 'taxi', 'uber'], cat: 'Déplacements' },
  { kw: ['marketing', 'publicite', 'communication', 'ads', 'seo'], cat: 'Marketing' },
  { kw: ['fourniture', 'papeterie', 'materiel bureau'], cat: 'Fournitures' },
  { kw: ['honoraire', 'comptable', 'avocat', 'consultant', 'conseil'], cat: 'Honoraires' },
  { kw: ['salaire', 'paie', 'urssaf', 'cotisation', 'social'], cat: 'Charges sociales' },
  { kw: ['telephone', 'mobile', 'internet', 'telecom'], cat: 'Logiciels' },
];

const SALE_CATS = [
  { kw: ['conseil', 'consulting', 'audit'], cat: 'Conseil' },
  { kw: ['formation', 'cours', 'coaching'], cat: 'Formation' },
  { kw: ['produit', 'materiel', 'article'], cat: 'Produit' },
  { kw: ['prestation', 'service', 'mission'], cat: 'Prestation' },
];

function detectCategory(text, docType) {
  const t = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const list = docType === 'expense' ? EXPENSE_CATS : SALE_CATS;
  for (const { kw, cat } of list) {
    if (kw.some(k => t.includes(k))) return cat;
  }
  return docType === 'expense' ? 'Autres' : 'Prestation';
}

// ─── Score de confiance ───────────────────────────────────────────────────────
function computeConfidence(r) {
  let score = 0;
  if (r.ttc > 0) score += 40;
  else if (r.ht > 0) score += 20;
  if (r.date && r.date !== today()) score += 25;
  if (r.party && r.party.length > 2) score += 25;
  if (r.type !== 'unknown') score += 10;
  return Math.min(100, score);
}

// ─── Parseur principal ────────────────────────────────────────────────────────
export function parseExtractedText(text, defaultType = 'unknown') {
  const type = defaultType !== 'unknown' ? defaultType : detectDocType(text);

  let ttc = findTTC(text);
  let ht  = findHT(text);
  let tva = findTVA(text);

  // Compléter les montants manquants
  if (ttc > 0 && ht === 0) {
    ht  = Math.round(ttc / 1.2 * 100) / 100;
    tva = tva || Math.round((ttc - ht) * 100) / 100;
  } else if (ht > 0 && ttc === 0) {
    tva = tva || Math.round(ht * 0.2 * 100) / 100;
    ttc = Math.round((ht + tva) * 100) / 100;
  }

  const date        = findDate(text);
  const party       = findParty(text, type);
  const description = findDescription(text);
  const category    = detectCategory(text, type);

  const result = { date, ht, tva, ttc, party, description, category, type };
  result.confidence = computeConfidence(result);
  return result;
}

// ─── Tesseract chargé dynamiquement (singleton) ───────────────────────────────
let _tesseract = null;
async function loadTesseract() {
  if (_tesseract) return _tesseract;
  _tesseract = await import('tesseract.js');
  return _tesseract;
}

// ─── OCR central : accepte File | Blob | HTMLCanvasElement ───────────────────
// Tesseract.js v7 lit File/Blob via FileReader et Canvas via canvas.toBlob()
// directement sur le thread principal — pas besoin de blob URL intermédiaire.
// Cela corrige : URL.createObjectURL(null) si canvas.toBlob échoue,
// le worker non terminé en cas d'erreur, et les fuites de mémoire.
async function runOCR(source, onProgress) {
  if (source == null) throw new Error('OCR : source d\'image manquante ou invalide.');

  const { createWorker } = await loadTesseract();

  const worker = await createWorker(['fra', 'eng'], 1, {
    logger: (msg) => {
      if (!onProgress) return;
      const pct = Math.round((msg.progress ?? 0) * 100);
      // Couvre toutes les phases de Tesseract.js v7, pas seulement 'recognizing text'
      switch (msg.status) {
        case 'loading tesseract core':
          onProgress(5, 'Chargement moteur OCR…');
          break;
        case 'initializing tesseract':
          onProgress(8, 'Initialisation…');
          break;
        case 'loading language traineddata':
          // Téléchargement des données de langue (~5 MB fra + eng sur CDN)
          onProgress(10 + Math.round(pct * 0.12), `Données linguistiques… ${pct}%`);
          break;
        case 'initializing api':
          onProgress(22, 'API prête…');
          break;
        case 'recognizing text':
          onProgress(25 + Math.round((msg.progress ?? 0) * 70), `Reconnaissance… ${pct}%`);
          break;
        default:
          break;
      }
    },
  });

  try {
    const { data } = await worker.recognize(source);
    return data?.text ?? '';
  } finally {
    // terminate() est toujours appelé, même en cas d'erreur
    await worker.terminate();
  }
}

// ─── Rend une page PDF en HTMLCanvasElement ───────────────────────────────────
async function renderPageToCanvas(page) {
  const viewport = page.getViewport({ scale: 2.0 }); // ~192 DPI
  const canvas   = document.createElement('canvas');
  canvas.width   = viewport.width;
  canvas.height  = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D non disponible dans ce navigateur.');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

// ─── Extraction depuis image ──────────────────────────────────────────────────
export async function extractFromImage(file, onProgress) {
  if (onProgress) onProgress(3, 'Initialisation OCR…');
  // Passe le File directement à runOCR — plus fiable qu'une blob URL
  const text = await runOCR(file, onProgress);
  if (onProgress) onProgress(100, 'Extraction terminée');
  return text;
}

// ─── Extraction depuis PDF ────────────────────────────────────────────────────
export async function extractFromPDF(file, onProgress) {
  const pdfjsLib = await loadPdfjs();
  const ab       = await file.arrayBuffer();

  if (onProgress) onProgress(5, 'Chargement du PDF…');
  const pdf      = await pdfjsLib.getDocument({ data: new Uint8Array(ab) }).promise;

  // ── Étape 1 : extraction du texte natif ──────────────────────────────────
  let fullText  = '';
  const maxPages = Math.min(pdf.numPages, 4);

  for (let i = 1; i <= maxPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    let prevY = Infinity;
    for (const item of content.items) {
      if (!item.str) continue;
      const y = item.transform[5];
      if (Math.abs(y - prevY) > 4) fullText += '\n';
      fullText += item.str + (item.hasEOL ? '\n' : ' ');
      prevY = y;
    }
    fullText += '\n\n';
    if (onProgress) onProgress(5 + Math.round((i / maxPages) * 50), `Analyse page ${i}/${maxPages}…`);
  }

  // ── Étape 2 : PDF scanné → rendu canvas + OCR ────────────────────────────
  const charCount = fullText.trim().replace(/\s+/g, '').length;
  if (charCount < 80) {
    if (onProgress) onProgress(60, 'PDF scanné détecté — démarrage OCR…');

    // On OCRise jusqu'à 2 pages (couvre recto-verso des factures courantes)
    const pagesToOCR = Math.min(pdf.numPages, 2);
    const ocrTexts   = [];

    for (let i = 1; i <= pagesToOCR; i++) {
      const page   = await pdf.getPage(i);
      const canvas = await renderPageToCanvas(page);
      // canvas est passé directement à Tesseract — corrige le bug canvas.toBlob → null
      const pageText = await runOCR(canvas, (p, label) => {
        if (!onProgress) return;
        const base = 60 + ((i - 1) / pagesToOCR) * 35;
        const span = 35 / pagesToOCR;
        onProgress(Math.round(base + (p / 100) * span), label ?? `OCR page ${i}… ${p}%`);
      });
      ocrTexts.push(pageText);
    }

    fullText = ocrTexts.join('\n\n');
  }

  if (onProgress) onProgress(100, 'Extraction terminée');
  return fullText;
}

// ─── Point d'entrée principal ─────────────────────────────────────────────────
export async function processDocument(file, onProgress) {
  const ft = detectFileType(file);
  if (ft === 'pdf')   return extractFromPDF(file, onProgress);
  if (ft === 'image') return extractFromImage(file, onProgress);
  throw new Error('Format non supporté. Utilisez un PDF ou une image (JPG, PNG, WEBP).');
}

// ─── Détection de doublon ─────────────────────────────────────────────────────
export function checkDuplicate(extracted, sales, expenses) {
  const { ttc, date, party } = extracted;
  if (!ttc || ttc <= 0) return false;
  const partyKey = (party || '').toLowerCase().slice(0, 8);
  return [...sales, ...expenses].some((r) => {
    const rParty = (r.client || r.supplier || '').toLowerCase();
    const partyMatch = partyKey.length < 3 ||
      rParty.includes(partyKey) || partyKey.includes(rParty.slice(0, 8));
    return r.date === date && Math.abs(r.ttc - ttc) < 0.02 && partyMatch;
  });
}
