import { formatEuro, formatDate } from './format';

// ─── Alert computation engine ─────────────────────────────────────────────────
// Pure function: takes financial data, returns sorted alert objects.
// Each alert has: id, type, category, priority, title, message, cause, impact, action
//
// Types   : 'critical' | 'warning' | 'success'
// Priority: 1 = critical, 2 = warning, 3 = positive

export function computeAlerts({ sales, expenses, kpis, treasury, futureFlows }) {
  const today = new Date().toISOString().slice(0, 10);
  const now   = new Date();
  const alerts = [];

  function push(a) { alerts.push({ date: today, ...a }); }

  // Month helpers
  const curPfx  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevPfx  = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const curExp  = expenses.filter(e => e.date?.startsWith(curPfx)).reduce((s, e) => s + (parseFloat(e.ttc) || 0), 0);
  const prevExp = expenses.filter(e => e.date?.startsWith(prevPfx)).reduce((s, e) => s + (parseFloat(e.ttc) || 0), 0);
  const curCA   = sales.filter(s => s.date?.startsWith(curPfx)).reduce((s, e) => s + (parseFloat(e.ttc) || 0), 0);
  const prevCA  = sales.filter(s => s.date?.startsWith(prevPfx)).reduce((s, e) => s + (parseFloat(e.ttc) || 0), 0);

  // ── 1. TRÉSORERIE ──────────────────────────────────────────────────────────
  if (treasury.solde < 0) {
    push({
      id: 'treasury_negative', type: 'critical', category: 'treasury', priority: 1,
      icon: 'wallet',
      title: 'Trésorerie négative',
      message: `Solde actuel : ${formatEuro(treasury.solde)}`,
      cause:  'Les décaissements dépassent les encaissements sur la période.',
      impact: 'Risque de défaut de paiement immédiat — découvert bancaire probable.',
      action: 'Relancez vos clients impayés. Négociez un report de charges avec vos fournisseurs. Contactez votre banque pour une ligne de trésorerie.',
    });
  } else if (kpis.ca > 0 && treasury.solde < kpis.ca * 0.1) {
    push({
      id: 'treasury_low', type: 'warning', category: 'treasury', priority: 2,
      icon: 'wallet',
      title: 'Trésorerie insuffisante',
      message: `${formatEuro(treasury.solde)} — moins de 10 % du CA`,
      cause:  'Votre trésorerie ne couvre pas 1 mois de charges courantes.',
      impact: 'Fragilité en cas d\'imprévu ou de retard de règlement client.',
      action: 'Constituez un matelas de sécurité de 2 mois de charges. Accélérez vos encaissements et différez les dépenses non urgentes.',
    });
  }

  // ── 2. PRÉVISION CASH À 30 JOURS ──────────────────────────────────────────
  const cashIn30  = futureFlows.filter(f => f.kind === 'sale').reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);
  const cashOut30 = futureFlows.filter(f => f.kind === 'expense').reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);
  const projected = treasury.solde + cashIn30 - cashOut30;

  if (projected < 0 && treasury.solde >= 0) {
    push({
      id: 'cash_forecast_negative', type: 'critical', category: 'treasury', priority: 1,
      icon: 'trending_down',
      title: 'Cash négatif prévu à 30 jours',
      message: `Solde projeté : ${formatEuro(projected)}`,
      cause:  'Vos charges futures dépassent les encaissements attendus.',
      impact: 'Rupture de trésorerie probable dans moins de 30 jours.',
      action: 'Anticipez un financement court terme ou accélérez vos encaissements clients.',
    });
  }

  // ── 3. FACTURES EN RETARD ──────────────────────────────────────────────────
  const overdue = sales.filter(s => s.status === 'pending' && (s.dueDate || s.due_date) && (s.dueDate || s.due_date) < today);

  if (overdue.length === 1) {
    const s = overdue[0];
    const due = s.dueDate || s.due_date;
    push({
      id: `overdue_${s.id}`, type: 'critical', category: 'billing', priority: 1,
      icon: 'clock',
      title: 'Facture en retard',
      message: `${s.client} — ${formatEuro(parseFloat(s.ttc) || 0)}`,
      cause:  `Échéance dépassée depuis le ${formatDate(due)}.`,
      impact: `${formatEuro(parseFloat(s.ttc) || 0)} non encaissés pèsent sur votre trésorerie.`,
      action: 'Relancez ce client par email ou téléphone. Envisagez une mise en demeure après 15 jours sans réponse.',
    });
  } else if (overdue.length > 1) {
    const total = overdue.reduce((s, inv) => s + (parseFloat(inv.ttc) || 0), 0);
    push({
      id: 'overdue_multiple', type: 'critical', category: 'billing', priority: 1,
      icon: 'clock',
      title: `${overdue.length} factures en retard`,
      message: `Total impayé : ${formatEuro(total)}`,
      cause:  `${overdue.length} clients n'ont pas réglé dans les délais.`,
      impact: `${formatEuro(total)} bloqués fragilisent votre cash-flow.`,
      action: 'Planifiez des relances par ordre d\'ancienneté. Envisagez un processus de recouvrement systématique.',
    });
  }

  // ── 4. RENTABILITÉ ─────────────────────────────────────────────────────────
  if (kpis.ca > 0) {
    if (kpis.margin < 10) {
      push({
        id: `margin_critical`, type: 'critical', category: 'profitability', priority: 1,
        icon: 'trending_down',
        title: 'Marge critique',
        message: `Marge nette : ${kpis.margin.toFixed(1)} %`,
        cause:  'Vos charges représentent plus de 90 % de votre chiffre d\'affaires.',
        impact: 'L\'activité n\'est pas viable économiquement à ce niveau.',
        action: 'Revoyez votre pricing à la hausse, négociez vos achats et identifiez les charges compressibles.',
      });
    } else if (kpis.margin < 20) {
      push({
        id: `margin_low`, type: 'warning', category: 'profitability', priority: 2,
        icon: 'trending_down',
        title: 'Marge faible',
        message: `Marge nette : ${kpis.margin.toFixed(1)} %`,
        cause:  'Charges trop élevées rapportées au volume d\'affaires.',
        impact: 'Peu de marge de manœuvre en cas de baisse d\'activité ou d\'imprévu.',
        action: 'Analysez poste par poste vos charges variables et cherchez des optimisations à court terme.',
      });
    } else if (kpis.margin >= 30) {
      push({
        id: `margin_good`, type: 'success', category: 'profitability', priority: 3,
        icon: 'star',
        title: 'Excellente rentabilité',
        message: `Marge nette : ${kpis.margin.toFixed(1)} %`,
        cause:  null,
        impact: 'Votre activité génère une marge solide.',
        action: 'Capitalisez sur ce modèle. Réinvestissez une partie dans votre croissance ou constituez une réserve.',
      });
    }
  }

  // ── 5. ÉVOLUTION DES CHARGES ───────────────────────────────────────────────
  if (prevExp > 0 && curExp > prevExp * 1.5) {
    const pct = Math.round((curExp / prevExp - 1) * 100);
    push({
      id: `expenses_surge_${curPfx}`, type: 'critical', category: 'billing', priority: 1,
      icon: 'receipt',
      title: 'Charges en forte hausse',
      message: `+${pct} % vs mois précédent`,
      cause:  'Une ou plusieurs dépenses inhabituelles enregistrées ce mois.',
      impact: `Surcoût de ${formatEuro(curExp - prevExp)} par rapport au mois précédent.`,
      action: 'Identifiez les dépenses exceptionnelles et vérifiez leur justification. Bloquez tout achat non validé.',
    });
  } else if (prevExp > 0 && curExp > prevExp * 1.2) {
    const pct = Math.round((curExp / prevExp - 1) * 100);
    push({
      id: `expenses_high_${curPfx}`, type: 'warning', category: 'billing', priority: 2,
      icon: 'receipt',
      title: 'Charges en hausse',
      message: `+${pct} % vs mois précédent`,
      cause:  'Augmentation progressive de vos dépenses opérationnelles.',
      impact: `Pression supplémentaire de ${formatEuro(curExp - prevExp)} sur la marge mensuelle.`,
      action: 'Passez en revue vos catégories de charges et identifiez les postes optimisables.',
    });
  }

  // ── 6. ÉVOLUTION DU CHIFFRE D'AFFAIRES ────────────────────────────────────
  if (prevCA > 0 && curCA < prevCA * 0.7) {
    const pct = Math.round((1 - curCA / prevCA) * 100);
    push({
      id: `ca_drop_${curPfx}`, type: 'critical', category: 'activity', priority: 1,
      icon: 'trending_down',
      title: 'Chute de CA',
      message: `-${pct} % vs mois précédent`,
      cause:  'Baisse importante du volume ou de la valeur des ventes.',
      impact: `${formatEuro(prevCA - curCA)} de CA en moins par rapport au mois dernier.`,
      action: 'Identifiez la cause : saisonnalité, perte de client ou problème opérationnel. Relancez votre prospection.',
    });
  } else if (prevCA > 0 && curCA < prevCA * 0.85) {
    const pct = Math.round((1 - curCA / prevCA) * 100);
    push({
      id: `ca_low_${curPfx}`, type: 'warning', category: 'activity', priority: 2,
      icon: 'trending_down',
      title: 'CA en baisse',
      message: `-${pct} % vs mois précédent`,
      cause:  'Recul de l\'activité commerciale par rapport au mois précédent.',
      impact: `Baisse de ${formatEuro(prevCA - curCA)} à récupérer pour maintenir le niveau.`,
      action: 'Relancez votre prospection et vérifiez votre pipeline commercial.',
    });
  } else if (prevCA > 0 && curCA > prevCA * 1.2) {
    const pct = Math.round((curCA / prevCA - 1) * 100);
    push({
      id: `ca_up_${curPfx}`, type: 'success', category: 'activity', priority: 3,
      icon: 'trending_up',
      title: 'CA en progression',
      message: `+${pct} % vs mois précédent`,
      cause:  null,
      impact: `${formatEuro(curCA - prevCA)} de CA supplémentaire ce mois.`,
      action: 'Identifiez ce qui fonctionne et reproduisez ces actions commerciales.',
    });
  }

  // ── 7. CONCENTRATION CLIENT ────────────────────────────────────────────────
  if (kpis.ca > 0 && sales.length > 0) {
    const byClient = {};
    sales.forEach(s => {
      const c = s.client || 'Inconnu';
      byClient[c] = (byClient[c] || 0) + (parseFloat(s.ttc) || 0);
    });
    const [topName, topVal] = Object.entries(byClient).sort((a, b) => b[1] - a[1])[0];
    const concentration = topVal / kpis.ca;

    if (concentration > 0.8) {
      push({
        id: 'client_concentration_critical', type: 'critical', category: 'risk', priority: 1,
        icon: 'users',
        title: 'Dépendance critique',
        message: `${topName} : ${Math.round(concentration * 100)} % du CA`,
        cause:  'Votre revenu est concentré à plus de 80 % sur un seul client.',
        impact: 'La perte de ce client mettrait l\'entreprise en danger immédiat.',
        action: 'Diversifiez votre portefeuille en ciblant 3–5 nouveaux clients. Visez moins de 40 % de concentration.',
      });
    } else if (concentration > 0.6) {
      push({
        id: 'client_concentration_warning', type: 'warning', category: 'risk', priority: 2,
        icon: 'users',
        title: 'Forte dépendance client',
        message: `${topName} : ${Math.round(concentration * 100)} % du CA`,
        cause:  'Votre CA est trop concentré sur un seul client.',
        impact: 'Vulnérabilité élevée en cas de perte ou de retard de paiement.',
        action: 'Développez 2–3 nouveaux clients pour réduire votre exposition au risque.',
      });
    }
  }

  // ── 8. ENCAISSEMENTS À VENIR (positif) ────────────────────────────────────
  const horizon7 = new Date();
  horizon7.setDate(horizon7.getDate() + 7);
  const h7str = horizon7.toISOString().slice(0, 10);
  const upcoming = futureFlows.filter(f => f.kind === 'sale' && f.effectiveDate <= h7str);

  if (upcoming.length > 0) {
    const total = upcoming.reduce((s, f) => s + (parseFloat(f.ttc) || 0), 0);
    push({
      id: `upcoming_${h7str}`, type: 'success', category: 'treasury', priority: 3,
      icon: 'trending_up',
      title: 'Encaissements à venir',
      message: `${upcoming.length} paiement${upcoming.length > 1 ? 's' : ''} — ${formatEuro(total)}`,
      cause:  null,
      impact: `+${formatEuro(total)} attendus sur les 7 prochains jours.`,
      action: 'Confirmez la réception des règlements aux dates prévues. Relancez si besoin.',
    });
  }

  return alerts.sort((a, b) => a.priority - b.priority || a.category.localeCompare(b.category));
}

// ─── Health score ─────────────────────────────────────────────────────────────
// Returns 0–100. Each critical alert deducts 20 pts, each warning 8 pts.
export function computeHealthScore(alerts) {
  let score = 100;
  alerts.forEach(a => {
    if (a.type === 'critical') score -= 20;
    else if (a.type === 'warning') score -= 8;
  });
  return Math.max(0, Math.min(100, score));
}

// ─── Chart annotation helpers ─────────────────────────────────────────────────
// Returns months with significant CA drops or charge spikes for chart markers.
export function computeChartAnnotations(monthlyData) {
  const marks = [];
  for (let i = 1; i < monthlyData.length; i++) {
    const prev = monthlyData[i - 1];
    const curr = monthlyData[i];
    if (prev.ca > 0 && curr.ca < prev.ca * 0.8)
      marks.push({ month: curr.month, kind: 'ca_drop',       label: '▼', color: '#ef4444' });
    if (prev.charges > 0 && curr.charges > prev.charges * 1.3)
      marks.push({ month: curr.month, kind: 'charges_spike', label: '▲', color: '#f59e0b' });
  }
  return marks;
}
