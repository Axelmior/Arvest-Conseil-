import { createContext, useContext, useState, useMemo } from 'react';
import {
  MOCK_SALES,
  MOCK_EXPENSES,
  MONTHLY_DATA,
  CASH_EVOLUTION,
  CATEGORY_DATA,
  TOP_CLIENTS
} from '../data/mockData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [sales, setSales] = useState(MOCK_SALES);
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);

  const kpis = useMemo(() => {
    const ca = sales.reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0);
    const charges = expenses.reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0);
    const net = ca - charges;
    const margin = ca > 0 ? Math.round((net / ca) * 100) : 0;
    return { ca, charges, net, margin };
  }, [sales, expenses]);

  const treasury = useMemo(() => {
    const encaissements = sales
      .filter((x) => x.status === 'paid')
      .reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0);
    const decaissements = expenses.reduce((s, x) => s + (parseFloat(x.ttc) || 0), 0);
    const solde = encaissements - decaissements;
    const previsionJ30 = Math.round(solde * 1.1);
    return { solde, encaissements, decaissements, previsionJ30 };
  }, [sales, expenses]);

  return (
    <DataContext.Provider
      value={{
        sales,
        setSales,
        expenses,
        setExpenses,
        kpis,
        treasury,
        MONTHLY_DATA,
        CASH_EVOLUTION,
        CATEGORY_DATA,
        TOP_CLIENTS
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
