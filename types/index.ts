export type LocalizedString = { sk: string; en: string };
export type LocalizedText = { sk: string; en: string };

export type Teacher = {
  _id: string;
  name: string;
  slug: { current: string };
  photo?: unknown;
  bio?: LocalizedText;
  dancesTaught?: string[];
  socialLinks?: { platform: string; url: string }[];
};

export type Event = {
  _id: string;
  title: LocalizedString;
  slug: { current: string };
  description: LocalizedText;
  date: string;
  eventType: 'party' | 'workshop' | 'course' | 'festival';
  danceStyle?: string;
  location?: { name: string; address: string; mapsUrl?: string };
  teachers?: Teacher[];
  coverImage?: unknown;
  registrationLink?: string;
};

export type Course = {
  _id: string;
  name: LocalizedString;
  danceStyle: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  weekday: string;
  time: string;
  duration: string;
  capacity: number;
  waitingListEnabled: boolean;
  registrationLink?: string;
  teacher?: Teacher;
};

export type BlogPost = {
  _id: string;
  title: LocalizedString;
  slug: { current: string };
  coverImage?: unknown;
  content: unknown[];
  tags?: string[];
  author?: { name: string };
};
