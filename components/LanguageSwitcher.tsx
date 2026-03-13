import Link from 'next/link';
import { Locale } from '@/lib/i18n';

export function LanguageSwitcher({ lang, path }: { lang: Locale; path: string }) {
  const target = lang === 'sk' ? 'en' : 'sk';
  const nextPath = `/${target}${path.replace(/^\/(sk|en)/, '')}`;
  return (
    <Link href={nextPath} className="rounded-full border px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
      {target.toUpperCase()}
    </Link>
  );
}
