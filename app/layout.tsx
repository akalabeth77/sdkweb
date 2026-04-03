import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { Navigation } from '@/components/navigation';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Swing Community Portal',
  description: 'Portál pre swing komunitu s eventmi, galériou a článkami.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <Providers>
          <Navigation />
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
