import { Article } from '@/types';
import { prisma } from './db';
import seedArticles from './seed-articles.json';

export async function getArticles(): Promise<Article[]> {
  const rows: Array<{
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: Date;
    status: string;
  }> = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });

  if (rows.length === 0) {
    return (seedArticles as Article[]).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
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
