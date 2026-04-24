import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Admin configuration ──────────────────────────────────────────────────────
const ADMIN_EMAIL = 'axelmiorcec29590@gmail.com';
const isAdminEmail = (email) => email.toLowerCase() === ADMIN_EMAIL;

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
  return loadRegistry().find((u) => u.email === email.toLowerCase()) || null;
}

/**
 * Insert or update a user entry in the registry.
 * Returns the full updated entry.
 */
function upsertRegistry(patch) {
  const reg = loadRegistry();
  const idx = reg.findIndex((u) => u.email === patch.email.toLowerCase());
  if (idx !== -1) {
    reg[idx] = { ...reg[idx], ...patch };
    saveRegistry(reg);
    return reg[idx];
  }
  reg.push(patch);
  saveRegistry(reg);
  return patch;
}

function buildEntry(email, name, company) {
  const admin = isAdminEmail(email);
  return {
    email:        email.toLowerCase(),
    name:         name  || email.split('@')[0],
    company:      company || 'Mon entreprise',
    phone:        '',
    fonction:     '',
    role:         admin ? 'admin' : 'user',
    isAdmin:      admin,
    isAuthorized: admin,
    createdAt:    new Date().toISOString(),
    requestedAt:  null,
  };
}

// ─── Session (sessionStorage keeps the current browser tab's user) ────────────
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
    else       sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session, but always re-read isAuthorized / role from
  // the registry so admin activation takes effect immediately.
  useEffect(() => {
    const session = loadSession();
    if (session?.email) {
      const entry = findInRegistry(session.email);
      if (entry) {
        const fresh = mergeSession(session, entry);
        setUser(fresh);
        saveSession(fresh);
      } else {
        saveSession(null);
      }
    }
    setLoading(false);
  }, []);

  // Re-reads the registry and refreshes current user's auth state.
  // Returns the fresh user object so callers can act on the new state.
  const refreshAuth = useCallback(() => {
    if (!user?.email) return null;
    const entry = findInRegistry(user.email);
    if (!entry) return null;
    const fresh = mergeSession(user, entry);
    setUser(fresh);
    saveSession(fresh);
    return fresh;
  }, [user]);

  const signup = async ({ email, name, company }) => {
    const existing = findInRegistry(email);
    if (existing) {
      setUser(existing);
      saveSession(existing);
      return existing;
    }
    const entry = buildEntry(email, name, company);
    upsertRegistry(entry);
    setUser(entry);
    saveSession(entry);
    return entry;
  };

  const login = async ({ email }) => {
    let entry = findInRegistry(email);
    if (!entry) {
      entry = buildEntry(email, '', '');
      upsertRegistry(entry);
    }
    setUser(entry);
    saveSession(entry);
    return entry;
  };

  const logout = () => {
    setUser(null);
    saveSession(null);
  };

  // Marks requestedAt on the current user's registry entry.
  const requestAccess = useCallback(() => {
    if (!user?.email) return;
    const ts = new Date().toISOString();
    upsertRegistry({ email: user.email, requestedAt: ts });
    const fresh = { ...user, requestedAt: ts };
    setUser(fresh);
    saveSession(fresh);
  }, [user]);

  // ── Admin-only functions ─────────────────────────────────────────────────
  const getAllUsers = useCallback(
    () => loadRegistry().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    []
  );

  const authorizeUser = useCallback((email) => {
    upsertRegistry({ email: email.toLowerCase(), isAuthorized: true });
  }, []);

  const blockUser = useCallback((email) => {
    upsertRegistry({ email: email.toLowerCase(), isAuthorized: false });
  }, []);

  const deleteUser = useCallback((email) => {
    saveRegistry(loadRegistry().filter((u) => u.email !== email.toLowerCase()));
  }, []);

  const updateProfile = useCallback((patch) => {
    if (!user?.email) return;
    const allowed = {};
    if (patch.name     !== undefined) allowed.name     = patch.name;
    if (patch.phone    !== undefined) allowed.phone    = patch.phone;
    if (patch.fonction !== undefined) allowed.fonction = patch.fonction;
    upsertRegistry({ email: user.email, ...allowed });
    const fresh = { ...user, ...allowed };
    setUser(fresh);
    saveSession(fresh);
  }, [user]);

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
      blockUser,
      deleteUser,
      updateProfile,
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

// ─── Internal helpers ─────────────────────────────────────────────────────────
function mergeSession(session, entry) {
  return {
    ...session,
    isAuthorized: entry.isAuthorized,
    isAdmin:      entry.isAdmin,
    role:         entry.role,
  };
}
