export const locales = ['sk', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'sk';

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const messages = {
  sk: {
    nav: ['Domov', 'Podujatia', 'Kurzy', 'Sylabus', 'Lektori', 'Blog', 'Galéria', 'Komunita'],
    join: 'Pridaj sa ku komunite',
    firstClass: 'Vyskúšaj prvú lekciu',
    upcoming: 'Najbližšie podujatia'
  },
  en: {
    nav: ['Home', 'Events', 'Courses', 'Syllabus', 'Teachers', 'Blog', 'Gallery', 'Community'],
    join: 'Join the community',
    firstClass: 'Try your first class',
    upcoming: 'Upcoming events'
  }
};
