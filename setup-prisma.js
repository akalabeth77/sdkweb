/**
 * One-time setup script: creates prisma/schema.prisma
 * Run with: node setup-prisma.js
 */
const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');

const schema = `// Swing Community Portal – Prisma schema
// Docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Article {
  id        String   @id @default(cuid())
  title     String
  content   String
  author    String
  createdAt DateTime @default(now())
  status    String   @default("draft")

  @@map("articles")
}
`;

if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir);
  console.log('✅ Created prisma/ directory');
}

if (fs.existsSync(schemaPath)) {
  console.log('ℹ️  prisma/schema.prisma already exists – skipping');
} else {
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log('✅ Created prisma/schema.prisma');
}

console.log('\nNext steps:');
console.log('  1. Add DATABASE_URL to .env.local (see README)');
console.log('  2. npm install');
console.log('  3. npx prisma generate');
console.log('  4. npx prisma db push   (or npx prisma migrate dev)');
