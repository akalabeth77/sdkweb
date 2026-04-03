"use client";

import { Locale } from '@/lib/i18n';
import { useLanguage } from './language-context';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  function renderButton(target: Locale, label: string) {
    const active = locale === target;
    return (
      <button
        type="button"
        className={`lang-btn${active ? ' active' : ''}`}
        onClick={() => setLocale(target)}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="lang-switcher" aria-label={t.nav.language}>
      <span className="small">{t.nav.language}</span>
      {renderButton('sk', 'SK')}
      {renderButton('en', 'EN')}
    </div>
  );
}
