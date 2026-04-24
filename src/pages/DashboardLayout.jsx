import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { DataProvider } from '../context/DataContext';
import { CompanyProvider } from '../context/CompanyContext';
import './DashboardLayout.css';

const PAGE_META = {
  '/dashboard': { title: 'Tableau de bord', subtitle: "Vue d'ensemble de votre activité" },
  '/dashboard/sales': { title: 'Ventes', subtitle: "Suivez votre chiffre d'affaires" },
  '/dashboard/expenses': { title: 'Charges', subtitle: 'Gérez vos dépenses professionnelles' },
  '/dashboard/treasury': { title: 'Trésorerie', subtitle: 'Pilotez votre flux de trésorerie' },
  '/dashboard/analytics': { title: 'Analyses', subtitle: 'Indicateurs intelligents et recommandations' },
  '/dashboard/settings': { title: 'Paramètres', subtitle: 'Configurez votre compte et votre entreprise' }
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const meta = PAGE_META[location.pathname] || {
    title: 'Dashboard',
    subtitle: ''
  };

  return (
    <DataProvider>
      <CompanyProvider>
      <div className="dashboard-layout">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="dashboard-main">
          <div className="dashboard-content">
            <TopBar
              title={meta.title}
              subtitle={meta.subtitle}
              onMenuClick={() => setMobileOpen(true)}
            />
            <Outlet />
          </div>
        </main>
      </div>
      </CompanyProvider>
    </DataProvider>
  );
}
