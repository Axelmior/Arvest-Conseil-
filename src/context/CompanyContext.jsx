import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CompanyContext = createContext(null);

export const EMPTY_COMPANY = {
  legalName:   '',
  address:     '',
  city:        '',
  postalCode:  '',
  country:     'France',
  siret:       '',
  tvaIntracom: '',
  legalForm:   'SARL',
  email:       '',
  phone:       '',
};

const LEGAL_FORMS = ['SARL', 'SAS', 'SASU', 'EURL', 'SA', 'SNC', 'Auto-entrepreneur', 'EI', 'Autre'];

function key(email) {
  return `arvest_company_${email}`;
}

function load(email) {
  if (!email) return { ...EMPTY_COMPANY };
  try {
    const raw = localStorage.getItem(key(email));
    return raw ? { ...EMPTY_COMPANY, ...JSON.parse(raw) } : { ...EMPTY_COMPANY };
  } catch {
    return { ...EMPTY_COMPANY };
  }
}

function persist(email, data) {
  if (!email) return;
  try {
    localStorage.setItem(key(email), JSON.stringify(data));
  } catch (e) {
    console.warn('CompanyContext: localStorage unavailable', e);
  }
}

export function CompanyProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email ?? null;

  const [company, setCompanyRaw] = useState(EMPTY_COMPANY);

  // Reload company data when user changes
  useEffect(() => {
    const data = load(email);
    // Pre-populate legalName from signup company name if still empty
    if (!data.legalName && user?.company) {
      data.legalName = user.company;
    }
    if (!data.email && user?.email) {
      data.email = user.email;
    }
    setCompanyRaw(data);
  }, [email, user?.company, user?.email]);

  const saveCompany = useCallback((patch) => {
    setCompanyRaw((prev) => {
      const next = { ...prev, ...patch };
      persist(email, next);
      return next;
    });
  }, [email]);

  const isComplete = Boolean(
    company.legalName && company.siret && company.address
  );

  return (
    <CompanyContext.Provider value={{ company, saveCompany, isComplete, LEGAL_FORMS }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be inside CompanyProvider');
  return ctx;
}
