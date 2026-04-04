-- AlterTable
ALTER TABLE "internal_events"
ADD COLUMN "recurrenceGroupId" TEXT;

-- CreateIndex
CREATE INDEX "internal_events_recurrenceGroupId_idx"
ON "internal_events"("recurrenceGroupId");
