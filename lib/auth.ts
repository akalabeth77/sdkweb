import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

export type UserRole = 'ADMIN' | 'EDITOR';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
};

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');
const SESSION_COOKIE = 'sdkweb_session';

function getSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-insecure-secret-change-me';
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, encoded: string) {
  const [salt, stored] = encoded.split(':');
  if (!salt || !stored) return false;
  const derived = scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(stored, 'hex');
  return storedBuf.length === derived.length && timingSafeEqual(storedBuf, derived);
}

function encodePayload(payload: Record<string, string>) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function signToken(payload: Record<string, string>) {
  const encoded = encodePayload(payload);
  const signature = createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyToken(token: string) {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (signatureBuf.length != expectedBuf.length || !timingSafeEqual(signatureBuf, expectedBuf)) return null;

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Record<string, string>;
  } catch {
    return null;
  }
}

async function ensureDataFile() {
  await fs.mkdir(path.dirname(USERS_PATH), { recursive: true });
  try {
    await fs.access(USERS_PATH);
  } catch {
    await fs.writeFile(USERS_PATH, '[]\n', 'utf8');
  }
}

export async function readUsers() {
  await ensureDataFile();
  const content = await fs.readFile(USERS_PATH, 'utf8');
  const parsed = JSON.parse(content) as AuthUser[];
  return parsed;
}

async function writeUsers(users: AuthUser[]) {
  await ensureDataFile();
  await fs.writeFile(USERS_PATH, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
}

export async function ensureBootstrapAdmin() {
  const email = (process.env.AUTH_BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.AUTH_BOOTSTRAP_ADMIN_PASSWORD || '';
  const name = process.env.AUTH_BOOTSTRAP_ADMIN_NAME || 'Admin';

  if (!email || !password) return;

  const users = await readUsers();
  if (users.some((user) => user.email === email)) return;

  users.push({
    id: randomBytes(12).toString('hex'),
    email,
    name,
    role: 'ADMIN',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  });

  await writeUsers(users);
}

export async function authenticate(email: string, password: string) {
  const users = await readUsers();
  const user = users.find((item) => item.email === email.toLowerCase());
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export async function listManagedUsers() {
  const users = await readUsers();
  return users.map(({ passwordHash, ...safe }) => safe);
}

export async function createUser(input: { name: string; email: string; password: string; role: UserRole }) {
  const users = await readUsers();
  const email = input.email.toLowerCase();

  if (users.some((user) => user.email === email)) {
    throw new Error('User already exists');
  }

  const created: AuthUser = {
    id: randomBytes(12).toString('hex'),
    name: input.name,
    email,
    role: input.role,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString()
  };

  users.unshift(created);
  await writeUsers(users);

  const { passwordHash, ...safe } = created;
  return safe;
}

export async function deleteUser(id: string) {
  const users = await readUsers();
  const next = users.filter((user) => user.id !== id);
  if (next.length === users.length) return false;
  await writeUsers(next);
  return true;
}

export function createSessionToken(user: Pick<AuthUser, 'id' | 'email' | 'name' | 'role'>) {
  return signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.id) return null;

  const users = await readUsers();
  const user = users.find((item) => item.id === payload.id);
  if (!user) return null;

  const { passwordHash, ...safe } = user;
  return safe;
}

export function sessionCookieName() {
  return SESSION_COOKIE;
}
