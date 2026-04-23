import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: 32 }}>
        <Logo />
      </div>
      <div style={{ fontSize: 96, fontWeight: 600, color: '#C6A75E', lineHeight: 1, marginBottom: 16, letterSpacing: '-0.03em' }}>
        404
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: '#171717', marginBottom: 12 }}>
        Page introuvable
      </h1>
      <p style={{ fontSize: 16, color: '#525252', maxWidth: 440, marginBottom: 32 }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/" className="btn btn-secondary">Retour à l'accueil</Link>
        <Link to="/dashboard" className="btn btn-primary">Accéder au dashboard</Link>
      </div>
    </div>
  );
}
