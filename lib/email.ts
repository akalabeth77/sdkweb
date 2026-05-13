import { Resend } from 'resend';
import { prisma } from './db';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.FROM_EMAIL ?? 'onboarding@resend.dev';
const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://sdkweb.vercel.app';

async function getEmailRecipients(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const profiles = await prisma.userProfile.findMany({
      include: { user: { select: { email: true, status: true } } },
    });
    return profiles
      .filter((p) => {
        if (p.user.status !== 'approved') return false;
        const prefs = p.preferences as Record<string, unknown> | null;
        return prefs?.emailNotifications !== false;
      })
      .map((p) => p.user.email);
  } catch {
    return [];
  }
}

async function sendBatch(emails: string[], subject: string, html: string): Promise<void> {
  if (!resend || emails.length === 0) return;
  for (let i = 0; i < emails.length; i += 50) {
    const batch = emails.slice(i, i + 50);
    await resend.emails.send({ from: FROM, to: batch, subject, html });
  }
}

export async function notifyNewEvent(title: string, eventId: string): Promise<void> {
  try {
    const emails = await getEmailRecipients();
    await sendBatch(
      emails,
      `Nový event: ${title}`,
      `<h2>Nový event: ${title}</h2><p>Bol pridaný nový event na portál Swing Dance Košice.</p><p><a href="${BASE_URL}/events/${encodeURIComponent(eventId)}">Zobraziť event</a></p><p><small><a href="${BASE_URL}/profile/settings">Spravovať notifikácie</a></small></p>`
    );
  } catch { /* fire-and-forget */ }
}

export async function notifyNewArticle(title: string, slug: string): Promise<void> {
  try {
    const emails = await getEmailRecipients();
    await sendBatch(
      emails,
      `Nový článok: ${title}`,
      `<h2>Nový článok: ${title}</h2><p>Bol pridaný nový článok na portál Swing Dance Košice.</p><p><a href="${BASE_URL}/articles/${slug}">Čítať článok</a></p><p><small><a href="${BASE_URL}/profile/settings">Spravovať notifikácie</a></small></p>`
    );
  } catch { /* fire-and-forget */ }
}

export async function notifyNewGallery(): Promise<void> {
  try {
    const emails = await getEmailRecipients();
    await sendBatch(
      emails,
      'Nové fotky v galérii',
      `<h2>Nové fotky v galérii</h2><p>Boli pridané nové fotografie do galérie Swing Dance Košice.</p><p><a href="${BASE_URL}/gallery">Zobraziť galériu</a></p><p><small><a href="${BASE_URL}/profile/settings">Spravovať notifikácie</a></small></p>`
    );
  } catch { /* fire-and-forget */ }
}

export async function sendEmailNotification(subject: string, html: string): Promise<void> {
  try {
    const emails = await getEmailRecipients();
    await sendBatch(emails, subject, html);
  } catch { /* fire-and-forget */ }
}
