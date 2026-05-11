import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET ?? 'dev-fallback-change-in-production';

export type MobileTokenPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function signMobileToken(payload: MobileTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyMobileToken(token: string): MobileTokenPayload {
  return jwt.verify(token, SECRET) as MobileTokenPayload;
}

export function getMobileUser(request: Request): MobileTokenPayload | null {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return verifyMobileToken(auth.slice(7));
  } catch {
    return null;
  }
}
