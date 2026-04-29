import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

// ─── localStorage helpers ─────────────────────────────────────────────────────
function storageKey(email, kind) {
  return `arvest_${kind}_${email}`;
}

function loadData(email, kind) {
  if (!email) return [];
  try {
    const raw = localStorage.getItem(storageKey(email, kind));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveData(email, kind, data) {
  if (!email) return;
  try {
    localStorage.setItem(storageKey(email, kind), JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage indisponible', e);
  }
}

// ─── Chart helpers ────────────────────────────────────────────────────────────
function buildMonthlyData(sales, expenses) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('fr-FR', { month: 'short' });
    const ca = sales
      .filter((s) => s.date?.startsWith(prefix))
      .reduce((sum, s) => sum + (parseFloat(s.ttc) || 0), 0);
    const charges = expenses
      .filter((e) => e.date?.startsWith(prefix))
      .reduce((sum, e) => sum + (parseFloat(e.ttc) || 0), 0);
    return { month: label.charAt(0).toUpperCase() + label.slice(1), ca, charges };
  });
}

function buildCashEvolution(sales, expenses) {
  const now = new Date();
  const days = [1, 5, 10, 15, 20, 25, 30];
  let running = 0;

  return days.map((day) => {
    const cutoff = new Date(now.getFullYear(), now.getMonth(), day).toISOString().slice(0, 10);
    const encaissé = sales
      .filter((s) => s.status === 'paid' && s.date <= cutoff)
      .reduce((sum, s) => sum + (parseFloat(s.ttc) || 0), 0);
    const décaissé = expenses
      .filter((e) => e.date <= cutoff)
      .reduce((sum, e) => sum + (parseFloat(e.ttc) || 0), 0);
    running = encaissé - décaissé;
    return { day: String(day), solde: Math.round(running) };
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email ?? null;

  const [salesRaw,       setSalesRaw]       = useState([]);
  const [expensesRaw,    setExpensesRaw]    = useState([]);
  const [importHistRaw,  setImportHistRaw]  = useState([]);

  // Chargement des données utilisateur à chaque changement de session
  useEffect(() => {
    setSalesRaw(loadData(email, 'sales'));
    setExpensesRaw(loadData(email, 'expenses'));
    setImportHistRaw(loadData(email, 'imports'));
  }, [email]);

  // Wrapped setters that auto-persist
  const setSales = useCallback((updater) => {
    setSalesRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveData(email, 'sales', next);
      return next;
    });
  }, [email]);

  const setExpenses = useCallback((updater) => {
    setExpensesRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveData(email, 'expenses', next);
      return next;
    });
  }, [email]);

  // Ajout d'une entrée dans l'historique d'imports
  const addImportRecord = useCallback((entry) => {
    setImportHistRaw((prev) => {
      const next = [{ ...entry, id: Date.now() }, ...prev].slice(0, 50);
      saveData(email, 'imports', next);
      return next;
    });
  }, [email]);

  // Bulk import helpers
  const importSales = useCallback((rows) => {
    setSales((prev) => [
      ...rows.map((r, i) => ({ ...r, id: Date.now() + i })),
      ...prev,
    ]);
  }, [setSales]);

  const importExpenses = useCallback((rows) => {
    setExpenses((prev) => [
      ...rows.map((r, i) => ({ ...r, id: Date.now() + i })),
      ...prev,
    ]);
  }, [setExpenses]);

  // Called by ImportModal — routes sales + expenses in a single call
  const importAll = useCallback((parsed) => {
    if (parsed.sales?.length)    importSales(parsed.sales);
    if (parsed.expenses?.length) importExpenses(parsed.expenses);
  }, [importSales, importExpenses]);

  // ── Derived KPIs ─────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const ca      = salesRaw.reduce((s, x) => s + (parseFloat(x.ttc)  || 0), 0);
    const charges = expensesRaw.reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0);
    const tva     = salesRaw.reduce((s, x) => s + (parseFloat(x.tva)  || 0), 0);
    const net     = ca - charges;
    const margin  = ca > 0 ? Math.round((net / ca) * 1000) / 10 : 0; // one decimal
    const clients = new Set(salesRaw.map((s) => s.client).filter(Boolean)).size;
    const invoices = salesRaw.length;
    return { ca, charges, tva, net, margin, clients, invoices };
  }, [salesRaw, expensesRaw]);

  const treasury = useMemo(() => {
    const encaissements = salesRaw
      .filter((x) => x.status === 'paid')
      .reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0);
    const decaissements = expensesRaw.reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0);
    const solde         = encaissements - decaissements;
    const previsionJ30  = Math.round(solde * 1.1);
    return { solde, encaissements, decaissements, previsionJ30 };
  }, [salesRaw, expensesRaw]);

  // ── Charts ────────────────────────────────────────────────────────────────
  const MONTHLY_DATA   = useMemo(() => buildMonthlyData(salesRaw, expensesRaw),   [salesRaw, expensesRaw]);
  const CASH_EVOLUTION = useMemo(() => buildCashEvolution(salesRaw, expensesRaw), [salesRaw, expensesRaw]);

  // Category breakdown from expenses
  const CATEGORY_DATA = useMemo(() => {
    const grouped = {};
    expensesRaw.forEach((e) => {
      const cat = e.category || 'Autre';
      grouped[cat] = (grouped[cat] || 0) + (parseFloat(e.ttc) || 0);
    });
    const palette = ['#1a1a1a', '#525252', '#C6A75E', '#a8a8a8', '#737373', '#d4d4d4'];
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value: Math.round(value), color: palette[i] }));
  }, [expensesRaw]);

  // Future cash flows for the next 60 days (used by Treasury forecast)
  const futureFlows = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 60);
    const maxDate = horizon.toISOString().slice(0, 10);

    const inc = salesRaw
      .filter((s) => s.status === 'pending')
      .map((s) => ({ ...s, effectiveDate: s.dueDate || s.date, kind: 'sale' }))
      .filter((s) => s.effectiveDate >= today && s.effectiveDate <= maxDate);

    const out = expensesRaw
      .map((e) => ({ ...e, effectiveDate: e.dueDate || e.date, kind: 'expense' }))
      .filter((e) => e.effectiveDate >= today && e.effectiveDate <= maxDate);

    return [...inc, ...out].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  }, [salesRaw, expensesRaw]);

  // Top 5 clients by sales TTC
  const TOP_CLIENTS = useMemo(() => {
    const grouped = {};
    salesRaw.forEach((s) => {
      const c = s.client || 'Inconnu';
      grouped[c] = (grouped[c] || 0) + (parseFloat(s.ttc) || 0);
    });
    const sorted = Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([name, value]) => ({
      name,
      value: Math.round(value),
      percentage: Math.round((value / max) * 100),
    }));
  }, [salesRaw]);

  return (
    <DataContext.Provider value={{
      sales:    salesRaw,
      setSales,
      expenses: expensesRaw,
      setExpenses,
      importSales,
      importExpenses,
      importAll,
      importHistory: importHistRaw,
      addImportRecord,
      kpis,
      treasury,
      MONTHLY_DATA,
      CASH_EVOLUTION,
      CATEGORY_DATA,
      TOP_CLIENTS,
      futureFlows,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
};
