-- Migration: Add explicit Supabase Data API grants and RLS
-- Required from May 30 2026: new projects need explicit GRANTs for PostgREST/supabase-js access
-- Note: This app uses Prisma (direct DB connection) which bypasses RLS.
--       These grants and policies are for Data API access and future-proofing.

-- ============================================================
-- PUBLIC READ TABLES (anon + authenticated can SELECT)
-- ============================================================

-- articles: published articles are public
GRANT SELECT ON public.articles TO anon;
GRANT SELECT ON public.articles TO authenticated;
GRANT ALL    ON public.articles TO service_role;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are public"
  ON public.articles FOR SELECT TO anon
  USING (status = 'published');

CREATE POLICY "Authenticated users can read all articles"
  ON public.articles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role has full access to articles"
  ON public.articles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ----

-- article_categories: public read
GRANT SELECT ON public.article_categories TO anon;
GRANT SELECT ON public.article_categories TO authenticated;
GRANT ALL    ON public.article_categories TO service_role;

ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON public.article_categories FOR SELECT
  USING (true);

CREATE POLICY "Service role has full access to categories"
  ON public.article_categories FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ----

-- internal_events: public read
GRANT SELECT ON public.internal_events TO anon;
GRANT SELECT ON public.internal_events TO authenticated;
GRANT ALL    ON public.internal_events TO service_role;

ALTER TABLE public.internal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are publicly readable"
  ON public.internal_events FOR SELECT
  USING (true);

CREATE POLICY "Service role has full access to events"
  ON public.internal_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ----

-- internal_media: public read
GRANT SELECT ON public.internal_media TO anon;
GRANT SELECT ON public.internal_media TO authenticated;
GRANT ALL    ON public.internal_media TO service_role;

ALTER TABLE public.internal_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media is publicly readable"
  ON public.internal_media FOR SELECT
  USING (true);

CREATE POLICY "Service role has full access to media"
  ON public.internal_media FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ----

-- gallery_albums: active albums are public
GRANT SELECT ON public.gallery_albums TO anon;
GRANT SELECT ON public.gallery_albums TO authenticated;
GRANT ALL    ON public.gallery_albums TO service_role;

ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active gallery albums are publicly readable"
  ON public.gallery_albums FOR SELECT
  USING ("isActive" = true);

CREATE POLICY "Service role has full access to gallery albums"
  ON public.gallery_albums FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ----

-- external_items: publicly readable synced content
GRANT SELECT ON public.external_items TO anon;
GRANT SELECT ON public.external_items TO authenticated;
GRANT ALL    ON public.external_items TO service_role;

ALTER TABLE public.external_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "External items are publicly readable"
  ON public.external_items FOR SELECT
  USING (true);

CREATE POLICY "Service role has full access to external items"
  ON public.external_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- SENSITIVE TABLES — service_role only via Data API
-- The app uses Prisma (direct DB, bypasses RLS) for these.
-- No anon/authenticated grants = no Data API exposure.
-- ============================================================

-- app_users: contains passwordHash — NEVER expose via Data API
GRANT ALL ON public.app_users TO service_role;

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to app_users"
  ON public.app_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ----

-- external_sync_jobs: internal admin use only
GRANT ALL ON public.external_sync_jobs TO service_role;

ALTER TABLE public.external_sync_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to sync jobs"
  ON public.external_sync_jobs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- USER-SCOPED TABLES — service_role full, authenticated own rows
-- Uses custom auth (app_users), not Supabase Auth.
-- RLS policies are defensive; actual access goes through Prisma.
-- ============================================================

-- user_profiles
GRANT SELECT, INSERT, UPDATE        ON public.user_profiles TO authenticated;
GRANT ALL                           ON public.user_profiles TO service_role;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to user_profiles"
  ON public.user_profiles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ----

-- event_registrations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT ALL                            ON public.event_registrations TO service_role;

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to event_registrations"
  ON public.event_registrations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ----

-- notifications
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL            ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to notifications"
  ON public.notifications FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ----

-- devices (push tokens)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL                            ON public.devices TO service_role;

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to devices"
  ON public.devices FOR ALL TO service_role
  USING (true) WITH CHECK (true);
