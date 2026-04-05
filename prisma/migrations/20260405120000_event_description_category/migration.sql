-- AlterTable
ALTER TABLE "internal_events"
ADD COLUMN "description" TEXT,
ADD COLUMN "category" TEXT DEFAULT 'other';