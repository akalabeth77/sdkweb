import { promises as fs } from 'fs';
import path from 'path';
import { Article } from '@/types';

const tmpPath = '/tmp/swing-articles.json';
const fallbackPath = path.join(process.cwd(), 'lib', 'seed-articles.json');

async function readFileSafe(filePath: string): Promise<Article[]> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as Article[];
  } catch {
    return [];
  }
}

export async function getArticles(): Promise<Article[]> {
  const tmpArticles = await readFileSafe(tmpPath);
  if (tmpArticles.length > 0) {
    return tmpArticles;
  }

  const seed = await readFileSafe(fallbackPath);
  return seed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveArticle(article: Article): Promise<void> {
  const existing = await getArticles();
  const next = [article, ...existing];
  await fs.writeFile(tmpPath, JSON.stringify(next, null, 2), 'utf8');
}
