import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { Navigation } from '@/components/navigation';
import { Providers } from '@/components/providers';
import { getServerLocale } from '@/lib/i18n-server';

export const metadata: Metadata = {
  title: 'Swing Dance Kosice Portal',
  description: 'Portal for the swing dance community in Kosice with events, gallery, and articles.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = getServerLocale();

  return (
    <html lang={locale}>
      <body>
        <Providers initialLocale={locale}>
          <Navigation />
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
