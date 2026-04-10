import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // In serverless environments, reduce connection pool to prevent exhaustion
  ...(process.env.VERCEL ? { errorFormat: 'minimal' } : {})
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
