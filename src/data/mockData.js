export const MOCK_SALES = [
  { id: 1, date: '2026-04-18', client: 'Boulangerie Dupont', category: 'Conseil', description: 'Audit financier Q1', ht: 2500, tva: 500, ttc: 3000, status: 'paid' },
  { id: 2, date: '2026-04-15', client: 'Atelier Martin', category: 'Formation', description: 'Formation pilotage', ht: 1200, tva: 240, ttc: 1440, status: 'paid' },
  { id: 3, date: '2026-04-12', client: 'Café des Arts', category: 'Conseil', description: 'Suivi mensuel mars', ht: 800, tva: 160, ttc: 960, status: 'pending' },
  { id: 4, date: '2026-04-10', client: 'Studio Lumière', category: 'Prestation', description: 'Mise en place tableau de bord', ht: 3200, tva: 640, ttc: 3840, status: 'paid' },
  { id: 5, date: '2026-04-05', client: 'Boucherie Leblanc', category: 'Conseil', description: 'Analyse rentabilité', ht: 1800, tva: 360, ttc: 2160, status: 'pending' },
  { id: 6, date: '2026-03-28', client: 'Boulangerie Dupont', category: 'Conseil', description: 'Suivi mensuel mars', ht: 800, tva: 160, ttc: 960, status: 'paid' },
  { id: 7, date: '2026-03-22', client: 'Cabinet Moreau', category: 'Formation', description: 'Workshop équipe', ht: 2400, tva: 480, ttc: 2880, status: 'paid' },
  { id: 8, date: '2026-03-15', client: 'Garage Central', category: 'Prestation', description: 'Setup comptabilité', ht: 1500, tva: 300, ttc: 1800, status: 'paid' }
];

export const MOCK_EXPENSES = [
  { id: 1, date: '2026-04-15', supplier: 'OVH Cloud', category: 'Logiciels', description: 'Hébergement serveurs', ht: 120, tva: 24, ttc: 144, type: 'fixed' },
  { id: 2, date: '2026-04-12', supplier: 'URSSAF', category: 'Charges sociales', description: 'Cotisations avril', ht: 850, tva: 0, ttc: 850, type: 'fixed' },
  { id: 3, date: '2026-04-10', supplier: 'SNCF', category: 'Déplacements', description: 'Billets TGV clients', ht: 180, tva: 18, ttc: 198, type: 'variable' },
  { id: 4, date: '2026-04-05', supplier: 'Propriétaire', category: 'Loyer', description: 'Loyer bureau avril', ht: 1200, tva: 0, ttc: 1200, type: 'fixed' },
  { id: 5, date: '2026-04-03', supplier: 'Google Ads', category: 'Marketing', description: 'Campagne Q2', ht: 450, tva: 90, ttc: 540, type: 'variable' },
  { id: 6, date: '2026-03-28', supplier: 'EDF', category: 'Énergie', description: 'Électricité mars', ht: 95, tva: 19, ttc: 114, type: 'fixed' },
  { id: 7, date: '2026-03-20', supplier: 'Assurance Pro', category: 'Assurances', description: 'RC Pro trimestre', ht: 320, tva: 0, ttc: 320, type: 'fixed' },
  { id: 8, date: '2026-03-15', supplier: 'Restaurant Le Gourmet', category: 'Frais de repas', description: 'Déjeuner clients', ht: 125, tva: 12.5, ttc: 137.5, type: 'variable' }
];

export const MONTHLY_DATA = [
  { month: 'Oct', ca: 8400, charges: 3200 },
  { month: 'Nov', ca: 9200, charges: 3400 },
  { month: 'Déc', ca: 11500, charges: 3800 },
  { month: 'Jan', ca: 7800, charges: 3100 },
  { month: 'Fév', ca: 8900, charges: 3500 },
  { month: 'Mar', ca: 10200, charges: 3700 },
  { month: 'Avr', ca: 12400, charges: 4100 }
];

export const CASH_EVOLUTION = [
  { day: '1', solde: 24500 },
  { day: '5', solde: 26200 },
  { day: '10', solde: 28900 },
  { day: '15', solde: 27100 },
  { day: '20', solde: 31400 },
  { day: '25', solde: 33800 },
  { day: '30', solde: 36200 }
];

export const CATEGORY_DATA = [
  { name: 'Loyer', value: 4800, color: '#1a1a1a' },
  { name: 'Charges sociales', value: 3400, color: '#525252' },
  { name: 'Marketing', value: 2200, color: '#C6A75E' },
  { name: 'Logiciels', value: 1800, color: '#a8a8a8' },
  { name: 'Déplacements', value: 1400, color: '#737373' },
  { name: 'Autres', value: 1200, color: '#d4d4d4' }
];

export const TOP_CLIENTS = [
  { name: 'Studio Lumière', value: 15400, percentage: 100 },
  { name: 'Boulangerie Dupont', value: 9600, percentage: 62 },
  { name: 'Cabinet Moreau', value: 7200, percentage: 47 },
  { name: 'Atelier Martin', value: 5800, percentage: 38 },
  { name: 'Boucherie Leblanc', value: 4200, percentage: 27 }
];
