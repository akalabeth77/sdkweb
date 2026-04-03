"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, LOCALE_COOKIE, defaultLocale, getMessages } from '@/lib/i18n';

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getMessages>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? defaultLocale);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale: (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    t: getMessages(locale),
  }), [locale, router]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
