import { prisma } from './db';

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
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  await Promise.allSettled(
    chunks.map((chunk) =>
      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(chunk),
      })
    )
  );
}

export async function notifyAllDevices(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    const devices = await prisma.device.findMany({ select: { pushToken: true } });
    const messages = devices
      .filter((d) => d.pushToken.startsWith('ExponentPushToken'))
      .map((d) => ({ to: d.pushToken, title, body, data, sound: 'default' as const }));

    await sendExpoPush(messages);
  } catch {
    // fire-and-forget — neblokuje hlavnú akciu
  }
}
