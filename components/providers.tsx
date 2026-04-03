"use client";

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Locale } from '@/lib/i18n';
import { LanguageProvider } from './language-context';

export function Providers({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  return (
    <SessionProvider>
      <LanguageProvider initialLocale={initialLocale}>{children}</LanguageProvider>
    </SessionProvider>
  );
}
