import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: string;
};

export async function isAuthenticatedSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

export async function isEditorOrAdminSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  return role === 'editor' || role === 'admin';
}

export async function isAdminSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role ?? 'member',
  };
}
