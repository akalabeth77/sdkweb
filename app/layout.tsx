import type { Metadata } from 'next';
import './globals.css';
import 'react-quill/dist/quill.snow.css';
import { ReactNode } from 'react';
import { Navigation } from '@/components/navigation';
import { Providers } from '@/components/providers';
import { CommunityLinks } from '@/components/community-links';
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
          <footer className="site-footer">
            <div className="container">
              <CommunityLinks locale={locale} logoSize={140} />
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
