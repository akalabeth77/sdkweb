import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { authSecret } from './auth-secret';
import { findAppUserByEmail, createGoogleUser } from './users';
import { verifyPassword } from './password';
import { notifyAdminsNewRegistration } from './email';

export const authOptions: AuthOptions = {
  secret: authSecret,
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Email a heslo',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Heslo', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // Try database first (if available)
        try {
          const appUser = await findAppUserByEmail(credentials.email);
          if (appUser) {
            if (appUser.status !== 'approved') {
              throw new Error('AccountNotApproved');
            }

            const ok = verifyPassword(credentials.password, appUser.passwordHash);
            if (!ok) return null;

            return {
              id: appUser.id,
              email: appUser.email,
              name: appUser.name,
              role: appUser.role
            };
          }
        } catch (error) {
          // If error is "AccountNotApproved", re-throw it
          if (error instanceof Error && error.message === 'AccountNotApproved') {
            throw error;
          }
        }

        return null;
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : [])
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        try {
          const existing = await findAppUserByEmail(user.email);
          if (!existing) {
            const name = user.name || user.email;
            await createGoogleUser({ email: user.email, name });
            notifyAdminsNewRegistration(name, user.email).catch(() => {});
            return '/pending';
          }
          if (existing.status === 'pending') return '/pending';
          if (existing.status === 'rejected') return false;
          // approved — allow
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // For credentials provider, user.id is our DB UUID and user.role is set.
        // For Google provider, user.id is Google's numeric ID — do NOT use it as our DB id.
        if ('role' in user) token.role = user.role as string;
      }
      // Look up our DB user whenever role is missing (always happens for Google OAuth).
      // Also runs on first credentials login if role was somehow not forwarded.
      if (!token.role && user?.email) {
        const appUser = await findAppUserByEmail(user.email);
        if (appUser) {
          token.id = appUser.id;
          token.role = appUser.role;
        }
      }
      // For credentials logins where role WAS set via user.role, still ensure id is our DB id.
      if (!token.id && user && 'id' in user) {
        token.id = user.id as string;
      }
      if (!token.role) token.role = 'member';
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string | undefined;
        session.user.role = (token.role as string) ?? 'member';
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};
