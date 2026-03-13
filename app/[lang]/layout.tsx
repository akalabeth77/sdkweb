import { notFound } from 'next/navigation';
import { isLocale, locales } from '@/lib/i18n';
import { NavBar } from '@/components/NavBar';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  return (
    <div>
      <NavBar lang={params.lang} />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">{children}</main>
    </div>
  );
}
