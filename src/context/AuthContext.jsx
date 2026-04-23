import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Provider d'authentification.
 * Authentification simulée (stockée en mémoire uniquement pour éviter tout crash SSR ou navigation privée).
 * En production : remplacer login/signup/logout par des appels API réels.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restauration de la session au chargement
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem('arvest_user');
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch (err) {
      // sessionStorage indisponible ou JSON invalide — on ignore silencieusement
      console.warn('Auth: session non restaurée', err);
    }
    setLoading(false);
  }, []);

  const persist = (u) => {
    try {
      if (u) {
        window.sessionStorage.setItem('arvest_user', JSON.stringify(u));
      } else {
        window.sessionStorage.removeItem('arvest_user');
      }
    } catch (err) {
      console.warn('Auth: persistence indisponible', err);
    }
  };

  const login = async ({ email }) => {
    // Simulation d'authentification (à remplacer par un appel API)
    const newUser = {
      email: email || 'demo@arvestpilot.com',
      name: 'Jean Moreau',
      company: 'Moreau Conseil'
    };
    setUser(newUser);
    persist(newUser);
    return newUser;
  };

  const signup = async ({ email, name, company }) => {
    const newUser = {
      email: email || 'demo@arvestpilot.com',
      name: name || 'Nouvel utilisateur',
      company: company || 'Mon entreprise'
    };
    setUser(newUser);
    persist(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    persist(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return ctx;
}
