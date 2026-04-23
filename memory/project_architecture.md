---
name: Architecture Arvest Pilot
description: Stack React Vite, DataContext avec persistance localStorage par utilisateur, import Excel/CSV/bancaire, KPIs temps réel
type: project
---

Projet React Vite SaaS de pilotage financier pour dirigeants (Arvest Pilot).

**Stack :** React 18, Vite, React Router 6, Recharts, SheetJS (xlsx), Lucide Icons.

**Auth :** simulée en sessionStorage (AuthContext). Chaque user identifié par `user.email`.

**DataContext (`src/context/DataContext.jsx`) :**
- State `sales` + `expenses` chargés depuis localStorage au login, clés `arvest_sales_<email>` et `arvest_expenses_<email>`
- Nouveau user = tableaux vides (données à 0)
- `useMemo` pour `kpis`, `treasury`, `MONTHLY_DATA`, `CASH_EVOLUTION`, `CATEGORY_DATA`, `TOP_CLIENTS` — tous recalculés en temps réel
- Expose `importSales`, `importExpenses`, `importAll` pour les imports fichiers

**Import fichiers (`src/utils/importParser.js` + `src/components/ImportModal.jsx`) :**
- Formats : `.xlsx`, `.xls`, `.csv` (export banque ou comptable)
- Détection automatique des colonnes (date, client, fournisseur, montant HT/TVA/TTC, catégorie, statut)
- Mode `bank` : crédits → ventes, débits → charges
- Bouton Importer dans Sales.jsx, Expenses.jsx, Settings.jsx (onglet Imports)

**Données calculées dynamiquement :**
- Graphique CA/Charges : 7 derniers mois depuis les vraies données
- Graphique trésorerie : solde courant des 30 derniers jours
- Top clients par TTC agrégé
- Répartition charges par catégorie

**Why :** L'utilisateur avait des KPIs hardcodés à 0 et des états locaux non partagés entre pages.
**How to apply :** Toujours passer par `useData()` pour lire ou écrire les ventes/charges. Ne jamais déclarer un useState local pour ces données.
