import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

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