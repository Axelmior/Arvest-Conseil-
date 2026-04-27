import { Resend } from 'resend';

const resend  = new Resend(process.env.RESEND_API_KEY);
const FROM    = process.env.RESEND_FROM    || 'Arvest Pilot <onboarding@resend.dev>';
const REPLY   = process.env.RESEND_REPLY   || 'arvest-conseil@outlook.com';
const APP_URL = process.env.APP_URL        || 'https://arvest-pilot.vercel.app';

// ── Shared layout ─────────────────────────────────────────────────────────────

function layout(body) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f2f0ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:40px 16px 48px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

        <!-- HEADER -->
        <tr><td style="background:#111111;border-radius:12px 12px 0 0;padding:22px 32px;">
          <a href="${APP_URL}" style="text-decoration:none;">
            <span style="font-size:19px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Arvest</span><span style="font-size:19px;font-weight:300;color:#C6A75E;letter-spacing:-0.5px;"> Pilot</span>
          </a>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;padding:40px 32px 36px;">
          ${body}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:24px 8px 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.8;">
            Arvest Pilot &nbsp;·&nbsp; Pilotage financier pour dirigeants<br>
            <a href="${APP_URL}" style="color:#C6A75E;text-decoration:none;">${APP_URL.replace('https://', '')}</a>
            &nbsp;·&nbsp;
            <a href="mailto:${REPLY}" style="color:#9ca3af;text-decoration:none;">Support</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(label, url) {
  return `<a href="${url}" style="display:inline-block;padding:13px 28px;background:#C6A75E;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.01em;">${label}</a>`;
}

function hr() {
  return `<div style="border-top:1px solid #e5e7eb;margin:28px 0;"></div>`;
}

function checkRow(text) {
  return `<tr>
    <td width="22" valign="top" style="padding:5px 8px 0 0;color:#C6A75E;font-size:15px;font-weight:700;">✓</td>
    <td style="padding:5px 0;font-size:14px;color:#4b5563;line-height:1.55;">${text}</td>
  </tr>`;
}

// ── Templates ──────────────────────────────────────────────────────────────────

function welcome({ name }) {
  const first = (name || '').split(' ')[0] || 'cher dirigeant';
  return {
    subject: 'Bienvenue sur Arvest Pilot',
    html: layout(`
      <h1 style="margin:0 0 10px;font-size:24px;font-weight:700;color:#111111;letter-spacing:-0.5px;">Bienvenue, ${first}&nbsp;👋</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">Votre compte Arvest Pilot a bien été créé. Nous sommes ravis de vous accueillir dans notre espace de pilotage financier dédié aux dirigeants de PME.</p>

      <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin:0 0 28px;">
        <p style="margin:0 0 14px;font-size:12px;font-weight:600;color:#111111;text-transform:uppercase;letter-spacing:0.06em;">Ce qui vous attend</p>
        <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
          ${checkRow('Trésorerie en temps réel — prévisions sur 60 jours')}
          ${checkRow('CA, charges et rentabilité centralisés')}
          ${checkRow('Alertes intelligentes sur vos données financières')}
          ${checkRow('Import Excel / CSV depuis votre export bancaire')}
        </table>
      </div>

      <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;">Votre accès est en cours de validation. Vous recevrez un email dès qu'il est activé par notre équipe.</p>

      ${hr()}

      <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
        Une question ? Répondez à cet email ou contactez-nous à
        <a href="mailto:${REPLY}" style="color:#C6A75E;text-decoration:none;">${REPLY}</a>
      </p>
    `),
  };
}

function accessGranted({ name }) {
  const first = (name || '').split(' ')[0] || 'cher dirigeant';
  return {
    subject: 'Votre accès Arvest Pilot est activé ✅',
    html: layout(`
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:44px;line-height:1;margin-bottom:16px;">✅</div>
        <h1 style="margin:0 0 10px;font-size:24px;font-weight:700;color:#111111;letter-spacing:-0.5px;">Accès activé, ${first}&nbsp;!</h1>
        <p style="margin:0 auto;font-size:15px;color:#4b5563;line-height:1.7;max-width:400px;">Votre accès à Arvest Pilot vient d'être validé. Vous pouvez désormais accéder à votre tableau de bord financier.</p>
      </div>

      <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin:0 0 32px;">
        <p style="margin:0 0 14px;font-size:12px;font-weight:600;color:#111111;text-transform:uppercase;letter-spacing:0.06em;">Démarrage rapide</p>
        <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
          ${[
            'Connectez-vous à votre dashboard',
            'Importez vos premières ventes et charges (Excel ou CSV)',
            'Consultez vos KPIs et votre trésorerie en temps réel',
            'Activez les alertes email dans <strong>Paramètres → Notifications</strong>',
          ].map((t, i) => `<tr>
            <td width="28" valign="top" style="padding:5px 10px 0 0;">
              <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:#C6A75E;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:20px;">${i + 1}</span>
            </td>
            <td style="padding:5px 0;font-size:14px;color:#4b5563;line-height:1.55;">${t}</td>
          </tr>`).join('')}
        </table>
      </div>

      <div style="text-align:center;margin-bottom:32px;">
        ${cta('Accéder à mon dashboard →', `${APP_URL}/dashboard`)}
      </div>

      ${hr()}

      <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
        Besoin d'aide pour démarrer ? Répondez à cet email ou écrivez à
        <a href="mailto:${REPLY}" style="color:#C6A75E;text-decoration:none;">${REPLY}</a>
      </p>
    `),
  };
}

const TYPE_STYLE = {
  danger:  { bg: '#fef2f2', border: '#fca5a5', accent: '#dc2626', label: 'Alerte critique' },
  warning: { bg: '#fffbeb', border: '#fcd34d', accent: '#d97706', label: 'Avertissement'   },
  info:    { bg: '#eff6ff', border: '#93c5fd', accent: '#2563eb', label: 'Information'     },
};

function alert({ name, notification }) {
  const first = (name || '').split(' ')[0] || 'cher dirigeant';
  const s = TYPE_STYLE[notification?.type] || TYPE_STYLE.info;
  return {
    subject: `Alerte Arvest Pilot : ${notification?.title || 'Alerte financière'}`,
    html: layout(`
      <p style="margin:0 0 20px;font-size:15px;color:#4b5563;">Bonjour ${first},</p>

      <div style="background:${s.bg};border:1px solid ${s.border};border-left:4px solid ${s.accent};border-radius:8px;padding:18px 20px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${s.accent};text-transform:uppercase;letter-spacing:0.06em;">${s.label}</p>
        <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111111;">${notification?.title}</p>
        <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;">${notification?.message}</p>
      </div>

      <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.7;">Connectez-vous à votre tableau de bord pour analyser la situation et prendre les mesures adaptées.</p>

      <div style="text-align:center;margin-bottom:28px;">
        ${cta('Voir mon dashboard →', `${APP_URL}/dashboard`)}
      </div>

      ${hr()}

      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.7;">
        Vous recevez cet email car les alertes sont activées sur votre compte.<br>
        Modifier vos préférences : <a href="${APP_URL}/dashboard/settings" style="color:#C6A75E;text-decoration:none;">Paramètres → Notifications</a>
      </p>
    `),
  };
}

function inactivity({ name, daysSince }) {
  const first = (name || '').split(' ')[0] || 'cher dirigeant';
  return {
    subject: 'Votre tableau de bord Arvest Pilot vous attend',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.5px;">Cela fait ${daysSince} jours…</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
        Bonjour ${first}, votre tableau de bord financier vous attend. Vos données ont peut-être évolué depuis votre dernière visite.
      </p>

      <div style="background:#fafaf9;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin:0 0 28px;">
        <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#111111;">Ce qui vous attend sur le dashboard :</p>
        <table cellpadding="0" cellspacing="0" role="presentation">
          ${[
            'Mettez à jour vos ventes et charges récentes',
            "Vérifiez l'état de votre trésorerie",
            'Consultez vos alertes en attente',
            "Suivez l'évolution de votre marge nette",
          ].map((f) => `<tr><td style="padding:4px 0;font-size:14px;color:#4b5563;">→ ${f}</td></tr>`).join('')}
        </table>
      </div>

      <div style="text-align:center;margin-bottom:28px;">
        ${cta('Reprendre mon pilotage →', `${APP_URL}/dashboard`)}
      </div>

      ${hr()}

      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
        Ne plus recevoir ces rappels : <a href="${APP_URL}/dashboard/settings" style="color:#C6A75E;text-decoration:none;">Paramètres → Notifications</a>
      </p>
    `),
  };
}

function passwordReset({ name, resetUrl }) {
  const first = (name || '').split(' ')[0];
  return {
    subject: 'Réinitialisation de votre mot de passe Arvest Pilot',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.5px;">Réinitialiser votre mot de passe</h1>
      <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">
        ${first ? `Bonjour ${first},<br><br>` : ''}Vous avez demandé la réinitialisation de votre mot de passe Arvest Pilot. Cliquez ci-dessous pour choisir un nouveau mot de passe.
      </p>

      <div style="text-align:center;margin-bottom:24px;">
        ${cta('Réinitialiser mon mot de passe', resetUrl)}
      </div>

      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 18px;margin:0 0 28px;">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
          ⚠️ Ce lien est valable pendant <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre compte reste sécurisé.
        </p>
      </div>

      ${hr()}

      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
        <span style="font-size:11px;color:#6b7280;word-break:break-all;">${resetUrl}</span>
      </p>
    `),
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const { type, to, data = {} } = req.body || {};
  if (!type || !to) return res.status(400).json({ error: 'Missing: type, to' });

  const builders = { welcome, 'access-granted': accessGranted, alert, inactivity, 'password-reset': passwordReset };
  const build = builders[type];
  if (!build) return res.status(400).json({ error: `Unknown type: ${type}` });

  try {
    const tpl = build(data);
    const { data: sent, error } = await resend.emails.send({
      from:     FROM,
      reply_to: REPLY,
      to:       [to],
      subject:  tpl.subject,
      html:     tpl.html,
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ success: true, id: sent?.id });
  } catch (err) {
    console.error('[send-email]', err);
    return res.status(500).json({ error: err.message });
  }
}
