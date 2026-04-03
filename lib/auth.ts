import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { findAppUserByEmail } from './users';
import { verifyPassword } from './password';

const authSecret =
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === 'development' ? 'local-dev-only-secret' : undefined);

const demoUsers = [
  { id: '1', email: 'admin@swing.local', password: 'admin123', name: 'Admin', role: 'admin' },
  { id: '2', email: 'editor@swing.local', password: 'editor123', name: 'Editor', role: 'editor' },
  { id: '3', email: 'member@swing.local', password: 'member123', name: 'Member', role: 'member' }
] as const;

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

        const user = demoUsers.find(
          (item) => item.email === credentials.email && item.password === credentials.password
        );

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
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
      if (user && 'role' in user) {
        token.role = user.role as string;
      }
      if (!token.role) token.role = 'member';
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? 'member';
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};
