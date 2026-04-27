import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Admin ────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'arvest-conseil@outlook.com';
const isAdminEmail = (email) => email.toLowerCase() === ADMIN_EMAIL;

// ─── Registry ─────────────────────────────────────────────────────────────────
const REGISTRY_KEY = 'arvest_users_registry';

function loadRegistry() {
  try { return JSON.parse(localStorage.getItem(REGISTRY_KEY) || '[]'); }
  catch { return []; }
}

function saveRegistry(users) {
  try { localStorage.setItem(REGISTRY_KEY, JSON.stringify(users)); }
  catch (e) { console.warn('Registry save failed', e); }
}

function findInRegistry(email) {
  return loadRegistry().find((u) => u.email === email.toLowerCase()) || null;
}

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
    name:         name || email.split('@')[0],
    company:      company || 'Mon entreprise',
    phone:        '',
    fonction:     '',
    role:         admin ? 'admin' : 'user',
    isAdmin:      admin,
    isAuthorized: admin,
    createdAt:    new Date().toISOString(),
    requestedAt:  null,
    passwordHash: '',
  };
}

// ─── Password (simple deterministic hash — demo only, not cryptographic) ──────
function hashPassword(pw) {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) { h = ((h << 5) + h) + pw.charCodeAt(i); h |= 0; }
  return String(h >>> 0);
}

// ─── Device sessions ──────────────────────────────────────────────────────────
const CURRENT_SESSION_KEY = 'arvest_current_session_id';

function devicesKey(email) { return `arvest_devices_${email.toLowerCase()}`; }

function loadDevices(email) {
  try { return JSON.parse(localStorage.getItem(devicesKey(email)) || '[]'); }
  catch { return []; }
}

function saveDevices(email, list) {
  try { localStorage.setItem(devicesKey(email), JSON.stringify(list)); }
  catch {}
}

function detectDevice() {
  const ua = navigator.userAgent;
  let browser = 'Navigateur';
  let os = 'Inconnu';
  if (/Edg/.test(ua)) browser = 'Edge';
  else if (/Firefox/.test(ua)) browser = 'Firefox';
  else if (/Chrome/.test(ua)) browser = 'Chrome';
  else if (/Safari/.test(ua)) browser = 'Safari';
  if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  return `${browser} · ${os}`;
}

function registerDeviceSession(email) {
  const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const list = loadDevices(email).map((d) => ({ ...d, current: false }));
  list.unshift({
    id,
    device:   detectDevice(),
    location: 'France (approximatif)',
    lastSeen: new Date().toISOString(),
    current:  true,
  });
  saveDevices(email, list.slice(0, 5));
  sessionStorage.setItem(CURRENT_SESSION_KEY, id);
}

// ─── Session ──────────────────────────────────────────────────────────────────
const SESSION_KEY = 'arvest_session';

function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

function saveSession(user) {
  try {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

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

  const refreshAuth = useCallback(() => {
    if (!user?.email) return null;
    const entry = findInRegistry(user.email);
    if (!entry) return null;
    const fresh = mergeSession(user, entry);
    setUser(fresh);
    saveSession(fresh);
    return fresh;
  }, [user]);

  const completeLogin = useCallback((entry) => {
    registerDeviceSession(entry.email);
    setUser(entry);
    saveSession(entry);
  }, []);

  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = async ({ email, name, company, password }) => {
    const existing = findInRegistry(email);
    if (existing) { completeLogin(existing); return existing; }
    const entry = buildEntry(email, name, company);
    if (password) entry.passwordHash = hashPassword(password);
    upsertRegistry(entry);
    completeLogin(entry);
    return entry;
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    let entry = findInRegistry(email);
    if (!entry) {
      entry = buildEntry(email, '', '');
      if (password) entry.passwordHash = hashPassword(password);
      upsertRegistry(entry);
    }
    if (entry.passwordHash && password && hashPassword(password) !== entry.passwordHash) {
      throw new Error('Mot de passe incorrect.');
    }
    completeLogin(entry);
    return entry;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => { setUser(null); saveSession(null); };

  // ── Request access ────────────────────────────────────────────────────────
  const requestAccess = useCallback(() => {
    if (!user?.email) return;
    const ts = new Date().toISOString();
    upsertRegistry({ email: user.email, requestedAt: ts });
    const fresh = { ...user, requestedAt: ts };
    setUser(fresh);
    saveSession(fresh);
  }, [user]);

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = useCallback((oldPassword, newPassword) => {
    if (!user?.email) throw new Error('Non connecté.');
    const entry = findInRegistry(user.email);
    if (entry?.passwordHash && hashPassword(oldPassword) !== entry.passwordHash) {
      throw new Error('Ancien mot de passe incorrect.');
    }
    if (newPassword.length < 8) throw new Error('8 caractères minimum.');
    const newHash = hashPassword(newPassword);
    upsertRegistry({ email: user.email, passwordHash: newHash });
    const fresh = { ...user, passwordHash: newHash };
    setUser(fresh);
    saveSession(fresh);
  }, [user]);

  // ── Devices ───────────────────────────────────────────────────────────────
  const getDevices = useCallback(() => {
    if (!user?.email) return [];
    return loadDevices(user.email);
  }, [user]);

  const revokeDevice = useCallback((deviceId) => {
    if (!user?.email) return;
    saveDevices(user.email, loadDevices(user.email).filter((d) => d.id !== deviceId));
  }, [user]);

  const revokeAllDevices = useCallback(() => {
    if (!user?.email) return;
    const currentId = sessionStorage.getItem(CURRENT_SESSION_KEY);
    saveDevices(user.email, loadDevices(user.email).filter((d) => d.id === currentId));
  }, [user]);

  // ── Admin ─────────────────────────────────────────────────────────────────
  const getAllUsers   = useCallback(() => loadRegistry().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), []);
  const authorizeUser = useCallback((email) => upsertRegistry({ email: email.toLowerCase(), isAuthorized: true  }), []);
  const blockUser     = useCallback((email) => upsertRegistry({ email: email.toLowerCase(), isAuthorized: false }), []);
  const deleteUser    = useCallback((email) => saveRegistry(loadRegistry().filter((u) => u.email !== email.toLowerCase())), []);

  // ── Password reset ────────────────────────────────────────────────────────
  const generateResetToken = useCallback((email) => {
    const entry = findInRegistry(email);
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expiry = Date.now() + 3_600_000; // 1 hour
    localStorage.setItem(`arvest_reset_${email.toLowerCase()}`, JSON.stringify({ token, expiry }));
    return { token, name: entry?.name || '' };
  }, []);

  const resetPassword = useCallback((token, email, newPassword) => {
    const raw = localStorage.getItem(`arvest_reset_${email.toLowerCase()}`);
    if (!raw) throw new Error('Lien invalide ou expiré.');
    const { token: stored, expiry } = JSON.parse(raw);
    if (stored !== token || Date.now() > expiry) throw new Error('Lien invalide ou expiré.');
    if (newPassword.length < 8) throw new Error('8 caractères minimum.');
    upsertRegistry({ email: email.toLowerCase(), passwordHash: hashPassword(newPassword) });
    localStorage.removeItem(`arvest_reset_${email.toLowerCase()}`);
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
      changePassword,
      getDevices,
      revokeDevice,
      revokeAllDevices,
      getAllUsers,
      authorizeUser,
      blockUser,
      deleteUser,
      updateProfile,
      generateResetToken,
      resetPassword,
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

function mergeSession(session, entry) {
  return {
    ...session,
    isAuthorized: entry.isAuthorized,
    isAdmin:      entry.isAdmin,
    role:         entry.role,
    passwordHash: entry.passwordHash,
  };
}
