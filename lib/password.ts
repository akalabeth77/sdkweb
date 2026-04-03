import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) {
    return false;
  }

  const hashBuffer = Buffer.from(hashHex, 'hex');
  const candidate = scryptSync(password, salt, KEY_LENGTH);

  if (candidate.length !== hashBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidate, hashBuffer);
}
