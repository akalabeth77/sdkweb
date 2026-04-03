import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function isAdminSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}
