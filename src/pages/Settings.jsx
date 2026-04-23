import { useState } from 'react';
import { FileSpreadsheet, FileText, Upload, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ImportModal from '../components/ImportModal';

const TABS = [
  { id: 'profile', label: 'Profil' },
  { id: 'company', label: 'Entreprise' },
  { id: 'billing', label: 'Facturation' },
  { id: 'imports', label: 'Imports / Exports' },
  { id: 'security', label: 'Sécurité' }
];

export default function Settings() {
  const { user } = useAuth();
  const { importAll } = useData();
  const [tab, setTab] = useState('profile');
  const [importModal, setImportModal] = useState(null); // 'sales' | 'expenses' | 'bank' | null

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
              transition: 'color 0.2s ease'
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
        {tab === 'profile' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>
              Informations personnelles
            </h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Mettez à jour vos coordonnées.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C6A75E 0%, #B8963F 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 600
                }}
              >
                {initials}
              </div>
              <div>
                <button className="btn btn-secondary btn-sm">Changer l'avatar</button>
                <div style={{ fontSize: 12, color: '#737373', marginTop: 4 }}>JPG, PNG. 2 Mo max.</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label className="label">Nom complet</label>
                <input className="input" defaultValue={user?.name} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" defaultValue={user?.email} />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" defaultValue="+33 6 12 34 56 78" />
              </div>
              <div>
                <label className="label">Fonction</label>
                <input className="input" defaultValue="Dirigeant" />
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-secondary">Annuler</button>
              <button className="btn btn-primary">Enregistrer</button>
            </div>
          </div>
        )}

        {tab === 'company' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>
              Informations de l'entreprise
            </h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Ces informations apparaîtront sur vos documents.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label className="label">Raison sociale</label>
                <input className="input" defaultValue={user?.company} />
              </div>
              <div>
                <label className="label">SIRET</label>
                <input className="input" defaultValue="123 456 789 00012" />
              </div>
              <div>
                <label className="label">TVA Intracom</label>
                <input className="input" defaultValue="FR12345678901" />
              </div>
              <div>
                <label className="label">Forme juridique</label>
                <select className="select">
                  <option>SARL</option>
                  <option>SAS</option>
                  <option>EURL</option>
                  <option>Auto-entrepreneur</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Adresse</label>
                <input className="input" defaultValue="12 rue de la Paix, 75002 Paris" />
              </div>
            </div>
          </div>
        )}

        {tab === 'imports' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Imports et exports</h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Importez vos données depuis Excel, CSV ou export bancaire. Les KPI se recalculent immédiatement.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  icon: FileSpreadsheet,
                  title: 'Importer des ventes',
                  desc: 'Excel (.xlsx), CSV · colonnes date, client, montant détectées automatiquement',
                  action: 'Importer', variant: 'secondary', act: Upload, gold: true,
                  onClick: () => setImportModal('sales'),
                },
                {
                  icon: FileSpreadsheet,
                  title: 'Importer des charges',
                  desc: 'Excel (.xlsx), CSV · colonnes date, fournisseur, montant détectées automatiquement',
                  action: 'Importer', variant: 'secondary', act: Upload, gold: true,
                  onClick: () => setImportModal('expenses'),
                },
                {
                  icon: FileSpreadsheet,
                  title: 'Import relevé bancaire',
                  desc: 'CSV export banque · crédits → ventes, débits → charges',
                  action: 'Importer', variant: 'secondary', act: Upload, gold: true,
                  onClick: () => setImportModal('bank'),
                },
                {
                  icon: FileText,
                  title: 'Exporter le dashboard en PDF',
                  desc: 'Rapport mensuel complet · Prêt à partager',
                  action: 'Exporter', variant: 'primary', act: Download, gold: false,
                  onClick: () => window.print(),
                },
              ].map((it, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: it.gold ? 'rgba(198, 167, 94, 0.1)' : '#f5f5f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <it.icon size={18} color={it.gold ? '#C6A75E' : '#525252'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#171717' }}>{it.title}</div>
                      <div style={{ fontSize: 12, color: '#737373' }}>{it.desc}</div>
                    </div>
                  </div>
                  <button className={`btn btn-${it.variant} btn-sm`} onClick={it.onClick}>
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

        {tab === 'billing' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Abonnement</h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Gérez votre formule et votre moyen de paiement.
            </p>
            <div
              className="card"
              style={{
                padding: 24,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                color: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
                    Plan actuel
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: 'white' }}>Arvest Pilot Business</div>
                </div>
                <span className="badge badge-gold">Actif</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 4 }}>
                49 € <span style={{ fontSize: 14, color: '#a3a3a3' }}>/ mois HT</span>
              </div>
              <div style={{ fontSize: 12, color: '#a3a3a3', marginBottom: 16 }}>
                Prochaine facturation le 15 mai 2026
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-gold btn-sm">Mettre à niveau</button>
                <button style={{ padding: '6px 12px', fontSize: 12, color: '#d4d4d4' }}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Sécurité du compte</h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>
              Protégez l'accès à vos données financières.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'Mot de passe', desc: 'Dernière modification il y a 3 mois', action: 'Modifier', variant: 'secondary' },
                { title: 'Authentification à deux facteurs', desc: 'Ajoutez une couche de sécurité supplémentaire', action: 'Activer', variant: 'primary' },
                { title: 'Sessions actives', desc: '2 appareils connectés', action: 'Gérer', variant: 'secondary' }
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
