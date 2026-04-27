// ── Email log (global, stored in localStorage) ────────────────────────────────

const LOG_KEY = 'arvest_email_log';

export function loadEmailLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
  catch { return []; }
}

function appendLog(entry) {
  try {
    const log = loadEmailLog();
    log.unshift({ id: `log_${Date.now()}`, sentAt: new Date().toISOString(), ...entry });
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 300)));
  } catch {}
}

// ── Email preferences (per user) ──────────────────────────────────────────────

const PREFS_KEY = (email) => `arvest_email_prefs_${email.toLowerCase()}`;

export const DEFAULT_PREFS = {
  alertsEnabled:     true,
  frequency:         'immediate',  // 'immediate' | 'daily' | 'weekly'
  inactivityEnabled: true,
};

export function loadEmailPrefs(email) {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY(email)) || '{}') };
  } catch { return { ...DEFAULT_PREFS }; }
}

export function saveEmailPrefs(email, prefs) {
  try { localStorage.setItem(PREFS_KEY(email), JSON.stringify(prefs)); }
  catch {}
}

// ── Alert dedup: track which alert IDs have already triggered an email ─────────

const ALERTED_KEY    = (email) => `arvest_alerted_${email.toLowerCase()}`;
const LAST_ALERT_KEY = (email) => `arvest_last_alert_ts_${email.toLowerCase()}`;

function loadAlerted(email) {
  try { return new Set(JSON.parse(localStorage.getItem(ALERTED_KEY(email)) || '[]')); }
  catch { return new Set(); }
}

function markAlerted(email, id) {
  try {
    const s = loadAlerted(email); s.add(id);
    localStorage.setItem(ALERTED_KEY(email), JSON.stringify([...s]));
  } catch {}
}

function getLastAlertTs(email) {
  return parseInt(localStorage.getItem(LAST_ALERT_KEY(email)) || '0', 10);
}

function setLastAlertTs(email) {
  localStorage.setItem(LAST_ALERT_KEY(email), String(Date.now()));
}

// ── Core sender ───────────────────────────────────────────────────────────────

async function send(type, to, data) {
  try {
    const res = await fetch('/api/send-email', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type, to, data }),
    });
    const json = await res.json().catch(() => ({}));
    const ok   = res.ok && json.success;
    appendLog({ type, to, status: ok ? 'sent' : 'error', error: ok ? undefined : (json.error || `HTTP ${res.status}`) });
    return ok;
  } catch (err) {
    appendLog({ type, to, status: 'error', error: err.message });
    return false;
  }
}

// ── Public helpers ────────────────────────────────────────────────────────────

export function sendWelcomeEmail(user) {
  return send('welcome', user.email, { name: user.name });
}

export function sendAccessGrantedEmail(user) {
  return send('access-granted', user.email, { name: user.name });
}

export async function sendAlertEmail(user, notification) {
  const prefs = loadEmailPrefs(user.email);
  if (!prefs.alertsEnabled) return false;

  // Frequency gate
  const now      = Date.now();
  const lastTs   = getLastAlertTs(user.email);
  const cooldown = prefs.frequency === 'daily'  ? 86_400_000
                 : prefs.frequency === 'weekly' ? 604_800_000
                 : 0;
  if (cooldown > 0 && now - lastTs < cooldown) return false;

  // Dedup gate
  if (loadAlerted(user.email).has(notification.id)) return false;

  const ok = await send('alert', user.email, { name: user.name, notification });
  if (ok) { markAlerted(user.email, notification.id); setLastAlertTs(user.email); }
  return ok;
}

export function sendPasswordResetEmail(email, resetUrl, name) {
  return send('password-reset', email, { name, resetUrl });
}

export function sendInactivityEmail(email, name, daysSince) {
  const prefs = loadEmailPrefs(email);
  if (!prefs.inactivityEnabled) return false;
  return send('inactivity', email, { name, daysSince });
}
