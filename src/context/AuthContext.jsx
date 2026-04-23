import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Admin emails (hardcoded for this B2B SaaS) ──────────────────────────────
const ADMIN_EMAILS = ['axelmiorcec29590@gmail.com'];

// ─── Users registry (localStorage) ──────────────────────────────────────────
const REGISTRY_KEY = 'arvest_users_registry';

function loadRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegistry(users) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Registry save failed', e);
  }
}

function findInRegistry(email) {
  return loadRegistry().find((u) => u.email === email) || null;
}

function upsertRegistry(entry) {
  const reg = loadRegistry();
  const idx = reg.findIndex((u) => u.email === entry.email);
  if (idx !== -1) {
    reg[idx] = { ...reg[idx], ...entry };
  } else {
    reg.push(entry);
  }
  saveRegistry(reg);
  return idx !== -1 ? reg[idx] : entry;
}

function buildEntry(email, name, company) {
  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  return {
    email:        email.toLowerCase(),
    name:         name || email.split('@')[0],
    company:      company || 'Mon entreprise',
    isAdmin,
    isAuthorized: isAdmin, // admins are auto-authorized
    createdAt:    new Date().toISOString(),
    requestedAt:  null,
  };
}

// ─── Session helpers (sessionStorage for current user) ───────────────────────
const SESSION_KEY = 'arvest_session';

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  try {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session — always re-read isAuthorized from registry so admin
  // activation takes effect without requiring a new login.
  useEffect(() => {
    const session = loadSession();
    if (session?.email) {
      const entry = findInRegistry(session.email);
      if (entry) {
        const fresh = { ...session, isAuthorized: entry.isAuthorized, isAdmin: entry.isAdmin };
        setUser(fresh);
        saveSession(fresh);
      } else {
        // Session exists but no registry entry → clear session
        saveSession(null);
      }
    }
    setLoading(false);
  }, []);

  // Re-check authorization status (called from PendingAccess "refresh" button)
  const refreshAuth = useCallback(() => {
    if (!user?.email) return;
    const entry = findInRegistry(user.email);
    if (entry) {
      const fresh = { ...user, isAuthorized: entry.isAuthorized, isAdmin: entry.isAdmin };
      setUser(fresh);
      saveSession(fresh);
    }
  }, [user]);

  const signup = async ({ email, name, company }) => {
    const existing = findInRegistry(email.toLowerCase());
    if (existing) {
      // Account already exists — just log them in
      const u = { ...existing };
      setUser(u);
      saveSession(u);
      return u;
    }
    const entry  = buildEntry(email, name, company);
    const stored = upsertRegistry(entry);
    setUser(stored);
    saveSession(stored);
    return stored;
  };

  const login = async ({ email }) => {
    const entry = findInRegistry(email.toLowerCase());
    if (!entry) {
      // Unknown email — create with isAuthorized: false (no account yet)
      const newEntry = buildEntry(email, '', '');
      upsertRegistry(newEntry);
      setUser(newEntry);
      saveSession(newEntry);
      return newEntry;
    }
    // Re-read fresh status
    const fresh = { ...entry };
    setUser(fresh);
    saveSession(fresh);
    return fresh;
  };

  const logout = () => {
    setUser(null);
    saveSession(null);
  };

  // Called from PendingAccess — marks requestedAt in registry
  const requestAccess = useCallback(() => {
    if (!user?.email) return;
    const updated = upsertRegistry({ email: user.email, requestedAt: new Date().toISOString() });
    const fresh = { ...user, requestedAt: updated.requestedAt };
    setUser(fresh);
    saveSession(fresh);
  }, [user]);

  // ── Admin functions ──────────────────────────────────────────────────────
  const getAllUsers = useCallback(() => {
    return loadRegistry().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, []);

  const authorizeUser = useCallback((email) => {
    upsertRegistry({ email, isAuthorized: true });
  }, []);

  const revokeUser = useCallback((email) => {
    upsertRegistry({ email, isAuthorized: false });
  }, []);

  const deleteUser = useCallback((email) => {
    const reg = loadRegistry().filter((u) => u.email !== email);
    saveRegistry(reg);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      signup,
      logout,
      refreshAuth,
      requestAccess,
      getAllUsers,
      authorizeUser,
      revokeUser,
      deleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
