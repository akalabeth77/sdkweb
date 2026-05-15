import { createSign } from 'crypto';
import { prisma } from './db';

// ── FCM V1 direct (no Expo proxy needed) ─────────────────────────────────────

function base64url(input: string | Buffer): string {
  const b64 = Buffer.isBuffer(input)
    ? input.toString('base64')
    : Buffer.from(input).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getFCMAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = base64url(sign.sign(privateKey));

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${payload}.${signature}`,
    }),
  });

  const data = await res.json() as { access_token?: string };
  if (!data.access_token) throw new Error(`FCM token exchange failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function sendFCMv1(tokens: string[], title: string, body: string): Promise<void> {
  const clientEmail = process.env.FCM_CLIENT_EMAIL;
  const projectId = process.env.FCM_PROJECT_ID ?? 'keswing-326db';
  const rawKey = process.env.FCM_PRIVATE_KEY;
  if (!clientEmail || !rawKey) return;

  // Vercel may store \n as literal \\n — normalise both
  const privateKey = rawKey.replace(/\\n/g, '\n');

  let accessToken: string;
  try {
    accessToken = await getFCMAccessToken(clientEmail, privateKey);
  } catch (e) {
    console.error('[push FCM] auth error:', e instanceof Error ? e.message : e);
    return;
  }

  await Promise.allSettled(
    tokens.map((token) =>
      fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            android: { priority: 'high' },
          },
        }),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => null);
          console.error('[push FCM] send error:', JSON.stringify(err));
        }
      })
    )
  );
}

// ── Expo push (legacy — kept for any existing ExponentPushToken entries) ──────

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
};

async function sendExpoPush(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return;
  const chunks: ExpoPushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));

  await Promise.allSettled(
    chunks.map((chunk) =>
      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk),
      }).then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || data?.errors) console.error('[push Expo] error:', JSON.stringify(data));
        else {
          const ticket = data?.data?.[0];
          if (ticket?.status === 'error') console.error('[push Expo] ticket error:', JSON.stringify(ticket));
        }
      })
    )
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function notifyAllDevices(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    const devices = await prisma.device.findMany({ select: { pushToken: true } });

    const expoTokens = devices
      .filter((d) => d.pushToken.startsWith('ExponentPushToken'))
      .map((d) => ({ to: d.pushToken, title, body, data, sound: 'default' as const }));

    const fcmTokens = devices
      .filter((d) => !d.pushToken.startsWith('ExponentPushToken') && d.pushToken.length > 20)
      .map((d) => d.pushToken);

    if (expoTokens.length > 0) await sendExpoPush(expoTokens);
    if (fcmTokens.length > 0) await sendFCMv1(fcmTokens, title, body);
  } catch {
    // fire-and-forget
  }
}
