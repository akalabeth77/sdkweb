import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { authSecret } from './auth-secret';
import { findAppUserByEmail } from './users';
import { verifyPassword } from './password';

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
    async jwt({ token, user }) {
      if (user) {
        if ('id' in user) {
          token.id = user.id as string;
        }
        if ('role' in user) {
          token.role = user.role as string;
        }
      }
      if (!token.id && user?.email) {
        const appUser = await findAppUserByEmail(user.email);
        token.id = appUser?.id;
        if (!token.role && appUser?.role) {
          token.role = appUser.role;
        }
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
