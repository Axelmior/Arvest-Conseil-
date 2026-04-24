import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import './LegalPages.css';

function LegalLayout({ title, children }) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="legal-container legal-header-inner">
          <Logo />
          <Link to="/" className="legal-back">
            <ArrowLeft size={14} /> Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="legal-container legal-main">
        <h1 className="legal-title">{title}</h1>
        <div className="legal-content">{children}</div>
      </main>

      <footer className="legal-footer">
        <div className="legal-container legal-footer-inner">
          <Logo />
          <div className="legal-footer-links">
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/confidentialite">Confidentialité</Link>
            <Link to="/conditions">CGU</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <p className="legal-footer-copy">© 2026 Arvest Pilot</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Mentions légales ─────────────────────────────────────────────────────────
export function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales">
      <p className="legal-updated">Dernière mise à jour : 1er janvier 2026</p>

      <h2>Éditeur du site</h2>
      <p>
        Le site <strong>Arvest Pilot</strong> (accessible à l&apos;adresse <em>arvest-conseil.vercel.app</em>) est édité par :
      </p>
      <ul>
        <li><strong>Raison sociale :</strong> Arvest Conseil</li>
        <li><strong>Forme juridique :</strong> SAS</li>
        <li><strong>Siège social :</strong> France</li>
        <li><strong>Email :</strong> contact@arvest-pilot.com</li>
      </ul>

      <h2>Directeur de la publication</h2>
      <p>Le directeur de la publication est le représentant légal de la société Arvest Conseil.</p>

      <h2>Hébergement</h2>
      <p>
        Ce site est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
        Site web : <em>vercel.com</em>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu présent sur Arvest Pilot (textes, graphiques, logos, icônes, images, logiciels)
        est la propriété exclusive d&apos;Arvest Conseil ou de ses partenaires. Toute reproduction, distribution,
        modification ou utilisation à des fins commerciales sans autorisation préalable est strictement interdite.
      </p>

      <h2>Limitation de responsabilité</h2>
      <p>
        Les informations contenues sur ce site sont fournies à titre indicatif. Arvest Conseil ne peut être tenu
        responsable des erreurs ou omissions dans les informations fournies, ni des dommages pouvant résulter de
        l&apos;utilisation des données présentées.
      </p>

      <h2>Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français
        seront seuls compétents.
      </p>
    </LegalLayout>
  );
}

// ─── Politique de confidentialité ─────────────────────────────────────────────
export function Confidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p className="legal-updated">Dernière mise à jour : 1er janvier 2026</p>

      <p>
        Arvest Conseil s&apos;engage à protéger la vie privée de ses utilisateurs conformément au
        <strong> Règlement Général sur la Protection des Données (RGPD)</strong> et à la loi Informatique
        et Libertés.
      </p>

      <h2>Données collectées</h2>
      <p>Lors de votre utilisation d&apos;Arvest Pilot, nous pouvons collecter les données suivantes :</p>
      <ul>
        <li><strong>Données d&apos;identification :</strong> nom, prénom, adresse email professionnelle</li>
        <li><strong>Données de connexion :</strong> adresse IP (approximative), type de navigateur, horodatage des connexions</li>
        <li><strong>Données financières :</strong> ventes, charges, et autres informations saisies par l&apos;utilisateur dans l&apos;application (stockées localement sur votre appareil)</li>
      </ul>

      <h2>Stockage des données</h2>
      <p>
        Les données financières que vous saisissez dans Arvest Pilot sont stockées <strong>localement sur votre navigateur</strong> (localStorage). Elles ne sont pas transmises à nos serveurs. Vous en êtes le seul propriétaire et responsable.
      </p>

      <h2>Finalités du traitement</h2>
      <ul>
        <li>Gestion de votre compte et authentification</li>
        <li>Fourniture du service de pilotage financier</li>
        <li>Amélioration de nos services</li>
        <li>Communication relative à votre abonnement</li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Les données de compte sont conservées pendant la durée de votre abonnement, puis supprimées dans
        un délai de 30 jours suivant la résiliation, sauf obligation légale contraire.
      </p>

      <h2>Vos droits (RGPD)</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Droit d&apos;accès</strong> : consulter vos données personnelles</li>
        <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
        <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données</li>
        <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format lisible</li>
        <li><strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous à : <strong>contact@arvest-pilot.com</strong>
      </p>

      <h2>Cookies</h2>
      <p>
        Arvest Pilot utilise uniquement des cookies de session strictement nécessaires au fonctionnement
        de l&apos;application (authentification). Aucun cookie de tracking ou publicitaire n&apos;est utilisé.
      </p>

      <h2>Contact DPO</h2>
      <p>
        Pour toute question relative à la protection de vos données : <strong>contact@arvest-pilot.com</strong>
      </p>
    </LegalLayout>
  );
}

// ─── Conditions d'utilisation ─────────────────────────────────────────────────
export function Conditions() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation">
      <p className="legal-updated">Dernière mise à jour : 1er janvier 2026</p>

      <p>
        Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation
        de la plateforme Arvest Pilot, solution de pilotage financier pour dirigeants de TPE/PME.
      </p>

      <h2>1. Acceptation des conditions</h2>
      <p>
        En accédant à Arvest Pilot, vous acceptez sans réserve les présentes CGU. Si vous n&apos;acceptez pas
        ces conditions, veuillez ne pas utiliser le service.
      </p>

      <h2>2. Description du service</h2>
      <p>
        Arvest Pilot est une solution de pilotage financier permettant aux dirigeants de TPE/PME de centraliser
        et visualiser leurs données financières : chiffre d&apos;affaires, charges, trésorerie et rentabilité.
      </p>

      <h2>3. Accès au service</h2>
      <p>
        L&apos;accès est réservé aux professionnels disposant d&apos;une invitation valide. Toute tentative
        d&apos;accès non autorisé est strictement interdite. Arvest Conseil se réserve le droit de refuser
        ou révoquer tout accès sans justification préalable.
      </p>

      <h2>4. Tarification</h2>
      <p>
        Le service est proposé au tarif de <strong>49 € HT / mois</strong>, sans engagement. La facturation
        est gérée manuellement après activation de l&apos;accès. Arvest Conseil se réserve le droit de
        modifier les tarifs avec un préavis de 30 jours.
      </p>

      <h2>5. Obligations de l'utilisateur</h2>
      <ul>
        <li>Fournir des informations exactes lors de l&apos;inscription</li>
        <li>Ne pas partager ses identifiants de connexion</li>
        <li>Ne pas utiliser le service à des fins illicites</li>
        <li>Ne pas tenter de compromettre la sécurité de la plateforme</li>
      </ul>

      <h2>6. Responsabilité</h2>
      <p>
        Arvest Pilot est un outil d&apos;aide à la décision. Les données et analyses présentées sont fournies
        à titre indicatif. Arvest Conseil ne peut être tenu responsable des décisions prises sur la base des
        informations affichées.
      </p>

      <h2>7. Résiliation</h2>
      <p>
        L&apos;utilisateur peut résilier son abonnement à tout moment en contactant le support. Arvest Conseil
        peut résilier l&apos;accès en cas de violation des présentes CGU.
      </p>

      <h2>8. Droit applicable</h2>
      <p>
        Les présentes CGU sont régies par le droit français. Tout litige sera soumis à la compétence exclusive
        des tribunaux de Paris.
      </p>
    </LegalLayout>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
export function Contact() {
  const [form, setForm]   = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.message) {
      setError('Merci de remplir tous les champs obligatoires.');
      return;
    }
    // Simulated send
    setSent(true);
  };

  return (
    <LegalLayout title="Nous contacter">
      <div className="contact-layout">
        {/* Info column */}
        <div className="contact-info">
          <p style={{ fontSize: 16, color: '#525252', lineHeight: 1.7, marginBottom: 32 }}>
            Une question, un problème technique ou une demande d&apos;accès ?
            Notre équipe vous répond sous <strong>24 heures ouvrées</strong>.
          </p>

          <div className="contact-info-items">
            <div className="contact-info-item">
              <div className="contact-info-icon"><Mail size={18} color="#C6A75E" /></div>
              <div>
                <div className="contact-info-label">Email</div>
                <a href="mailto:contact@arvest-pilot.com" className="contact-info-value">contact@arvest-pilot.com</a>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon"><MapPin size={18} color="#C6A75E" /></div>
              <div>
                <div className="contact-info-label">Siège social</div>
                <div className="contact-info-value">France</div>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon"><Phone size={18} color="#C6A75E" /></div>
              <div>
                <div className="contact-info-label">Disponibilité</div>
                <div className="contact-info-value">Lun – Ven, 9h – 18h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form column */}
        <div className="contact-form-wrap">
          {sent ? (
            <div className="contact-sent">
              <CheckCircle2 size={36} color="#C6A75E" />
              <h3>Message envoyé !</h3>
              <p>Nous vous répondrons sous 24 heures ouvrées à l&apos;adresse <strong>{form.email}</strong>.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-row">
                <div>
                  <label className="label">Nom complet <span className="label-req">*</span></label>
                  <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont" />
                </div>
                <div>
                  <label className="label">Email <span className="label-req">*</span></label>
                  <input type="email" className="input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="vous@entreprise.com" />
                </div>
              </div>
              <div>
                <label className="label">Sujet</label>
                <select className="select" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}>
                  <option value="">Sélectionner un sujet</option>
                  <option value="access">Demande d&apos;accès</option>
                  <option value="support">Support technique</option>
                  <option value="billing">Facturation</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="label">Message <span className="label-req">*</span></label>
                <textarea
                  className="input"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Décrivez votre demande…"
                  style={{ resize: 'vertical' }}
                />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn btn-gold btn-lg">
                <Send size={15} /> Envoyer le message
              </button>
            </form>
          )}
        </div>
      </div>
    </LegalLayout>
  );
}
