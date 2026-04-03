import { prisma } from './db';
import { hashPassword } from './password';

type PrismaErrorLike = {
  code?: string;
};

function isTableMissing(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return (error as PrismaErrorLike).code === 'P2021';
}

export type AppUserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
};

type AppUserRow = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  status: string;
  createdAt: Date;
  approvedAt: Date | null;
};

export async function findAppUserByEmail(email: string): Promise<AppUserRecord | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const user = await prisma.appUser.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      approvedAt: user.approvedAt?.toISOString(),
    };
  } catch (error) {
    if (isTableMissing(error)) {
      return null;
    }

    throw error;
  }
}

export async function registerAppUser(data: {
  email: string;
  name: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; reason: 'exists' | 'db-not-configured' }> {
  if (!process.env.DATABASE_URL) {
    return { ok: false, reason: 'db-not-configured' };
  }

  const existing = await findAppUserByEmail(data.email);
  if (existing) {
    return { ok: false, reason: 'exists' };
  }

  try {
    await prisma.appUser.create({
      data: {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        passwordHash: hashPassword(data.password),
        role: 'member',
        status: 'pending',
      },
    });

    return { ok: true };
  } catch (error) {
    if (isTableMissing(error)) {
      return { ok: false, reason: 'db-not-configured' };
    }

    throw error;
  }
}

export async function listPendingUsers(): Promise<AppUserRecord[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const users: AppUserRow[] = await prisma.appUser.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      approvedAt: user.approvedAt?.toISOString(),
    }));
  } catch (error) {
    if (isTableMissing(error)) {
      return [];
    }

    throw error;
  }
}

export async function updateUserApproval(
  id: string,
  action: 'approve' | 'reject'
): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await prisma.appUser.update({
    where: { id },
    data:
      action === 'approve'
        ? { status: 'approved', approvedAt: new Date() }
        : { status: 'rejected', approvedAt: null },
  });
}
