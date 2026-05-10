import { Link } from 'react-router-dom';
import './Logo.css';

// Reproduction SVG fidèle du logo Arvest Conseil :
// 3 barres (gris + or) + flèche dorée ascendante
function LogoMark({ size = 36 }) {
  return (
    <div className="logo-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        {/* Barre 1 — courte, gris foncé */}
        <rect x="2"  y="20" width="6" height="10" rx="1" fill="#5a5a5a" />
        {/* Barre 2 — moyenne, gris */}
        <rect x="11" y="13" width="6" height="17" rx="1" fill="#888888" />
        {/* Barre 3 — grande, dorée */}
        <rect x="20" y="7"  width="6" height="23" rx="1" fill="#C6A75E" />
        {/* Courbe de tendance dorée */}
        <path
          d="M4 27 Q10 19 17 13 L24 8"
          stroke="#C6A75E"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Pointe de flèche */}
        <path
          d="M21 6 L24 8 L22 11"
          stroke="#C6A75E"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

/**
 * Props :
 *  - light    : texte blanc (fond sombre)
 *  - compact  : icône seule, pas de texte (mobile/topbar)
 *  - to       : destination du lien (défaut "/")
 *  - size     : taille de l'icône en px (défaut 36)
 *  - className: classe CSS supplémentaire
 */
export default function Logo({ light = false, compact = false, to = '/', size = 36, className = '' }) {
  return (
    <Link to={to} className={`logo ${className}`} aria-label="Accueil Arvest Conseil">
      <LogoMark size={size} />
      {!compact && (
        <div className={light ? 'logo-text logo-text-light' : 'logo-text'}>
          ARVEST<span className="logo-accent"> CONSEIL</span>
        </div>
      )}
    </Link>
  );
}
