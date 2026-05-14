import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import { prisma } from './db';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.FROM_EMAIL ?? 'onboarding@resend.dev';
const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://sdkweb.vercel.app';
const SECRET = process.env.NEXTAUTH_SECRET ?? 'dev-fallback';

type Recipient = { email: string; userId: string };

async function getRecipients(): Promise<Recipient[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const users = await prisma.appUser.findMany({
      where: { status: 'approved' },
      select: {
        id: true,
        email: true,
        profile: { select: { preferences: true } },
      },
    });
    return users
      .filter((u) => {
        const prefs = u.profile?.preferences as Record<string, unknown> | null;
        return prefs?.emailNotifications !== false;
      })
      .map((u) => ({ email: u.email, userId: u.id }));
  } catch {
    return [];
  }
}

export function getUnsubscribeToken(userId: string): string {
  return jwt.sign({ sub: userId, purpose: 'unsubscribe' }, SECRET, { expiresIn: '365d' });
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { sub?: string; purpose?: string };
    if (decoded.purpose !== 'unsubscribe' || !decoded.sub) return null;
    return decoded.sub;
  } catch {
    return null;
  }
}

function unsubFooter(unsubUrl: string): string {
  return `
<hr style="border:none;border-top:1px solid #eee;margin:24px 0">
<p style="font-size:12px;color:#999;text-align:center;margin:0">
  Swing Dance Košice &middot;
  <a href="${unsubUrl}" style="color:#999;text-decoration:none">Odhlásiť sa z emailov</a>
</p>`;
}

async function sendToAll(
  recipients: Recipient[],
  subject: string,
  buildHtml: (unsubUrl: string) => string
): Promise<void> {
  if (!resend || recipients.length === 0) return;
  const CHUNK = 10;
  for (let i = 0; i < recipients.length; i += CHUNK) {
    await Promise.allSettled(
      recipients.slice(i, i + CHUNK).map((r) => {
        const unsubUrl = `${BASE_URL}/api/unsubscribe?token=${getUnsubscribeToken(r.userId)}`;
        return resend!.emails.send({ from: FROM, to: r.email, subject, html: buildHtml(unsubUrl) });
      })
    );
  }
}

export async function notifyNewEvent(title: string, eventId: string): Promise<void> {
  try {
    const recipients = await getRecipients();
    await sendToAll(
      recipients,
      `Nový event: ${title}`,
      (unsub) => `<h2>Nový event: ${title}</h2>
<p>Bol pridaný nový event na portál Swing Dance Košice.</p>
<p><a href="${BASE_URL}/events/${encodeURIComponent(eventId)}">Zobraziť event</a></p>
${unsubFooter(unsub)}`
    );
  } catch { /* fire-and-forget */ }
}

export async function notifyNewArticle(title: string, slug: string): Promise<void> {
  try {
    const recipients = await getRecipients();
    await sendToAll(
      recipients,
      `Nový článok: ${title}`,
      (unsub) => `<h2>Nový článok: ${title}</h2>
<p>Bol pridaný nový článok na portál Swing Dance Košice.</p>
<p><a href="${BASE_URL}/articles/${slug}">Čítať článok</a></p>
${unsubFooter(unsub)}`
    );
  } catch { /* fire-and-forget */ }
}

export async function notifyNewGallery(): Promise<void> {
  try {
    const recipients = await getRecipients();
    await sendToAll(
      recipients,
      'Nové fotky v galérii',
      (unsub) => `<h2>Nové fotky v galérii</h2>
<p>Boli pridané nové fotografie do galérie Swing Dance Košice.</p>
<p><a href="${BASE_URL}/gallery">Zobraziť galériu</a></p>
${unsubFooter(unsub)}`
    );
  } catch { /* fire-and-forget */ }
}

export async function sendBroadcastEmail(subject: string, bodyHtml: string): Promise<void> {
  try {
    const recipients = await getRecipients();
    await sendToAll(
      recipients,
      subject,
      (unsub) => `${bodyHtml}${unsubFooter(unsub)}`
    );
  } catch { /* fire-and-forget */ }
}

export async function sendApprovalEmail(
  toEmail: string,
  name: string,
  userId: string
): Promise<void> {
  if (!resend) return;
  const unsubUrl = `${BASE_URL}/api/unsubscribe?token=${getUnsubscribeToken(userId)}`;
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: 'Tvoj účet bol schválený — Swing Dance Košice',
    html: `<h2>Ahoj ${name}!</h2>
<p>Tvoj účet na portáli <strong>Swing Dance Košice</strong> bol schválený.</p>
<p>Teraz sa môžeš prihlásiť a pristupovať ku všetkému obsahu.</p>
<p><a href="${BASE_URL}/login" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Prihlásiť sa</a></p>
${unsubFooter(unsubUrl)}`,
  });
}
