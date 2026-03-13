import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swing Dance Košice',
  description: 'Bilingual swing dance community website',
  openGraph: {
    title: 'Swing Dance Košice',
    description: 'Join classes, parties, workshops and community life in Košice.'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
