import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { Navigation } from '@/components/navigation';

export const metadata: Metadata = {
  title: 'Swing Community Portal',
  description: 'Portál pre swing komunitu s eventmi, galériou a článkami.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <Navigation />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
