import { Article } from '@/types';
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
    status: row.status as 'draft' | 'published',
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
