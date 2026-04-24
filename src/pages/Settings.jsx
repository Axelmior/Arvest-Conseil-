import { useState, useCallback } from 'react';
import {
  FileSpreadsheet, FileText, Upload, Download,
  Eye, EyeOff, Monitor, Smartphone, Laptop, Trash2, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useCompany, EMPTY_COMPANY } from '../context/CompanyContext';
import ImportModal from '../components/ImportModal';
import { formatDate } from '../utils/format';

const TABS = [
  { id: 'profile',  label: 'Profil' },
  { id: 'company',  label: 'Entreprise' },
  { id: 'imports',  label: 'Imports / Exports' },
  { id: 'security', label: 'Sécurité' },
];

// ─── Password strength ────────────────────────────────────────────────────────
function passwordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (pw.length >= 12)         score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Faible', color: '#ef4444' };
  if (score <= 3) return { score, label: 'Moyen',  color: '#f59e0b' };
  return                { score, label: 'Fort',   color: '#10b981' };
}

function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-icon-wrapper">
      <input
        type={show ? 'text' : 'password'}
        className="input"
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••'}
        autoComplete={autoComplete}
        style={{ paddingRight: 40 }}
      />
      <button
        type="button"
        className="auth-eye"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Masquer' : 'Afficher'}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function DeviceIcon({ device }) {
  if (/iOS|Android/.test(device)) return <Smartphone size={16} color="#737373" />;
  if (/Windows|macOS|Linux/.test(device)) return <Laptop size={16} color="#737373" />;
  return <Monitor size={16} color="#737373" />;
}

// ─── Security tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const { user, changePassword, getDevices, revokeDevice, revokeAllDevices } = useAuth();

  // ── Password ──────────────────────────────────────────────────────────────
  const [pwOld,   setPwOld]   = useState('');
  const [pwNew,   setPwNew]   = useState('');
  const [pwConf,  setPwConf]  = useState('');
  const [pwError, setPwError] = useState('');
  const [pwOk,    setPwOk]    = useState(false);

  const strength = passwordStrength(pwNew);

  const handlePwSubmit = (e) => {
    e.preventDefault();
    setPwError('');
    if (pwNew !== pwConf) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    try {
      changePassword(pwOld, pwNew);
      setPwOld(''); setPwNew(''); setPwConf('');
      setPwOk(true);
      setTimeout(() => setPwOk(false), 3000);
    } catch (err) {
      setPwError(err.message);
    }
  };

  // ── Devices ───────────────────────────────────────────────────────────────
  const [devices, setDevices] = useState(() => getDevices());
  const refreshDevices = useCallback(() => setDevices(getDevices()), [getDevices]);

  const handleRevoke = (id) => { revokeDevice(id); refreshDevices(); };
  const handleRevokeAll = () => { revokeAllDevices(); refreshDevices(); };

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Mot de passe ── */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Mot de passe</h3>
        <p style={{ fontSize: 13, color: '#737373', marginBottom: 20 }}>
          Choisissez un mot de passe fort d&apos;au moins 8 caractères.
        </p>
        <form onSubmit={handlePwSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Mot de passe actuel</label>
            <PasswordInput
              value={pwOld}
              onChange={(e) => setPwOld(e.target.value)}
              placeholder="Mot de passe actuel"
              autoComplete="current-password"
            />
            {!user?.passwordHash && (
              <p style={{ fontSize: 12, color: '#a3a3a3', marginTop: 4 }}>
                Aucun mot de passe défini — laissez ce champ vide pour en créer un nouveau.
              </p>
            )}
          </div>
          <div>
            <label className="label">Nouveau mot de passe</label>
            <PasswordInput
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
              placeholder="Minimum 8 caractères"
              autoComplete="new-password"
            />
            {pwNew && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : '#e5e5e5', transition: 'background 0.2s' }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: strength.color, fontWeight: 500 }}>{strength.label}</span>
              </div>
            )}
          </div>
          <div>
            <label className="label">Confirmer le nouveau mot de passe</label>
            <PasswordInput
              value={pwConf}
              onChange={(e) => setPwConf(e.target.value)}
              placeholder="Répéter le mot de passe"
              autoComplete="new-password"
            />
            {pwConf && pwNew && pwConf !== pwNew && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          {pwError && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2', borderRadius: 8, fontSize: 13 }}>
              {pwError}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {pwOk && <span style={{ fontSize: 13, color: '#059669' }}>Mot de passe modifié ✓</span>}
            <button type="submit" className="btn btn-primary" disabled={!pwNew || !pwConf || pwNew !== pwConf}>
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      <div style={{ borderTop: '1px solid #e5e5e5' }} />

      {/* ── Appareils connectés ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Appareils connectés</h3>
            <p style={{ fontSize: 13, color: '#737373' }}>
              {devices.length} appareil{devices.length > 1 ? 's' : ''} enregistré{devices.length > 1 ? 's' : ''} sur ce compte.
            </p>
          </div>
          {devices.length > 1 && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: '#ef4444', borderColor: '#fca5a5' }}
              onClick={handleRevokeAll}
            >
              <LogOut size={13} /> Déconnecter tout
            </button>
          )}
        </div>

        {devices.length === 0 ? (
          <p style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', padding: '24px 0' }}>
            Aucun appareil enregistré.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {devices.map((d) => (
              <div
                key={d.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  background: d.current ? 'rgba(198,167,94,0.06)' : '#fafafa',
                  border: `1px solid ${d.current ? 'rgba(198,167,94,0.2)' : '#e5e5e5'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <DeviceIcon device={d.device} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#171717', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {d.device}
                      {d.current && (
                        <span style={{ fontSize: 11, background: 'rgba(198,167,94,0.15)', color: '#8B7235', padding: '1px 7px', borderRadius: 9999, fontWeight: 600 }}>
                          Session actuelle
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#a3a3a3', marginTop: 2 }}>
                      {d.location} · Dernière activité : {formatDate(d.lastSeen.slice(0, 10))}
                    </div>
                  </div>
                </div>
                {!d.current && (
                  <button
                    className="row-action row-action-danger"
                    onClick={() => handleRevoke(d.id)}
                    aria-label="Déconnecter cet appareil"
                    title="Déconnecter"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Settings page ───────────────────────────────────────────────────────
export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { importAll } = useData();
  const { company, saveCompany, LEGAL_FORMS } = useCompany();

  const [tab, setTab] = useState('profile');
  const [importModal, setImportModal] = useState(null);

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

  const [companyForm, setCompanyForm] = useState({ ...EMPTY_COMPANY, ...company });
  const [companySaved, setCompanySaved] = useState(false);
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
              padding: '14px 20px', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap',
              color: tab === t.id ? '#171717' : '#737373', position: 'relative', transition: 'color 0.2s ease',
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
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Informations personnelles</h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>Mettez à jour vos coordonnées.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #C6A75E 0%, #B8963F 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600 }}>
                {initials}
              </div>
              <div style={{ fontSize: 12, color: '#737373' }}>{user?.email}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>
                <label className="label">Nom complet</label>
                <input className="input" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" value={user?.email || ''} readOnly style={{ background: '#fafafa', color: '#737373' }} />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input className="input" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+33 6 00 00 00 00" />
              </div>
              <div>
                <label className="label">Fonction</label>
                <input className="input" value={profileForm.fonction} onChange={(e) => setProfileForm((f) => ({ ...f, fonction: e.target.value }))} placeholder="Dirigeant" />
              </div>
            </div>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
              {profileSaved && <span style={{ fontSize: 13, color: '#059669' }}>Enregistré ✓</span>}
              <button className="btn btn-primary" onClick={handleProfileSave}>Enregistrer</button>
            </div>
          </div>
        )}

        {tab === 'company' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Informations de l&apos;entreprise</h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>Ces informations apparaîtront sur vos documents.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Raison sociale</label>
                <input className="input" value={companyForm.legalName} onChange={(e) => setCompanyField('legalName', e.target.value)} placeholder="Ma Société SAS" />
              </div>
              <div><label className="label">SIRET</label><input className="input" value={companyForm.siret} onChange={(e) => setCompanyField('siret', e.target.value)} placeholder="123 456 789 00012" /></div>
              <div><label className="label">TVA Intracom</label><input className="input" value={companyForm.tvaIntracom} onChange={(e) => setCompanyField('tvaIntracom', e.target.value)} placeholder="FR12345678901" /></div>
              <div>
                <label className="label">Forme juridique</label>
                <select className="select" value={companyForm.legalForm} onChange={(e) => setCompanyField('legalForm', e.target.value)}>
                  {LEGAL_FORMS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div><label className="label">Email facturation</label><input className="input" value={companyForm.email} onChange={(e) => setCompanyField('email', e.target.value)} placeholder="contact@masociete.fr" /></div>
              <div><label className="label">Téléphone</label><input className="input" value={companyForm.phone} onChange={(e) => setCompanyField('phone', e.target.value)} placeholder="+33 1 23 45 67 89" /></div>
              <div style={{ gridColumn: '1 / -1' }}><label className="label">Adresse</label><input className="input" value={companyForm.address} onChange={(e) => setCompanyField('address', e.target.value)} placeholder="12 rue de la Paix" /></div>
              <div><label className="label">Ville</label><input className="input" value={companyForm.city} onChange={(e) => setCompanyField('city', e.target.value)} placeholder="Paris" /></div>
              <div><label className="label">Code postal</label><input className="input" value={companyForm.postalCode} onChange={(e) => setCompanyField('postalCode', e.target.value)} placeholder="75002" /></div>
              <div><label className="label">Pays</label><input className="input" value={companyForm.country} onChange={(e) => setCompanyField('country', e.target.value)} /></div>
            </div>
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
              {companySaved && <span style={{ fontSize: 13, color: '#059669' }}>Enregistré ✓</span>}
              <button className="btn btn-primary" onClick={handleCompanySave}>Enregistrer</button>
            </div>
          </div>
        )}

        {tab === 'imports' && (
          <div style={{ maxWidth: 640 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#171717', marginBottom: 4 }}>Imports et exports</h3>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>Importez vos données depuis Excel, CSV ou export bancaire.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: FileSpreadsheet, gold: true, title: 'Importer des ventes', desc: 'Excel (.xlsx), CSV · colonnes date, client, montant détectées automatiquement', action: 'Importer', act: Upload, onClick: () => setImportModal('sales') },
                { icon: FileSpreadsheet, gold: true, title: 'Importer des charges', desc: 'Excel (.xlsx), CSV · colonnes date, fournisseur, montant détectées automatiquement', action: 'Importer', act: Upload, onClick: () => setImportModal('expenses') },
                { icon: FileSpreadsheet, gold: true, title: 'Import relevé bancaire', desc: 'CSV export banque · crédits → ventes, débits → charges', action: 'Importer', act: Upload, onClick: () => setImportModal('bank') },
                { icon: FileText, gold: false, title: 'Exporter le dashboard en PDF', desc: 'Rapport mensuel complet · Prêt à partager', action: 'Exporter', act: Download, onClick: () => window.print() },
              ].map((it, i) => (
                <div key={i} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: it.gold ? 'rgba(198,167,94,0.1)' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <it.icon size={18} color={it.gold ? '#C6A75E' : '#525252'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#171717' }}>{it.title}</div>
                      <div style={{ fontSize: 12, color: '#737373' }}>{it.desc}</div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={it.onClick}><it.act size={14} /> {it.action}</button>
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

        {tab === 'security' && <SecurityTab />}

      </div>
    </div>
  );
}
