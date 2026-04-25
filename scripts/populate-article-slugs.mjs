import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Slovak diacritical mark mapping
const diacriticsMap = {
  'á': 'a', 'Á': 'a',
  'č': 'c', 'Č': 'c',
  'ď': 'd', 'Ď': 'd',
  'é': 'e', 'É': 'e',
  'í': 'i', 'Í': 'i',
  'ľ': 'l', 'Ľ': 'l',
  'ň': 'n', 'Ň': 'n',
  'ó': 'o', 'Ó': 'o',
  'ř': 'r', 'Ř': 'r',
  'š': 's', 'Š': 's',
  'ť': 't', 'Ť': 't',
  'ú': 'u', 'Ú': 'u',
  'ů': 'u', 'Ů': 'u',
  'ý': 'y', 'Ý': 'y',
  'ž': 'z', 'Ž': 'z',
};

function generateSlug(title) {
  // Remove diacritics
  let slug = title
    .split('')
    .map(char => diacriticsMap[char] || char)
    .join('');

  // Convert to lowercase
  slug = slug.toLowerCase();

  // Replace spaces and special characters with hyphens
  slug = slug.replace(/[^\w\s-]/g, '');
  slug = slug.replace(/\s+/g, '-');
  slug = slug.replace(/-+/g, '-');

  // Remove hyphens from start and end
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

async function populateSlugs() {
  try {
    console.log('🔄 Fetching articles without slugs...');
    
    const articles = await prisma.article.findMany({
      where: {
        slug: null,
      },
    });

    if (articles.length === 0) {
      console.log('✅ All articles already have slugs!');
      return;
    }

    console.log(`Found ${articles.length} articles without slugs.\n`);

    let updated = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        const newSlug = generateSlug(article.title);
        console.log(`  📄 "${article.title}" → "${newSlug}"`);

        await prisma.article.update({
          where: { id: article.id },
          data: { slug: newSlug },
        });

        updated++;
      } catch (error) {
        console.error(`  ❌ Error updating article ${article.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n✅ Updated ${updated} articles`);
    if (errors > 0) {
      console.warn(`⚠️ ${errors} errors occurred`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

populateSlugs();
