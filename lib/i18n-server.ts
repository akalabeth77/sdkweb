import { cookies } from 'next/headers';
import { defaultLocale, getMessages, isLocale, Locale, LOCALE_COOKIE } from './i18n';

export function getServerLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : defaultLocale;
}

export function getServerMessages() {
  const locale = getServerLocale();
  return { locale, t: getMessages(locale) };
}
