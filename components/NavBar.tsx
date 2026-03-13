import Link from 'next/link';
import { messages, type Locale } from '@/lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

const routes = ['', '/events', '/courses', '/syllabus', '/teachers', '/blog', '/gallery', '/community'];

export function NavBar({ lang }: { lang: Locale }) {
  const labels = messages[lang].nav;
  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur dark:bg-zinc-900/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={`/${lang}`} className="font-semibold">Swing Dance Košice</Link>
        <div className="hidden gap-4 md:flex">
          {routes.map((r, i) => (
            <Link key={r || 'home'} href={`/${lang}${r}`} className="text-sm hover:text-brand">{labels[i]}</Link>
          ))}
        </div>
        <LanguageSwitcher lang={lang} path={`/${lang}`} />
      </nav>
    </header>
  );
}
