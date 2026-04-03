import { Article, EventItem, GalleryAlbum, GalleryAlbumSource, MediaItem } from '@/types';
import { prisma } from './db';
import seedArticles from './seed-articles.json';

type PrismaErrorLike = {
  code?: string;
};

function getSeedArticles(): Article[] {
  return (seedArticles as Article[]).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

function shouldFallbackToSeed(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const prismaError = error as PrismaErrorLike;
  return prismaError.code === 'P2021' || prismaError.code === 'P1001';
}

function mapArticleStatus(status: string): 'draft' | 'published' {
  return status === 'published' ? 'published' : 'draft';
}

export async function getArticles(): Promise<Article[]> {
  if (!process.env.DATABASE_URL) {
    return getSeedArticles();
  }

  let rows: Array<{
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: Date;
    status: string;
  }>;

  try {
    rows = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    if (shouldFallbackToSeed(error)) {
      return getSeedArticles();
    }

    throw error;
  }

  if (rows.length === 0) {
    return getSeedArticles();
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author,
    createdAt: row.createdAt.toISOString(),
    status: mapArticleStatus(row.status),
  }));
}

export async function saveArticle(article: Article): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await prisma.article.create({
    data: {
      id: article.id,
      title: article.title,
      content: article.content,
      author: article.author,
      createdAt: new Date(article.createdAt),
      status: article.status,
    },
  });
}

export async function updateArticle(id: string, article: Pick<Article, 'title' | 'content' | 'status'>): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await prisma.article.update({
    where: { id },
    data: {
      title: article.title,
      content: article.content,
      status: article.status,
    },
  });
}

export async function deleteArticle(id: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

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
      start: row.start.toISOString(),
      end: row.end?.toISOString(),
      location: row.location ?? undefined,
      source: 'internal',
    }));
  } catch (error) {
    if (shouldFallbackToSeed(error)) {
      return [];
    }

    throw error;
  }
}

export async function saveInternalEvent(event: Omit<EventItem, 'source'>): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await prisma.internalEvent.create({
    data: {
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : null,
      location: event.location,
      source: 'internal',
    },
  });
}

export async function updateInternalEvent(id: string, event: Omit<EventItem, 'id' | 'source'>): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await prisma.internalEvent.update({
    where: { id },
    data: {
      title: event.title,
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : null,
      location: event.location,
    },
  });
}

export async function deleteInternalEvent(id: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await prisma.internalEvent.delete({ where: { id } });
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
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

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
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await prisma.internalMedia.update({
    where: { id },
    data: {
      imageUrl: media.imageUrl,
      caption: media.caption,
    },
  });
}

export async function deleteInternalMedia(id: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await prisma.internalMedia.delete({ where: { id } });
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const rows: Array<{
      id: string;
      title: string;
      sourceType: string;
      sourceRef: string;
      isActive: boolean;
      createdAt: Date;
    }> = await prisma.galleryAlbum.findMany({ orderBy: { createdAt: 'desc' } });

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
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

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
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

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
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  await prisma.galleryAlbum.delete({ where: { id } });
}
