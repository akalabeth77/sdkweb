import {
  Article,
  ArticleCategory,
  Device,
  EventCategory,
  EventItem,
  EventRegistration,
  GalleryAlbum,
  GalleryAlbumSource,
  MediaItem,
  Notification,
  UserProfile,
} from '@/types';
import { prisma } from './db';
import seedArticles from './seed-articles.json';

type PrismaErrorLike = {
  code?: string;
  message?: string;
};

type RegistrationStatus = EventRegistration['status'];

type RegistrationWithEvent = EventRegistration & {
  event: Pick<EventItem, 'id' | 'title' | 'description' | 'start' | 'end' | 'location' | 'category'>;
};

type AdminRegistrationListItem = RegistrationWithEvent & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

function isPoolExhaustionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const message = (error as PrismaErrorLike).message;
  if (!message) {
    return false;
  }

  return (
    message.includes('MaxClientsInSessionMode') ||
    message.includes('max clients reached') ||
    message.includes('too many clients')
  );
}

function getPrismaErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  return (error as PrismaErrorLike).code;
}

function shouldFallbackToSeed(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const prismaError = error as PrismaErrorLike;
  return (
    prismaError.code === 'P2021' ||
    prismaError.code === 'P2022' ||
    prismaError.code === 'P1001' ||
    isPoolExhaustionError(error)
  );
}

function ensureDatabaseConfigured() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function createExcerptFromHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

function getSeedArticles(): Article[] {
  return (seedArticles as Article[])
    .map((article) => ({
      ...article,
      slug: article.slug ?? slugify(article.title),
      excerpt: article.excerpt ?? createExcerptFromHtml(article.content),
      publishedAt: article.publishedAt ?? article.createdAt,
      updatedAt: article.updatedAt ?? article.createdAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function mapArticleStatus(status: string): 'draft' | 'published' {
  return status === 'published' ? 'published' : 'draft';
}

function mapEventCategory(category: string | null | undefined): EventCategory {
  if (category === 'course') return 'course';
  if (category === 'dance-party') return 'dance-party';
  if (category === 'workshop') return 'workshop';
  if (category === 'festival') return 'festival';
  if (category === 'concert') return 'concert';
  return 'other';
}

function mapEventSource(source: string | null | undefined): EventItem['source'] {
  if (source === 'external') return 'external';
  return 'internal';
}

function mapArticle(row: {
  id: string;
  title: string;
  content: string;
  slug: string | null;
  excerpt: string | null;
  author: string;
  featuredImage: string | null;
  createdAt: Date;
  publishedAt: Date | null;
  updatedAt: Date;
  status: string;
  views: number;
  categoryId: string | null;
}): Article {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    slug: row.slug ?? slugify(row.title),
    excerpt: row.excerpt ?? createExcerptFromHtml(row.content),
    author: row.author,
    featuredImage: row.featuredImage ?? undefined,
    createdAt: row.createdAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? undefined,
    updatedAt: row.updatedAt.toISOString(),
    status: mapArticleStatus(row.status),
    views: row.views,
    categoryId: row.categoryId ?? undefined,
  };
}

function mapRegistrationStatus(status: string): RegistrationStatus {
  if (status === 'waiting') return 'waiting';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'attended') return 'attended';
  return 'registered';
}

function mapRegistration(row: {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): EventRegistration {
  return {
    id: row.id,
    userId: row.userId,
    eventId: row.eventId,
    status: mapRegistrationStatus(row.status),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapProfile(row: {
  id: string;
  userId: string;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  preferences: unknown;
  createdAt: Date;
  updatedAt: Date;
}): UserProfile {
  return {
    id: row.id,
    userId: row.userId,
    avatarUrl: row.avatarUrl ?? undefined,
    bio: row.bio ?? undefined,
    phone: row.phone ?? undefined,
    preferences: (row.preferences as Record<string, unknown> | null) ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapNotification(row: {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}): Notification {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    body: row.body,
    type: row.type as Notification['type'],
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapDevice(row: {
  id: string;
  userId: string;
  platform: string;
  pushToken: string;
  lastSeenAt: Date;
  createdAt: Date;
}): Device {
  return {
    id: row.id,
    userId: row.userId,
    platform: row.platform as Device['platform'],
    pushToken: row.pushToken,
    lastSeenAt: row.lastSeenAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getArticles(): Promise<Article[]> {
  if (!process.env.DATABASE_URL) {
    return getSeedArticles();
  }

  try {
    const rows = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (rows.length === 0) {
      return getSeedArticles();
    }

    return rows.map(mapArticle);
  } catch (error) {
    if (shouldFallbackToSeed(error)) {
      return getSeedArticles();
    }

    throw error;
  }
}

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getArticles();
  return articles.filter((article) => article.status === 'published');
}

export async function getArticleByIdentifier(identifier: string): Promise<Article | null> {
  const decodedIdentifier = decodeURIComponent(identifier);
  const articles = await getArticles();
  return (
    articles.find((article) => article.id === decodedIdentifier) ??
    articles.find((article) => article.slug === decodedIdentifier) ??
    null
  );
}

export async function getTopArticles(limit = 10): Promise<Article[]> {
  const articles = await getPublishedArticles();
  return [...articles]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, limit);
}

export async function listArticleCategories(): Promise<ArticleCategory[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const rows = await prisma.articleCategory.findMany({ orderBy: { name: 'asc' } });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
    }));
  } catch (error) {
    if (shouldFallbackToSeed(error)) {
      return [];
    }

    throw error;
  }
}

export async function incrementArticleViews(id: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    console.error('Failed to increment article views:', error);
  }
}

export async function saveArticle(article: Article): Promise<void> {
  ensureDatabaseConfigured();

  const slug = article.slug?.trim() || slugify(article.title);
  const excerpt = article.excerpt?.trim() || createExcerptFromHtml(article.content);
  const publishedAt = article.status === 'published'
    ? new Date(article.publishedAt ?? article.createdAt)
    : null;

  await prisma.article.create({
    data: {
      id: article.id,
      title: article.title,
      content: article.content,
      slug,
      excerpt,
      author: article.author,
      featuredImage: article.featuredImage,
      createdAt: new Date(article.createdAt),
      publishedAt,
      status: article.status,
      categoryId: article.categoryId,
    },
  });
}

export async function updateArticle(
  id: string,
  article: Pick<Article, 'title' | 'content' | 'status' | 'slug' | 'excerpt' | 'featuredImage' | 'categoryId'>
): Promise<void> {
  ensureDatabaseConfigured();

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Article not found.');
  }

  const slug = article.slug?.trim() || existing.slug || slugify(article.title);
  const excerpt = article.excerpt?.trim() || createExcerptFromHtml(article.content);
  const shouldSetPublishedAt = article.status === 'published' && !existing.publishedAt;

  await prisma.article.update({
    where: { id },
    data: {
      title: article.title,
      content: article.content,
      slug,
      excerpt,
      featuredImage: article.featuredImage,
      categoryId: article.categoryId,
      status: article.status,
      publishedAt: article.status === 'published'
        ? existing.publishedAt ?? (shouldSetPublishedAt ? new Date() : existing.publishedAt)
        : null,
    },
  });
}

export async function deleteArticle(id: string): Promise<void> {
  ensureDatabaseConfigured();
  await prisma.article.delete({ where: { id } });
}

export async function getInternalEvents(): Promise<EventItem[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const rows = await prisma.internalEvent.findMany({ orderBy: { start: 'asc' } });
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      category: mapEventCategory(row.category),
      start: row.start.toISOString(),
      end: row.end?.toISOString(),
      location: row.location ?? undefined,
      registrationUrl: (row as any).registrationUrl ?? undefined,
      recurrenceGroupId: row.recurrenceGroupId ?? undefined,
      source: mapEventSource(row.source),
    }));
  } catch (error) {
    if (getPrismaErrorCode(error) === 'P2022') {
      const rows = await prisma.internalEvent.findMany({
        select: {
          id: true,
          title: true,
          start: true,
          end: true,
          location: true,
        },
        orderBy: { start: 'asc' },
      });

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        start: row.start.toISOString(),
        end: row.end?.toISOString(),
        location: row.location ?? undefined,
        category: 'other',
        source: 'internal',
      }));
    }

    if (shouldFallbackToSeed(error)) {
      return [];
    }

    throw error;
  }
}

export async function saveInternalEvent(
  event: Omit<EventItem, 'source'> & { source?: 'internal' | 'external' }
): Promise<void> {
  ensureDatabaseConfigured();

  try {
    await prisma.internalEvent.create({
      data: {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category ?? 'other',
        start: new Date(event.start),
        end: event.end ? new Date(event.end) : null,
        location: event.location,
        registrationUrl: event.registrationUrl ?? null,
        recurrenceGroupId: event.recurrenceGroupId,
        source: event.source ?? 'internal',
      } as any,
    });
  } catch (error) {
    if (getPrismaErrorCode(error) === 'P2021') {
      throw new Error('Database schema is not up to date. Run Prisma schema sync to create internal_events table.');
    }

    throw error;
  }
}

export async function updateInternalEvent(
  id: string,
  event: Omit<EventItem, 'id' | 'source'> & { source?: 'internal' | 'external' }
): Promise<void> {
  ensureDatabaseConfigured();

  try {
    await prisma.internalEvent.update({
      where: { id },
      data: {
        title: event.title,
        description: event.description,
        category: event.category ?? 'other',
        start: new Date(event.start),
        end: event.end ? new Date(event.end) : null,
        location: event.location,
        registrationUrl: event.registrationUrl ?? null,
        source: event.source ?? 'internal',
      } as any,
    });
  } catch (error) {
    if (getPrismaErrorCode(error) === 'P2021') {
      throw new Error('Database schema is not up to date. Run Prisma schema sync to create internal_events table.');
    }

    throw error;
  }
}

export async function deleteInternalEvent(id: string): Promise<void> {
  ensureDatabaseConfigured();

  try {
    await prisma.internalEvent.delete({ where: { id } });
  } catch (error) {
    if (getPrismaErrorCode(error) === 'P2021') {
      throw new Error('Database schema is not up to date. Run Prisma schema sync to create internal_events table.');
    }

    throw error;
  }
}

export async function getInternalEventRecurrenceGroupId(id: string): Promise<string | undefined> {
  ensureDatabaseConfigured();

  try {
    const row = await prisma.internalEvent.findUnique({
      where: { id },
      select: { recurrenceGroupId: true },
    });

    return row?.recurrenceGroupId ?? undefined;
  } catch (error) {
    if (getPrismaErrorCode(error) === 'P2022') {
      return undefined;
    }

    if (getPrismaErrorCode(error) === 'P2021') {
      throw new Error('Database schema is not up to date. Run Prisma schema sync to create internal_events table.');
    }

    throw error;
  }
}

export async function getInternalEventsByRecurrenceGroup(
  recurrenceGroupId: string
): Promise<Array<Pick<EventItem, 'id' | 'title' | 'start' | 'end' | 'location'>>> {
  ensureDatabaseConfigured();

  try {
    const rows = await prisma.internalEvent.findMany({
      where: { recurrenceGroupId },
      orderBy: { start: 'asc' },
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      category: mapEventCategory(row.category),
      start: row.start.toISOString(),
      end: row.end?.toISOString(),
      location: row.location ?? undefined,
    }));
  } catch (error) {
    if (getPrismaErrorCode(error) === 'P2022') {
      return [];
    }

    if (getPrismaErrorCode(error) === 'P2021') {
      throw new Error('Database schema is not up to date. Run Prisma schema sync to create internal_events table.');
    }

    throw error;
  }
}

export async function deleteInternalEventSeries(recurrenceGroupId: string): Promise<number> {
  ensureDatabaseConfigured();

  try {
    const result = await prisma.internalEvent.deleteMany({ where: { recurrenceGroupId } });
    return result.count;
  } catch (error) {
    if (getPrismaErrorCode(error) === 'P2022') {
      return 0;
    }

    if (getPrismaErrorCode(error) === 'P2021') {
      throw new Error('Database schema is not up to date. Run Prisma schema sync to create internal_events table.');
    }

    throw error;
  }
}

export async function getInternalMedia(): Promise<MediaItem[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const rows = await prisma.internalMedia.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row) => ({
      id: row.id,
      imageUrl: row.imageUrl,
      caption: row.caption ?? undefined,
      source: 'internal',
    }));
  } catch (error) {
    if (shouldFallbackToSeed(error)) {
      return [];
    }

    throw error;
  }
}

export async function saveInternalMedia(media: Omit<MediaItem, 'source'>): Promise<void> {
  ensureDatabaseConfigured();

  await prisma.internalMedia.create({
    data: {
      id: media.id,
      imageUrl: media.imageUrl,
      caption: media.caption,
      source: 'internal',
    },
  });
}

export async function updateInternalMedia(id: string, media: Omit<MediaItem, 'id' | 'source'>): Promise<void> {
  ensureDatabaseConfigured();

  await prisma.internalMedia.update({
    where: { id },
    data: {
      imageUrl: media.imageUrl,
      caption: media.caption,
    },
  });
}

export async function deleteInternalMedia(id: string): Promise<void> {
  ensureDatabaseConfigured();
  await prisma.internalMedia.delete({ where: { id } });
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const rows = await prisma.galleryAlbum.findMany({ orderBy: { createdAt: 'desc' } });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      sourceType: row.sourceType as GalleryAlbumSource,
      sourceRef: row.sourceRef,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    if (shouldFallbackToSeed(error)) {
      return [];
    }

    throw error;
  }
}

export async function saveGalleryAlbum(album: Omit<GalleryAlbum, 'createdAt'>): Promise<void> {
  ensureDatabaseConfigured();

  await prisma.galleryAlbum.create({
    data: {
      id: album.id,
      title: album.title,
      sourceType: album.sourceType,
      sourceRef: album.sourceRef,
      isActive: album.isActive,
    },
  });
}

export async function updateGalleryAlbum(id: string, album: Omit<GalleryAlbum, 'id' | 'createdAt'>): Promise<void> {
  ensureDatabaseConfigured();

  await prisma.galleryAlbum.update({
    where: { id },
    data: {
      title: album.title,
      sourceType: album.sourceType,
      sourceRef: album.sourceRef,
      isActive: album.isActive,
    },
  });
}

export async function deleteGalleryAlbum(id: string): Promise<void> {
  ensureDatabaseConfigured();
  await prisma.galleryAlbum.delete({ where: { id } });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  ensureDatabaseConfigured();

  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  return profile ? mapProfile(profile) : null;
}

export async function upsertUserProfile(
  userId: string,
  data: Pick<UserProfile, 'avatarUrl' | 'bio' | 'phone' | 'preferences'>
): Promise<UserProfile> {
  ensureDatabaseConfigured();

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      avatarUrl: data.avatarUrl || null,
      bio: data.bio || null,
      phone: data.phone || null,
      preferences: data.preferences ?? {},
    },
    create: {
      userId,
      avatarUrl: data.avatarUrl || null,
      bio: data.bio || null,
      phone: data.phone || null,
      preferences: data.preferences ?? {},
    },
  });

  return mapProfile(profile);
}

export async function getEventRegistrationStatus(userId: string, eventId: string): Promise<RegistrationStatus | null> {
  ensureDatabaseConfigured();

  const row = await prisma.eventRegistration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (!row || row.status === 'cancelled') {
    return null;
  }

  return mapRegistrationStatus(row.status);
}

export async function upsertEventRegistration(
  userId: string,
  eventId: string,
  status: RegistrationStatus
): Promise<EventRegistration> {
  ensureDatabaseConfigured();

  const event = await prisma.internalEvent.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, start: true },
  });

  if (!event) {
    throw new Error('Event not found.');
  }

  const registration = await prisma.eventRegistration.upsert({
    where: { userId_eventId: { userId, eventId } },
    update: { status },
    create: { userId, eventId, status },
  });

  if (status === 'registered') {
    await prisma.notification.create({
      data: {
        userId,
        title: 'Registracia potvrdena',
        body: `Ste prihlaseny na event ${event.title}.`,
        type: 'event',
      },
    });
  }

  if (status === 'cancelled') {
    await prisma.notification.create({
      data: {
        userId,
        title: 'Registracia zrusena',
        body: `Registracia na event ${event.title} bola zrusena.`,
        type: 'warning',
      },
    });
  }

  return mapRegistration(registration);
}

export async function listUserEventRegistrations(userId: string): Promise<RegistrationWithEvent[]> {
  ensureDatabaseConfigured();

  const rows = await prisma.eventRegistration.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          start: true,
          end: true,
          location: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((row) => ({
    ...mapRegistration(row),
    event: {
      id: row.event.id,
      title: row.event.title,
      description: row.event.description ?? undefined,
      start: row.event.start.toISOString(),
      end: row.event.end?.toISOString(),
      location: row.event.location ?? undefined,
      category: mapEventCategory(row.event.category),
    },
  }));
}

export async function listAllEventRegistrations(): Promise<AdminRegistrationListItem[]> {
  ensureDatabaseConfigured();

  const rows = await prisma.eventRegistration.findMany({
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          start: true,
          end: true,
          location: true,
          category: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ event: { start: 'asc' } }, { createdAt: 'desc' }],
  });

  return rows.map((row) => ({
    ...mapRegistration(row),
    event: {
      id: row.event.id,
      title: row.event.title,
      description: row.event.description ?? undefined,
      start: row.event.start.toISOString(),
      end: row.event.end?.toISOString(),
      location: row.event.location ?? undefined,
      category: mapEventCategory(row.event.category),
    },
    user: row.user,
  }));
}

export async function listUserNotifications(userId: string, options?: { unreadOnly?: boolean; limit?: number }) {
  ensureDatabaseConfigured();

  const unreadOnly = options?.unreadOnly ?? false;
  const limit = options?.limit ?? 50;

  const [rows, unreadCount, total] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return {
    notifications: rows.map(mapNotification),
    unreadCount,
    total,
  };
}

export async function markNotificationsAsRead(userId: string, ids?: string[]): Promise<number> {
  ensureDatabaseConfigured();

  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
      ...(ids && ids.length > 0 ? { id: { in: ids } } : {}),
    },
    data: { isRead: true },
  });

  return result.count;
}

export async function registerUserDevice(userId: string, platform: Device['platform'], pushToken: string): Promise<Device> {
  ensureDatabaseConfigured();

  const device = await prisma.device.upsert({
    where: { pushToken },
    update: {
      userId,
      platform,
      lastSeenAt: new Date(),
    },
    create: {
      userId,
      platform,
      pushToken,
    },
  });

  return mapDevice(device);
}

export async function listUserDevices(userId: string): Promise<Device[]> {
  ensureDatabaseConfigured();

  const rows = await prisma.device.findMany({
    where: { userId },
    orderBy: { lastSeenAt: 'desc' },
  });

  return rows.map(mapDevice);
}

export async function deleteUserDevice(userId: string, pushToken: string): Promise<number> {
  ensureDatabaseConfigured();

  const result = await prisma.device.deleteMany({
    where: {
      userId,
      pushToken,
    },
  });

  return result.count;
}
