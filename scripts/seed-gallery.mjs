/**
 * One-time seed script: adds a Google Drive gallery album to the database.
 * Run with: node scripts/seed-gallery.mjs
 * Requires DATABASE_URL to be set in the environment (or in .env).
 */
import { createRequire } from 'module';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load .env if present
try {
  const dotenv = createRequire(import.meta.url)('dotenv');
  dotenv.config({ path: resolve(__dirname, '../.env') });
  dotenv.config({ path: resolve(__dirname, '../.env.local'), override: true });
} catch {
  // dotenv not installed – rely on process.env being already set
}

const { PrismaClient } = createRequire(import.meta.url)('@prisma/client');
const prisma = new PrismaClient();

const ALBUM = {
  id: crypto.randomUUID(),
  title: 'Swing Dance Košice – Google Drive',
  sourceType: 'google-drive',
  sourceRef: '1C-mi3Q-RCOoZjQLldsQBtz08WjnQvjkY',
  isActive: true,
};

try {
  // Check if an album with this sourceRef already exists
  const existing = await prisma.galleryAlbum.findFirst({
    where: { sourceRef: ALBUM.sourceRef },
  });

  if (existing) {
    console.log(`Album already exists (id=${existing.id}). No changes made.`);
  } else {
    const created = await prisma.galleryAlbum.create({ data: ALBUM });
    console.log(`Album created successfully (id=${created.id}).`);
  }
} finally {
  await prisma.$disconnect();
}
