import { useState } from 'react';
import { FileSpreadsheet, FileText, Upload, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useCompany, EMPTY_COMPANY } from '../context/CompanyContext';
import ImportModal from '../components/ImportModal';

const TABS = [
  { id: 'profile',  label: 'Profil' },
  { id: 'company',  label: 'Entreprise' },
  { id: 'imports',  label: 'Imports / Exports' },
  { id: 'security', label: 'Sécurité' },
];

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { importAll } = useData();
  const { company, saveCompany, LEGAL_FORMS } = useCompany();

  const [tab, setTab] = useState('profile');
  const [importModal, setImportModal] = useState(null);

  // ── Profile form state ──────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    fonction: user?.fonction || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileSave = () => {
    updateProfile(profileForm);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  // ── Company form state ──────────────────────────────────────────────────
  const [companyForm, setCompanyForm] = useState({ ...EMPTY_COMPANY, ...company });
  const [companySaved, setCompanySaved] = useState(false);

  // Sync when company loads (first render might be empty)
  const setCompanyField = (k, v) => setCompanyForm((f) => ({ ...f, [k]: v }));

  const handleCompanySave = () => {
    saveCompany(companyForm);
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2000);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
    : 'U';

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5', overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '14px 20px',
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              color: tab === t.id ? '#171717' : '#737373',
              position: 'relative',
              transition: 'color 0.2s ease',
            }}
          >
            {t.label}
            {tab === t.id && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#C6A75E' }} />
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>

        {/* ── Profil ── */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>
              Informations personnelles
            </h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Mettez à jour vos coordonnées.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #C6A75E 0%, #B8963F 100%)',
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 20, fontWeight: 600,
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#737373', marginTop: 4 }}>
                  {user?.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label className="label">Nom complet</label>
                <input
                  className="input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={user?.email || ''} readOnly style={{ background: '#fafafa', color: '#737373' }} />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input
                  className="input"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
              <div>
                <label className="label">Fonction</label>
                <input
                  className="input"
                  value={profileForm.fonction}
                  onChange={(e) => setProfileForm((f) => ({ ...f, fonction: e.target.value }))}
                  placeholder="Dirigeant"
                />
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
              {profileSaved && <span style={{ fontSize: 13, color: '#059669' }}>Enregistré ✓</span>}
              <button className="btn btn-primary" onClick={handleProfileSave}>Enregistrer</button>
            </div>
          </div>
        )}

        {/* ── Entreprise ── */}
        {tab === 'company' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>
              Informations de l&apos;entreprise
            </h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Ces informations apparaîtront sur vos documents.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Raison sociale</label>
                <input
                  className="input"
                  value={companyForm.legalName}
                  onChange={(e) => setCompanyField('legalName', e.target.value)}
                  placeholder="Ma Société SAS"
                />
              </div>
              <div>
                <label className="label">SIRET</label>
                <input
                  className="input"
                  value={companyForm.siret}
                  onChange={(e) => setCompanyField('siret', e.target.value)}
                  placeholder="123 456 789 00012"
                />
              </div>
              <div>
                <label className="label">TVA Intracom</label>
                <input
                  className="input"
                  value={companyForm.tvaIntracom}
                  onChange={(e) => setCompanyField('tvaIntracom', e.target.value)}
                  placeholder="FR12345678901"
                />
              </div>
              <div>
                <label className="label">Forme juridique</label>
                <select
                  className="select"
                  value={companyForm.legalForm}
                  onChange={(e) => setCompanyField('legalForm', e.target.value)}
                >
                  {LEGAL_FORMS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Email facturation</label>
                <input
                  className="input"
                  value={companyForm.email}
                  onChange={(e) => setCompanyField('email', e.target.value)}
                  placeholder="contact@masociete.fr"
                />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input
                  className="input"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyField('phone', e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Adresse</label>
                <input
                  className="input"
                  value={companyForm.address}
                  onChange={(e) => setCompanyField('address', e.target.value)}
                  placeholder="12 rue de la Paix"
                />
              </div>
              <div>
                <label className="label">Ville</label>
                <input
                  className="input"
                  value={companyForm.city}
                  onChange={(e) => setCompanyField('city', e.target.value)}
                  placeholder="Paris"
                />
              </div>
              <div>
                <label className="label">Code postal</label>
                <input
                  className="input"
                  value={companyForm.postalCode}
                  onChange={(e) => setCompanyField('postalCode', e.target.value)}
                  placeholder="75002"
                />
              </div>
              <div>
                <label className="label">Pays</label>
                <input
                  className="input"
                  value={companyForm.country}
                  onChange={(e) => setCompanyField('country', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
              {companySaved && <span style={{ fontSize: 13, color: '#059669' }}>Enregistré ✓</span>}
              <button className="btn btn-primary" onClick={handleCompanySave}>Enregistrer</button>
            </div>
          </div>
        )}

        {/* ── Imports ── */}
        {tab === 'imports' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Imports et exports</h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Importez vos données depuis Excel, CSV ou export bancaire. Les KPI se recalculent immédiatement.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  icon: FileSpreadsheet, gold: true,
                  title: 'Importer des ventes',
                  desc: 'Excel (.xlsx), CSV · colonnes date, client, montant, échéance détectées automatiquement',
                  action: 'Importer', act: Upload, onClick: () => setImportModal('sales'),
                },
                {
                  icon: FileSpreadsheet, gold: true,
                  title: 'Importer des charges',
                  desc: 'Excel (.xlsx), CSV · colonnes date, fournisseur, montant, échéance détectées automatiquement',
                  action: 'Importer', act: Upload, onClick: () => setImportModal('expenses'),
                },
                {
                  icon: FileSpreadsheet, gold: true,
                  title: 'Import relevé bancaire',
                  desc: 'CSV export banque · crédits → ventes, débits → charges',
                  action: 'Importer', act: Upload, onClick: () => setImportModal('bank'),
                },
                {
                  icon: FileText, gold: false,
                  title: 'Exporter le dashboard en PDF',
                  desc: 'Rapport mensuel complet · Prêt à partager',
                  action: 'Exporter', act: Download, onClick: () => window.print(),
                },
              ].map((it, i) => (
                <div key={i} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: it.gold ? 'rgba(198,167,94,0.1)' : '#f5f5f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <it.icon size={18} color={it.gold ? '#C6A75E' : '#525252'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#171717' }}>{it.title}</div>
                      <div style={{ fontSize: 12, color: '#737373' }}>{it.desc}</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={it.onClick}>
                    <it.act size={14} /> {it.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {importModal && (
          <ImportModal
            defaultType={importModal}
            onClose={() => setImportModal(null)}
            onImport={(parsed) => { importAll(parsed); setImportModal(null); }}
          />
        )}

        {/* ── Sécurité ── */}
        {tab === 'security' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Sécurité du compte</h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Protégez l&apos;accès à vos données financières.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'Mot de passe', desc: 'Dernière modification il y a 3 mois', action: 'Modifier', variant: 'secondary' },
                { title: 'Authentification à deux facteurs', desc: 'Ajoutez une couche de sécurité supplémentaire', action: 'Activer', variant: 'primary' },
                { title: 'Sessions actives', desc: '2 appareils connectés', action: 'Gérer', variant: 'secondary' },
              ].map((it, i) => (
                <div key={i} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#171717' }}>{it.title}</div>
                    <div style={{ fontSize: 12, color: '#737373' }}>{it.desc}</div>
                  </div>
                  <button className={`btn btn-${it.variant} btn-sm`}>{it.action}</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
