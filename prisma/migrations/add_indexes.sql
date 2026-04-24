-- Custom migration to add indexes for better performance
-- Run this SQL directly on your database or use Prisma migrate

-- Index for Article lookups by status and publishedAt
CREATE INDEX IF NOT EXISTS articles_status_publishedat_idx ON articles (status, "publishedAt");

-- Index for Article slug lookups (already unique, but index helps)
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles (slug) WHERE slug IS NOT NULL;

-- Index for InternalEvent by start date and category
CREATE INDEX IF NOT EXISTS internal_events_start_category_idx ON internal_events (start, category);

-- Index for InternalEvent recurrence group lookups
CREATE INDEX IF NOT EXISTS internal_events_recurrence_idx ON internal_events ("recurrenceGroupId") WHERE "recurrenceGroupId" IS NOT NULL;

-- Index for Notification by userId, isRead, createdAt
CREATE INDEX IF NOT EXISTS notifications_userid_isread_created_idx ON notifications ("userId", "isRead", "createdAt" DESC);

-- Index for Device by userId and platform
CREATE INDEX IF NOT EXISTS devices_userid_platform_idx ON devices ("userId", platform);

-- Index for EventRegistration by userId and status
CREATE INDEX IF NOT EXISTS event_registrations_userid_status_idx ON event_registrations ("userId", status);

-- Index for EventRegistration by eventId
CREATE INDEX IF NOT EXISTS event_registrations_eventid_idx ON event_registrations ("eventId");
