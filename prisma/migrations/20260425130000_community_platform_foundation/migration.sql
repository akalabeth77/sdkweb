ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "excerpt" TEXT,
  ADD COLUMN IF NOT EXISTS "featuredImage" TEXT,
  ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

CREATE TABLE IF NOT EXISTS "article_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  CONSTRAINT "article_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "article_categories_name_key" ON "article_categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "article_categories_slug_key" ON "article_categories"("slug");

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "bio" TEXT,
  "phone" TEXT,
  "preferences" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_profiles_userId_key" ON "user_profiles"("userId");

CREATE TABLE IF NOT EXISTS "event_registrations" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'registered',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "event_registrations_userId_eventId_key" ON "event_registrations"("userId", "eventId");
CREATE INDEX IF NOT EXISTS "event_registrations_eventId_status_idx" ON "event_registrations"("eventId", "status");
CREATE INDEX IF NOT EXISTS "event_registrations_userId_status_idx" ON "event_registrations"("userId", "status");

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

CREATE TABLE IF NOT EXISTS "devices" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "pushToken" TEXT NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "devices_pushToken_key" ON "devices"("pushToken");
CREATE INDEX IF NOT EXISTS "devices_userId_lastSeenAt_idx" ON "devices"("userId", "lastSeenAt");

CREATE TABLE IF NOT EXISTS "external_sync_jobs" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "external_sync_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "external_sync_jobs_provider_status_createdAt_idx" ON "external_sync_jobs"("provider", "status", "createdAt");

CREATE TABLE IF NOT EXISTS "external_items" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "external_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "external_items_provider_externalId_type_key" ON "external_items"("provider", "externalId", "type");
CREATE INDEX IF NOT EXISTS "external_items_provider_type_syncedAt_idx" ON "external_items"("provider", "type", "syncedAt");

CREATE INDEX IF NOT EXISTS "articles_status_publishedAt_idx" ON "articles"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "articles_categoryId_idx" ON "articles"("categoryId");
CREATE INDEX IF NOT EXISTS "internal_events_start_category_idx" ON "internal_events"("start", "category");
CREATE INDEX IF NOT EXISTS "internal_events_recurrenceGroupId_idx" ON "internal_events"("recurrenceGroupId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'articles_categoryId_fkey'
      AND table_name = 'articles'
  ) THEN
    ALTER TABLE "articles"
      ADD CONSTRAINT "articles_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "article_categories"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'user_profiles_userId_fkey'
      AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE "user_profiles"
      ADD CONSTRAINT "user_profiles_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "app_users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'event_registrations_userId_fkey'
      AND table_name = 'event_registrations'
  ) THEN
    ALTER TABLE "event_registrations"
      ADD CONSTRAINT "event_registrations_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "app_users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'event_registrations_eventId_fkey'
      AND table_name = 'event_registrations'
  ) THEN
    ALTER TABLE "event_registrations"
      ADD CONSTRAINT "event_registrations_eventId_fkey"
      FOREIGN KEY ("eventId") REFERENCES "internal_events"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_userId_fkey'
      AND table_name = 'notifications'
  ) THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "notifications_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "app_users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'devices_userId_fkey'
      AND table_name = 'devices'
  ) THEN
    ALTER TABLE "devices"
      ADD CONSTRAINT "devices_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "app_users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
